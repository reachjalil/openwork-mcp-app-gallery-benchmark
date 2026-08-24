import type { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";
import {
  RESOURCE_MIME_TYPE,
  registerAppResource,
  registerAppTool,
} from "../mcp-app-adapter.js";

const ScenarioInputsSchema = z.object({
  startingMRR: z.number().min(0).max(10_000_000),
  monthlyGrowthRate: z.number().min(0).max(100),
  monthlyChurnRate: z.number().min(0).max(100),
  grossMargin: z.number().min(0).max(100),
  fixedCosts: z.number().min(0).max(10_000_000),
});

const MonthlyProjectionSchema = z.object({
  month: z.number().int().min(1).max(12),
  mrr: z.number(),
  grossProfit: z.number(),
  netProfit: z.number(),
  cumulativeRevenue: z.number(),
});

const ScenarioSummarySchema = z.object({
  endingMRR: z.number(),
  arr: z.number(),
  totalRevenue: z.number(),
  totalProfit: z.number(),
  mrrGrowthPct: z.number(),
  avgMargin: z.number(),
  breakEvenMonth: z.number().nullable(),
});

const ScenarioTemplateSchema = z.object({
  id: z.string().max(32),
  name: z.string().max(64),
  description: z.string().max(240),
  icon: z.string().max(8),
  parameters: ScenarioInputsSchema,
  projections: z.array(MonthlyProjectionSchema).max(12),
  summary: ScenarioSummarySchema,
  keyInsight: z.string().max(240),
});

const GetScenarioDataInputSchema = z.object({
  customInputs: ScenarioInputsSchema.optional(),
});

const GetScenarioDataOutputSchema = z.object({
  templates: z.array(ScenarioTemplateSchema).max(8),
  defaultInputs: ScenarioInputsSchema,
  customProjections: z.array(MonthlyProjectionSchema).max(12).optional(),
  customSummary: ScenarioSummarySchema.optional(),
});

type ScenarioInputs = z.infer<typeof ScenarioInputsSchema>;

function calculateProjections(inputs: ScenarioInputs) {
  const netGrowthRate =
    (inputs.monthlyGrowthRate - inputs.monthlyChurnRate) / 100;
  const projections = [];
  let cumulativeRevenue = 0;
  for (let month = 1; month <= 12; month += 1) {
    const mrr = inputs.startingMRR * Math.pow(1 + netGrowthRate, month);
    const grossProfit = mrr * (inputs.grossMargin / 100);
    const netProfit = grossProfit - inputs.fixedCosts;
    cumulativeRevenue += mrr;
    projections.push({ month, mrr, grossProfit, netProfit, cumulativeRevenue });
  }
  return projections;
}

function calculateSummary(
  projections: ReturnType<typeof calculateProjections>,
  inputs: ScenarioInputs,
) {
  const ending = projections[11];
  if (!ending) throw new Error("Expected 12 projections");
  const totalRevenue = projections.reduce((sum, item) => sum + item.mrr, 0);
  const totalProfit = projections.reduce(
    (sum, item) => sum + item.netProfit,
    0,
  );
  const breakEven = projections.find((item) => item.netProfit >= 0);
  return {
    endingMRR: ending.mrr,
    arr: ending.mrr * 12,
    totalRevenue,
    totalProfit,
    mrrGrowthPct:
      ((ending.mrr - inputs.startingMRR) / Math.max(1, inputs.startingMRR)) *
      100,
    avgMargin: totalRevenue === 0 ? 0 : (totalProfit / totalRevenue) * 100,
    breakEvenMonth: breakEven?.month ?? null,
  };
}

function calculateScenario(inputs: ScenarioInputs) {
  const projections = calculateProjections(inputs);
  return { projections, summary: calculateSummary(projections, inputs) };
}

const DEFAULT_INPUTS: ScenarioInputs = {
  startingMRR: 20_000,
  monthlyGrowthRate: 8,
  monthlyChurnRate: 2,
  grossMargin: 80,
  fixedCosts: 15_000,
};

const TEMPLATE_INPUTS = [
  {
    id: "bootstrap",
    name: "Bootstrapped",
    description: "Slower growth, tight costs.",
    icon: "🌱",
    parameters: {
      startingMRR: 8_000,
      monthlyGrowthRate: 4,
      monthlyChurnRate: 2,
      grossMargin: 85,
      fixedCosts: 6_000,
    },
    keyInsight: "Lower burn, longer path to scale.",
  },
  {
    id: "venture",
    name: "Venture-funded",
    description: "Faster growth with higher spend.",
    icon: "🚀",
    parameters: {
      startingMRR: 25_000,
      monthlyGrowthRate: 12,
      monthlyChurnRate: 3,
      grossMargin: 75,
      fixedCosts: 40_000,
    },
    keyInsight: "Growth is funded ahead of profitability.",
  },
] as const;

const SCENARIO_TEMPLATES = TEMPLATE_INPUTS.map((template) => {
  const computed = calculateScenario(template.parameters);
  return {
    ...template,
    projections: computed.projections,
    summary: computed.summary,
  };
});

export function registerScenarioModeler(server: McpServer, html: string): void {
  const resourceUri = "ui://scenario-modeler/mcp-app.html";
  registerAppTool(
    server,
    "get-scenario-data",
    {
      title: "Get Scenario Data",
      description:
        "Returns SaaS scenario templates and optionally computes custom projections for given inputs",
      inputSchema: GetScenarioDataInputSchema,
      outputSchema: GetScenarioDataOutputSchema,
      _meta: { ui: { resourceUri } },
    },
    async (args) => {
      const parsed = GetScenarioDataInputSchema.parse(args);
      const customScenario = parsed.customInputs
        ? calculateScenario(parsed.customInputs)
        : undefined;
      const text = [
        "SaaS Scenario Modeler",
        "=".repeat(40),
        "",
        "Available Templates:",
        ...SCENARIO_TEMPLATES.map(
          (template) =>
            `  ${template.icon} ${template.name}: ${template.description}`,
        ),
        "",
        customScenario
          ? `Custom ending MRR: ${Math.round(customScenario.summary.endingMRR)}`
          : "Use customInputs parameter to compute projections for a specific scenario.",
      ].join("\n");
      return {
        content: [{ type: "text", text }],
        structuredContent: {
          templates: SCENARIO_TEMPLATES,
          defaultInputs: DEFAULT_INPUTS,
          customProjections: customScenario?.projections,
          customSummary: customScenario?.summary,
        },
      };
    },
  );
  registerAppResource(
    server,
    resourceUri,
    resourceUri,
    { mimeType: RESOURCE_MIME_TYPE, description: "SaaS Scenario Modeler UI" },
    async () => ({
      contents: [
        { uri: resourceUri, mimeType: RESOURCE_MIME_TYPE, text: html },
      ],
    }),
  );
}

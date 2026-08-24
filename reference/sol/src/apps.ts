import type { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";
import {
  GALLERY_APPS,
  RESOURCE_MIME_TYPE,
  type GalleryAppDefinition,
  type GallerySlug,
} from "./catalog.js";
import { assertBounded } from "./limits.js";
import { resourceFor } from "./resources.js";

type ToolResult = {
  content: { type: "text"; text: string }[];
  structuredContent?: Record<string, unknown>;
  isError?: boolean;
};

function boundedResult(
  app: GalleryAppDefinition,
  result: ToolResult,
): ToolResult {
  assertBounded(result, app.resultBytes, `${app.slug} result`);
  return result;
}

function uiMeta(app: GalleryAppDefinition): Record<string, unknown> {
  return {
    ui: { resourceUri: app.resourceUri, visibility: ["model", "app"] },
    "ui/resourceUri": app.resourceUri,
  };
}

function registerResource(server: McpServer, app: GalleryAppDefinition): void {
  server.registerResource(
    app.resourceUri,
    app.resourceUri,
    {
      title: app.displayName,
      description: app.resourceDescription,
      mimeType: RESOURCE_MIME_TYPE,
      _meta: {
        ui: {
          csp: {},
          permissions: app.resourcePermissions,
          prefersBorder: true,
        },
      },
    },
    async (_uri, context) => {
      context.mcpReq.signal.throwIfAborted();
      const resource = resourceFor(app.slug);
      return {
        contents: [
          {
            uri: app.resourceUri,
            mimeType: RESOURCE_MIME_TYPE,
            text: resource.html,
            _meta: {
              ui: {
                csp: {},
                permissions: app.resourcePermissions,
                prefersBorder: true,
              },
            },
          },
        ],
      };
    },
  );
}

const emptyInput = z.object({}).strict();

function registerGetTime(server: McpServer, app: GalleryAppDefinition): void {
  server.registerTool(
    app.toolName,
    {
      title: app.toolTitle,
      description: app.toolDescription,
      inputSchema: emptyInput,
      _meta: uiMeta(app),
    },
    (_input, context) => {
      context.mcpReq.signal.throwIfAborted();
      const time = new Date().toISOString();
      return boundedResult(app, {
        content: [{ type: "text", text: time }],
        structuredContent: { time },
      });
    },
  );
}

const categories = [
  {
    id: "marketing",
    name: "Marketing",
    color: "#3b82f6",
    defaultPercent: 25,
    trend: 0.15,
  },
  {
    id: "engineering",
    name: "Engineering",
    color: "#10b981",
    defaultPercent: 35,
    trend: -0.1,
  },
  {
    id: "operations",
    name: "Operations",
    color: "#f59e0b",
    defaultPercent: 15,
    trend: 0.05,
  },
  {
    id: "sales",
    name: "Sales",
    color: "#ef4444",
    defaultPercent: 15,
    trend: 0.08,
  },
  { id: "rd", name: "R&D", color: "#8b5cf6", defaultPercent: 10, trend: -0.18 },
] as const;

const benchmarks = ["Seed", "Series A", "Series B", "Growth"].map(
  (stage, stageIndex) => ({
    stage,
    categoryBenchmarks: Object.fromEntries(
      categories.map((category, categoryIndex) => {
        const p50 = Math.max(
          8,
          category.defaultPercent + stageIndex * 2 - categoryIndex,
        );
        return [
          category.id,
          { p25: Math.max(0, p50 - 5), p50, p75: Math.min(100, p50 + 5) },
        ];
      }),
    ),
  }),
);

function seeded(seed: number): () => number {
  return () => {
    seed = (seed * 1_103_515_245 + 12_345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

function budgetData(): Record<string, unknown> {
  const random = seeded(42);
  const history = Array.from({ length: 24 }, (_, index) => {
    const date = new Date(Date.UTC(2026, index, 1));
    const raw = Object.fromEntries(
      categories.map((category) => [
        category.id,
        Math.max(
          1,
          category.defaultPercent +
            index * category.trend +
            (random() - 0.5) * 3,
        ),
      ]),
    );
    const total = Object.values(raw).reduce((sum, value) => sum + value, 0);
    return {
      month: `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`,
      allocations: Object.fromEntries(
        Object.entries(raw).map(([key, value]) => [
          key,
          Math.round((value / total) * 1000) / 10,
        ]),
      ),
    };
  });
  return {
    config: {
      categories: categories.map(({ trend: _trend, ...category }) => category),
      presetBudgets: [50_000, 100_000, 250_000, 500_000, 1_000_000],
      defaultBudget: 100_000,
      currency: "USD",
      currencySymbol: "$",
    },
    analytics: {
      history,
      benchmarks,
      stages: benchmarks.map(({ stage }) => stage),
      defaultStage: "Series A",
    },
  };
}

function registerBudget(server: McpServer, app: GalleryAppDefinition): void {
  server.registerTool(
    app.toolName,
    {
      title: app.toolTitle,
      description: app.toolDescription,
      inputSchema: emptyInput,
      _meta: uiMeta(app),
    },
    (_input, context) => {
      context.mcpReq.signal.throwIfAborted();
      const data = budgetData();
      return boundedResult(app, {
        content: [
          {
            type: "text",
            text: "Budget Allocator: five categories, 24 months of synthetic history, and four stage benchmarks.",
          },
        ],
        structuredContent: data,
      });
    },
  );
}

const cohortInput = z
  .object({
    metric: z.enum(["retention", "revenue", "active"]).default("retention"),
    periodType: z.enum(["monthly", "weekly"]).default("monthly"),
    cohortCount: z.number().int().min(3).max(12).default(12),
    maxPeriods: z.number().int().min(3).max(12).default(12),
  })
  .strict();

function cohortData(
  input: z.infer<typeof cohortInput>,
): Record<string, unknown> {
  const random = seeded(73 + input.metric.length + input.periodType.length);
  const params =
    input.metric === "revenue"
      ? [0.7, 0.1, 0.15, 0.06]
      : input.metric === "active"
        ? [0.6, 0.18, 0.05, 0.05]
        : [0.75, 0.12, 0.08, 0.04];
  const periods = Array.from(
    { length: input.maxPeriods },
    (_, index) => `M${index}`,
  );
  const periodLabels = periods.map(
    (_period, index) =>
      `${input.periodType === "weekly" ? "Week" : "Month"} ${index}`,
  );
  const cohorts = Array.from(
    { length: input.cohortCount },
    (_, cohortIndex) => {
      const originalUsers = 1_000 + Math.floor(random() * 4_000);
      let previous = 1;
      const cellCount = Math.min(
        input.cohortCount - cohortIndex,
        input.maxPeriods,
      );
      const cells = Array.from({ length: cellCount }, (_, periodIndex) => {
        const base =
          periodIndex === 0
            ? 1
            : params[0]! * Math.exp(-params[1]! * (periodIndex - 1)) +
              params[2]!;
        const retention = Math.max(
          0,
          Math.min(previous + 0.02, base + (random() - 0.5) * 2 * params[3]!),
        );
        previous = retention;
        return {
          cohortIndex,
          periodIndex,
          retention,
          usersRetained: Math.round(originalUsers * retention),
          usersOriginal: originalUsers,
        };
      });
      const month = String((cohortIndex % 12) + 1).padStart(2, "0");
      return {
        cohortId: `2025-${month}`,
        cohortLabel: `Cohort ${cohortIndex + 1}`,
        originalUsers,
        cells,
      };
    },
  );
  return {
    cohorts,
    periods,
    periodLabels,
    metric: input.metric,
    periodType: input.periodType,
    generatedAt: "2026-08-17T00:00:00.000Z",
  };
}

function registerCohort(server: McpServer, app: GalleryAppDefinition): void {
  server.registerTool(
    app.toolName,
    {
      title: app.toolTitle,
      description: app.toolDescription,
      inputSchema: cohortInput,
      _meta: uiMeta(app),
    },
    (input, context) => {
      context.mcpReq.signal.throwIfAborted();
      const data = cohortData(input);
      return boundedResult(app, {
        content: [
          {
            type: "text",
            text: `Cohort analysis: ${input.cohortCount} cohorts and ${input.maxPeriods} ${input.periodType} periods.`,
          },
        ],
        structuredContent: data,
      });
    },
  );
}

const segments = ["Enterprise", "Mid-Market", "SMB", "Startup"] as const;
const segmentColors: Record<(typeof segments)[number], string> = {
  Enterprise: "#1e40af",
  "Mid-Market": "#0d9488",
  SMB: "#059669",
  Startup: "#6366f1",
};
const customerInput = z
  .object({ segment: z.enum(["All", ...segments]).default("All") })
  .strict();

function customerData(
  filter: z.infer<typeof customerInput>["segment"],
): Record<string, unknown> {
  const customers = Array.from({ length: 250 }, (_, index) => {
    const segment = segments[index % segments.length]!;
    const factor = index + 1;
    return {
      id: `cust-${String(factor).padStart(4, "0")}`,
      name: `Synthetic ${segment} ${factor}`,
      segment,
      annualRevenue:
        25_000 +
        factor *
          (segment === "Enterprise"
            ? 35_000
            : segment === "Mid-Market"
              ? 12_000
              : 3_500),
      employeeCount: 5 + ((factor * 17) % 4_900),
      accountAge: 1 + ((factor * 7) % 120),
      engagementScore: 40 + ((factor * 11) % 56),
      supportTickets: (factor * 3) % 40,
      nps: ((factor * 13) % 101) - 20,
    };
  });
  return {
    customers:
      filter === "All"
        ? customers
        : customers.filter((customer) => customer.segment === filter),
    segments: segments.map((segment) => ({
      name: segment,
      count: customers.filter((customer) => customer.segment === segment)
        .length,
      color: segmentColors[segment],
    })),
  };
}

function registerCustomers(server: McpServer, app: GalleryAppDefinition): void {
  server.registerTool(
    app.toolName,
    {
      title: app.toolTitle,
      description: app.toolDescription,
      inputSchema: customerInput,
      _meta: uiMeta(app),
    },
    (input, context) => {
      context.mcpReq.signal.throwIfAborted();
      const data = customerData(input.segment);
      return boundedResult(app, {
        content: [{ type: "text", text: JSON.stringify(data) }],
        structuredContent: data,
      });
    },
  );
}

const scenarioInputs = z
  .object({
    startingMRR: z.number().min(10_000).max(500_000),
    monthlyGrowthRate: z.number().min(0).max(20),
    monthlyChurnRate: z.number().min(0).max(15),
    grossMargin: z.number().min(20).max(100),
    fixedCosts: z.number().min(0).max(500_000),
  })
  .strict();
const scenarioToolInput = z
  .object({ customInputs: scenarioInputs.optional() })
  .strict();
type ScenarioInputs = z.infer<typeof scenarioInputs>;

function projectScenario(input: ScenarioInputs): {
  projections: Record<string, number>[];
  summary: Record<string, number | null>;
} {
  let cumulativeRevenue = 0;
  const netGrowth = (input.monthlyGrowthRate - input.monthlyChurnRate) / 100;
  const projections = Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    const mrr = input.startingMRR * Math.pow(1 + netGrowth, month);
    const grossProfit = mrr * (input.grossMargin / 100);
    const netProfit = grossProfit - input.fixedCosts;
    cumulativeRevenue += mrr;
    return { month, mrr, grossProfit, netProfit, cumulativeRevenue };
  });
  const ending = projections.at(-1)!;
  const totalProfit = projections.reduce(
    (sum, projection) => sum + projection.netProfit,
    0,
  );
  return {
    projections,
    summary: {
      endingMRR: ending.mrr,
      arr: ending.mrr * 12,
      totalRevenue: cumulativeRevenue,
      totalProfit,
      mrrGrowthPct:
        ((ending.mrr - input.startingMRR) / input.startingMRR) * 100,
      avgMargin: (totalProfit / cumulativeRevenue) * 100,
      breakEvenMonth:
        projections.find((projection) => projection.netProfit >= 0)?.month ??
        null,
    },
  };
}

const templateInputs: [
  string,
  string,
  string,
  string,
  ScenarioInputs,
  string,
][] = [
  [
    "bootstrapped",
    "Bootstrapped Growth",
    "Low burn, steady growth, path to profitability",
    "🌱",
    {
      startingMRR: 30_000,
      monthlyGrowthRate: 4,
      monthlyChurnRate: 2,
      grossMargin: 85,
      fixedCosts: 20_000,
    },
    "Profitable early with measured scale",
  ],
  [
    "vc-rocketship",
    "VC Rocketship",
    "High burn and aggressive growth",
    "🚀",
    {
      startingMRR: 100_000,
      monthlyGrowthRate: 15,
      monthlyChurnRate: 5,
      grossMargin: 70,
      fixedCosts: 150_000,
    },
    "Growth trades early profit for scale",
  ],
  [
    "cash-cow",
    "Cash Cow",
    "Mature product with high margin",
    "🐄",
    {
      startingMRR: 80_000,
      monthlyGrowthRate: 2,
      monthlyChurnRate: 1,
      grossMargin: 90,
      fixedCosts: 40_000,
    },
    "Consistent profitability",
  ],
  [
    "turnaround",
    "Turnaround",
    "Rebuilding product-market fit",
    "🔄",
    {
      startingMRR: 60_000,
      monthlyGrowthRate: 6,
      monthlyChurnRate: 8,
      grossMargin: 75,
      fixedCosts: 50_000,
    },
    "Negative net growth requires action",
  ],
  [
    "efficient-growth",
    "Efficient Growth",
    "Balanced sustainable economics",
    "⚖️",
    {
      startingMRR: 50_000,
      monthlyGrowthRate: 8,
      monthlyChurnRate: 3,
      grossMargin: 80,
      fixedCosts: 35_000,
    },
    "Balanced growth and profitability",
  ],
];
const defaultScenario: ScenarioInputs = {
  startingMRR: 50_000,
  monthlyGrowthRate: 5,
  monthlyChurnRate: 3,
  grossMargin: 80,
  fixedCosts: 30_000,
};

function registerScenario(server: McpServer, app: GalleryAppDefinition): void {
  server.registerTool(
    app.toolName,
    {
      title: app.toolTitle,
      description: app.toolDescription,
      inputSchema: scenarioToolInput,
      _meta: uiMeta(app),
    },
    (input, context) => {
      context.mcpReq.signal.throwIfAborted();
      const templates = templateInputs.map(
        ([id, name, description, icon, parameters, keyInsight]) => ({
          id,
          name,
          description,
          icon,
          parameters,
          ...projectScenario(parameters),
          keyInsight,
        }),
      );
      const custom = input.customInputs
        ? projectScenario(input.customInputs)
        : undefined;
      const structuredContent = {
        templates,
        defaultInputs: defaultScenario,
        customProjections: custom?.projections,
        customSummary: custom?.summary,
      };
      return boundedResult(app, {
        content: [
          {
            type: "text",
            text: `SaaS Scenario Modeler: ${templates.map((template) => template.name).join(", ")}.`,
          },
        ],
        structuredContent,
      });
    },
  );
}

function registerTranscript(
  server: McpServer,
  app: GalleryAppDefinition,
): void {
  server.registerTool(
    app.toolName,
    {
      title: app.toolTitle,
      description: app.toolDescription,
      inputSchema: emptyInput,
      _meta: uiMeta(app),
    },
    (_input, context) => {
      context.mcpReq.signal.throwIfAborted();
      const structuredContent = {
        status: "ready",
        message: "Transcription UI opened. Audio stays in the browser.",
      };
      return boundedResult(app, {
        content: [{ type: "text", text: JSON.stringify(structuredContent) }],
        structuredContent,
      });
    },
  );
}

const registrations: Record<
  GallerySlug,
  (server: McpServer, app: GalleryAppDefinition) => void
> = {
  "get-time": registerGetTime,
  "budget-allocator": registerBudget,
  "cohort-heatmap": registerCohort,
  "customer-segmentation": registerCustomers,
  "scenario-modeler": registerScenario,
  transcript: registerTranscript,
};

export function registerGalleryApp(
  server: McpServer,
  app: GalleryAppDefinition,
): void {
  registrations[app.slug](server, app);
  registerResource(server, app);
}

export function validateRegistrations(): void {
  if (Object.keys(registrations).length !== GALLERY_APPS.length)
    throw new Error(
      "Every gallery app must have exactly one isolated registration adapter",
    );
}

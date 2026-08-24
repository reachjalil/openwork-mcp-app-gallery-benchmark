import type { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";
import {
  RESOURCE_MIME_TYPE,
  registerAppResource,
  registerAppTool,
} from "../mcp-app-adapter.js";
import { createSeededRandom } from "../seeded-random.js";

const BudgetCategorySchema = z.object({
  id: z.string().max(32),
  name: z.string().max(64),
  color: z.string().max(16),
  defaultPercent: z.number().min(0).max(100),
});

const HistoricalMonthSchema = z.object({
  month: z.string().max(16),
  allocations: z.record(z.string().max(32), z.number().min(0).max(100)),
});

const BenchmarkPercentilesSchema = z.object({
  p25: z.number(),
  p50: z.number(),
  p75: z.number(),
});

const StageBenchmarkSchema = z.object({
  stage: z.string().max(32),
  categoryBenchmarks: z.record(z.string().max(32), BenchmarkPercentilesSchema),
});

const BudgetConfigSchema = z.object({
  categories: z.array(BudgetCategorySchema).max(8),
  presetBudgets: z.array(z.number().min(1).max(10_000_000)).max(8),
  defaultBudget: z.number().min(1).max(10_000_000),
  currency: z.string().max(8),
  currencySymbol: z.string().max(4),
});

const BudgetAnalyticsSchema = z.object({
  history: z.array(HistoricalMonthSchema).max(24),
  benchmarks: z.array(StageBenchmarkSchema).max(8),
  stages: z.array(z.string().max(32)).max(8),
  defaultStage: z.string().max(32),
});

const BudgetDataResponseSchema = z.object({
  config: BudgetConfigSchema,
  analytics: BudgetAnalyticsSchema,
});

type BudgetCategoryInternal = z.infer<typeof BudgetCategorySchema> & {
  trendPerMonth: number;
};

const CATEGORIES: BudgetCategoryInternal[] = [
  {
    id: "marketing",
    name: "Marketing",
    color: "#3b82f6",
    defaultPercent: 25,
    trendPerMonth: 0.15,
  },
  {
    id: "engineering",
    name: "Engineering",
    color: "#10b981",
    defaultPercent: 35,
    trendPerMonth: -0.1,
  },
  {
    id: "operations",
    name: "Operations",
    color: "#f59e0b",
    defaultPercent: 15,
    trendPerMonth: 0.05,
  },
  {
    id: "sales",
    name: "Sales",
    color: "#ef4444",
    defaultPercent: 15,
    trendPerMonth: 0.08,
  },
  {
    id: "rd",
    name: "R&D",
    color: "#8b5cf6",
    defaultPercent: 10,
    trendPerMonth: -0.18,
  },
];

const BENCHMARKS = [
  {
    stage: "Seed",
    categoryBenchmarks: {
      marketing: { p25: 15, p50: 20, p75: 25 },
      engineering: { p25: 40, p50: 47, p75: 55 },
      operations: { p25: 8, p50: 12, p75: 15 },
      sales: { p25: 10, p50: 15, p75: 20 },
      rd: { p25: 5, p50: 10, p75: 15 },
    },
  },
  {
    stage: "Series A",
    categoryBenchmarks: {
      marketing: { p25: 20, p50: 25, p75: 30 },
      engineering: { p25: 35, p50: 40, p75: 45 },
      operations: { p25: 10, p50: 14, p75: 18 },
      sales: { p25: 15, p50: 20, p75: 25 },
      rd: { p25: 8, p50: 12, p75: 15 },
    },
  },
  {
    stage: "Series B",
    categoryBenchmarks: {
      marketing: { p25: 22, p50: 27, p75: 32 },
      engineering: { p25: 30, p50: 35, p75: 40 },
      operations: { p25: 12, p50: 16, p75: 20 },
      sales: { p25: 18, p50: 23, p75: 28 },
      rd: { p25: 8, p50: 12, p75: 15 },
    },
  },
  {
    stage: "Growth",
    categoryBenchmarks: {
      marketing: { p25: 25, p50: 30, p75: 35 },
      engineering: { p25: 25, p50: 30, p75: 35 },
      operations: { p25: 15, p50: 18, p75: 22 },
      sales: { p25: 20, p50: 25, p75: 30 },
      rd: { p25: 5, p50: 8, p75: 12 },
    },
  },
];

function generateHistory(now: Date) {
  const months = [];
  const random = createSeededRandom(42);
  for (let i = 23; i >= 0; i -= 1) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const raw: Record<string, number> = {};
    for (const cat of CATEGORIES) {
      const monthsFromStart = 23 - i;
      const trend = monthsFromStart * cat.trendPerMonth;
      const noise = (random() - 0.5) * 3;
      raw[cat.id] = Math.max(
        0,
        Math.min(100, cat.defaultPercent + trend + noise),
      );
    }
    const total = Object.values(raw).reduce((a, b) => a + b, 0);
    const allocations: Record<string, number> = {};
    for (const id of Object.keys(raw)) {
      const value = raw[id] ?? 0;
      allocations[id] = Math.round((value / total) * 1000) / 10;
    }
    months.push({ month: monthStr, allocations });
  }
  return months;
}

export function registerBudgetAllocator(
  server: McpServer,
  html: string,
  now: () => Date,
): void {
  const resourceUri = "ui://budget-allocator/mcp-app.html";
  registerAppTool(
    server,
    "get-budget-data",
    {
      title: "Get Budget Data",
      description:
        "Returns budget configuration with 24 months of historical allocations and industry benchmarks by company stage. The widget is interactive and exposes tools for reading/modifying allocations, adjusting budgets, and comparing against industry benchmarks.",
      outputSchema: BudgetDataResponseSchema,
      _meta: { ui: { resourceUri } },
    },
    async () => {
      const response = {
        config: {
          categories: CATEGORIES.map(({ id, name, color, defaultPercent }) => ({
            id,
            name,
            color,
            defaultPercent,
          })),
          presetBudgets: [50000, 100000, 250000, 500000],
          defaultBudget: 100000,
          currency: "USD",
          currencySymbol: "$",
        },
        analytics: {
          history: generateHistory(now()),
          benchmarks: BENCHMARKS,
          stages: ["Seed", "Series A", "Series B", "Growth"],
          defaultStage: "Series A",
        },
      };
      const lines = [
        "Budget Allocator Configuration",
        "==============================",
        "",
        `Default Budget: ${response.config.currencySymbol}${response.config.defaultBudget.toLocaleString()}`,
        `Available Presets: ${response.config.presetBudgets.map((b) => `${response.config.currencySymbol}${b.toLocaleString()}`).join(", ")}`,
        "",
        "Categories:",
        ...response.config.categories.map(
          (c) => `  - ${c.name}: ${c.defaultPercent}% default`,
        ),
        "",
        `Historical Data: ${response.analytics.history.length} months`,
        `Benchmark Stages: ${response.analytics.stages.join(", ")}`,
        `Default Stage: ${response.analytics.defaultStage}`,
      ];
      return {
        content: [{ type: "text", text: lines.join("\n") }],
        structuredContent: response,
      };
    },
  );
  registerAppResource(
    server,
    resourceUri,
    resourceUri,
    {
      mimeType: RESOURCE_MIME_TYPE,
      description: "Interactive Budget Allocator UI",
    },
    async () => ({
      contents: [
        { uri: resourceUri, mimeType: RESOURCE_MIME_TYPE, text: html },
      ],
    }),
  );
}

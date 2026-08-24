import type { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";
import {
  RESOURCE_MIME_TYPE,
  registerAppResource,
  registerAppTool,
} from "../mcp-app-adapter.js";
import { createSeededRandom } from "../seeded-random.js";

const GetCohortDataInputSchema = z.object({
  metric: z
    .enum(["retention", "revenue", "active"])
    .optional()
    .default("retention"),
  periodType: z.enum(["monthly", "weekly"]).optional().default("monthly"),
  cohortCount: z.number().int().min(3).max(24).optional().default(12),
  maxPeriods: z.number().int().min(3).max(24).optional().default(12),
});

const CohortCellSchema = z.object({
  cohortIndex: z.number(),
  periodIndex: z.number(),
  retention: z.number(),
  usersRetained: z.number(),
  usersOriginal: z.number(),
});

const CohortRowSchema = z.object({
  cohortId: z.string(),
  cohortLabel: z.string(),
  originalUsers: z.number(),
  cells: z.array(CohortCellSchema).max(24),
});

const CohortDataSchema = z.object({
  cohorts: z.array(CohortRowSchema).max(24),
  periods: z.array(z.string()).max(24),
  periodLabels: z.array(z.string()).max(24),
  metric: z.string(),
  periodType: z.string(),
  generatedAt: z.string(),
});

function generateRetention(
  period: number,
  random: () => number,
  params: {
    baseRetention: number;
    decayRate: number;
    floor: number;
    noise: number;
  },
): number {
  if (period === 0) return 1;
  const base =
    params.baseRetention * Math.exp(-params.decayRate * (period - 1)) +
    params.floor;
  const variation = (random() - 0.5) * 2 * params.noise;
  return Math.max(0, Math.min(1, base + variation));
}

function generateCohortData(
  metric: string,
  periodType: string,
  cohortCount: number,
  maxPeriods: number,
  now: Date,
) {
  const random = createSeededRandom(7);
  const periods: string[] = [];
  const periodLabels: string[] = [];
  for (let i = 0; i < maxPeriods; i += 1) {
    periods.push(periodType === "weekly" ? `W${i}` : `M${i}`);
    periodLabels.push(periodType === "weekly" ? `Week ${i}` : `Month ${i}`);
  }
  const cohorts = [];
  for (let c = 0; c < cohortCount; c += 1) {
    const originalUsers = 80 + Math.floor(random() * 40);
    const date = new Date(now);
    date.setMonth(date.getMonth() - (cohortCount - c));
    const cells = [];
    for (let p = 0; p < maxPeriods; p += 1) {
      if (p > maxPeriods - 1 - (cohortCount - 1 - c)) continue;
      const retention = generateRetention(p, random, {
        baseRetention: 0.72,
        decayRate: 0.18,
        floor: 0.12,
        noise: 0.04,
      });
      cells.push({
        cohortIndex: c,
        periodIndex: p,
        retention,
        usersRetained: Math.round(originalUsers * retention),
        usersOriginal: originalUsers,
      });
    }
    cohorts.push({
      cohortId: `c-${c}`,
      cohortLabel: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      originalUsers,
      cells,
    });
  }
  return {
    cohorts,
    periods,
    periodLabels,
    metric,
    periodType,
    generatedAt: now.toISOString(),
  };
}

export function registerCohortHeatmap(
  server: McpServer,
  html: string,
  now: () => Date,
): void {
  const resourceUri = "ui://get-cohort-data/mcp-app.html";
  registerAppTool(
    server,
    "get-cohort-data",
    {
      title: "Get Cohort Retention Data",
      description:
        "Returns cohort retention heatmap data showing customer retention over time by signup month",
      inputSchema: GetCohortDataInputSchema,
      outputSchema: CohortDataSchema,
      _meta: { ui: { resourceUri } },
    },
    async (args) => {
      const parsed = GetCohortDataInputSchema.parse(args);
      const data = generateCohortData(
        parsed.metric,
        parsed.periodType,
        parsed.cohortCount,
        parsed.maxPeriods,
        now(),
      );
      const avg =
        data.cohorts
          .flatMap((row) => row.cells.map((cell) => cell.retention))
          .reduce((a, b) => a + b, 0) /
        Math.max(1, data.cohorts.flatMap((row) => row.cells).length);
      const text = `Cohort Analysis: ${data.cohorts.length} cohorts, ${data.periods.length} periods
Average retention: ${(avg * 100).toFixed(1)}%
Metric: ${data.metric}, Period: ${data.periodType}`;
      return { content: [{ type: "text", text }], structuredContent: data };
    },
  );
  registerAppResource(
    server,
    resourceUri,
    resourceUri,
    { mimeType: RESOURCE_MIME_TYPE },
    async () => ({
      contents: [
        { uri: resourceUri, mimeType: RESOURCE_MIME_TYPE, text: html },
      ],
    }),
  );
}

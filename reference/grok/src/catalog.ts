import type { AppSlug } from "./constants.js";
import { UPSTREAM_COMMIT, UPSTREAM_REPOSITORY } from "./constants.js";

export type InteractionCategory =
  "starter" | "form" | "chart" | "visualization" | "media";

export type CatalogEntry = {
  slug: AppSlug;
  displayName: string;
  summary: string;
  category: InteractionCategory;
  samplePrompt: string;
  safetyNote: string;
  upstreamPath: string;
  resourceUri: string;
  toolName: string;
  serverName: string;
};

export const CATALOG: readonly CatalogEntry[] = [
  {
    slug: "get-time",
    displayName: "Get Time",
    summary:
      "Smallest tool plus interactive UI round trip for the current server time.",
    category: "starter",
    samplePrompt: "Show me the current server time using the interactive app.",
    safetyNote: "Returns the current server clock. No user data is stored.",
    upstreamPath: "examples/basic-server-react",
    resourceUri: "ui://get-time/mcp-app.html",
    toolName: "get-time",
    serverName: "Basic MCP App Server (React)",
  },
  {
    slug: "budget-allocator",
    displayName: "Budget Allocator",
    summary:
      "Adjust a synthetic seed-stage budget with charts and recalculation.",
    category: "form",
    samplePrompt:
      "Create a $1 million seed-stage budget I can adjust interactively.",
    safetyNote:
      "Synthetic demo data. Numeric ranges and payload size are clamped.",
    upstreamPath: "examples/budget-allocator-server",
    resourceUri: "ui://budget-allocator/mcp-app.html",
    toolName: "get-budget-data",
    serverName: "Budget Allocator Server",
  },
  {
    slug: "cohort-heatmap",
    displayName: "Cohort Heatmap",
    summary: "Explore a dense interactive customer-retention heatmap.",
    category: "visualization",
    samplePrompt: "Show me an interactive customer-retention cohort heatmap.",
    safetyNote: "Fixed synthetic dataset. No uploads.",
    upstreamPath: "examples/cohort-heatmap-server",
    resourceUri: "ui://get-cohort-data/mcp-app.html",
    toolName: "get-cohort-data",
    serverName: "Cohort Heatmap Server",
  },
  {
    slug: "customer-segmentation",
    displayName: "Customer Segmentation",
    summary: "Filter synthetic customers by revenue and engagement.",
    category: "chart",
    samplePrompt: "Let me explore customers by revenue and engagement.",
    safetyNote: "Fixed synthetic dataset. Filters are bounded.",
    upstreamPath: "examples/customer-segmentation-server",
    resourceUri: "ui://customer-segmentation/mcp-app.html",
    toolName: "get-customer-data",
    serverName: "Customer Segmentation Server",
  },
  {
    slug: "scenario-modeler",
    displayName: "Scenario Modeler",
    summary: "Compare synthetic SaaS growth plans over stateless tools.",
    category: "form",
    samplePrompt:
      "Compare a bootstrapped plan with a venture-funded growth plan.",
    safetyNote:
      "Synthetic financial scenarios. Scenario count and numeric inputs are clamped.",
    upstreamPath: "examples/scenario-modeler-server",
    resourceUri: "ui://scenario-modeler/mcp-app.html",
    toolName: "get-scenario-data",
    serverName: "SaaS Scenario Modeler",
  },
  {
    slug: "transcript",
    displayName: "Transcript",
    summary: "Navigate a structured transcript in an interactive view.",
    category: "media",
    samplePrompt: "Show me an interactive transcript I can navigate.",
    safetyNote:
      "Demo transcript only. Speech recognition stays in the browser when used.",
    upstreamPath: "examples/transcript-server",
    resourceUri: "ui://transcript/mcp-app.html",
    toolName: "transcribe",
    serverName: "Transcript Server",
  },
] as const;

export function catalogBySlug(slug: AppSlug): CatalogEntry {
  const entry = CATALOG.find((item) => item.slug === slug);
  if (!entry) throw new Error(`Unknown catalog slug ${slug}`);
  return entry;
}

export function upstreamSourceUrl(path: string): string {
  return `https://github.com/${UPSTREAM_REPOSITORY}/tree/${UPSTREAM_COMMIT}/${path}`;
}

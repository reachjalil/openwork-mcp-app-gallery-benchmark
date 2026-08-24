export const MODEL_NAME = "SOL";
export const MODEL_NAMESPACE = "sol";
export const UPSTREAM_REPOSITORY = "modelcontextprotocol/ext-apps";
export const UPSTREAM_COMMIT = "10195ad91851502134930e9b80ec2c04e277a720";
export const PROTOCOL_ADAPTER_VERSION = "gallery-sdk-v2/1.0.0";
export const RESOURCE_MIME_TYPE = "text/html;profile=mcp-app";

export const REQUIRED_SLUGS = [
  "get-time",
  "budget-allocator",
  "cohort-heatmap",
  "customer-segmentation",
  "scenario-modeler",
  "transcript",
] as const;

export type GallerySlug = (typeof REQUIRED_SLUGS)[number];

export type GalleryAppDefinition = {
  slug: GallerySlug;
  upstreamDirectory: string;
  displayName: string;
  summary: string;
  category: string;
  samplePrompt: string;
  dataNote: string;
  screenshotDigest: string;
  screenshotAlt: string;
  toolName: string;
  toolTitle: string;
  toolDescription: string;
  resourceUri: `ui://${string}/mcp-app.html`;
  resourceDescription: string;
  requestBytes: number;
  resultBytes: number;
  timeoutMs: number;
  concurrentRequests: number;
  resourcePermissions?: {
    microphone?: Record<string, never>;
    clipboardWrite?: Record<string, never>;
  };
};

const sharedLimits = {
  requestBytes: 256 * 1024,
  resultBytes: 512 * 1024,
  timeoutMs: 15_000,
} as const;

export const GALLERY_APPS: readonly GalleryAppDefinition[] = [
  {
    slug: "get-time",
    upstreamDirectory: "basic-server-react",
    displayName: "Get Time",
    summary:
      "Read the server clock and refresh it from a compact interactive app.",
    category: "Starter · tool round trip",
    samplePrompt: "Show me the current server time using the interactive app.",
    dataNote: "No user data; returns only the current server timestamp.",
    screenshotDigest:
      "d0b800cf1eb7e4ad7de8bb4b10b367bf89ca0002f24ed717401a1f3e0a178ee4",
    screenshotAlt:
      "Get Time MCP App showing a server timestamp and interaction controls.",
    toolName: "get-time",
    toolTitle: "Get Time",
    toolDescription: "Returns the current server time as an ISO 8601 string.",
    resourceUri: "ui://get-time/mcp-app.html",
    resourceDescription: "Interactive Get Time UI",
    concurrentRequests: 16,
    ...sharedLimits,
  },
  {
    slug: "budget-allocator",
    upstreamDirectory: "budget-allocator-server",
    displayName: "Budget Allocator",
    summary:
      "Adjust a synthetic company budget and compare allocations with stage benchmarks.",
    category: "Form · chart · App tools",
    samplePrompt:
      "Create a $1 million seed-stage budget I can adjust interactively.",
    dataNote:
      "Fixed synthetic categories, history, and benchmarks; nothing is saved.",
    screenshotDigest:
      "42385d199c4b63ef0769bf30aaa62721b1f8be9e9a50127a3b50623755f927bc",
    screenshotAlt:
      "Budget Allocator MCP App with category sliders, a budget chart, and benchmark controls.",
    toolName: "get-budget-data",
    toolTitle: "Get Budget Data",
    toolDescription:
      "Returns bounded budget configuration, synthetic history, and stage benchmarks.",
    resourceUri: "ui://budget-allocator/mcp-app.html",
    resourceDescription: "Interactive Budget Allocator UI",
    concurrentRequests: 8,
    ...sharedLimits,
  },
  {
    slug: "cohort-heatmap",
    upstreamDirectory: "cohort-heatmap-server",
    displayName: "Cohort Heatmap",
    summary:
      "Explore a bounded synthetic retention cohort heatmap across time periods.",
    category: "Dense visualization",
    samplePrompt: "Show me an interactive customer-retention cohort heatmap.",
    dataNote:
      "Deterministic synthetic cohorts; at most 12 cohorts by 12 periods.",
    screenshotDigest:
      "f55cd4a1ec2d50b8250d93d9254dbdf87a3fc9a42487e8b8f872f5f02ca3cd8d",
    screenshotAlt:
      "Cohort Heatmap MCP App showing a color-coded retention grid.",
    toolName: "get-cohort-data",
    toolTitle: "Get Cohort Data",
    toolDescription:
      "Returns bounded synthetic cohort data for retention, revenue, or active-user exploration.",
    resourceUri: "ui://get-cohort-data/mcp-app.html",
    resourceDescription: "Interactive Cohort Retention Heatmap UI",
    concurrentRequests: 8,
    ...sharedLimits,
  },
  {
    slug: "customer-segmentation",
    upstreamDirectory: "customer-segmentation-server",
    displayName: "Customer Segmentation",
    summary:
      "Filter a deterministic synthetic customer portfolio by segment and engagement.",
    category: "Filtering · chart",
    samplePrompt: "Let me explore customers by revenue and engagement.",
    dataNote:
      "Fixed synthetic customer records; filters are bounded and no uploads are accepted.",
    screenshotDigest:
      "0077f0818a591f81901fe8412bb9b195a32f7885ff98e94d717be37af00f4136",
    screenshotAlt:
      "Customer Segmentation MCP App plotting synthetic customers by revenue and engagement.",
    toolName: "get-customer-data",
    toolTitle: "Get Customer Data",
    toolDescription:
      "Returns a bounded deterministic synthetic customer set, optionally filtered by segment.",
    resourceUri: "ui://customer-segmentation/mcp-app.html",
    resourceDescription: "Customer Segmentation Explorer UI",
    concurrentRequests: 6,
    ...sharedLimits,
  },
  {
    slug: "scenario-modeler",
    upstreamDirectory: "scenario-modeler-server",
    displayName: "Scenario Modeler",
    summary:
      "Compare bounded synthetic SaaS growth plans and tune financial assumptions.",
    category: "Financial model · chart",
    samplePrompt:
      "Compare a bootstrapped plan with a venture-funded growth plan.",
    dataNote:
      "Synthetic templates and local calculations; no financial data is stored.",
    screenshotDigest:
      "d0d65f2273ff48563f798830beeb97a0b0a8209afe6ba1de391283704e0e0148",
    screenshotAlt:
      "Scenario Modeler MCP App with SaaS parameter sliders and projection charts.",
    toolName: "get-scenario-data",
    toolTitle: "Get Scenario Data",
    toolDescription:
      "Returns bounded SaaS templates and optionally computes a twelve-month custom projection.",
    resourceUri: "ui://scenario-modeler/mcp-app.html",
    resourceDescription: "SaaS Scenario Modeler UI",
    concurrentRequests: 6,
    ...sharedLimits,
  },
  {
    slug: "transcript",
    upstreamDirectory: "transcript-server",
    displayName: "Transcript",
    summary:
      "Try a local browser speech-transcription interface with explicit microphone permission.",
    category: "Media · structured navigation",
    samplePrompt: "Show me an interactive transcript I can navigate.",
    dataNote:
      "Audio stays in the browser; the server receives no audio and stores no transcript.",
    screenshotDigest:
      "49ad4792a1a6321006605b24a95b02624c361b7e3e74a3d0c417cd1fa27711c9",
    screenshotAlt:
      "Transcript MCP App with microphone controls and a navigable transcript panel.",
    toolName: "transcribe",
    toolTitle: "Transcribe Speech",
    toolDescription:
      "Opens a bounded browser transcription interface using the Web Speech API.",
    resourceUri: "ui://transcript/mcp-app.html",
    resourceDescription: "Interactive Transcript UI",
    resourcePermissions: { microphone: {}, clipboardWrite: {} },
    concurrentRequests: 4,
    ...sharedLimits,
  },
] as const;

export function appBySlug(slug: string): GalleryAppDefinition | undefined {
  return GALLERY_APPS.find((app) => app.slug === slug);
}

export function sourceUrl(app: GalleryAppDefinition): string {
  return `https://github.com/${UPSTREAM_REPOSITORY}/tree/${UPSTREAM_COMMIT}/examples/${app.upstreamDirectory}`;
}

export function parseDisabledSlugs(
  value: string | undefined,
): ReadonlySet<GallerySlug> {
  const disabled = new Set<GallerySlug>();
  for (const candidate of value?.split(",") ?? []) {
    const slug = candidate.trim();
    if ((REQUIRED_SLUGS as readonly string[]).includes(slug)) {
      disabled.add(slug as GallerySlug);
    }
  }
  return disabled;
}

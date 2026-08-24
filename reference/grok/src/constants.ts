export const MODEL_NAME = "GROK";
export const MODEL_NAMESPACE = "grok";
export const PROTOCOL_ADAPTER_VERSION = "1.0.0";
export const UPSTREAM_REPOSITORY = "modelcontextprotocol/ext-apps";
export const UPSTREAM_COMMIT = "10195ad91851502134930e9b80ec2c04e277a720";
export const REQUIRED_SLUGS = [
  "get-time",
  "budget-allocator",
  "cohort-heatmap",
  "customer-segmentation",
  "scenario-modeler",
  "transcript",
] as const;

export type AppSlug = (typeof REQUIRED_SLUGS)[number];

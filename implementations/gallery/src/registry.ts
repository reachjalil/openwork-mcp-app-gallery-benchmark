/**
 * Pinned, declarative app registry.
 *
 * `registry-data.json` is the single source of truth for app metadata; the
 * gateway, the generated gallery site, `/apps.json`, and the architecture
 * checks all read the same data. This module binds each entry to its copied
 * upstream registration function. Every app remains a separate logical MCP
 * server: tool names, resource URIs, and state never cross slugs.
 *
 * `DISABLED_APP_SLUGS` (comma-separated) can only REMOVE entries at runtime;
 * nothing can enable an app that is not reviewed into this registry.
 */
import type { McpServer } from "@modelcontextprotocol/server";
import { createRequire } from "node:module";
import { registerApp as registerGetTime } from "../upstream/ext-apps/basic-server-react/server.js";
import { registerApp as registerBudgetAllocator } from "../upstream/ext-apps/budget-allocator-server/server.js";
import { registerApp as registerCohortHeatmap } from "../upstream/ext-apps/cohort-heatmap-server/server.js";
import { registerApp as registerCustomerSegmentation } from "../upstream/ext-apps/customer-segmentation-server/server.js";
import { registerApp as registerScenarioModeler } from "../upstream/ext-apps/scenario-modeler-server/server.js";
import { registerApp as registerTranscript } from "../upstream/ext-apps/transcript-server/server.js";

export interface GalleryAppLimits {
  requestBytes: number;
  resultBytes: number;
  timeoutMs: number;
  concurrentRequests: number;
}

interface RegistryDataApp {
  slug: string;
  displayName: string;
  serverName: string;
  serverVersion: string;
  summary: string;
  interaction: string;
  toolName: string;
  resourceUri: string;
  samplePrompt: string;
  dataNote: string;
  upstreamDir: string;
  framework: string;
  limits: GalleryAppLimits;
  egressOrigins: string[];
  enabledByDefault: boolean;
}

interface RegistryData {
  upstreamRepository: string;
  upstreamCommit: string;
  apps: RegistryDataApp[];
}

// JSON is loaded through require so the transpiled output runs on Node's
// native ESM loader without import attributes.
const require = createRequire(import.meta.url);
const registryData = require("./registry-data.json") as RegistryData;

export interface GalleryAppRegistration {
  slug: string;
  displayName: string;
  serverName: string;
  serverVersion: string;
  summary: string;
  interaction: string;
  toolName: string;
  resourceUri: string;
  samplePrompt: string;
  dataNote: string;
  register: (server: McpServer) => unknown;
  upstream: {
    repository: string;
    commit: string;
    path: string;
  };
  limits: GalleryAppLimits;
  egressOrigins: string[];
  enabledByDefault: boolean;
}

const REGISTER_FUNCTIONS: Record<string, (server: McpServer) => unknown> = {
  "get-time": registerGetTime,
  "budget-allocator": registerBudgetAllocator,
  "cohort-heatmap": registerCohortHeatmap,
  "customer-segmentation": registerCustomerSegmentation,
  "scenario-modeler": registerScenarioModeler,
  transcript: registerTranscript,
};

export const UPSTREAM_REPOSITORY = registryData.upstreamRepository;
export const UPSTREAM_COMMIT = registryData.upstreamCommit;

function buildRegistry(): GalleryAppRegistration[] {
  return registryData.apps.map((app) => {
    const register = REGISTER_FUNCTIONS[app.slug];
    if (!register) {
      throw new Error(`registry entry ${app.slug} has no register function`);
    }
    return {
      slug: app.slug,
      displayName: app.displayName,
      serverName: app.serverName,
      serverVersion: app.serverVersion,
      summary: app.summary,
      interaction: app.interaction,
      toolName: app.toolName,
      resourceUri: app.resourceUri,
      samplePrompt: app.samplePrompt,
      dataNote: app.dataNote,
      register,
      upstream: {
        repository: registryData.upstreamRepository,
        commit: registryData.upstreamCommit,
        path: `examples/${app.upstreamDir}`,
      },
      limits: app.limits,
      egressOrigins: app.egressOrigins,
      enabledByDefault: app.enabledByDefault,
    };
  });
}

export const registry: readonly GalleryAppRegistration[] = Object.freeze(
  buildRegistry(),
);

const VALID_SLUG = /^[a-z0-9][a-z0-9-]*$/;

export function validateRegistry(): void {
  const slugs = new Set<string>();
  const toolNames = new Set<string>();
  const resourceUris = new Set<string>();
  for (const app of registry) {
    if (!VALID_SLUG.test(app.slug)) {
      throw new Error(`registry slug ${app.slug} is invalid`);
    }
    if (slugs.has(app.slug)) {
      throw new Error(`registry slug ${app.slug} is duplicated`);
    }
    if (toolNames.has(app.toolName)) {
      throw new Error(`tool name ${app.toolName} is duplicated across apps`);
    }
    if (resourceUris.has(app.resourceUri)) {
      throw new Error(`resource URI ${app.resourceUri} is duplicated`);
    }
    slugs.add(app.slug);
    toolNames.add(app.toolName);
    resourceUris.add(app.resourceUri);
    if (app.egressOrigins.length > 0) {
      throw new Error(`Wave 1 app ${app.slug} must not declare egress origins`);
    }
  }
}

/** Parse the remove-only disable override. Unknown slugs are ignored. */
function disabledSlugs(env: Record<string, string | undefined>): Set<string> {
  const raw = env.DISABLED_APP_SLUGS ?? "";
  return new Set(
    raw
      .split(",")
      .map((slug) => slug.trim())
      .filter((slug) => slug.length > 0),
  );
}

export function enabledApps(
  env: Record<string, string | undefined> = process.env,
): GalleryAppRegistration[] {
  const disabled = disabledSlugs(env);
  return registry.filter(
    (app) => app.enabledByDefault && !disabled.has(app.slug),
  );
}

export function getEnabledApp(
  slug: string,
  env: Record<string, string | undefined> = process.env,
): GalleryAppRegistration | undefined {
  if (!VALID_SLUG.test(slug)) return undefined;
  return enabledApps(env).find((app) => app.slug === slug);
}

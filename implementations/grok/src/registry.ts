import type { McpServer } from "@modelcontextprotocol/server";
import { registerBudgetAllocator } from "./apps/budget-allocator.js";
import { registerCohortHeatmap } from "./apps/cohort-heatmap.js";
import { registerCustomerSegmentation } from "./apps/customer-segmentation.js";
import { registerGetTime } from "./apps/get-time.js";
import { registerScenarioModeler } from "./apps/scenario-modeler.js";
import { registerTranscript } from "./apps/transcript.js";
import { CATALOG, type CatalogEntry } from "./catalog.js";
import { REQUIRED_SLUGS, type AppSlug } from "./constants.js";
import { DEFAULT_APP_CONCURRENCY, Semaphore } from "./limits.js";
import {
  RESOURCE_MIME_TYPE,
  registerAppResource,
  registerAppTool,
} from "./mcp-app-adapter.js";

export type RegisterApp = (
  server: McpServer,
  html: string,
  now: () => Date,
) => void;

export type RuntimeApp = {
  slug: AppSlug;
  enabled: boolean;
  register: RegisterApp;
  concurrency: Semaphore;
  catalog: CatalogEntry;
};

const REGISTRARS: Record<AppSlug, RegisterApp> = {
  "get-time": registerGetTime,
  "budget-allocator": registerBudgetAllocator,
  "cohort-heatmap": registerCohortHeatmap,
  "customer-segmentation": (server, html) =>
    registerCustomerSegmentation(server, html),
  "scenario-modeler": (server, html) => registerScenarioModeler(server, html),
  transcript: (server, html) => registerTranscript(server, html),
};

export function parseDisabledSlugs(value: string | undefined): Set<string> {
  if (!value) return new Set();
  return new Set(
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  );
}

export function createRegistry(options: {
  disabledSlugs?: Iterable<string>;
  throwingSlugs?: Iterable<string>;
  hangingSlugs?: Iterable<string>;
}): RuntimeApp[] {
  const disabled = new Set(options.disabledSlugs);
  const throwing = new Set(options.throwingSlugs);
  const hanging = new Set(options.hangingSlugs);
  const slugs = CATALOG.map((entry) => entry.slug);
  if (slugs.length !== REQUIRED_SLUGS.length) {
    throw new Error("Catalog does not contain the required six slugs");
  }
  const unique = new Set(slugs);
  if (unique.size !== slugs.length)
    throw new Error("Catalog slugs must be unique");
  return CATALOG.map((entry) => {
    const base = REGISTRARS[entry.slug];
    let register: RegisterApp = base;
    if (throwing.has(entry.slug)) {
      register = () => {
        throw new Error(`Forced registration failure for ${entry.slug}`);
      };
    } else if (hanging.has(entry.slug)) {
      register = (server, html) => {
        registerAppTool(
          server,
          entry.toolName,
          {
            title: entry.displayName,
            description: "Test-only hanging tool",
            _meta: { ui: { resourceUri: entry.resourceUri } },
          },
          async (_args, extra) => {
            const signal = extra.signal;
            await new Promise<void>((_, reject) => {
              if (!signal) {
                reject(new Error("missing abort signal"));
                return;
              }
              if (signal.aborted) {
                reject(
                  new DOMException("This operation was aborted", "AbortError"),
                );
                return;
              }
              signal.addEventListener(
                "abort",
                () =>
                  reject(
                    new DOMException(
                      "This operation was aborted",
                      "AbortError",
                    ),
                  ),
                { once: true },
              );
            });
            return { content: [{ type: "text", text: "hung" }] };
          },
        );
        registerAppResource(
          server,
          entry.resourceUri,
          entry.resourceUri,
          { mimeType: RESOURCE_MIME_TYPE },
          async () => ({
            contents: [
              {
                uri: entry.resourceUri,
                mimeType: RESOURCE_MIME_TYPE,
                text: html,
              },
            ],
          }),
        );
      };
    }
    return {
      slug: entry.slug,
      enabled: !disabled.has(entry.slug),
      register,
      concurrency: new Semaphore(DEFAULT_APP_CONCURRENCY),
      catalog: entry,
    };
  });
}

export function findApp(
  apps: RuntimeApp[],
  slug: string,
): RuntimeApp | undefined {
  return apps.find((app) => app.slug === slug);
}

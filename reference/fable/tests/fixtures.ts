/**
 * Test-only fixture apps for abuse and fault-containment cases. These are
 * injected through the application's `extraApps` test hook and never exist in
 * the deployable registry.
 */
import { z } from "zod";
import type { GalleryAppRegistration } from "../src/registry";
import { UPSTREAM_COMMIT, UPSTREAM_REPOSITORY } from "../src/registry";

const BASE = {
  serverVersion: "0.0.0",
  summary: "test fixture",
  interaction: "fixture",
  samplePrompt: "n/a",
  dataNote: "n/a",
  upstream: {
    repository: UPSTREAM_REPOSITORY,
    commit: UPSTREAM_COMMIT,
    path: "tests/fixtures",
  },
  egressOrigins: [],
  enabledByDefault: true,
};

const DEFAULT_LIMITS = {
  requestBytes: 256 * 1024,
  resultBytes: 512 * 1024,
  timeoutMs: 15_000,
  concurrentRequests: 8,
};

/** Sleeps for the requested duration; used for timeout and concurrency tests. */
export function slowApp(
  overrides: Partial<GalleryAppRegistration["limits"]> = {},
): GalleryAppRegistration {
  return {
    ...BASE,
    slug: "fixture-slow",
    displayName: "Fixture Slow",
    serverName: "Fixture Slow Server",
    toolName: "sleep",
    resourceUri: "ui://fixture-slow/none.html",
    limits: { ...DEFAULT_LIMITS, ...overrides },
    register: (server) => {
      server.registerTool(
        "sleep",
        {
          description: "Sleeps for ms milliseconds.",
          inputSchema: z.object({ ms: z.number().min(0).max(60_000) }),
        },
        async ({ ms }: { ms: number }) => {
          await new Promise((resolve) => setTimeout(resolve, ms));
          return { content: [{ type: "text" as const, text: `slept ${ms}` }] };
        },
      );
    },
  };
}

/** Returns a result bigger than the per-app result ceiling. */
export function oversizedApp(): GalleryAppRegistration {
  return {
    ...BASE,
    slug: "fixture-oversized",
    displayName: "Fixture Oversized",
    serverName: "Fixture Oversized Server",
    toolName: "blob",
    resourceUri: "ui://fixture-oversized/none.html",
    limits: { ...DEFAULT_LIMITS },
    register: (server) => {
      server.registerTool(
        "blob",
        { description: "Returns an oversized text blob." },
        async () => ({
          content: [{ type: "text" as const, text: "x".repeat(600 * 1024) }],
        }),
      );
    },
  };
}

/** Registration throws: the failure must stay contained to this app. */
export function brokenApp(): GalleryAppRegistration {
  return {
    ...BASE,
    slug: "fixture-broken",
    displayName: "Fixture Broken",
    serverName: "Fixture Broken Server",
    toolName: "none",
    resourceUri: "ui://fixture-broken/none.html",
    limits: { ...DEFAULT_LIMITS },
    register: () => {
      throw new Error("fixture registration failure");
    },
  };
}

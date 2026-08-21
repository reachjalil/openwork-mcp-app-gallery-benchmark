import {
  Client,
  StreamableHTTPClientTransport,
} from "@modelcontextprotocol/client";
import {
  GALLERY_APPS,
  MODEL_NAMESPACE,
  PROTOCOL_ADAPTER_VERSION,
  RESOURCE_MIME_TYPE,
  UPSTREAM_COMMIT,
} from "../src/catalog.js";

type ProtocolMode = "current" | "legacy";

const deploymentId = process.env.DEPLOYMENT_ID ?? "unlabeled";
const expectedGitSha = process.env.EXPECTED_GIT_SHA ?? "";
const deploymentValue = process.env.DEPLOYMENT_URL ?? "";
const expectedManifestValue =
  process.env.EXPECTED_MANIFEST_ORIGIN ?? deploymentValue;
const protectionBypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function deploymentOrigin(candidate: string): URL {
  const url = new URL(candidate);
  assert(url.protocol === "https:", "Deployment URL must use HTTPS");
  assert(!url.username && !url.password, "Deployment URL has credentials");
  assert(!url.search && !url.hash, "Deployment URL has query or fragment");
  assert(
    url.pathname === "/" || url.pathname === "",
    "Deployment URL must contain only an origin",
  );
  return new URL(url.origin);
}

assert(
  /^[a-f0-9]{40}$/u.test(expectedGitSha),
  "EXPECTED_GIT_SHA must be a full commit SHA",
);
const origin = deploymentOrigin(deploymentValue);
const expectedManifestOrigin = deploymentOrigin(expectedManifestValue);

function target(pathname: string): URL {
  return new URL(pathname, origin);
}

async function checkedFetch(
  pathname: string,
  init?: RequestInit,
): Promise<Response> {
  const headers = new Headers(init?.headers);
  if (protectionBypass)
    headers.set("x-vercel-protection-bypass", protectionBypass);
  return fetch(target(pathname), {
    redirect: "error",
    signal: AbortSignal.timeout(20_000),
    ...init,
    headers,
  });
}

function assertNoStore(response: Response, label: string): void {
  assert(
    response.headers.get("cache-control") === "private, no-store",
    `${label} must be private and no-store`,
  );
}

async function jsonEndpoint<T>(pathname: string, label: string): Promise<T> {
  const response = await checkedFetch(pathname);
  assert(response.status === 200, `${label} did not return 200`);
  assertNoStore(response, label);
  return (await response.json()) as T;
}

async function verifyPublicSurface(): Promise<void> {
  const landing = await checkedFetch("/");
  assert(landing.status === 200, "Landing page did not return 200");
  assert(
    landing.headers
      .get("content-security-policy")
      ?.includes("default-src 'self'"),
    "Landing page is missing its restrictive CSP",
  );
  assert(
    landing.headers.get("x-content-type-options") === "nosniff",
    "Landing page is missing nosniff",
  );
  assert(
    landing.headers.get("referrer-policy") === "no-referrer",
    "Landing page is missing its referrer policy",
  );
  assert(
    landing.headers.get("x-frame-options") === "DENY",
    "Landing page is missing clickjacking protection",
  );
  const landingText = await landing.text();
  assert(
    landingText.includes("Hosted MCP Apps Example Gallery"),
    "Landing page content is incomplete",
  );

  const health = await jsonEndpoint<{ status?: unknown }>(
    "/healthz",
    "Health endpoint",
  );
  assert(health.status === "ok", "Health endpoint is not healthy");

  const ready = await jsonEndpoint<{
    status?: unknown;
    enabledSlugs?: unknown;
    resourceCount?: unknown;
  }>("/readyz", "Readiness endpoint");
  assert(ready.status === "ready", "Readiness endpoint is not ready");
  assert(
    Array.isArray(ready.enabledSlugs) && ready.enabledSlugs.length === 6,
    "Readiness endpoint does not expose six enabled apps",
  );
  assert(ready.resourceCount === 6, "Readiness resource count is not six");

  const version = await jsonEndpoint<{
    gitSha?: unknown;
    upstreamCommit?: unknown;
    modelNamespace?: unknown;
    protocolAdapterVersion?: unknown;
    nodeVersion?: unknown;
    enabledSlugs?: unknown;
  }>("/version", "Version endpoint");
  assert(
    version.gitSha === expectedGitSha,
    "Version SHA is not the expected head",
  );
  assert(
    version.upstreamCommit === UPSTREAM_COMMIT,
    "Version endpoint has the wrong upstream commit",
  );
  assert(
    version.modelNamespace === MODEL_NAMESPACE,
    "Version endpoint has the wrong model namespace",
  );
  assert(
    version.protocolAdapterVersion === PROTOCOL_ADAPTER_VERSION,
    "Version endpoint has the wrong protocol adapter",
  );
  assert(
    typeof version.nodeVersion === "string" &&
      version.nodeVersion.startsWith("v24."),
    "Deployment is not running Node 24",
  );
  assert(
    Array.isArray(version.enabledSlugs) && version.enabledSlugs.length === 6,
    "Version endpoint does not expose six enabled apps",
  );

  const appsResponse = await checkedFetch("/apps.json");
  assert(appsResponse.status === 200, "apps.json did not return 200");
  assert(
    appsResponse.headers.get("cache-control") ===
      "public, max-age=60, must-revalidate",
    "apps.json has the wrong cache policy",
  );
  const manifest = (await appsResponse.json()) as {
    apps?: { slug?: unknown; endpoint?: unknown }[];
  };
  assert(manifest.apps?.length === 6, "apps.json does not contain six apps");
  for (const definition of GALLERY_APPS) {
    const entry = manifest.apps.find(
      (candidate) => candidate.slug === definition.slug,
    );
    assert(entry, `apps.json is missing ${definition.slug}`);
    assert(
      entry.endpoint ===
        new URL(`/apps/${definition.slug}/mcp`, expectedManifestOrigin).href,
      `apps.json has the wrong ${definition.slug} endpoint`,
    );
  }
}

function clientFor(slug: string, mode: ProtocolMode): Client {
  return new Client(
    { name: `gallery-deployment-${mode}-${slug}`, version: "1.0.0" },
    {
      capabilities: {
        extensions: {
          "io.modelcontextprotocol/ui": { mimeTypes: [RESOURCE_MIME_TYPE] },
        },
      },
      versionNegotiation:
        mode === "current"
          ? { mode: { pin: "2026-07-28" } }
          : { mode: "legacy" },
    },
  );
}

async function verifyMcpApps(): Promise<void> {
  for (const mode of ["current", "legacy"] as const) {
    for (const definition of GALLERY_APPS) {
      const client = clientFor(definition.slug, mode);
      try {
        await client.connect(
          new StreamableHTTPClientTransport(
            target(`/apps/${definition.slug}/mcp`),
            {
              requestInit: protectionBypass
                ? {
                    headers: {
                      "x-vercel-protection-bypass": protectionBypass,
                    },
                  }
                : undefined,
            },
          ),
        );
        const listed = await client.listTools();
        assert(
          listed.tools.length === 1 &&
            listed.tools[0]?.name === definition.toolName,
          `${definition.slug} did not expose its one isolated tool in ${mode} mode`,
        );
        const tool = listed.tools[0];
        const uiMetadata = tool?._meta?.ui as
          { resourceUri?: unknown } | undefined;
        assert(
          uiMetadata?.resourceUri === definition.resourceUri &&
            tool?._meta?.["ui/resourceUri"] === definition.resourceUri,
          `${definition.slug} tool metadata is incomplete in ${mode} mode`,
        );
        const result = await client.callTool({
          name: definition.toolName,
          arguments: {},
        });
        assert(
          result.isError !== true && result.content.length > 0,
          `${definition.slug} tool failed in ${mode} mode`,
        );
        const resourceResult = await client.readResource({
          uri: definition.resourceUri,
        });
        const resource = resourceResult.contents[0];
        assert(
          resource && "text" in resource,
          `${definition.slug} resource was not text in ${mode} mode`,
        );
        assert(
          resource.mimeType === RESOURCE_MIME_TYPE &&
            /^<!doctype html>/iu.test(resource.text) &&
            new TextEncoder().encode(resource.text).byteLength <=
              definition.resultBytes,
          `${definition.slug} resource contract failed in ${mode} mode`,
        );
      } finally {
        await client.close().catch(() => undefined);
      }
    }
  }
}

async function verifyBoundaries(): Promise<void> {
  const commonHeaders = {
    Accept: "application/json, text/event-stream",
    "Content-Type": "application/json",
  };
  const malformed = await checkedFetch("/apps/get-time/mcp", {
    method: "POST",
    headers: commonHeaders,
    body: "{",
  });
  assert(
    malformed.status >= 400 && malformed.status < 500,
    "Malformed JSON was accepted",
  );
  assertNoStore(malformed, "Malformed JSON response");
  assert(
    !/stack|node_modules|\/Users\//u.test(await malformed.text()),
    "Malformed JSON response leaked internals",
  );

  const unknown = await checkedFetch("/apps/not-a-gallery-app/mcp", {
    method: "POST",
    headers: commonHeaders,
    body: "{}",
  });
  assert(unknown.status === 404, "Unknown app was not rejected");
  assertNoStore(unknown, "Unknown-app response");

  const disallowed = await checkedFetch("/apps/get-time/mcp", {
    method: "DELETE",
    headers: commonHeaders,
  });
  assert(disallowed.status === 405, "Disallowed method was not rejected");
  assert(
    disallowed.headers.get("allow") === "GET, POST, OPTIONS",
    "Disallowed method response has the wrong Allow header",
  );

  const oversized = await checkedFetch("/apps/get-time/mcp", {
    method: "POST",
    headers: commonHeaders,
    body: "x".repeat(GALLERY_APPS[0]!.requestBytes + 1),
  });
  assert(oversized.status === 413, "Oversized request was not rejected");

  const controller = new AbortController();
  controller.abort("deployment cancellation probe");
  await fetch(target("/apps/get-time/mcp"), {
    method: "POST",
    headers: {
      ...commonHeaders,
      ...(protectionBypass
        ? { "x-vercel-protection-bypass": protectionBypass }
        : {}),
    },
    body: "{}",
    signal: controller.signal,
  }).catch(() => undefined);
  const healthAfterAbort = await checkedFetch("/healthz");
  assert(
    healthAfterAbort.status === 200,
    "Deployment was unhealthy after abort",
  );
}

async function main(): Promise<void> {
  await verifyPublicSurface();
  await verifyMcpApps();
  await verifyBoundaries();
  process.stdout.write(
    `${JSON.stringify({
      deploymentId,
      gitSha: expectedGitSha,
      checks: {
        publicSurface: "passed",
        currentProtocolApps: 6,
        legacyProtocolApps: 6,
        boundaries: "passed",
        postAbortHealth: "passed",
      },
    })}\n`,
  );
}

main().catch((error: unknown) => {
  const unsafe =
    error instanceof Error ? error.message : "Unknown verification failure";
  const safe = unsafe
    .replaceAll(origin.href, "<deployment>/")
    .replaceAll(origin.origin, "<deployment>");
  process.stderr.write(`Deployment verification failed: ${safe}\n`);
  process.exitCode = 1;
});

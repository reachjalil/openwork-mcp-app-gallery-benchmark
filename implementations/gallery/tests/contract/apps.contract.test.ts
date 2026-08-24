/**
 * Six-app contract matrix over both protocol eras:
 *
 * - legacy 2025-era stateless Streamable HTTP: initialize, tools/list,
 *   representative tools/call, fallback content, resources/read with the
 *   exact MCP Apps MIME profile, invalid input;
 * - modern 2026-07-28: the same list/call/read against the per-request
 *   envelope path with JSON responses;
 * - cross-app isolation: no tool name or resource URI leaks across slugs;
 * - repeated protocol cycles stay stable.
 */
import { describe, expect, it } from "vitest";
import {
  MODERN_PROTOCOL,
  RESOURCE_MIME,
  legacyCall,
  legacyInitialize,
  modernRequest,
  resultOf,
  testApplication,
} from "../helpers";

const app = testApplication();

interface AppCase {
  slug: string;
  toolName: string;
  resourceUri: string;
  callArguments: Record<string, unknown>;
  /** Substring expected in the ordinary text fallback of the tool result. */
  fallbackIncludes: string;
  expectStructured: boolean;
  invalidArguments?: Record<string, unknown>;
}

const CASES: AppCase[] = [
  {
    slug: "get-time",
    toolName: "get-time",
    resourceUri: "ui://get-time/mcp-app.html",
    callArguments: {},
    fallbackIncludes: "T",
    expectStructured: false,
  },
  {
    slug: "budget-allocator",
    toolName: "get-budget-data",
    resourceUri: "ui://budget-allocator/mcp-app.html",
    callArguments: {},
    fallbackIncludes: "Budget Allocator Configuration",
    expectStructured: true,
  },
  {
    slug: "cohort-heatmap",
    toolName: "get-cohort-data",
    resourceUri: "ui://get-cohort-data/mcp-app.html",
    callArguments: { metric: "retention", cohortCount: 6, maxPeriods: 6 },
    fallbackIncludes: "Cohort Analysis",
    expectStructured: true,
    invalidArguments: { cohortCount: 100 },
  },
  {
    slug: "customer-segmentation",
    toolName: "get-customer-data",
    resourceUri: "ui://customer-segmentation/mcp-app.html",
    callArguments: { segment: "Enterprise" },
    fallbackIncludes: "customers",
    expectStructured: true,
    invalidArguments: { segment: "Bogus" },
  },
  {
    slug: "scenario-modeler",
    toolName: "get-scenario-data",
    resourceUri: "ui://scenario-modeler/mcp-app.html",
    callArguments: {
      customInputs: {
        startingMRR: 50_000,
        monthlyGrowthRate: 5,
        monthlyChurnRate: 3,
        grossMargin: 80,
        fixedCosts: 30_000,
      },
    },
    fallbackIncludes: "SaaS Scenario Modeler",
    expectStructured: true,
    invalidArguments: { customInputs: { startingMRR: "not-a-number" } },
  },
  {
    slug: "transcript",
    toolName: "transcribe",
    resourceUri: "ui://transcript/mcp-app.html",
    callArguments: {},
    fallbackIncludes: "ready",
    expectStructured: false,
  },
];

interface ToolEntry {
  name: string;
  _meta?: Record<string, unknown>;
  [key: string]: unknown;
}

function toolsOf(result: Record<string, unknown>): ToolEntry[] {
  return result.tools as ToolEntry[];
}

describe.each(CASES)("$slug", (appCase) => {
  describe("legacy 2025-era stateless", () => {
    it("initializes with protocol negotiation and capabilities", async () => {
      // A supported requested revision is echoed back…
      const response = await legacyInitialize(app, appCase.slug, "2025-11-25");
      expect(response.status).toBe(200);
      const result = resultOf(response);
      expect(result.protocolVersion).toBe("2025-11-25");
      expect(result.capabilities).toMatchObject({ tools: {}, resources: {} });
      const older = await legacyInitialize(app, appCase.slug, "2025-06-18");
      expect(resultOf(older).protocolVersion).toBe("2025-06-18");
      // …and an unknown-future request negotiates down to the server's latest.
      const future = await legacyInitialize(app, appCase.slug, "2027-01-01");
      expect(resultOf(future).protocolVersion).toBe("2025-11-25");
    });

    it("lists exactly its own tool with UI metadata", async () => {
      const response = await legacyCall(app, appCase.slug, "tools/list");
      const tools = toolsOf(resultOf(response));
      expect(tools.map((tool) => tool.name)).toEqual([appCase.toolName]);
      const meta = tools[0]._meta ?? {};
      expect((meta.ui as { resourceUri?: string }).resourceUri).toBe(
        appCase.resourceUri,
      );
      expect(meta["ui/resourceUri"]).toBe(appCase.resourceUri);
    });

    it("serves a representative tools/call with ordinary fallback", async () => {
      const response = await legacyCall(app, appCase.slug, "tools/call", {
        name: appCase.toolName,
        arguments: appCase.callArguments,
      });
      const result = resultOf(response);
      expect(result.isError).toBeFalsy();
      const content = result.content as Array<{ type: string; text?: string }>;
      expect(content[0].type).toBe("text");
      expect(content[0].text).toContain(appCase.fallbackIncludes);
      if (appCase.expectStructured) {
        expect(result.structuredContent).toBeTypeOf("object");
      }
    });

    it("serves resources/read with the exact MCP Apps MIME profile", async () => {
      const response = await legacyCall(app, appCase.slug, "resources/read", {
        uri: appCase.resourceUri,
      });
      const contents = resultOf(response).contents as Array<{
        uri: string;
        mimeType: string;
        text: string;
      }>;
      expect(contents).toHaveLength(1);
      expect(contents[0].uri).toBe(appCase.resourceUri);
      expect(contents[0].mimeType).toBe(RESOURCE_MIME);
      expect(contents[0].text.toLowerCase()).toContain("<!doctype html");
      expect(contents[0].text.length).toBeLessThanOrEqual(1024 * 1024);
    });

    if (appCase.invalidArguments) {
      it("rejects schema-invalid input without leaking internals", async () => {
        const response = await legacyCall(app, appCase.slug, "tools/call", {
          name: appCase.toolName,
          arguments: appCase.invalidArguments,
        });
        const failed =
          response.body?.error !== undefined ||
          (response.body?.result as { isError?: boolean } | undefined)
            ?.isError === true;
        expect(failed).toBe(true);
        expect(response.raw).not.toContain("    at "); // no stack frames
      });
    }
  });

  describe("modern 2026-07-28", () => {
    it("lists exactly its own tool", async () => {
      const response = await modernRequest(app, appCase.slug, "tools/list");
      expect(response.status).toBe(200);
      expect(response.contentType).toContain("application/json");
      const tools = toolsOf(resultOf(response));
      expect(tools.map((tool) => tool.name)).toEqual([appCase.toolName]);
      expect(
        ((tools[0]._meta ?? {}).ui as { resourceUri?: string }).resourceUri,
      ).toBe(appCase.resourceUri);
    });

    it("serves tools/call", async () => {
      const response = await modernRequest(
        app,
        appCase.slug,
        "tools/call",
        { name: appCase.toolName, arguments: appCase.callArguments },
        { name: appCase.toolName },
      );
      expect(response.status).toBe(200);
      const result = resultOf(response);
      const content = result.content as Array<{ type: string; text?: string }>;
      expect(content[0].type).toBe("text");
      expect(content[0].text).toContain(appCase.fallbackIncludes);
    });

    it("serves resources/read", async () => {
      const response = await modernRequest(
        app,
        appCase.slug,
        "resources/read",
        { uri: appCase.resourceUri },
        { name: appCase.resourceUri },
      );
      expect(response.status).toBe(200);
      const contents = resultOf(response).contents as Array<{
        mimeType: string;
        text: string;
      }>;
      expect(contents[0].mimeType).toBe(RESOURCE_MIME);
      expect(contents[0].text.toLowerCase()).toContain("<!doctype html");
    });

    it("negotiates via server/discover", async () => {
      const response = await modernRequest(
        app,
        appCase.slug,
        "server/discover",
      );
      expect(resultOf(response).supportedVersions).toEqual([MODERN_PROTOCOL]);
    });
  });
});

describe("cross-app isolation", () => {
  it("never exposes another app's tool or resource", async () => {
    for (const appCase of CASES) {
      const listed = toolsOf(
        resultOf(await legacyCall(app, appCase.slug, "tools/list")),
      ).map((tool) => tool.name);
      expect(listed).toEqual([appCase.toolName]);

      for (const other of CASES) {
        if (other.slug === appCase.slug) continue;
        const call = await legacyCall(app, appCase.slug, "tools/call", {
          name: other.toolName,
          arguments: {},
        });
        const failed =
          call.body?.error !== undefined ||
          (call.body?.result as { isError?: boolean } | undefined)?.isError ===
            true;
        expect(
          failed,
          `${other.toolName} must not exist on ${appCase.slug}`,
        ).toBe(true);

        const read = await legacyCall(app, appCase.slug, "resources/read", {
          uri: other.resourceUri,
        });
        expect(
          read.body?.error,
          `${other.resourceUri} must not be readable on ${appCase.slug}`,
        ).toBeDefined();
      }
    }
  });

  it("keeps the deterministic dataset identical across repeated calls", async () => {
    const first = resultOf(
      await legacyCall(app, "customer-segmentation", "tools/call", {
        name: "get-customer-data",
        arguments: {},
      }),
    ).structuredContent;
    const second = resultOf(
      await legacyCall(app, "customer-segmentation", "tools/call", {
        name: "get-customer-data",
        arguments: {},
      }),
    ).structuredContent;
    expect(second).toEqual(first);
  });

  it("survives repeated initialize/list/call/read cycles", async () => {
    for (let cycle = 0; cycle < 5; cycle += 1) {
      const appCase = CASES[cycle % CASES.length];
      expect((await legacyInitialize(app, appCase.slug)).status).toBe(200);
      expect((await legacyCall(app, appCase.slug, "tools/list")).status).toBe(
        200,
      );
      const call = await legacyCall(app, appCase.slug, "tools/call", {
        name: appCase.toolName,
        arguments: appCase.callArguments,
      });
      expect(call.status).toBe(200);
      const read = await legacyCall(app, appCase.slug, "resources/read", {
        uri: appCase.resourceUri,
      });
      expect(read.status).toBe(200);
    }
  });

  it("serves 20 concurrent representative clients without leakage", async () => {
    const requests = Array.from({ length: 20 }, (_, index) => {
      const appCase = CASES[index % CASES.length];
      return legacyCall(app, appCase.slug, "tools/list").then((response) => ({
        appCase,
        response,
      }));
    });
    const settled = await Promise.all(requests);
    for (const { appCase, response } of settled) {
      expect(response.status).toBe(200);
      const tools = toolsOf(resultOf(response)).map((tool) => tool.name);
      expect(tools).toEqual([appCase.toolName]);
    }
  });
});

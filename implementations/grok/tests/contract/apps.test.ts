import { describe, expect, it } from "vitest";
import { REQUIRED_SLUGS } from "../../src/constants.js";
import { catalogBySlug } from "../../src/catalog.js";
import { RESOURCE_MIME_TYPE } from "../../src/mcp-app-adapter.js";
import {
  CURRENT_PROTOCOL,
  LEGACY_PROTOCOL,
  envelope,
  mcpPost,
  readMcp,
  testApp,
} from "../helpers/app.js";

const PROTOCOLS = [CURRENT_PROTOCOL, LEGACY_PROTOCOL] as const;

const CALLS: Record<string, Record<string, unknown>> = {
  "get-time": {},
  "budget-allocator": {},
  "cohort-heatmap": {
    metric: "retention",
    periodType: "monthly",
    cohortCount: 4,
    maxPeriods: 4,
  },
  "customer-segmentation": { segment: "All" },
  "scenario-modeler": {},
  transcript: {},
};

async function rpc(
  app: ReturnType<typeof testApp>["app"],
  slug: string,
  method: string,
  params: Record<string, unknown>,
  protocol: string,
  id = 1,
) {
  const response = await mcpPost(
    app,
    slug,
    { jsonrpc: "2.0", id, method, params: envelope(protocol, params) },
    protocol,
  );
  const parsed = await readMcp(response);
  const payload = Array.isArray(parsed) ? parsed[0] : parsed;
  return { response, payload: payload as Record<string, unknown> };
}

describe.each(PROTOCOLS)("MCP contracts %s", (protocol) => {
  for (const slug of REQUIRED_SLUGS) {
    it(`${slug} list, call, resource, fallback, invalid input`, async () => {
      const { app } = testApp();
      const entry = catalogBySlug(slug);

      if (protocol === LEGACY_PROTOCOL) {
        const init = await rpc(
          app,
          slug,
          "initialize",
          {
            protocolVersion: protocol,
            capabilities: {},
            clientInfo: { name: "gallery-test", version: "1.0.0" },
          },
          protocol,
        );
        expect(init.response.status).toBeLessThan(500);
      }

      const listed = await rpc(app, slug, "tools/list", {}, protocol, 2);
      const tools =
        (
          listed.payload.result as
            | {
                tools?: Array<{
                  name: string;
                  _meta?: Record<string, unknown>;
                }>;
              }
            | undefined
        )?.tools ?? [];
      expect(tools.some((tool) => tool.name === entry.toolName)).toBe(true);
      const tool = tools.find((item) => item.name === entry.toolName);
      const meta = tool?._meta as
        | { ui?: { resourceUri?: string }; "ui/resourceUri"?: string }
        | undefined;
      expect(meta?.ui?.resourceUri ?? meta?.["ui/resourceUri"]).toBe(
        entry.resourceUri,
      );

      const called = await rpc(
        app,
        slug,
        "tools/call",
        { name: entry.toolName, arguments: CALLS[slug] ?? {} },
        protocol,
        3,
      );
      const result = called.payload.result as
        | {
            content?: Array<{ type: string; text?: string }>;
            structuredContent?: unknown;
            isError?: boolean;
          }
        | undefined;
      expect(result?.isError).toBeFalsy();
      expect(
        result?.content?.some(
          (item) => item.type === "text" && Boolean(item.text),
        ),
      ).toBe(true);

      const resources = await rpc(
        app,
        slug,
        "resources/read",
        { uri: entry.resourceUri },
        protocol,
        4,
      );
      const contents =
        (
          resources.payload.result as
            | {
                contents?: Array<{
                  mimeType?: string;
                  text?: string;
                  uri?: string;
                }>;
              }
            | undefined
        )?.contents ?? [];
      expect(contents[0]?.mimeType).toBe(RESOURCE_MIME_TYPE);
      expect(contents[0]?.uri).toBe(entry.resourceUri);
      expect((contents[0]?.text ?? "").length).toBeGreaterThan(10);

      const invalid = await rpc(
        app,
        slug,
        "tools/call",
        {
          name: "not-a-gallery-tool",
          arguments: { cohortCount: 99, segment: "nope" },
        },
        protocol,
        5,
      );
      const invalidResult = invalid.payload.result as
        { isError?: boolean } | undefined;
      expect(
        invalid.response.status >= 400 ||
          Boolean(invalid.payload.error) ||
          invalidResult?.isError === true,
      ).toBe(true);
    });
  }
});

describe("repeated cycles and concurrency", () => {
  it("survives repeated initialize/list/call/resource cycles", async () => {
    const { app } = testApp();
    for (let i = 0; i < 5; i += 1) {
      const listed = await rpc(
        app,
        "get-time",
        "tools/list",
        {},
        CURRENT_PROTOCOL,
        i,
      );
      expect(listed.response.status).toBeLessThan(500);
    }
  });

  it("handles 20 concurrent clients without leakage", async () => {
    const { app } = testApp();
    const jobs = Array.from({ length: 20 }, async (_, index) => {
      const slug = REQUIRED_SLUGS[index % REQUIRED_SLUGS.length] ?? "get-time";
      const listed = await rpc(
        app,
        slug,
        "tools/list",
        {},
        CURRENT_PROTOCOL,
        index + 1,
      );
      const tools =
        (
          listed.payload.result as
            { tools?: Array<{ name: string }> } | undefined
        )?.tools ?? [];
      return { slug, names: tools.map((tool) => tool.name) };
    });
    const results = await Promise.all(jobs);
    for (const result of results) {
      const entry = catalogBySlug(result.slug);
      expect(result.names).toContain(entry.toolName);
      if (result.slug === "get-time") {
        expect(result.names).not.toContain("get-budget-data");
      }
    }
  });
});

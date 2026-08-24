import {
  Client,
  StreamableHTTPClientTransport,
  type FetchLike,
} from "@modelcontextprotocol/client";
import { afterEach, describe, expect, it } from "vitest";
import { createApplication } from "../../src/application.js";
import { GALLERY_APPS, RESOURCE_MIME_TYPE } from "../../src/catalog.js";

const baseUrl = new URL("http://127.0.0.1:4173");
const application = createApplication({ BASE_URL: baseUrl.href });
const openClients: Client[] = [];

const inProcessFetch: FetchLike = async (input, init) => {
  const request =
    input instanceof Request
      ? new Request(input, init)
      : new Request(input, init);
  return application.fetch(request);
};

type ProtocolMode = "current" | "legacy";

function clientFor(slug: string, mode: ProtocolMode): Client {
  const client = new Client(
    { name: `gallery-contract-${mode}-${slug}`, version: "1.0.0" },
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
  openClients.push(client);
  return client;
}

async function connect(slug: string, mode: ProtocolMode): Promise<Client> {
  const client = clientFor(slug, mode);
  const transport = new StreamableHTTPClientTransport(
    new URL(`/apps/${slug}/mcp`, baseUrl),
    { fetch: inProcessFetch },
  );
  await client.connect(transport);
  return client;
}

afterEach(async () => {
  await Promise.allSettled(
    openClients.splice(0).map(async (client) => client.close()),
  );
});

for (const mode of ["current", "legacy"] as const) {
  describe(`${mode} MCP protocol contract`, () => {
    for (const definition of GALLERY_APPS) {
      it(`${definition.slug} exposes one isolated tool and its MCP App resource`, async () => {
        const client = await connect(definition.slug, mode);
        const listed = await client.listTools();

        expect(listed.tools).toHaveLength(1);
        expect(listed.tools[0]?.name).toBe(definition.toolName);
        expect(listed.tools[0]?._meta).toMatchObject({
          ui: { resourceUri: definition.resourceUri },
          "ui/resourceUri": definition.resourceUri,
        });

        const called = await client.callTool({
          name: definition.toolName,
          arguments: {},
        });
        expect(called.isError).not.toBe(true);
        expect(called.content.length).toBeGreaterThan(0);
        expect(called.structuredContent).toBeTypeOf("object");

        const read = await client.readResource({ uri: definition.resourceUri });
        expect(read.contents).toHaveLength(1);
        const resource = read.contents[0];
        if (!resource || !("text" in resource))
          throw new Error("Expected an MCP App text resource");
        expect(resource?.uri).toBe(definition.resourceUri);
        expect(resource?.mimeType).toBe(RESOURCE_MIME_TYPE);
        expect(resource.text).toMatch(/^<!doctype html>/iu);
        expect(resource.text).toContain('<script type="module"');
        expect(resource.text).toContain("</html>");
        expect(Buffer.byteLength(resource.text, "utf8")).toBeLessThanOrEqual(
          definition.resultBytes,
        );
      });

      it(`${definition.slug} rejects another app's resource URI`, async () => {
        const client = await connect(definition.slug, mode);
        const foreign = GALLERY_APPS.find(
          (candidate) => candidate.slug !== definition.slug,
        );
        await expect(
          client.readResource({
            uri: foreign?.resourceUri ?? "ui://foreign/mcp-app.html",
          }),
        ).rejects.toThrow();
      });
    }
  });
}

describe("representative host lifecycle", () => {
  for (const mode of ["current", "legacy"] as const) {
    it(`${mode} client receives a bounded invalid-input error`, async () => {
      const definition = GALLERY_APPS.find(
        (candidate) => candidate.slug === "cohort-heatmap",
      )!;
      const client = await connect(definition.slug, mode);
      const result = await client.callTool({
        name: definition.toolName,
        arguments: { cohortCount: 99 },
      });
      expect(result.isError).toBe(true);
      expect(JSON.stringify(result)).not.toMatch(
        /stack|node_modules|\/Users\//u,
      );
    });
  }

  it("survives 20 simultaneous stateless clients", async () => {
    const results = await Promise.all(
      Array.from({ length: 20 }, async (_value, index) => {
        const definition = GALLERY_APPS[index % GALLERY_APPS.length]!;
        const client = await connect(
          definition.slug,
          index % 2 === 0 ? "current" : "legacy",
        );
        return client.callTool({ name: definition.toolName, arguments: {} });
      }),
    );
    expect(results).toHaveLength(20);
    expect(results.every((result) => result.isError !== true)).toBe(true);
  });

  it("reconnects and calls repeatedly without session leakage", async () => {
    const definition = GALLERY_APPS[1]!;
    for (let index = 0; index < 8; index += 1) {
      const client = await connect(
        definition.slug,
        index % 2 === 0 ? "current" : "legacy",
      );
      const result = await client.callTool({
        name: definition.toolName,
        arguments: {},
      });
      expect(result.isError).not.toBe(true);
      await client.close();
    }
  });
});

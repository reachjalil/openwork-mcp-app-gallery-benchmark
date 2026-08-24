// [gallery modification] Imports adapted for the hosted gallery: MCP SDK v2
// (@modelcontextprotocol/server) replaces SDK v1, the gallery-owned adapter
// replaces @modelcontextprotocol/ext-apps/server, and the UI HTML is read from
// the immutable bundled resource store instead of the local filesystem.
import {
  registerAppResource,
  registerAppTool,
  RESOURCE_MIME_TYPE,
  readBundledAppHtml,
} from "../../../src/mcp-app-adapter.js";
import type { McpServer } from "@modelcontextprotocol/server";
import type { CallToolResult, ReadResourceResult } from "@modelcontextprotocol/server";

/**
 * Registers this example's tools and resources on the given MCP server.
 *
 * [gallery modification] Upstream `createServer()` constructed its own SDK v1
 * `McpServer`. The hosted gallery's handler constructs one SDK v2 server per
 * request (carrying this example's name and version), so this function now
 * receives that server and performs the same registrations on it.
 */
export function registerApp(server: McpServer): McpServer {
  // Two-part registration: tool + resource, tied together by the resource URI.
  const resourceUri = "ui://get-time/mcp-app.html";

  // Register a tool with UI metadata. When the host calls this tool, it reads
  // `_meta.ui.resourceUri` to know which resource to fetch and render as an
  // interactive UI.
  registerAppTool(server,
    "get-time",
    {
      title: "Get Time",
      description: "Returns the current server time as an ISO 8601 string.",
      inputSchema: {},
      _meta: { ui: { resourceUri } }, // Links this tool to its UI resource
    },
    async (): Promise<CallToolResult> => {
      const time = new Date().toISOString();
      return { content: [{ type: "text", text: time }] };
    },
  );

  // Register the resource, which returns the bundled HTML/JavaScript for the UI.
  registerAppResource(server,
    resourceUri,
    resourceUri,
    { mimeType: RESOURCE_MIME_TYPE },
    async (): Promise<ReadResourceResult> => {
      const html = readBundledAppHtml("get-time");
      return {
        contents: [{ uri: resourceUri, mimeType: RESOURCE_MIME_TYPE, text: html }],
      };
    },
  );

  return server;
}

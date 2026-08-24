// [gallery modification] Imports adapted for the hosted gallery: MCP SDK v2
// (@modelcontextprotocol/server) replaces SDK v1, the gallery-owned adapter
// replaces @modelcontextprotocol/ext-apps/server, and the UI HTML is read from
// the immutable bundled resource store instead of the local filesystem.
import type {
  McpServer,
  CallToolResult,
  ReadResourceResult,
} from "@modelcontextprotocol/server";
import {
  registerAppTool,
  registerAppResource,
  RESOURCE_MIME_TYPE,
  readBundledAppHtml,
} from "../../../src/mcp-app-adapter.js";
const resourceUri = "ui://transcript/mcp-app.html";

/**
 * Registers this example's tools and resources on the given MCP server.
 *
 * [gallery modification] Upstream `createServer()` constructed its own SDK v1
 * `McpServer`. The hosted gallery's handler constructs one SDK v2 server per
 * request (carrying this example's name and version), so this function now
 * receives that server and performs the same registrations on it.
 */
export function registerApp(server: McpServer): McpServer {
  // Register the transcribe tool - opens a UI for live speech transcription
  registerAppTool(
    server,
    "transcribe",
    {
      title: "Transcribe Speech",
      description:
        "Opens a live speech transcription interface using the Web Speech API.",
      inputSchema: {},
      _meta: { ui: { resourceUri } },
    },
    async (): Promise<CallToolResult> => {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              status: "ready",
              message: "Transcription UI opened. Speak into your microphone.",
            }),
          },
        ],
      };
    },
  );

  // Register the UI resource
  registerAppResource(
    server,
    resourceUri,
    resourceUri,
    { mimeType: RESOURCE_MIME_TYPE, description: "Transcript UI" },
    async (): Promise<ReadResourceResult> => {
      const html = readBundledAppHtml("transcript");

      return {
        contents: [
          {
            uri: resourceUri,
            mimeType: RESOURCE_MIME_TYPE,
            text: html,
            _meta: {
              ui: {
                // Request microphone for Web Speech API, clipboard for copy button
                permissions: { microphone: {}, clipboardWrite: {} },
              },
            },
          },
        ],
      };
    },
  );

  return server;
}

import type { McpServer } from "@modelcontextprotocol/server";
import {
  RESOURCE_MIME_TYPE,
  registerAppResource,
  registerAppTool,
} from "../mcp-app-adapter.js";

export function registerGetTime(
  server: McpServer,
  html: string,
  now: () => Date,
): void {
  const resourceUri = "ui://get-time/mcp-app.html";
  registerAppTool(
    server,
    "get-time",
    {
      title: "Get Time",
      description: "Returns the current server time as an ISO 8601 string.",
      _meta: { ui: { resourceUri } },
    },
    async () => {
      const time = now().toISOString();
      return { content: [{ type: "text", text: time }] };
    },
  );
  registerAppResource(
    server,
    resourceUri,
    resourceUri,
    { mimeType: RESOURCE_MIME_TYPE },
    async () => ({
      contents: [
        { uri: resourceUri, mimeType: RESOURCE_MIME_TYPE, text: html },
      ],
    }),
  );
}

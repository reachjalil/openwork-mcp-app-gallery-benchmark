import type { McpServer } from "@modelcontextprotocol/server";
import {
  RESOURCE_MIME_TYPE,
  appResourceUiMeta,
  registerAppResource,
  registerAppTool,
} from "../mcp-app-adapter.js";

export function registerTranscript(server: McpServer, html: string): void {
  const resourceUri = "ui://transcript/mcp-app.html";
  registerAppTool(
    server,
    "transcribe",
    {
      title: "Transcribe Speech",
      description:
        "Opens a live speech transcription interface using the Web Speech API.",
      _meta: { ui: { resourceUri } },
    },
    async () => ({
      content: [
        {
          type: "text",
          text: JSON.stringify({
            status: "ready",
            message: "Transcription UI opened. Speak into your microphone.",
          }),
        },
      ],
    }),
  );
  registerAppResource(
    server,
    resourceUri,
    resourceUri,
    { mimeType: RESOURCE_MIME_TYPE, description: "Transcript UI" },
    async () => ({
      contents: [
        {
          uri: resourceUri,
          mimeType: RESOURCE_MIME_TYPE,
          text: html,
          _meta: appResourceUiMeta({
            permissions: { microphone: {}, clipboardWrite: {} },
          }),
        },
      ],
    }),
  );
}

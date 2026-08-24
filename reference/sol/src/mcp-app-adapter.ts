import type { McpServer } from "@modelcontextprotocol/server";
import { createMcpHandler } from "mcp-handler";
import type { GalleryAppDefinition } from "./catalog.js";
import { registerGalleryApp } from "./apps.js";

export type McpFetchHandler = (request: Request) => Promise<Response>;
export type RegisterApp = (
  server: McpServer,
  app: GalleryAppDefinition,
) => void;

export function createGalleryMcpHandler(
  app: GalleryAppDefinition,
  register: RegisterApp = registerGalleryApp,
): McpFetchHandler {
  return createMcpHandler(
    (server) => {
      register(server, app);
    },
    {
      serverInfo: {
        name: `openwork-mcp-app-gallery-${app.slug}`,
        version: "1.0.0",
      },
      instructions: `Independent hosted adaptation of the ${app.displayName} official MCP Apps example. Synthetic, stateless, and request-bounded.`,
      maxSubscriptions: 0,
      verboseLogs: false,
    },
  );
}

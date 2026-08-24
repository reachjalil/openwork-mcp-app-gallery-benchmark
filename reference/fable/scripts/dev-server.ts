/**
 * Local development server: serves the Hono application plus the generated
 * static gallery from public/ (which Vercel's CDN serves in deployment).
 * Run `pnpm dev` (builds resources and the site first).
 */
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { createApplication } from "../src/application";

const port = Number(process.env.PORT ?? 3000);
process.env.BASE_URL = process.env.BASE_URL ?? `http://localhost:${port}`;

const { app } = createApplication();

const server = new Hono();
server.route("/", app);
server.use("/*", serveStatic({ root: "./public" }));

serve({ fetch: server.fetch, port }, (info) => {
  console.log(`gallery dev server: http://localhost:${info.port}`);
  console.log(`  /            gallery page (from public/)`);
  console.log(`  /apps.json   machine manifest`);
  console.log(`  /apps/<slug>/mcp  MCP endpoints`);
});

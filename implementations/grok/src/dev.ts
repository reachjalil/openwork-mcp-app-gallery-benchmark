import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { createGalleryApplication } from "./application.js";

const application = createGalleryApplication();
application.app.use("/*", serveStatic({ root: "./public" }));

const port = Number(process.env.PORT ?? "8787");
const hostname = process.env.HOST ?? "127.0.0.1";

serve({ fetch: application.app.fetch, port, hostname }, (info) => {
  console.info(`gallery listening on http://${info.address}:${info.port}`);
});

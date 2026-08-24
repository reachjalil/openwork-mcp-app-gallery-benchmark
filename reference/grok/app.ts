import { Hono } from "hono";
import { createGalleryApplication } from "./src/application.js";

const application = createGalleryApplication();
if (!(application.app instanceof Hono)) {
  throw new TypeError("Vercel entrypoint requires a Hono application");
}

export default application.app;

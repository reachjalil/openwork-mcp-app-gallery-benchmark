/**
 * The only Vercel-recognized Hono entrypoint for the gallery.
 */
import type { Hono } from "hono";
import { createApplication } from "./src/application.js";

const application: { app: Hono } = createApplication();

export default application.app;

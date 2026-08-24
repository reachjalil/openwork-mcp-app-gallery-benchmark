/**
 * Gallery-owned MCP Apps registration adapter for MCP SDK v2.
 *
 * The pinned upstream examples register tools and resources through
 * `@modelcontextprotocol/ext-apps/server`, which targets MCP SDK v1
 * (`@modelcontextprotocol/sdk`). The hosted gallery serves through
 * `mcp-handler` 2.x on `@modelcontextprotocol/server` (SDK v2). Passing an
 * SDK v1 server into the v2 stack is not supported, so this thin adapter
 * reproduces the upstream helper semantics on the v2 `McpServer`:
 *
 * - `_meta.ui.resourceUri` and the legacy `_meta["ui/resourceUri"]` key are
 *   normalized in both directions, exactly as upstream does;
 * - the MCP Apps MIME type defaults to `text/html;profile=mcp-app`;
 * - raw Zod shapes (the upstream `Schema.shape` idiom) are wrapped with
 *   `z.object(...)` so registration uses the non-deprecated v2 overload while
 *   emitting the same JSON Schema to clients.
 *
 * It also exposes `readBundledAppHtml`, which replaces the upstream examples'
 * local `fs.readFile(dist/mcp-app.html)` with a lookup in the immutable
 * bundled resource store shipped inside the Vercel function.
 */
import { z } from "zod";
import type {
  McpServer,
  RegisteredResource,
  RegisteredTool,
  ResourceMetadata,
  ToolAnnotations,
  CallToolResult,
  ReadResourceResult,
} from "@modelcontextprotocol/server";
import { getBundledResourceHtml } from "./resources.js";

/** MCP Apps UI resource MIME type (must match the MCP Apps specification). */
export const RESOURCE_MIME_TYPE = "text/html;profile=mcp-app";

/** Legacy flat `_meta` key for the UI resource URI (backward compatibility). */
export const RESOURCE_URI_META_KEY = "ui/resourceUri";

/** A raw Zod shape, the upstream `Schema.shape` registration idiom. */
type RawShape = Record<string, z.ZodType>;

type SchemaLike = RawShape | z.ZodObject<z.ZodRawShape>;

export interface AppToolConfig {
  title?: string;
  description?: string;
  inputSchema?: SchemaLike;
  outputSchema?: SchemaLike;
  annotations?: ToolAnnotations;
  _meta: Record<string, unknown>;
}

export type AppToolCallback = (
  // Validated tool arguments; per-example callbacks narrow this themselves.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extra: any,
) => CallToolResult | Promise<CallToolResult>;

export type AppReadResourceCallback = (
  uri: URL,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extra: any,
) => ReadResourceResult | Promise<ReadResourceResult>;

function isZodObject(value: SchemaLike): value is z.ZodObject<z.ZodRawShape> {
  return typeof (value as { safeParse?: unknown }).safeParse === "function";
}

function normalizeSchema(
  schema: SchemaLike | undefined,
): z.ZodObject<z.ZodRawShape> | undefined {
  if (schema === undefined) return undefined;
  if (isZodObject(schema)) return schema;
  return z.object(schema);
}

interface UiToolMeta {
  resourceUri?: string;
  [key: string]: unknown;
}

/**
 * Normalize UI metadata exactly as the upstream helper does: whichever of
 * `_meta.ui.resourceUri` and the legacy flat key is present populates the
 * other, so both current and older hosts resolve the UI resource.
 */
function normalizeUiMeta(
  meta: Record<string, unknown>,
): Record<string, unknown> {
  const uiMeta = meta.ui as UiToolMeta | undefined;
  const legacyUri = meta[RESOURCE_URI_META_KEY] as string | undefined;
  if (uiMeta?.resourceUri && !legacyUri) {
    return { ...meta, [RESOURCE_URI_META_KEY]: uiMeta.resourceUri };
  }
  if (legacyUri && !uiMeta?.resourceUri) {
    return { ...meta, ui: { ...uiMeta, resourceUri: legacyUri } };
  }
  return meta;
}

/**
 * Register an MCP Apps tool on an SDK v2 server, preserving the upstream
 * helper's name, config, metadata normalization, and callback semantics.
 */
export function registerAppTool(
  server: Pick<McpServer, "registerTool">,
  name: string,
  config: AppToolConfig,
  cb: AppToolCallback,
): RegisteredTool {
  return server.registerTool(
    name,
    {
      title: config.title,
      description: config.description,
      inputSchema: normalizeSchema(config.inputSchema),
      outputSchema: normalizeSchema(config.outputSchema),
      annotations: config.annotations,
      _meta: normalizeUiMeta(config._meta),
    },
    cb,
  );
}

export interface AppResourceConfig extends ResourceMetadata {
  _meta?: Record<string, unknown>;
}

/**
 * Register an MCP Apps UI resource on an SDK v2 server, defaulting the MIME
 * type to `text/html;profile=mcp-app` exactly as the upstream helper does.
 */
export function registerAppResource(
  server: Pick<McpServer, "registerResource">,
  name: string,
  uri: string,
  config: AppResourceConfig,
  readCallback: AppReadResourceCallback,
): RegisteredResource {
  return server.registerResource(
    name,
    uri,
    {
      mimeType: RESOURCE_MIME_TYPE,
      ...config,
    },
    readCallback,
  );
}

/**
 * Return the immutable single-file HTML for an app's UI resource from the
 * bundled resource store. Replaces the upstream examples' local-filesystem
 * `dist/mcp-app.html` read; throws when the bundle does not carry the slug,
 * which surfaces as a contained JSON-RPC error for that app only.
 */
export function readBundledAppHtml(slug: string): string {
  return getBundledResourceHtml(slug);
}

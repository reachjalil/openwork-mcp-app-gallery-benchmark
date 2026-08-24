import type { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";
import {
  RESULT_BYTES,
  RESOURCE_BYTES,
  appDeadlineMs,
  combineSignals,
  jsonBytes,
  utf8Bytes,
} from "./limits.js";

export const RESOURCE_MIME_TYPE = "text/html;profile=mcp-app";
export const RESOURCE_URI_META_KEY = "ui/resourceUri";
export const EXTENSION_ID = "io.modelcontextprotocol/ui";

type JsonRecord = Record<string, unknown>;

export type AppToolConfig = {
  title?: string;
  description?: string;
  inputSchema?: z.ZodType;
  outputSchema?: z.ZodType;
  _meta: JsonRecord & {
    ui?: { resourceUri: string; visibility?: string[] };
  };
};

export type AppResourceConfig = {
  mimeType?: string;
  description?: string;
  _meta?: {
    ui?: JsonRecord;
  };
};

type ToolHandler = (
  args: JsonRecord,
  extra: { signal?: AbortSignal },
) => Promise<{
  content: Array<{ type: "text"; text: string }>;
  structuredContent?: unknown;
  isError?: boolean;
}>;

type ResourceReader = () => Promise<{
  contents: Array<{
    uri: string;
    mimeType: string;
    text: string;
    _meta?: JsonRecord;
  }>;
}>;

function normalizeMeta(meta: AppToolConfig["_meta"]): JsonRecord {
  const uiMeta = meta.ui;
  const legacyUri = meta[RESOURCE_URI_META_KEY];
  if (uiMeta?.resourceUri && typeof legacyUri !== "string") {
    return { ...meta, [RESOURCE_URI_META_KEY]: uiMeta.resourceUri };
  }
  if (typeof legacyUri === "string" && !uiMeta?.resourceUri) {
    return { ...meta, ui: { ...uiMeta, resourceUri: legacyUri } };
  }
  return meta;
}

function toZod(schema: z.ZodType | undefined): z.ZodType | undefined {
  return schema;
}

function abortSignalFrom(extra: object): AbortSignal | undefined {
  if ("signal" in extra && extra.signal instanceof AbortSignal) {
    return extra.signal;
  }
  if ("http" in extra && extra.http && typeof extra.http === "object") {
    const http = extra.http as { req?: Request };
    if (http.req?.signal instanceof AbortSignal) {
      return http.req.signal;
    }
  }
  return undefined;
}

export const EMPTY_APP_CSP = {
  connectDomains: [] as string[],
  resourceDomains: [] as string[],
  frameDomains: [] as string[],
  baseUriDomains: [] as string[],
};

export function appResourceUiMeta(extra: JsonRecord = {}): { ui: JsonRecord } {
  return {
    ui: {
      csp: EMPTY_APP_CSP,
      ...extra,
    },
  };
}

export function registerAppTool(
  server: McpServer,
  name: string,
  config: AppToolConfig,
  handler: ToolHandler,
): void {
  const inputSchema = toZod(config.inputSchema) ?? z.object({});
  server.registerTool(
    name,
    {
      title: config.title,
      description: config.description,
      inputSchema,
      outputSchema: config.outputSchema,
      _meta: normalizeMeta(config._meta),
    },
    async (args, extra) => {
      const signal = combineSignals(
        abortSignalFrom(extra),
        AbortSignal.timeout(appDeadlineMs()),
      );
      if (signal.aborted) {
        throw new DOMException("This operation was aborted", "AbortError");
      }
      const result = await handler(args as JsonRecord, { signal });
      if (jsonBytes(result) > RESULT_BYTES) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: "Result exceeds the gallery size limit.",
            },
          ],
        };
      }
      return result;
    },
  );
}

export function registerAppResource(
  server: McpServer,
  name: string,
  uri: string,
  config: AppResourceConfig,
  read: ResourceReader,
): void {
  server.registerResource(
    name,
    uri,
    {
      mimeType: config.mimeType ?? RESOURCE_MIME_TYPE,
      description: config.description,
      _meta: config._meta,
    },
    async (_uri, extra) => {
      const signal = combineSignals(
        abortSignalFrom(extra),
        AbortSignal.timeout(appDeadlineMs()),
      );
      if (signal.aborted) {
        throw new DOMException("This operation was aborted", "AbortError");
      }
      const result = await read();
      for (const item of result.contents) {
        if (utf8Bytes(item.text) > RESOURCE_BYTES) {
          throw new Error("Resource exceeds the gallery size limit.");
        }
        if (!item._meta) {
          item._meta = appResourceUiMeta();
        }
      }
      return result;
    },
  );
}

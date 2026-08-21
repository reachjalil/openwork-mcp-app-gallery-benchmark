// [gallery modification] Imports adapted for the hosted gallery: MCP SDK v2
// (@modelcontextprotocol/server) replaces SDK v1, the gallery-owned adapter
// replaces @modelcontextprotocol/ext-apps/server, and the UI HTML is read from
// the immutable bundled resource store instead of the local filesystem.
import type {
  McpServer,
  CallToolResult,
  ReadResourceResult,
} from "@modelcontextprotocol/server";
import { z } from "zod";
import {
  RESOURCE_MIME_TYPE,
  registerAppResource,
  registerAppTool,
  readBundledAppHtml,
} from "../../../src/mcp-app-adapter.js";
import {
  generateCustomers,
  generateSegmentSummaries,
} from "./src/data-generator.js";
import { SEGMENTS, type Customer, type SegmentSummary } from "./src/types.js";

// Schemas - types are derived from these using z.infer
const GetCustomerDataInputSchema = z.object({
  segment: z
    .enum(["All", ...SEGMENTS])
    .optional()
    .describe("Filter by segment (default: All)"),
});

const CustomerSchema = z.object({
  id: z.string(),
  name: z.string(),
  segment: z.string(),
  annualRevenue: z.number(),
  employeeCount: z.number(),
  accountAge: z.number(),
  engagementScore: z.number(),
  supportTickets: z.number(),
  nps: z.number(),
});

const SegmentSummarySchema = z.object({
  name: z.string(),
  count: z.number(),
  color: z.string(),
});

const GetCustomerDataOutputSchema = z.object({
  customers: z.array(CustomerSchema),
  segments: z.array(SegmentSummarySchema),
});

// [gallery modification] Upstream cached the generated dataset in mutable
// module state for per-process "session consistency". The hosted gallery runs
// stateless concurrent instances, so the data generator is deterministic
// (seeded) instead: every call on every instance produces the identical
// synthetic dataset with no process-global mutable state.
function getCustomerData(segmentFilter?: string): {
  customers: Customer[];
  segments: SegmentSummary[];
} {
  const allCustomers: Customer[] = generateCustomers(250);
  const segments: SegmentSummary[] = generateSegmentSummaries(allCustomers);

  // Filter by segment if specified
  let customers = allCustomers;
  if (segmentFilter && segmentFilter !== "All") {
    customers = allCustomers.filter((c) => c.segment === segmentFilter);
  }

  return {
    customers,
    segments,
  };
}

/**
 * Registers this example's tools and resources on the given MCP server.
 *
 * [gallery modification] Upstream `createServer()` constructed its own SDK v1
 * `McpServer`. The hosted gallery's handler constructs one SDK v2 server per
 * request (carrying this example's name and version), so this function now
 * receives that server and performs the same registrations on it.
 */
export function registerApp(server: McpServer): McpServer {
  // Register the get-customer-data tool and its associated UI resource
  {
    const resourceUri = "ui://customer-segmentation/mcp-app.html";

    registerAppTool(
      server,
      "get-customer-data",
      {
        title: "Get Customer Data",
        description:
          "Returns customer data with segment information for visualization. Optionally filter by segment.",
        inputSchema: GetCustomerDataInputSchema.shape,
        outputSchema: GetCustomerDataOutputSchema.shape,
        _meta: { ui: { resourceUri } },
      },
      async ({ segment }): Promise<CallToolResult> => {
        const data = getCustomerData(segment);

        return {
          content: [{ type: "text", text: JSON.stringify(data) }],
          structuredContent: data,
        };
      },
    );

    registerAppResource(
      server,
      resourceUri,
      resourceUri,
      {
        mimeType: RESOURCE_MIME_TYPE,
        description: "Customer Segmentation Explorer UI",
      },
      async (): Promise<ReadResourceResult> => {
        const html = readBundledAppHtml("customer-segmentation");

        return {
          contents: [
            {
              uri: resourceUri,
              mimeType: RESOURCE_MIME_TYPE,
              text: html,
            },
          ],
        };
      },
    );
  }

  return server;
}

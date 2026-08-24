import type { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";
import {
  RESOURCE_MIME_TYPE,
  registerAppResource,
  registerAppTool,
} from "../mcp-app-adapter.js";
import { createSeededRandom } from "../seeded-random.js";

const SEGMENTS = ["Enterprise", "Mid-Market", "SMB", "Startup"] as const;
const SEGMENT_COLORS: Record<(typeof SEGMENTS)[number], string> = {
  Enterprise: "#1e40af",
  "Mid-Market": "#0d9488",
  SMB: "#059669",
  Startup: "#6366f1",
};

const CustomerSchema = z.object({
  id: z.string(),
  name: z.string().max(80),
  segment: z.string().max(32),
  annualRevenue: z.number(),
  employeeCount: z.number(),
  accountAge: z.number(),
  engagementScore: z.number(),
  supportTickets: z.number(),
  nps: z.number(),
});

const GetCustomerDataInputSchema = z.object({
  segment: z.enum(["All", ...SEGMENTS]).optional(),
});

const GetCustomerDataOutputSchema = z.object({
  customers: z.array(CustomerSchema).max(250),
  segments: z.array(
    z.object({
      name: z.string(),
      count: z.number(),
      color: z.string(),
    }),
  ),
});

const PREFIXES = [
  "Apex",
  "Nova",
  "Prime",
  "Vertex",
  "Atlas",
  "Quantum",
  "Summit",
  "Nexus",
];
const CORES = ["Tech", "Data", "Cloud", "Logic", "Sync", "Flow", "Core", "Net"];
const SUFFIXES = ["Corp", "Inc", "Solutions", "Systems", "Labs", "Group"];

function generateCustomers(count: number) {
  const random = createSeededRandom(99);
  const used = new Set<string>();
  const customers = [];
  for (let i = 0; i < count; i += 1) {
    const segment = SEGMENTS[Math.floor(random() * SEGMENTS.length)] ?? "SMB";
    let name = `${PREFIXES[Math.floor(random() * PREFIXES.length)]} ${CORES[Math.floor(random() * CORES.length)]} ${SUFFIXES[Math.floor(random() * SUFFIXES.length)]}`;
    if (used.has(name)) name = `${name} ${i}`;
    used.add(name);
    customers.push({
      id: `cust-${String(i + 1).padStart(4, "0")}`,
      name,
      segment,
      annualRevenue: Math.round(20_000 + random() * 4_000_000),
      employeeCount: Math.round(5 + random() * 800),
      accountAge: Math.round(3 + random() * 90),
      engagementScore: Math.round(20 + random() * 80),
      supportTickets: Math.round(random() * 30),
      nps: Math.round(random() * 80),
    });
  }
  return customers;
}

const CUSTOMERS = generateCustomers(250);

export function registerCustomerSegmentation(
  server: McpServer,
  html: string,
): void {
  const resourceUri = "ui://customer-segmentation/mcp-app.html";
  registerAppTool(
    server,
    "get-customer-data",
    {
      title: "Get Customer Data",
      description:
        "Returns customer data with segment information for visualization. Optionally filter by segment.",
      inputSchema: GetCustomerDataInputSchema,
      outputSchema: GetCustomerDataOutputSchema,
      _meta: { ui: { resourceUri } },
    },
    async (args) => {
      const parsed = GetCustomerDataInputSchema.parse(args);
      const customers =
        parsed.segment && parsed.segment !== "All"
          ? CUSTOMERS.filter((customer) => customer.segment === parsed.segment)
          : CUSTOMERS;
      const segments = SEGMENTS.map((name) => ({
        name,
        count: CUSTOMERS.filter((customer) => customer.segment === name).length,
        color: SEGMENT_COLORS[name],
      }));
      const data = { customers, segments };
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
    async () => ({
      contents: [
        { uri: resourceUri, mimeType: RESOURCE_MIME_TYPE, text: html },
      ],
    }),
  );
}

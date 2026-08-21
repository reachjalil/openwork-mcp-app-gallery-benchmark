import {
  AppBridge,
  PostMessageTransport,
} from "./ext-apps-app-bridge-runtime.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const requiredSlugs = new Set([
  "get-time",
  "budget-allocator",
  "cohort-heatmap",
  "customer-segmentation",
  "scenario-modeler",
  "transcript",
]);
const slug = new URL(location.href).searchParams.get("slug") ?? "";
const remote = new URL(location.href).searchParams.get("remote") === "1";
const status = document.querySelector<HTMLElement>("#host-status")!;
const iframe = document.querySelector<HTMLIFrameElement>("#app")!;

function fail(reason: unknown): void {
  document.documentElement.dataset.hostState = "failed";
  status.textContent = "Host initialization failed safely.";
  console.error("Browser host failure", reason);
}

async function start(): Promise<void> {
  if (!requiredSlugs.has(slug)) throw new Error("Unknown app slug");
  const endpoint = new URL(
    remote ? `/__test/remote/${slug}/mcp` : `/apps/${slug}/mcp`,
    location.origin,
  );
  const client = new Client(
    { name: "gallery-independent-browser-host", version: "1.0.0" },
    {
      capabilities: {
        extensions: {
          "io.modelcontextprotocol/ui": {
            mimeTypes: ["text/html;profile=mcp-app"],
          },
        },
      },
    },
  );
  await client.connect(new StreamableHTTPClientTransport(endpoint));
  const listed = await client.listTools();
  if (listed.tools.length !== 1)
    throw new Error("Endpoint did not expose exactly one tool");
  const tool = listed.tools[0]!;
  const resourceUri =
    (tool._meta?.ui as { resourceUri?: unknown } | undefined)?.resourceUri ??
    tool._meta?.["ui/resourceUri"];
  if (typeof resourceUri !== "string")
    throw new Error("Tool has no MCP App resource URI");
  const [result, resourceResult] = await Promise.all([
    client.callTool({ name: tool.name, arguments: {} }),
    client.readResource({ uri: resourceUri }),
  ]);
  const resource = resourceResult.contents[0];
  if (!resource || !("text" in resource))
    throw new Error("Endpoint did not return a text resource");

  const capabilities = client.getServerCapabilities();
  const bridge = new AppBridge(
    client,
    { name: "Gallery Independent Browser Host", version: "1.0.0" },
    {
      serverTools: capabilities?.tools,
      serverResources: capabilities?.resources,
      updateModelContext: { text: {} },
    },
    {
      hostContext: {
        theme: "light",
        platform: "web",
        displayMode: "inline",
        availableDisplayModes: ["inline"],
        containerDimensions: { width: 960, maxHeight: 900 },
      },
    },
  );
  bridge.onmessage = async () => ({});
  bridge.onupdatemodelcontext = async () => ({});
  bridge.onsizechange = async ({ height }) => {
    if (height && Number.isFinite(height))
      iframe.style.height = `${Math.min(1_200, Math.max(320, height))}px`;
  };
  const initialized = new Promise<void>((resolve) => {
    bridge.oninitialized = resolve;
  });
  await bridge.connect(
    new PostMessageTransport(iframe.contentWindow!, iframe.contentWindow!),
  );
  iframe.srcdoc = resource.text;
  await Promise.race([
    initialized,
    new Promise<never>((_resolve, reject) =>
      setTimeout(
        () => reject(new Error("MCP App initialization timed out")),
        15_000,
      ),
    ),
  ]);
  bridge.sendToolInput({ arguments: {} });
  bridge.sendToolResult(result);
  document.documentElement.dataset.hostState = "ready";
  document.documentElement.dataset.slug = slug;
  status.textContent = `${slug} initialized through the MCP Apps bridge.`;
}

window.addEventListener("unhandledrejection", (event) => fail(event.reason));
void start().catch(fail);

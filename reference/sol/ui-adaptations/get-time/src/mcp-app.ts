import {
  App,
  applyDocumentTheme,
  type McpUiHostContext,
} from "@modelcontextprotocol/ext-apps";
import "./style.css";

const time = document.querySelector<HTMLTimeElement>("#time")!;
const status = document.querySelector<HTMLElement>("#status")!;
const refresh = document.querySelector<HTMLButtonElement>("#refresh")!;
const main = document.querySelector<HTMLElement>("main")!;
const app = new App({ name: "Get Time App", version: "1.0.0" });

function showResult(result: {
  content?: Array<{ type: string; text?: string }>;
  structuredContent?: Record<string, unknown>;
}): void {
  const value =
    typeof result.structuredContent?.time === "string"
      ? result.structuredContent.time
      : result.content?.find((item) => item.type === "text")?.text;
  if (value) time.textContent = value;
}

function applyContext(context: McpUiHostContext): void {
  if (context.theme) applyDocumentTheme(context.theme);
  const area = context.safeAreaInsets;
  if (area)
    main.style.padding = `${area.top + 24}px ${area.right + 24}px ${area.bottom + 24}px ${area.left + 24}px`;
}

app.ontoolresult = async (result) => {
  showResult(result);
};
app.onhostcontextchanged = applyContext;
app.onteardown = async () => ({});
refresh.addEventListener("click", async () => {
  refresh.disabled = true;
  status.textContent = "Refreshing…";
  try {
    showResult(await app.callServerTool({ name: "get-time", arguments: {} }));
    status.textContent = "Updated from the same MCP server.";
  } catch {
    status.textContent = "The refresh request failed safely.";
  } finally {
    refresh.disabled = false;
  }
});

await app.connect();
const context = app.getHostContext();
if (context) applyContext(context);

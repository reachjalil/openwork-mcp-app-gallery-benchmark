import {
  App,
  applyDocumentTheme,
  type McpUiHostContext,
} from "@modelcontextprotocol/ext-apps";
import "./style.css";

type Cell = {
  periodIndex: number;
  retention: number;
  usersRetained: number;
  usersOriginal: number;
};
type Row = {
  cohortId: string;
  cohortLabel: string;
  originalUsers: number;
  cells: Cell[];
};
type CohortData = { cohorts: Row[]; periods: string[]; periodLabels: string[] };

const grid = document.querySelector<HTMLElement>("#grid")!;
const status = document.querySelector<HTMLElement>("#status")!;
const metric = document.querySelector<HTMLSelectElement>("#metric")!;
const period = document.querySelector<HTMLSelectElement>("#period")!;
const main = document.querySelector<HTMLElement>("main")!;
const app = new App({ name: "Cohort Heatmap", version: "1.0.0" });

function render(data: CohortData): void {
  grid.style.gridTemplateColumns = `8rem repeat(${data.periods.length},minmax(2.5rem,1fr))`;
  grid.replaceChildren();
  grid.append(document.createElement("span"));
  for (const label of data.periods) {
    const header = document.createElement("strong");
    header.textContent = label;
    grid.append(header);
  }
  for (const row of data.cohorts) {
    const name = document.createElement("b");
    name.textContent = `${row.cohortLabel} · ${row.originalUsers.toLocaleString()}`;
    grid.append(name);
    for (let index = 0; index < data.periods.length; index += 1) {
      const cell = row.cells.find(
        (candidate) => candidate.periodIndex === index,
      );
      const item = document.createElement("button");
      item.type = "button";
      item.className = "cell";
      if (cell) {
        const percentage = Math.round(cell.retention * 100);
        item.textContent = String(percentage);
        item.style.setProperty(
          "--heat",
          `hsl(${cell.retention * 120} 70% 44%)`,
        );
        item.title = `${row.cohortLabel}, ${data.periodLabels[index]}: ${percentage}% (${cell.usersRetained.toLocaleString()} of ${cell.usersOriginal.toLocaleString()})`;
        item.addEventListener("click", () => {
          status.textContent = item.title;
        });
      } else {
        item.disabled = true;
        item.setAttribute(
          "aria-label",
          `${row.cohortLabel}: no data for ${data.periodLabels[index]}`,
        );
      }
      grid.append(item);
    }
  }
  status.textContent = `Showing ${data.cohorts.length} synthetic cohorts.`;
}

async function refresh(): Promise<void> {
  status.textContent = "Refreshing from the same MCP server…";
  try {
    const result = await app.callServerTool({
      name: "get-cohort-data",
      arguments: {
        metric: metric.value,
        periodType: period.value,
        cohortCount: 12,
        maxPeriods: 12,
      },
    });
    render(result.structuredContent as unknown as CohortData);
  } catch {
    status.textContent = "The cohort request failed safely.";
  }
}

function applyContext(context: McpUiHostContext): void {
  if (context.theme) applyDocumentTheme(context.theme);
  const area = context.safeAreaInsets;
  if (area)
    main.style.padding = `${area.top + 18}px ${area.right + 18}px ${area.bottom + 18}px ${area.left + 18}px`;
}

app.ontoolresult = async (result) => {
  const data = result.structuredContent as unknown as CohortData;
  if (data?.cohorts) render(data);
};
app.onhostcontextchanged = applyContext;
metric.addEventListener("change", refresh);
period.addEventListener("change", refresh);
await app.connect();
const context = app.getHostContext();
if (context) applyContext(context);
await refresh();

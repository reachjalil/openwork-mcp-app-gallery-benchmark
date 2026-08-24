import {
  App,
  applyDocumentTheme,
  type McpUiHostContext,
} from "@modelcontextprotocol/ext-apps";
import "./style.css";

type Inputs = {
  startingMRR: number;
  monthlyGrowthRate: number;
  monthlyChurnRate: number;
  grossMargin: number;
  fixedCosts: number;
};
type Projection = { month: number; mrr: number; netProfit: number };
type Summary = {
  endingMRR: number;
  arr: number;
  totalRevenue: number;
  totalProfit: number;
  breakEvenMonth: number | null;
};
type Template = {
  id: string;
  name: string;
  icon: string;
  parameters: Inputs;
  projections: Projection[];
  summary: Summary;
};
type ScenarioData = {
  templates?: Template[];
  defaultInputs?: Inputs;
  customProjections?: Projection[];
  customSummary?: Summary;
};
const keys: Array<keyof Inputs> = [
  "startingMRR",
  "monthlyGrowthRate",
  "monthlyChurnRate",
  "grossMargin",
  "fixedCosts",
];
const defaults: Inputs = {
  startingMRR: 50000,
  monthlyGrowthRate: 5,
  monthlyChurnRate: 3,
  grossMargin: 80,
  fixedCosts: 30000,
};
const template = document.querySelector<HTMLSelectElement>("#template")!;
const form = document.querySelector<HTMLFormElement>("#inputs")!;
const summary = document.querySelector<HTMLElement>("#summary")!;
const chart = document.querySelector<SVGElement>("#chart")!;
const status = document.querySelector<HTMLElement>("#status")!;
const main = document.querySelector<HTMLElement>("main")!;
const app = new App({ name: "SaaS Scenario Modeler", version: "1.0.0" });
let templates: Template[] = [];

function currency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}
function inputs(): Inputs {
  return Object.fromEntries(
    keys.map((key) => [
      key,
      Number(document.querySelector<HTMLInputElement>(`#${key}`)!.value),
    ]),
  ) as Inputs;
}
function setInputs(values: Inputs): void {
  for (const key of keys)
    document.querySelector<HTMLInputElement>(`#${key}`)!.value = String(
      values[key],
    );
  updateLabels();
}
function updateLabels(): void {
  const values = inputs();
  for (const key of keys)
    document.querySelector<HTMLOutputElement>(`#${key}-value`)!.textContent =
      key.includes("Rate") || key === "grossMargin"
        ? `${values[key]}%`
        : currency(values[key]);
}
function render(data: ScenarioData): void {
  if (data.templates) {
    templates = data.templates;
    template.replaceChildren(
      new Option("Custom scenario", ""),
      ...templates.map(
        (item) => new Option(`${item.icon} ${item.name}`, item.id),
      ),
    );
  }
  if (data.defaultInputs) setInputs(data.defaultInputs);
  const selected = templates.find((item) => item.id === template.value);
  const projections = data.customProjections ?? selected?.projections;
  const result = data.customSummary ?? selected?.summary;
  if (!projections || !result) return;
  summary.innerHTML = `<article><span>Ending MRR</span><strong>${currency(result.endingMRR)}</strong></article><article><span>ARR</span><strong>${currency(result.arr)}</strong></article><article><span>Total profit</span><strong>${currency(result.totalProfit)}</strong></article><article><span>Break even</span><strong>${result.breakEvenMonth ? `Month ${result.breakEvenMonth}` : "Not reached"}</strong></article>`;
  const max = Math.max(...projections.map((item) => item.mrr), 1);
  const points = projections
    .map((item, index) => `${25 + index * 50},${215 - (item.mrr / max) * 180}`)
    .join(" ");
  chart.innerHTML = `<line x1="25" y1="215" x2="575" y2="215"/><polyline points="${points}"/><text x="25" y="235">Month 1</text><text x="525" y="235">Month 12</text>`;
}
async function calculate(): Promise<void> {
  status.textContent = "Calculating on the same MCP server…";
  try {
    const result = await app.callServerTool({
      name: "get-scenario-data",
      arguments: { customInputs: inputs() },
    });
    render(result.structuredContent as unknown as ScenarioData);
    status.textContent = "Projection updated.";
  } catch {
    status.textContent = "The scenario request failed safely.";
  }
}
function applyContext(context: McpUiHostContext): void {
  if (context.theme) applyDocumentTheme(context.theme);
  const area = context.safeAreaInsets;
  if (area)
    main.style.padding = `${area.top + 18}px ${area.right + 18}px ${area.bottom + 18}px ${area.left + 18}px`;
}

for (const key of keys)
  document
    .querySelector<HTMLInputElement>(`#${key}`)!
    .addEventListener("input", updateLabels);
template.addEventListener("change", () => {
  const selected = templates.find((item) => item.id === template.value);
  if (selected) {
    setInputs(selected.parameters);
    render({
      customProjections: selected.projections,
      customSummary: selected.summary,
    });
  }
});
form.addEventListener("submit", (event) => {
  event.preventDefault();
  void calculate();
});
app.ontoolresult = async (result) => {
  render(result.structuredContent as unknown as ScenarioData);
};
app.onhostcontextchanged = applyContext;
setInputs(defaults);
await app.connect();
const context = app.getHostContext();
if (context) applyContext(context);

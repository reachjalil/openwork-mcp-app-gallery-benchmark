/**
 * App rendering and interaction through the upstream basic host (dev-only
 * harness): every Wave 1 app must render its UI from the live gallery
 * endpoint, and the representative apps prove deep interaction —
 * `get-time`'s UI-initiated same-server tool call and `budget-allocator`'s
 * in-app recalculation.
 *
 * Topology: basic-host page (localhost:8080) → SDK v1 client (legacy
 * Streamable HTTP) → gallery server (localhost:3999); the App renders inside
 * the double-iframe sandbox (sandbox proxy on localhost:8081).
 */
import { type FrameLocator, type Page, expect, test } from "@playwright/test";

const HOST = "http://localhost:8080";

interface RenderCase {
  slug: string;
  serverName: string;
  tool: string;
  /** Text expected inside the rendered app UI. */
  marker: string | RegExp;
}

const RENDER_CASES: RenderCase[] = [
  {
    slug: "get-time",
    serverName: "Basic MCP App Server (React)",
    tool: "get-time",
    marker: "Server Time:",
  },
  {
    slug: "budget-allocator",
    serverName: "Budget Allocator Server",
    tool: "get-budget-data",
    marker: "Budget Allocator",
  },
  {
    slug: "cohort-heatmap",
    serverName: "Cohort Heatmap Server",
    tool: "get-cohort-data",
    marker: /Cohort|Retention/i,
  },
  {
    slug: "customer-segmentation",
    serverName: "Customer Segmentation Server",
    tool: "get-customer-data",
    marker: "Customer Segmentation",
  },
  {
    slug: "scenario-modeler",
    serverName: "SaaS Scenario Modeler",
    tool: "get-scenario-data",
    marker: /Scenario|MRR/i,
  },
  {
    slug: "transcript",
    serverName: "Transcript Server",
    tool: "transcribe",
    marker: /Start|Transcript/i,
  },
];

function appFrame(page: Page): FrameLocator {
  // Outer iframe: sandbox proxy (localhost:8081). Inner iframe: the app view.
  // With the theme toggle hidden there is exactly one outer iframe per call.
  return page.frameLocator("iframe").first().frameLocator("iframe");
}

async function openApp(page: Page, renderCase: RenderCase): Promise<void> {
  const url = `${HOST}/?server=${encodeURIComponent(renderCase.serverName)}&tool=${encodeURIComponent(renderCase.tool)}&call=true&theme=hide`;
  await page.goto(url);
  // The host panel header shows "<server>:<tool>" once the call starts.
  await expect(
    page.getByText(`${renderCase.serverName}:`, { exact: false }).first(),
  ).toBeVisible({ timeout: 20_000 });
}

for (const renderCase of RENDER_CASES) {
  test(`${renderCase.slug} renders its App UI from the live endpoint`, async ({
    page,
  }) => {
    await openApp(page, renderCase);
    const frame = appFrame(page);
    await expect(frame.locator("body")).toContainText(renderCase.marker, {
      timeout: 30_000,
    });
    // The ordinary tool result also arrived at the host (fallback path).
    await expect(page.getByText("Tool Result", { exact: false })).toBeVisible();
  });
}

test("get-time supports a UI-initiated same-server tool call", async ({
  page,
}) => {
  await openApp(page, RENDER_CASES[0]);
  const frame = appFrame(page);
  const timeCode = frame.locator("code").first();
  await expect(timeCode).toContainText(/\d{4}-\d{2}-\d{2}T/, {
    timeout: 30_000,
  });
  const before = await timeCode.textContent();
  await page.waitForTimeout(1_100); // ensure a visibly different timestamp
  await frame.getByRole("button", { name: "Get Server Time" }).click();
  await expect(timeCode).not.toHaveText(before ?? "", { timeout: 15_000 });
  await expect(timeCode).toContainText(/\d{4}-\d{2}-\d{2}T/);
});

test("budget-allocator supports deep in-app interaction", async ({ page }) => {
  await openApp(page, RENDER_CASES[1]);
  const frame = appFrame(page);
  await expect(frame.locator("h1.title")).toHaveText("Budget Allocator", {
    timeout: 30_000,
  });
  const sliders = frame.locator("input.slider");
  await expect(sliders.first()).toBeVisible({ timeout: 20_000 });
  expect(await sliders.count()).toBeGreaterThanOrEqual(5);

  const firstRow = frame.locator(".slider-row").first();
  const percentBefore = await firstRow.locator(".percent").textContent();
  // Drive the range input like a user would (value + input event).
  await sliders.first().evaluate((element) => {
    const input = element as HTMLInputElement;
    input.value = String(Math.min(Number(input.max || 100), 60));
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await expect(firstRow.locator(".percent")).not.toHaveText(
    percentBefore ?? "",
    { timeout: 10_000 },
  );
});

test("apps stay isolated: one endpoint exposes exactly one server", async ({
  page,
}) => {
  await page.goto(`${HOST}/?theme=hide`);
  // The host connected to six distinct servers, one per endpoint.
  const serverSelect = page.locator("select").first();
  await expect(serverSelect.locator("option")).toHaveCount(6, {
    timeout: 20_000,
  });
  // Selecting a server exposes only that server's tool.
  const toolSelect = page.locator("select").nth(1);
  for (const renderCase of RENDER_CASES) {
    await serverSelect.selectOption({ label: renderCase.serverName });
    await expect(toolSelect.locator("option")).toHaveCount(1);
    await expect(toolSelect.locator("option").first()).toHaveText(
      renderCase.tool,
    );
  }
});

import { expect, test } from "@playwright/test";

const galleryOrigin = new URL(
  process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:4173",
).origin;
const expectedPublicOrigin = new URL(
  process.env.GALLERY_EXPECTED_PUBLIC_ORIGIN ?? galleryOrigin,
).origin;

test("the public gallery renders six accessible, copyable cards", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"], {
    origin: galleryOrigin,
  });
  await page.goto("/");
  await expect(page).toHaveTitle("Hosted MCP Apps Example Gallery");
  const cards = page.locator(".card");
  await expect(cards).toHaveCount(6);
  await expect(page.locator(".preview")).toHaveCount(6);
  for (const image of await page.locator(".preview").all())
    await expect(image).toHaveAttribute("alt", /\S/u);
  for (const endpoint of await page.locator(".endpoint").all())
    await expect(endpoint).toContainText(
      new RegExp(
        `^${expectedPublicOrigin.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")}/apps/[a-z0-9-]+/mcp$`,
        "u",
      ),
    );

  const firstButton = page.locator(".copy").first();
  await firstButton.click();
  await expect(firstButton).toHaveText("Copied");
  await expect(cards.first().getByRole("status")).toHaveText("MCP URL copied.");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    `${expectedPublicOrigin}/apps/get-time/mcp`,
  );
});

test("keyboard focus is visible and every interactive catalog control is named", async ({
  page,
}) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const focused = page.locator(":focus");
  await expect(focused).toHaveAttribute("href", /github\.com/u);
  expect(
    await focused.evaluate((element) => getComputedStyle(element).outlineStyle),
  ).not.toBe("none");
  for (const button of await page.getByRole("button").all())
    await expect(button).toHaveAccessibleName(/\S/u);
  for (const link of await page.getByRole("link").all())
    await expect(link).toHaveAccessibleName(/\S/u);
});

test("the gallery remains within a 320px viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/");
  const dimensions = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
  }));
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.client);
  await expect(page.locator(".card")).toHaveCount(6);
});

test("apps.json reflects enabled public state with deliberate revalidation", async ({
  request,
}) => {
  const response = await request.get("/apps.json");
  expect(response.ok()).toBe(true);
  expect(response.headers()["cache-control"]).toBe(
    "public, max-age=60, must-revalidate",
  );
  const body = (await response.json()) as { apps: { endpoint: string }[] };
  expect(body.apps).toHaveLength(6);
  expect(
    body.apps.every((app) =>
      app.endpoint.startsWith(`${expectedPublicOrigin}/apps/`),
    ),
  ).toBe(true);
});

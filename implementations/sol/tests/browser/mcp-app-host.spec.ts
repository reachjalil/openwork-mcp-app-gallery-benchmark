import { expect, test } from "@playwright/test";

const slugs = [
  "get-time",
  "budget-allocator",
  "cohort-heatmap",
  "customer-segmentation",
  "scenario-modeler",
  "transcript",
] as const;
const remote = process.env.PLAYWRIGHT_BASE_URL ? "&remote=1" : "";

for (const slug of slugs) {
  test(`${slug} initializes and renders in an independent MCP Apps bridge host`, async ({
    page,
  }) => {
    await page.goto(`http://127.0.0.1:4173/__test/host?slug=${slug}${remote}`);
    await expect(page.locator("html")).toHaveAttribute(
      "data-host-state",
      "ready",
      { timeout: 20_000 },
    );
    await expect(page.getByRole("status")).toContainText(`${slug} initialized`);
    const frame = page.frameLocator("#app");
    await expect(frame.locator("body")).toBeVisible();

    if (slug === "get-time") {
      await expect(frame.locator("h1")).toBeVisible();
      await expect(frame.locator("#time")).not.toContainText("Waiting");
      await frame.getByRole("button", { name: "Refresh from server" }).click();
      await expect(frame.locator("#status")).toHaveText(
        "Updated from the same MCP server.",
      );
    } else if (slug === "budget-allocator") {
      await expect(frame.locator("#sliders-container input")).toHaveCount(5);
      await expect(frame.locator("#comparison-summary")).not.toContainText(
        "Loading",
      );
    } else if (slug === "cohort-heatmap") {
      await expect(frame.locator(".cell")).toHaveCount(144);
      await frame.locator("#period").selectOption("weekly");
      await expect(frame.getByRole("status")).toContainText(
        "12 synthetic cohorts",
      );
    } else if (slug === "customer-segmentation") {
      await expect(frame.locator("#legend > *")).toHaveCount(4);
      await frame.locator("#x-axis").selectOption("employeeCount");
      await expect(frame.locator("#scatter-chart")).toBeVisible();
    } else if (slug === "scenario-modeler") {
      await frame
        .getByRole("button", { name: "Recalculate on server" })
        .click();
      await expect(frame.locator("#status")).toHaveText("Projection updated.");
      await expect(frame.locator("#summary article")).toHaveCount(4);
    } else {
      await expect(frame.getByRole("button", { name: /Start/u })).toBeVisible();
      await expect(frame.getByRole("button", { name: "Clear" })).toBeVisible();
    }
  });
}

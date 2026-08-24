/**
 * Gallery page browser checks: content, Copy MCP URL success and failure
 * feedback, keyboard accessibility, visible focus, labels/alt text, and the
 * 320px layout.
 */
import { expect, test } from "@playwright/test";

test.describe("gallery page", () => {
  test("renders six cards with alt text, prompts, and endpoints", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "MCP Apps Example Gallery",
    );
    await expect(page.locator("article.card")).toHaveCount(6);
    for (const image of await page.locator("article.card img").all()) {
      const alt = await image.getAttribute("alt");
      expect(alt).toBeTruthy();
      expect(alt as string).toContain("Screenshot of the");
    }
    const endpoints = await page.locator("code.endpoint-url").allTextContents();
    expect(endpoints).toHaveLength(6);
    for (const endpoint of endpoints) {
      expect(endpoint).toMatch(
        /^http:\/\/localhost:3999\/apps\/[a-z0-9-]+\/mcp$/,
      );
    }
    // Independence disclaimer must be visible.
    await expect(page.locator(".disclaimer")).toContainText(
      "independent hosted adaptation",
    );
  });

  test("Copy MCP URL succeeds with accessible feedback", async ({
    page,
    context,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/");
    const firstCard = page.locator("article.card").first();
    await firstCard.getByRole("button", { name: "Copy MCP URL" }).click();
    await expect(firstCard.locator(".copy-status")).toHaveText("Copied ✓");
    const clipboard = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboard).toBe("http://localhost:3999/apps/get-time/mcp");
  });

  test("Copy MCP URL failure produces accessible failure feedback", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "clipboard", {
        value: {
          writeText: () => Promise.reject(new Error("denied")),
        },
      });
      document.execCommand = () => false;
    });
    await page.goto("/");
    const firstCard = page.locator("article.card").first();
    await firstCard.getByRole("button", { name: "Copy MCP URL" }).click();
    await expect(firstCard.locator(".copy-status")).toContainText(
      "Copy failed",
    );
  });

  test("keyboard navigation reaches the copy buttons with visible focus", async ({
    page,
  }) => {
    await page.goto("/");
    // The skip link is the first focusable element.
    await page.keyboard.press("Tab");
    await expect(page.locator(".skip-link")).toBeFocused();
    await page.keyboard.press("Enter");
    // Tab until a copy button is focused (bounded walk).
    let reached = false;
    for (let index = 0; index < 40; index += 1) {
      await page.keyboard.press("Tab");
      const focused = await page.evaluate(() => {
        const active = document.activeElement;
        return active?.classList.contains("copy-button") ?? false;
      });
      if (focused) {
        reached = true;
        break;
      }
    }
    expect(reached).toBe(true);
    // Focus must be visibly indicated (non-none outline via :focus-visible).
    const outline = await page.evaluate(() => {
      const active = document.activeElement as HTMLElement;
      return getComputedStyle(active).outlineStyle;
    });
    expect(outline).not.toBe("none");
    // Activate with the keyboard.
    await page.keyboard.press("Enter");
    await expect(page.locator(".copy-status").first()).not.toHaveText("");
  });

  test("stays usable at 320px width without horizontal scroll", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await page.goto("/");
    await expect(page.locator("article.card").first()).toBeVisible();
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test("apps.json matches the cards", async ({ page, request }) => {
    await page.goto("/");
    const cardEndpoints = (
      await page.locator("code.endpoint-url").allTextContents()
    ).sort();
    const manifest = (await (
      await request.get("http://localhost:3999/apps.json")
    ).json()) as { apps: Array<{ endpoint: string | null; enabled: boolean }> };
    const manifestEndpoints = manifest.apps
      .filter((app) => app.enabled)
      .map((app) => app.endpoint as string)
      .sort();
    expect(cardEndpoints).toEqual(manifestEndpoints);
  });
});

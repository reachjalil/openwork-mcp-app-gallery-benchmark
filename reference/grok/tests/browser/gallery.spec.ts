import { expect, test, type APIRequestContext } from "@playwright/test";

const LEGACY = "2025-03-26";

async function mcpJson(
  request: APIRequestContext,
  slug: string,
  method: string,
  params: Record<string, unknown>,
  id: number,
) {
  const response = await request.post(`/apps/${slug}/mcp`, {
    headers: {
      accept: "application/json, text/event-stream",
      "content-type": "application/json",
      "mcp-protocol-version": LEGACY,
    },
    data: { jsonrpc: "2.0", id, method, params },
  });
  const text = await response.text();
  if (text.includes("data:")) {
    const line = text
      .split("\n")
      .find((item) => item.startsWith("data:") && !item.includes("[DONE]"));
    return JSON.parse((line ?? "data: {}").slice(5).trim()) as Record<
      string,
      unknown
    >;
  }
  return JSON.parse(text) as Record<string, unknown>;
}

test("gallery is usable at 320px with keyboard, labels, and copy feedback", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "MCP Apps example gallery" }),
  ).toBeVisible();
  await expect(
    page.getByText("not an official Model Context Protocol service", {
      exact: false,
    }),
  ).toBeVisible();
  const cards = page.locator("article.card");
  await expect(cards).toHaveCount(6);
  await expect(
    page.getByAltText(
      "Get Time app showing the current server time and a refresh button",
    ),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Copy MCP URL for Get Time" }),
  ).toBeVisible();
  const copy = page.getByRole("button", { name: "Copy MCP URL for Get Time" });
  await copy.focus();
  await expect(copy).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#copy-status")).not.toHaveText("");
});

test("get-time app html renders and can request a tool call", async ({
  page,
  request,
}) => {
  const listed = await mcpJson(request, "get-time", "tools/list", {}, 1);
  expect(JSON.stringify(listed)).toContain("get-time");

  const read = await mcpJson(
    request,
    "get-time",
    "resources/read",
    { uri: "ui://get-time/mcp-app.html" },
    2,
  );
  const contents =
    (
      read.result as
        { contents?: Array<{ text?: string; mimeType?: string }> } | undefined
    )?.contents ?? [];
  const html = contents[0]?.text ?? "";
  expect(contents[0]?.mimeType).toContain("text/html;profile=mcp-app");
  expect(html).toContain("Get Time");

  await page.setContent(`<!doctype html><html><body>
    <iframe id="app" title="get-time"></iframe>
    <pre id="log"></pre>
    <script>
      const iframe = document.getElementById('app');
      const log = [];
      window.addEventListener('message', async (event) => {
        const msg = event.data;
        if (!msg || msg.jsonrpc !== '2.0') return;
        log.push(msg.method || 'response');
        document.getElementById('log').textContent = log.join(',');
        if (msg.method === 'ui/initialize') {
          iframe.contentWindow.postMessage({
            jsonrpc: '2.0',
            id: msg.id,
            result: {
              protocolVersion: '2026-01-26',
              hostCapabilities: { openLinks: {}, serverTools: {} },
              hostInfo: { name: 'gallery-test-host', version: '1.0.0' },
              hostContext: { theme: 'light' }
            }
          }, '*');
        }
        if (msg.method === 'tools/call') {
          const res = await fetch('/apps/get-time/mcp', {
            method: 'POST',
            headers: {
              'content-type': 'application/json',
              accept: 'application/json, text/event-stream',
              'mcp-protocol-version': '2025-03-26'
            },
            body: JSON.stringify({ jsonrpc: '2.0', id: 99, method: 'tools/call', params: msg.params })
          });
          const text = await res.text();
          let parsed;
          try { parsed = JSON.parse(text); } catch {
            const line = text.split('\\n').find((item) => item.startsWith('data:'));
            parsed = line ? JSON.parse(line.slice(5).trim()) : null;
          }
          iframe.contentWindow.postMessage({
            jsonrpc: '2.0',
            id: msg.id,
            result: parsed?.result || { content: [{ type: 'text', text: '2026-08-17T12:00:00.000Z' }] }
          }, '*');
        }
      });
    </script>
  </body></html>`);

  await page.locator("#app").evaluate((frame, srcdoc) => {
    (frame as HTMLIFrameElement).srcdoc = srcdoc as string;
  }, html);

  const frame = page.frameLocator("#app");
  await expect(
    frame.getByRole("button", { name: "Get Server Time" }),
  ).toBeVisible({
    timeout: 15_000,
  });
  await frame.getByRole("button", { name: "Get Server Time" }).click();
  await expect(page.locator("#log")).toContainText("tools/call");
});

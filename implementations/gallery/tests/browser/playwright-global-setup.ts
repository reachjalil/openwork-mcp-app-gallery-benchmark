/**
 * Playwright global setup: make sure the resource bundle, the gallery site
 * (baked for the test origin), and the basic-host harness are built.
 */
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export default function globalSetup(): void {
  const root = path.dirname(
    path.dirname(path.dirname(fileURLToPath(import.meta.url))),
  );
  const run = (script: string, env: Record<string, string> = {}) => {
    execFileSync(process.execPath, [path.join(root, "scripts", script)], {
      stdio: "inherit",
      cwd: root,
      env: { ...process.env, ...env },
    });
  };
  if (!existsSync(path.join(root, "generated", "mcp-app-resources.json"))) {
    run("bundle-mcp-app-resources.mjs");
  }
  // The site must always be re-baked for the browser-test origin.
  run("build-site.mjs", { BASE_URL: "http://localhost:3999" });
  if (
    !existsSync(
      path.join(
        root,
        "upstream",
        "ext-apps",
        "basic-host",
        "dist",
        "index.html",
      ),
    ) ||
    !existsSync(
      path.join(
        root,
        "upstream",
        "ext-apps",
        "basic-host",
        "dist",
        "sandbox.html",
      ),
    )
  ) {
    run("build-harness.mjs");
  }
}

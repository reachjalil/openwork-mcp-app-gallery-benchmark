/**
 * Vitest global setup: contract tests exercise the real bundled resources,
 * so build generated/mcp-app-resources.json first when it is missing.
 */
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export default function setup(): void {
  const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
  const bundlePath = path.join(root, "generated", "mcp-app-resources.json");
  if (!existsSync(bundlePath)) {
    console.log("resource bundle missing — building it for the test run...");
    execFileSync(
      process.execPath,
      [path.join(root, "scripts", "bundle-mcp-app-resources.mjs")],
      { stdio: "inherit", cwd: root },
    );
  }
}

import { digestText, type ResourceBundle } from "../../src/resources.js";
import { REQUIRED_SLUGS, type AppSlug } from "../../src/constants.js";
import { RESOURCE_MIME_TYPE } from "../../src/mcp-app-adapter.js";
import { catalogBySlug } from "../../src/catalog.js";

export function fixtureBundle(): ResourceBundle {
  const resources: ResourceBundle["resources"] = {};
  for (const slug of REQUIRED_SLUGS) {
    const entry = catalogBySlug(slug);
    const html = `<!doctype html><html lang="en"><body><h1>${entry.displayName}</h1><button type="button">Get Server Time</button><canvas id="budget-chart"></canvas><div class="heatmap"></div></body></html>`;
    resources[slug] = {
      slug,
      uri: entry.resourceUri,
      mimeType: RESOURCE_MIME_TYPE,
      sha256: digestText(html),
      html,
      bytes: Buffer.byteLength(html, "utf8"),
    };
  }
  return { generatedAt: "test", resources };
}

export function hugeBundle(): ResourceBundle {
  const bundle = fixtureBundle();
  const huge = "x".repeat(1100 * 1024);
  const slug = "get-time" satisfies AppSlug;
  bundle.resources[slug] = {
    slug,
    uri: "ui://get-time/mcp-app.html",
    mimeType: RESOURCE_MIME_TYPE,
    sha256: digestText(huge),
    html: huge,
    bytes: Buffer.byteLength(huge, "utf8"),
  };
  return bundle;
}

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export function loadGalleryHtml(override?: string): string {
  if (override !== undefined) return override;
  const candidates = [
    new URL("../generated/gallery.html", import.meta.url),
    new URL("../public/index.html", import.meta.url),
  ];
  for (const candidate of candidates) {
    try {
      return readFileSync(fileURLToPath(candidate), "utf8");
    } catch {
      continue;
    }
  }
  throw new Error("Gallery HTML is missing from the Function bundle");
}

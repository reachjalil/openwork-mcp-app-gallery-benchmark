import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parse } from "yaml";

const root = process.cwd();
const lock = parse(await readFile(resolve(root, "pnpm-lock.yaml"), "utf8")) as {
  packages?: Record<string, unknown>;
};
const components = Object.keys(lock.packages ?? {})
  .flatMap((key) => {
    const clean = key.replace(/^\//u, "").split("(", 1)[0]!;
    const splitAt = clean.lastIndexOf("@");
    if (splitAt <= 0) return [];
    const name = clean.slice(0, splitAt);
    const version = clean.slice(splitAt + 1);
    if (!name || !version) return [];
    return [
      {
        type: "library",
        name,
        version,
        purl: `pkg:npm/${encodeURIComponent(name)}@${version}`,
      },
    ];
  })
  .sort((left, right) => left.purl.localeCompare(right.purl));

await writeFile(
  resolve(root, "generated/sbom.cdx.json"),
  `${JSON.stringify(
    {
      bomFormat: "CycloneDX",
      specVersion: "1.6",
      serialNumber: "urn:uuid:7587c795-c5b4-4a57-91c2-3f5a0cbfba12",
      version: 1,
      metadata: {
        component: {
          type: "application",
          name: "openwork-mcp-app-gallery-sol",
          version: "1.0.0",
        },
      },
      components,
    },
    null,
    2,
  )}\n`,
  "utf8",
);

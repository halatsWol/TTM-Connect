// Stage per-browser builds of the extension.
//
// The repo's manifest.json carries BOTH background keys so the folder loads unpacked on either
// engine. For store-ready packages we tailor a manifest per target so each contains only what that
// engine uses:
//   - chromium: background = { service_worker }  (drop `scripts`; drop the Firefox-only gecko block)
//   - firefox : background = { scripts }          (drop `service_worker`; keep gecko settings)
//
// Output: build/<target>/ containing the tailored manifest + the runtime files. Zipping is left to
// the caller (package.ps1 locally, `zip` in CI) so no zip dependency is needed here.
//
// Usage: node scripts/build.mjs [chromium|firefox]   (no arg = both)

import { readFileSync, writeFileSync, rmSync, mkdirSync, cpSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const base = JSON.parse(readFileSync(join(root, "manifest.json"), "utf8"));

// Runtime files that belong in the shipped package (docs/scripts are excluded on purpose).
const INCLUDE = ["src", "icons"];

const TARGETS = {
  chromium(m) {
    m.background = { service_worker: m.background.service_worker };
    delete m.browser_specific_settings; // Firefox-only; keep the Chrome package clean
    return m;
  },
  firefox(m) {
    m.background = { scripts: m.background.scripts };
    return m;
  },
};

const arg = process.argv[2];
const targets = arg ? [arg] : Object.keys(TARGETS);

for (const t of targets) {
  const tailor = TARGETS[t];
  if (!tailor) {
    console.error(`unknown target "${t}" (expected: ${Object.keys(TARGETS).join(", ")})`);
    process.exit(1);
  }

  const outDir = join(root, "build", t);
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });

  const manifest = tailor(structuredClone(base));
  writeFileSync(join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");

  for (const dir of INCLUDE) {
    cpSync(join(root, dir), join(outDir, dir), { recursive: true });
  }

  console.log(`staged ${t} (v${base.version}) -> build/${t}`);
}

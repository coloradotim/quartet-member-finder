#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const batchId = "QMF_PROD_DEMO_20260501";
const confirmation = process.env.QMF_PROD_DEMO_CONFIRM;
const useLocal = process.argv.includes("--local");

if (confirmation !== batchId) {
  console.error(
    `Refusing to load production demo data. Set QMF_PROD_DEMO_CONFIRM=${batchId} to confirm.`,
  );
  process.exit(1);
}

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(scriptDir, "..", "..");
const seedFile = join(repoRoot, "supabase", "prod-demo-seed.sql");

const args = [
  "db",
  "query",
  useLocal ? "--local" : "--linked",
  "--file",
  seedFile,
  "--output",
  "table",
];

const result = spawnSync("supabase", args, {
  cwd: repoRoot,
  stdio: "inherit",
});

process.exit(result.status ?? 1);

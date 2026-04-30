#!/usr/bin/env node
import {
  dashboardSpecPath,
  readDashboardSpec,
  validateDashboardSpec,
} from "./dashboard-utils.mjs";

const spec = await readDashboardSpec();
const errors = validateDashboardSpec(spec);

if (errors.length > 0) {
  for (const error of errors) {
    console.error(error);
  }
  process.exit(1);
}

console.log(
  `Dashboard spec OK: ${dashboardSpecPath} (${spec.dashboards.length} dashboards)`,
);

#!/usr/bin/env node
import {
  findDashboardByName,
  findInsightByName,
  parseArgs,
} from "./dashboard-utils.mjs";

const args = parseArgs(process.argv.slice(2));

if (!args.dashboard && !args.insight) {
  console.error(
    'Pass --dashboard "Dashboard name" or --insight "Insight name".',
  );
  process.exit(1);
}

if (args.dashboard) {
  const dashboard = await findDashboardByName(args.dashboard);
  console.log(JSON.stringify(dashboard, null, 2));
}

if (args.insight) {
  const insight = await findInsightByName(args.insight);
  console.log(JSON.stringify(insight, null, 2));
}

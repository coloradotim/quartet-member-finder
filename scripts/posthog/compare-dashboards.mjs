#!/usr/bin/env node
import { findInsightByName, parseArgs } from "./dashboard-utils.mjs";

const args = parseArgs(process.argv.slice(2));

if (!args.left || !args.right) {
  console.error('Pass --left "Insight name" --right "Insight name".');
  process.exit(1);
}

const left = await findInsightByName(args.left);
const right = await findInsightByName(args.right);

console.log(
  JSON.stringify(
    {
      left: {
        filters: left?.filters,
        name: left?.name,
        query: left?.query,
      },
      right: {
        filters: right?.filters,
        name: right?.name,
        query: right?.query,
      },
    },
    null,
    2,
  ),
);

#!/usr/bin/env node
import {
  dashboardIdsForInsight,
  findDashboardByName,
  findInsightByName,
  insightQuery,
  parseArgs,
  posthogApi,
  posthogConfig,
  readDashboardSpec,
  validateDashboardSpec,
} from "./dashboard-utils.mjs";

const args = parseArgs(process.argv.slice(2));
const spec = await readDashboardSpec();
const errors = validateDashboardSpec(spec);

if (errors.length > 0) {
  for (const error of errors) {
    console.error(error);
  }
  process.exit(1);
}

const only = args.only ? new Set(args.only) : null;
const dashboardName = args.sandbox
  ? "Quartet Member Finder - Dashboard Sync Sandbox"
  : null;

for (const dashboardSpec of spec.dashboards) {
  const selectedInsights = dashboardSpec.insights.filter(
    (insight) => !only || only.has(insight.key),
  );

  if (selectedInsights.length === 0) {
    continue;
  }

  const name = dashboardName || dashboardSpec.name;
  const existingDashboard = await findDashboardByName(name);
  const dashboard =
    existingDashboard ||
    (await posthogApi("/dashboards/", {
      body: {
        description: args.sandbox
          ? "Sandbox dashboard for testing repo-managed QMF dashboard cards."
          : dashboardSpec.description,
        name,
        pinned: true,
        tags: spec.tags,
      },
      method: "POST",
    }));

  if (existingDashboard) {
    await posthogApi(`/dashboards/${dashboard.id}/`, {
      body: {
        description: args.sandbox
          ? "Sandbox dashboard for testing repo-managed QMF dashboard cards."
          : dashboardSpec.description,
        name,
        pinned: true,
        tags: spec.tags,
      },
      method: "PATCH",
    });
  }

  console.log(
    `${existingDashboard ? "Using" : "Created"} dashboard: ${dashboard.name} (${dashboard.id})`,
  );

  for (const insightSpec of selectedInsights) {
    const insightName = args.sandbox
      ? `Sandbox - ${insightSpec.name}`
      : insightSpec.name;
    const existingInsight = await findInsightByName(insightName);
    const payload = {
      dashboards: [dashboard.id],
      description: insightSpec.description,
      name: insightName,
      query: insightQuery(insightSpec),
      saved: true,
      tags: spec.tags,
    };

    if (existingInsight) {
      const dashboardIds = dashboardIdsForInsight(existingInsight);
      await posthogApi(`/insights/${existingInsight.id}/`, {
        body: {
          ...payload,
          dashboards: Array.from(new Set([...dashboardIds, dashboard.id])),
        },
        method: "PATCH",
      });
      console.log(`  Updated insight: ${insightName} (${existingInsight.id})`);
      continue;
    }

    const insight = await posthogApi("/insights/", {
      body: payload,
      method: "POST",
    });

    console.log(`  Created insight: ${insight.name} (${insight.id})`);
  }
}

const { environmentId, host } = posthogConfig();
console.log(
  `Dashboard sync complete for PostHog environment ${environmentId} at ${host}.`,
);

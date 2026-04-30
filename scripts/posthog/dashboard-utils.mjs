import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "../..");
export const dashboardSpecPath = join(
  repoRoot,
  "analytics/posthog/dashboards.json",
);

export async function readDashboardSpec() {
  return JSON.parse(await readFile(dashboardSpecPath, "utf8"));
}

export function posthogConfig() {
  const environmentId =
    process.env.POSTHOG_ENVIRONMENT_ID ||
    process.env.POSTHOG_PROJECT_ID ||
    "404599";
  const personalApiKey = process.env.POSTHOG_PERSONAL_API_KEY;
  const host = (process.env.POSTHOG_HOST || "https://us.posthog.com").replace(
    /\/$/,
    "",
  );

  return { environmentId, host, personalApiKey };
}

export function requirePosthogConfig() {
  const config = posthogConfig();

  if (!config.personalApiKey) {
    console.error(
      "Missing POSTHOG_PERSONAL_API_KEY. Create a PostHog personal API key with dashboard/insight read-write access, then rerun.",
    );
    process.exit(1);
  }

  return config;
}

export async function posthogApi(path, { body, method = "GET" } = {}) {
  const { environmentId, host, personalApiKey } = requirePosthogConfig();
  const response = await fetch(`${host}/api/projects/${environmentId}${path}`, {
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      authorization: `Bearer ${personalApiKey}`,
      "content-type": "application/json",
    },
    method,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `PostHog API ${method} ${path} failed with ${response.status}: ${text}`,
    );
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export function parseArgs(args) {
  const parsed = {
    only: null,
    sandbox: false,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--sandbox") {
      parsed.sandbox = true;
    } else if (arg === "--only") {
      parsed.only = (args[index + 1] || "")
        .split(",")
        .map((key) => key.trim())
        .filter(Boolean);
      index += 1;
    } else if (arg.startsWith("--only=")) {
      parsed.only = arg
        .slice("--only=".length)
        .split(",")
        .map((key) => key.trim())
        .filter(Boolean);
    } else if (arg === "--dashboard") {
      parsed.dashboard = args[index + 1];
      index += 1;
    } else if (arg === "--insight") {
      parsed.insight = args[index + 1];
      index += 1;
    } else if (arg === "--left") {
      parsed.left = args[index + 1];
      index += 1;
    } else if (arg === "--right") {
      parsed.right = args[index + 1];
      index += 1;
    }
  }

  return parsed;
}

export function dashboardIdsForInsight(insight) {
  if (!Array.isArray(insight.dashboards)) {
    return [];
  }

  return insight.dashboards
    .map((dashboard) =>
      typeof dashboard === "number" ? dashboard : dashboard?.id,
    )
    .filter(Boolean);
}

export async function findDashboardByName(name) {
  const response = await posthogApi(
    `/dashboards/?search=${encodeURIComponent(name)}`,
  );
  const dashboards = response.results || response;

  return dashboards.find((dashboard) => dashboard.name === name) || null;
}

export async function findInsightByName(name) {
  const response = await posthogApi(
    `/insights/?saved=true&search=${encodeURIComponent(name)}`,
  );
  const insights = response.results || response;

  return insights.find((insight) => insight.name === name) || null;
}

function seriesMath(series) {
  if (series.math === "dau") {
    return "dau";
  }

  if (series.math === "weekly_active") {
    return "weekly_active";
  }

  return series.math || "total";
}

export function seriesToEventsNode(series) {
  return {
    event: series.event,
    kind: "EventsNode",
    math: seriesMath(series),
    math_property: series.mathProperty,
    name: series.event,
  };
}

function breakdownFilter(insight) {
  if (!insight.breakdown) {
    return undefined;
  }

  return {
    breakdowns: [
      {
        property: insight.breakdown,
        type: insight.breakdown.startsWith("$") ? "person" : "event",
      },
    ],
  };
}

function insightProperties(insight) {
  if (!Array.isArray(insight.properties)) {
    return undefined;
  }

  return insight.properties.map((property) => ({
    key: property.key,
    operator: property.operator || "exact",
    type: property.type || "event",
    value: property.value,
  }));
}

function sourceQuery(insight) {
  if (insight.type === "funnel") {
    return {
      breakdownFilter: breakdownFilter(insight),
      dateRange: {
        date_from: insight.dateFrom,
      },
      funnelsFilter: {
        funnelOrderType: "ordered",
        layout: "horizontal",
      },
      kind: "FunnelsQuery",
      series: insight.series.map(seriesToEventsNode),
    };
  }

  return {
    breakdownFilter: breakdownFilter(insight),
    dateRange: {
      date_from: insight.dateFrom,
    },
    kind: "TrendsQuery",
    properties: insightProperties(insight),
    series: insight.series.map(seriesToEventsNode),
    trendsFilter: {
      display: insight.display || "ActionsLineGraph",
    },
  };
}

export function insightQuery(insight) {
  return {
    kind: "InsightVizNode",
    source: sourceQuery(insight),
  };
}

export function validateDashboardSpec(spec) {
  const errors = [];
  const dashboardKeys = new Set();
  const insightKeys = new Set();

  if (spec.version !== 1) {
    errors.push("Expected dashboard spec version 1.");
  }

  for (const dashboard of spec.dashboards || []) {
    if (!dashboard.key || dashboardKeys.has(dashboard.key)) {
      errors.push(`Dashboard has missing or duplicate key: ${dashboard.key}`);
    }
    dashboardKeys.add(dashboard.key);

    if (!dashboard.name) {
      errors.push(`Dashboard ${dashboard.key} is missing a name.`);
    }

    for (const insight of dashboard.insights || []) {
      if (!insight.key || insightKeys.has(insight.key)) {
        errors.push(`Insight has missing or duplicate key: ${insight.key}`);
      }
      insightKeys.add(insight.key);

      if (!["funnel", "trend"].includes(insight.type)) {
        errors.push(
          `Insight ${insight.key} has unsupported type ${insight.type}.`,
        );
      }

      if (!Array.isArray(insight.series) || insight.series.length === 0) {
        errors.push(
          `Insight ${insight.key} must define at least one event series.`,
        );
      }
    }
  }

  return errors;
}

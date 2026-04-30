import { createHash, randomUUID } from "node:crypto";

export const PRODUCT_ANALYTICS_EVENTS = [
  "analytics_client_ready",
  "app_route_viewed",
  "user_logged_in",
  "onboarding_completed",
  "onboarding_skipped",
  "singer_profile_saved",
  "quartet_listing_saved",
  "discovery_search_submitted",
  "map_viewed",
  "contact_request_submitted",
  "feedback_submitted",
] as const;

export type ProductAnalyticsEvent = (typeof PRODUCT_ANALYTICS_EVENTS)[number];

export type ProductAnalyticsProperties = Record<
  string,
  boolean | number | string | null | undefined
>;

type AnalyticsConfig = {
  host: string;
  key: string;
};

const DEFAULT_POSTHOG_HOST = "https://us.i.posthog.com";
const SAFE_PROPERTY_KEYS = new Set([
  "feedback_type",
  "filter_count",
  "has_availability_filter",
  "has_country_filter",
  "has_experience_filter",
  "has_goal_filter",
  "has_country",
  "has_locality_filter",
  "has_locality",
  "has_part_filter",
  "has_public_location_label",
  "has_region_filter",
  "has_travel_filter",
  "is_visible",
  "kind",
  "onboarding_choice",
  "route",
  "result_count",
  "route_area",
  "status",
  "target_kind",
  "visibility_enabled",
]);

export function productAnalyticsIsConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY);
}

export function getProductAnalyticsConfig(): AnalyticsConfig | null {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim();

  if (!key) {
    return null;
  }

  return {
    host:
      process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim().replace(/\/$/, "") ||
      DEFAULT_POSTHOG_HOST,
    key,
  };
}

export function isProductAnalyticsEvent(
  event: string,
): event is ProductAnalyticsEvent {
  return PRODUCT_ANALYTICS_EVENTS.includes(event as ProductAnalyticsEvent);
}

export function sanitizeAnalyticsProperties(
  properties: ProductAnalyticsProperties = {},
) {
  const sanitized: Record<string, boolean | number | string | null> = {};

  for (const [key, value] of Object.entries(properties)) {
    if (!SAFE_PROPERTY_KEYS.has(key) || value === undefined) {
      continue;
    }

    if (
      typeof value === "boolean" ||
      typeof value === "number" ||
      typeof value === "string" ||
      value === null
    ) {
      sanitized[key] = typeof value === "string" ? value.slice(0, 160) : value;
    }
  }

  return sanitized;
}

export function pseudonymousAnalyticsUserId(userId: string) {
  return createHash("sha256")
    .update(`qmf-analytics:${userId}`)
    .digest("hex")
    .slice(0, 32);
}

export function createAnonymousAnalyticsId() {
  return `anon_${randomUUID()}`;
}

export async function captureProductEvent(
  event: ProductAnalyticsEvent,
  properties: ProductAnalyticsProperties = {},
  options: { distinctId?: string } = {},
) {
  const config = getProductAnalyticsConfig();

  if (!config) {
    return { ok: false, skipped: true };
  }

  const distinctId = options.distinctId ?? createAnonymousAnalyticsId();

  try {
    const response = await fetch(`${config.host}/capture/`, {
      body: JSON.stringify({
        api_key: config.key,
        distinct_id: distinctId,
        event,
        properties: {
          ...sanitizeAnalyticsProperties(properties),
          app: "quartet_member_finder",
        },
      }),
      cache: "no-store",
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
    });

    return { ok: response.ok, skipped: false };
  } catch {
    return { ok: false, skipped: false };
  }
}

import { createHash, randomUUID } from "node:crypto";

export const PRODUCT_ANALYTICS_EVENTS = [
  "analytics_client_ready",
  "app_route_viewed",
  "sign_in_started",
  "sign_in_completed",
  "user_logged_in",
  "onboarding_viewed",
  "onboarding_intent_selected",
  "onboarding_completed",
  "onboarding_skipped",
  "singer_profile_saved",
  "singer_profile_visibility_changed",
  "quartet_listing_saved",
  "quartet_listing_visibility_changed",
  "discovery_search_submitted",
  "find_searched",
  "map_viewed",
  "contact_request_submitted",
  "message_sent",
  "message_viewed",
  "message_replied",
  "message_report_submitted",
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
  "distance_unit",
  "feedback_type",
  "filter_count",
  "has_availability_filter",
  "has_country_filter",
  "has_experience_filter",
  "has_goal_filter",
  "has_country",
  "has_location_filter",
  "has_locality_filter",
  "has_locality",
  "has_part_filter",
  "has_public_location_label",
  "has_radius_filter",
  "has_region_filter",
  "has_search_origin",
  "has_travel_filter",
  "is_visible",
  "kind",
  "onboarding_choice",
  "participant_role",
  "reply_count",
  "report_category",
  "route",
  "result_count",
  "route_area",
  "search_origin",
  "status",
  "target_kind",
  "visibility_enabled",
]);
const SENSITIVE_PROPERTY_KEY_PATTERN =
  /(address|bio|body|coordinate|description|email|id|latitude|longitude|message|name|note|phone|postal|recipient|sender|token|user|zip)/i;
const UUID_SEGMENT_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function sanitizeRoute(value: string) {
  const [withoutHash] = value.split("#");
  const [pathname] = withoutHash.split("?");
  const safePathname = pathname.startsWith("/") ? pathname : "/";
  const segments = safePathname.split("/").map((segment, index) => {
    if (index === 0) {
      return segment;
    }

    if (UUID_SEGMENT_PATTERN.test(segment)) {
      return "[id]";
    }

    return segment;
  });

  return segments.join("/").slice(0, 160);
}

function sanitizeStringProperty(key: string, value: string) {
  if (key === "route") {
    return sanitizeRoute(value);
  }

  return value.slice(0, 160);
}

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
    if (
      !SAFE_PROPERTY_KEYS.has(key) ||
      SENSITIVE_PROPERTY_KEY_PATTERN.test(key) ||
      value === undefined
    ) {
      continue;
    }

    if (
      typeof value === "boolean" ||
      typeof value === "number" ||
      typeof value === "string" ||
      value === null
    ) {
      sanitized[key] =
        typeof value === "string" ? sanitizeStringProperty(key, value) : value;
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

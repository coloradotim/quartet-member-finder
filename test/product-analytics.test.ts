import { describe, expect, it, vi } from "vitest";
import {
  getProductAnalyticsConfig,
  isProductAnalyticsEvent,
  productAnalyticsIsConfigured,
  pseudonymousAnalyticsUserId,
  sanitizeAnalyticsProperties,
} from "@/lib/analytics/product-analytics";

describe("product analytics helpers", () => {
  it("only accepts allowlisted analytics events", () => {
    expect(isProductAnalyticsEvent("analytics_client_ready")).toBe(true);
    expect(isProductAnalyticsEvent("app_route_viewed")).toBe(true);
    expect(isProductAnalyticsEvent("user_logged_in")).toBe(true);
    expect(isProductAnalyticsEvent("contact_request_submitted")).toBe(true);
    expect(isProductAnalyticsEvent("profile_bio_changed")).toBe(false);
  });

  it("drops private or unknown event properties", () => {
    expect(
      sanitizeAnalyticsProperties({
        email: "singer@example.com",
        feedback_type: "bug",
        has_country: true,
        has_locality: false,
        latitude_private: 40.5,
        message_body: "private message",
        route: "/help",
        postal_code_private: "M1 TEST",
        result_count: 2,
      }),
    ).toEqual({
      feedback_type: "bug",
      has_country: true,
      has_locality: false,
      route: "/help",
      result_count: 2,
    });
  });

  it("uses PostHog configuration only when a project key is present", () => {
    vi.unstubAllEnvs();
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "");

    expect(productAnalyticsIsConfigured()).toBe(false);
    expect(getProductAnalyticsConfig()).toBeNull();

    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "ph_project_key");
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_HOST", "https://eu.i.posthog.com/");

    expect(productAnalyticsIsConfigured()).toBe(true);
    expect(getProductAnalyticsConfig()).toEqual({
      host: "https://eu.i.posthog.com",
      key: "ph_project_key",
    });

    vi.unstubAllEnvs();
  });

  it("creates a stable pseudonymous user id without exposing the source id", () => {
    const userId = "123e4567-e89b-12d3-a456-426614174000";

    expect(pseudonymousAnalyticsUserId(userId)).toBe(
      pseudonymousAnalyticsUserId(userId),
    );
    expect(pseudonymousAnalyticsUserId(userId)).not.toContain(userId);
    expect(pseudonymousAnalyticsUserId(userId)).toHaveLength(32);
  });
});

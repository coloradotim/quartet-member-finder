"use client";

import type {
  ProductAnalyticsEvent,
  ProductAnalyticsProperties,
} from "@/lib/analytics/product-analytics";

const ANALYTICS_ID_STORAGE_KEY = "qmf_analytics_id";
const ANALYTICS_READY_STORAGE_KEY = "qmf_analytics_ready";

function browserAnalyticsId() {
  if (typeof window === "undefined") {
    return "browser";
  }

  const existing = window.localStorage.getItem(ANALYTICS_ID_STORAGE_KEY);

  if (existing) {
    return existing;
  }

  const created = `anon_${window.crypto.randomUUID()}`;
  window.localStorage.setItem(ANALYTICS_ID_STORAGE_KEY, created);

  return created;
}

export function trackClientProductEvent(
  event: ProductAnalyticsEvent,
  properties: ProductAnalyticsProperties = {},
) {
  if (typeof window === "undefined") {
    return;
  }

  const payload = JSON.stringify({
    distinctId: browserAnalyticsId(),
    event,
    properties,
  });

  if (navigator.sendBeacon) {
    const blob = new Blob([payload], { type: "application/json" });
    navigator.sendBeacon("/api/analytics", blob);
    return;
  }

  void fetch("/api/analytics", {
    body: payload,
    headers: {
      "content-type": "application/json",
    },
    keepalive: true,
    method: "POST",
  });
}

export function trackAnalyticsClientReady() {
  if (typeof window === "undefined") {
    return;
  }

  if (window.sessionStorage.getItem(ANALYTICS_READY_STORAGE_KEY)) {
    return;
  }

  window.sessionStorage.setItem(ANALYTICS_READY_STORAGE_KEY, "1");
  trackClientProductEvent("analytics_client_ready");
}

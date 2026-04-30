import { NextResponse } from "next/server";
import {
  captureProductEvent,
  isProductAnalyticsEvent,
  type ProductAnalyticsProperties,
} from "@/lib/analytics/product-analytics";

type AnalyticsRequestBody = {
  distinctId?: unknown;
  event?: unknown;
  properties?: unknown;
};

function safeProperties(value: unknown): ProductAnalyticsProperties {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as ProductAnalyticsProperties;
}

export async function POST(request: Request) {
  let body: AnalyticsRequestBody;

  try {
    body = (await request.json()) as AnalyticsRequestBody;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (typeof body.event !== "string" || !isProductAnalyticsEvent(body.event)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const distinctId =
    typeof body.distinctId === "string" && body.distinctId.startsWith("anon_")
      ? body.distinctId.slice(0, 80)
      : undefined;

  await captureProductEvent(body.event, safeProperties(body.properties), {
    distinctId,
  });

  return NextResponse.json({ ok: true });
}

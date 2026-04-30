import { NextResponse } from "next/server";
import { getProductAnalyticsConfig } from "@/lib/analytics/product-analytics";

export function GET() {
  const config = getProductAnalyticsConfig();

  return NextResponse.json({
    posthogConfigured: Boolean(config),
    posthogHost: config?.host ?? null,
    posthogHostConfigured: Boolean(process.env.NEXT_PUBLIC_POSTHOG_HOST),
    posthogKeyPresent: Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY),
    vercelEnvironment: process.env.VERCEL_ENV ?? null,
    vercelGitCommitSha: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
}

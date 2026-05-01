"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  trackAnalyticsClientReady,
  trackClientProductEvent,
} from "@/lib/analytics/client-analytics";

function routeArea(pathname: string) {
  if (pathname.startsWith("/app")) {
    return "signed_in_app";
  }

  if (
    pathname === "/find" ||
    pathname === "/map" ||
    pathname === "/singers" ||
    pathname === "/quartets"
  ) {
    return "discovery";
  }

  if (pathname === "/help" || pathname === "/privacy") {
    return "support";
  }

  if (pathname === "/sign-in") {
    return "auth";
  }

  return "public";
}

export function AnalyticsPageTracker() {
  const pathname = usePathname();

  useEffect(() => {
    trackAnalyticsClientReady();
  }, []);

  useEffect(() => {
    trackClientProductEvent("app_route_viewed", {
      route: pathname,
      route_area: routeArea(pathname),
    });
  }, [pathname]);

  return null;
}

import { describe, expect, it } from "vitest";
import {
  quartetModeDashboardActions,
  singerDashboardActions,
  supportDashboardActions,
} from "@/lib/dashboard/app-dashboard";

describe("signed-in app dashboard", () => {
  it("foregrounds the singer workflow with all primary next actions", () => {
    expect(singerDashboardActions.map((action) => action.label)).toEqual([
      "My Singer Profile",
      "Find Quartet Openings",
      "Find Singers",
      "View Map",
    ]);
  });

  it("keeps quartet mode separate from the primary singer workflow", () => {
    expect(quartetModeDashboardActions.map((action) => action.label)).toEqual([
      "Manage Quartet Listing",
      "Find Singers",
    ]);
  });

  it("links every dashboard action to an existing route", () => {
    expect([
      ...singerDashboardActions,
      ...quartetModeDashboardActions,
      ...supportDashboardActions,
    ]).toEqual([
      expect.objectContaining({ href: "/app/profile" }),
      expect.objectContaining({ href: "/quartets" }),
      expect.objectContaining({ href: "/singers" }),
      expect.objectContaining({ href: "/map" }),
      expect.objectContaining({ href: "/app/listings" }),
      expect.objectContaining({ href: "/singers" }),
      expect.objectContaining({ href: "/app/settings" }),
      expect.objectContaining({ href: "/help" }),
      expect.objectContaining({ href: "/privacy" }),
    ]);
  });
});

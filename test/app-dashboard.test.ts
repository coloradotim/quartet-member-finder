import { describe, expect, it } from "vitest";
import {
  quartetDashboardActions,
  singerDashboardActions,
  supportDashboardActions,
} from "@/lib/dashboard/app-dashboard";

describe("signed-in app dashboard", () => {
  it("foregrounds the singer workflow with all primary next actions", () => {
    expect(singerDashboardActions.map((action) => action.label)).toEqual([
      "My Singer Profile",
      "Find quartet openings",
    ]);
  });

  it("keeps the quartet profile separate from the singer profile", () => {
    expect(quartetDashboardActions.map((action) => action.label)).toEqual([
      "My Quartet Profile",
      "Find singers",
    ]);
  });

  it("links every dashboard action to an existing route", () => {
    expect([
      ...singerDashboardActions,
      ...quartetDashboardActions,
      ...supportDashboardActions,
    ]).toEqual([
      expect.objectContaining({ href: "/app/profile" }),
      expect.objectContaining({ href: "/find?kind=quartets" }),
      expect.objectContaining({ href: "/app/listings" }),
      expect.objectContaining({ href: "/find?kind=singers" }),
      expect.objectContaining({ href: "/app/messages" }),
      expect.objectContaining({ href: "/help" }),
      expect.objectContaining({ href: "/privacy" }),
    ]);
  });
});

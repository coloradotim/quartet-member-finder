import { describe, expect, it } from "vitest";
import {
  publicNavigationLinks,
  siteFooterLinks,
} from "@/lib/navigation/site-navigation";

describe("site navigation", () => {
  it("keeps public discovery and help links available before login", () => {
    expect(publicNavigationLinks).toEqual([
      { href: "/quartets", label: "Find Quartet Openings" },
      { href: "/singers", label: "Find Singers" },
      { href: "/map", label: "Map" },
      { href: "/sign-in", label: "Sign in" },
      { href: "/help", label: "Help" },
    ]);
  });

  it("keeps stable site resources in the shared footer", () => {
    expect(siteFooterLinks).toEqual([
      { href: "/help", label: "Help" },
      { href: "/privacy", label: "Privacy" },
      {
        href: "https://github.com/coloradotim/quartet-member-finder",
        label: "GitHub",
      },
    ]);
  });
});

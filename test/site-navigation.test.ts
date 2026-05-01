import { describe, expect, it } from "vitest";
import {
  publicNavigationLinks,
  siteFooterLinks,
} from "@/lib/navigation/site-navigation";

describe("site navigation", () => {
  it("keeps public navigation focused on help, privacy, and sign-in", () => {
    expect(publicNavigationLinks).toEqual([
      { href: "/help", label: "Help" },
      { href: "/privacy", label: "Privacy" },
      { href: "/sign-in", label: "Sign in" },
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

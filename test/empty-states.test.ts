import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(path, "utf8");
}

function normalizedSource(path: string) {
  return source(path).replace(/\s+/g, " ");
}

describe("empty and first-time states", () => {
  it("guides first-time signed-in users from profile and Quartet Mode forms", () => {
    const profilePage = source("app/(protected)/app/profile/page.tsx");
    const listingPage = source("app/(protected)/app/listings/page.tsx");

    expect(profilePage).toContain("Create My Singer Profile");
    expect(profilePage).toContain("Your profile is hidden");
    expect(profilePage).toContain("Find Singers");
    expect(listingPage).toContain("Start Quartet Mode");
    expect(listingPage).toContain("This quartet listing is hidden");
    expect(listingPage).toContain("Find Quartet Openings");
  });

  it("turns public discovery no-results states into next actions", () => {
    const singersPage = source("app/singers/page.tsx");
    const quartetsPage = source("app/quartets/page.tsx");
    const mapPage = source("app/map/page.tsx");

    expect(singersPage).toContain("No visible singer profiles match");
    expect(singersPage).toContain("Clear filters");
    expect(quartetsPage).toContain("No visible quartet openings match");
    expect(quartetsPage).toContain("Quartet Mode listing");
    expect(mapPage).toContain("No approximate map regions match");
    expect(mapPage).toContain("approximate public location data");
  });

  it("explains sign-in for contact and feedback without exposing private data", () => {
    const contactForm = source("components/contact/contact-request-form.tsx");
    const helpPage = normalizedSource("app/help/page.tsx");

    expect(contactForm).toContain("Contact starts through the app");
    expect(contactForm).toContain("personal email addresses and phone");
    expect(contactForm).toContain("asked to sign in");
    expect(helpPage).toContain("Sign in if you want to send private feedback");
    expect(helpPage).toContain("prevent spam");
  });
});

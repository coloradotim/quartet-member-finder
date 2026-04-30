import { describe, expect, it, vi } from "vitest";
import {
  CONTACT_RATE_LIMIT_COUNT,
  CONTACT_RATE_LIMIT_WINDOW_MINUTES,
  buildContactNotificationEmail,
  contactRateLimitWindowStart,
  getContactRelayConfig,
  normalizeReturnTo,
  parseContactRequestFormData,
} from "@/lib/contact/contact-relay";

describe("contact relay helpers", () => {
  it("parses a valid singer contact request without recipient email fields", () => {
    const formData = new FormData();
    formData.set("targetKind", "singer");
    formData.set("targetId", "123e4567-e89b-12d3-a456-426614174000");
    formData.set("message", "Would you be interested in a pickup quartet?");
    formData.set("returnTo", "/singers?part=lead");

    expect(parseContactRequestFormData(formData)).toEqual({
      message: "Would you be interested in a pickup quartet?",
      returnTo: "/singers?part=lead",
      targetId: "123e4567-e89b-12d3-a456-426614174000",
      targetKind: "singer",
    });
    expect(Array.from(formData.keys())).not.toContain("recipientEmail");
  });

  it("rejects invalid targets and unsafe return paths", () => {
    const formData = new FormData();
    formData.set("targetKind", "melody");
    formData.set("targetId", "not-a-uuid");
    formData.set("message", "Hello");

    expect(() => parseContactRequestFormData(formData)).toThrow(
      "Choose a valid contact target.",
    );
    expect(normalizeReturnTo("https://example.com")).toBe("/");
    expect(normalizeReturnTo("//example.com")).toBe("/");
  });

  it("builds recipient notification without revealing direct sender contact", () => {
    const { subject, text } = buildContactNotificationEmail({
      message: "We are looking for a bass.",
      requestId: "request-1",
      senderDisplayName: "A signed-in Quartet Member Finder user",
      target: {
        id: "target-1",
        kind: "quartet",
        name: "Chord Harbor",
      },
    });

    expect(subject).toContain("Chord Harbor");
    expect(text).toContain("We are looking for a bass.");
    expect(text).toContain("Your email address was not shown to the sender.");
    expect(text).not.toContain("@example.com");
  });

  it("reads Resend configuration only from server environment", () => {
    vi.stubEnv("RESEND_API_KEY", "resend-key");
    vi.stubEnv("RESEND_FROM_EMAIL", "messages@example.com");

    expect(getContactRelayConfig()).toEqual({
      apiKey: "resend-key",
      fromEmail: "messages@example.com",
    });

    vi.unstubAllEnvs();
    expect(getContactRelayConfig()).toBeNull();
  });

  it("defines a basic sender rate-limit window", () => {
    expect(CONTACT_RATE_LIMIT_COUNT).toBe(5);
    expect(CONTACT_RATE_LIMIT_WINDOW_MINUTES).toBe(60);
    expect(contactRateLimitWindowStart(new Date("2026-04-30T12:00:00Z"))).toBe(
      "2026-04-30T11:00:00.000Z",
    );
  });
});

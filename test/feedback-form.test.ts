import { describe, expect, it } from "vitest";
import {
  FEEDBACK_RATE_LIMIT_COUNT,
  FEEDBACK_RATE_LIMIT_WINDOW_MINUTES,
  feedbackRateLimitWindowStart,
  normalizeFeedbackContext,
  parseFeedbackFormData,
} from "@/lib/feedback/feedback-form";

describe("feedback form helpers", () => {
  it("parses authenticated help feedback without client-owned identity fields", () => {
    const formData = new FormData();
    formData.set("feedbackType", "bug");
    formData.set("message", "The quartet search filter reset unexpectedly.");
    formData.set("contextPath", "/help");

    expect(parseFeedbackFormData(formData)).toEqual({
      contextPath: "/help",
      feedbackType: "bug",
      message: "The quartet search filter reset unexpectedly.",
    });
    expect(Array.from(formData.keys())).not.toContain("submitterUserId");
    expect(Array.from(formData.keys())).not.toContain("submitterEmail");
  });

  it("rejects unsafe values", () => {
    const formData = new FormData();
    formData.set("feedbackType", "other");
    formData.set("message", "Hello");

    expect(() => parseFeedbackFormData(formData)).toThrow(
      "Choose a feedback type.",
    );

    formData.set("feedbackType", "feedback");

    expect(normalizeFeedbackContext("https://example.com/help")).toBeNull();
    expect(normalizeFeedbackContext("//example.com/help")).toBeNull();
  });

  it("defines an authenticated feedback rate-limit window", () => {
    expect(FEEDBACK_RATE_LIMIT_COUNT).toBe(3);
    expect(FEEDBACK_RATE_LIMIT_WINDOW_MINUTES).toBe(60);
    expect(feedbackRateLimitWindowStart(new Date("2026-04-30T12:00:00Z"))).toBe(
      "2026-04-30T11:00:00.000Z",
    );
  });
});

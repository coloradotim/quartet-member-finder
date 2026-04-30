import { describe, expect, it, vi } from "vitest";
import {
  buildFeedbackNotificationEmail,
  FEEDBACK_NOTIFICATION_RECIPIENT,
  sendFeedbackNotification,
} from "@/lib/feedback/feedback-notification";

describe("feedback notification helpers", () => {
  it("builds a project-team feedback email", () => {
    const email = buildFeedbackNotificationEmail({
      contextPath: "/help",
      feedbackId: "feedback-123",
      feedbackType: "bug",
      message: "The feedback form was confusing.",
      submitterEmail: "singer@example.com",
    });

    expect(email.subject).toBe("Quartet Member Finder feedback: Bug report");
    expect(email.text).toContain("From: singer@example.com");
    expect(email.text).toContain("Feedback ID: feedback-123");
    expect(email.text).toContain("Message:\nThe feedback form was confusing.");
  });

  it("sends feedback to the project-team inbox", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 200 }));

    await sendFeedbackNotification(
      {
        apiKey: "resend-key",
        fromEmail: "messages@quartetmemberfinder.org",
      },
      {
        contextPath: "/help",
        feedbackId: "feedback-123",
        feedbackType: "feedback",
        message: "Nice start.",
        submitterEmail: "singer@example.com",
      },
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.resend.com/emails",
      expect.objectContaining({
        body: expect.stringContaining(FEEDBACK_NOTIFICATION_RECIPIENT),
        method: "POST",
      }),
    );

    fetchMock.mockRestore();
  });
});

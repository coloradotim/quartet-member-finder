import { getAppUrl } from "@/lib/supabase/env";

export const FEEDBACK_NOTIFICATION_RECIPIENT = "cubuff98@gmail.com";

export type FeedbackNotificationConfig = {
  apiKey: string;
  fromEmail: string;
};

export type FeedbackNotification = {
  contextPath: string | null;
  feedbackId: string;
  feedbackType: string;
  message: string;
  submitterEmail: string | null;
};

export function getFeedbackNotificationConfig(): FeedbackNotificationConfig | null {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    return null;
  }

  return { apiKey, fromEmail };
}

function feedbackTypeLabel(feedbackType: string) {
  if (feedbackType === "bug") {
    return "Bug report";
  }

  if (feedbackType === "suggestion") {
    return "Suggestion";
  }

  return "General feedback";
}

export function buildFeedbackNotificationEmail({
  contextPath,
  feedbackId,
  feedbackType,
  message,
  submitterEmail,
}: FeedbackNotification) {
  const appUrl = getAppUrl();
  const typeLabel = feedbackTypeLabel(feedbackType);
  const subject = `Quartet Member Finder feedback: ${typeLabel}`;
  const text = [
    `New ${typeLabel.toLowerCase()} from Quartet Member Finder.`,
    "",
    `From: ${submitterEmail ?? "Unknown signed-in user"}`,
    `Context: ${contextPath ? `${appUrl}${contextPath}` : appUrl}`,
    `Feedback ID: ${feedbackId}`,
    "",
    "Message:",
    message,
  ].join("\n");

  return { subject, text };
}

export async function sendFeedbackNotification(
  config: FeedbackNotificationConfig,
  notification: FeedbackNotification,
) {
  const { subject, text } = buildFeedbackNotificationEmail(notification);
  const response = await fetch("https://api.resend.com/emails", {
    body: JSON.stringify({
      from: config.fromEmail,
      subject,
      text,
      to: FEEDBACK_NOTIFICATION_RECIPIENT,
    }),
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`Feedback notification failed with ${response.status}.`);
  }
}

import { getAppUrl } from "@/lib/supabase/env";

export type ContactTargetKind = "quartet" | "singer";

export type ContactTarget = {
  id: string;
  kind: ContactTargetKind;
  name: string;
};

export type ContactRelayConfig = {
  apiKey: string;
  fromEmail: string;
};

export type ContactNotification = {
  message: string;
  recipientEmail: string;
  requestId: string;
  senderDisplayName: string;
  target: ContactTarget;
};

export type ContactReplyNotification = {
  recipientEmail: string;
  requestId: string;
  replierDisplayName: string;
  target: ContactTarget;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const CONTACT_MESSAGE_MAX_LENGTH = 2000;
export const CONTACT_RATE_LIMIT_COUNT = 5;
export const CONTACT_RATE_LIMIT_WINDOW_MINUTES = 60;

function trimToNull(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed ? trimmed : null;
}

export function parseContactRequestFormData(formData: FormData) {
  const targetKind = trimToNull(formData.get("targetKind"));
  const targetId = trimToNull(formData.get("targetId"));
  const message = trimToNull(formData.get("message"));
  const returnTo = normalizeReturnTo(trimToNull(formData.get("returnTo")));

  if (targetKind !== "singer" && targetKind !== "quartet") {
    throw new Error("Choose a valid contact target.");
  }

  const contactTargetKind: ContactTargetKind = targetKind;

  if (!targetId || !UUID_PATTERN.test(targetId)) {
    throw new Error("Choose a valid contact target.");
  }

  if (!message) {
    throw new Error("Add a short message.");
  }

  if (message.length > CONTACT_MESSAGE_MAX_LENGTH) {
    throw new Error(
      `Keep contact messages under ${CONTACT_MESSAGE_MAX_LENGTH} characters.`,
    );
  }

  return {
    message,
    returnTo,
    targetId,
    targetKind: contactTargetKind,
  };
}

export function normalizeReturnTo(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  return value;
}

export function contactRateLimitWindowStart(now = new Date()) {
  return new Date(
    now.getTime() - CONTACT_RATE_LIMIT_WINDOW_MINUTES * 60 * 1000,
  ).toISOString();
}

export function getContactRelayConfig(): ContactRelayConfig | null {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    return null;
  }

  return { apiKey, fromEmail };
}

export function buildContactNotificationEmail({
  requestId,
  senderDisplayName,
  target,
}: Omit<ContactNotification, "recipientEmail">) {
  const appUrl = getAppUrl();
  const messageUrl = `${appUrl}/sign-in?next=${encodeURIComponent(
    `/app/messages/${requestId}`,
  )}`;
  const targetType =
    target.kind === "singer" ? "singer profile" : "quartet listing";
  const subject = `New Quartet Member Finder contact request for ${target.name}`;
  const text = [
    `You have a new contact request for your ${targetType}, "${target.name}".`,
    "",
    `From: ${senderDisplayName}`,
    "",
    `Request ID: ${requestId}`,
    `Sign in to Quartet Member Finder to read and reply: ${messageUrl}`,
    "",
    "Your email address was not shown to the sender.",
    "The full message is kept behind sign-in.",
  ].join("\n");

  return { subject, text };
}

export function buildContactReplyNotificationEmail({
  requestId,
  replierDisplayName,
  target,
}: ContactReplyNotification) {
  const appUrl = getAppUrl();
  const messageUrl = `${appUrl}/sign-in?next=${encodeURIComponent(
    `/app/messages/${requestId}`,
  )}`;
  const targetType =
    target.kind === "singer" ? "singer profile" : "quartet listing";
  const subject = `New Quartet Member Finder reply for ${target.name}`;
  const text = [
    `You have a new reply about the ${targetType}, "${target.name}".`,
    "",
    `From: ${replierDisplayName}`,
    "",
    `Request ID: ${requestId}`,
    `Sign in to Quartet Member Finder to read and reply: ${messageUrl}`,
    "",
    "Private email addresses were not shown through the app.",
    "The full reply is kept behind sign-in.",
  ].join("\n");

  return { subject, text };
}

export async function sendContactNotification(
  config: ContactRelayConfig,
  notification: ContactNotification,
) {
  const { subject, text } = buildContactNotificationEmail(notification);
  const response = await fetch("https://api.resend.com/emails", {
    body: JSON.stringify({
      from: config.fromEmail,
      subject,
      text,
      to: notification.recipientEmail,
    }),
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`Resend notification failed with ${response.status}.`);
  }
}

export async function sendContactReplyNotification(
  config: ContactRelayConfig,
  notification: ContactReplyNotification,
) {
  const { subject, text } = buildContactReplyNotificationEmail(notification);
  const response = await fetch("https://api.resend.com/emails", {
    body: JSON.stringify({
      from: config.fromEmail,
      subject,
      text,
      to: notification.recipientEmail,
    }),
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(
      `Resend reply notification failed with ${response.status}.`,
    );
  }
}

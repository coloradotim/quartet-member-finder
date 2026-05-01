import { getAppUrl } from "@/lib/supabase/env";

export type MessageReportCategory =
  | "harassment"
  | "other"
  | "spam"
  | "unsafe_request";

export const messageReportCategories: Array<{
  label: string;
  value: MessageReportCategory;
}> = [
  { label: "Spam", value: "spam" },
  { label: "Harassment or inappropriate behavior", value: "harassment" },
  { label: "Suspicious or unsafe request", value: "unsafe_request" },
  { label: "Other", value: "other" },
];

export const MESSAGE_REPORT_NOTE_MAX_LENGTH = 2000;

export function reportCategoryLabel(category: string) {
  return (
    messageReportCategories.find((option) => option.value === category)
      ?.label ?? "Other"
  );
}

export type AdminReportNotification = {
  category: string;
  contactRequestId: string;
  createdAt: string;
  note: string | null;
  reportId: string;
  reportedUserId: string | null;
  reporterEmail: string | null;
  reporterUserId: string;
};

export function getAdminNotificationConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    return null;
  }

  return {
    apiKey,
    fromEmail,
    toEmail: "cubuff98@gmail.com",
  };
}

export function buildAdminReportNotificationEmail({
  category,
  contactRequestId,
  createdAt,
  note,
  reportId,
  reportedUserId,
  reporterEmail,
  reporterUserId,
}: AdminReportNotification) {
  const appUrl = getAppUrl();
  const adminUrl = `${appUrl}/sign-in?next=${encodeURIComponent(
    `/app/admin/reports/${reportId}`,
  )}`;
  const subject = `Quartet Member Finder message report: ${reportCategoryLabel(
    category,
  )}`;
  const text = [
    "A message/contact request was reported on Quartet Member Finder.",
    "",
    `Report ID: ${reportId}`,
    `Category: ${reportCategoryLabel(category)}`,
    `Contact request ID: ${contactRequestId}`,
    `Reporter user ID: ${reporterUserId}`,
    `Reporter email: ${reporterEmail ?? "Unavailable"}`,
    `Reported user ID: ${reportedUserId ?? "Unavailable"}`,
    `Reported at: ${createdAt}`,
    "",
    "Reporter note:",
    note || "No note provided.",
    "",
    `Review in the admin console: ${adminUrl}`,
    "If the admin console is unavailable, review the message_reports and contact_requests tables in Supabase with service-role/admin access.",
  ].join("\n");

  return { subject, text };
}

export async function sendAdminReportNotification(
  config: NonNullable<ReturnType<typeof getAdminNotificationConfig>>,
  notification: AdminReportNotification,
) {
  const { subject, text } = buildAdminReportNotificationEmail(notification);
  const response = await fetch("https://api.resend.com/emails", {
    body: JSON.stringify({
      from: config.fromEmail,
      subject,
      text,
      to: config.toEmail,
    }),
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(
      `Resend report notification failed with ${response.status}.`,
    );
  }
}

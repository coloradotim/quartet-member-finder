import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import {
  buildAdminReportNotificationEmail,
  getAdminNotificationConfig,
  messageReportCategories,
  reportCategoryLabel,
} from "@/lib/messages/moderation";

function source(path: string) {
  return readFileSync(path, "utf8");
}

describe("message moderation", () => {
  it("defines simple report categories and private admin notification content", () => {
    expect(messageReportCategories.map((category) => category.value)).toEqual([
      "spam",
      "harassment",
      "unsafe_request",
      "other",
    ]);
    expect(reportCategoryLabel("unsafe_request")).toBe(
      "Suspicious or unsafe request",
    );

    const { subject, text } = buildAdminReportNotificationEmail({
      category: "spam",
      contactRequestId: "request-1",
      createdAt: "2026-05-01T00:00:00.000Z",
      note: "This looked automated.",
      reportedUserId: "reported-user",
      reporterEmail: "reporter@example.com",
      reporterUserId: "reporter-user",
      reportId: "report-1",
    });

    expect(subject).toBe("Quartet Member Finder message report: Spam");
    expect(text).toContain("Report ID: report-1");
    expect(text).toContain("Reporter email: reporter@example.com");
    expect(text).toContain("/sign-in?next=%2Fapp%2Fadmin%2Freports%2Freport-1");
    expect(text).toContain("message_reports and contact_requests");
  });

  it("keeps admin notification config server-only", () => {
    vi.stubEnv("RESEND_API_KEY", "resend-key");
    vi.stubEnv("RESEND_FROM_EMAIL", "messages@example.com");

    expect(getAdminNotificationConfig()).toEqual({
      apiKey: "resend-key",
      fromEmail: "messages@example.com",
      toEmail: "cubuff98@gmail.com",
    });

    vi.unstubAllEnvs();
    expect(getAdminNotificationConfig()).toBeNull();
  });

  it("adds an allowlisted admin console with report actions", () => {
    const adminList = source("app/(protected)/app/admin/page.tsx");
    const adminDetail = source(
      "app/(protected)/app/admin/reports/[id]/page.tsx",
    );
    const adminActions = source("app/(protected)/app/admin/actions.ts");
    const adminAccess = source("lib/admin/admin-access.ts");
    const contactAction = source("app/contact/actions.ts");
    const messageActions = source("app/(protected)/app/messages/actions.ts");

    expect(adminAccess).toContain("ADMIN_EMAILS");
    expect(adminList).toContain("Not authorized");
    expect(adminList).toContain("message_reports");
    expect(adminDetail).toContain("Block from messaging");
    expect(adminDetail).toContain("Permanently block account");
    expect(adminActions).toContain("message_blocked");
    expect(adminActions).toContain("permanently_blocked");
    expect(adminActions).toContain("is_visible: false");
    expect(contactAction).toContain("user_moderation_status");
    expect(contactAction).toContain("blocked");
    expect(messageActions).toContain("user_moderation_status");
    expect(messageActions).toContain("reportMessage");
  });
});

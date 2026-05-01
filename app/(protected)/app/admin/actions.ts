"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createRequiredAdminClient,
  isAdminUser,
} from "@/lib/admin/admin-access";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const reportStatuses = ["action_taken", "dismissed", "reviewed"] as const;
type ReportStatus = (typeof reportStatuses)[number];

async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  if (!isAdminUser(user)) {
    redirect("/app");
  }

  return createRequiredAdminClient();
}

function formString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

export async function updateReportStatus(formData: FormData) {
  const admin = await requireAdmin();
  const reportId = formString(formData, "reportId");
  const status = formString(formData, "status") as ReportStatus;
  const adminNotes = formString(formData, "adminNotes") || null;

  if (!reportId || !reportStatuses.includes(status)) {
    redirect("/app/admin?admin=error");
  }

  await admin
    .from("message_reports")
    .update({
      admin_notes: adminNotes,
      status,
      ...(status === "action_taken"
        ? { action_taken_at: new Date().toISOString() }
        : {}),
    })
    .eq("id", reportId);

  revalidatePath("/app/admin");
  revalidatePath(`/app/admin/reports/${reportId}`);
  redirect(`/app/admin/reports/${reportId}?admin=updated`);
}

export async function blockReportedAccount(formData: FormData) {
  const admin = await requireAdmin();
  const reportId = formString(formData, "reportId");
  const reportedUserId = formString(formData, "reportedUserId");
  const reason =
    formString(formData, "reason") ||
    "Blocked from messaging after report review.";

  if (!reportId || !reportedUserId) {
    redirect("/app/admin?admin=error");
  }

  await admin.from("user_moderation_status").upsert({
    account_status: "message_blocked",
    messaging_block_reason: reason,
    messaging_blocked_at: new Date().toISOString(),
    user_id: reportedUserId,
  });

  await admin
    .from("message_reports")
    .update({
      action_taken_at: new Date().toISOString(),
      status: "action_taken",
    })
    .eq("id", reportId);

  revalidatePath("/app/admin");
  revalidatePath(`/app/admin/reports/${reportId}`);
  redirect(`/app/admin/reports/${reportId}?admin=blocked`);
}

export async function permanentlyBlockReportedAccount(formData: FormData) {
  const admin = await requireAdmin();
  const reportId = formString(formData, "reportId");
  const reportedUserId = formString(formData, "reportedUserId");

  if (!reportId || !reportedUserId) {
    redirect("/app/admin?admin=error");
  }

  await admin.from("user_moderation_status").upsert({
    account_status: "permanently_blocked",
    admin_notes:
      "Permanent block set from admin console. Account deletion remains a manual Supabase Auth action.",
    messaging_block_reason: "Permanently blocked after report review.",
    messaging_blocked_at: new Date().toISOString(),
    user_id: reportedUserId,
  });

  await admin
    .from("singer_profiles")
    .update({ is_visible: false })
    .eq("user_id", reportedUserId);
  await admin
    .from("quartet_listings")
    .update({ is_visible: false })
    .eq("owner_user_id", reportedUserId);
  await admin
    .from("message_reports")
    .update({
      action_taken_at: new Date().toISOString(),
      status: "action_taken",
    })
    .eq("id", reportId);

  revalidatePath("/app/admin");
  revalidatePath(`/app/admin/reports/${reportId}`);
  redirect(`/app/admin/reports/${reportId}?admin=permanently-blocked`);
}

export async function hideReportedSingerProfile(formData: FormData) {
  const admin = await requireAdmin();
  const reportId = formString(formData, "reportId");
  const singerProfileId = formString(formData, "singerProfileId");

  if (!reportId || !singerProfileId) {
    redirect("/app/admin?admin=error");
  }

  await admin
    .from("singer_profiles")
    .update({ is_visible: false })
    .eq("id", singerProfileId);

  revalidatePath(`/app/admin/reports/${reportId}`);
  redirect(`/app/admin/reports/${reportId}?admin=hidden`);
}

export async function hideReportedQuartetProfile(formData: FormData) {
  const admin = await requireAdmin();
  const reportId = formString(formData, "reportId");
  const quartetListingId = formString(formData, "quartetListingId");

  if (!reportId || !quartetListingId) {
    redirect("/app/admin?admin=error");
  }

  await admin
    .from("quartet_listings")
    .update({ is_visible: false })
    .eq("id", quartetListingId);

  revalidatePath(`/app/admin/reports/${reportId}`);
  redirect(`/app/admin/reports/${reportId}?admin=hidden`);
}

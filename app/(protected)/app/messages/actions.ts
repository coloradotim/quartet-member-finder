"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  captureProductEvent,
  pseudonymousAnalyticsUserId,
} from "@/lib/analytics/product-analytics";
import {
  CONTACT_MESSAGE_MAX_LENGTH,
  getContactRelayConfig,
  sendContactReplyNotification,
  type ContactTarget,
} from "@/lib/contact/contact-relay";
import {
  MESSAGE_REPORT_NOTE_MAX_LENGTH,
  getAdminNotificationConfig,
  messageReportCategories,
  sendAdminReportNotification,
  type MessageReportCategory,
} from "@/lib/messages/moderation";
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/lib/supabase/server";

type ContactRequestRow = {
  id: string;
  quartet_listing_id: string | null;
  recipient_user_id: string | null;
  sender_user_id: string;
  singer_profile_id: string | null;
};

type ContactReplyRow = {
  id: string;
};

type MessageReportRow = {
  created_at: string;
  id: string;
  reported_user_id: string | null;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function redirectWithReplyStatus(
  requestId: string,
  status: "blocked" | "error" | "sent" | "stored",
): never {
  redirect(`/app/messages/${requestId}?reply=${status}`);
}

function redirectWithReportStatus(
  requestId: string,
  status: "error" | "sent" | "stored",
): never {
  redirect(`/app/messages/${requestId}?report=${status}`);
}

function trimMessage(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed ? trimmed : null;
}

function messageParticipantRole(request: ContactRequestRow, userId: string) {
  return request.sender_user_id === userId ? "sender" : "recipient";
}

async function captureMessageReply({
  request,
  status,
  userId,
}: {
  request: ContactRequestRow;
  status: "sent" | "stored";
  userId: string;
}) {
  await captureProductEvent(
    "message_replied",
    {
      participant_role: messageParticipantRole(request, userId),
      route: "/app/messages/[id]",
      route_area: "signed_in_app",
      status,
    },
    { distinctId: pseudonymousAnalyticsUserId(userId) },
  );
}

async function resolveContactTarget(
  supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>,
  request: ContactRequestRow,
): Promise<ContactTarget> {
  if (request.singer_profile_id) {
    const [{ data: owned }, { data: visible }] = await Promise.all([
      supabase
        .from("singer_profiles")
        .select("id, display_name")
        .eq("id", request.singer_profile_id)
        .maybeSingle(),
      supabase
        .from("singer_discovery_profiles")
        .select("id, display_name")
        .eq("id", request.singer_profile_id)
        .maybeSingle(),
    ]);

    return {
      id: request.singer_profile_id,
      kind: "singer",
      name: owned?.display_name ?? visible?.display_name ?? "Singer profile",
    };
  }

  const quartetId = request.quartet_listing_id ?? "unknown";
  const [{ data: owned }, { data: visible }] = await Promise.all([
    supabase
      .from("quartet_listings")
      .select("id, name")
      .eq("id", quartetId)
      .maybeSingle(),
    supabase
      .from("quartet_discovery_listings")
      .select("id, name")
      .eq("id", quartetId)
      .maybeSingle(),
  ]);

  return {
    id: quartetId,
    kind: "quartet",
    name: owned?.name ?? visible?.name ?? "Quartet profile",
  };
}

export async function sendMessageReply(formData: FormData) {
  const requestId = String(formData.get("requestId") ?? "").trim();
  const message = trimMessage(formData.get("message"));

  if (!UUID_PATTERN.test(requestId) || !message) {
    redirect("/app/messages?reply=error");
  }

  if (message.length > CONTACT_MESSAGE_MAX_LENGTH) {
    redirectWithReplyStatus(requestId, "error");
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirectWithReplyStatus(requestId, "error");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/sign-in?next=${encodeURIComponent(`/app/messages/${requestId}`)}`,
    );
  }

  const { data: moderationStatus } = await supabase
    .from("user_moderation_status")
    .select("account_status, messaging_blocked_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (
    moderationStatus?.messaging_blocked_at ||
    moderationStatus?.account_status === "message_blocked" ||
    moderationStatus?.account_status === "suspended" ||
    moderationStatus?.account_status === "permanently_blocked"
  ) {
    redirectWithReplyStatus(requestId, "blocked");
  }

  const { data: contactRequest, error: requestError } = await supabase
    .from("contact_requests")
    .select(
      "id, sender_user_id, recipient_user_id, singer_profile_id, quartet_listing_id",
    )
    .eq("id", requestId)
    .maybeSingle<ContactRequestRow>();

  if (
    requestError ||
    !contactRequest ||
    (contactRequest.sender_user_id !== user.id &&
      contactRequest.recipient_user_id !== user.id)
  ) {
    redirect("/app/messages?reply=error");
  }

  const { data: reply, error: replyError } = await supabase
    .from("contact_request_replies")
    .insert({
      contact_request_id: requestId,
      message_body: message,
      sender_user_id: user.id,
    })
    .select("id")
    .single<ContactReplyRow>();

  if (replyError || !reply) {
    redirectWithReplyStatus(requestId, "error");
  }

  const otherUserId =
    contactRequest.sender_user_id === user.id
      ? contactRequest.recipient_user_id
      : contactRequest.sender_user_id;
  const admin = createSupabaseAdminClient();
  const relayConfig = getContactRelayConfig();

  if (!admin || !relayConfig || !otherUserId) {
    revalidatePath(`/app/messages/${requestId}`);
    await captureMessageReply({
      request: contactRequest,
      status: "stored",
      userId: user.id,
    });
    redirectWithReplyStatus(requestId, "stored");
  }

  const { data: recipient, error: recipientError } =
    await admin.auth.admin.getUserById(otherUserId);

  if (recipientError || !recipient.user?.email) {
    revalidatePath(`/app/messages/${requestId}`);
    await captureMessageReply({
      request: contactRequest,
      status: "stored",
      userId: user.id,
    });
    redirectWithReplyStatus(requestId, "stored");
  }

  try {
    await sendContactReplyNotification(relayConfig, {
      recipientEmail: recipient.user.email,
      replierDisplayName: "A signed-in Quartet Member Finder user",
      requestId,
      target: await resolveContactTarget(supabase, contactRequest),
    });
    await admin
      .from("contact_request_replies")
      .update({ notification_status: "delivered" })
      .eq("id", reply.id);
  } catch {
    revalidatePath(`/app/messages/${requestId}`);
    await captureMessageReply({
      request: contactRequest,
      status: "stored",
      userId: user.id,
    });
    redirectWithReplyStatus(requestId, "stored");
  }

  revalidatePath(`/app/messages/${requestId}`);
  await captureMessageReply({
    request: contactRequest,
    status: "sent",
    userId: user.id,
  });
  redirectWithReplyStatus(requestId, "sent");
}

function parseReportCategory(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return null;
  }

  return messageReportCategories.some((option) => option.value === value)
    ? (value as MessageReportCategory)
    : null;
}

export async function reportMessage(formData: FormData) {
  const requestId = String(formData.get("requestId") ?? "").trim();
  const category = parseReportCategory(formData.get("category"));
  const note = trimMessage(formData.get("note"));

  if (!UUID_PATTERN.test(requestId) || !category) {
    redirect("/app/messages?report=error");
  }

  if (note && note.length > MESSAGE_REPORT_NOTE_MAX_LENGTH) {
    redirectWithReportStatus(requestId, "error");
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirectWithReportStatus(requestId, "error");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/sign-in?next=${encodeURIComponent(`/app/messages/${requestId}`)}`,
    );
  }

  const { data: contactRequest, error: requestError } = await supabase
    .from("contact_requests")
    .select("id, sender_user_id, recipient_user_id")
    .eq("id", requestId)
    .maybeSingle<
      Pick<ContactRequestRow, "id" | "recipient_user_id" | "sender_user_id">
    >();

  if (
    requestError ||
    !contactRequest ||
    (contactRequest.sender_user_id !== user.id &&
      contactRequest.recipient_user_id !== user.id)
  ) {
    redirect("/app/messages?report=error");
  }

  const { data: report, error: reportError } = await supabase
    .from("message_reports")
    .insert({
      category,
      contact_request_id: requestId,
      note,
      reporter_user_id: user.id,
    })
    .select("id, reported_user_id, created_at")
    .single<MessageReportRow>();

  if (reportError || !report) {
    redirectWithReportStatus(requestId, "error");
  }

  const config = getAdminNotificationConfig();

  if (!config) {
    revalidatePath(`/app/messages/${requestId}`);
    await captureProductEvent(
      "message_report_submitted",
      {
        report_category: category,
        route: "/app/messages/[id]",
        route_area: "signed_in_app",
        status: "stored",
      },
      { distinctId: pseudonymousAnalyticsUserId(user.id) },
    );
    redirectWithReportStatus(requestId, "stored");
  }

  try {
    await sendAdminReportNotification(config, {
      category,
      contactRequestId: requestId,
      createdAt: report.created_at,
      note,
      reportedUserId: report.reported_user_id,
      reporterEmail: user.email ?? null,
      reporterUserId: user.id,
      reportId: report.id,
    });
  } catch {
    revalidatePath(`/app/messages/${requestId}`);
    await captureProductEvent(
      "message_report_submitted",
      {
        report_category: category,
        route: "/app/messages/[id]",
        route_area: "signed_in_app",
        status: "stored",
      },
      { distinctId: pseudonymousAnalyticsUserId(user.id) },
    );
    redirectWithReportStatus(requestId, "stored");
  }

  revalidatePath(`/app/messages/${requestId}`);
  await captureProductEvent(
    "message_report_submitted",
    {
      report_category: category,
      route: "/app/messages/[id]",
      route_area: "signed_in_app",
      status: "sent",
    },
    { distinctId: pseudonymousAnalyticsUserId(user.id) },
  );
  redirectWithReportStatus(requestId, "sent");
}

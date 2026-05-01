"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  captureProductEvent,
  pseudonymousAnalyticsUserId,
} from "@/lib/analytics/product-analytics";
import {
  CONTACT_RATE_LIMIT_COUNT,
  contactRateLimitWindowStart,
  getContactRelayConfig,
  parseContactRequestFormData,
  sendContactNotification,
  type ContactTarget,
} from "@/lib/contact/contact-relay";
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/lib/supabase/server";

type ContactRequestRow = {
  created_at: string;
  id: string;
  recipient_user_id: string;
};

function redirectWithContactStatus(
  returnTo: string,
  status: "auth" | "blocked" | "error" | "sent" | "stored",
): never {
  const separator = returnTo.includes("?") ? "&" : "?";

  redirect(`${returnTo}${separator}contact=${status}`);
}

function senderDisplayName() {
  return "A signed-in Quartet Member Finder user";
}

async function fetchContactTarget(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  targetKind: "quartet" | "singer",
  targetId: string,
): Promise<ContactTarget | null> {
  if (!supabase) {
    return null;
  }

  if (targetKind === "singer") {
    const { data } = await supabase
      .from("singer_discovery_profiles")
      .select("id, display_name")
      .eq("id", targetId)
      .single();

    return data
      ? { id: data.id, kind: "singer", name: data.display_name }
      : null;
  }

  const { data } = await supabase
    .from("quartet_discovery_listings")
    .select("id, name")
    .eq("id", targetId)
    .single();

  return data ? { id: data.id, kind: "quartet", name: data.name } : null;
}

async function captureContactRequestSubmitted({
  returnTo,
  status,
  targetKind,
  userId,
}: {
  returnTo: string;
  status: "sent" | "stored";
  targetKind: "quartet" | "singer";
  userId: string;
}) {
  const properties = {
    route: returnTo.split("?")[0] || returnTo,
    route_area: "discovery",
    status,
    target_kind: targetKind,
  };
  const options = { distinctId: pseudonymousAnalyticsUserId(userId) };

  await captureProductEvent("contact_request_submitted", properties, options);
  await captureProductEvent("message_sent", properties, options);
}

export async function sendContactRequest(formData: FormData) {
  let values;

  try {
    values = parseContactRequestFormData(formData);
  } catch {
    redirectWithContactStatus("/", "error");
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirectWithContactStatus(values.returnTo, "error");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/sign-in?next=${encodeURIComponent(values.returnTo)}`);
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
    redirectWithContactStatus(values.returnTo, "blocked");
  }

  const rateLimitWindowStart = contactRateLimitWindowStart();
  const { count, error: rateLimitError } = await supabase
    .from("contact_requests")
    .select("id", { count: "exact", head: true })
    .eq("sender_user_id", user.id)
    .gte("created_at", rateLimitWindowStart);

  if (rateLimitError || (count ?? 0) >= CONTACT_RATE_LIMIT_COUNT) {
    redirectWithContactStatus(values.returnTo, "error");
  }

  const target = await fetchContactTarget(
    supabase,
    values.targetKind,
    values.targetId,
  );

  if (!target) {
    redirectWithContactStatus(values.returnTo, "error");
  }

  const payload =
    values.targetKind === "singer"
      ? {
          message_body: values.message,
          sender_user_id: user.id,
          singer_profile_id: values.targetId,
        }
      : {
          message_body: values.message,
          quartet_listing_id: values.targetId,
          sender_user_id: user.id,
        };

  const { data: contactRequest, error: insertError } = await supabase
    .from("contact_requests")
    .insert(payload)
    .select("id, recipient_user_id, created_at")
    .single<ContactRequestRow>();

  if (insertError || !contactRequest) {
    redirectWithContactStatus(values.returnTo, "error");
  }

  const admin = createSupabaseAdminClient();
  const relayConfig = getContactRelayConfig();

  if (!admin || !relayConfig) {
    revalidatePath(values.returnTo);
    await captureContactRequestSubmitted({
      returnTo: values.returnTo,
      status: "stored",
      targetKind: values.targetKind,
      userId: user.id,
    });
    redirectWithContactStatus(values.returnTo, "stored");
  }

  const { data: recipient, error: recipientError } =
    await admin.auth.admin.getUserById(contactRequest.recipient_user_id);

  if (recipientError || !recipient.user?.email) {
    revalidatePath(values.returnTo);
    await captureContactRequestSubmitted({
      returnTo: values.returnTo,
      status: "stored",
      targetKind: values.targetKind,
      userId: user.id,
    });
    redirectWithContactStatus(values.returnTo, "stored");
  }

  try {
    await sendContactNotification(relayConfig, {
      message: values.message,
      recipientEmail: recipient.user.email,
      requestId: contactRequest.id,
      senderDisplayName: senderDisplayName(),
      target,
    });
    await admin
      .from("contact_requests")
      .update({ status: "delivered" })
      .eq("id", contactRequest.id);
  } catch {
    revalidatePath(values.returnTo);
    await captureContactRequestSubmitted({
      returnTo: values.returnTo,
      status: "stored",
      targetKind: values.targetKind,
      userId: user.id,
    });
    redirectWithContactStatus(values.returnTo, "stored");
  }

  revalidatePath(values.returnTo);
  await captureContactRequestSubmitted({
    returnTo: values.returnTo,
    status: "sent",
    targetKind: values.targetKind,
    userId: user.id,
  });
  redirectWithContactStatus(values.returnTo, "sent");
}

"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  captureProductEvent,
  pseudonymousAnalyticsUserId,
} from "@/lib/analytics/product-analytics";
import {
  FEEDBACK_RATE_LIMIT_COUNT,
  feedbackRateLimitWindowStart,
  parseFeedbackFormData,
} from "@/lib/feedback/feedback-form";
import {
  getFeedbackNotificationConfig,
  sendFeedbackNotification,
} from "@/lib/feedback/feedback-notification";
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/lib/supabase/server";

function redirectWithFeedbackStatus(
  status: "auth" | "error" | "sent" | "limited",
): never {
  redirect(`/help?feedback=${status}`);
}

export async function submitHelpFeedback(formData: FormData) {
  let values;

  try {
    values = parseFeedbackFormData(formData);
  } catch {
    redirectWithFeedbackStatus("error");
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirectWithFeedbackStatus("error");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/sign-in?next=${encodeURIComponent("/help")}`);
  }

  const feedbackClient = createSupabaseAdminClient() ?? supabase;
  const rateLimitWindowStart = feedbackRateLimitWindowStart();
  const headerStore = await headers();
  const userAgent = headerStore.get("user-agent");
  const { count, error: rateLimitError } = await feedbackClient
    .from("feedback_submissions")
    .select("id", { count: "exact", head: true })
    .eq("submitter_user_id", user.id)
    .gte("created_at", rateLimitWindowStart);

  if (rateLimitError) {
    console.error("Feedback rate-limit lookup failed", {
      code: rateLimitError.code,
      message: rateLimitError.message,
    });
    redirectWithFeedbackStatus("error");
  }

  if ((count ?? 0) >= FEEDBACK_RATE_LIMIT_COUNT) {
    redirectWithFeedbackStatus("limited");
  }

  const { data: feedbackSubmission, error: insertError } = await feedbackClient
    .from("feedback_submissions")
    .insert({
      context_route: values.contextPath,
      feedback_type: values.feedbackType,
      message_body: values.message,
      submitter_email_private: user.email ?? null,
      submitter_user_id: user.id,
      user_agent: userAgent ? userAgent.slice(0, 500) : null,
    })
    .select("id")
    .single();

  if (insertError || !feedbackSubmission) {
    console.error("Feedback insert failed", {
      code: insertError?.code,
      message: insertError?.message,
    });
    redirectWithFeedbackStatus("error");
  }

  const notificationConfig = getFeedbackNotificationConfig();

  if (!notificationConfig) {
    console.error("Feedback notification configuration is missing");
    redirectWithFeedbackStatus("error");
  }

  try {
    await sendFeedbackNotification(notificationConfig, {
      contextPath: values.contextPath,
      feedbackId: feedbackSubmission.id,
      feedbackType: values.feedbackType,
      message: values.message,
      submitterEmail: user.email ?? null,
    });
  } catch (error) {
    console.error("Feedback notification failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    redirectWithFeedbackStatus("error");
  }

  revalidatePath("/help");
  await captureProductEvent(
    "feedback_submitted",
    {
      feedback_type: values.feedbackType,
      route: "/help",
      route_area: "support",
      status: "sent",
    },
    { distinctId: pseudonymousAnalyticsUserId(user.id) },
  );
  redirectWithFeedbackStatus("sent");
}

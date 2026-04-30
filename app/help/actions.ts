"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  FEEDBACK_RATE_LIMIT_COUNT,
  feedbackRateLimitWindowStart,
  parseFeedbackFormData,
} from "@/lib/feedback/feedback-form";
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

  const { error: insertError } = await feedbackClient
    .from("feedback_submissions")
    .insert({
      context_path: values.contextPath,
      feedback_type: values.feedbackType,
      message_body: values.message,
      submitter_email_private: user.email ?? null,
      submitter_user_id: user.id,
      user_agent: userAgent ? userAgent.slice(0, 500) : null,
    });

  if (insertError) {
    console.error("Feedback insert failed", {
      code: insertError.code,
      message: insertError.message,
    });
    redirectWithFeedbackStatus("error");
  }

  revalidatePath("/help");
  redirectWithFeedbackStatus("sent");
}

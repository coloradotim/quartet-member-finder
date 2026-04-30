"use server";

import { redirect } from "next/navigation";
import {
  destinationForOnboardingChoice,
  isValidOnboardingChoice,
  normalizePostOnboardingPath,
} from "@/lib/onboarding/app-onboarding";
import {
  ensureAccountProfileForOnboarding,
  type AuthUserForOnboarding,
} from "@/lib/onboarding/account-onboarding";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function authenticatedOnboardingUser() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/sign-in?next=/app/onboarding");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in?next=/app/onboarding");
  }

  return { supabase, user };
}

export async function completeOnboarding(formData: FormData) {
  const choiceId = String(formData.get("choice") ?? "");

  if (!isValidOnboardingChoice(choiceId)) {
    redirect("/app/onboarding?error=Choose%20a%20first%20step.");
  }

  const { supabase, user } = await authenticatedOnboardingUser();
  const now = new Date().toISOString();
  const typedUser: AuthUserForOnboarding = {
    email: user.email,
    id: user.id,
  };

  await ensureAccountProfileForOnboarding(supabase, typedUser);

  const { error } = await supabase
    .from("account_profiles")
    .update({
      onboarding_completed_at: now,
      onboarding_last_choice: choiceId,
      onboarding_skipped_at: null,
    })
    .eq("user_id", user.id);

  if (error) {
    redirect("/app/onboarding?error=Unable%20to%20save%20onboarding.");
  }

  redirect(destinationForOnboardingChoice(choiceId));
}

export async function skipOnboarding(formData: FormData) {
  const next = normalizePostOnboardingPath(String(formData.get("next") ?? ""));
  const { supabase, user } = await authenticatedOnboardingUser();
  const typedUser: AuthUserForOnboarding = {
    email: user.email,
    id: user.id,
  };

  await ensureAccountProfileForOnboarding(supabase, typedUser);

  const { error } = await supabase
    .from("account_profiles")
    .update({
      onboarding_last_choice: "skipped",
      onboarding_skipped_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

  if (error) {
    redirect("/app/onboarding?error=Unable%20to%20skip%20onboarding.");
  }

  redirect(next);
}

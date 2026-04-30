"use server";

import { redirect } from "next/navigation";
import {
  isAccountDistanceUnit,
  normalizeAccountDistanceUnit,
} from "@/lib/settings/account-settings";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function redirectWithSettingsStatus(
  status: "error" | "onboarding-reset" | "saved",
): never {
  redirect(`/app/settings?settings=${status}`);
}

async function getSettingsUser() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/sign-in?next=/app/settings");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in?next=/app/settings");
  }

  return { supabase, user };
}

export async function saveAccountSettings(formData: FormData) {
  const preferredDistanceUnit = normalizeAccountDistanceUnit(
    String(formData.get("preferredDistanceUnit") ?? ""),
  );

  if (!isAccountDistanceUnit(preferredDistanceUnit)) {
    redirectWithSettingsStatus("error");
  }

  const { supabase, user } = await getSettingsUser();
  const { error } = await supabase
    .from("account_profiles")
    .update({ preferred_distance_unit: preferredDistanceUnit })
    .eq("user_id", user.id);

  if (error) {
    redirectWithSettingsStatus("error");
  }

  redirectWithSettingsStatus("saved");
}

export async function resetOnboarding() {
  const { supabase, user } = await getSettingsUser();
  const { error } = await supabase
    .from("account_profiles")
    .update({
      onboarding_completed_at: null,
      onboarding_last_choice: null,
      onboarding_skipped_at: null,
    })
    .eq("user_id", user.id);

  if (error) {
    redirectWithSettingsStatus("error");
  }

  redirect("/app/onboarding?next=%2Fapp%2Fsettings");
}

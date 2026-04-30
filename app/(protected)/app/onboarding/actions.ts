"use server";

import { redirect } from "next/navigation";
import {
  destinationForOnboardingChoice,
  isValidOnboardingChoice,
} from "@/lib/onboarding/app-onboarding";
import {
  captureProductEvent,
  pseudonymousAnalyticsUserId,
} from "@/lib/analytics/product-analytics";
import {
  ensureAccountProfileForOnboarding,
  type AuthUserForOnboarding,
} from "@/lib/onboarding/account-onboarding";
import {
  countryCodeFromName,
  distanceUnitForCountry,
} from "@/lib/location/country-location-defaults";
import {
  buildPublicLocationLabel,
  inferLocationPrecision,
  normalizeCountryCode,
  normalizeOptionalText,
} from "@/lib/profiles/singer-profile-form";
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
  const displayName = normalizeOptionalText(formData.get("displayName"));

  if (!isValidOnboardingChoice(choiceId)) {
    redirect("/app/onboarding?error=Choose%20a%20first%20step.");
  }

  if (!displayName) {
    redirect("/app/onboarding?error=Display%20name%20is%20required.");
  }

  const { supabase, user } = await authenticatedOnboardingUser();
  const now = new Date().toISOString();
  const typedUser: AuthUserForOnboarding = {
    email: user.email,
    id: user.id,
  };
  const countryName = normalizeOptionalText(formData.get("countryName"));
  const starterProfile = {
    countryCode:
      normalizeCountryCode(formData.get("countryCode")) ??
      countryCodeFromName(countryName),
    countryName,
    displayName,
    locality: normalizeOptionalText(formData.get("locality")),
    locationLabelPublic: normalizeOptionalText(
      formData.get("locationLabelPublic"),
    ),
    postalCodePrivate: normalizeOptionalText(formData.get("postalCodePrivate")),
    region: null,
  };

  await ensureAccountProfileForOnboarding(supabase, typedUser);

  const { error: accountError } = await supabase
    .from("account_profiles")
    .update({
      display_name: displayName,
      onboarding_completed_at: now,
      onboarding_last_choice: choiceId,
      onboarding_skipped_at: null,
    })
    .eq("user_id", user.id);

  if (accountError) {
    redirect("/app/onboarding?error=Unable%20to%20save%20onboarding.");
  }

  const { error: profileError } = await supabase.from("singer_profiles").upsert(
    {
      country_code: starterProfile.countryCode,
      country_name: starterProfile.countryName,
      display_name: displayName,
      is_active: true,
      is_visible: false,
      locality: starterProfile.locality,
      location_label_public: buildPublicLocationLabel(starterProfile),
      location_precision: inferLocationPrecision(starterProfile),
      postal_code_private: starterProfile.postalCodePrivate,
      preferred_distance_unit: distanceUnitForCountry(
        starterProfile.countryCode,
        starterProfile.countryName,
      ),
      user_id: user.id,
    },
    { onConflict: "user_id" },
  );

  if (profileError) {
    redirect("/app/onboarding?error=Unable%20to%20save%20profile%20context.");
  }

  await captureProductEvent(
    "onboarding_completed",
    {
      has_country: Boolean(
        starterProfile.countryCode || starterProfile.countryName,
      ),
      has_locality: Boolean(starterProfile.locality),
      has_public_location_label: Boolean(starterProfile.locationLabelPublic),
      onboarding_choice: choiceId,
      route: "/app/onboarding",
      route_area: "signed_in_app",
    },
    { distinctId: pseudonymousAnalyticsUserId(user.id) },
  );

  redirect(destinationForOnboardingChoice(choiceId));
}

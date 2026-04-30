"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  captureProductEvent,
  pseudonymousAnalyticsUserId,
} from "@/lib/analytics/product-analytics";
import {
  buildPublicLocationLabel,
  inferLocationPrecision,
  parseSingerProfileFormData,
} from "@/lib/profiles/singer-profile-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function redirectWithProfileMessage(
  key: "error" | "message",
  value: string,
): never {
  redirect(`/app/profile?${key}=${encodeURIComponent(value)}`);
}

export async function saveSingerProfile(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirectWithProfileMessage(
      "error",
      "Supabase is not configured for this environment.",
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in?next=/app/profile");
  }

  let values;

  try {
    values = parseSingerProfileFormData(formData);
  } catch (error) {
    redirectWithProfileMessage(
      "error",
      error instanceof Error ? error.message : "Profile data is invalid.",
    );
  }

  const locationLabelPublic = buildPublicLocationLabel(values);
  const locationPrecision = inferLocationPrecision(values);

  const { data: profile, error: profileError } = await supabase
    .from("singer_profiles")
    .upsert(
      {
        availability: values.availability,
        bio: values.bio,
        country_code: values.countryCode,
        country_name: values.countryName,
        display_name: values.displayName,
        experience_level: values.experienceLevel,
        goals: values.goals,
        is_active: true,
        is_visible: values.isVisible,
        locality: values.locality,
        location_label_public: locationLabelPublic,
        location_precision: locationPrecision,
        postal_code_private: values.postalCodePrivate,
        preferred_distance_unit: "km",
        region: values.region,
        travel_radius_km: values.travelRadiusKm,
        user_id: user.id,
      },
      { onConflict: "user_id" },
    )
    .select("id")
    .single();

  if (profileError || !profile) {
    redirectWithProfileMessage(
      "error",
      profileError?.message ?? "Unable to save singer profile.",
    );
  }

  const { error: deletePartsError } = await supabase
    .from("singer_profile_parts")
    .delete()
    .eq("singer_profile_id", profile.id);

  if (deletePartsError) {
    redirectWithProfileMessage("error", deletePartsError.message);
  }

  if (values.parts.length > 0) {
    const { error: partsError } = await supabase
      .from("singer_profile_parts")
      .insert(
        values.parts.map((part) => ({
          part,
          singer_profile_id: profile.id,
        })),
      );

    if (partsError) {
      redirectWithProfileMessage("error", partsError.message);
    }
  }

  revalidatePath("/app/profile");
  await captureProductEvent(
    "singer_profile_saved",
    {
      is_visible: values.isVisible,
      route: "/app/profile",
      route_area: "signed_in_app",
      visibility_enabled: values.isVisible,
    },
    { distinctId: pseudonymousAnalyticsUserId(user.id) },
  );
  redirectWithProfileMessage("message", "Singer profile saved.");
}

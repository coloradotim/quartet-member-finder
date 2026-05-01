"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  captureProductEvent,
  pseudonymousAnalyticsUserId,
} from "@/lib/analytics/product-analytics";
import {
  buildPublicLocationLabel,
  discoverabilityLocationWarning,
  inferLocationPrecision,
  parseSingerProfileFormData,
} from "@/lib/profiles/singer-profile-form";
import { distanceUnitForCountry } from "@/lib/location/country-location-defaults";
import { geocodeApproximateLocation } from "@/lib/location/geocoding";
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
  const preferredDistanceUnit = distanceUnitForCountry(
    values.countryCode,
    values.countryName,
  );
  const geocodingResult = await geocodeApproximateLocation(values, {
    storageMode: "permanent",
  });
  const geocodedCoordinates = geocodingResult.coordinates;
  const { data: existingProfile } = await supabase
    .from("singer_profiles")
    .select("is_visible")
    .eq("user_id", user.id)
    .maybeSingle<{ is_visible: boolean | null }>();

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
        latitude_private: geocodedCoordinates?.latitude ?? null,
        locality: values.locality,
        location_label_public: locationLabelPublic,
        location_precision: geocodedCoordinates
          ? "geocoded"
          : locationPrecision,
        longitude_private: geocodedCoordinates?.longitude ?? null,
        postal_code_private: values.postalCodePrivate,
        preferred_distance_unit: preferredDistanceUnit,
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
          part: part.part,
          singer_profile_id: profile.id,
          voicing: part.voicing,
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
  if (
    existingProfile &&
    existingProfile.is_visible !== null &&
    existingProfile.is_visible !== values.isVisible
  ) {
    await captureProductEvent(
      "singer_profile_visibility_changed",
      {
        is_visible: values.isVisible,
        route: "/app/profile",
        route_area: "signed_in_app",
        visibility_enabled: values.isVisible,
      },
      { distinctId: pseudonymousAnalyticsUserId(user.id) },
    );
  }
  const locationWarning = discoverabilityLocationWarning(values);
  redirectWithProfileMessage(
    "message",
    locationWarning
      ? `Singer profile saved. ${locationWarning}`
      : "Singer profile saved.",
  );
}

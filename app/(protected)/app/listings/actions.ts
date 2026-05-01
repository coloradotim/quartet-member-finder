"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  captureProductEvent,
  pseudonymousAnalyticsUserId,
} from "@/lib/analytics/product-analytics";
import { discoverabilityLocationWarning } from "@/lib/profiles/singer-profile-form";
import {
  buildQuartetPublicLocationLabel,
  inferQuartetLocationPrecision,
  parseQuartetListingFormData,
} from "@/lib/quartets/quartet-listing-form";
import { distanceUnitForCountry } from "@/lib/location/country-location-defaults";
import {
  shouldGeocodeApproximateLocation,
  storedApproximateCoordinates,
} from "@/lib/location/geocoding-decision";
import { geocodeApproximateLocation } from "@/lib/location/geocoding";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function redirectWithListingMessage(
  key: "error" | "message",
  value: string,
): never {
  redirect(`/app/listings?${key}=${encodeURIComponent(value)}`);
}

export async function saveQuartetListing(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirectWithListingMessage(
      "error",
      "Supabase is not configured for this environment.",
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in?next=/app/listings");
  }

  let values;

  try {
    values = parseQuartetListingFormData(formData);
  } catch (error) {
    redirectWithListingMessage(
      "error",
      error instanceof Error ? error.message : "Listing data is invalid.",
    );
  }

  const { data: existingListing } = values.listingId
    ? await supabase
        .from("quartet_listings")
        .select(
          "country_code, country_name, is_visible, latitude_private, locality, location_precision, longitude_private, postal_code_private, region",
        )
        .eq("id", values.listingId)
        .eq("owner_user_id", user.id)
        .maybeSingle<{
          country_code: string | null;
          country_name: string | null;
          is_visible: boolean | null;
          latitude_private: number | null;
          locality: string | null;
          location_precision: string | null;
          longitude_private: number | null;
          postal_code_private: string | null;
          region: string | null;
        }>()
    : { data: null };
  const storedLocation = existingListing
    ? {
        countryCode: existingListing.country_code,
        countryName: existingListing.country_name,
        latitudePrivate: existingListing.latitude_private,
        locality: existingListing.locality,
        locationPrecision: existingListing.location_precision,
        longitudePrivate: existingListing.longitude_private,
        postalCodePrivate: existingListing.postal_code_private,
        region: existingListing.region,
      }
    : null;
  const shouldGeocode = shouldGeocodeApproximateLocation({
    input: values,
    storageMode: "permanent",
    stored: storedLocation,
  });
  const geocodingResult = shouldGeocode
    ? await geocodeApproximateLocation(values, {
        storageMode: "permanent",
      })
    : null;
  const preservedCoordinates = storedApproximateCoordinates(storedLocation);
  const geocodedCoordinates =
    geocodingResult?.coordinates ??
    (shouldGeocode ? null : preservedCoordinates);
  const listingPayload = {
    availability: values.availability,
    country_code: values.countryCode,
    country_name: values.countryName,
    description: values.description,
    experience_level: values.experienceLevel,
    goals: values.goals,
    is_active: true,
    is_visible: values.isVisible,
    latitude_private: geocodedCoordinates?.latitude ?? null,
    locality: values.locality,
    location_label_public: buildQuartetPublicLocationLabel(values),
    location_precision: geocodedCoordinates
      ? "geocoded"
      : inferQuartetLocationPrecision(values),
    longitude_private: geocodedCoordinates?.longitude ?? null,
    name: values.name,
    owner_user_id: user.id,
    postal_code_private: values.postalCodePrivate,
    preferred_distance_unit: distanceUnitForCountry(
      values.countryCode,
      values.countryName,
    ),
    region: values.region,
    travel_radius_km: values.travelRadiusKm,
  };

  const listingResult = values.listingId
    ? await supabase
        .from("quartet_listings")
        .update(listingPayload)
        .eq("id", values.listingId)
        .eq("owner_user_id", user.id)
        .select("id")
        .single()
    : await supabase
        .from("quartet_listings")
        .insert(listingPayload)
        .select("id")
        .single();

  if (listingResult.error || !listingResult.data) {
    redirectWithListingMessage(
      "error",
      listingResult.error?.message ?? "Unable to save quartet listing.",
    );
  }

  const listingId = listingResult.data.id;
  const { error: deletePartsError } = await supabase
    .from("quartet_listing_parts")
    .delete()
    .eq("quartet_listing_id", listingId);

  if (deletePartsError) {
    redirectWithListingMessage("error", deletePartsError.message);
  }

  const partRows = [
    ...values.partsCovered.map((part) => ({
      part: part.part,
      quartet_listing_id: listingId,
      status: "covered",
      voicing: part.voicing,
    })),
    ...values.partsNeeded.map((part) => ({
      part: part.part,
      quartet_listing_id: listingId,
      status: "needed",
      voicing: part.voicing,
    })),
  ];

  if (partRows.length > 0) {
    const { error: partsError } = await supabase
      .from("quartet_listing_parts")
      .insert(partRows);

    if (partsError) {
      redirectWithListingMessage("error", partsError.message);
    }
  }

  revalidatePath("/app/listings");
  await captureProductEvent(
    "quartet_listing_saved",
    {
      is_visible: values.isVisible,
      route: "/app/listings",
      route_area: "signed_in_app",
      visibility_enabled: values.isVisible,
    },
    { distinctId: pseudonymousAnalyticsUserId(user.id) },
  );
  if (
    existingListing &&
    existingListing.is_visible !== null &&
    existingListing.is_visible !== values.isVisible
  ) {
    await captureProductEvent(
      "quartet_listing_visibility_changed",
      {
        is_visible: values.isVisible,
        route: "/app/listings",
        route_area: "signed_in_app",
        visibility_enabled: values.isVisible,
      },
      { distinctId: pseudonymousAnalyticsUserId(user.id) },
    );
  }
  const locationWarning = discoverabilityLocationWarning(values);
  redirectWithListingMessage(
    "message",
    locationWarning
      ? `Quartet listing saved. ${locationWarning}`
      : "Quartet listing saved.",
  );
}

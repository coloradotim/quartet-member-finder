import Link from "next/link";
import { QuartetListingPartsFieldset } from "@/components/quartet-listing-parts-fieldset";
import {
  PROFILE_GOALS,
  type ProfileGoal,
} from "@/lib/profiles/singer-profile-form";
import {
  countryOptions,
  kilometersToRoundedMiles,
  locationFieldLabelsForCountry,
} from "@/lib/location/country-location-defaults";
import { type Voicing } from "@/lib/parts/voicings";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { saveQuartetListing } from "./actions";

type QuartetListingRow = {
  availability: string | null;
  country_name: string | null;
  description: string | null;
  experience_level: string | null;
  goals: ProfileGoal[];
  id: string;
  is_visible: boolean;
  locality: string | null;
  name: string;
  postal_code_private: string | null;
  region: string | null;
  travel_radius_km: number | null;
};

type ManageListingsPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

const goalLabels: Record<ProfileGoal, string> = {
  casual: "Casual/social singing",
  contest: "Contest quartet",
  learning: "Learning/development",
  paid_gigs: "Paid gigs",
  pickup: "Pickup singing",
  regular_rehearsal: "Regular rehearsing quartet",
};

function checked(value: string, values: readonly string[] | null | undefined) {
  return values?.includes(value) ?? false;
}

function fieldValue(value: string | number | null | undefined) {
  return value == null ? "" : String(value);
}

export default async function ManageListingsPage({
  searchParams,
}: ManageListingsPageProps) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  const { data: listing } =
    supabase && user
      ? await supabase
          .from("quartet_listings")
          .select(
            "id, availability, country_name, description, experience_level, goals, is_visible, locality, name, postal_code_private, region, travel_radius_km",
          )
          .eq("owner_user_id", user.id)
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle<QuartetListingRow>()
      : { data: null };

  const { data: parts } =
    supabase && listing
      ? await supabase
          .from("quartet_listing_parts")
          .select("part, status, voicing")
          .eq("quartet_listing_id", listing.id)
      : { data: [] };

  const selectedVoicing =
    (parts?.[0]?.voicing as Voicing | undefined) ?? "TTBB";
  const partsCovered =
    parts
      ?.filter((partRow) => partRow.status === "covered")
      .map((partRow) => `${partRow.voicing}:${partRow.part}`) ?? [];
  const partsNeeded =
    parts
      ?.filter((partRow) => partRow.status === "needed")
      .map((partRow) => `${partRow.voicing}:${partRow.part}`) ?? [];
  const selectedCountry = listing?.country_name ?? "United States";
  const locationLabels = locationFieldLabelsForCountry(null, selectedCountry);

  return (
    <div>
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2f6f73]">
          Quartet profile
        </p>
        <h1 className="mt-4 text-3xl font-bold text-[#172023]">
          Manage My Quartet Profile
        </h1>
        <p className="mt-4 text-base leading-7 text-[#394548]">
          This profile is for a quartet or prospective quartet you represent.
          Make it discoverable when you are looking for one or more singers;
          hide it any time without affecting your singer profile.
        </p>
      </div>

      {params.error ? (
        <p
          className="mt-8 max-w-3xl rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          role="alert"
        >
          {params.error}
        </p>
      ) : null}

      {params.message ? (
        <p
          className="mt-8 max-w-3xl rounded-lg border border-[#b7d7ce] bg-[#eef8f4] p-4 text-sm text-[#174b4f]"
          role="status"
        >
          {params.message}
        </p>
      ) : null}

      {!listing ? (
        <section className="mt-8 max-w-3xl rounded-lg border border-[#d7cec0] bg-[#fffaf2] p-5">
          <h2 className="text-xl font-bold text-[#172023]">
            Create My Quartet Profile
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#394548]">
            My Quartet Profile is for a quartet or prospective quartet looking
            for singers. Create a profile with covered parts, missing parts, and
            an approximate location so singers can judge whether it might fit.
            You can keep it hidden until the opening is active.
          </p>
          <Link
            className="mt-4 inline-flex font-semibold text-[#2f6f73]"
            href="/find?kind=singers"
          >
            Browse singers in Find first
          </Link>
        </section>
      ) : listing.is_visible ? null : (
        <section className="mt-8 max-w-3xl rounded-lg border border-[#d7cec0] bg-[#fffaf2] p-5">
          <h2 className="text-xl font-bold text-[#172023]">
            My Quartet Profile is hidden
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#394548]">
            Hidden listings do not appear in Find, detailed quartet search, or
            the map view, so singers cannot discover them yet. Turn on
            visibility below when the opening is active. This does not change
            your singer profile visibility.
          </p>
        </section>
      )}

      <form action={saveQuartetListing} className="mt-8 max-w-3xl space-y-8">
        <input name="listingId" type="hidden" value={fieldValue(listing?.id)} />

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[#172023]">Basics</h2>
          <label className="block">
            <span className="text-sm font-semibold text-[#172023]">
              Listing or quartet name
            </span>
            <input
              className="mt-2 w-full rounded-md border border-[#d7cec0] bg-white px-3 py-2 text-base text-[#172023] shadow-sm outline-none focus:border-[#2f6f73] focus:ring-2 focus:ring-[#2f6f73]/20"
              defaultValue={fieldValue(listing?.name)}
              maxLength={160}
              name="name"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-[#172023]">
              Short description
            </span>
            <textarea
              className="mt-2 min-h-28 w-full rounded-md border border-[#d7cec0] bg-white px-3 py-2 text-base text-[#172023] shadow-sm outline-none focus:border-[#2f6f73] focus:ring-2 focus:ring-[#2f6f73]/20"
              defaultValue={fieldValue(listing?.description)}
              maxLength={2400}
              name="description"
            />
          </label>
        </section>

        <QuartetListingPartsFieldset
          initialCoveredParts={partsCovered}
          initialNeededParts={partsNeeded}
          initialVoicing={selectedVoicing}
        />

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[#172023]">Location</h2>
          <p className="text-sm leading-6 text-[#394548]">
            Used only to place this listing approximately on the map and support
            location-based search. ZIP/postal code is not shown publicly, and
            discovery shows an approximate area, not an exact address. No street
            address is required.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-[#172023]">
                Country
              </span>
              <select
                className="mt-2 w-full rounded-md border border-[#d7cec0] bg-white px-3 py-2 text-base text-[#172023] shadow-sm outline-none focus:border-[#2f6f73] focus:ring-2 focus:ring-[#2f6f73]/20"
                defaultValue={selectedCountry}
                name="countryName"
              >
                {countryOptions.map((country) => (
                  <option key={country.name} value={country.name}>
                    {country.name}
                  </option>
                ))}
                {selectedCountry &&
                !countryOptions.some(
                  (country) => country.name === selectedCountry,
                ) ? (
                  <option value={selectedCountry}>{selectedCountry}</option>
                ) : null}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-[#172023]">
                {locationLabels.region}
                <span className="font-normal text-[#596466]"> Optional</span>
              </span>
              <input
                className="mt-2 w-full rounded-md border border-[#d7cec0] bg-white px-3 py-2 text-base text-[#172023] shadow-sm outline-none focus:border-[#2f6f73] focus:ring-2 focus:ring-[#2f6f73]/20"
                defaultValue={fieldValue(listing?.region)}
                maxLength={120}
                name="region"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-[#172023]">
                {locationLabels.locality}
                <span className="font-normal text-[#596466]"> Optional</span>
              </span>
              <input
                className="mt-2 w-full rounded-md border border-[#d7cec0] bg-white px-3 py-2 text-base text-[#172023] shadow-sm outline-none focus:border-[#2f6f73] focus:ring-2 focus:ring-[#2f6f73]/20"
                defaultValue={fieldValue(listing?.locality)}
                maxLength={120}
                name="locality"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-[#172023]">
                {locationLabels.postalCode}
                <span className="font-normal text-[#596466]"> Optional</span>
              </span>
              <input
                className="mt-2 w-full rounded-md border border-[#d7cec0] bg-white px-3 py-2 text-base text-[#172023] shadow-sm outline-none focus:border-[#2f6f73] focus:ring-2 focus:ring-[#2f6f73]/20"
                defaultValue={fieldValue(listing?.postal_code_private)}
                maxLength={40}
                name="postalCodePrivate"
              />
              <span className="mt-2 block text-sm leading-6 text-[#596466]">
                ZIP/postal code is not shown publicly.
              </span>
            </label>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[#172023]">Quartet Fit</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {PROFILE_GOALS.map((goal) => (
              <label
                className="flex items-center gap-3 rounded-md border border-[#d7cec0] bg-[#fffaf2] px-3 py-2"
                key={goal}
              >
                <input
                  defaultChecked={checked(goal, listing?.goals)}
                  name="goals"
                  type="checkbox"
                  value={goal}
                />
                <span className="font-semibold">{goalLabels[goal]}</span>
              </label>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-[#172023]">
                Experience or commitment level
              </span>
              <input
                className="mt-2 w-full rounded-md border border-[#d7cec0] bg-white px-3 py-2 text-base text-[#172023] shadow-sm outline-none focus:border-[#2f6f73] focus:ring-2 focus:ring-[#2f6f73]/20"
                defaultValue={fieldValue(listing?.experience_level)}
                maxLength={120}
                name="experienceLevel"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-[#172023]">
                Travel willingness in miles
              </span>
              <input
                className="mt-2 w-full rounded-md border border-[#d7cec0] bg-white px-3 py-2 text-base text-[#172023] shadow-sm outline-none focus:border-[#2f6f73] focus:ring-2 focus:ring-[#2f6f73]/20"
                defaultValue={kilometersToRoundedMiles(
                  listing?.travel_radius_km,
                )}
                min={0}
                name="travelRadiusMiles"
                type="number"
              />
            </label>
          </div>
          <label className="block">
            <span className="text-sm font-semibold text-[#172023]">
              Rehearsal expectations
            </span>
            <textarea
              className="mt-2 min-h-24 w-full rounded-md border border-[#d7cec0] bg-white px-3 py-2 text-base text-[#172023] shadow-sm outline-none focus:border-[#2f6f73] focus:ring-2 focus:ring-[#2f6f73]/20"
              defaultValue={fieldValue(listing?.availability)}
              maxLength={500}
              name="availability"
            />
          </label>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[#172023]">Visibility</h2>
          <p className="text-sm leading-6 text-[#394548]">
            Discoverable means this profile can appear in Find results and
            approximate map discovery. Hidden means it stays out of discovery.
          </p>
          <label className="flex items-start gap-3 rounded-md border border-[#d7cec0] bg-[#fffaf2] p-4">
            <input
              className="mt-1"
              defaultChecked={listing?.is_visible ?? false}
              name="isVisible"
              type="checkbox"
            />
            <span>
              <span className="block font-semibold text-[#172023]">
                Show My Quartet Profile in discovery
              </span>
              <span className="mt-1 block text-sm leading-6 text-[#596466]">
                Discovery views include the name, parts covered and needed,
                goals, and approximate location only.
              </span>
            </span>
          </label>
        </section>

        <button
          className="w-full rounded-md bg-[#174b4f] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#10393c] sm:w-fit"
          type="submit"
        >
          Save quartet listing
        </button>
      </form>
    </div>
  );
}

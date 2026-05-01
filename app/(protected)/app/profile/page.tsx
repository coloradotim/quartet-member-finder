import Link from "next/link";
import type { ReactNode } from "react";
import {
  PROFILE_GOALS,
  type ProfileGoal,
} from "@/lib/profiles/singer-profile-form";
import {
  countryOptions,
  kilometersToRoundedMiles,
  locationFieldLabelsForCountry,
} from "@/lib/location/country-location-defaults";
import {
  VOICINGS,
  partsByVoicing,
  partLabel,
  voicingLabels,
  voicingPartValue,
} from "@/lib/parts/voicings";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { saveSingerProfile } from "./actions";

type SingerProfileRow = {
  availability: string | null;
  bio: string | null;
  country_name: string | null;
  display_name: string;
  experience_level: string | null;
  goals: ProfileGoal[];
  id: string;
  is_visible: boolean;
  locality: string | null;
  postal_code_private: string | null;
  region: string | null;
  travel_radius_km: number | null;
};

type ManageProfilePageProps = {
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

function FieldNote({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <span className="mt-2 block text-sm leading-6 text-[#596466]" id={id}>
      {children}
    </span>
  );
}

export default async function ManageProfilePage({
  searchParams,
}: ManageProfilePageProps) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  const { data: profile } =
    supabase && user
      ? await supabase
          .from("singer_profiles")
          .select(
            "id, availability, bio, country_name, display_name, experience_level, goals, is_visible, locality, postal_code_private, region, travel_radius_km",
          )
          .eq("user_id", user.id)
          .maybeSingle<SingerProfileRow>()
      : { data: null };

  const { data: parts } =
    supabase && profile
      ? await supabase
          .from("singer_profile_parts")
          .select("part, voicing")
          .eq("singer_profile_id", profile.id)
      : { data: [] };

  const selectedParts =
    parts?.map((partRow) => `${partRow.voicing}:${partRow.part}`) ?? [];
  const selectedCountry = profile?.country_name ?? "United States";
  const locationLabels = locationFieldLabelsForCountry(null, selectedCountry);

  return (
    <div>
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2f6f73]">
          Singer profile
        </p>
        <h1 className="mt-4 text-3xl font-bold text-[#172023]">
          Manage your singer profile
        </h1>
        <p className="mt-4 text-base leading-7 text-[#394548]">
          This profile is for you as an individual singer. Make it discoverable
          if you want quartets or other singers to find you; hide it any time
          without affecting your quartet profile.
        </p>
        <p className="mt-3 text-sm leading-6 text-[#596466]">
          Only display name is required. Everything else is optional, but parts,
          goals, availability, and approximate location make it easier for good
          matches to decide whether to contact you.
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

      {!profile ? (
        <section className="mt-8 max-w-3xl rounded-lg border border-[#d7cec0] bg-[#fffaf2] p-5">
          <h2 className="text-xl font-bold text-[#172023]">
            Create My Singer Profile
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#394548]">
            A singer profile helps quartet openings and other singers find you.
            Start with your parts, goals, and approximate location; you can keep
            it hidden until you are ready. Filling it out does not require
            making it discoverable.
          </p>
          <Link
            className="mt-4 inline-flex font-semibold text-[#2f6f73]"
            href="/find?kind=quartets"
          >
            Browse quartet openings in Find first
          </Link>
        </section>
      ) : profile.is_visible ? null : (
        <section className="mt-8 max-w-3xl rounded-lg border border-[#d7cec0] bg-[#fffaf2] p-5">
          <h2 className="text-xl font-bold text-[#172023]">
            Your profile is hidden
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#394548]">
            Hidden profiles do not appear in Find or detailed singer search.
            Turn on the visibility checkbox below when you want discovery to
            show your public singer details. This does not change your quartet
            profile visibility.
          </p>
        </section>
      )}

      <form action={saveSingerProfile} className="mt-8 max-w-3xl space-y-8">
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[#172023]">Basics</h2>
          <label className="block">
            <span className="text-sm font-semibold text-[#172023]">
              Display name <span className="text-[#8a3b12]">Required</span>
            </span>
            <input
              aria-describedby="display-name-help"
              className="mt-2 w-full rounded-md border border-[#d7cec0] bg-white px-3 py-2 text-base text-[#172023] shadow-sm outline-none focus:border-[#2f6f73] focus:ring-2 focus:ring-[#2f6f73]/20"
              defaultValue={fieldValue(profile?.display_name)}
              maxLength={120}
              name="displayName"
              required
            />
            <FieldNote id="display-name-help">
              Use the name you want visible in discovery. This can be your real
              name, a familiar singing name, or another clear public name.
            </FieldNote>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-[#172023]">
              Short bio{" "}
              <span className="font-normal text-[#596466]">Optional</span>
            </span>
            <textarea
              aria-describedby="bio-help"
              className="mt-2 min-h-28 w-full rounded-md border border-[#d7cec0] bg-white px-3 py-2 text-base text-[#172023] shadow-sm outline-none focus:border-[#2f6f73] focus:ring-2 focus:ring-[#2f6f73]/20"
              defaultValue={fieldValue(profile?.bio)}
              maxLength={2000}
              name="bio"
            />
            <FieldNote id="bio-help">
              Briefly share what kind of singing you enjoy. Avoid private
              contact details here because this text may be public.
            </FieldNote>
          </label>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[#172023]">Parts Sung</h2>
          <p className="text-sm leading-6 text-[#394548]">
            Optional, but strongly recommended. Select every part you would be
            comfortable being contacted about, grouped by voicing. TTBB Tenor
            and SATB Tenor are different discovery contexts.
          </p>
          <div className="grid gap-4">
            {VOICINGS.map((voicing) => (
              <fieldset
                className="rounded-lg border border-[#d7cec0] bg-[#fffaf2] p-4"
                key={voicing}
              >
                <legend className="font-bold text-[#172023]">
                  {voicingLabels[voicing]}
                </legend>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {partsByVoicing[voicing].map((part) => {
                    const value = voicingPartValue(voicing, part);

                    return (
                      <label
                        className="flex items-center gap-3 rounded-md border border-[#d7cec0] bg-white px-3 py-2"
                        key={value}
                      >
                        <input
                          defaultChecked={checked(value, selectedParts)}
                          name="parts"
                          type="checkbox"
                          value={value}
                        />
                        <span className="font-semibold">
                          {partLabel(voicing, part)}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[#172023]">Location</h2>
          <p className="text-sm leading-6 text-[#394548]">
            Used only to place you approximately on the map and support
            location-based search. Your ZIP/postal code is not shown publicly,
            and public discovery shows an approximate area, not your exact
            location. No street address is required.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-[#172023]">
                Country
                <span className="font-normal text-[#596466]"> Optional</span>
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
                defaultValue={fieldValue(profile?.region)}
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
                defaultValue={fieldValue(profile?.locality)}
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
                defaultValue={fieldValue(profile?.postal_code_private)}
                maxLength={40}
                name="postalCodePrivate"
              />
              <FieldNote>
                Your ZIP/postal code is never shown publicly.
              </FieldNote>
            </label>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[#172023]">
            Quartet Preferences
          </h2>
          <p className="text-sm leading-6 text-[#394548]">
            Optional details here help people understand what kind of quartet
            connection might fit before they send a contact request.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {PROFILE_GOALS.map((goal) => (
              <label
                className="flex items-center gap-3 rounded-md border border-[#d7cec0] bg-[#fffaf2] px-3 py-2"
                key={goal}
              >
                <input
                  defaultChecked={checked(goal, profile?.goals)}
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
                Experience level
                <span className="font-normal text-[#596466]"> Optional</span>
              </span>
              <input
                aria-describedby="experience-help"
                className="mt-2 w-full rounded-md border border-[#d7cec0] bg-white px-3 py-2 text-base text-[#172023] shadow-sm outline-none focus:border-[#2f6f73] focus:ring-2 focus:ring-[#2f6f73]/20"
                defaultValue={fieldValue(profile?.experience_level)}
                maxLength={120}
                name="experienceLevel"
                placeholder="Chapter singer, contest quartet experience, new to barbershop"
              />
              <FieldNote id="experience-help">
                Plain descriptions work best, such as “new to barbershop,”
                “experienced chapter singer,” or “contest quartet experience.”
              </FieldNote>
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-[#172023]">
                Travel willingness in miles
                <span className="font-normal text-[#596466]"> Optional</span>
              </span>
              <input
                aria-describedby="travel-radius-help"
                className="mt-2 w-full rounded-md border border-[#d7cec0] bg-white px-3 py-2 text-base text-[#172023] shadow-sm outline-none focus:border-[#2f6f73] focus:ring-2 focus:ring-[#2f6f73]/20"
                defaultValue={kilometersToRoundedMiles(
                  profile?.travel_radius_km,
                )}
                min={0}
                name="travelRadiusMiles"
                type="number"
              />
              <FieldNote id="travel-radius-help">
                Enter about how far you would travel for rehearsals, auditions,
                or pickup singing. Leave blank if you are unsure.
              </FieldNote>
            </label>
          </div>
          <label className="block">
            <span className="text-sm font-semibold text-[#172023]">
              Availability
              <span className="font-normal text-[#596466]"> Optional</span>
            </span>
            <textarea
              aria-describedby="availability-help"
              className="mt-2 min-h-24 w-full rounded-md border border-[#d7cec0] bg-white px-3 py-2 text-base text-[#172023] shadow-sm outline-none focus:border-[#2f6f73] focus:ring-2 focus:ring-[#2f6f73]/20"
              defaultValue={fieldValue(profile?.availability)}
              maxLength={500}
              name="availability"
              placeholder="Weeknight rehearsals, occasional weekends, contest season, pickup singing at events"
            />
            <FieldNote id="availability-help">
              Mention useful constraints: weeknights or weekends, rehearsal
              frequency, contest interest, pickup singing, or travel limits.
            </FieldNote>
          </label>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[#172023]">Visibility</h2>
          <p className="text-sm leading-6 text-[#394548]">
            Discoverable means this profile can appear in Find results and
            approximate map discovery inside Find. Hidden means it stays out of
            discovery.
          </p>
          <label className="flex items-start gap-3 rounded-md border border-[#d7cec0] bg-[#fffaf2] p-4">
            <input
              className="mt-1"
              defaultChecked={profile?.is_visible ?? false}
              name="isVisible"
              type="checkbox"
            />
            <span>
              <span className="block font-semibold text-[#172023]">
                Show my singer profile in discovery
              </span>
              <span className="mt-1 block text-sm leading-6 text-[#596466]">
                Discovery views include your display name, parts, goals, and
                approximate location only. Turn this off if the profile is not
                ready for people to find.
              </span>
            </span>
          </label>
        </section>

        <button
          className="w-full rounded-md bg-[#174b4f] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#10393c] sm:w-fit"
          type="submit"
        >
          Save singer profile
        </button>
      </form>
    </div>
  );
}

import Link from "next/link";
import {
  PROFILE_GOALS,
  type ProfileGoal,
} from "@/lib/profiles/singer-profile-form";
import { locationFieldLabelsForCountry } from "@/lib/location/country-location-defaults";
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
  country_code: string | null;
  country_name: string | null;
  display_name: string;
  experience_level: string | null;
  goals: ProfileGoal[];
  id: string;
  is_visible: boolean;
  locality: string | null;
  location_label_public: string | null;
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
            "id, availability, bio, country_code, country_name, display_name, experience_level, goals, is_visible, locality, location_label_public, postal_code_private, region, travel_radius_km",
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
  const locationLabels = locationFieldLabelsForCountry(
    profile?.country_code,
    profile?.country_name,
  );

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
          Create the public singer profile that quartets and other singers can
          discover. Location and country also set sensible distance defaults, so
          you do not need a separate account settings step.
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
            it hidden until you are ready.
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
            Hidden profiles do not appear in Find, detailed singer search, or
            the map view. Turn on the visibility checkbox below when you want
            discovery to show your public singer details.
          </p>
        </section>
      )}

      <form action={saveSingerProfile} className="mt-8 max-w-3xl space-y-8">
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[#172023]">Basics</h2>
          <label className="block">
            <span className="text-sm font-semibold text-[#172023]">
              Display name
            </span>
            <input
              className="mt-2 w-full rounded-md border border-[#d7cec0] bg-white px-3 py-2 text-base text-[#172023] shadow-sm outline-none focus:border-[#2f6f73] focus:ring-2 focus:ring-[#2f6f73]/20"
              defaultValue={fieldValue(profile?.display_name)}
              maxLength={120}
              name="displayName"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-[#172023]">
              Short bio
            </span>
            <textarea
              className="mt-2 min-h-28 w-full rounded-md border border-[#d7cec0] bg-white px-3 py-2 text-base text-[#172023] shadow-sm outline-none focus:border-[#2f6f73] focus:ring-2 focus:ring-[#2f6f73]/20"
              defaultValue={fieldValue(profile?.bio)}
              maxLength={2000}
              name="bio"
            />
          </label>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[#172023]">Parts Sung</h2>
          <p className="text-sm leading-6 text-[#394548]">
            Select every part you sing, grouped by voicing. TTBB Tenor and SATB
            Tenor are different discovery contexts.
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
            Start with country so the app can use sensible wording and distance
            defaults. Public discovery shows your approximate label or
            city/region/country area. Postal code stays private for future
            matching; exact addresses and coordinates are not shown.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-[#172023]">
                Country name
              </span>
              <input
                className="mt-2 w-full rounded-md border border-[#d7cec0] bg-white px-3 py-2 text-base text-[#172023] shadow-sm outline-none focus:border-[#2f6f73] focus:ring-2 focus:ring-[#2f6f73]/20"
                defaultValue={fieldValue(profile?.country_name)}
                maxLength={120}
                name="countryName"
                placeholder="United Kingdom"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-[#172023]">
                Country code
              </span>
              <input
                className="mt-2 w-full rounded-md border border-[#d7cec0] bg-white px-3 py-2 text-base uppercase text-[#172023] shadow-sm outline-none focus:border-[#2f6f73] focus:ring-2 focus:ring-[#2f6f73]/20"
                defaultValue={fieldValue(profile?.country_code)}
                maxLength={2}
                name="countryCode"
                placeholder="GB"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-[#172023]">
                {locationLabels.locality}
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
                {locationLabels.region}
              </span>
              <input
                className="mt-2 w-full rounded-md border border-[#d7cec0] bg-white px-3 py-2 text-base text-[#172023] shadow-sm outline-none focus:border-[#2f6f73] focus:ring-2 focus:ring-[#2f6f73]/20"
                defaultValue={fieldValue(profile?.region)}
                maxLength={120}
                name="region"
              />
            </label>
          </div>
          <label className="block">
            <span className="text-sm font-semibold text-[#172023]">
              Public approximate location
            </span>
            <input
              className="mt-2 w-full rounded-md border border-[#d7cec0] bg-white px-3 py-2 text-base text-[#172023] shadow-sm outline-none focus:border-[#2f6f73] focus:ring-2 focus:ring-[#2f6f73]/20"
              defaultValue={fieldValue(profile?.location_label_public)}
              maxLength={160}
              name="locationLabelPublic"
              placeholder="Manchester, UK area"
            />
            <span className="mt-2 block text-sm leading-6 text-[#596466]">
              This is the public label people see. Leave it blank to use
              city/region/country as an approximate area.
            </span>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-[#172023]">
              Private {locationLabels.postalCode.toLowerCase()}
            </span>
            <input
              className="mt-2 w-full rounded-md border border-[#d7cec0] bg-white px-3 py-2 text-base text-[#172023] shadow-sm outline-none focus:border-[#2f6f73] focus:ring-2 focus:ring-[#2f6f73]/20"
              defaultValue={fieldValue(profile?.postal_code_private)}
              maxLength={40}
              name="postalCodePrivate"
            />
          </label>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[#172023]">
            Quartet Preferences
          </h2>
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
              </span>
              <input
                className="mt-2 w-full rounded-md border border-[#d7cec0] bg-white px-3 py-2 text-base text-[#172023] shadow-sm outline-none focus:border-[#2f6f73] focus:ring-2 focus:ring-[#2f6f73]/20"
                defaultValue={fieldValue(profile?.experience_level)}
                maxLength={120}
                name="experienceLevel"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-[#172023]">
                Travel willingness in km
              </span>
              <input
                className="mt-2 w-full rounded-md border border-[#d7cec0] bg-white px-3 py-2 text-base text-[#172023] shadow-sm outline-none focus:border-[#2f6f73] focus:ring-2 focus:ring-[#2f6f73]/20"
                defaultValue={fieldValue(profile?.travel_radius_km)}
                min={0}
                name="travelRadiusKm"
                type="number"
              />
            </label>
          </div>
          <label className="block">
            <span className="text-sm font-semibold text-[#172023]">
              Availability
            </span>
            <textarea
              className="mt-2 min-h-24 w-full rounded-md border border-[#d7cec0] bg-white px-3 py-2 text-base text-[#172023] shadow-sm outline-none focus:border-[#2f6f73] focus:ring-2 focus:ring-[#2f6f73]/20"
              defaultValue={fieldValue(profile?.availability)}
              maxLength={500}
              name="availability"
            />
          </label>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[#172023]">Visibility</h2>
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
                approximate location only.
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

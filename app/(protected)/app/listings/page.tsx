import {
  BARBERSHOP_PARTS,
  PROFILE_GOALS,
  type BarbershopPart,
  type ProfileGoal,
} from "@/lib/profiles/singer-profile-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { saveQuartetListing } from "./actions";

type QuartetListingRow = {
  availability: string | null;
  country_code: string | null;
  country_name: string | null;
  description: string | null;
  experience_level: string | null;
  goals: ProfileGoal[];
  id: string;
  is_visible: boolean;
  locality: string | null;
  location_label_public: string | null;
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

const partLabels: Record<BarbershopPart, string> = {
  baritone: "Baritone",
  bass: "Bass",
  lead: "Lead",
  tenor: "Tenor",
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
            "id, availability, country_code, country_name, description, experience_level, goals, is_visible, locality, location_label_public, name, postal_code_private, region, travel_radius_km",
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
          .select("part, status")
          .eq("quartet_listing_id", listing.id)
      : { data: [] };

  const partsCovered =
    parts
      ?.filter((partRow) => partRow.status === "covered")
      .map((partRow) => partRow.part as BarbershopPart) ?? [];
  const partsNeeded =
    parts
      ?.filter((partRow) => partRow.status === "needed")
      .map((partRow) => partRow.part as BarbershopPart) ?? [];

  return (
    <div>
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2f6f73]">
          Quartet listings
        </p>
        <h1 className="mt-4 text-3xl font-bold text-[#172023]">
          Manage quartet listing
        </h1>
        <p className="mt-4 text-base leading-7 text-[#394548]">
          Create the listing that tells singers which parts are covered, which
          parts are needed, and what kind of quartet you are building. Keep the
          public location approximate.
        </p>
      </div>

      {params.error ? (
        <p className="mt-8 max-w-3xl rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {params.error}
        </p>
      ) : null}

      {params.message ? (
        <p className="mt-8 max-w-3xl rounded-lg border border-[#b7d7ce] bg-[#eef8f4] p-4 text-sm text-[#174b4f]">
          {params.message}
        </p>
      ) : null}

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

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[#172023]">Parts</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold text-[#172023]">
                Currently covered
              </legend>
              {BARBERSHOP_PARTS.map((part) => (
                <label
                  className="flex items-center gap-3 rounded-md border border-[#d7cec0] bg-[#fffaf2] px-3 py-2"
                  key={part}
                >
                  <input
                    defaultChecked={checked(part, partsCovered)}
                    name="partsCovered"
                    type="checkbox"
                    value={part}
                  />
                  <span className="font-semibold">{partLabels[part]}</span>
                </label>
              ))}
            </fieldset>
            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold text-[#172023]">
                Needed
              </legend>
              {BARBERSHOP_PARTS.map((part) => (
                <label
                  className="flex items-center gap-3 rounded-md border border-[#d7cec0] bg-[#fffaf2] px-3 py-2"
                  key={part}
                >
                  <input
                    defaultChecked={checked(part, partsNeeded)}
                    name="partsNeeded"
                    type="checkbox"
                    value={part}
                  />
                  <span className="font-semibold">{partLabels[part]}</span>
                </label>
              ))}
            </fieldset>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[#172023]">Location</h2>
          <label className="block">
            <span className="text-sm font-semibold text-[#172023]">
              Public approximate location
            </span>
            <input
              className="mt-2 w-full rounded-md border border-[#d7cec0] bg-white px-3 py-2 text-base text-[#172023] shadow-sm outline-none focus:border-[#2f6f73] focus:ring-2 focus:ring-[#2f6f73]/20"
              defaultValue={fieldValue(listing?.location_label_public)}
              maxLength={160}
              name="locationLabelPublic"
              placeholder="Toronto, ON area"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-[#172023]">
                Locality/city
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
                Region/admin area
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
                Country name
              </span>
              <input
                className="mt-2 w-full rounded-md border border-[#d7cec0] bg-white px-3 py-2 text-base text-[#172023] shadow-sm outline-none focus:border-[#2f6f73] focus:ring-2 focus:ring-[#2f6f73]/20"
                defaultValue={fieldValue(listing?.country_name)}
                maxLength={120}
                name="countryName"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-[#172023]">
                Country code
              </span>
              <input
                className="mt-2 w-full rounded-md border border-[#d7cec0] bg-white px-3 py-2 text-base uppercase text-[#172023] shadow-sm outline-none focus:border-[#2f6f73] focus:ring-2 focus:ring-[#2f6f73]/20"
                defaultValue={fieldValue(listing?.country_code)}
                maxLength={2}
                name="countryCode"
                placeholder="CA"
              />
            </label>
          </div>
          <label className="block">
            <span className="text-sm font-semibold text-[#172023]">
              Postal code
            </span>
            <input
              className="mt-2 w-full rounded-md border border-[#d7cec0] bg-white px-3 py-2 text-base text-[#172023] shadow-sm outline-none focus:border-[#2f6f73] focus:ring-2 focus:ring-[#2f6f73]/20"
              defaultValue={fieldValue(listing?.postal_code_private)}
              maxLength={40}
              name="postalCodePrivate"
            />
          </label>
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
                Travel willingness in km
              </span>
              <input
                className="mt-2 w-full rounded-md border border-[#d7cec0] bg-white px-3 py-2 text-base text-[#172023] shadow-sm outline-none focus:border-[#2f6f73] focus:ring-2 focus:ring-[#2f6f73]/20"
                defaultValue={fieldValue(listing?.travel_radius_km)}
                min={0}
                name="travelRadiusKm"
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
          <label className="flex items-start gap-3 rounded-md border border-[#d7cec0] bg-[#fffaf2] p-4">
            <input
              className="mt-1"
              defaultChecked={listing?.is_visible ?? false}
              name="isVisible"
              type="checkbox"
            />
            <span>
              <span className="block font-semibold text-[#172023]">
                Show this quartet listing in discovery
              </span>
              <span className="mt-1 block text-sm leading-6 text-[#596466]">
                Discovery views include the name, parts covered and needed,
                goals, and approximate location only.
              </span>
            </span>
          </label>
        </section>

        <button
          className="rounded-md bg-[#174b4f] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#10393c]"
          type="submit"
        >
          Save quartet listing
        </button>
      </form>
    </div>
  );
}

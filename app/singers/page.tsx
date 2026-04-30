import Link from "next/link";
import {
  approximateLocationLabel,
  toPublicLocationSummary,
  travelRadiusLabel,
} from "@/lib/location/approximate-location";
import { parseDiscoveryFilters } from "@/lib/search/discovery-filters";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type SingerDiscoveryRow = {
  availability: string | null;
  country_name: string | null;
  display_name: string;
  experience_level: string | null;
  goals: string[];
  id: string;
  locality: string | null;
  location_label_public: string | null;
  parts: string[];
  preferred_distance_unit: "km" | "mi";
  region: string | null;
  travel_radius_km: number | null;
};

type SearchPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const partOptions = [
  ["", "Any part"],
  ["tenor", "Tenor"],
  ["lead", "Lead"],
  ["baritone", "Baritone"],
  ["bass", "Bass"],
];

const goalOptions = [
  ["", "Any goal"],
  ["casual", "Casual/social"],
  ["pickup", "Pickup singing"],
  ["regular_rehearsal", "Regular rehearsing"],
  ["contest", "Contest"],
  ["paid_gigs", "Paid gigs"],
  ["learning", "Learning"],
];

function textValue(value: string | null) {
  return value ?? "";
}

function tags(values: string[]) {
  return values.map((value) => value.replaceAll("_", " ")).join(", ");
}

export default async function SingerSearchPage({
  searchParams,
}: SearchPageProps) {
  const params = await searchParams;
  const filters = parseDiscoveryFilters(params);
  const supabase = await createSupabaseServerClient();

  let singers: SingerDiscoveryRow[] = [];
  let errorMessage: string | null = null;

  if (!supabase) {
    errorMessage = "Supabase is not configured for discovery search yet.";
  } else {
    let query = supabase
      .from("singer_discovery_profiles")
      .select(
        "id, display_name, parts, goals, experience_level, availability, travel_radius_km, preferred_distance_unit, country_name, region, locality, location_label_public",
      )
      .order("updated_at", { ascending: false });

    if (filters.country) {
      query = query.ilike("country_name", `%${filters.country}%`);
    }

    if (filters.region) {
      query = query.ilike("region", `%${filters.region}%`);
    }

    if (filters.locality) {
      query = query.ilike("locality", `%${filters.locality}%`);
    }

    if (filters.part) {
      query = query.contains("parts", [filters.part]);
    }

    if (filters.goal) {
      query = query.contains("goals", [filters.goal]);
    }

    if (filters.experience) {
      query = query.ilike("experience_level", `%${filters.experience}%`);
    }

    if (filters.availability) {
      query = query.ilike("availability", `%${filters.availability}%`);
    }

    if (filters.travelRadiusKm != null) {
      query = query.gte("travel_radius_km", filters.travelRadiusKm);
    }

    const { data, error } = await query;

    if (error) {
      errorMessage = error.message;
    } else {
      singers = (data ?? []) as SingerDiscoveryRow[];
    }
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link className="text-sm font-semibold text-[#2f6f73]" href="/">
            Quartet Member Finder
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-[#172023]">
            Find singers
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[#394548]">
            Search visible singer profiles using privacy-safe discovery data.
            Results show approximate location only.
          </p>
        </div>
        <div className="flex gap-4">
          <Link className="font-semibold text-[#2f6f73]" href="/quartets">
            Find quartets
          </Link>
          <Link className="font-semibold text-[#2f6f73]" href="/map">
            View map
          </Link>
        </div>
      </div>

      <form className="mt-8 grid gap-4 rounded-lg border border-[#d7cec0] bg-[#fffaf2] p-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block">
          <span className="text-sm font-semibold">Country</span>
          <input
            className="mt-2 w-full rounded-md border border-[#d7cec0] px-3 py-2"
            defaultValue={textValue(filters.country)}
            name="country"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold">Region</span>
          <input
            className="mt-2 w-full rounded-md border border-[#d7cec0] px-3 py-2"
            defaultValue={textValue(filters.region)}
            name="region"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold">Locality</span>
          <input
            className="mt-2 w-full rounded-md border border-[#d7cec0] px-3 py-2"
            defaultValue={textValue(filters.locality)}
            name="locality"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold">Part</span>
          <select
            className="mt-2 w-full rounded-md border border-[#d7cec0] px-3 py-2"
            defaultValue={textValue(filters.part)}
            name="part"
          >
            {partOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-semibold">Goal</span>
          <select
            className="mt-2 w-full rounded-md border border-[#d7cec0] px-3 py-2"
            defaultValue={textValue(filters.goal)}
            name="goal"
          >
            {goalOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-semibold">Experience</span>
          <input
            className="mt-2 w-full rounded-md border border-[#d7cec0] px-3 py-2"
            defaultValue={textValue(filters.experience)}
            name="experience"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold">Availability</span>
          <input
            className="mt-2 w-full rounded-md border border-[#d7cec0] px-3 py-2"
            defaultValue={textValue(filters.availability)}
            name="availability"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold">Travel km</span>
          <input
            className="mt-2 w-full rounded-md border border-[#d7cec0] px-3 py-2"
            defaultValue={textValue(
              filters.travelRadiusKm == null
                ? null
                : String(filters.travelRadiusKm),
            )}
            min={0}
            name="travelRadiusKm"
            type="number"
          />
        </label>
        <div className="flex items-end gap-3 sm:col-span-2 lg:col-span-4">
          <button
            className="rounded-md bg-[#174b4f] px-4 py-2.5 text-sm font-semibold text-white"
            type="submit"
          >
            Search
          </button>
          <Link className="font-semibold text-[#2f6f73]" href="/singers">
            Clear
          </Link>
        </div>
      </form>

      {errorMessage ? (
        <p className="mt-8 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {errorMessage}
        </p>
      ) : null}

      <section className="mt-8 grid gap-4">
        {singers.length === 0 && !errorMessage ? (
          <p className="rounded-lg border border-[#d7cec0] bg-[#fffaf2] p-5 text-[#394548]">
            No visible singer profiles match these filters yet.
          </p>
        ) : null}

        {singers.map((singer) => (
          <article
            className="rounded-lg border border-[#d7cec0] bg-[#fffaf2] p-5 shadow-sm"
            key={singer.id}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#172023]">
                  {singer.display_name}
                </h2>
                <p className="mt-1 text-sm text-[#596466]">
                  {approximateLocationLabel(
                    toPublicLocationSummary({
                      countryName: singer.country_name,
                      locality: singer.locality,
                      locationLabelPublic: singer.location_label_public,
                      region: singer.region,
                    }),
                  )}
                </p>
              </div>
              <p className="text-sm font-semibold text-[#2f6f73]">
                {tags(singer.parts)}
              </p>
            </div>
            <dl className="mt-4 grid gap-3 text-sm text-[#394548] sm:grid-cols-2">
              {singer.goals.length > 0 ? (
                <div>
                  <dt className="font-semibold text-[#172023]">Goals</dt>
                  <dd>{tags(singer.goals)}</dd>
                </div>
              ) : null}
              {singer.experience_level ? (
                <div>
                  <dt className="font-semibold text-[#172023]">Experience</dt>
                  <dd>{singer.experience_level}</dd>
                </div>
              ) : null}
              {singer.availability ? (
                <div>
                  <dt className="font-semibold text-[#172023]">Availability</dt>
                  <dd>{singer.availability}</dd>
                </div>
              ) : null}
              {travelRadiusLabel(
                singer.travel_radius_km,
                singer.preferred_distance_unit,
              ) ? (
                <div>
                  <dt className="font-semibold text-[#172023]">Travel</dt>
                  <dd>
                    {travelRadiusLabel(
                      singer.travel_radius_km,
                      singer.preferred_distance_unit,
                    )}
                  </dd>
                </div>
              ) : null}
            </dl>
          </article>
        ))}
      </section>
    </main>
  );
}

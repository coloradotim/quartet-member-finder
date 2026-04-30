import Link from "next/link";
import { ContactRequestForm } from "@/components/contact/contact-request-form";
import { contactStatusMessage } from "@/lib/contact/contact-status";
import {
  approximateLocationLabel,
  toPublicLocationSummary,
  travelRadiusLabel,
} from "@/lib/location/approximate-location";
import { parseDiscoveryFilters } from "@/lib/search/discovery-filters";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type QuartetDiscoveryRow = {
  availability: string | null;
  country_name: string | null;
  description: string | null;
  experience_level: string | null;
  goals: string[];
  id: string;
  locality: string | null;
  location_label_public: string | null;
  name: string;
  parts_covered: string[];
  parts_needed: string[];
  preferred_distance_unit: "km" | "mi";
  region: string | null;
  travel_radius_km: number | null;
};

type SearchPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const partOptions = [
  ["", "Any needed part"],
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

function returnToPath(params: Record<string, string | string[] | undefined>) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (key === "contact") {
      continue;
    }

    const normalized = Array.isArray(value) ? value[0] : value;

    if (normalized) {
      query.set(key, normalized);
    }
  }

  const queryString = query.toString();

  return queryString ? `/quartets?${queryString}` : "/quartets";
}

function contactBannerClass(tone: "error" | "notice" | "success") {
  if (tone === "error") {
    return "mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800";
  }

  if (tone === "success") {
    return "mt-6 rounded-lg border border-[#b7d7ce] bg-[#eef8f4] p-4 text-sm text-[#174b4f]";
  }

  return "mt-6 rounded-lg border border-[#d7cec0] bg-[#fffaf2] p-4 text-sm text-[#394548]";
}

export default async function QuartetSearchPage({
  searchParams,
}: SearchPageProps) {
  const params = await searchParams;
  const filters = parseDiscoveryFilters(params);
  const returnTo = returnToPath(params);
  const contactStatus = contactStatusMessage(params.contact);
  const supabase = await createSupabaseServerClient();

  let quartets: QuartetDiscoveryRow[] = [];
  let errorMessage: string | null = null;

  if (!supabase) {
    errorMessage = "Supabase is not configured for discovery search yet.";
  } else {
    let query = supabase
      .from("quartet_discovery_listings")
      .select(
        "id, name, description, parts_covered, parts_needed, goals, experience_level, availability, travel_radius_km, preferred_distance_unit, country_name, region, locality, location_label_public",
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
      query = query.contains("parts_needed", [filters.part]);
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
      quartets = (data ?? []) as QuartetDiscoveryRow[];
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
            Find quartets
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[#394548]">
            Search visible quartet listings using privacy-safe discovery data.
            Results show approximate location only.
          </p>
        </div>
        <div className="flex gap-4">
          <Link className="font-semibold text-[#2f6f73]" href="/singers">
            Find singers
          </Link>
          <Link className="font-semibold text-[#2f6f73]" href="/map">
            View map
          </Link>
          <Link className="font-semibold text-[#2f6f73]" href="/help">
            Help
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
          <span className="text-sm font-semibold">Needed part</span>
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
          <span className="text-sm font-semibold">Commitment</span>
          <input
            className="mt-2 w-full rounded-md border border-[#d7cec0] px-3 py-2"
            defaultValue={textValue(filters.experience)}
            name="experience"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold">Rehearsal</span>
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
          <Link className="font-semibold text-[#2f6f73]" href="/quartets">
            Clear
          </Link>
        </div>
      </form>

      {contactStatus ? (
        <p className={contactBannerClass(contactStatus.tone)}>
          {contactStatus.text}
        </p>
      ) : null}

      {errorMessage ? (
        <p className="mt-8 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {errorMessage}
        </p>
      ) : null}

      <section className="mt-8 grid gap-4">
        {quartets.length === 0 && !errorMessage ? (
          <p className="rounded-lg border border-[#d7cec0] bg-[#fffaf2] p-5 text-[#394548]">
            No visible quartet listings match these filters yet.
          </p>
        ) : null}

        {quartets.map((quartet) => (
          <article
            className="rounded-lg border border-[#d7cec0] bg-[#fffaf2] p-5 shadow-sm"
            key={quartet.id}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#172023]">
                  {quartet.name}
                </h2>
                <p className="mt-1 text-sm text-[#596466]">
                  {approximateLocationLabel(
                    toPublicLocationSummary({
                      countryName: quartet.country_name,
                      locality: quartet.locality,
                      locationLabelPublic: quartet.location_label_public,
                      region: quartet.region,
                    }),
                  )}
                </p>
              </div>
              <p className="text-sm font-semibold text-[#2f6f73]">
                Seeking {tags(quartet.parts_needed)}
              </p>
            </div>
            {quartet.description ? (
              <p className="mt-4 text-sm leading-6 text-[#394548]">
                {quartet.description}
              </p>
            ) : null}
            <dl className="mt-4 grid gap-3 text-sm text-[#394548] sm:grid-cols-2">
              {quartet.parts_covered.length > 0 ? (
                <div>
                  <dt className="font-semibold text-[#172023]">Covered</dt>
                  <dd>{tags(quartet.parts_covered)}</dd>
                </div>
              ) : null}
              {quartet.goals.length > 0 ? (
                <div>
                  <dt className="font-semibold text-[#172023]">Goals</dt>
                  <dd>{tags(quartet.goals)}</dd>
                </div>
              ) : null}
              {quartet.experience_level ? (
                <div>
                  <dt className="font-semibold text-[#172023]">Commitment</dt>
                  <dd>{quartet.experience_level}</dd>
                </div>
              ) : null}
              {quartet.availability ? (
                <div>
                  <dt className="font-semibold text-[#172023]">Rehearsal</dt>
                  <dd>{quartet.availability}</dd>
                </div>
              ) : null}
              {travelRadiusLabel(
                quartet.travel_radius_km,
                quartet.preferred_distance_unit,
              ) ? (
                <div>
                  <dt className="font-semibold text-[#172023]">Travel</dt>
                  <dd>
                    {travelRadiusLabel(
                      quartet.travel_radius_km,
                      quartet.preferred_distance_unit,
                    )}
                  </dd>
                </div>
              ) : null}
            </dl>
            <ContactRequestForm
              returnTo={returnTo}
              targetId={quartet.id}
              targetKind="quartet"
              targetName={quartet.name}
            />
          </article>
        ))}
      </section>
    </main>
  );
}

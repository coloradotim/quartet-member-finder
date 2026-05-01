import Link from "next/link";
import { ContactRequestForm } from "@/components/contact/contact-request-form";
import { DiscoveryModeNav } from "@/components/discovery/discovery-mode-nav";
import { SignedInSiteHeader } from "@/components/navigation/signed-in-site-header";
import { captureProductEvent } from "@/lib/analytics/product-analytics";
import { requireAuthenticatedDiscovery } from "@/lib/auth/require-authenticated-discovery";
import { contactStatusMessage } from "@/lib/contact/contact-status";
import {
  approximateLocationLabel,
  toPublicLocationSummary,
  travelRadiusLabel,
} from "@/lib/location/approximate-location";
import {
  groupVoicingParts,
  voicingPartOptions,
  voicingPartValue,
} from "@/lib/parts/voicings";
import { parseDiscoveryFilters } from "@/lib/search/discovery-filters";

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

const partOptions = voicingPartOptions("Any voicing / part");

const goalOptions = [
  ["", "Any goal"],
  ["casual", "Casual/social"],
  ["pickup", "Pickup singing"],
  ["regular_rehearsal", "Regular rehearsing"],
  ["contest", "Contest"],
  ["paid_gigs", "Paid gigs"],
  ["learning", "Learning"],
];

const filterControlClass =
  "mt-2 w-full rounded-md border border-[#d7cec0] bg-white px-3 py-2 text-base text-[#172023] shadow-sm outline-none focus:border-[#2f6f73] focus:ring-2 focus:ring-[#2f6f73]/20";

function textValue(value: string | null) {
  return value ?? "";
}

function tags(values: string[]) {
  return values.map((value) => value.replaceAll("_", " ")).join(", ");
}

function partsLabel(values: string[]) {
  return groupVoicingParts(values) || "No parts listed";
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

  return queryString ? `/singers?${queryString}` : "/singers";
}

function filterAnalyticsProperties(
  filters: ReturnType<typeof parseDiscoveryFilters>,
) {
  const flags = {
    has_availability_filter: Boolean(filters.availability),
    has_country_filter: Boolean(filters.country),
    has_experience_filter: Boolean(filters.experience),
    has_goal_filter: filters.goals.length > 0,
    has_locality_filter: Boolean(filters.locality),
    has_part_filter: Boolean(filters.part),
    has_region_filter: Boolean(filters.region),
    has_travel_filter: filters.travelRadiusKm != null,
  };
  const filterCount = Object.values(flags).filter(Boolean).length;

  return { filterCount, flags };
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

export default async function SingerSearchPage({
  searchParams,
}: SearchPageProps) {
  const params = await searchParams;
  const filters = parseDiscoveryFilters(params);
  const returnTo = returnToPath(params);
  const contactStatus = contactStatusMessage(params.contact);
  const supabase = await requireAuthenticatedDiscovery("/singers", params);

  let singers: SingerDiscoveryRow[] = [];
  let errorMessage: string | null = null;

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
    query = query.contains("parts", [
      voicingPartValue(filters.part.voicing, filters.part.part),
    ]);
  }

  if (filters.goals.length > 0) {
    query = query.overlaps("goals", filters.goals);
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

  const { filterCount, flags } = filterAnalyticsProperties(filters);

  if (filterCount > 0) {
    await captureProductEvent("discovery_search_submitted", {
      ...flags,
      filter_count: filterCount,
      kind: "singer",
      route: "/singers",
      result_count: singers.length,
      route_area: "discovery",
    });
  }

  return (
    <>
      <SignedInSiteHeader />
      <main className="mx-auto w-full max-w-6xl px-6 py-12">
        <div>
          <h1 className="mt-4 text-3xl font-bold text-[#172023]">
            Find singers
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[#394548]">
            Use this view when you are representing a quartet that needs a part,
            or when you are a singer looking for other singers nearby. Results
            show approximate location only.
          </p>
        </div>

        <DiscoveryModeNav activeMode="singers" />

        <form
          aria-label="Filter singer profiles"
          className="mt-8 grid gap-4 rounded-lg border border-[#d7cec0] bg-[#fffaf2] p-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <label className="block">
            <span className="text-sm font-semibold">Country</span>
            <input
              className={filterControlClass}
              defaultValue={textValue(filters.country)}
              name="country"
              placeholder="Canada"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold">Region</span>
            <input
              className={filterControlClass}
              defaultValue={textValue(filters.region)}
              name="region"
              placeholder="Ontario"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold">Locality</span>
            <input
              className={filterControlClass}
              defaultValue={textValue(filters.locality)}
              name="locality"
              placeholder="Toronto"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold">Part</span>
            <select
              className={filterControlClass}
              defaultValue={
                filters.part
                  ? voicingPartValue(filters.part.voicing, filters.part.part)
                  : ""
              }
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
              className={filterControlClass}
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
              className={filterControlClass}
              defaultValue={textValue(filters.experience)}
              name="experience"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold">Availability</span>
            <input
              className={filterControlClass}
              defaultValue={textValue(filters.availability)}
              name="availability"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold">Travel km</span>
            <input
              className={filterControlClass}
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
          <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-end lg:col-span-4">
            <button
              className="rounded-md bg-[#174b4f] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#10393c]"
              type="submit"
            >
              Search
            </button>
            <Link
              className="inline-flex min-h-11 items-center rounded-md px-2 py-2 font-semibold text-[#2f6f73] hover:bg-white/70"
              href="/singers"
            >
              Clear
            </Link>
          </div>
        </form>

        {contactStatus ? (
          <p
            className={contactBannerClass(contactStatus.tone)}
            role={contactStatus.tone === "error" ? "alert" : "status"}
          >
            {contactStatus.text}
          </p>
        ) : null}

        {errorMessage ? (
          <p
            className="mt-8 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
            role="alert"
          >
            {errorMessage}
          </p>
        ) : null}

        <section className="mt-8 grid gap-4">
          {singers.length === 0 && !errorMessage ? (
            <section className="rounded-lg border border-[#d7cec0] bg-[#fffaf2] p-5 text-[#394548]">
              <h2 className="text-xl font-bold text-[#172023]">
                No visible singer profiles match these filters yet
              </h2>
              <p className="mt-3 text-sm leading-6">
                Try clearing filters, widening the country/region/locality, or
                using the Find map. Early on, some singers may still be creating
                My Singer Profile or keeping it hidden.
              </p>
              <div className="mt-4 flex flex-wrap gap-4">
                <Link className="font-semibold text-[#2f6f73]" href="/singers">
                  Clear filters
                </Link>
                <Link className="font-semibold text-[#2f6f73]" href="/find">
                  Return to Find map
                </Link>
                <Link className="font-semibold text-[#2f6f73]" href="/quartets">
                  Find quartet openings
                </Link>
              </div>
            </section>
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
                  {partsLabel(singer.parts)}
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
                    <dt className="font-semibold text-[#172023]">
                      Availability
                    </dt>
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
              <ContactRequestForm
                returnTo={returnTo}
                targetId={singer.id}
                targetKind="singer"
                targetName={singer.display_name}
              />
            </article>
          ))}
        </section>
      </main>
    </>
  );
}

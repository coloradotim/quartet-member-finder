import { ContactRequestForm } from "@/components/contact/contact-request-form";
import { SignedInSiteHeader } from "@/components/navigation/signed-in-site-header";
import { captureProductEvent } from "@/lib/analytics/product-analytics";
import { requireAuthenticatedDiscovery } from "@/lib/auth/require-authenticated-discovery";
import {
  approximateLocationLabel,
  travelRadiusLabel,
} from "@/lib/location/approximate-location";
import {
  buildDiscoveryMapMarkers,
  type DiscoveryMapItem,
} from "@/lib/location/map-markers";
import {
  groupVoicingParts,
  voicingPartOptions,
  voicingPartValue,
} from "@/lib/parts/voicings";
import { parseDiscoveryFilters } from "@/lib/search/discovery-filters";

type SingerFindRow = {
  availability: string | null;
  country_code: string | null;
  country_name: string | null;
  display_name: string;
  experience_level: string | null;
  goals: string[];
  id: string;
  locality: string | null;
  location_label_public: string | null;
  parts: string[];
  region: string | null;
  travel_radius_km: number | null;
};

type QuartetFindRow = {
  availability: string | null;
  country_code: string | null;
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
  region: string | null;
  travel_radius_km: number | null;
};

type FindPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type FindResult = DiscoveryMapItem & {
  availability: string | null;
  description: string | null;
  experienceLevel: string | null;
  goals: string[];
  partsCovered: string[];
  partsNeeded: string[];
  resultLabel: string;
  targetKind: "quartet" | "singer";
  travelRadiusKm: number | null;
};

const kindOptions = [
  ["quartets", "Quartet openings"],
  ["singers", "Singers"],
  ["both", "Both"],
];

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

const distanceUnitOptions = [
  ["mi", "Miles"],
  ["km", "Kilometers"],
];

const filterControlClass =
  "mt-2 w-full rounded-md border border-[#d7cec0] bg-white px-3 py-2 text-base text-[#172023] shadow-sm outline-none focus:border-[#2f6f73] focus:ring-2 focus:ring-[#2f6f73]/20";

function textValue(value: string | null | number) {
  return value == null ? "" : String(value);
}

function selectedKind(value: string | string[] | undefined) {
  const rawValue = Array.isArray(value) ? value[0] : value;

  return rawValue === "singers" || rawValue === "both" ? rawValue : "quartets";
}

function tags(values: string[]) {
  return values.map((value) => value.replaceAll("_", " ")).join(", ");
}

function preview(value: string | null) {
  if (!value) {
    return null;
  }

  return value.length > 180 ? `${value.slice(0, 177)}...` : value;
}

function partsLabel(values: string[]) {
  return groupVoicingParts(values) || "Not listed";
}

function locationLabel(item: FindResult) {
  return approximateLocationLabel({
    countryName: item.countryName,
    locality: item.locality,
    locationLabelPublic: item.locationLabelPublic,
    region: item.region,
  });
}

function selectedPartValues(filters: ReturnType<typeof parseDiscoveryFilters>) {
  return filters.parts.map((part) => voicingPartValue(part.voicing, part.part));
}

function resultMatchesSelectedParts(
  result: FindResult,
  selectedParts: string[],
) {
  if (selectedParts.length === 0) {
    return true;
  }

  const searchableParts =
    result.kind === "quartet"
      ? result.partsNeeded
      : [...result.parts, ...result.partsNeeded];

  return selectedParts.some((part) => searchableParts.includes(part));
}

function markerSummary(marker: { names: string[] }) {
  const previewNames = marker.names.slice(0, 3).join(", ");
  const remainingCount = marker.names.length - 3;

  return remainingCount > 0
    ? `${previewNames}, +${remainingCount} more`
    : previewNames;
}

function markerKindLabel(marker: { count: number; kinds: string[] }) {
  if (marker.kinds.includes("quartet") && marker.kinds.includes("singer")) {
    return "results";
  }

  if (marker.kinds[0] === "quartet") {
    return marker.count === 1 ? "quartet opening" : "quartet openings";
  }

  return marker.count === 1 ? "singer" : "singers";
}

function returnToPath(params: Record<string, string | string[] | undefined>) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    const values = Array.isArray(value) ? value : [value];

    for (const item of values) {
      if (item) {
        query.append(key, item);
      }
    }
  }

  const queryString = query.toString();

  return queryString ? `/find?${queryString}` : "/find";
}

function filterAnalyticsProperties(
  filters: ReturnType<typeof parseDiscoveryFilters>,
) {
  const flags = {
    has_goal_filter: Boolean(filters.goal),
    has_part_filter: filters.parts.length > 0,
    has_radius: filters.radius != null,
    has_search_origin: Boolean(filters.searchFrom),
  };
  const filterCount = Object.values(flags).filter(Boolean).length;

  return { filterCount, flags };
}

export default async function FindPage({ searchParams }: FindPageProps) {
  const params = await searchParams;
  const filters = parseDiscoveryFilters(params);
  const kind = selectedKind(params.kind);
  const selectedParts = selectedPartValues(filters);
  const returnTo = returnToPath(params);
  const supabase = await requireAuthenticatedDiscovery("/find", params);

  let results: FindResult[] = [];
  let errorMessage: string | null = null;

  if (kind === "both" || kind === "singers") {
    let query = supabase
      .from("singer_discovery_profiles")
      .select(
        "id, display_name, parts, goals, experience_level, availability, travel_radius_km, country_code, country_name, region, locality, location_label_public",
      )
      .order("updated_at", { ascending: false });

    if (filters.goal) {
      query = query.contains("goals", [filters.goal]);
    }

    const { data, error } = await query;

    if (error) {
      errorMessage = error.message;
    } else {
      results = [
        ...results,
        ...((data ?? []) as SingerFindRow[]).map((singer) => ({
          availability: singer.availability,
          countryCode: singer.country_code,
          countryName: singer.country_name,
          description: null,
          experienceLevel: singer.experience_level,
          goals: singer.goals,
          id: singer.id,
          kind: "singer" as const,
          locality: singer.locality,
          locationLabelPublic: singer.location_label_public,
          name: singer.display_name,
          parts: singer.parts,
          partsCovered: [],
          partsNeeded: [],
          region: singer.region,
          resultLabel: "Singer",
          targetKind: "singer" as const,
          travelRadiusKm: singer.travel_radius_km,
        })),
      ];
    }
  }

  if (!errorMessage && (kind === "both" || kind === "quartets")) {
    let query = supabase
      .from("quartet_discovery_listings")
      .select(
        "id, name, description, parts_covered, parts_needed, goals, experience_level, availability, travel_radius_km, country_code, country_name, region, locality, location_label_public",
      )
      .order("updated_at", { ascending: false });

    if (filters.goal) {
      query = query.contains("goals", [filters.goal]);
    }

    const { data, error } = await query;

    if (error) {
      errorMessage = error.message;
    } else {
      results = [
        ...results,
        ...((data ?? []) as QuartetFindRow[]).map((quartet) => ({
          availability: quartet.availability,
          countryCode: quartet.country_code,
          countryName: quartet.country_name,
          description: quartet.description,
          experienceLevel: quartet.experience_level,
          goals: quartet.goals,
          id: quartet.id,
          kind: "quartet" as const,
          locality: quartet.locality,
          locationLabelPublic: quartet.location_label_public,
          name: quartet.name,
          parts: quartet.parts_needed,
          partsCovered: quartet.parts_covered,
          partsNeeded: quartet.parts_needed,
          region: quartet.region,
          resultLabel: "Quartet opening",
          targetKind: "quartet" as const,
          travelRadiusKm: quartet.travel_radius_km,
        })),
      ];
    }
  }

  results = results.filter((result) =>
    resultMatchesSelectedParts(result, selectedParts),
  );

  const markers = buildDiscoveryMapMarkers(results);
  const { filterCount, flags } = filterAnalyticsProperties(filters);
  const radiusLabel =
    filters.radius == null
      ? "Any distance"
      : `${filters.radius} ${filters.distanceUnit === "km" ? "kilometers" : "miles"}`;

  await captureProductEvent("map_viewed", {
    ...flags,
    filter_count: filterCount,
    kind,
    route: "/find",
    result_count: results.length,
    route_area: "discovery",
  });

  return (
    <>
      <SignedInSiteHeader />
      <main className="mx-auto w-full max-w-7xl px-6 py-8">
        <header className="max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2f6f73]">
            Find
          </p>
          <h1 className="mt-3 text-3xl font-bold text-[#172023] sm:text-4xl">
            Search quartet openings and singers from one discovery map.
          </h1>
          <p className="mt-4 text-base leading-7 text-[#394548]">
            Start with a place, radius, parts, and intent. Results use
            approximate locations only, and contact stays inside Quartet Member
            Finder until both people choose to share direct details.
          </p>
        </header>

        <form
          aria-label="Filter discovery results"
          className="mt-6 rounded-lg border border-[#d7cec0] bg-[#fffaf2] p-4 shadow-sm"
        >
          <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr_0.7fr_0.9fr]">
            <label className="block">
              <span className="text-sm font-semibold">Looking for</span>
              <select
                className={filterControlClass}
                defaultValue={kind}
                name="kind"
              >
                {kindOptions.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-semibold">Search from</span>
              <input
                className={filterControlClass}
                defaultValue={textValue(filters.searchFrom)}
                name="searchFrom"
                placeholder="Fort Collins, CO or M5V, Canada"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold">Within</span>
              <input
                className={filterControlClass}
                defaultValue={textValue(filters.radius)}
                min={1}
                name="radius"
                placeholder="25"
                type="number"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold">Distance units</span>
              <select
                className={filterControlClass}
                defaultValue={filters.distanceUnit}
                name="distanceUnit"
              >
                {distanceUnitOptions.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1.5fr_1fr_auto]">
            <label className="block">
              <span className="text-sm font-semibold">Parts</span>
              <select
                className={`${filterControlClass} min-h-32`}
                defaultValue={selectedParts}
                multiple
                name="part"
              >
                {partOptions.slice(1).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <span className="mt-2 block text-xs leading-5 text-[#596466]">
                Select one or more voicing-aware parts. Leave blank for any
                part.
              </span>
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

            <div className="flex flex-col gap-3 lg:justify-end">
              <button
                className="rounded-md bg-[#174b4f] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#10393c]"
                type="submit"
              >
                Search
              </button>
              <a
                className="inline-flex min-h-11 items-center justify-center rounded-md px-3 py-2 text-sm font-semibold text-[#2f6f73] hover:bg-white/70"
                href="/find"
              >
                Clear filters
              </a>
            </div>
          </div>

          <p className="mt-4 rounded-md border border-[#d7cec0] bg-white/70 p-3 text-sm leading-6 text-[#394548]">
            Radius search is ready in the interface, but exact
            distance-from-place filtering is not enabled until approximate
            geocoding is added. The current result set still uses privacy-safe
            discovery data and approximate map regions.
          </p>
        </form>

        {errorMessage ? (
          <p
            className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
            role="alert"
          >
            {errorMessage}
          </p>
        ) : null}

        <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(22rem,0.9fr)_minmax(0,1.1fr)]">
          <section
            aria-labelledby="map-heading"
            className="overflow-hidden rounded-lg border border-[#d7cec0] bg-[#e7f0eb]"
          >
            <div className="border-b border-[#d7cec0] bg-white/85 px-4 py-3">
              <h2 className="font-bold text-[#172023]" id="map-heading">
                Approximate map scope
              </h2>
              <p className="mt-1 text-sm text-[#394548]">
                {results.length} results across {markers.length} approximate
                regions. Scope:{" "}
                {textValue(filters.searchFrom) || "all visible areas"}; radius:{" "}
                {radiusLabel}.
              </p>
            </div>
            <div
              aria-label="Privacy-safe discovery map"
              className="relative min-h-[460px] bg-[radial-gradient(circle_at_22%_38%,#c5d7c8_0_9%,transparent_10%),radial-gradient(circle_at_49%_38%,#c5d7c8_0_8%,transparent_9%),radial-gradient(circle_at_55%_55%,#c5d7c8_0_13%,transparent_14%),radial-gradient(circle_at_77%_63%,#c5d7c8_0_9%,transparent_10%),linear-gradient(135deg,#e7f0eb,#d9e8e1)]"
              role="img"
            >
              {markers.length === 0 ? (
                <div className="absolute inset-x-6 top-8 rounded-lg border border-[#d7cec0] bg-white/90 p-5 text-sm leading-6 text-[#394548] shadow-sm">
                  No approximate map regions match. Try increasing the radius,
                  clearing part filters, or changing what you are looking for.
                </div>
              ) : null}

              {markers.map((marker) => (
                <a
                  className="absolute max-w-[10rem] -translate-x-1/2 -translate-y-1/2 rounded-md border border-[#174b4f]/30 bg-white px-3 py-2 text-sm shadow-sm [overflow-wrap:anywhere] hover:border-[#174b4f] focus:outline-none focus:ring-2 focus:ring-[#174b4f]"
                  href={`#result-${marker.resultIds[0]}`}
                  key={marker.id}
                  style={{
                    left: `${marker.xPercent}%`,
                    top: `${marker.yPercent}%`,
                  }}
                >
                  <span className="block font-bold text-[#172023]">
                    {marker.label}
                  </span>
                  <span className="mt-1 block text-[#394548]">
                    {marker.count} {markerKindLabel(marker)}
                  </span>
                  {marker.parts.length > 0 ? (
                    <span className="mt-1 block text-[#596466]">
                      {partsLabel(marker.parts)}
                    </span>
                  ) : null}
                </a>
              ))}
            </div>
          </section>

          <section aria-labelledby="results-heading">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2
                  className="text-2xl font-bold text-[#172023]"
                  id="results-heading"
                >
                  Matching results
                </h2>
                <p className="mt-1 text-sm text-[#394548]">
                  Cards and detail panels show only privacy-safe discovery
                  fields.
                </p>
              </div>
            </div>

            {results.length === 0 && !errorMessage ? (
              <section className="mt-5 rounded-lg border border-[#d7cec0] bg-[#fffaf2] p-5 text-[#394548]">
                <h3 className="text-xl font-bold text-[#172023]">
                  No results match this search yet
                </h3>
                <p className="mt-3 text-sm leading-6">
                  Try increasing the radius, selecting fewer parts, clearing
                  goal filters, or searching both singers and quartet openings.
                  If no origin is entered, add a city/region/country or postal
                  code to make the search easier to interpret.
                </p>
              </section>
            ) : null}

            <div className="mt-5 grid gap-4">
              {results.map((result) => (
                <article
                  className="scroll-mt-8 rounded-lg border border-[#d7cec0] bg-[#fffaf2] p-5 shadow-sm"
                  id={`result-${result.id}`}
                  key={`${result.kind}-${result.id}`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#2f6f73]">
                        {result.resultLabel}
                      </p>
                      <h3 className="mt-2 text-2xl font-bold text-[#172023]">
                        {result.name}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-[#394548]">
                        {locationLabel(result)}
                      </p>
                    </div>
                    <a
                      className="inline-flex min-h-11 items-center justify-center rounded-md border border-[#d7cec0] bg-white px-3 py-2 text-sm font-semibold text-[#174b4f] hover:border-[#174b4f]"
                      href={`#details-${result.id}`}
                    >
                      More details
                    </a>
                  </div>

                  <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="font-semibold text-[#172023]">
                        {result.kind === "quartet"
                          ? "Parts needed"
                          : "Parts sung"}
                      </dt>
                      <dd className="mt-1 text-[#394548]">
                        {partsLabel(
                          result.kind === "quartet"
                            ? result.partsNeeded
                            : result.parts,
                        )}
                      </dd>
                    </div>
                    {result.kind === "quartet" ? (
                      <div>
                        <dt className="font-semibold text-[#172023]">
                          Parts covered
                        </dt>
                        <dd className="mt-1 text-[#394548]">
                          {partsLabel(result.partsCovered)}
                        </dd>
                      </div>
                    ) : null}
                    <div>
                      <dt className="font-semibold text-[#172023]">Goals</dt>
                      <dd className="mt-1 text-[#394548]">
                        {result.goals.length > 0
                          ? tags(result.goals)
                          : "Not listed"}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-[#172023]">Travel</dt>
                      <dd className="mt-1 text-[#394548]">
                        {travelRadiusLabel(
                          result.travelRadiusKm,
                          filters.distanceUnit,
                        ) ?? "Not listed"}
                      </dd>
                    </div>
                  </dl>

                  {preview(result.description) ? (
                    <p className="mt-4 text-sm leading-6 text-[#394548]">
                      {preview(result.description)}
                    </p>
                  ) : null}

                  <details
                    className="mt-4 rounded-md border border-[#d7cec0] bg-white p-4"
                    id={`details-${result.id}`}
                  >
                    <summary className="cursor-pointer text-base font-bold text-[#172023]">
                      {result.name} details and contact
                    </summary>
                    <div className="mt-4 grid gap-3 text-sm leading-6 text-[#394548]">
                      <p>
                        <span className="font-semibold text-[#172023]">
                          Approximate area:
                        </span>{" "}
                        {locationLabel(result)}
                      </p>
                      <p>
                        <span className="font-semibold text-[#172023]">
                          Experience/commitment:
                        </span>{" "}
                        {result.experienceLevel ?? "Not listed"}
                      </p>
                      <p>
                        <span className="font-semibold text-[#172023]">
                          Availability:
                        </span>{" "}
                        {result.availability ?? "Not listed"}
                      </p>
                      {result.description ? <p>{result.description}</p> : null}
                    </div>
                    <ContactRequestForm
                      returnTo={returnTo}
                      targetId={result.id}
                      targetKind={result.targetKind}
                      targetName={result.name}
                    />
                  </details>
                </article>
              ))}
            </div>
          </section>
        </section>

        {markers.length > 0 ? (
          <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {markers.map((marker) => (
              <article
                className="rounded-lg border border-[#d7cec0] bg-white/60 p-5 shadow-sm"
                key={marker.id}
              >
                <h2 className="text-lg font-bold text-[#172023]">
                  {marker.label}
                </h2>
                <p className="mt-2 text-sm text-[#394548]">
                  {marker.count} visible result{marker.count === 1 ? "" : "s"}:
                  {" " + markerSummary(marker)}
                </p>
              </article>
            ))}
          </section>
        ) : null}
      </main>
    </>
  );
}

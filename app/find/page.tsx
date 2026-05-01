import { ContactRequestForm } from "@/components/contact/contact-request-form";
import { InteractiveDiscoveryMap } from "@/components/discovery/interactive-discovery-map";
import { SignedInSiteHeader } from "@/components/navigation/signed-in-site-header";
import { captureProductEvent } from "@/lib/analytics/product-analytics";
import { requireAuthenticatedDiscovery } from "@/lib/auth/require-authenticated-discovery";
import {
  approximateLocationLabel,
  formatApproximateDistance,
  milesToKilometers,
  travelRadiusLabel,
  type Coordinates,
} from "@/lib/location/approximate-location";
import {
  geocodeApproximateLocation,
  type ApproximateGeocodingStatus,
} from "@/lib/location/geocoding";
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
  distance_km?: number | null;
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
  distance_km?: number | null;
};

type FindPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type ProfileOriginRow = {
  country_name: string | null;
  latitude_private: number | string | null;
  locality: string | null;
  location_label_public: string | null;
  longitude_private: number | string | null;
  region: string | null;
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
  distanceKm: number | null;
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

function distanceLabel(
  item: FindResult,
  filters: ReturnType<typeof parseDiscoveryFilters>,
) {
  return formatApproximateDistance(item.distanceKm, filters.distanceUnit);
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
    has_location_filter: Boolean(filters.searchFrom),
    has_part_filter: filters.parts.length > 0,
    has_radius_filter: filters.radius != null,
    has_search_origin: Boolean(filters.searchFrom),
  };
  const filterCount = Object.values(flags).filter(Boolean).length;

  return { filterCount, flags };
}

function radiusToKilometers(
  radius: number | null,
  unit: ReturnType<typeof parseDiscoveryFilters>["distanceUnit"],
) {
  if (radius == null) {
    return null;
  }

  return unit === "mi" ? milesToKilometers(radius) : radius;
}

function geocodingStatusMessage(status: ApproximateGeocodingStatus) {
  if (status === "not_configured") {
    return "Radius search needs server-side Mapbox geocoding configuration before a search origin can be resolved.";
  }

  if (status === "not_found") {
    return "That search origin could not be resolved. Try a city plus region/country or a postal code plus country.";
  }

  return "The search origin could not be resolved right now. Try again in a moment or clear the location search.";
}

function coordinatesFromPrivateRow(
  row: ProfileOriginRow | null,
): Coordinates | null {
  if (!row?.latitude_private || !row.longitude_private) {
    return null;
  }

  const latitude = Number(row.latitude_private);
  const longitude = Number(row.longitude_private);

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }

  return { latitude, longitude };
}

function labelForProfileOrigin(row: ProfileOriginRow | null) {
  if (!row) {
    return "your singer profile";
  }

  return approximateLocationLabel({
    countryName: row.country_name,
    locality: row.locality,
    locationLabelPublic: row.location_label_public,
    region: row.region,
  });
}

export default async function FindPage({ searchParams }: FindPageProps) {
  const params = await searchParams;
  const filters = parseDiscoveryFilters(params);
  const kind = selectedKind(params.kind);
  const selectedParts = selectedPartValues(filters);
  const returnTo = returnToPath(params);
  const supabase = await requireAuthenticatedDiscovery("/find", params);
  const radiusKm = radiusToKilometers(filters.radius, filters.distanceUnit);
  let radiusSearchOrigin: Coordinates | null = null;
  let radiusSearchOriginLabel = textValue(filters.searchFrom);
  let profileOrigin: ProfileOriginRow | null = null;
  let geocodingResult: Awaited<
    ReturnType<typeof geocodeApproximateLocation>
  > | null = null;

  if (filters.searchOrigin === "profile") {
    const { data } = await supabase
      .from("singer_profiles")
      .select(
        "latitude_private, longitude_private, country_name, region, locality, location_label_public",
      )
      .maybeSingle();

    profileOrigin = (data ?? null) as ProfileOriginRow | null;
    radiusSearchOrigin = coordinatesFromPrivateRow(profileOrigin);
    radiusSearchOriginLabel = labelForProfileOrigin(profileOrigin);
  } else if (filters.searchFrom && radiusKm) {
    geocodingResult = await geocodeApproximateLocation(
      {
        locality: filters.searchFrom,
      },
      { storageMode: "temporary" },
    );
    radiusSearchOrigin = geocodingResult.coordinates;
  }

  let results: FindResult[] = [];
  let errorMessage: string | null = null;
  let searchNotice: string | null = null;

  if (filters.searchOrigin === "profile" && !radiusSearchOrigin) {
    searchNotice =
      "Your singer profile does not have a saved approximate location yet. Save My Singer Profile with country, region, city, and ZIP/postal code, or switch to a typed search origin.";
  } else if (filters.searchOrigin === "profile" && filters.radius == null) {
    searchNotice =
      "Add a radius to search by distance from your singer profile location. Without a radius, results show all visible areas that match the other filters.";
  } else if (filters.searchFrom && filters.radius == null) {
    searchNotice =
      "Add a radius to search by distance from the entered place. Without a radius, results show all visible areas that match the other filters.";
  } else if (
    filters.radius != null &&
    filters.searchOrigin === "typed" &&
    !filters.searchFrom
  ) {
    searchNotice =
      "Add a search origin to use radius filtering. Without a search origin, results show all visible areas that match the other filters.";
  } else if (
    filters.searchOrigin === "typed" &&
    filters.searchFrom &&
    radiusKm &&
    geocodingResult?.status !== "resolved"
  ) {
    searchNotice = geocodingStatusMessage(geocodingResult?.status ?? "failed");
  }

  if (kind === "both" || kind === "singers") {
    const { data, error } =
      radiusSearchOrigin && radiusKm
        ? await supabase.rpc("search_singer_discovery_profiles", {
            goal_filter: filters.goal,
            radius_km: radiusKm,
            search_latitude: radiusSearchOrigin.latitude,
            search_longitude: radiusSearchOrigin.longitude,
          })
        : await (() => {
            let query = supabase
              .from("singer_discovery_profiles")
              .select(
                "id, display_name, parts, goals, experience_level, availability, travel_radius_km, country_code, country_name, region, locality, location_label_public",
              )
              .order("updated_at", { ascending: false });

            if (filters.goal) {
              query = query.contains("goals", [filters.goal]);
            }

            return query;
          })();

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
          distanceKm: singer.distance_km ?? null,
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
    const { data, error } =
      radiusSearchOrigin && radiusKm
        ? await supabase.rpc("search_quartet_discovery_listings", {
            goal_filter: filters.goal,
            radius_km: radiusKm,
            search_latitude: radiusSearchOrigin.latitude,
            search_longitude: radiusSearchOrigin.longitude,
          })
        : await (() => {
            let query = supabase
              .from("quartet_discovery_listings")
              .select(
                "id, name, description, parts_covered, parts_needed, goals, experience_level, availability, travel_radius_km, country_code, country_name, region, locality, location_label_public",
              )
              .order("updated_at", { ascending: false });

            if (filters.goal) {
              query = query.contains("goals", [filters.goal]);
            }

            return query;
          })();

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
          distanceKm: quartet.distance_km ?? null,
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
  const searchScopeLabel = `${radiusSearchOriginLabel || "all visible areas"}; radius: ${radiusLabel}${
    radiusSearchOrigin ? "; sorted by approximate distance" : ""
  }`;

  const discoveryAnalyticsProperties = {
    ...flags,
    distance_unit: filters.distanceUnit,
    filter_count: filterCount,
    kind,
    route: "/find",
    result_count: results.length,
    route_area: "discovery",
    search_origin: filters.searchOrigin,
  };

  await captureProductEvent("find_searched", discoveryAnalyticsProperties);
  await captureProductEvent("map_viewed", discoveryAnalyticsProperties);

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
          <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1.4fr_0.7fr_0.9fr]">
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
              <span className="text-sm font-semibold">Search origin</span>
              <select
                className={filterControlClass}
                defaultValue={filters.searchOrigin}
                name="searchOrigin"
              >
                <option value="typed">Typed place</option>
                <option value="profile">My Singer Profile</option>
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
              <span className="mt-2 block text-xs leading-5 text-[#596466]">
                Used when Search origin is Typed place.
              </span>
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

          {searchNotice ? (
            <p className="mt-4 rounded-md border border-[#d7cec0] bg-white/70 p-3 text-sm leading-6 text-[#394548]">
              {searchNotice}
            </p>
          ) : null}
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
          <InteractiveDiscoveryMap
            emptyMessage="No approximate map regions match. Try increasing the radius, clearing part filters, or changing what you are looking for."
            markers={markers}
            resultLabel="Interactive map scope"
            scopeLabel={searchScopeLabel}
            totalResults={results.length}
          />

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
                  code, or use your saved singer profile location.
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
                        {distanceLabel(result, filters)
                          ? `; ${distanceLabel(result, filters)}`
                          : ""}
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
                        {distanceLabel(result, filters)
                          ? `; ${distanceLabel(result, filters)}`
                          : ""}
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

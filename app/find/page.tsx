import { ContactRequestForm } from "@/components/contact/contact-request-form";
import { SignedInSiteHeader } from "@/components/navigation/signed-in-site-header";
import { InteractiveDiscoveryMap } from "@/components/discovery/interactive-discovery-map";
import { captureProductEvent } from "@/lib/analytics/product-analytics";
import { requireAuthenticatedDiscovery } from "@/lib/auth/require-authenticated-discovery";
import {
  approximateLocationLabel,
  formatApproximateDistance,
  milesToKilometers,
  type Coordinates,
  travelRadiusLabel,
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
import {
  profileOriginState,
  profileOriginUnavailableMessage,
  profileOriginUnavailableMessageFor,
  type ProfileOriginState,
  type ProfileOriginRow,
} from "@/lib/search/profile-origin";

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

type DiscoverabilityOriginRow = ProfileOriginRow & {
  is_visible: boolean | null;
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

const searchFromSourceOptions = [
  ["singer_profile", "My Singer Profile location"],
  ["quartet_profile", "My Quartet Profile location"],
  ["another", "Another location"],
] as const;

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

function resultMatchesSelectedGoals(result: FindResult, goals: string[]) {
  if (goals.length === 0) {
    return true;
  }

  return goals.some((goal) => result.goals.includes(goal));
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

function findPathWithView(
  params: Record<string, string | string[] | undefined>,
  view: ReturnType<typeof parseDiscoveryFilters>["view"],
) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (key === "view") {
      continue;
    }

    const values = Array.isArray(value) ? value : [value];

    for (const item of values) {
      if (item) {
        query.append(key, item);
      }
    }
  }

  if (view === "map") {
    query.set("view", "map");
  }

  const queryString = query.toString();

  return queryString ? `/find?${queryString}` : "/find";
}

function filterAnalyticsProperties(
  filters: ReturnType<typeof parseDiscoveryFilters>,
) {
  const flags = {
    has_goal_filter: filters.goals.length > 0,
    has_location_filter:
      filters.searchFromSource !== "another" || Boolean(filters.searchFrom),
    has_part_filter: filters.parts.length > 0,
    has_radius_filter: filters.radius != null,
    has_search_origin:
      filters.searchFromSource !== "another" || Boolean(filters.searchFrom),
  };
  const filterCount = Object.values(flags).filter(Boolean).length;

  return { filterCount, flags };
}

function sourceLabel(
  source: ReturnType<typeof parseDiscoveryFilters>["searchFromSource"],
) {
  if (source === "singer_profile") {
    return "your Singer Profile location";
  }

  if (source === "quartet_profile") {
    return "your Quartet Profile location";
  }

  return "the entered location";
}

function unavailableProfileStatusLine({
  label,
  state,
}: {
  label: string;
  state: ProfileOriginState;
}) {
  if (state.status === "usable") {
    return null;
  }

  return `${label} does not have enough location information for distance search.`;
}

function discoverabilityLabel({
  isVisible,
  state,
}: {
  isVisible: boolean | null | undefined;
  state: ProfileOriginState;
}) {
  if (!isVisible) {
    return "Not shown in Find";
  }

  if (state.status !== "usable") {
    return "Shown in Find, but missing location for distance search";
  }

  return "Shown in Find";
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
    return "Radius search needs server-side Mapbox geocoding configuration before that location can be resolved.";
  }

  if (status === "not_found") {
    return "That location could not be resolved. Try a city plus region/country or a postal code plus country.";
  }

  return "That location could not be resolved right now. Try again in a moment or clear the location search.";
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
  let geocodingResult: Awaited<
    ReturnType<typeof geocodeApproximateLocation>
  > | null = null;
  const { data: singerOriginData } = await supabase
    .from("singer_profiles")
    .select(
      "is_visible, latitude_private, longitude_private, country_name, region, locality, postal_code_private, location_label_public",
    )
    .maybeSingle<DiscoverabilityOriginRow>();
  const { data: quartetOriginData } = await supabase
    .from("quartet_listings")
    .select(
      "is_visible, latitude_private, longitude_private, country_name, region, locality, postal_code_private, location_label_public",
    )
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle<DiscoverabilityOriginRow>();
  const singerOrigin = singerOriginData ?? null;
  const quartetOrigin = quartetOriginData ?? null;
  const singerSearchOrigin = profileOriginState(singerOrigin);
  const quartetSearchOrigin = profileOriginState(quartetOrigin);
  const selectedProfileOrigin =
    filters.searchFromSource === "quartet_profile"
      ? quartetSearchOrigin
      : singerSearchOrigin;

  if (filters.searchFromSource === "singer_profile") {
    radiusSearchOrigin = singerSearchOrigin.coordinates;
    radiusSearchOriginLabel = singerSearchOrigin.label;
  } else if (filters.searchFromSource === "quartet_profile") {
    radiusSearchOrigin = quartetSearchOrigin.coordinates;
    radiusSearchOriginLabel = quartetSearchOrigin.label;
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

  if (
    filters.searchFromSource !== "another" &&
    selectedProfileOrigin.status !== "usable"
  ) {
    searchNotice =
      filters.searchFromSource === "quartet_profile"
        ? profileOriginUnavailableMessageFor(
            selectedProfileOrigin.status,
            "My Quartet Profile",
          )
        : profileOriginUnavailableMessage(selectedProfileOrigin.status);
  } else if (filters.searchFromSource !== "another" && filters.radius == null) {
    searchNotice = `Add a radius to search by distance from ${sourceLabel(
      filters.searchFromSource,
    )}. Without a radius, results show all visible areas that match the other filters.`;
  } else if (filters.searchFrom && filters.radius == null) {
    searchNotice =
      "Add a radius to search by distance from another location. Without a radius, results show all visible areas that match the other filters.";
  } else if (
    filters.radius != null &&
    filters.searchFromSource === "another" &&
    !filters.searchFrom
  ) {
    searchNotice =
      "Add another location to use radius filtering. Without a location, results show all visible areas that match the other filters.";
  } else if (
    filters.searchFromSource === "another" &&
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
            goal_filter: null,
            radius_km: radiusKm,
            search_latitude: radiusSearchOrigin.latitude,
            search_longitude: radiusSearchOrigin.longitude,
          })
        : await (() => {
            const query = supabase
              .from("singer_discovery_profiles")
              .select(
                "id, display_name, parts, goals, experience_level, availability, travel_radius_km, country_code, country_name, region, locality, location_label_public",
              )
              .order("updated_at", { ascending: false });

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
            goal_filter: null,
            radius_km: radiusKm,
            search_latitude: radiusSearchOrigin.latitude,
            search_longitude: radiusSearchOrigin.longitude,
          })
        : await (() => {
            const query = supabase
              .from("quartet_discovery_listings")
              .select(
                "id, name, description, parts_covered, parts_needed, goals, experience_level, availability, travel_radius_km, country_code, country_name, region, locality, location_label_public",
              )
              .order("updated_at", { ascending: false });

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

  results = results.filter(
    (result) =>
      resultMatchesSelectedParts(result, selectedParts) &&
      resultMatchesSelectedGoals(result, filters.goals),
  );

  const markers = buildDiscoveryMapMarkers(results);
  const showMap = filters.view === "map";
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
    search_origin: filters.searchFromSource,
  };

  await captureProductEvent("find_searched", discoveryAnalyticsProperties);

  if (showMap) {
    await captureProductEvent("map_viewed", discoveryAnalyticsProperties);
  }

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

        <section className="mt-6 max-w-4xl rounded-lg border border-[#d7cec0] bg-[#fffaf2] p-4 text-sm text-[#394548]">
          <h2 className="text-base font-bold text-[#172023]">
            Your discoverability
          </h2>
          <dl className="mt-3 grid gap-2 sm:grid-cols-2">
            <div>
              <dt className="font-semibold text-[#172023]">Singer Profile</dt>
              <dd>
                {discoverabilityLabel({
                  isVisible: singerOrigin?.is_visible,
                  state: singerSearchOrigin,
                })}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-[#172023]">Quartet Profile</dt>
              <dd>
                {discoverabilityLabel({
                  isVisible: quartetOrigin?.is_visible,
                  state: quartetSearchOrigin,
                })}
              </dd>
            </div>
          </dl>
          <p className="mt-3 leading-6">
            {singerOrigin?.is_visible || quartetOrigin?.is_visible
              ? "You can search either way. These settings only control whether other people can find your profiles."
              : "You can still search, but other users will not discover your Singer Profile or Quartet Profile until you turn visibility on."}
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <a className="font-semibold text-[#2f6f73]" href="/app/profile">
              Edit My Singer Profile
            </a>
            <a className="font-semibold text-[#2f6f73]" href="/app/listings">
              Edit My Quartet Profile
            </a>
          </div>
        </section>

        <form
          aria-label="Filter discovery results"
          className="mt-6 rounded-lg border border-[#d7cec0] bg-[#fffaf2] p-4 shadow-sm"
        >
          <div className="grid gap-4 lg:grid-cols-[1fr_1.6fr_1.1fr_auto]">
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

            <div className="block">
              <label>
                <span className="text-sm font-semibold">Search From</span>
                <select
                  className={filterControlClass}
                  defaultValue={filters.searchFromSource}
                  name="searchFromSource"
                >
                  {searchFromSourceOptions.map(([value, label]) => {
                    const sourceState =
                      value === "quartet_profile"
                        ? quartetSearchOrigin
                        : singerSearchOrigin;
                    const unavailable =
                      value !== "another" && sourceState.status !== "usable";

                    return (
                      <option disabled={unavailable} key={value} value={value}>
                        {unavailable ? `${label} - add location first` : label}
                      </option>
                    );
                  })}
                </select>
              </label>
              {filters.searchFromSource === "another" ? (
                <label className="mt-3 block">
                  <span className="text-sm font-semibold">
                    Another location
                  </span>
                  <input
                    className={filterControlClass}
                    defaultValue={textValue(filters.searchFrom)}
                    name="searchFrom"
                    placeholder="Fort Collins, CO; Toronto, ON; M5V, Canada"
                  />
                  <span className="mt-2 block text-xs leading-5 text-[#596466]">
                    City, region, country, or postal code. No street address.
                  </span>
                </label>
              ) : null}
              <div className="mt-2 space-y-2 text-xs leading-5 text-[#596466]">
                {unavailableProfileStatusLine({
                  label: "Your Singer Profile",
                  state: singerSearchOrigin,
                }) ? (
                  <p>
                    {unavailableProfileStatusLine({
                      label: "Your Singer Profile",
                      state: singerSearchOrigin,
                    })}{" "}
                    <a
                      className="font-semibold text-[#2f6f73]"
                      href="/app/profile"
                    >
                      Edit My Singer Profile
                    </a>
                  </p>
                ) : null}
                {unavailableProfileStatusLine({
                  label: "Your Quartet Profile",
                  state: quartetSearchOrigin,
                }) ? (
                  <p>
                    {unavailableProfileStatusLine({
                      label: "Your Quartet Profile",
                      state: quartetSearchOrigin,
                    })}{" "}
                    <a
                      className="font-semibold text-[#2f6f73]"
                      href="/app/listings"
                    >
                      Edit My Quartet Profile
                    </a>
                  </p>
                ) : null}
              </div>
            </div>

            <fieldset>
              <legend className="text-sm font-semibold">Within</legend>
              <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                <input
                  className="w-full rounded-md border border-[#d7cec0] bg-white px-3 py-2 text-base text-[#172023] shadow-sm outline-none focus:border-[#2f6f73] focus:ring-2 focus:ring-[#2f6f73]/20"
                  defaultValue={textValue(filters.radius)}
                  min={1}
                  name="radius"
                  placeholder="100"
                  type="number"
                />
                <select
                  className="rounded-md border border-[#d7cec0] bg-white px-3 py-2 text-base text-[#172023] shadow-sm outline-none focus:border-[#2f6f73] focus:ring-2 focus:ring-[#2f6f73]/20"
                  defaultValue={filters.distanceUnit}
                  name="distanceUnit"
                >
                  {distanceUnitOptions.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </fieldset>

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

          <input name="view" type="hidden" value={filters.view} />

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold">Voice Part(s)</span>
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
                Choose one or more parts you sing or need. Leave blank for any
                voice part.
              </span>
            </label>

            <label className="block">
              <span className="text-sm font-semibold">Goal(s)</span>
              <select
                className={`${filterControlClass} min-h-32`}
                defaultValue={filters.goals}
                multiple
                name="goal"
              >
                {goalOptions.slice(1).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <span className="mt-2 block text-xs leading-5 text-[#596466]">
                Choose one or more goals. Leave blank for any goal.
              </span>
            </label>
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

        <section className="mt-6" aria-labelledby="results-heading">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2
                className="text-2xl font-bold text-[#172023]"
                id="results-heading"
              >
                Matching results
              </h2>
              <p className="mt-1 text-sm text-[#394548]">
                Cards and detail panels show only privacy-safe discovery fields.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                aria-current={showMap ? undefined : "page"}
                className={`inline-flex min-h-11 items-center justify-center rounded-md px-4 py-2 text-sm font-semibold ${
                  showMap
                    ? "border border-[#d7cec0] bg-white text-[#174b4f] hover:border-[#174b4f]"
                    : "bg-[#174b4f] text-white"
                }`}
                href={findPathWithView(params, "list")}
              >
                List
              </a>
              <a
                aria-current={showMap ? "page" : undefined}
                className={`inline-flex min-h-11 items-center justify-center rounded-md px-4 py-2 text-sm font-semibold ${
                  showMap
                    ? "bg-[#174b4f] text-white"
                    : "border border-[#d7cec0] bg-white text-[#174b4f] hover:border-[#174b4f]"
                }`}
                href={findPathWithView(params, "map")}
              >
                Map
              </a>
            </div>
          </div>

          {showMap ? (
            <div className="mt-5">
              <InteractiveDiscoveryMap
                emptyMessage="No approximate map regions match. Try increasing the radius, clearing part filters, or changing what you are looking for."
                markers={markers}
                resultLabel="Interactive map scope"
                scopeLabel={searchScopeLabel}
                totalResults={results.length}
              />
            </div>
          ) : null}

          <div className="mt-6">
            {results.length === 0 && !errorMessage ? (
              <section className="mt-5 rounded-lg border border-[#d7cec0] bg-[#fffaf2] p-5 text-[#394548]">
                <h3 className="text-xl font-bold text-[#172023]">
                  No results match this search yet
                </h3>
                <p className="mt-3 text-sm leading-6">
                  Try increasing the radius, selecting fewer parts, clearing
                  goal filters, or searching both singers and quartet openings.
                  If no location is entered, add a city/region/country or postal
                  code, or use a saved profile location.
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
          </div>
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

import Link from "next/link";
import { DiscoveryModeNav } from "@/components/discovery/discovery-mode-nav";
import { SignedInSiteHeader } from "@/components/navigation/signed-in-site-header";
import { captureProductEvent } from "@/lib/analytics/product-analytics";
import { requireAuthenticatedDiscovery } from "@/lib/auth/require-authenticated-discovery";
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

type SingerMapRow = {
  country_code: string | null;
  country_name: string | null;
  display_name: string;
  goals: string[];
  id: string;
  locality: string | null;
  location_label_public: string | null;
  parts: string[];
  region: string | null;
};

type QuartetMapRow = {
  country_code: string | null;
  country_name: string | null;
  goals: string[];
  id: string;
  locality: string | null;
  location_label_public: string | null;
  name: string;
  parts_needed: string[];
  region: string | null;
};

type MapPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const kindOptions = [
  ["both", "Singers and quartet openings"],
  ["singers", "Singers"],
  ["quartets", "Quartet openings"],
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

const filterControlClass =
  "mt-2 w-full rounded-md border border-[#d7cec0] bg-white px-3 py-2 text-base text-[#172023] shadow-sm outline-none focus:border-[#2f6f73] focus:ring-2 focus:ring-[#2f6f73]/20";

function textValue(value: string | null) {
  return value ?? "";
}

function selectedKind(value: string | string[] | undefined) {
  const rawValue = Array.isArray(value) ? value[0] : value;

  return rawValue === "singers" || rawValue === "quartets" ? rawValue : "both";
}

function filterAnalyticsProperties(
  filters: ReturnType<typeof parseDiscoveryFilters>,
) {
  const flags = {
    has_country_filter: Boolean(filters.country),
    has_goal_filter: Boolean(filters.goal),
    has_locality_filter: Boolean(filters.locality),
    has_part_filter: Boolean(filters.part),
    has_region_filter: Boolean(filters.region),
  };
  const filterCount = Object.values(flags).filter(Boolean).length;

  return { filterCount, flags };
}

function partsLabel(values: string[]) {
  return groupVoicingParts(values) || "No parts listed";
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
    return "listings";
  }

  if (marker.kinds[0] === "quartet") {
    return marker.count === 1 ? "quartet listing" : "quartet listings";
  }

  return marker.count === 1 ? "singer profile" : "singer profiles";
}

export default async function DiscoveryMapPage({ searchParams }: MapPageProps) {
  const params = await searchParams;
  const filters = parseDiscoveryFilters(params);
  const kind = selectedKind(params.kind);
  const supabase = await requireAuthenticatedDiscovery("/map", params);

  let mapItems: DiscoveryMapItem[] = [];
  let errorMessage: string | null = null;

  if (kind === "both" || kind === "singers") {
    let query = supabase
      .from("singer_discovery_profiles")
      .select(
        "id, display_name, parts, goals, country_code, country_name, region, locality, location_label_public",
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

    if (filters.goal) {
      query = query.contains("goals", [filters.goal]);
    }

    const { data, error } = await query;

    if (error) {
      errorMessage = error.message;
    } else {
      mapItems = [
        ...mapItems,
        ...((data ?? []) as SingerMapRow[]).map((singer) => ({
          countryCode: singer.country_code,
          countryName: singer.country_name,
          id: singer.id,
          kind: "singer" as const,
          locality: singer.locality,
          locationLabelPublic: singer.location_label_public,
          name: singer.display_name,
          parts: singer.parts,
          region: singer.region,
        })),
      ];
    }
  }

  if (!errorMessage && (kind === "both" || kind === "quartets")) {
    let query = supabase
      .from("quartet_discovery_listings")
      .select(
        "id, name, parts_needed, goals, country_code, country_name, region, locality, location_label_public",
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
      query = query.contains("parts_needed", [
        voicingPartValue(filters.part.voicing, filters.part.part),
      ]);
    }

    if (filters.goal) {
      query = query.contains("goals", [filters.goal]);
    }

    const { data, error } = await query;

    if (error) {
      errorMessage = error.message;
    } else {
      mapItems = [
        ...mapItems,
        ...((data ?? []) as QuartetMapRow[]).map((quartet) => ({
          countryCode: quartet.country_code,
          countryName: quartet.country_name,
          id: quartet.id,
          kind: "quartet" as const,
          locality: quartet.locality,
          locationLabelPublic: quartet.location_label_public,
          name: quartet.name,
          parts: quartet.parts_needed,
          region: quartet.region,
        })),
      ];
    }
  }

  const markers = buildDiscoveryMapMarkers(mapItems);
  const { filterCount, flags } = filterAnalyticsProperties(filters);

  await captureProductEvent("map_viewed", {
    ...flags,
    filter_count: filterCount,
    kind,
    route: "/map",
    result_count: mapItems.length,
    route_area: "map",
  });

  return (
    <>
      <SignedInSiteHeader />
      <main className="mx-auto w-full max-w-6xl px-6 py-12">
        <div>
          <h1 className="mt-4 text-3xl font-bold text-[#172023]">
            Find map view
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[#394548]">
            This compatibility map view is also available inside the main Find
            page with a results table below it.
          </p>
        </div>

        <DiscoveryModeNav activeMode="map" />

        <form
          aria-label="Filter discovery map"
          className="mt-8 grid gap-4 rounded-lg border border-[#d7cec0] bg-[#fffaf2] p-4 sm:grid-cols-2 lg:grid-cols-5"
        >
          <label className="block">
            <span className="text-sm font-semibold">Show</span>
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
            <span className="text-sm font-semibold">Country</span>
            <input
              className={filterControlClass}
              defaultValue={textValue(filters.country)}
              name="country"
              placeholder="Australia"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold">Region</span>
            <input
              className={filterControlClass}
              defaultValue={textValue(filters.region)}
              name="region"
              placeholder="Victoria"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold">Locality</span>
            <input
              className={filterControlClass}
              defaultValue={textValue(filters.locality)}
              name="locality"
              placeholder="Melbourne"
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
          <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-end lg:col-span-5">
            <button
              className="rounded-md bg-[#174b4f] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#10393c]"
              type="submit"
            >
              Search
            </button>
            <Link
              className="inline-flex min-h-11 items-center rounded-md px-2 py-2 font-semibold text-[#2f6f73] hover:bg-white/70"
              href="/map"
            >
              Clear
            </Link>
          </div>
        </form>

        {errorMessage ? (
          <p
            className="mt-8 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
            role="alert"
          >
            {errorMessage}
          </p>
        ) : null}

        <section className="mt-8 overflow-hidden rounded-lg border border-[#d7cec0] bg-[#e7f0eb]">
          <div
            aria-label="Privacy-safe discovery map"
            className="relative min-h-[520px] bg-[radial-gradient(circle_at_22%_38%,#c5d7c8_0_9%,transparent_10%),radial-gradient(circle_at_49%_38%,#c5d7c8_0_8%,transparent_9%),radial-gradient(circle_at_55%_55%,#c5d7c8_0_13%,transparent_14%),radial-gradient(circle_at_77%_63%,#c5d7c8_0_9%,transparent_10%),linear-gradient(135deg,#e7f0eb,#d9e8e1)] sm:min-h-[420px]"
            role="img"
          >
            <div className="absolute inset-x-0 top-0 flex flex-col gap-1 bg-white/85 px-4 py-3 text-sm text-[#394548] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
              <span>{markers.length} approximate regions</span>
              <span>
                {mapItems.length} visible listings with public location
              </span>
            </div>

            {markers.map((marker) => (
              <div
                className="absolute max-w-[10rem] -translate-x-1/2 -translate-y-1/2 rounded-md border border-[#174b4f]/30 bg-white px-3 py-2 text-sm shadow-sm [overflow-wrap:anywhere] sm:max-w-48"
                key={marker.id}
                style={{
                  left: `${marker.xPercent}%`,
                  top: `${marker.yPercent}%`,
                }}
              >
                <p className="font-bold text-[#172023]">{marker.label}</p>
                <p className="mt-1 text-[#394548]">
                  {marker.count} {markerKindLabel(marker)}
                </p>
                {marker.parts.length > 0 ? (
                  <p className="mt-1 text-[#596466]">
                    {partsLabel(marker.parts)}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          {markers.length === 0 && !errorMessage ? (
            <section className="rounded-lg border border-[#d7cec0] bg-[#fffaf2] p-5 text-[#394548] md:col-span-2">
              <h2 className="text-xl font-bold text-[#172023]">
                No approximate map regions match these filters yet
              </h2>
              <p className="mt-3 text-sm leading-6">
                The map only shows visible singer profiles and quartet openings
                with approximate public location data. Try clearing filters or
                using the main Find page or the detailed singer and quartet
                search pages.
              </p>
              <div className="mt-4 flex flex-wrap gap-4">
                <Link className="font-semibold text-[#2f6f73]" href="/map">
                  Clear filters
                </Link>
                <Link className="font-semibold text-[#2f6f73]" href="/find">
                  Open Find
                </Link>
                <Link className="font-semibold text-[#2f6f73]" href="/quartets">
                  Find quartet openings
                </Link>
              </div>
            </section>
          ) : null}

          {markers.map((marker) => (
            <article
              className="rounded-lg border border-[#d7cec0] bg-[#fffaf2] p-5 shadow-sm"
              key={marker.id}
            >
              <h2 className="text-xl font-bold text-[#172023]">
                {marker.label}
              </h2>
              <p className="mt-2 text-sm text-[#394548]">
                {marker.count} visible result{marker.count === 1 ? "" : "s"}:
                {" " + markerSummary(marker)}
              </p>
              {marker.parts.length > 0 ? (
                <p className="mt-3 text-sm font-semibold text-[#2f6f73]">
                  {partsLabel(marker.parts)}
                </p>
              ) : null}
            </article>
          ))}
        </section>
      </main>
    </>
  );
}

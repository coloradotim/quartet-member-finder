import {
  approximateLocationLabel,
  toPublicLocationSummary,
} from "@/lib/location/approximate-location";

export type DiscoveryMapKind = "quartet" | "singer";

export type DiscoveryMapItem = {
  countryCode: string | null;
  countryName: string | null;
  id: string;
  kind: DiscoveryMapKind;
  locality: string | null;
  locationLabelPublic: string | null;
  name: string;
  parts: string[];
  region: string | null;
};

export type DiscoveryMapMarker = {
  id: string;
  count: number;
  kinds: DiscoveryMapKind[];
  label: string;
  names: string[];
  parts: string[];
  xPercent: number;
  yPercent: number;
};

type MapAnchor = {
  xPercent: number;
  yPercent: number;
};

const COUNTRY_ANCHORS: Record<string, MapAnchor> = {
  australia: { xPercent: 80, yPercent: 72 },
  au: { xPercent: 80, yPercent: 72 },
  canada: { xPercent: 22, yPercent: 24 },
  ca: { xPercent: 22, yPercent: 24 },
  france: { xPercent: 49, yPercent: 39 },
  fr: { xPercent: 49, yPercent: 39 },
  germany: { xPercent: 51, yPercent: 37 },
  de: { xPercent: 51, yPercent: 37 },
  ireland: { xPercent: 46, yPercent: 35 },
  ie: { xPercent: 46, yPercent: 35 },
  netherlands: { xPercent: 49, yPercent: 35 },
  nl: { xPercent: 49, yPercent: 35 },
  "new zealand": { xPercent: 86, yPercent: 78 },
  nz: { xPercent: 86, yPercent: 78 },
  "united kingdom": { xPercent: 47, yPercent: 34 },
  uk: { xPercent: 47, yPercent: 34 },
  gb: { xPercent: 47, yPercent: 34 },
  "united states": { xPercent: 24, yPercent: 43 },
  "united states of america": { xPercent: 24, yPercent: 43 },
  us: { xPercent: 24, yPercent: 43 },
  usa: { xPercent: 24, yPercent: 43 },
};

function stableHash(value: string) {
  let hash = 0;

  for (const character of value) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }

  return hash;
}

function normalizeKey(value: string | null) {
  return value?.trim().toLowerCase() || null;
}

function anchorForItem(item: DiscoveryMapItem): MapAnchor {
  const countryCode = normalizeKey(item.countryCode);
  const countryName = normalizeKey(item.countryName);
  const anchor =
    (countryCode ? COUNTRY_ANCHORS[countryCode] : undefined) ??
    (countryName ? COUNTRY_ANCHORS[countryName] : undefined);

  if (anchor) {
    return anchor;
  }

  const hash = stableHash(
    [item.countryName, item.region, item.locality, item.locationLabelPublic]
      .filter(Boolean)
      .join("|"),
  );

  return {
    xPercent: 12 + (hash % 76),
    yPercent: 24 + ((hash >>> 8) % 50),
  };
}

function approximateMarkerPosition(item: DiscoveryMapItem): MapAnchor {
  const anchor = anchorForItem(item);
  const offsetHash = stableHash(
    [item.countryName, item.region, item.locality, item.kind].join("|"),
  );
  const xOffset = (offsetHash % 13) - 6;
  const yOffset = ((offsetHash >>> 4) % 11) - 5;

  return {
    xPercent: Math.min(92, Math.max(8, anchor.xPercent + xOffset)),
    yPercent: Math.min(82, Math.max(16, anchor.yPercent + yOffset)),
  };
}

export function buildDiscoveryMapMarkers(
  items: DiscoveryMapItem[],
): DiscoveryMapMarker[] {
  const markerGroups = new Map<string, DiscoveryMapMarker>();

  for (const item of items) {
    const publicLocation = toPublicLocationSummary({
      countryName: item.countryName,
      locality: item.locality,
      locationLabelPublic: item.locationLabelPublic,
      region: item.region,
    });
    const label = approximateLocationLabel(publicLocation);

    if (label === "Location not shared") {
      continue;
    }

    const groupKey = [
      normalizeKey(item.countryName),
      normalizeKey(item.region),
      normalizeKey(item.locality),
      normalizeKey(item.locationLabelPublic),
    ].join("|");
    const existingMarker = markerGroups.get(groupKey);

    if (existingMarker) {
      existingMarker.count += 1;
      existingMarker.kinds = Array.from(
        new Set([...existingMarker.kinds, item.kind]),
      ).sort();
      existingMarker.names.push(item.name);
      existingMarker.parts = Array.from(
        new Set([...existingMarker.parts, ...item.parts]),
      ).sort();
      continue;
    }

    const { xPercent, yPercent } = approximateMarkerPosition(item);

    markerGroups.set(groupKey, {
      count: 1,
      id: groupKey,
      kinds: [item.kind],
      label,
      names: [item.name],
      parts: [...item.parts].sort(),
      xPercent,
      yPercent,
    });
  }

  return Array.from(markerGroups.values()).sort((first, second) =>
    first.label.localeCompare(second.label),
  );
}

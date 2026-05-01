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
  latitude: number;
  kinds: DiscoveryMapKind[];
  label: string;
  longitude: number;
  names: string[];
  parts: string[];
  resultIds: string[];
  xPercent: number;
  yPercent: number;
};

type MapAnchor = {
  latitude: number;
  longitude: number;
  xPercent: number;
  yPercent: number;
};

const COUNTRY_ANCHORS: Record<string, MapAnchor> = {
  australia: {
    latitude: -25.2744,
    longitude: 133.7751,
    xPercent: 80,
    yPercent: 72,
  },
  au: { latitude: -25.2744, longitude: 133.7751, xPercent: 80, yPercent: 72 },
  canada: {
    latitude: 56.1304,
    longitude: -106.3468,
    xPercent: 22,
    yPercent: 24,
  },
  ca: { latitude: 56.1304, longitude: -106.3468, xPercent: 22, yPercent: 24 },
  france: { latitude: 46.2276, longitude: 2.2137, xPercent: 49, yPercent: 39 },
  fr: { latitude: 46.2276, longitude: 2.2137, xPercent: 49, yPercent: 39 },
  germany: {
    latitude: 51.1657,
    longitude: 10.4515,
    xPercent: 51,
    yPercent: 37,
  },
  de: { latitude: 51.1657, longitude: 10.4515, xPercent: 51, yPercent: 37 },
  ireland: {
    latitude: 53.1424,
    longitude: -7.6921,
    xPercent: 46,
    yPercent: 35,
  },
  ie: { latitude: 53.1424, longitude: -7.6921, xPercent: 46, yPercent: 35 },
  netherlands: {
    latitude: 52.1326,
    longitude: 5.2913,
    xPercent: 49,
    yPercent: 35,
  },
  nl: { latitude: 52.1326, longitude: 5.2913, xPercent: 49, yPercent: 35 },
  "new zealand": {
    latitude: -40.9006,
    longitude: 174.886,
    xPercent: 86,
    yPercent: 78,
  },
  nz: { latitude: -40.9006, longitude: 174.886, xPercent: 86, yPercent: 78 },
  "united kingdom": {
    latitude: 55.3781,
    longitude: -3.436,
    xPercent: 47,
    yPercent: 34,
  },
  uk: { latitude: 55.3781, longitude: -3.436, xPercent: 47, yPercent: 34 },
  gb: { latitude: 55.3781, longitude: -3.436, xPercent: 47, yPercent: 34 },
  "united states": {
    latitude: 39.8283,
    longitude: -98.5795,
    xPercent: 24,
    yPercent: 43,
  },
  "united states of america": {
    latitude: 39.8283,
    longitude: -98.5795,
    xPercent: 24,
    yPercent: 43,
  },
  us: { latitude: 39.8283, longitude: -98.5795, xPercent: 24, yPercent: 43 },
  usa: { latitude: 39.8283, longitude: -98.5795, xPercent: 24, yPercent: 43 },
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
    latitude: 50 - ((hash >>> 12) % 100),
    longitude: -170 + (hash % 340),
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
    latitude: Math.min(
      80,
      Math.max(-60, anchor.latitude + (((offsetHash >>> 10) % 60) - 30) / 10),
    ),
    longitude: Math.min(
      175,
      Math.max(-175, anchor.longitude + (((offsetHash >>> 16) % 80) - 40) / 10),
    ),
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
      existingMarker.resultIds.push(item.id);
      continue;
    }

    const { latitude, longitude, xPercent, yPercent } =
      approximateMarkerPosition(item);

    markerGroups.set(groupKey, {
      count: 1,
      id: groupKey,
      kinds: [item.kind],
      latitude,
      label,
      longitude,
      names: [item.name],
      parts: [...item.parts].sort(),
      resultIds: [item.id],
      xPercent,
      yPercent,
    });
  }

  return Array.from(markerGroups.values()).sort((first, second) =>
    first.label.localeCompare(second.label),
  );
}

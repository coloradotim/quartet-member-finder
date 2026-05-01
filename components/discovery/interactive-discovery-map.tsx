"use client";

import { useEffect, useRef, useState } from "react";
import type {
  LngLatBoundsLike,
  Map as MapboxMap,
  MapOptions,
  Marker as MapboxMarker,
  Popup as MapboxPopup,
} from "mapbox-gl";
import { groupVoicingParts } from "@/lib/parts/voicings";
import type { DiscoveryMapMarker } from "@/lib/location/map-markers";

type InteractiveDiscoveryMapProps = {
  emptyMessage: string;
  markers: DiscoveryMapMarker[];
  resultBasePath?: string;
  resultLabel: string;
  scopeLabel: string;
  totalResults: number;
};

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
const MAPBOX_STYLE =
  process.env.NEXT_PUBLIC_MAPBOX_STYLE_URL ??
  "mapbox://styles/mapbox/streets-v12";
const MAP_PROJECTION = process.env.NEXT_PUBLIC_MAPBOX_PROJECTION ?? "globe";
const DEFAULT_CENTER: [number, number] = [-15, 22];

function markerKindLabel(marker: DiscoveryMapMarker) {
  if (marker.kinds.includes("quartet") && marker.kinds.includes("singer")) {
    return "results";
  }

  if (marker.kinds[0] === "quartet") {
    return marker.count === 1 ? "quartet opening" : "quartet openings";
  }

  return marker.count === 1 ? "singer" : "singers";
}

function markerSummary(marker: DiscoveryMapMarker) {
  const previewNames = marker.names.slice(0, 3).join(", ");
  const remainingCount = marker.names.length - 3;

  return remainingCount > 0
    ? `${previewNames}, +${remainingCount} more`
    : previewNames;
}

function partsLabel(values: string[]) {
  return groupVoicingParts(values) || "No parts listed";
}

function centerForMarkers(markers: DiscoveryMapMarker[]): [number, number] {
  if (markers.length === 0) {
    return DEFAULT_CENTER;
  }

  return [
    markers.reduce((total, marker) => total + marker.longitude, 0) /
      markers.length,
    markers.reduce((total, marker) => total + marker.latitude, 0) /
      markers.length,
  ];
}

function boundsForMarkers(
  markers: DiscoveryMapMarker[],
  mapboxgl: typeof import("mapbox-gl").default,
): LngLatBoundsLike {
  const bounds = new mapboxgl.LngLatBounds();

  for (const marker of markers) {
    bounds.extend([marker.longitude, marker.latitude]);
  }

  return bounds;
}

function createPopupNode(marker: DiscoveryMapMarker, resultBasePath: string) {
  const container = document.createElement("div");
  container.className = "max-w-xs text-sm";

  const title = document.createElement("h3");
  title.className = "font-bold text-[#172023]";
  title.textContent = marker.label;
  container.append(title);

  const summary = document.createElement("p");
  summary.className = "mt-1 text-[#394548]";
  summary.textContent = `${marker.count} ${markerKindLabel(
    marker,
  )}: ${markerSummary(marker)}`;
  container.append(summary);

  if (marker.parts.length > 0) {
    const parts = document.createElement("p");
    parts.className = "mt-2 font-semibold text-[#2f6f73]";
    parts.textContent = partsLabel(marker.parts);
    container.append(parts);
  }

  const link = document.createElement("a");
  link.className =
    "mt-3 inline-flex min-h-10 items-center rounded-md bg-[#174b4f] px-3 py-2 font-semibold text-white hover:bg-[#10393c]";
  link.href = `${resultBasePath}#result-${marker.resultIds[0]}`;
  link.textContent = "View matching result";
  container.append(link);

  return container;
}

function createMarkerElement(marker: DiscoveryMapMarker) {
  const element = document.createElement("button");
  element.type = "button";
  element.className =
    "flex h-9 min-w-9 items-center justify-center rounded-full border-2 border-white bg-[#174b4f] px-2 text-sm font-bold text-white shadow-md hover:bg-[#10393c] focus:outline-none focus:ring-2 focus:ring-[#f5bd47]";
  element.textContent = String(marker.count);
  element.setAttribute(
    "aria-label",
    `${marker.label}: ${marker.count} ${markerKindLabel(marker)}`,
  );

  return element;
}

export function InteractiveDiscoveryMap({
  emptyMessage,
  markers,
  resultBasePath = "",
  resultLabel,
  scopeLabel,
  totalResults,
}: InteractiveDiscoveryMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const mapboxglRef = useRef<typeof import("mapbox-gl").default | null>(null);
  const markerInstancesRef = useRef<MapboxMarker[]>([]);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !MAPBOX_TOKEN) {
      return;
    }

    let canceled = false;

    async function initializeMap() {
      const mapboxgl = (await import("mapbox-gl")).default;

      if (canceled || !containerRef.current) {
        return;
      }

      mapboxgl.accessToken = MAPBOX_TOKEN;
      mapboxglRef.current = mapboxgl;

      const map = new mapboxgl.Map({
        attributionControl: false,
        center: DEFAULT_CENTER,
        container: containerRef.current,
        cooperativeGestures: true,
        projection: MAP_PROJECTION as MapOptions["projection"],
        style: MAPBOX_STYLE,
        zoom: 2.2,
      });

      map.addControl(
        new mapboxgl.NavigationControl({ showCompass: false }),
        "top-right",
      );
      map.addControl(
        new mapboxgl.AttributionControl({ compact: true }),
        "bottom-right",
      );
      map.on("style.load", () => {
        map?.setFog({
          color: "rgb(225, 236, 232)",
          "high-color": "rgb(95, 137, 150)",
          "horizon-blend": 0.04,
          "space-color": "rgb(15, 34, 39)",
          "star-intensity": 0.15,
        });
      });

      mapRef.current = map;
      setMapReady(true);
    }

    void initializeMap();

    return () => {
      canceled = true;

      for (const marker of markerInstancesRef.current) {
        marker.remove();
      }

      markerInstancesRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
      mapboxglRef.current = null;
      setMapReady(false);
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const mapboxgl = mapboxglRef.current;

    if (!mapReady || !map || !mapboxgl) {
      return;
    }

    for (const marker of markerInstancesRef.current) {
      marker.remove();
    }

    markerInstancesRef.current = markers.map((marker) => {
      const popup: MapboxPopup = new mapboxgl.Popup({
        closeButton: true,
        closeOnClick: true,
        maxWidth: "320px",
        offset: 18,
      }).setDOMContent(createPopupNode(marker, resultBasePath));

      return new mapboxgl.Marker({
        element: createMarkerElement(marker),
      })
        .setLngLat([marker.longitude, marker.latitude])
        .setPopup(popup)
        .addTo(map);
    });

    if (markers.length > 1) {
      map.fitBounds(boundsForMarkers(markers, mapboxgl), {
        duration: 0,
        maxZoom: 5,
        padding: 70,
      });
    } else {
      map.jumpTo({
        center: centerForMarkers(markers),
        zoom: markers.length === 1 ? 4 : 2.2,
      });
    }
  }, [markers, mapReady, resultBasePath]);

  return (
    <section
      aria-label="Interactive privacy-safe discovery map"
      className="overflow-hidden rounded-lg border border-[#d7cec0] bg-[#dce8e3]"
    >
      <div className="border-b border-[#d7cec0] bg-white/90 px-4 py-3">
        <h2 className="font-bold text-[#172023]">{resultLabel}</h2>
        <p className="mt-1 text-sm text-[#394548]">
          {totalResults} visible results across {markers.length} approximate
          regions. Scope: {scopeLabel}.
        </p>
      </div>

      <div className="relative h-[30rem] bg-[#cbded9]">
        {MAPBOX_TOKEN ? (
          <div
            aria-label="Mapbox globe discovery map"
            className="h-full w-full"
            ref={containerRef}
          />
        ) : (
          <div
            className="absolute inset-x-6 top-8 rounded-lg border border-[#d7cec0] bg-white/95 p-5 text-sm leading-6 text-[#394548] shadow-sm"
            role="status"
          >
            Mapbox map rendering needs `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`.
            Results remain available below the map.
          </div>
        )}

        {markers.length === 0 ? (
          <div className="absolute inset-x-6 bottom-8 rounded-lg border border-[#d7cec0] bg-white/95 p-5 text-sm leading-6 text-[#394548] shadow-sm">
            {emptyMessage}
          </div>
        ) : null}
      </div>
    </section>
  );
}

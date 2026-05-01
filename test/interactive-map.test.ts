import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const component = readFileSync(
  "components/discovery/interactive-discovery-map.tsx",
  "utf8",
);
const envExample = readFileSync(".env.example", "utf8");

describe("interactive discovery map", () => {
  it("uses Mapbox GL with a non-Mercator default projection", () => {
    expect(component).toContain("mapbox-gl");
    expect(component).toContain('?? "globe"');
    expect(component).not.toContain('?? "mercator"');
    expect(component).toContain("cooperativeGestures");
  });

  it("documents the required public browser token", () => {
    expect(envExample).toContain("NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN");
    expect(envExample).toContain("NEXT_PUBLIC_MAPBOX_PROJECTION=globe");
    expect(component).toContain("NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN");
  });

  it("does not expose private location field names in browser map props", () => {
    expect(component).not.toMatch(
      /postal_code_private|latitude_private|longitude_private/,
    );
  });

  it("initializes one Mapbox map instance and updates markers separately", () => {
    expect(component).toContain("const [mapReady, setMapReady]");
    expect(component).toContain("useEffect(() => {");
    expect(component).toContain("new mapboxgl.Map");
    expect(component).toContain("}, []);");
    expect(component).toContain("markerInstancesRef.current = markers.map");
    expect(component).toContain("}, [markers, mapReady, resultBasePath]);");
  });
});

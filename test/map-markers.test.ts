import { describe, expect, it } from "vitest";
import { buildDiscoveryMapMarkers } from "@/lib/location/map-markers";

describe("privacy-safe discovery map markers", () => {
  it("builds approximate markers from public US and non-US locations", () => {
    const markers = buildDiscoveryMapMarkers([
      {
        countryCode: "US",
        countryName: "United States",
        id: "singer-1",
        kind: "singer",
        locality: "Fort Collins",
        locationLabelPublic: null,
        name: "Avery",
        parts: ["TTBB:Lead"],
        region: "CO",
      },
      {
        countryCode: "GB",
        countryName: "United Kingdom",
        id: "quartet-1",
        kind: "quartet",
        locality: "Manchester",
        locationLabelPublic: "Manchester, UK area",
        name: "Northern Ring",
        parts: ["SATB:Bass"],
        region: "England",
      },
    ]);

    expect(markers).toHaveLength(2);
    expect(markers.map((marker) => marker.label)).toEqual([
      "Fort Collins, CO, United States area",
      "Manchester, UK area",
    ]);

    for (const marker of markers) {
      expect(marker.xPercent).toBeGreaterThanOrEqual(8);
      expect(marker.xPercent).toBeLessThanOrEqual(92);
      expect(marker.yPercent).toBeGreaterThanOrEqual(16);
      expect(marker.yPercent).toBeLessThanOrEqual(82);
      expect(marker.latitude).toBeGreaterThanOrEqual(-60);
      expect(marker.latitude).toBeLessThanOrEqual(80);
      expect(marker.longitude).toBeGreaterThanOrEqual(-175);
      expect(marker.longitude).toBeLessThanOrEqual(175);
    }
  });

  it("clusters repeated public locations without exposing private fields", () => {
    const markers = buildDiscoveryMapMarkers([
      {
        countryCode: "IE",
        countryName: "Ireland",
        id: "singer-1",
        kind: "singer",
        locality: "Dublin",
        locationLabelPublic: null,
        name: "Casey",
        parts: ["TTBB:Tenor"],
        region: "Leinster",
      },
      {
        countryCode: "IE",
        countryName: "Ireland",
        id: "quartet-1",
        kind: "quartet",
        locality: "Dublin",
        locationLabelPublic: null,
        name: "River City Four",
        parts: ["SSAA:Soprano 2"],
        region: "Leinster",
      },
    ]);

    expect(markers).toHaveLength(1);
    expect(markers[0]).toMatchObject({
      count: 2,
      kinds: ["quartet", "singer"],
      label: "Dublin, Leinster, Ireland area",
      names: ["Casey", "River City Four"],
      parts: ["SSAA:Soprano 2", "TTBB:Tenor"],
      resultIds: ["singer-1", "quartet-1"],
    });
  });

  it("skips entries with no public location", () => {
    expect(
      buildDiscoveryMapMarkers([
        {
          countryCode: null,
          countryName: null,
          id: "singer-1",
          kind: "singer",
          locality: null,
          locationLabelPublic: null,
          name: "Hidden Location",
          parts: ["SATB:Bass"],
          region: null,
        },
      ]),
    ).toEqual([]);
  });
});

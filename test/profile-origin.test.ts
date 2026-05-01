import { describe, expect, it } from "vitest";
import {
  coordinatesFromPrivateRow,
  profileOriginState,
  profileOriginUnavailableMessage,
  type ProfileOriginRow,
} from "@/lib/search/profile-origin";

const completeTextLocation: ProfileOriginRow = {
  country_name: "United States",
  latitude_private: null,
  locality: "Fort Collins",
  location_label_public: "Fort Collins, CO area",
  longitude_private: null,
  postal_code_private: "80521",
  region: "Colorado",
};

describe("profile search origin state", () => {
  it("treats saved private coordinates as a usable singer profile origin", () => {
    const state = profileOriginState({
      ...completeTextLocation,
      latitude_private: "40.5853",
      longitude_private: -105.0844,
    });

    expect(state).toEqual({
      coordinates: { latitude: 40.5853, longitude: -105.0844 },
      label: "Fort Collins, CO area",
      status: "usable",
    });
  });

  it("does not reject valid zero-valued coordinate components", () => {
    expect(
      coordinatesFromPrivateRow({
        ...completeTextLocation,
        latitude_private: 0,
        longitude_private: 0,
      }),
    ).toEqual({ latitude: 0, longitude: 0 });
  });

  it("distinguishes complete text location that still needs geocoding", () => {
    const state = profileOriginState(completeTextLocation);

    expect(state.status).toBe("needs_geocoding");
    expect(profileOriginUnavailableMessage(state.status)).toContain(
      "has location text but does not have saved approximate coordinates",
    );
  });

  it("distinguishes incomplete or missing profile location", () => {
    expect(profileOriginState(null).status).toBe("missing_profile");
    expect(
      profileOriginState({
        ...completeTextLocation,
        postal_code_private: null,
      }).status,
    ).toBe("incomplete_location");
    expect(profileOriginUnavailableMessage("incomplete_location")).toContain(
      "needs country, region, city, and ZIP/postal code",
    );
  });
});

import { describe, expect, it } from "vitest";
import {
  groupVoicingParts,
  parseVoicingPartValue,
  partLabel,
  partsByVoicing,
  satbDisplayLabels,
} from "@/lib/parts/voicings";

describe("voicing-aware parts", () => {
  it("keeps canonical part labels distinct by voicing", () => {
    expect(partsByVoicing.TTBB).toEqual(["Tenor", "Lead", "Baritone", "Bass"]);
    expect(partsByVoicing.SATB).toEqual(["Soprano", "Alto", "Tenor", "Bass"]);
    expect(partsByVoicing.SSAA).toEqual([
      "Soprano 1",
      "Soprano 2",
      "Alto 1",
      "Alto 2",
    ]);
  });

  it("accepts only valid part and voicing combinations", () => {
    expect(parseVoicingPartValue("TTBB:Tenor")).toEqual({
      part: "Tenor",
      voicing: "TTBB",
    });
    expect(parseVoicingPartValue("SATB:Tenor")).toEqual({
      part: "Tenor",
      voicing: "SATB",
    });
    expect(parseVoicingPartValue("SATB:Lead")).toBeNull();
    expect(parseVoicingPartValue("SSAA:Lead")).toBeNull();
  });

  it("shows SATB mixed equivalents without changing stored parts", () => {
    expect(satbDisplayLabels.Soprano).toBe("Soprano / Mixed Tenor");
    expect(partLabel("SATB", "Alto")).toBe("Alto / Mixed Lead");
    expect(partLabel("TTBB", "Lead")).toBe("Lead");
  });

  it("groups stored values by voicing for discovery display", () => {
    expect(
      groupVoicingParts(["TTBB:Lead", "SATB:Soprano", "SSAA:Alto 2"]),
    ).toBe("TTBB: Lead; SSAA: Alto 2; SATB / mixed: Soprano / Mixed Tenor");
  });
});

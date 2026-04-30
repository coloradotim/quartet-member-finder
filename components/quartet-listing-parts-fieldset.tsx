"use client";

import { useState } from "react";
import {
  VOICINGS,
  partsByVoicing,
  partLabel,
  voicingLabels,
  voicingPartValue,
  type Voicing,
} from "@/lib/parts/voicings";

type QuartetListingPartsFieldsetProps = {
  initialCoveredParts: string[];
  initialNeededParts: string[];
  initialVoicing: Voicing;
};

function checked(value: string, values: readonly string[]) {
  return values.includes(value);
}

export function QuartetListingPartsFieldset({
  initialCoveredParts,
  initialNeededParts,
  initialVoicing,
}: QuartetListingPartsFieldsetProps) {
  const [voicing, setVoicing] = useState<Voicing>(initialVoicing);

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-[#172023]">Parts</h2>
      <label className="block">
        <span className="text-sm font-semibold text-[#172023]">
          Quartet voicing
        </span>
        <select
          className="mt-2 w-full rounded-md border border-[#d7cec0] bg-white px-3 py-2 text-base text-[#172023] shadow-sm outline-none focus:border-[#2f6f73] focus:ring-2 focus:ring-[#2f6f73]/20"
          name="voicing"
          onChange={(event) => setVoicing(event.target.value as Voicing)}
          value={voicing}
        >
          {VOICINGS.map((option) => (
            <option key={option} value={option}>
              {voicingLabels[option]}
            </option>
          ))}
        </select>
      </label>
      <p className="text-sm leading-6 text-[#394548]">
        Choose one primary voicing for this listing. SATB labels include the
        mixed-barbershop equivalent while storing canonical SATB parts.
      </p>
      <div className="grid gap-6 sm:grid-cols-2">
        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-[#172023]">
            Currently covered
          </legend>
          {partsByVoicing[voicing].map((part) => {
            const value = voicingPartValue(voicing, part);

            return (
              <label
                className="flex items-center gap-3 rounded-md border border-[#d7cec0] bg-[#fffaf2] px-3 py-2"
                key={value}
              >
                <input
                  defaultChecked={checked(value, initialCoveredParts)}
                  name="partsCovered"
                  type="checkbox"
                  value={value}
                />
                <span className="font-semibold">
                  {partLabel(voicing, part)}
                </span>
              </label>
            );
          })}
        </fieldset>
        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-[#172023]">
            Needed
          </legend>
          {partsByVoicing[voicing].map((part) => {
            const value = voicingPartValue(voicing, part);

            return (
              <label
                className="flex items-center gap-3 rounded-md border border-[#d7cec0] bg-[#fffaf2] px-3 py-2"
                key={value}
              >
                <input
                  defaultChecked={checked(value, initialNeededParts)}
                  name="partsNeeded"
                  type="checkbox"
                  value={value}
                />
                <span className="font-semibold">
                  {partLabel(voicing, part)}
                </span>
              </label>
            );
          })}
        </fieldset>
      </div>
    </section>
  );
}

export const VOICINGS = ["TTBB", "SSAA", "SATB"] as const;

export type Voicing = (typeof VOICINGS)[number];

export const partsByVoicing = {
  TTBB: ["Tenor", "Lead", "Baritone", "Bass"],
  SATB: ["Soprano", "Alto", "Tenor", "Bass"],
  SSAA: ["Soprano 1", "Soprano 2", "Alto 1", "Alto 2"],
} as const;

export type VoicingPart = (typeof partsByVoicing)[Voicing][number];

export type VoicingPartSelection = {
  part: VoicingPart;
  voicing: Voicing;
};

export const satbDisplayLabels = {
  Alto: "Alto / Mixed Lead",
  Bass: "Bass / Mixed Bass",
  Soprano: "Soprano / Mixed Tenor",
  Tenor: "Tenor / Mixed Baritone",
} as const;

export const voicingLabels: Record<Voicing, string> = {
  SATB: "SATB / mixed",
  SSAA: "SSAA",
  TTBB: "TTBB",
};

export function partLabel(voicing: Voicing, part: VoicingPart) {
  return voicing === "SATB" && part in satbDisplayLabels
    ? satbDisplayLabels[part as keyof typeof satbDisplayLabels]
    : part;
}

export function voicingPartValue(voicing: Voicing, part: VoicingPart) {
  return `${voicing}:${part}`;
}

export function voicingPartOptions(anyLabel: string) {
  return [
    ["", anyLabel],
    ...VOICINGS.flatMap((voicing) =>
      partsByVoicing[voicing].map((part) => [
        voicingPartValue(voicing, part),
        `${voicingLabels[voicing]} ${partLabel(voicing, part)}`,
      ]),
    ),
  ] as const;
}

export function parseVoicingPartValue(value: string) {
  const [voicing, part] = value.split(":");

  if (!isVoicing(voicing)) {
    return null;
  }

  return isPartForVoicing(voicing, part)
    ? ({ part, voicing } as VoicingPartSelection)
    : null;
}

export function isVoicing(value: unknown): value is Voicing {
  return typeof value === "string" && VOICINGS.includes(value as Voicing);
}

export function isPartForVoicing(
  voicing: Voicing,
  value: unknown,
): value is VoicingPart {
  return (
    typeof value === "string" &&
    (partsByVoicing[voicing] as readonly string[]).includes(value)
  );
}

export function groupVoicingParts(parts: readonly string[]) {
  const groups = new Map<Voicing, VoicingPart[]>();

  for (const value of parts) {
    const parsed = parseVoicingPartValue(value);

    if (!parsed) {
      continue;
    }

    groups.set(parsed.voicing, [
      ...(groups.get(parsed.voicing) ?? []),
      parsed.part,
    ]);
  }

  return VOICINGS.flatMap((voicing) => {
    const selectedParts = groups.get(voicing) ?? [];

    return selectedParts.length > 0
      ? [
          `${voicingLabels[voicing]}: ${selectedParts.map((part) => partLabel(voicing, part)).join(", ")}`,
        ]
      : [];
  }).join("; ");
}

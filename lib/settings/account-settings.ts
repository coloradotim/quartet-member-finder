export const accountDistanceUnitOptions = [
  {
    label: "Kilometers",
    value: "km",
  },
  {
    label: "Miles",
    value: "mi",
  },
] as const;

export type AccountDistanceUnit =
  (typeof accountDistanceUnitOptions)[number]["value"];

export function isAccountDistanceUnit(
  value: string,
): value is AccountDistanceUnit {
  return value === "km" || value === "mi";
}

export function normalizeAccountDistanceUnit(value: string | null) {
  return value && isAccountDistanceUnit(value) ? value : "km";
}

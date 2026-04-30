export type OnboardingChoice = {
  description: string;
  href: string;
  id: string;
  label: string;
};

export const onboardingChoices: OnboardingChoice[] = [
  {
    description:
      "Browse visible quartet openings after saving your starter profile context. You can complete your singer profile later.",
    href: "/find?kind=quartets",
    id: "find-quartet-openings",
    label: "I'm a singer looking for quartet openings",
  },
  {
    description:
      "Browse visible singer profiles and look for people nearby or in another region who might want to sing.",
    href: "/find?kind=singers",
    id: "find-singers-as-singer",
    label: "I'm a singer looking for other singers",
  },
  {
    description:
      "Open Quartet Mode and create a listing with the quartet's voicing, covered parts, missing parts, goals, and approximate area.",
    href: "/app/listings",
    id: "quartet-mode-listing",
    label: "I represent a quartet looking for a singer",
  },
  {
    description:
      "Go to Find with your starter context saved. You can complete singer or quartet details later.",
    href: "/find",
    id: "browse-for-now",
    label: "I just want to browse for now",
  },
];

export function destinationForOnboardingChoice(choiceId: string | null) {
  return (
    onboardingChoices.find((choice) => choice.id === choiceId)?.href ?? "/app"
  );
}

export function isValidOnboardingChoice(choiceId: string | null) {
  return onboardingChoices.some((choice) => choice.id === choiceId);
}

export function normalizePostOnboardingPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/app";
  }

  if (value === "/app/onboarding") {
    return "/app";
  }

  return value;
}

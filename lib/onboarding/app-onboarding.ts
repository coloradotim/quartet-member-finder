export type OnboardingChoice = {
  description: string;
  href: string;
  id: string;
  label: string;
};

export const onboardingChoices: OnboardingChoice[] = [
  {
    description:
      "Open My Singer Profile first. You can make it discoverable when you want quartets or other singers to find you.",
    href: "/app/profile",
    id: "singer-profile-first",
    label: "I'm a singer looking for quartet openings",
  },
  {
    description:
      "Open My Quartet Profile first. You can describe the opening and make it discoverable when the group is actively looking.",
    href: "/app/listings",
    id: "quartet-profile-first",
    label: "I represent a quartet looking for a singer",
  },
  {
    description:
      "Go to the signed-in dashboard for a quick overview. You can fill out either profile, both profiles, or neither profile while you get oriented.",
    href: "/app",
    id: "get-oriented",
    label: "I'm not sure yet / I just want to get oriented",
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

export type OnboardingChoice = {
  description: string;
  href: string;
  id: string;
  label: string;
};

export type OnboardingSection = {
  choices: OnboardingChoice[];
  heading: string;
  summary: string;
};

export const onboardingSections: OnboardingSection[] = [
  {
    choices: [
      {
        description:
          "Set up the profile that helps others discover your parts, goals, availability, and approximate area.",
        href: "/app/profile",
        id: "my-singer-profile",
        label: "My Singer Profile",
      },
      {
        description:
          "Browse quartet openings from groups looking for one or more missing parts.",
        href: "/quartets",
        id: "find-quartet-openings",
        label: "Find Quartet Openings",
      },
      {
        description:
          "Look for singers nearby or in another region where you are willing to sing.",
        href: "/singers",
        id: "find-singers-as-singer",
        label: "Find Singers",
      },
    ],
    heading: "As a singer",
    summary:
      "Start with your own singer profile, or look for quartet openings and other singers.",
  },
  {
    choices: [
      {
        description:
          "Create or update a quartet listing with covered parts, missing parts, goals, and approximate area.",
        href: "/app/listings",
        id: "quartet-mode-listing",
        label: "Create or edit a quartet listing",
      },
      {
        description:
          "Search singer profiles when your quartet is ready to contact someone about a missing part.",
        href: "/singers",
        id: "quartet-mode-find-singers",
        label: "Find singers for a quartet",
      },
    ],
    heading: "Quartet Mode",
    summary:
      "Use Quartet Mode when you are representing an incomplete quartet looking for singers.",
  },
  {
    choices: [
      {
        description:
          "Go to the signed-in dashboard and browse the main actions from there.",
        href: "/app",
        id: "browse-for-now",
        label: "Just browse/search for now",
      },
      {
        description:
          "Read the plain-language help and privacy pages before adding profile or listing details.",
        href: "/help",
        id: "read-help-privacy",
        label: "Read Help / Privacy",
      },
    ],
    heading: "Other",
    summary:
      "You can skip setup decisions for now, read how privacy works, and come back later. Location fields are meant to work outside the United States too.",
  },
];

export const onboardingChoices = onboardingSections.flatMap(
  (section) => section.choices,
);

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

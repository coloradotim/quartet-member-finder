export type DashboardAction = {
  description: string;
  href: string;
  label: string;
};

export const singerDashboardActions: DashboardAction[] = [
  {
    description:
      "Create or update the profile that helps other singers and quartets understand your parts, goals, availability, and approximate area.",
    href: "/app/profile",
    label: "My Singer Profile",
  },
  {
    description:
      "Search quartet openings, singer profiles, and approximate regions from one discovery page.",
    href: "/find",
    label: "Find",
  },
];

export const quartetModeDashboardActions: DashboardAction[] = [
  {
    description:
      "Create or update the listing for an incomplete quartet, including covered parts, needed parts, goals, and approximate area.",
    href: "/app/listings",
    label: "Manage Quartet Listing",
  },
  {
    description:
      "Search singer profiles and nearby activity when your quartet is ready to contact someone about a missing part.",
    href: "/find?kind=singers",
    label: "Find singers",
  },
];

export const supportDashboardActions: DashboardAction[] = [
  {
    description:
      "Review private account identity, preferred distance units, first-run setup, and future account-management placeholders.",
    href: "/app/settings",
    label: "Account Settings",
  },
  {
    description:
      "Review how profiles, listings, discovery, visibility, and app-mediated contact work.",
    href: "/help",
    label: "Help",
  },
  {
    description:
      "See how approximate location, visibility, and contact privacy are handled.",
    href: "/privacy",
    label: "Privacy",
  },
];

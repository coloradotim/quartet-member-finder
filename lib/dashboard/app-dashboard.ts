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
      "Browse quartet openings from groups looking for one or more missing parts.",
    href: "/quartets",
    label: "Find Quartet Openings",
  },
  {
    description:
      "Look for other singers nearby or in a region where you are willing to sing.",
    href: "/singers",
    label: "Find Singers",
  },
  {
    description:
      "Scan approximate discovery locations without exposing exact home addresses or private coordinates.",
    href: "/map",
    label: "View Map",
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
      "Search singer profiles when your quartet is ready to contact someone about a missing part.",
    href: "/singers",
    label: "Find Singers",
  },
];

export const supportDashboardActions: DashboardAction[] = [
  {
    description:
      "Review account-level preferences, re-run onboarding, and find future account-management placeholders.",
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

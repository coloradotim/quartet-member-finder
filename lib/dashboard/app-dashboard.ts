export type DashboardAction = {
  description: string;
  href: string;
  label: string;
};

export const singerDashboardActions: DashboardAction[] = [
  {
    description:
      "Create or update your optional singer presence. Make it discoverable when you want quartets or other singers to find you.",
    href: "/app/profile",
    label: "My Singer Profile",
  },
  {
    description:
      "Search quartet openings after your singer context is ready. You can change the looking-for filter any time.",
    href: "/find?kind=quartets",
    label: "Find quartet openings",
  },
];

export const quartetDashboardActions: DashboardAction[] = [
  {
    description:
      "Create or update the optional profile for a quartet or prospective quartet you represent.",
    href: "/app/listings",
    label: "My Quartet Profile",
  },
  {
    description:
      "Search singer profiles when your quartet opening is ready for app-mediated first contact.",
    href: "/find?kind=singers",
    label: "Find singers",
  },
];

export const supportDashboardActions: DashboardAction[] = [
  {
    description:
      "Review how optional profiles, independent visibility, discovery, and app-mediated contact work.",
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

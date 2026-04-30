export const signedInPrimaryNavigationLinks = [
  {
    href: "/app/profile",
    label: "My Singer Profile",
  },
  {
    href: "/find",
    label: "Find",
  },
] as const;

export const signedInModeNavigationLinks = [
  {
    href: "/app/listings",
    label: "Quartet Mode",
  },
] as const;

export const signedInUtilityNavigationLinks = [
  {
    href: "/app/settings",
    label: "Account Settings",
  },
] as const;

export const signedInNavigationLinks = [
  ...signedInPrimaryNavigationLinks,
  ...signedInModeNavigationLinks,
  ...signedInUtilityNavigationLinks,
] as const;

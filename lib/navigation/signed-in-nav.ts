type SignedInNavigationLink = {
  href: string;
  label: string;
};

export const signedInPrimaryNavigationLinks = [
  {
    href: "/app/profile",
    label: "My Singer Profile",
  },
  {
    href: "/app/listings",
    label: "My Quartet Profile",
  },
  {
    href: "/find",
    label: "Find",
  },
  {
    href: "/help",
    label: "Help",
  },
] as const;

export const signedInModeNavigationLinks: SignedInNavigationLink[] = [];

export const signedInUtilityNavigationLinks: SignedInNavigationLink[] = [];

export const signedInNavigationLinks = [
  ...signedInPrimaryNavigationLinks,
  ...signedInModeNavigationLinks,
  ...signedInUtilityNavigationLinks,
] as const;

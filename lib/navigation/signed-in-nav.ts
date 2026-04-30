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

export const signedInUtilityNavigationLinks: SignedInNavigationLink[] = [];

export const signedInNavigationLinks = [
  ...signedInPrimaryNavigationLinks,
  ...signedInModeNavigationLinks,
  ...signedInUtilityNavigationLinks,
] as const;

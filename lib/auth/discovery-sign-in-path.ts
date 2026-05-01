export type DiscoverySearchParams = Record<
  string,
  string | string[] | undefined
>;

export function pathWithSearch(
  pathname: string,
  params: DiscoverySearchParams = {},
) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    const values = Array.isArray(value) ? value : [value];

    for (const item of values) {
      if (item) {
        query.append(key, item);
      }
    }
  }

  const queryString = query.toString();

  return queryString ? `${pathname}?${queryString}` : pathname;
}

export function discoverySignInPath(
  pathname: string,
  params: DiscoverySearchParams = {},
) {
  return `/sign-in?next=${encodeURIComponent(pathWithSearch(pathname, params))}`;
}

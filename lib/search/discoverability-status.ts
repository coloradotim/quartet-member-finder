import type { ProfileOriginState } from "@/lib/search/profile-origin";

export function discoverabilityStatusLabel({
  isVisible,
  state,
}: {
  isVisible: boolean | null | undefined;
  state: ProfileOriginState;
}) {
  if (!isVisible) {
    return "Not shown in Find";
  }

  if (state.status !== "usable") {
    return "Shown in Find, but missing location for distance search";
  }

  return "Shown in Find";
}

export function discoverabilityExplanation({
  hasVisibleQuartetProfile,
  hasVisibleSingerProfile,
}: {
  hasVisibleQuartetProfile: boolean | null | undefined;
  hasVisibleSingerProfile: boolean | null | undefined;
}) {
  if (hasVisibleSingerProfile || hasVisibleQuartetProfile) {
    return "You can search either way. These settings only control whether other people can find your profiles.";
  }

  return "You can still search, but other users will not discover your Singer Profile or Quartet Profile until you turn visibility on.";
}

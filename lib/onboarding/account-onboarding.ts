import { normalizePostOnboardingPath } from "@/lib/onboarding/app-onboarding";

type SupabaseLike = {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (
        column: string,
        value: string,
      ) => {
        maybeSingle: () => PromiseLike<{
          data: AccountProfileOnboardingRow | null;
          error: unknown;
        }>;
      };
    };
    upsert: (
      values: Record<string, unknown>,
      options?: Record<string, unknown>,
    ) => PromiseLike<{ error: unknown }>;
  };
};

export type AuthUserForOnboarding = {
  email?: string | null;
  id: string;
};

export type AccountProfileOnboardingRow = {
  onboarding_completed_at: string | null;
  onboarding_skipped_at: string | null;
};

export function displayNameFromUser(user: AuthUserForOnboarding) {
  const emailName = user.email?.split("@")[0]?.trim();

  return (emailName || "Quartet Member Finder user").slice(0, 120);
}

export function onboardingIsDone(row: AccountProfileOnboardingRow | null) {
  return Boolean(row?.onboarding_completed_at || row?.onboarding_skipped_at);
}

export async function ensureAccountProfileForOnboarding(
  supabase: unknown,
  user: AuthUserForOnboarding,
) {
  const client = supabase as SupabaseLike;

  await client.from("account_profiles").upsert(
    {
      display_name: displayNameFromUser(user),
      user_id: user.id,
    },
    { ignoreDuplicates: true, onConflict: "user_id" },
  );
}

export async function getOnboardingStatus(supabase: unknown, userId: string) {
  const client = supabase as SupabaseLike;
  const { data } = await client
    .from("account_profiles")
    .select("onboarding_completed_at, onboarding_skipped_at")
    .eq("user_id", userId)
    .maybeSingle();

  return data;
}

export async function firstSignInDestination(
  supabase: unknown,
  user: AuthUserForOnboarding,
  requestedNext: string,
) {
  const safeNext = normalizePostOnboardingPath(requestedNext);

  await ensureAccountProfileForOnboarding(supabase, user);

  const onboardingStatus = await getOnboardingStatus(supabase, user.id);

  if (onboardingIsDone(onboardingStatus)) {
    return safeNext;
  }

  return `/app/onboarding?next=${encodeURIComponent(safeNext)}`;
}

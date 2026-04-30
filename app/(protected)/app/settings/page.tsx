import Link from "next/link";
import { redirect } from "next/navigation";
import {
  resetOnboarding,
  saveAccountSettings,
} from "@/app/(protected)/app/settings/actions";
import {
  accountDistanceUnitOptions,
  normalizeAccountDistanceUnit,
} from "@/lib/settings/account-settings";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type AccountSettingsRow = {
  display_name: string;
  onboarding_completed_at: string | null;
  onboarding_skipped_at: string | null;
  preferred_distance_unit: string | null;
};

type AccountSettingsPageProps = {
  searchParams: Promise<{
    settings?: string;
  }>;
};

function statusMessage(status?: string) {
  if (status === "saved") {
    return "Account settings saved.";
  }

  if (status === "error") {
    return "Account settings could not be saved. Please try again.";
  }

  return null;
}

export default async function AccountSettingsPage({
  searchParams,
}: AccountSettingsPageProps) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/sign-in?next=/app/settings");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in?next=/app/settings");
  }

  const { data: accountProfile } = await supabase
    .from("account_profiles")
    .select(
      "display_name, onboarding_completed_at, onboarding_skipped_at, preferred_distance_unit",
    )
    .eq("user_id", user.id)
    .maybeSingle<AccountSettingsRow>();
  const message = statusMessage(params.settings);
  const preferredDistanceUnit = normalizeAccountDistanceUnit(
    accountProfile?.preferred_distance_unit ?? null,
  );
  const onboardingState = accountProfile?.onboarding_completed_at
    ? "completed"
    : accountProfile?.onboarding_skipped_at
      ? "skipped"
      : "not completed";

  return (
    <div className="space-y-8">
      <header className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2f6f73]">
          Account Settings
        </p>
        <h1 className="mt-4 text-3xl font-bold text-[#172023]">
          Account preferences
        </h1>
        <p className="mt-4 text-base leading-7 text-[#394548]">
          Account Settings are for private account identity, app defaults, and
          first-run setup. My Singer Profile controls what other singers and
          quartets can see in public discovery.
        </p>
      </header>

      <section className="grid max-w-5xl gap-4 lg:grid-cols-3">
        <article className="rounded-lg border border-[#d7cec0] bg-[#fffaf2] p-5">
          <h2 className="text-lg font-bold text-[#172023]">Account Settings</h2>
          <p className="mt-3 text-sm leading-6 text-[#394548]">
            Private account name, email context, distance defaults, onboarding
            reset, and future account actions.
          </p>
        </article>
        <article className="rounded-lg border border-[#d7cec0] bg-white/60 p-5">
          <h2 className="text-lg font-bold text-[#172023]">
            My Singer Profile
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#394548]">
            Public singer name, parts, goals, availability, approximate
            location, and search visibility.
          </p>
          <Link
            className="mt-4 inline-flex font-semibold text-[#2f6f73]"
            href="/app/profile"
          >
            Edit singer profile
          </Link>
        </article>
        <article className="rounded-lg border border-[#d7cec0] bg-white/60 p-5">
          <h2 className="text-lg font-bold text-[#172023]">Quartet Mode</h2>
          <p className="mt-3 text-sm leading-6 text-[#394548]">
            Quartet listing details, covered parts, needed parts, approximate
            location, and listing visibility.
          </p>
          <Link
            className="mt-4 inline-flex font-semibold text-[#2f6f73]"
            href="/app/listings"
          >
            Manage quartet listing
          </Link>
        </article>
      </section>

      {message ? (
        <p
          className={`max-w-3xl rounded-lg border p-4 text-sm ${
            params.settings === "error"
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-[#b7d7ce] bg-[#eef8f4] text-[#174b4f]"
          }`}
          role={params.settings === "error" ? "alert" : "status"}
        >
          {message}
        </p>
      ) : null}

      <section className="max-w-3xl rounded-lg border border-[#d7cec0] bg-[#fffaf2] p-5">
        <h2 className="text-xl font-bold text-[#172023]">
          Account identity and defaults
        </h2>
        <p className="mt-3 text-sm leading-6 text-[#394548]">
          These settings are account-level. They do not change the public
          display name, location, or visibility on your singer profile.
        </p>
        <form action={saveAccountSettings} className="mt-4 grid gap-4">
          <label className="block">
            <span className="text-sm font-semibold text-[#172023]">
              Account display name
            </span>
            <input
              className="mt-2 w-full rounded-md border border-[#d7cec0] bg-white px-3 py-2 text-base text-[#172023] shadow-sm outline-none focus:border-[#2f6f73] focus:ring-2 focus:ring-[#2f6f73]/20"
              defaultValue={accountProfile?.display_name ?? ""}
              maxLength={120}
              name="displayName"
              required
            />
          </label>
          <div className="rounded-md border border-[#d7cec0] bg-white/70 p-4 text-sm leading-6 text-[#394548]">
            <span className="font-semibold text-[#172023]">Sign-in email:</span>{" "}
            {user.email ?? "No email available"}
          </div>
          <label className="block">
            <span className="text-sm font-semibold text-[#172023]">
              Preferred distance unit
            </span>
            <select
              className="mt-2 w-full rounded-md border border-[#d7cec0] bg-white px-3 py-2 text-base text-[#172023] shadow-sm outline-none focus:border-[#2f6f73] focus:ring-2 focus:ring-[#2f6f73]/20"
              defaultValue={preferredDistanceUnit}
              name="preferredDistanceUnit"
            >
              {accountDistanceUnitOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <p className="text-sm leading-6 text-[#394548]">
            Country and postal-code details belong to your singer profile or
            quartet listing location. This account-level preference controls how
            distance should be displayed by default; discovery records still
            keep their own travel-distance details.
          </p>
          <button
            className="w-full rounded-md bg-[#174b4f] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#10393c] sm:w-fit"
            type="submit"
          >
            Save settings
          </button>
        </form>
      </section>

      <section className="max-w-3xl rounded-lg border border-[#d7cec0] bg-[#fffaf2] p-5">
        <h2 className="text-xl font-bold text-[#172023]">First-run setup</h2>
        <p className="mt-3 text-sm leading-6 text-[#394548]">
          Current onboarding state: {onboardingState}. Reset onboarding if you
          want to see the first-run choices again. This is an account action,
          not a public profile setting.
        </p>
        <form action={resetOnboarding} className="mt-4">
          <button
            className="w-full rounded-md border border-[#d7cec0] px-4 py-2.5 text-sm font-semibold text-[#172023] hover:bg-white sm:w-fit"
            type="submit"
          >
            Re-run onboarding
          </button>
        </form>
      </section>

      <section className="max-w-3xl rounded-lg border border-[#d7cec0] bg-[#fffaf2] p-5">
        <h2 className="text-xl font-bold text-[#172023]">Support</h2>
        <div className="mt-4 flex flex-wrap gap-4">
          <Link className="font-semibold text-[#2f6f73]" href="/help">
            Help
          </Link>
          <Link className="font-semibold text-[#2f6f73]" href="/privacy">
            Privacy
          </Link>
          <Link className="font-semibold text-[#2f6f73]" href="/help#feedback">
            Feedback
          </Link>
        </div>
      </section>

      <section className="max-w-3xl rounded-lg border border-[#d7cec0] bg-[#fffaf2] p-5">
        <h2 className="text-xl font-bold text-[#172023]">
          Future account actions
        </h2>
        <p className="mt-3 text-sm leading-6 text-[#394548]">
          Account export, deactivation, and deletion are not available yet.
          Those actions will need clear privacy and data-retention rules before
          they are added.
        </p>
      </section>
    </div>
  );
}

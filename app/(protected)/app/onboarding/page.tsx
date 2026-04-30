import { redirect } from "next/navigation";
import { completeOnboarding } from "@/app/(protected)/app/onboarding/actions";
import { onboardingChoices } from "@/lib/onboarding/app-onboarding";
import {
  ensureAccountProfileForOnboarding,
  getOnboardingStatus,
  onboardingIsDone,
} from "@/lib/onboarding/account-onboarding";
import { countryOptions } from "@/lib/location/country-location-defaults";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type OnboardingPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

type AccountProfileStarterRow = {
  display_name: string;
};

type SingerProfileStarterRow = {
  country_name: string | null;
  display_name: string;
  locality: string | null;
  postal_code_private: string | null;
};

export default async function OnboardingPage({
  searchParams,
}: OnboardingPageProps) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/sign-in?next=/app/onboarding");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in?next=/app/onboarding");
  }

  await ensureAccountProfileForOnboarding(supabase, {
    email: user.email,
    id: user.id,
  });

  const onboardingStatus = await getOnboardingStatus(supabase, user.id);

  if (onboardingIsDone(onboardingStatus)) {
    redirect("/app");
  }

  const { data: accountProfile } = await supabase
    .from("account_profiles")
    .select("display_name")
    .eq("user_id", user.id)
    .maybeSingle<AccountProfileStarterRow>();

  const { data: singerProfile } = await supabase
    .from("singer_profiles")
    .select("display_name, country_name, locality, postal_code_private")
    .eq("user_id", user.id)
    .maybeSingle<SingerProfileStarterRow>();

  const selectedCountry = singerProfile?.country_name ?? "United States";

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2f6f73]">
          First steps
        </p>
        <h1 className="mt-4 text-3xl font-bold text-[#172023]">
          Start with a little context
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[#394548]">
          This helps Quartet Member Finder use sensible location labels and
          distance defaults before asking what you want to do first.
        </p>
        <p className="mt-3 max-w-3xl text-base leading-7 text-[#394548]">
          You can use the app as a singer, in Quartet Mode, or both. The choice
          below is only your next step, not a permanent role.
        </p>
      </header>

      {params.error ? (
        <p
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          role="alert"
        >
          {params.error}
        </p>
      ) : null}

      <form action={completeOnboarding} className="space-y-8">
        <section className="space-y-4">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2f6f73]">
              Step 1
            </p>
            <h2 className="mt-2 text-2xl font-bold text-[#172023]">
              Basic profile context
            </h2>
            <p className="mt-2 text-base leading-7 text-[#394548]">
              Display name is required. Location fields are optional and
              approximate; exact locations are not shown publicly.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-sm font-semibold text-[#172023]">
                Display name <span className="text-[#8a3b12]">Required</span>
              </span>
              <input
                className="mt-2 w-full rounded-md border border-[#d7cec0] bg-white px-3 py-2 text-base text-[#172023] shadow-sm outline-none focus:border-[#2f6f73] focus:ring-2 focus:ring-[#2f6f73]/20"
                defaultValue={
                  singerProfile?.display_name ??
                  accountProfile?.display_name ??
                  ""
                }
                maxLength={120}
                name="displayName"
                required
              />
              <span className="mt-2 block text-sm leading-6 text-[#596466]">
                Use the name you want visible later if you turn on public
                discovery.
              </span>
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-[#172023]">
                Country
                <span className="font-normal text-[#596466]"> Optional</span>
              </span>
              <select
                className="mt-2 w-full rounded-md border border-[#d7cec0] bg-white px-3 py-2 text-base text-[#172023] shadow-sm outline-none focus:border-[#2f6f73] focus:ring-2 focus:ring-[#2f6f73]/20"
                defaultValue={selectedCountry}
                name="countryName"
              >
                {countryOptions.map((country) => (
                  <option key={country.name} value={country.name}>
                    {country.name}
                  </option>
                ))}
                {selectedCountry &&
                !countryOptions.some(
                  (country) => country.name === selectedCountry,
                ) ? (
                  <option value={selectedCountry}>{selectedCountry}</option>
                ) : null}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-[#172023]">
                City
                <span className="font-normal text-[#596466]"> Optional</span>
              </span>
              <input
                className="mt-2 w-full rounded-md border border-[#d7cec0] bg-white px-3 py-2 text-base text-[#172023] shadow-sm outline-none focus:border-[#2f6f73] focus:ring-2 focus:ring-[#2f6f73]/20"
                defaultValue={singerProfile?.locality ?? ""}
                maxLength={120}
                name="locality"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-[#172023]">
                ZIP/postal code
                <span className="font-normal text-[#596466]"> Optional</span>
              </span>
              <input
                className="mt-2 w-full rounded-md border border-[#d7cec0] bg-white px-3 py-2 text-base text-[#172023] shadow-sm outline-none focus:border-[#2f6f73] focus:ring-2 focus:ring-[#2f6f73]/20"
                defaultValue={singerProfile?.postal_code_private ?? ""}
                maxLength={40}
                name="postalCodePrivate"
              />
              <span className="mt-2 block text-sm leading-6 text-[#596466]">
                Your ZIP/postal code is used for future approximate matching and
                is not shown publicly.
              </span>
            </label>
          </div>
        </section>

        <section className="border-t border-[#d7cec0] pt-6">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2f6f73]">
              Step 2
            </p>
            <h2 className="mt-2 text-2xl font-bold text-[#172023]">
              What do you want to do first?
            </h2>
            <p className="mt-2 text-base leading-7 text-[#394548]">
              Pick the next page to open after setup. You can use every workflow
              later.
            </p>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {onboardingChoices.map((choice) => (
              <label
                className="flex cursor-pointer items-start gap-3 rounded-lg border border-[#d7cec0] bg-[#fffaf2] p-5 shadow-sm has-[:checked]:border-[#2f6f73] has-[:checked]:bg-white has-[:checked]:ring-2 has-[:checked]:ring-[#2f6f73]/30 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#2f6f73]"
                key={choice.id}
              >
                <input
                  className="mt-1 size-4 accent-[#174b4f]"
                  name="choice"
                  required
                  type="radio"
                  value={choice.id}
                />
                <span>
                  <span className="text-base font-bold text-[#172023]">
                    {choice.label}
                  </span>
                  <span className="mt-2 block text-sm leading-6 text-[#394548]">
                    {choice.description}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </section>

        <div className="flex flex-wrap gap-3 border-t border-[#d7cec0] pt-6">
          <button
            className="w-full rounded-md bg-[#174b4f] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#10393c] sm:w-fit"
            type="submit"
          >
            Save and continue
          </button>
        </div>
      </form>
    </div>
  );
}

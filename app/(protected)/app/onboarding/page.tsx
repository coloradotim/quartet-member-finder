import { redirect } from "next/navigation";
import {
  completeOnboarding,
  skipOnboarding,
} from "@/app/(protected)/app/onboarding/actions";
import { onboardingSections } from "@/lib/onboarding/app-onboarding";
import {
  ensureAccountProfileForOnboarding,
  getOnboardingStatus,
  onboardingIsDone,
} from "@/lib/onboarding/account-onboarding";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type OnboardingPageProps = {
  searchParams: Promise<{
    error?: string;
    next?: string;
  }>;
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

  const next = params.next?.startsWith("/") ? params.next : "/app";

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2f6f73]">
          First steps
        </p>
        <h1 className="mt-4 text-3xl font-bold text-[#172023]">
          What would you like to do first?
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[#394548]">
          You can use Quartet Member Finder as a singer, in Quartet Mode, or
          both. This only chooses a first step, not a permanent role.
        </p>
        <p className="mt-3 max-w-3xl text-base leading-7 text-[#394548]">
          Exact locations are not shown publicly, location fields are meant for
          singers outside the United States too, and first contact starts
          through the app.
        </p>
      </header>

      {params.error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {params.error}
        </p>
      ) : null}

      <form action={completeOnboarding} className="space-y-8">
        {onboardingSections.map((section) => (
          <section
            className="border-t border-[#d7cec0] pt-6 first:border-t-0 first:pt-0"
            key={section.heading}
          >
            <div className="max-w-3xl">
              <h2 className="text-2xl font-bold text-[#172023]">
                {section.heading}
              </h2>
              <p className="mt-2 text-base leading-7 text-[#394548]">
                {section.summary}
              </p>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {section.choices.map((choice) => (
                <label
                  className="block cursor-pointer rounded-lg border border-[#d7cec0] bg-[#fffaf2] p-5 shadow-sm has-[:checked]:border-[#2f6f73] has-[:checked]:ring-2 has-[:checked]:ring-[#2f6f73]/20"
                  key={choice.id}
                >
                  <input
                    className="sr-only"
                    name="choice"
                    required
                    type="radio"
                    value={choice.id}
                  />
                  <span className="text-base font-bold text-[#172023]">
                    {choice.label}
                  </span>
                  <span className="mt-2 block text-sm leading-6 text-[#394548]">
                    {choice.description}
                  </span>
                </label>
              ))}
            </div>
          </section>
        ))}

        <div className="flex flex-wrap gap-3 border-t border-[#d7cec0] pt-6">
          <button
            className="rounded-md bg-[#174b4f] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#10393c]"
            type="submit"
          >
            Continue
          </button>
        </div>
      </form>

      <form action={skipOnboarding}>
        <input name="next" type="hidden" value={next} />
        <button className="font-semibold text-[#2f6f73]" type="submit">
          Skip for now
        </button>
      </form>
    </div>
  );
}

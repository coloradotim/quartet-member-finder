import Link from "next/link";
import {
  quartetModeDashboardActions,
  singerDashboardActions,
  supportDashboardActions,
  type DashboardAction,
} from "@/lib/dashboard/app-dashboard";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function DashboardActionList({ actions }: { actions: DashboardAction[] }) {
  return (
    <div className="mt-5 grid gap-4 md:grid-cols-2">
      {actions.map((action) => (
        <Link
          className="rounded-lg border border-[#d7cec0] bg-[#fffaf2] p-5 shadow-sm hover:border-[#2f6f73]"
          href={action.href}
          key={`${action.label}-${action.href}`}
        >
          <span className="text-base font-bold text-[#172023]">
            {action.label}
          </span>
          <span className="mt-2 block text-sm leading-6 text-[#394548]">
            {action.description}
          </span>
        </Link>
      ))}
    </div>
  );
}

export default async function AppHomePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  return (
    <div className="space-y-10">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2f6f73]">
          Signed-in dashboard
        </p>
        <h1 className="mt-4 text-3xl font-bold text-[#172023]">
          What would you like to do
          {user?.email ? `, ${user.email}` : ""}?
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[#394548]">
          Use the app as a singer, as someone helping an incomplete quartet, or
          both. Singer profiles help others find you, quartet openings help you
          find groups looking for missing parts, and first contact starts
          through the app.
        </p>
        <p className="mt-3 max-w-3xl text-base leading-7 text-[#394548]">
          Discovery uses approximate locations so singers and quartets can judge
          practical distance without exposing exact home-location details.
        </p>
      </header>

      <section aria-labelledby="singer-dashboard-heading">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2f6f73]">
            As a singer
          </p>
          <h2
            className="mt-3 text-2xl font-bold text-[#172023]"
            id="singer-dashboard-heading"
          >
            Start with your singer workflow
          </h2>
          <p className="mt-3 text-base leading-7 text-[#394548]">
            Build a useful profile, look for quartet openings, connect with
            other singers, and use the map for privacy-minded regional
            discovery.
          </p>
        </div>
        <DashboardActionList actions={singerDashboardActions} />
      </section>

      <section
        aria-labelledby="quartet-mode-dashboard-heading"
        className="border-t border-[#d7cec0] pt-8"
      >
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2f6f73]">
            Quartet Mode
          </p>
          <h2
            className="mt-3 text-2xl font-bold text-[#172023]"
            id="quartet-mode-dashboard-heading"
          >
            Represent an incomplete quartet
          </h2>
          <p className="mt-3 text-base leading-7 text-[#394548]">
            Quartet Mode is for managing a quartet listing and finding singers
            who may fit the missing part. You can use it alongside your own
            singer profile.
          </p>
        </div>
        <DashboardActionList actions={quartetModeDashboardActions} />
      </section>

      <section
        aria-labelledby="support-dashboard-heading"
        className="border-t border-[#d7cec0] pt-8"
      >
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2f6f73]">
            Support
          </p>
          <h2
            className="mt-3 text-2xl font-bold text-[#172023]"
            id="support-dashboard-heading"
          >
            Help and privacy
          </h2>
        </div>
        <DashboardActionList actions={supportDashboardActions} />
      </section>
    </div>
  );
}

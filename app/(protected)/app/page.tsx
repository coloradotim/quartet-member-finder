import Link from "next/link";
import {
  quartetDashboardActions,
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
          You can maintain a singer profile, a quartet profile, or both. Each
          has its own visibility setting, so you control what appears in
          discovery without choosing a permanent role.
        </p>
        <p className="mt-3 max-w-3xl text-base leading-7 text-[#394548]">
          Discoverable means a profile can appear in Find results and
          approximate map discovery. Hidden means it stays out of discovery.
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
            My Singer Profile
          </h2>
          <p className="mt-3 text-base leading-7 text-[#394548]">
            This profile represents you personally as a singer. Make it
            discoverable if you want quartets or other singers to find you; hide
            it any time without affecting your quartet profile.
          </p>
        </div>
        <DashboardActionList actions={singerDashboardActions} />
      </section>

      <section
        aria-labelledby="quartet-profile-dashboard-heading"
        className="border-t border-[#d7cec0] pt-8"
      >
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2f6f73]">
            As a quartet representative
          </p>
          <h2
            className="mt-3 text-2xl font-bold text-[#172023]"
            id="quartet-profile-dashboard-heading"
          >
            My Quartet Profile
          </h2>
          <p className="mt-3 text-base leading-7 text-[#394548]">
            This profile represents a quartet or prospective quartet you
            represent. Make it discoverable when you are looking for one or more
            singers; hide it any time without affecting your singer profile.
          </p>
        </div>
        <DashboardActionList actions={quartetDashboardActions} />
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

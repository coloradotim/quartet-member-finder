import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AppHomePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2f6f73]">
        Signed-in workspace
      </p>
      <h1 className="mt-4 text-3xl font-bold text-[#172023]">
        Welcome{user?.email ? `, ${user.email}` : ""}
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-[#394548]">
        Manage your singer profile and quartet listings here. Public discovery
        stays separate from this signed-in management area.
      </p>
    </div>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/app/auth/actions";
import {
  signedInPrimaryNavigationLinks,
  signedInUtilityNavigationLinks,
} from "@/lib/navigation/signed-in-nav";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ProtectedAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center px-6 py-16">
        <h1 className="text-3xl font-bold text-[#172023]">
          Supabase Auth is not configured
        </h1>
        <p className="mt-4 text-base leading-7 text-[#394548]">
          Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to
          the environment before using protected app pages.
        </p>
        <Link className="mt-6 font-semibold text-[#2f6f73]" href="/">
          Back to public home
        </Link>
      </main>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in?next=/app");
  }

  return (
    <div>
      <header className="border-b border-[#d7cec0] bg-[#fffaf2]/90">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link
              className="w-fit rounded-sm text-lg font-bold text-[#172023]"
              href="/app"
            >
              Quartet Member Finder
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              {signedInUtilityNavigationLinks.map((link) => (
                <Link
                  className="inline-flex min-h-11 items-center rounded-md px-2 py-2 text-sm font-semibold text-[#394548] hover:bg-white/70 hover:text-[#174b4f]"
                  href={link.href}
                  key={link.href}
                >
                  {link.label}
                </Link>
              ))}
              <form action={signOut}>
                <button
                  className="w-fit rounded-md border border-[#d7cec0] px-3 py-2 text-sm font-semibold text-[#172023] hover:bg-white"
                  type="submit"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
          <nav
            aria-label="App navigation"
            className="grid gap-3 lg:grid-cols-[1fr_auto]"
          >
            <div
              className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap"
              aria-label="App tasks"
            >
              {signedInPrimaryNavigationLinks.map((link) => (
                <Link
                  className="inline-flex min-h-11 items-center justify-center rounded-md border border-[#d7cec0] bg-white/60 px-3 py-2 text-center text-sm font-semibold text-[#394548] hover:border-[#2f6f73] hover:text-[#174b4f]"
                  href={link.href}
                  key={link.href}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}

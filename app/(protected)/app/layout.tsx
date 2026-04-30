import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/app/auth/actions";
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
    <div className="min-h-screen">
      <header className="border-b border-[#d7cec0] bg-[#fffaf2]/90">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <Link className="text-lg font-bold text-[#172023]" href="/app">
            Quartet Member Finder
          </Link>
          <nav aria-label="App navigation" className="flex flex-wrap gap-3">
            <Link className="text-sm font-semibold text-[#394548]" href="/app">
              Home
            </Link>
            <Link
              className="text-sm font-semibold text-[#394548]"
              href="/app/profile"
            >
              Singer profile
            </Link>
            <Link
              className="text-sm font-semibold text-[#394548]"
              href="/app/listings"
            >
              Quartet listings
            </Link>
          </nav>
          <form action={signOut}>
            <button
              className="rounded-md border border-[#d7cec0] px-3 py-2 text-sm font-semibold text-[#172023] hover:bg-white"
              type="submit"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}

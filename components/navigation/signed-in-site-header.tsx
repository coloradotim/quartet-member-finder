import Link from "next/link";
import { signOut } from "@/app/auth/actions";
import { signedInNavigationLinks } from "@/lib/navigation/signed-in-nav";

export function SignedInSiteHeader() {
  return (
    <header className="border-b border-[#d7cec0] bg-[#fffaf2]/90">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            className="w-fit rounded-sm text-lg font-bold text-[#172023]"
            href="/app"
          >
            Quartet Member Finder
          </Link>
          <form action={signOut}>
            <button
              className="w-fit rounded-md border border-[#d7cec0] px-3 py-2 text-sm font-semibold text-[#172023] hover:bg-white"
              type="submit"
            >
              Sign out
            </button>
          </form>
        </div>
        <nav aria-label="App navigation">
          <div
            aria-label="App tasks"
            className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap"
          >
            {signedInNavigationLinks.map((link) => (
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
  );
}

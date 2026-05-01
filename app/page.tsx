import { PRODUCT_NAME, PRODUCT_PROMISE } from "@/lib/app-metadata";
import { PublicSiteHeader } from "@/components/navigation/public-site-header";
import Link from "next/link";

const audiencePaths = [
  "Singers looking for quartet openings",
  "Singers looking for other singers nearby",
  "Quartet representatives looking for missing parts",
];

const profilePaths = [
  {
    href: "/sign-in?next=%2Fapp%2Fprofile",
    label: "My Singer Profile",
    description:
      "Use this if you want to be found personally as a singer. You decide when it becomes discoverable.",
  },
  {
    href: "/sign-in?next=%2Fapp%2Flistings",
    label: "My Quartet Profile",
    description:
      "Use this if you represent a quartet or prospective quartet looking for one or more singers.",
  },
  {
    href: "/help",
    label: "Get oriented",
    description:
      "Read how optional profiles, independent visibility, and app-mediated contact work before signing in.",
  },
];

export default function Home() {
  return (
    <>
      <PublicSiteHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-col px-6 py-12 sm:py-16">
        <section className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2f6f73]">
              Barbershop quartet discovery
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-tight text-[#172023] sm:text-6xl">
              Find singers and quartet openings without making everything
              public.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#394548]">
              {PRODUCT_PROMISE}
            </p>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#394548]">
              {PRODUCT_NAME} is for practical introductions: create a singer
              profile with the parts you sing by voicing, create a quartet
              profile for an incomplete group, or use both without choosing a
              permanent role.
            </p>
            <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
              <Link
                className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#174b4f] px-5 py-3 text-center text-sm font-semibold text-white shadow-sm hover:bg-[#10393c]"
                href="/sign-in?next=%2Fapp%2Fonboarding"
              >
                Sign in to get started
              </Link>
              <Link
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-[#d7cec0] bg-[#fffaf2] px-5 py-3 text-center text-sm font-semibold text-[#172023] hover:bg-white"
                href="/help"
              >
                First time here? Read Help
              </Link>
            </div>
          </div>

          <aside
            aria-label="Who Quartet Member Finder is for"
            className="border-l-4 border-[#2f6f73] bg-[#fffaf2] px-5 py-5 shadow-sm"
          >
            <h2 className="text-lg font-bold text-[#172023]">Who it helps</h2>
            <ul className="mt-4 space-y-3 text-base leading-7 text-[#394548]">
              {audiencePaths.map((path) => (
                <li key={path}>{path}</li>
              ))}
            </ul>
          </aside>
        </section>

        <section className="mt-12 max-w-3xl border-t border-[#d7cec0] pt-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2f6f73]">
            Privacy first
          </p>
          <h2 className="mt-3 text-2xl font-bold text-[#172023]">
            Share enough to be found, not enough to feel exposed.
          </h2>
          <p className="mt-4 text-base leading-7 text-[#394548]">
            Sign in to search quartet openings and singers. Discovery stays
            behind sign-in, and results still use approximate locations. First
            contact happens through the app, and you decide whether to respond
            or share direct contact details.
          </p>
          <p className="mt-3 text-base leading-7 text-[#394548]">
            Help and privacy information are available before sign-in.
          </p>
        </section>

        <section
          aria-label="Profile paths"
          className="mt-12 border-t border-[#d7cec0] pt-8"
        >
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2f6f73]">
              Two optional profiles
            </p>
            <h2 className="mt-3 text-2xl font-bold text-[#172023]">
              Use either profile, or both.
            </h2>
            <p className="mt-4 text-base leading-7 text-[#394548]">
              Use My Singer Profile if you want to be found as a singer. Use My
              Quartet Profile if you represent a quartet looking for a missing
              part. Each profile has its own visibility setting, so filling one
              out does not force it into discovery.
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {profilePaths.map((link) => (
              <Link
                className="rounded-lg border border-[#d7cec0] bg-[#fffaf2] p-5 shadow-sm hover:bg-white"
                href={link.href}
                key={link.href}
              >
                <span className="block text-base font-bold leading-6 text-[#172023]">
                  {link.label}
                </span>
                <span className="mt-2 block text-sm leading-6 text-[#394548]">
                  {link.description}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

import { PRODUCT_NAME, PRODUCT_PROMISE } from "@/lib/app-metadata";
import { PublicSiteHeader } from "@/components/navigation/public-site-header";
import Link from "next/link";

const discoveryPaths = [
  "Find Quartet Openings from groups looking for missing parts",
  "Find Singers for a quartet, pickup group, or local singing circle",
  "Start with app-mediated contact before sharing direct details",
];

export default function Home() {
  return (
    <>
      <PublicSiteHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-col px-6 py-14">
        <section className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2f6f73]">
            Barbershop quartet discovery
          </p>
          <h1 className="mt-5 text-4xl font-bold leading-tight text-[#172023] sm:text-6xl">
            {PRODUCT_NAME}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#394548]">
            {PRODUCT_PROMISE}
          </p>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#394548]">
            Start as a singer looking for quartet openings, or use Find Singers
            when you are helping an incomplete quartet fill a part.
          </p>
          <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#174b4f] px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-[#10393c]"
              href="/quartets"
            >
              Find Quartet Openings
            </Link>
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-[#d7cec0] px-4 py-2.5 text-center text-sm font-semibold text-[#172023] hover:bg-[#fffaf2]"
              href="/singers"
            >
              Find Singers
            </Link>
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-[#d7cec0] px-4 py-2.5 text-center text-sm font-semibold text-[#172023] hover:bg-[#fffaf2]"
              href="/map"
            >
              View Map
            </Link>
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-[#d7cec0] px-4 py-2.5 text-center text-sm font-semibold text-[#172023] hover:bg-[#fffaf2]"
              href="/sign-in?next=%2Fapp%2Fprofile"
            >
              My Singer Profile
            </Link>
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-[#d7cec0] px-4 py-2.5 text-center text-sm font-semibold text-[#172023] hover:bg-[#fffaf2]"
              href="/sign-in?next=%2Fapp%2Flistings"
            >
              Quartet Mode
            </Link>
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-[#d7cec0] px-4 py-2.5 text-center text-sm font-semibold text-[#172023] hover:bg-[#fffaf2]"
              href="/help"
            >
              Help
            </Link>
          </div>
        </section>

        <section
          aria-label="Initial product scope"
          className="mt-12 grid gap-4 sm:grid-cols-3"
        >
          {discoveryPaths.map((path) => (
            <div
              className="rounded-lg border border-[#d7cec0] bg-[#fffaf2] p-5 shadow-sm"
              key={path}
            >
              <p className="text-base font-semibold leading-6">{path}</p>
            </div>
          ))}
        </section>
      </main>
    </>
  );
}

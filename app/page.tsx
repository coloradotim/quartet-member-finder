import { PRODUCT_NAME, PRODUCT_PROMISE } from "@/lib/app-metadata";
import Link from "next/link";

const discoveryPaths = [
  "Singer profiles for quartet opportunities",
  "Quartet listings for missing parts",
  "App-mediated introductions before direct contact",
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-6 py-16">
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
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            className="rounded-md bg-[#174b4f] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#10393c]"
            href="/sign-in"
          >
            Sign in
          </Link>
          <Link
            className="rounded-md border border-[#d7cec0] px-4 py-2.5 text-sm font-semibold text-[#172023] hover:bg-[#fffaf2]"
            href="/app"
          >
            Manage profile
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
  );
}

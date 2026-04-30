import Link from "next/link";
import { publicHelpSections } from "@/lib/content/public-pages";

export default function HelpPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-6 py-12">
      <nav aria-label="Public navigation" className="flex flex-wrap gap-4">
        <Link className="font-semibold text-[#2f6f73]" href="/">
          Home
        </Link>
        <Link className="font-semibold text-[#2f6f73]" href="/singers">
          Singers
        </Link>
        <Link className="font-semibold text-[#2f6f73]" href="/quartets">
          Quartets
        </Link>
        <Link className="font-semibold text-[#2f6f73]" href="/privacy">
          Privacy
        </Link>
      </nav>

      <header className="mt-10">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2f6f73]">
          Help
        </p>
        <h1 className="mt-4 text-4xl font-bold text-[#172023]">
          How Quartet Member Finder Works
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-[#394548]">
          A practical guide for singers and quartets using the app before,
          during, and after first contact.
        </p>
      </header>

      <section className="mt-10 grid gap-5">
        {publicHelpSections.map((section) => (
          <article
            className="rounded-lg border border-[#d7cec0] bg-[#fffaf2] p-5"
            key={section.heading}
          >
            <h2 className="text-xl font-bold text-[#172023]">
              {section.heading}
            </h2>
            <div className="mt-3 space-y-3 text-base leading-7 text-[#394548]">
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </article>
        ))}
      </section>

      <footer className="mt-10 flex flex-wrap gap-4 border-t border-[#d7cec0] pt-6">
        <Link className="font-semibold text-[#2f6f73]" href="/privacy">
          Read the privacy overview
        </Link>
        <Link className="font-semibold text-[#2f6f73]" href="/sign-in">
          Sign in
        </Link>
      </footer>
    </main>
  );
}

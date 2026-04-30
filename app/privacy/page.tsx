import { PublicSiteHeader } from "@/components/navigation/public-site-header";
import { publicPrivacySections } from "@/lib/content/public-pages";

export default function PrivacyPage() {
  return (
    <>
      <PublicSiteHeader />
      <main className="mx-auto w-full max-w-4xl px-6 py-12">
        <header>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2f6f73]">
            Privacy
          </p>
          <h1 className="mt-4 text-4xl font-bold text-[#172023]">
            Privacy Overview
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-[#394548]">
            How Quartet Member Finder keeps public discovery useful without
            exposing private contact details or exact home-location information.
          </p>
        </header>

        <section className="mt-10 grid gap-5">
          {publicPrivacySections.map((section) => (
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
      </main>
    </>
  );
}

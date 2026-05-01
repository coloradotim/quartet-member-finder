import Link from "next/link";
import { HelpFeedbackForm } from "@/components/feedback/help-feedback-form";
import { PublicSiteHeader } from "@/components/navigation/public-site-header";
import { publicHelpSections } from "@/lib/content/public-pages";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type HelpPageProps = {
  searchParams: Promise<{
    feedback?: string;
  }>;
};

export default async function HelpPage({ searchParams }: HelpPageProps) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  return (
    <>
      <PublicSiteHeader />
      <main className="mx-auto w-full max-w-4xl px-6 py-12">
        <header>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2f6f73]">
            Help
          </p>
          <h1 className="mt-4 text-4xl font-bold text-[#172023]">
            How Quartet Member Finder Works
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-[#394548]">
            A practical guide for getting oriented, creating optional profiles,
            searching with Find, and using Messages without exposing private
            contact details by default.
          </p>
        </header>

        <nav
          aria-label="On this page"
          className="mt-10 rounded-lg border border-[#d7cec0] bg-[#fffaf2] p-5"
        >
          <h2 className="text-xl font-bold text-[#172023]">On this page</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {publicHelpSections.map((section) => (
              <a
                className="rounded-md px-3 py-2 text-sm font-semibold text-[#2f6f73] hover:bg-white"
                href={`#${section.id}`}
                key={section.id}
              >
                {section.title}
              </a>
            ))}
            <a
              className="rounded-md px-3 py-2 text-sm font-semibold text-[#2f6f73] hover:bg-white"
              href="#feedback"
            >
              Send Feedback
            </a>
          </div>
        </nav>

        <section className="mt-10 space-y-10">
          {publicHelpSections.map((section) => (
            <section
              className="scroll-mt-6 border-t border-[#d7cec0] pt-8"
              id={section.id}
              key={section.id}
            >
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2f6f73]">
                {section.eyebrow}
              </p>
              <h2 className="mt-3 text-3xl font-bold text-[#172023]">
                {section.title}
              </h2>
              <p className="mt-3 max-w-3xl text-base leading-7 text-[#394548]">
                {section.intro}
              </p>

              <div className="mt-6 grid gap-4">
                {section.topics.map((topic) => (
                  <article
                    className="rounded-lg border border-[#d7cec0] bg-[#fffaf2] p-5"
                    key={topic.title}
                  >
                    <h3 className="text-xl font-bold text-[#172023]">
                      {topic.title}
                    </h3>
                    <div className="mt-3 space-y-3 text-base leading-7 text-[#394548]">
                      {topic.body.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                    {topic.bullets ? (
                      <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-[#394548]">
                        {topic.bullets.map((bullet) => (
                          <li key={bullet}>{bullet}</li>
                        ))}
                      </ul>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>
          ))}
        </section>

        {user ? (
          <HelpFeedbackForm status={params.feedback} />
        ) : (
          <section
            className="mt-10 border-t border-[#d7cec0] pt-8"
            id="feedback"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2f6f73]">
              Feedback
            </p>
            <h2 className="mt-3 text-2xl font-bold text-[#172023]">
              Send feedback after signing in
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[#394548]">
              Sign in if you want to send private feedback, bug reports, or
              suggestions. Keeping feedback tied to an account helps prevent
              spam and gives the project team a way to follow up.
            </p>
            <Link
              className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-md bg-[#174b4f] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#10393c] sm:w-fit"
              href="/sign-in?next=%2Fhelp"
            >
              Sign in to send feedback
            </Link>
          </section>
        )}
      </main>
    </>
  );
}

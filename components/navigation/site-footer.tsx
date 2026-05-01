import Link from "next/link";
import { siteFooterLinks } from "@/lib/navigation/site-navigation";

export function SiteFooter() {
  return (
    <footer className="border-t border-[#d7cec0] bg-[#fffaf2]/70">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-center gap-3 px-6 py-5 text-center sm:flex-row sm:gap-4">
        <p className="text-sm text-[#596466]">© 2026 Quartet Member Finder</p>
        <nav
          aria-label="Site resources"
          className="flex flex-wrap items-center justify-center gap-y-2 text-sm"
        >
          <ul className="flex flex-wrap items-center justify-center gap-y-2">
            {siteFooterLinks.map((link) => (
              <li
                className="border-[#d7cec0] px-3 sm:border-l sm:first:border-l-0"
                key={link.href}
              >
                <Link
                  className="font-semibold text-[#2f6f73] hover:text-[#174b4f]"
                  href={link.href}
                  rel={
                    link.href.startsWith("https://") ? "noreferrer" : undefined
                  }
                  target={
                    link.href.startsWith("https://") ? "_blank" : undefined
                  }
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}

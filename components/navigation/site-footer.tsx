import Link from "next/link";
import { siteFooterLinks } from "@/lib/navigation/site-navigation";

export function SiteFooter() {
  return (
    <footer className="border-t border-[#d7cec0] bg-[#fffaf2]/70">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#596466]">
          Quartet Member Finder helps singers and quartets connect with privacy
          in mind.
        </p>
        <nav
          aria-label="Site resources"
          className="flex flex-wrap gap-x-4 gap-y-2 text-sm"
        >
          {siteFooterLinks.map((link) => (
            <Link
              className="font-semibold text-[#2f6f73] hover:text-[#174b4f]"
              href={link.href}
              key={link.href}
              rel={link.href.startsWith("https://") ? "noreferrer" : undefined}
              target={link.href.startsWith("https://") ? "_blank" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}

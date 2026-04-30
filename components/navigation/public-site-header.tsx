import Link from "next/link";
import { publicNavigationLinks } from "@/lib/navigation/site-navigation";

type PublicSiteHeaderProps = {
  className?: string;
};

export function PublicSiteHeader({ className = "" }: PublicSiteHeaderProps) {
  return (
    <header className={`mx-auto w-full max-w-6xl px-6 pt-6 ${className}`}>
      <div className="flex flex-col gap-4 border-b border-[#d7cec0] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <Link className="text-base font-bold text-[#172023]" href="/">
          Quartet Member Finder
        </Link>
        <nav
          aria-label="Public navigation"
          className="flex flex-wrap gap-x-4 gap-y-2 text-sm"
        >
          {publicNavigationLinks.map((link) => (
            <Link
              className="font-semibold text-[#2f6f73] hover:text-[#174b4f]"
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

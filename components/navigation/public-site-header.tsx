import Link from "next/link";
import { publicNavigationLinks } from "@/lib/navigation/site-navigation";

type PublicSiteHeaderProps = {
  className?: string;
};

export function PublicSiteHeader({ className = "" }: PublicSiteHeaderProps) {
  return (
    <header className={`mx-auto w-full max-w-6xl px-6 pt-6 ${className}`}>
      <div className="flex flex-col gap-4 border-b border-[#d7cec0] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          className="w-fit rounded-sm text-base font-bold text-[#172023]"
          href="/"
        >
          Quartet Member Finder
        </Link>
        <nav
          aria-label="Public navigation"
          className="grid grid-cols-2 gap-2 text-sm min-[420px]:flex min-[420px]:flex-wrap"
        >
          {publicNavigationLinks.map((link) => (
            <Link
              className="inline-flex min-h-11 items-center rounded-md px-2 py-2 font-semibold text-[#2f6f73] hover:bg-white/70 hover:text-[#174b4f]"
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

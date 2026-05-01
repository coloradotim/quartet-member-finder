import Link from "next/link";

export const discoveryModes = [
  {
    description: "For singers looking for groups that need your part.",
    href: "/quartets",
    id: "quartets",
    label: "Quartet openings",
  },
  {
    description: "For quartet representatives and singers looking nearby.",
    href: "/singers",
    id: "singers",
    label: "Singers",
  },
] as const;

type DiscoveryMode = (typeof discoveryModes)[number]["id"] | "overview";

type DiscoveryModeNavProps = {
  activeMode: DiscoveryMode;
};

export function DiscoveryModeNav({ activeMode }: DiscoveryModeNavProps) {
  return (
    <nav
      aria-label="Discovery modes"
      className="mt-8 grid gap-3 rounded-lg border border-[#d7cec0] bg-[#fffaf2] p-3 sm:grid-cols-4"
    >
      <Link
        className={`rounded-md px-3 py-3 text-sm font-semibold ${
          activeMode === "overview"
            ? "bg-[#174b4f] text-white"
            : "text-[#2f6f73] hover:bg-white"
        }`}
        href="/find"
      >
        Find overview
      </Link>
      {discoveryModes.map((mode) => (
        <Link
          className={`rounded-md px-3 py-3 text-sm font-semibold ${
            activeMode === mode.id
              ? "bg-[#174b4f] text-white"
              : "text-[#2f6f73] hover:bg-white"
          }`}
          href={mode.href}
          key={mode.href}
        >
          <span className="block">{mode.label}</span>
          <span className="mt-1 block text-xs font-normal leading-5 opacity-90">
            {mode.description}
          </span>
        </Link>
      ))}
    </nav>
  );
}

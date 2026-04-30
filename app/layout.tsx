import type { Metadata } from "next";
import { SiteFooter } from "@/components/navigation/site-footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quartet Member Finder",
  description:
    "A privacy-minded way for barbershop singers and incomplete quartets to find each other.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col">
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}

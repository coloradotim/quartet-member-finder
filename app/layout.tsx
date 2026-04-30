import type { Metadata } from "next";
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
      <body>{children}</body>
    </html>
  );
}

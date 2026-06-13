import type { Metadata } from "next";
import { Geist, Fraunces } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "The Guud Network — Find women's health practitioners you can trust",
  description:
    "A trust-first, open platform to discover women's health practitioners that other women actually recommend. Describe what you're going through and find help you can trust.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-ink">
        <header className="sticky top-0 z-30 border-b border-line/70 bg-cream/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
            <Link href="/" className="group flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-plum text-cream font-display text-lg leading-none">
                g
              </span>
              <span className="font-display text-xl font-medium tracking-tight">
                The Guud Network
              </span>
            </Link>
            <nav className="flex items-center gap-1 text-sm">
              <Link
                href="/discover"
                className="rounded-full px-3.5 py-2 text-muted transition hover:bg-blush hover:text-plum"
              >
                Browse topics
              </Link>
              <Link
                href="/practitioners/new"
                className="rounded-full px-3.5 py-2 text-muted transition hover:bg-blush hover:text-plum"
              >
                Recommend someone
              </Link>
              <a
                href="https://github.com/jeanjack84/guud-network"
                target="_blank"
                rel="noreferrer"
                className="ml-1 rounded-full border border-line px-3.5 py-2 text-ink transition hover:border-plum hover:text-plum"
              >
                Open source
              </a>
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="mt-24 border-t border-line bg-surface/60">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-10 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
            <p>
              <span className="font-display text-base text-ink">
                The Guud Network
              </span>{" "}
              — built by Guud, free and open for everyone.
            </p>
            <p>
              Trust-first women&apos;s health. Not medical advice. In an
              emergency, contact your local emergency number.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "The Guud Network — Find women's health practitioners you can trust",
    template: "%s | The Guud Network",
  },
  description:
    "A trust-first, open platform to discover women's health practitioners that other women actually recommend. Describe what you're going through and find help you can trust.",
  openGraph: {
    siteName: SITE_NAME,
    type: "website",
    url: SITE_URL,
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-cream text-ink">
        <header className="sticky top-0 z-30 border-b border-line/70 bg-cream/80 backdrop-blur">
          <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-5 py-4">
            <Link href="/" className="group flex items-center gap-2.5 justify-self-start">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-plum text-cream font-display text-lg leading-none">
                g
              </span>
              <span className="font-display text-xl font-medium tracking-tight text-heading">
                The Guud Network
              </span>
            </Link>
            <nav className="hidden items-center gap-1 text-sm sm:flex sm:justify-self-center">
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
            </nav>
            <div className="flex items-center gap-2 justify-self-end">
              <Link
                href="/practitioners/new"
                className="rounded-full bg-plum px-4 py-2 text-sm font-medium text-cream transition hover:bg-plum-dark sm:hidden"
              >
                Recommend
              </Link>
              <a
                href="https://github.com/jeanjack84/guud-network"
                target="_blank"
                rel="noreferrer"
                className="hidden rounded-full border border-line px-3.5 py-2 text-ink transition hover:border-plum hover:text-plum sm:inline-block"
              >
                Open source
              </a>
            </div>
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

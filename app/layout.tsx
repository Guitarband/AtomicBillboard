import type { Metadata } from "next";
import Link from "next/link";
import { Attribution } from "./attribution";
import { SiteHeader } from "./site-header";
import "./style.css";

export const metadata: Metadata = {
  title: "Atomic Billboard",
  applicationName: "Atomic Billboard",
  description: "Explore how roles break down into tasks and how organisations put technology to work.",
  icons: { icon: "/atomic-mark.svg" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>
    <Attribution />
    <SiteHeader />
    {children}
    <footer className="site-footer"><div className="site-footer-inner">
      <Link className="footer-brand" href="/">Atomic Billboard</Link>
      <Link href="/privacy">Privacy and tracking</Link>
    </div></footer>
  </body></html>;
}

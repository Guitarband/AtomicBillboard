"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const sections = [
  { href: "/", label: "Explore roles" },
  { href: "/cases", label: "Case studies" },
  { href: "/workspace", label: "Workspace" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return <header className="site-header"><div className="site-header-inner">
    <Link className="site-brand" href="/" aria-label="Atomic Studies home">
      <span aria-hidden="true" className="site-mark" />
      Atomic Studies
    </Link>
    <nav className="site-nav" aria-label="Main navigation">
      {sections.map(({ href, label }) => {
        const current = pathname === href ? "page" : pathname.startsWith(href + "/") ? "location" : undefined;
        return <Link key={href} href={href} aria-current={current}>{label}</Link>;
      })}
    </nav>
    <Link className="site-account" href="/account" aria-current={pathname === "/account" ? "page" : undefined}>Sign in</Link>
  </div></header>;
}

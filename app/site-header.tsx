"use client";

import Link from "next/link";
import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const sections = [
  { href: "/", label: "Dashboard" },
  { href: "/?explore=1", label: "Roles & departments" },
  { href: "/cases", label: "Case studies" },
  { href: "/workspace", label: "Workspace" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return <header className="site-header"><div className="site-header-inner">
    <Link className="site-brand" href="/" aria-label="Atomic Billboard home">
      <span aria-hidden="true" className="site-mark" />
      Atomic Billboard
    </Link>
    <nav className="site-nav" aria-label="Main navigation">
      <Suspense fallback={<SectionLinks pathname={pathname}/> }><CurrentSectionLinks/></Suspense>
    </nav>
    <Link className="site-account" href="/account" aria-current={pathname === "/account" ? "page" : undefined}>Sign in</Link>
  </div></header>;
}

function CurrentSectionLinks() {
  const pathname = usePathname();
  const params = useSearchParams();
  const explorer = pathname === "/compare" || pathname === "/tasks" ||
    (pathname === "/" && ["sector", "domain", "role", "sample", "explore"].some(key => params.has(key)));
  return <SectionLinks pathname={pathname} explorer={explorer}/>;
}

function SectionLinks({ pathname, explorer = false }: { pathname: string; explorer?: boolean }) {
  return sections.map(({ href, label }) => {
    const current = explorer ? (href === "/?explore=1" ? "location" : undefined)
      : pathname === href ? "page" : pathname.startsWith(href + "/") ? "location" : undefined;
    return <Link key={href} href={href} aria-current={current}>{label}</Link>;
  });
}

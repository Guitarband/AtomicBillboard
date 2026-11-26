"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Destination = { id: string; label: string; href: string };
const paths: Record<string, string> = {
  dashboard: "M3 3h8v8H3z M14 3h7v5h-7z M3 14h8v7H3z M14 11h7v10h-7z",
  scores: "M4 20V5 M4 20h17 M8 17v-5 M13 17V7 M18 17V4",
  impact: "M3 16l5-6 5 3 7-9 M15 4h5v5 M3 20h18",
  planner: "M6 5h13v16H6z M9 3h7v4H9z M9 11h7 M9 15h5",
  reuse: "M3 4h7v6H3z M14 14h7v6h-7z M10 7h7v4 M14 17H7v-4",
  pay: "M3 8h18v11H3z M6 5h13 M10 13.5a2 2 0 1 0 4 0a2 2 0 1 0-4 0",
  collapse: "M3 4h18v16H3z M9 4v16 M16 9l-3 3 3 3",
};

function Icon({ name }: { name: string }) {
  return <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round"><path d={paths[name]}/></svg>;
}

export function ToolDirectory({ links, current }: { links: Destination[]; current: string }) {
  const [compact, setCompact] = useState(false);
  const preference = "atomic-billboard.compact-tools";
  useEffect(() => {
    try { setCompact(localStorage.getItem(preference) === "1"); } catch { /* Optional device preference. */ }
  }, []);
  const toggle = () => {
    setCompact(!compact);
    try { localStorage.setItem(preference, compact ? "0" : "1"); } catch { /* The control still works for this visit. */ }
  };
  const navigation = <nav aria-label="Research tools" className="tool-links">
    <Link href="/" title="Research dashboard"><Icon name="dashboard"/><span>Research dashboard</span></Link>
    {links.map(({ id, href, label }) => <Link key={id} href={href} prefetch={false} title={label}
      aria-current={current === id ? "page" : undefined}><Icon name={id}/><span>{label}</span></Link>)}
  </nav>;
  return <aside className="tool-directory" data-compact={compact}>
    <div className="desktop-directory"><header><strong>Research tools</strong>
      <button type="button" onClick={toggle} aria-expanded={!compact}
        aria-label={compact ? "Expand sidebar" : "Collapse sidebar"} title={compact ? "Expand sidebar" : "Collapse sidebar"}><Icon name="collapse"/></button></header>{navigation}</div>
    <details key={current} className="mobile-directory"><summary>Switch research tool</summary>{navigation}</details>
  </aside>;
}

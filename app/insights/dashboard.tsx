import { Suspense } from "react";
import { LeadingDepartments } from "./coverage";
import Link from "next/link";
import { ShortlistLink } from "../shortlist/controls";
import { toolsIndex } from "../../lib/intelligence/model";
import { IllustratedChoice } from "../tasks/catalogue-choices";
import { TopicDesk } from "./topic-desk";
import "./intelligence.css";

export function Dashboard() {
  return <main className="intel home-index">
    <header className="home-title"><h1>Research dashboard</h1>
      <nav aria-label="Catalogue shortcuts"><ShortlistLink/></nav>
    </header>
    <div className="catalogue-entry"><IllustratedChoice title="Explore roles and departments" href="/?explore=1" illustration="Banking operations" description="Choose an industry, find a department and open a role’s task map."/></div>
    <div className="dashboard-desk"><TopicDesk/>
      <section className="research-tools"><h2>Research tools</h2>
        {toolsIndex.map(([id, name, desc]) => <Link prefetch={false} key={id} href={"/insights/" + id}>
          <strong>{name}</strong><span>{desc}</span><i aria-hidden="true">↗</i>
        </Link>)}
      </section>
    </div>
    <Suspense fallback={<p role="status">Loading leading departments…</p>}><LeadingDepartments/></Suspense>
  </main>;
}

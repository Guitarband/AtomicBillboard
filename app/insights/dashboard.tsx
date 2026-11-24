import Link from "next/link";
import { IndustryArt } from "../tasks/industry-art";
import { topics, toolsIndex } from "../../lib/intelligence/model";
import "./intelligence.css";

export function Dashboard() {
  return (
    <main className="intel home-index">
      <header className="home-title">
        <h1>Research dashboard</h1>
        <Link prefetch={false} href="/?explore=1">
          Explore industries →
        </Link>
      </header>
      <section className="topic-board" aria-labelledby="topics-title">
        <div className="topic-list">
          <h2 id="topics-title">Suggested explorations</h2>
          {topics.slice(0, 3).map((t) => (
            <Link
              prefetch={false}
              key={t.title}
              href={"/insights/planner?q=" + encodeURIComponent(t.title)}
            >
              {t.title}
              <span aria-hidden="true">↗</span>
            </Link>
          ))}
        </div>
        <Link prefetch={false} className="featured" href="/insights/scores">
          <IndustryArt name="Banking operations" active={true} />
          <div>
            <strong>Where can AI assist?</strong>
            <span>Explore role scores →</span>
          </div>
        </Link>
      </section>
      <section className="research-tools">
        <h2>Research tools</h2>
        {toolsIndex.map(([id, name, desc]) => (
          <Link prefetch={false} key={id} href={"/insights/" + id}>
            <strong>{name}</strong>
            <span>{desc}</span>
            <i aria-hidden="true">↗</i>
          </Link>
        ))}
      </section>
    </main>
  );
}

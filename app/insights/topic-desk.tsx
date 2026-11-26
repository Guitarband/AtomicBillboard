"use client";

import Link from "next/link";
import { useState } from "react";
import { topics } from "../../lib/intelligence/model";
import { IndustryArt } from "../tasks/industry-art";

export function TopicDesk() {
  const [index, setIndex] = useState(0);
  const topic = topics[index];
  return <section className="topic-desk" aria-labelledby="topics-title">
    <h2 id="topics-title">Suggested explorations</h2>
    <div className="topic-controls" role="group" aria-label="Choose a research topic">
      {topics.slice(0, 3).map((item, i) => <button type="button" key={item.title}
        aria-controls="topic-preview" aria-pressed={index === i} onClick={() => setIndex(i)}>{item.title}</button>)}
    </div>
    <div className="topic-preview" id="topic-preview" aria-live="polite">
      <div className="topic-illustration" aria-hidden="true"><IndustryArt name="Banking operations" active={false}/></div>
      <dl><div><dt>Measure of success</dt><dd>{topic.kpi}</dd></div>
        <div><dt>Review control</dt><dd>{topic.check}</dd></div></dl>
      <Link className="topic-open" href={"/insights/planner?q=" + encodeURIComponent(topic.title)}>Explore this workflow →</Link>
    </div>
  </section>;
}

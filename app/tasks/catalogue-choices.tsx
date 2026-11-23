"use client";

import Link, { useLinkStatus } from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Choice } from "../../lib/catalogue/browse";
import { IndustryArt } from "./industry-art";

// App Router can remount the page on query changes. Carry focus across those
// transitions while leaving the initial document's ordinary tab order intact.
let previousStep: string | undefined;
export function StepFrame({ signature, children }: { signature: string; children: ReactNode }) {
  const frame = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const title = frame.current?.querySelector<HTMLElement>("h1");
    if (title && previousStep && signature !== previousStep) {
      title.focus({ preventScroll: true });
      if (title.getBoundingClientRect().top < 0) title.scrollIntoView({ block: "start" });
    }
    previousStep = signature;
  }, [signature]);
  return <div ref={frame} key={signature} className="decision-frame">{children}</div>;
}

function ChoiceArrow() {
  const { pending } = useLinkStatus();
  return <span className={`choice-arrow${pending ? " opening" : ""}`} aria-hidden="true">{pending ? "…" : "→"}</span>;
}

type Option = Choice & { href: string };

function IndustryOption({ option }: { option: Option }) {
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  return <Link href={option.href} prefetch={false} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
    onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}>
    <IndustryArt name={option.title} active={hover || focus} />
    <span className="industry-caption"><strong>{option.title}</strong><ChoiceArrow /></span>
  </Link>;
}

export function CatalogueChoices({ options, step }: { options: Option[]; step: number }) {
  const [filter, setFilter] = useState("");
  const query = filter.trim().toLowerCase();
  const titleCounts = new Map<string, number>();
  for (const item of options) titleCounts.set(item.title, (titleCounts.get(item.title) ?? 0) + 1);
  const visible = options.filter(item => !query || [item.title, item.family, item.detail].some(field => field?.toLowerCase().includes(query)));
  const noun = step === 1 ? (visible.length === 1 ? "industry" : "industries") : step === 2 ? (visible.length === 1 ? "department" : "departments") : (visible.length === 1 ? "role" : "roles");
  return <section className="choices-section" aria-labelledby="decision-title">
    <div className="choices-toolbar">
      <span className="choice-count" role="status">{visible.length} {noun}</span>
      {step === 3 && options.length > 1 && <label className="role-filter">
        <span className="visually-hidden">Find a role by title, family, grade or ID</span>
        <input type="search" placeholder="Search by title, family, grade or ID" value={filter} onChange={event => setFilter(event.target.value)} aria-controls="catalogue-choices" />
      </label>}
    </div>
    <ul id="catalogue-choices" className={step === 1 ? "industry-choices" : "directory-choices"}>{visible.map(choice =>
      <li key={choice.value}>{step === 1 ? <IndustryOption option={choice} /> :
        <Link href={choice.href} prefetch={false}>
          <span className="choice-copy"><strong>{choice.title}</strong>{choice.description && <span>{choice.description}</span>}</span>
          <span className="choice-meta">{step === 3
            ? [choice.family, choice.grade, titleCounts.get(choice.title)! > 1 && choice.value].filter(Boolean).join(" · ")
            : choice.detail}</span>
          <ChoiceArrow />
        </Link>}
      </li>
    )}</ul>
    {!visible.length && <p className="no-matches">No roles match “{filter}”. <button type="button" className="link" onClick={() => setFilter("")}>Clear search</button></p>}
  </section>;
}

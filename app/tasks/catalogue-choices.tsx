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

function groupChoices(items: Option[], keyFor: (item: Option) => string) {
  const groups = new Map<string, Option[]>();
  for (const item of items) {
    const key = keyFor(item);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(item);
  }
  return [...groups].sort(([a], [b]) => a.localeCompare(b));
}

export function CatalogueChoices({ options, step, sector }: { options: Option[]; step: number; sector?: string }) {
  const [filter, setFilter] = useState("");
  const [limit, setLimit] = useState(8);
  const query = filter.trim().toLowerCase();
  const visible = options.filter(item => [item.title, item.family, item.detail, item.value].some(field => field?.toLowerCase().includes(query)));
  if (step === 1) return <section className="choices-section" aria-labelledby="decision-title">
    <div className="choices-toolbar"><span className="choice-count">{options.length} industries</span></div>
    <ul id="catalogue-choices" className="industry-choices">{options.map(option =>
      <li key={option.value}><IndustryOption option={option}/></li>)}</ul>
  </section>;
  const departments = step === 2;
  const groups = groupChoices(visible, item => departments ? item.title.slice(0, 1).toUpperCase() : item.family || item.title);
  const noun = departments ? "department" : "role profile";
  const directory = <div className="catalogue-directory">
    <div className="choices-toolbar">
      <span className="choice-count" role="status">{visible.length} {noun}{visible.length !== 1 && "s"}</span>
      {options.length > 1 && <label className="role-filter">
        <span className="visually-hidden">{departments ? "Find a department" : "Find a role by title, family, grade or ID"}</span>
        <input type="search" placeholder={departments ? "Find a department" : "Search by title, family, grade or ID"} value={filter}
          onChange={event => {setFilter(event.target.value); setLimit(8)}} aria-controls="catalogue-choices"/>
      </label>}
    </div>
    <div id="catalogue-choices">{(departments ? groups : groups.slice(0,limit)).map(([key,items]) => departments ?
      <div className="department-letter" key={key}><span aria-hidden="true">{key}</span><ul>{items.map(item =>
        <li key={item.value}><Link href={item.href} prefetch={false}><strong>{item.title}</strong><small>{item.detail}</small></Link></li>)}</ul></div> :
      <details className="family-entry" key={key} name="role-families"><summary>{key}<small>{items.length} {items.length === 1 ? "profile" : "profiles"}</small></summary>
        <ul>{items.map(item => <li key={item.value}><Link href={item.href} prefetch={false}><strong>{item.title}</strong>
          <small>{[item.grade && "Grade " + item.grade, item.value].filter(Boolean).join(" · ")}</small></Link>
          {item.description && <p>{item.description}</p>}</li>)}</ul></details>)}</div>
    {!departments && groups.length > limit && <button className="link directory-more" onClick={()=>setLimit(limit+8)}>Show more role families ({groups.length-limit} remaining)</button>}
    {!visible.length && <p>No matching {noun}s. <button className="link" onClick={()=>setFilter("")}>Clear search</button></p>}
  </div>;
  return <section className="choices-section" aria-labelledby="decision-title">{departments ?
    <div className="department-spread"><aside><IndustryArt name={sector || ""} active={false}/><strong>{sector}</strong></aside>{directory}</div> : directory}</section>;
}

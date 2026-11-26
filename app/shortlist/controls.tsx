"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { resolveShortlist } from "./resolve";

const key = "atomic-billboard.shortlist.v1";
function subscribe(notify: () => void) {
  window.addEventListener("storage", notify);
  window.addEventListener(key, notify);
  return () => { window.removeEventListener("storage", notify); window.removeEventListener(key, notify); };
}
function snapshot() {
  try { return localStorage.getItem(key) || "[]"; } catch { return "[]"; }
}
function entries(raw: string): string[] {
  try {
    const list: unknown = JSON.parse(raw);
    return Array.isArray(list) ? [...new Set<string>(list.filter(item => typeof item === "string" && item.startsWith("/?sector=") && item.length <= 8192))] : [];
  } catch { return []; }
}
function useList() {
  return useSyncExternalStore(subscribe, snapshot, () => "[]");
}
function update(href: string, save: boolean) {
  const list = new Set(entries(snapshot()));
  if (save) list.add(href);
  else list.delete(href);
  if (list.size) localStorage.setItem(key, JSON.stringify([...list]));
  else localStorage.removeItem(key);
  window.dispatchEvent(new Event(key));
}
export function SaveButton({ href, kind }: { href: string; kind: string }) {
  const saved = entries(useList()).includes(href);
  const [error, setError] = useState(false);
  return <><button className="link" aria-pressed={saved} onClick={() => {
    try { update(href, !saved); setError(false); } catch { setError(true); }
  }}>{saved ? "Remove saved " : "Save "}{kind}</button>{error && <span role="status">Device storage unavailable.</span>}</>;
}
export function ShortlistLink() {
  const count = entries(useList()).length;
  return count ? <Link href="/shortlist">Research shortlist ({count})</Link> : null;
}
type Detail = { title: string; context: string };
export function SavedList() {
  const raw = useList();
  const [page, setPage] = useState(0);
  const [retry, setRetry] = useState(0);
  const [result, setResult] = useState<{ key: string; rows: (Detail | null)[]; failed?: boolean }>();
  const list = entries(raw);
  const index = Math.min(page, Math.max(0, Math.ceil(list.length / 8) - 1));
  const batch = list.slice(index * 8, index * 8 + 8);
  const signature = JSON.stringify(batch);
  useEffect(() => {
    let active = true;
    if (signature !== "[]") resolveShortlist(JSON.parse(signature)).then(rows => {
      if (active) setResult({ key: signature, rows });
    }).catch(() => { if (active) setResult({key: signature, rows: [], failed: true}); });
    return () => { active = false; };
  }, [signature, retry]);
  if (!list.length) return <p>No saved items on this device. <Link href="/?explore=1">Explore roles</Link></p>;
  const ready = result?.key === signature;
  return <><p>{list.length} saved on this device</p><ul className="saved-list">{batch.map((href,i) => {
    const item = ready && result.rows[i];
    const params = new URLSearchParams(href.split("?")[1]);
    return <li key={href}><div>{item ? <><Link href={href}>{item.title}</Link><p>{item.context}</p></> :
      <><strong>{ready ? "Currently unavailable" : "Loading record…"}</strong><p>{[params.get("role"), params.get("node")].filter(Boolean).join(" · ")}</p></>}</div>
      <SaveButton href={href} kind={params.has("node") ? "step" : "role"}/></li>;
  })}</ul>{ready && result.failed && <button onClick={()=>setRetry(retry+1)}>Retry lookup</button>}
  {list.length > 8 && <nav aria-label="Shortlist pages"><button disabled={!index} onClick={()=>setPage(index-1)}>Previous</button> Page {index+1} of {Math.ceil(list.length/8)} <button disabled={(index+1)*8>=list.length} onClick={()=>setPage(index+1)}>Next</button></nav>}</>;
}

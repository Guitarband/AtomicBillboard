import Link from "next/link";
import { browseCatalogue, catalogueHref } from "../../lib/catalogue/browse";
import type { CatalogueRole } from "../../lib/catalogue/master.mjs";
import "../tasks/tasks.css";
import "../tasks/research.css";

type Params = Record<string, string | string[] | undefined>;
const clean = (s: string) => s.trim().replace(/\s+/g, " ").toLowerCase();
function profile(role: CatalogueRole) {
  const workflows = new Set<string>();
  const controls = new Set<string>();
  const responsibilities = new Set<string>();
  const basis = new Set<string>(), validation = new Set<string>();
  let steps = 0;
  for (const task of role.tasks) {
    workflows.add(task.title);
    for (const sub of task.subtasks) for (const atom of sub.atomicTasks) {
      steps++;
      if (atom.controlQuality) controls.add(atom.controlQuality);
      responsibilities.add(atom.title);
      if (atom.humanInvolvement) responsibilities.add(atom.humanInvolvement);
      basis.add(atom.recordBasis || "Unrecorded");
      validation.add(atom.validationStatus || "Unrecorded");
    }
  }
  return {workflows, controls, responsibilities, steps, basis, validation};
}
function partition(left: Set<string>, right: Set<string>) {
  const a = new Set([...left].map(clean)), b = new Set([...right].map(clean));
  return {left: [...left].filter(v=>!b.has(clean(v))), right: [...right].filter(v=>!a.has(clean(v))), shared: [...left].filter(v=>b.has(clean(v)))};
}
function Values({ values, empty }: { values: string[]; empty: string }) {
  if (!values.length) return <p>{empty}</p>;
  const render = (items: string[]) => <ul>{items.map(value => <li key={value}>{value}</li>)}</ul>;
  return <>{render(values.slice(0, 4))}{values.length > 4 && <details>
    <summary>Show {values.length - 4} more</summary>{render(values.slice(4))}
  </details>}</>;
}
export default async function Compare({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const get = (key: string) => typeof params[key] === "string" ? params[key] : undefined;
  const sector = get("sector"), domain = get("domain"), sample = get("sample") === "1";
  const family = get("family");
  const back = catalogueHref({ sector, domain }, sample);
  const directory = sector && domain && await browseCatalogue({ sector, domain }, sample);
  const choices = directory && directory.view.kind === "choices" ? directory.view.choices.filter(r=>(r.family || r.title) === family) : [];
  const left = get("left") || choices[0]?.value;
  const right = get("right") || choices.find(c => c.value !== left)?.value;
  const valid = choices.length >= 2 && left !== right && [left,right].every(id=>choices.some(c=>c.value===id));
  const views = valid ? await Promise.all([left,right].map(role=>browseCatalogue({sector,domain,role},sample))) : [];
  const roles = views.flatMap(v=>v.view.kind==="map" ? [v.view.role] : []);
  const profiles = roles.map(profile);
  const groups = roles.length === 2 ? (["controls","responsibilities","workflows"] as const).map(key=>({
    key, ...partition(profiles[0][key],profiles[1][key]),
  })) : [];
  return <main className="catalogue-page research-page"><Link href={back}>Back to role families</Link>
    <h1>Compare grades</h1><p>{family} · {domain}</p>
    {choices.length >= 2 && <form className="compare-form" action="/compare">
      {Object.entries({sector,domain,family,...(sample ? {sample:"1"} : {})}).map(([k,v])=><input key={k} type="hidden" name={k} value={v}/>)}
      {[left,right].map((id,i)=><label key={i}>Profile {i+1}<select name={i ? "right" : "left"} defaultValue={id}>
        {choices.map(c=><option key={c.value} value={c.value}>{c.title} · {c.grade || c.value}</option>)}</select></label>)}
      <button type="submit">Compare</button></form>}
    {roles.length !== 2 ? <p role="status">{left && left === right ? "Select two different profiles." : "Two profiles from this family are required and must be available."}</p> : <>
      <div className="compare-pair">{roles.map((role,i)=><section key={role.rolePackageId}>
        <h2><Link href={catalogueHref({sector,domain,role:role.rolePackageId},sample)}>{role.levelledTitle}</Link></h2>
        <p>{role.jobGrade || "Grade unrecorded"} · {profiles[i].steps} recorded steps</p>
        <p>Basis · {[...profiles[i].basis].join(", ") || "Unrecorded"}<br/>Validation · {[...profiles[i].validation].join(", ") || "Unrecorded"}</p>
      </section>)}</div>
      <p>{groups[2].shared.length} workflows share a title across both profiles. Differences below reflect catalogue coverage.</p>
      {groups.map(group=><details key={group.key} open={group.key === "controls"} className="record-section"><summary>Differences in {group.key} ({group.left.length + group.right.length})</summary>
        <div className="compare-pair">{[group.left,group.right].map((values,i)=><section key={i}><h3>{roles[i].jobGrade || roles[i].levelledTitle}</h3>
          <p>Recorded here · unrecorded in {roles[1-i].jobGrade || roles[1-i].levelledTitle}</p>
          <Values values={values} empty={profiles[i][group.key].size ? "No distinct entries." : "Unrecorded"}/></section>)}</div></details>)}
      <details className="record-section"><summary>Shared material</summary>{groups.map(g=><section key={g.key}><h3>Shared {g.key}</h3><Values values={g.shared} empty="No matching entries recorded."/></section>)}</details>
    </>}</main>;
}

import type { Metadata } from "next";
import Link from "next/link";
import { Dashboard } from "./insights/dashboard";
import { browseCatalogue, catalogueHref, type Trail } from "../lib/catalogue/browse";
import { roleTaskTree } from "./tasks/data";
import { CatalogueChoices, StepFrame } from "./tasks/catalogue-choices";
import { TaskExplorer } from "./tasks/task-explorer";
import "./tasks/tasks.css";
import "./tasks/role-index.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Research dashboard & role explorer | Atomic Billboard",
  description: "Explore the responsibilities, evidence and decisions behind a business role.",
};

type Params = Record<string, string | string[] | undefined>;

function SelectionTrail({ trail, sample }: { trail: Trail; sample: boolean }) {
  if (!trail.sector) return null;
  const crumbs = [
    { label: "All industries", href: catalogueHref({}, sample) },
    { label: trail.sector, href: catalogueHref({ sector: trail.sector }, sample) },
  ];
  if (trail.domain) crumbs.push({ label: trail.domain, href: catalogueHref({ sector: trail.sector, domain: trail.domain }, sample) });
  return <nav className="selection-trail" aria-label="Your selections"><ol>
    {crumbs.map((item, index) => <li key={item.href}>
      {index === crumbs.length - 1 && !trail.role ? <span aria-current="page">{item.label}</span> :
        <Link href={item.href} prefetch={false}>{item.label}</Link>}
    </li>)}
  </ol></nav>;
}

export default async function Home({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  if (!params.sector && !params.domain && !params.role && !params.sample && !params.explore) return <Dashboard />;
  const { sector, domain, role: roleId } = params;
  const sampleRequested = params.sample === "1";
  if (Array.isArray(sector) || Array.isArray(domain) || Array.isArray(roleId) || (domain && !sector) || (roleId && !domain)) {
    return <SelectionMessage sample={sampleRequested} />;
  }
  const trail = { sector, domain, role: roleId };
  const { view, sample, offline } = await browseCatalogue(trail, sampleRequested);
  if (view.kind === "missing") return <SelectionMessage sample={sample} />;
  if (view.kind === "unavailable") return <main className="catalogue-page catalogue-message">
    <h1>Role library unavailable</h1><p>Try again shortly or explore the sample collection.</p>
    <Link href={catalogueHref({}, true)}>Explore sample roles</Link>
  </main>;

  const role = view.kind === "map" ? view.role : undefined;
  const step = domain ? 3 : sector ? 2 : 1;
  const prompt = domain ? "Find a role" : sector ? "Choose a department" : "Explore an industry";
  const signature = catalogueHref(trail, sample);
  return <main className={`catalogue-page${role ? " role-page" : ""}`}>
    <div className="explorer-mast">
      {sector ? <SelectionTrail trail={trail} sample={sample} /> : <span className="explorer-name">Role explorer</span>}
      {sample && <span className="sample-source">{offline ? "Live data unavailable · Sample collection" : "Sample collection"}</span>}
    </div>
    <StepFrame signature={signature}>
      {view.kind === "choices" && <>
        <div className="decision-intro">
          <div className="decision-progress">
            <span className="progress-ticks" aria-hidden="true">{[1, 2, 3].map(n => <i key={n} className={n <= step ? "filled" : ""} />)}</span>
            <span>Step {step} of 3</span>
          </div>
          <h1 id="decision-title" tabIndex={-1}>{prompt}</h1>
          {(!sector || domain) && <p>{domain ? "Select a role to open its work map." : "Find out what different roles do day to day."}</p>}
        </div>
        <CatalogueChoices key={signature} step={step} sector={sector} options={view.choices.map(choice => {
          const next = !sector ? { sector: choice.value } : !domain ? { sector, domain: choice.value } : { sector, domain, role: choice.value };
          return { ...choice, href: catalogueHref(next, sample) };
        })} />
      </>}
      {role && <>
        <div className="role-heading">
          <div><h1 id="decision-title" tabIndex={-1}>{role.levelledTitle}</h1>
            {role.gradeDescription && <p>{role.gradeDescription}</p>}
          </div>
          <dl className="role-facts">
            {role.roleFamily && <div><dt>Role family</dt><dd>{role.roleFamily}</dd></div>}
            {role.jobGrade && <div><dt>Grade</dt><dd>{role.jobGrade}</dd></div>}
            <div><dt>Role ID</dt><dd>{role.rolePackageId}</dd></div>
          </dl>
        </div>
        <nav className="role-tools" aria-label="Role research tools">{[["scores","Role scoring"],["impact","Model adoption"],["pay","Compare salaries"]].map(([id,label])=>
          <Link key={id} href={"/insights/"+id+"?"+new URLSearchParams({role:role.rolePackageId,...(sample?{sample:"1"}:{})})}>{label} ↗</Link>)}</nav>
        <TaskExplorer key={role.rolePackageId} tasks={roleTaskTree(role)} />
      </>}
    </StepFrame>
  </main>;
}

function SelectionMessage({ sample }: { sample: boolean }) {
  return <main className="catalogue-page catalogue-message"><h1>Selection unavailable</h1>
    <p>This path does not match a role in the library.</p><Link href={catalogueHref({}, sample)}>Browse industries</Link>
  </main>;
}

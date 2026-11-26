import { ToolDirectory } from "../tool-directory";
import Link from "next/link";
import { notFound } from "next/navigation";
import { catalogue } from "../../../lib/intelligence/catalogue";
import { average, roleUrl, toolsIndex } from "../../../lib/intelligence/model";
import { RolePicker } from "../role-picker";
import { RoleTools } from "../role-tools";
import { Planner, Patterns, insightLink, type Params } from "../discovery";
import "../intelligence.css";
export const dynamic = "force-dynamic";
export default async function Research({
  params,
  searchParams,
}: {
  params: Promise<{ view: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { view } = await params,
    tool = toolsIndex.find((t) => t[0] === view);
  if (!tool) notFound();
  const query: Params = {};
  for (const [k, v] of Object.entries(await searchParams))
    if (typeof v === "string") query[k] = v;
  let data;
  try {
    data = await catalogue(query.sample === "1");
  } catch {
    return (
      <main className="intel">
        <h1>Catalogue unavailable</h1>
        <p>The live catalogue could not be loaded.</p>
        <Link href={insightLink(view, { sample: "1" })}>
          Explore the sample collection
        </Link>
      </main>
    );
  }
  const { roles, sample } = data,
    roleView = ["scores", "impact", "pay"].includes(view);
  const chosen = query.role
    ? roles.find((r) => r.id === query.role)
    : (roles.find(
        (r) =>
          r.family === "AML Transaction Monitoring Analyst" &&
          r.steps.length > 5,
      ) ?? roles[0]);
  const scope = { role: chosen?.id, sample: sample ? "1" : undefined };
  const options = roleView
    ? roles.map((r) => ({
        id: r.id,
        title: r.title,
        family: r.family,
        department: r.department,
        grade: r.grade,
        count: r.steps.length,
        score: average(r.steps),
      }))
    : [];
  const selected = options.find((r) => r.id === chosen?.id);
  return (
    <main className="intel research-view">
      <div className="tool-layout">
        <ToolDirectory current={view} links={toolsIndex.map(([id, label]) => ({id, label, href: insightLink(id, scope)}))}/>
        <div className="tool-sheet">
      <header className="tool-intro">
        <h1>{tool[1]}</h1>
        <p>{tool[2]}</p>
        {sample && <small>Sample collection</small>}
      </header>
      {roleView &&
        (chosen && selected ? (
          <>
            <RolePicker
              key={chosen.id}
              options={options}
              selected={selected}
              view={view}
              sample={sample}
            />
            <Link className="return-role" href={roleUrl(chosen, sample)}>
              Open role map & outline ↗
            </Link>
            <RoleTools
              key={chosen.id + view + (query.flow || "")}
              role={chosen}
              view={view}
              initialFlow={
                chosen.steps.some((s) => s.flowId === query.flow)
                  ? query.flow
                  : undefined
              }
            />
          </>
        ) : (
          <p>
            Profile unavailable.{" "}
            <Link href={insightLink(view, { sample: scope.sample })}>
              Choose another role
            </Link>
          </p>
        ))}
      {view === "planner" && (
        <Planner roles={roles} params={query} sample={sample} />
      )}
      {view === "reuse" && (
        <Patterns roles={roles} params={query} sample={sample} />
      )}
      <details className="method">
        <summary>Scoring and catalogue sources</summary>
        <p>
          {sample
            ? "The bundled sample role CSV"
            : "The imported AtomicAI master role and task catalogue"}{" "}
          supplies the role, workflow, SFIA, human involvement and automation
          fields. Scores average recorded values. Qualitative High, Medium and
          Low inputs use illustrative values of 85%, 55% and 25%. Unscored steps
          are excluded from averages.
        </p>
        <p>
          Strong candidates score at least 80%. Scenario eligibility defaults to
          65% and excludes missing human controls and explicit execution,
          customer interaction, delegated decision and policy ownership.
          Estimated minutes weight the time-based score. Pilot measurements can
          replace these assumptions in the timing editor.
        </p>
        <p>
          Repeated steps match normalised descriptions across distinct role
          families. Planner suggestions rank matches in the workflow, role
          title, department and step text. Banking outcome measures are
          suggested pilot KPIs.
        </p>
      </details></div></div>
    </main>
  );
}

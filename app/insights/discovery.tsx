import Link from "next/link";
import {
  average,
  eligible,
  matchWorkflows,
  pct,
  protectedStep,
  roleUrl,
  topics,
  type Profile,
  type Step,
} from "../../lib/intelligence/model";
export type Params = Record<string, string | undefined>;
export function insightLink(view: string, params: Params = {}) {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) search.set(k, v);
  return "/insights/" + view + (search.size ? "?" + search : "");
}
type Props = { roles: Profile[]; params: Params; sample: boolean };
function uniqueRoles(
  matches: ReturnType<typeof matchWorkflows>,
  limit: number,
) {
  const used = new Set<string>();
  return matches
    .filter((m) => {
      if (used.has(m.role.family)) return false;
      used.add(m.role.family);
      return true;
    })
    .slice(0, limit);
}
export function Planner({ roles, params, sample }: Props) {
  const brief = (params.q || "").trim().slice(0, 300);
  const words =
    brief
      .toLowerCase()
      .match(/[a-z0-9]{3,}/g)
      ?.filter(
        (t) =>
          ![
            "reduce",
            "improve",
            "shorten",
            "the",
            "faster",
            "need",
            "with",
            "and",
            "more",
            "want",
            "our",
            "steps",
            "speed",
            "work",
            "help",
          ].includes(t),
      ) || [];
  const topic =
    topics.find((t) => t.title.toLowerCase() === brief.toLowerCase()) ??
    topics
      .map((t) => ({
        t,
        n: t.terms.filter((term) => brief.toLowerCase().includes(term)).length,
      }))
      .sort((a, b) => b.n - a.n)
      .find((m) => m.n)?.t;
  const matches = brief
    ? uniqueRoles(
        matchWorkflows(roles, [
          ...new Set([...words, ...(topic?.terms || [])]),
        ]),
        5,
      )
    : [];
  const editor = <>
      <form className="brief">
        <label htmlFor="brief">What problem are you trying to solve?</label>
        <input
          id="brief"
          name="q"
          maxLength={300}
          defaultValue={brief}
          placeholder="For example, reduce mortgage approval delays"
          required
        />
        <label htmlFor="target">Target outcome (optional)</label>
        <input
          id="target"
          name="target"
          maxLength={160}
          defaultValue={params.target}
          placeholder="For example, cut decision time by one day"
        />
        {sample && <input type="hidden" name="sample" value="1" />}
        <button>Build plan</button>
      </form>
      <div className="topic-links">
        {topics.map((t) => (
          <Link
            prefetch={false}
            key={t.title}
            href={insightLink("planner", {
              q: t.title,
              sample: sample ? "1" : undefined,
            })}
          >
            {t.title}
          </Link>
        ))}
      </div>
    </>;
  return (<>
      {brief ? <details className="plan-brief"><summary>Edit brief · {brief}</summary>{editor}</details> : editor}
      {brief && (
        <section>
          <h2>
            {matches.length
              ? "Proposed workflow plan"
              : "No matching workflows"}
          </h2>
          {matches.length > 0 ? (
            <>
              <p>
                <b>Measure success</b> ·{" "}
                {params.target ||
                  topic?.kpi ||
                  "Agree a baseline for cycle time and exception rate before a pilot."}
              </p>
              <p>
                <b>Human checkpoint</b> ·{" "}
                {topic?.check ||
                  "Confirm release authority and review exceptions with the workflow owner."}
              </p>
              {matches.map((m,index) => {
                const profile = <>
                  <small>
                    {m.role.department} · {m.role.title}
                  </small>
                  <h3>{m.flow}</h3>
                  <p>
                    {m.steps.filter((s) => eligible(s)).length} of{" "}
                    {m.steps.length} steps meet the assistance threshold ·{" "}
                    {m.steps.filter(protectedStep).length} protected
                  </p>
                  <p>
                    {m.steps.find((s) => eligible(s))?.title ||
                      "Review this workflow with its owner before selecting a pilot."}
                  </p>
                  <Link
                    prefetch={false}
                    href={insightLink("impact", {
                      role: m.role.id,
                      flow: m.flowId,
                      sample: sample ? "1" : undefined,
                    })}
                  >
                    Model this workflow →
                  </Link>
                </>;
                return index === 0 ? <article key={m.role.id} className="result lead-match"><h4>Closest workflow match</h4>{profile}</article> :
                  <details className="alternate-match" key={m.role.id}><summary>{m.flow}<strong>{m.role.title}</strong></summary>{profile}</details>;
              })}
            </>
          ) : (
            <p>Try a role, workflow or department name from the catalogue.</p>
          )}
        </section>
      )}
    </>
  );
}
export function Patterns({ roles, params, sample }: Props) {
  const selected = roles.find((r) => r.id === params.role);
  const base = { sample: sample ? "1" : undefined, role: selected?.id };
  const outcomes = params.mode === "outcomes",
    q = (params.q || "").trim().toLowerCase();
  const departments = [...new Set(roles.map((r) => r.department))].sort();
  const scope = roles.filter(
    (r) =>
      (!params.department || r.department === params.department) &&
      (!outcomes || params.match !== "1" || !selected || r.id === selected.id),
  );
  const groups = new Map<string, { role: Profile; step: Step }[]>();
  if (!outcomes)
    for (const role of scope)
      for (const step of role.steps) {
        const title = step.title.trim().replace(/\s+/g, " ").toLowerCase();
        if (q && !title.includes(q)) continue;
        if (!groups.has(title)) groups.set(title, []);
        groups.get(title)!.push({ role, step });
      }
  const repeated = [...groups.values()]
    .map((rows) => ({
      rows,
      reach: new Set(rows.map((r) => r.role.family)).size,
    }))
    .filter((g) => g.reach > 1)
    .sort(
      (a, b) =>
        b.reach - a.reach ||
        b.rows.length - a.rows.length ||
        a.rows[0].step.title.localeCompare(b.rows[0].step.title),
    );
  const page = Math.min(
    Math.max(1, parseInt(params.page || "1", 10) || 1),
    Math.max(1, Math.ceil(repeated.length / 12)),
  );
  return (
    <>
      <nav className="subnav" aria-label="Discovery views">
        <Link
          prefetch={false}
          aria-current={!outcomes ? "page" : undefined}
          href={insightLink("reuse", base)}
        >
          Repeated steps
        </Link>
        <Link
          prefetch={false}
          aria-current={outcomes ? "page" : undefined}
          href={insightLink("reuse", { ...base, mode: "outcomes" })}
        >
          Banking outcomes
        </Link>
      </nav>
      <form className="filters">
        {selected && <input type="hidden" name="role" value={selected.id} />}
        {outcomes && selected && (
          <label>
            Match role
            <select name="match" defaultValue={params.match || ""}>
              <option value="">All roles</option>
              <option value="1">{selected.title}</option>
            </select>
          </label>
        )}
        {sample && <input name="sample" type="hidden" value="1" />}
        {outcomes && <input type="hidden" name="mode" value="outcomes" />}
        <label>
          {outcomes ? "Search outcomes" : "Search repeated steps"}
          <input type="search" name="q" defaultValue={params.q} />
        </label>
        <label>
          Department
          <select name="department" defaultValue={params.department}>
            <option value="">All departments</option>
            {departments.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </label>
        <button>Apply filters</button>
      </form>
      {outcomes ? (
        <>
          <p>
            Suggested banking outcomes mapped to catalogue workflows by topic.
            Confirm ownership with the listed teams.
          </p>
          {topics
            .filter((t) =>
              (t.title + " " + t.kpi + " " + t.terms.join(" "))
                .toLowerCase()
                .includes(q),
            )
            .map((t) => {
              const matches = uniqueRoles(matchWorkflows(scope, t.terms), 5);
              return (
                <details key={t.title}>
                  <summary>{t.title}</summary>
                  <p>
                    <b>Measure</b> · {t.kpi}
                  </p>
                  <p>{t.check}</p>
                  {matches.length ? (
                    <ul>
                      {matches.map((m) => (
                        <li key={m.role.id}>
                          <Link prefetch={false} href={roleUrl(m.role, sample)}>
                            {m.role.title}
                          </Link>{" "}
                          · {m.flow}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No matching roles in this scope.</p>
                  )}
                </details>
              );
            })}
          {!topics.some((t) =>
            (t.title + " " + t.kpi + " " + t.terms.join(" "))
              .toLowerCase()
              .includes(q),
          ) && <p>No matching outcomes.</p>}
        </>
      ) : (
        <>
          <p>
            {repeated.length} step descriptions shared by two or more role
            families.
          </p>
          {repeated.slice((page - 1) * 12, page * 12).map(({ rows, reach }, index) => {
            const title = rows[0].step.title;
            const active = params.step === title;
            const last = Math.ceil(rows.length / 8);
            const current = active ? Math.max(1, Math.min(last, parseInt(params.offset || "1",10) || 1)) : 1;
            const anchor = "pattern-" + index;
            const occurrenceHref = (n:number) => insightLink("reuse",{...params,step:title,offset:String(n)})+"#"+anchor;
            const scored = rows
              .map((x) => x.step.score)
              .filter((n): n is number => n !== null);
            return (
              <details key={title} id={anchor} open={active || undefined}>
                <summary>
                  {rows[0].step.title}
                  <strong>{reach} role families</strong>
                </summary>
                <p>
                  {rows.length} occurrences ·{" "}
                  {scored.length
                    ? Math.min(...scored) +
                      "–" +
                      Math.max(...scored) +
                      "% propensity"
                    : "Unscored"}{" "}
                  · Mean {pct(average(rows.map((x) => x.step)))}
                </p>
                <ul>
                  {rows.slice((current-1)*8,current*8).map(({ role, step }) => (
                    <li key={role.id + step.id}>
                      <Link
                        prefetch={false}
                        href={insightLink("scores", {
                          ...base,
                          role: role.id,
                          flow: step.flowId,
                        })}
                      >
                        {role.title}
                      </Link>{" "}
                      · {step.flow} · {pct(step.score)}
                    </li>
                  ))}
                </ul>
                {last > 1 && <nav className="index-pager" aria-label={"Occurrences of " + title}>
                  {current>1 && <Link prefetch={false} href={occurrenceHref(current-1)}>Previous occurrences</Link>}
                  <span>{(current-1)*8+1}–{Math.min(current*8,rows.length)} of {rows.length}</span>
                  {current<last && <Link prefetch={false} href={occurrenceHref(current+1)}>Next occurrences</Link>}
                </nav>}
              </details>
            );
          })}
          <nav className="subnav" aria-label="Result pages">
            {page > 1 && (
              <Link
                prefetch={false}
                href={insightLink("reuse", {
                  ...params,
                  page: String(page - 1),
                })}
              >
                Previous
              </Link>
            )}
            {page * 12 < repeated.length && (
              <Link
                prefetch={false}
                href={insightLink("reuse", {
                  ...params,
                  page: String(page + 1),
                })}
              >
                Next
              </Link>
            )}
          </nav>
        </>
      )}
    </>
  );
}



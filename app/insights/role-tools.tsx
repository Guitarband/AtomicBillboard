"use client";
import { useState } from "react";
import {
  average,
  eligible,
  minutes,
  pct,
  protectedStep,
  type Profile,
  type Step,
} from "../../lib/intelligence/model";
import { Salary } from "./salary";

import { exportTable } from "./csv";
function Filter({
  name,
  value,
  options,
  onChange,
}: {
  name: string;
  value: string;
  options: string[];
  onChange: (s: string) => void;
}) {
  return (
    <label>
      {name}
      <select
        aria-label={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">All</option>
        {options.map((x) => (
          <option key={x}>{x}</option>
        ))}
      </select>
    </label>
  );
}
function Num({
  label,
  n,
  change,
  max = 100000000,
}: {
  label: string;
  n: number;
  change: (n: number) => void;
  max?: number;
}) {
  return (
    <label>
      {label}
      <input
        type="number"
        min="0"
        max={max}
        step="any"
        value={n}
        onChange={(e) =>
          change(Math.min(max, Math.max(0, Number(e.target.value) || 0)))
        }
      />
    </label>
  );
}
function Stats({ items }: { items: [string, string | number][] }) {
  return (
    <dl className="stats">
      {items.map(([k, v]) => (
        <div key={k}>
          <dt>{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  );
}
const unique = (xs: string[]) => [...new Set(xs.filter(Boolean))].sort();
const format = (n: number) =>
  n.toLocaleString("en-US", { maximumFractionDigits: 1 });
const bandOf = (s: Step) =>
  s.score === null
    ? "Unscored"
    : s.score >= 80
      ? "Strong"
      : s.score >= 65
        ? "Substantial"
        : s.score >= 40
          ? "Partial"
          : "Limited";
export function RoleTools({
  role,
  view,
  initialFlow,
}: {
  role: Profile;
  view: string;
  initialFlow?: string;
}) {
  const [flowId, setFlow] = useState(initialFlow || ""),
    [query, search] = useState(""),
    [band, setBand] = useState(""),
    [sfia, setSfia] = useState(""),
    [human, setHuman] = useState(""),
    [order, sort] = useState("Workflow order");
  const [weighted, weight] = useState(false),
    [overrides, setTimes] = useState<Record<string, number>>({});
  const [adoption, setAdoption] = useState(50),
    [volume, setVolume] = useState(10000),
    [cut, setCut] = useState(40),
    [review, setReview] = useState(2),
    [rate, setRate] = useState(60),
    [cost, setCost] = useState(1),
    [setup, setSetup] = useState(10000),
    [threshold, setThreshold] = useState(65);
  const [wait, setWait] = useState(10),
    [defect, setDefect] = useState(4),
    [assistedDefect, setAssistedDefect] = useState(3),
    [loss, setLoss] = useState(100);
  const steps = role.steps,
    flows = [...new Map(steps.map((s) => [s.flowId, s.flow] as const))];
  const time = (s: Step) => overrides[s.id] ?? minutes(s);
  const activeFlow = flowId || (view === "impact" ? flows[0]?.[0] : "") || "";
  const scope = steps.filter((s) => !activeFlow || s.flowId === activeFlow);
  const shown = scope.filter(
    (s) =>
      (!band || bandOf(s) === band) &&
      (!sfia || s.sfia === sfia) &&
      (!human || s.human === human) &&
      (s.title + " " + s.sub).toLowerCase().includes(query.toLowerCase()),
  );
  if (order === "Highest score")
    shown.sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
  if (order === "Longest time") shown.sort((a, b) => time(b) - time(a));
  const candidates = scope.filter((s) => eligible(s, threshold));
  const base = scope.reduce((n, s) => n + time(s), 0);
  const saved = candidates.length
    ? candidates.reduce((n, s) => n + (time(s) * cut) / 100, 0) - review
    : 0;
  function scenario(percent: number) {
    const cases = candidates.length ? (volume * percent) / 100 : 0;
    const hours = (cases * saved) / 60,
      expenses = percent && candidates.length ? setup + cases * cost : 0;
    const failures =
      ((volume - cases) * defect) / 100 + (cases * assistedDefect) / 100;
    return {
      hours,
      expenses,
      net: hours * rate - expenses,
      failures,
      turn: base + wait - (volume ? cases / volume : 0) * saved,
    };
  }
  const now = scenario(adoption);
  const timing = (
    <details>
      <summary>Edit estimated active minutes per execution</summary>
      <p>
        Starting assumptions are 15 minutes for protected work, 10 for analysis,
        2 for records and 5 for other steps. Changes apply to this view.
      </p>
      <div className="timings">
        {scope.map((s) => (
          <Num
            key={s.id}
            label={s.title}
            n={time(s)}
            max={10080}
            change={(n) => setTimes({ ...overrides, [s.id]: n })}
          />
        ))}
      </div>
    </details>
  );
  const workflow = (
    <label>
      Workflow
      <select
        aria-label="Workflow"
        value={activeFlow}
        onChange={(e) => setFlow(e.target.value)}
      >
        {view !== "impact" && <option value="">All workflows</option>}
        {flows.map(([id, title]) => (
          <option key={id} value={id}>
            {title}
          </option>
        ))}
      </select>
    </label>
  );
  if (view === "pay") return <Salary role={role} />;
  if (view === "impact")
    return (
      <>
        <div className="filters">
          {workflow}
          <label>
            AI-assisted cases · {adoption}%
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={adoption}
              onChange={(e) => setAdoption(+e.target.value)}
            />
          </label>
        </div>
        <Stats
          items={[
            ["Eligible steps", candidates.length + " / " + scope.length],
            ["Annual hours released", format(now.hours)],
            ["Year one net value (USD)", "$" + format(now.net)],
            ["Minutes per case", format(now.turn)],
          ]}
        />
        <h2>Rollout assumptions</h2>
        <p>
          Illustrative USD scenario. Eligibility requires a recorded human
          control and excludes protected decisions. Review time is charged on
          every assisted case.
        </p>
        <details className="assumption-group"><summary>Case volume and handling time</summary>
        <div className="filters">
          <Num label="Annual cases" n={volume} change={setVolume} />
          <Num
            label="Minimum propensity (%)"
            n={threshold}
            change={setThreshold}
            max={100}
          />
          <Num
            label="Eligible handling time saved (%)"
            n={cut}
            change={setCut}
            max={100}
          />
          <Num label="Extra review (minutes)" n={review} change={setReview} />
        </div>{timing}</details>
        <details className="assumption-group"><summary>Labour and AI costs</summary><div className="filters">
          <Num label="Hourly labour cost (USD)" n={rate} change={setRate} />
          <Num
            label="AI cost per assisted case (USD)"
            n={cost}
            change={setCost}
          />
          <Num label="Setup cost (USD)" n={setup} change={setSetup} />
        </div></details>
        <details className="assumption-group"><summary>Waiting time, defects and losses</summary><div className="filters">
          <Num
            label="Queue time per case (minutes)"
            n={wait}
            change={setWait}
          />
          <Num
            label="Baseline defect rate (%)"
            n={defect}
            change={setDefect}
            max={100}
          />
          <Num
            label="Assisted defect rate (%)"
            n={assistedDefect}
            change={setAssistedDefect}
            max={100}
          />
          <Num label="Loss per failed case (USD)" n={loss} change={setLoss} />
        </div></details>
        <h2>Compare adoption levels</h2>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                {[
                  "Adoption",
                  "Hours saved",
                  "AI & setup cost",
                  "Net capacity value",
                  "Expected failures",
                  "Conditional loss exposure",
                ].map((x) => (
                  <th key={x}>{x}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...new Set([0, 25, 50, 75, 100, adoption])]
                .sort((a, b) => a - b)
                .map((p) => {
                  const s = scenario(p);
                  return (
                    <tr key={p} data-current={p === adoption}>
                      <th>{p}%</th>
                      {[
                        s.hours,
                        s.expenses,
                        s.net,
                        s.failures,
                        s.failures * loss,
                      ].map((v, i) => (
                        <td key={i}>{format(v)}</td>
                      ))}
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </>
    );
  return (
    <>
      <div className="filters">
        {workflow}
        <label>
          Score weighting
          <select
            aria-label="Score weighting"
            value={weighted ? "time" : "equal"}
            onChange={(e) => weight(e.target.value === "time")}
          >
            <option value="equal">Equal weight per step</option>
            <option value="time">Estimated active time</option>
          </select>
        </label>
      </div>
      <Stats
        items={[
          ["AI propensity", pct(average(scope, weighted, time))],
          [
            "Strong candidates",
            scope.filter((s) => bandOf(s) === "Strong").length,
          ],
          ["Protected steps", scope.filter(protectedStep).length],
          [
            "Scored steps",
            scope.filter((s) => s.score !== null).length + " / " + scope.length,
          ],
        ]}
      />
      <h2>Propensity by workflow</h2>
      <div className="workflow-bars">
        {flows.map(([id, title]) => {
          const val = average(
            steps.filter((s) => s.flowId === id),
            weighted,
            time,
          );
          return (
            <button
              key={id}
              aria-pressed={activeFlow === id}
              onClick={() => setFlow(id === flowId ? "" : id)}
            >
              {title}
              <meter value={val ?? 0} max="100" />
              <b>{pct(val)}</b>
            </button>
          );
        })}
      </div>
      <h2>Atomic step index</h2>
      <div className="filters">
        <label>
          Search steps
          <input
            type="search"
            value={query}
            onChange={(e) => search(e.target.value)}
          />
        </label>
      </div><details className="step-filters"><summary>Filters and sort{[band,sfia,human].filter(Boolean).length > 0 && <strong>{[band,sfia,human].filter(Boolean).join(" · ")}</strong>}</summary><div className="filters">
        <Filter
          name="Propensity band"
          value={band}
          onChange={setBand}
          options={unique(steps.map(bandOf))}
        />
        <Filter
          name="SFIA"
          value={sfia}
          onChange={setSfia}
          options={unique(steps.map((s) => s.sfia))}
        />
        <Filter
          name="Human involvement"
          value={human}
          onChange={setHuman}
          options={unique(steps.map((s) => s.human))}
        />
        <label>
          Sort steps
          <select
            aria-label="Sort steps"
            value={order}
            onChange={(e) => sort(e.target.value)}
          >
            {["Workflow order", "Highest score", "Longest time"].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
      </div></details>
      <div className="line">
        <p>{shown.length} matching steps</p>
        <button
          onClick={() =>
            exportTable("atomic-steps.csv", [
              [
                "Workflow",
                "Atomic step",
                "AI propensity",
                "SFIA",
                "Human involvement",
                "Estimated minutes",
              ],
              ...shown.map((s) => [
                s.flow,
                s.title,
                pct(s.score),
                s.sfia,
                s.human,
                time(s),
              ]),
            ])
          }
        >
          Export CSV
        </button>
      </div>
      <StepResults key={JSON.stringify([query,band,sfia,human,order,activeFlow])} steps={shown} time={time}/>
      {timing}
    </>
  );
}

function StepResults({steps,time}:{steps:Step[];time:(s:Step)=>number}) {
  const [page,setPage] = useState(0);
  const start = page * 8;
  return <>{steps.length > 8 && <nav aria-label="Atomic step pages" className="index-pager">
    <button disabled={!page} onClick={()=>setPage(page-1)}>Previous</button>
    <span aria-live="polite">{start+1}–{Math.min(start+8,steps.length)} of {steps.length} steps</span>
    <button disabled={start+8>=steps.length} onClick={()=>setPage(page+1)}>Next</button>
  </nav>}
      {steps.slice(start, start + 8).map((s) => (
        <details key={s.id} name="scored-step">
          <summary>
            {s.title}
            <strong>{pct(s.score)}</strong>
          </summary>
          <p>
            {s.flow} / {s.sub}
          </p>
          <dl className="facts">
            {[
              ["Work result", s.result],
              ["Control", s.control],
              ["Risk", s.risk],
              ["Human involvement", s.human],
              ["SFIA", s.sfia],
              ["Estimated minutes", time(s)],
            ].map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v || (v === 0 ? "0" : "Unrecorded")}</dd>
              </div>
            ))}
          </dl>
        </details>
      ))}
  </>;
}

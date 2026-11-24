"use client";
import { useState } from "react";
import Link from "next/link";
import { pct } from "../../lib/intelligence/model";

export type Option = {
  id: string;
  title: string;
  family: string;
  grade: string;
  department: string;
  score: number | null;
  count: number;
};
export function RolePicker({
  options,
  selected,
  view,
  sample,
}: {
  options: Option[];
  selected: Option;
  view: string;
  sample: boolean;
}) {
  const [query, setQuery] = useState(""),
    [grade, setGrade] = useState(""),
    [department, setDepartment] = useState(""),
    [order, setOrder] = useState("Title"),
    [limit, setLimit] = useState(25);
  const href = (id: string) =>
    "/insights/" +
    view +
    "?" +
    new URLSearchParams({ role: id, ...(sample ? { sample: "1" } : {}) });
  const list = options.filter(
    (r) =>
      (!grade || r.grade === grade) &&
      (!department || r.department === department) &&
      (r.title + " " + r.family).toLowerCase().includes(query.toLowerCase()),
  );
  if (order === "AI score")
    list.sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
  if (order === "Step count") list.sort((a, b) => b.count - a.count);
  return (
    <details className="picker">
      <summary>
        Change role or grade <strong>{selected.title}</strong>
      </summary>
      <div className="filters">
        <label>
          Search roles
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setLimit(25);
            }}
          />
        </label>
        <label>
          Department
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          >
            <option value="">All departments</option>
            {[...new Set(options.map((r) => r.department))].sort().map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <label>
          Grade
          <select value={grade} onChange={(e) => setGrade(e.target.value)}>
            <option value="">All grades</option>
            {[...new Set(options.map((r) => r.grade).filter(Boolean))]
              .sort()
              .map((x) => (
                <option key={x}>{x}</option>
              ))}
          </select>
        </label>
        <label>
          Sort by
          <select value={order} onChange={(e) => setOrder(e.target.value)}>
            {["Title", "AI score", "Step count"].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
      </div>
      <p>{list.length} matching profiles</p>
      <ul className="picker-list">
        {list.slice(0, limit).map((r) => (
          <li key={r.id}>
            <Link prefetch={false} href={href(r.id)}>
              {r.title}
            </Link>
            <small>
              Grade {r.grade || "unknown"} · {r.count} steps · {pct(r.score)}
            </small>
          </li>
        ))}
      </ul>
      {list.length > limit && (
        <button onClick={() => setLimit(limit + 25)}>Show more profiles</button>
      )}
    </details>
  );
}

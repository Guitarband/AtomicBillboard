"use client";
import { useState } from "react";
import type { Profile } from "../../lib/intelligence/model";
import { exportTable } from "./csv";

const markets: [string, string, number][] = [
  ["Canada", "CAD", 92401],
  ["France", "EUR", 45964],
  ["Germany", "EUR", 66700],
  ["Italy", "EUR", 36594],
  ["Japan", "JPY", 5703038],
  ["United Kingdom", "GBP", 55983],
  ["United States", "USD", 73520],
];
const proxies = [
  {
    name: "Compliance officers",
    test: /compliance|aml|financial crime|sanction/i,
    mean: 80190,
  },
  { name: "Tellers", test: /teller/i, mean: 38850 },
  {
    name: "Computer and mathematical occupations",
    test: /engineer|technology|data |cyber|software/i,
    mean: 113140,
  },
  {
    name: "Management occupations",
    test: /manager|chief|director|head of/i,
    mean: 137750,
  },
  { name: "Business and financial operations", test: /.*/, mean: 90580 },
];
export function Salary({ role }: { role: Profile }) {
  const [index, select] = useState(
    Math.max(
      0,
      proxies.findIndex((p) => p.test.test(role.family)),
    ),
  );
  const grade = Number(role.grade.match(/\d+/)?.[0] || 3);
  const [factor, setFactor] = useState(
    Math.round(100 * Math.pow(1.15, Math.max(1, Math.min(7, grade)) - 3)),
  );
  const proxy = proxies[index];
  const rows = markets.map(([market, currency, wage]) => ({
    market,
    currency,
    wage,
    estimate:
      Math.round((((wage * proxy.mean) / 65470) * factor) / 100 / 100) * 100,
  }));
  return (
    <>
      <h2>G7 annual gross pay</h2>
      <p>
        Planning estimates in local currency for {role.title}. Adjust the
        occupation proxy and grade assumption to suit the role.
      </p>
      <div className="filters">
        <label>
          Occupation proxy
          <select value={index} onChange={(e) => select(+e.target.value)}>
            {proxies.map((p, i) => (
              <option key={p.name} value={i}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Grade multiplier (%)
          <input
            type="number"
            min="0"
            max="500"
            value={factor}
            onChange={(e) =>
              setFactor(Math.max(0, Math.min(500, +e.target.value)))
            }
          />
        </label>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Market</th>
              <th>Currency</th>
              <th>2025 average wage</th>
              <th>Modelled role pay</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.market}>
                <th>{r.market}</th>
                <td>{r.currency}</td>
                <td>{r.wage.toLocaleString("en-US")}</td>
                <td>{r.estimate.toLocaleString("en-US")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        onClick={() =>
          exportTable("g7-salary-estimates.csv", [
            [
              "Role",
              "Grade",
              "Country",
              "Currency",
              "Modelled annual gross pay",
              "Occupation proxy",
              "Grade multiplier (%)",
            ],
            ...rows.map((r) => [
              role.title,
              role.grade,
              r.market,
              r.currency,
              r.estimate,
              proxy.name,
              factor,
            ]),
          ])
        }
      >
        Export salary CSV
      </button>
      <details>
        <summary>Salary methodology and sources</summary>
        <p>
          Each country's OECD 2025 average wage is multiplied by the selected
          occupation's US mean wage relative to the US all-occupation mean (USD
          65,470), then by the grade multiplier. The default increases 15% per
          grade around grade 3. Grade adjustments and international occupation
          premiums are modelling assumptions. Results are rounded to the nearest
          100 local currency units.
        </p>
        <p>
          <a href="https://www.bls.gov/oes/2023/May/oes_nat.htm">
            BLS May 2023 occupation means
          </a>{" "}
          ·{" "}
          <a href="https://doi.org/10.1787/3a5169ef-en">
            OECD Taxing Wages 2026
          </a>
        </p>
      </details>
    </>
  );
}

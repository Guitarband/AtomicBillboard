import Link from "next/link";
import { catalogueCoverage } from "../../lib/catalogue/coverage";
import { catalogueHref } from "../../lib/catalogue/browse";

const number = new Intl.NumberFormat("en-US");

export async function Coverage() {
  const data = await catalogueCoverage();
  const measures = [
    ["Industries", data.industries], ["Departments", data.departments],
    ["Role profiles", data.profiles], ["Atomic steps", data.steps],
  ] as const;
  return <section className="coverage" aria-labelledby="coverage-title">
    <div className="coverage-totals">
      <header><h2 id="coverage-title">Catalogue coverage</h2><small>{data.sample ? "Sample collection" : "Imported records"}</small></header>
      <dl>{measures.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{number.format(value)}</dd></div>)}</dl>
    </div>
    <div className="department-ranking">
      <header><h2>Leading departments</h2><small>Role profiles</small></header>
      <ol>{data.ranked.map(d => <li key={JSON.stringify([d.area,d.name])}>
        <Link href={catalogueHref({ sector: d.area, domain: d.name }, data.sample)} prefetch={false}>
          <span>{d.name}</span><span className="rank-track" aria-hidden="true"><i style={{width: (d.profiles / data.ranked[0].profiles * 100) + "%"}}/></span>
          <strong>{number.format(d.profiles)}</strong><small>{d.area}</small>
        </Link>
      </li>)}</ol>
    </div>
  </section>;
}

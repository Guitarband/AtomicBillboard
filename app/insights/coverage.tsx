import Link from "next/link";
import { leadingDepartments } from "../../lib/catalogue/coverage";
import { catalogueHref } from "../../lib/catalogue/browse";

const number = new Intl.NumberFormat("en-US");

export async function LeadingDepartments() {
  const data = await leadingDepartments();
  return <section className="department-ranking" aria-labelledby="departments-title">
      <header><h2 id="departments-title">Leading departments</h2><small>{data.sample ? "Sample collection · " : ""}Role profiles</small></header>
      <ol>{data.ranked.map(d => <li key={JSON.stringify([d.area,d.name])}>
        <Link href={catalogueHref({ sector: d.area, domain: d.name }, data.sample)} prefetch={false}>
          <span>{d.name}</span><span className="rank-track" aria-hidden="true"><i style={{width: (d.profiles / data.ranked[0].profiles * 100) + "%"}}/></span>
          <strong>{number.format(d.profiles)}</strong><small>{d.area}</small>
        </Link>
      </li>)}</ol>
  </section>;
}

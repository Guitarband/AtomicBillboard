import "server-only";
import { unstable_cache } from "next/cache";
import { db } from "../db";
import { sampleRoles } from "./browse";

type Department = { area: string; name: string; profiles: number };

function rank(departments: Department[]) {
  return departments.sort((a, b) => b.profiles - a.profiles || a.name.localeCompare(b.name) || a.area.localeCompare(b.area)).slice(0, 3);
}

const liveDepartments = unstable_cache(async () => {
  const groups = await db.rolePackage.groupBy({ by: ["businessArea", "department"], _count: { _all: true } });
  return rank(groups.map(g => ({ area: g.businessArea, name: g.department, profiles: g._count._all })));
}, ["leading-departments-v1"], { revalidate: 300 });

export async function leadingDepartments() {
  if (process.env.DATABASE_URL) {
    try {
      const ranked = await liveDepartments();
      if (ranked.length) return { ranked, sample: false };
    } catch { console.warn("Department ranking unavailable. Showing sample departments."); }
  }
  const departments = new Map<string, Department>();
  for (const role of await sampleRoles()) {
    const key = JSON.stringify([role.businessArea, role.department]);
    const group = departments.get(key) ?? { area: role.businessArea, name: role.department, profiles: 0 };
    group.profiles++;
    departments.set(key, group);
  }
  return { ranked: rank([...departments.values()]), sample: true };
}

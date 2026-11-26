import "server-only";
import { unstable_cache } from "next/cache";
import { Prisma } from "@prisma/client";
import { db } from "../db";
import { sampleRoles } from "./browse";

type Department = { area: string; name: string; profiles: number };

function summarise(departments: Department[], steps: number, sample: boolean) {
  const ranked = [...departments].sort((a, b) =>
    b.profiles - a.profiles || a.name.localeCompare(b.name) || a.area.localeCompare(b.area));
  return {
    sample, steps, industries: new Set(departments.map(d => d.area)).size,
    departments: departments.length, profiles: departments.reduce((n, d) => n + d.profiles, 0),
    ranked: ranked.slice(0, 3),
  };
}

const liveCoverage = unstable_cache(async () => {
  const byDepartment = db.rolePackage.groupBy({ by: ["businessArea", "department"], _count: { _all: true } });
  const [groups, steps] = await db.$transaction([
    byDepartment,
    db.atomicTask.count(),
  ], { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead });
  return summarise(groups.map(g => ({ area: g.businessArea, name: g.department, profiles: g._count._all })), steps, false);
}, ["catalogue-coverage-v1"], { revalidate: 300 });

export async function catalogueCoverage() {
  if (process.env.DATABASE_URL) {
    try {
      const result = await liveCoverage();
      if (result.profiles) return result;
    } catch { console.warn("Catalogue coverage unavailable. Showing sample coverage."); }
  }
  const departments = new Map<string, Department>();
  let steps = 0;
  for (const role of await sampleRoles()) {
    const key = JSON.stringify([role.businessArea, role.department]);
    const group = departments.get(key) ?? { area: role.businessArea, name: role.department, profiles: 0 };
    group.profiles++;
    departments.set(key, group);
    for (const task of role.tasks) for (const sub of task.subtasks) steps += sub.atomicTasks.length;
  }
  return summarise([...departments.values()], steps, true);
}

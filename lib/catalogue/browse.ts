import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { Prisma, type RolePackage } from "@prisma/client";
import { db } from "../db";
import { parseMasterCsv, type CatalogueRole } from "./master.mjs";

export type Trail = { sector?: string; domain?: string; role?: string };
export type Choice = { value: string; title: string; detail: string; description?: string | null; family?: string | null; grade?: string | null };
type View =
  | { kind: "choices"; choices: Choice[] }
  | { kind: "map"; role: CatalogueRole }
  | { kind: "missing" }
  | { kind: "unavailable" };

export function catalogueHref(trail: Trail = {}, sample = false) {
  const params = new URLSearchParams();
  if (trail.sector) params.set("sector", trail.sector);
  if (trail.domain) params.set("domain", trail.domain);
  if (trail.role) params.set("role", trail.role);
  if (sample) params.set("sample", "1");
  return params.size ? `/?${params}` : "/?explore=1";
}

function groupChoice(name: string, count: number, unit: string): Choice {
  return { value: name, title: name, detail: `${count} ${unit}${count === 1 ? "" : "s"}` };
}

function roleChoice(role: RolePackage): Choice {
  return {
    value: role.rolePackageId, title: role.levelledTitle, description: role.gradeDescription, family: role.roleFamily, grade: role.jobGrade,
    detail: [role.jobGrade, role.rolePackageId].filter(Boolean).join(" / "),
  };
}

async function liveView({ sector, domain, role }: Trail): Promise<View> {
  if (!sector) {
    const populated = { roles: { some: {} } };
    const areas = await db.businessArea.findMany({
      where: { departments: { some: populated } }, orderBy: { name: "asc" },
      select: { name: true, _count: { select: { departments: { where: populated } } } },
    });
    return { kind: "choices", choices: areas.map(area => groupChoice(area.name, area._count.departments, "business domain")) };
  }
  if (!domain) {
    const departments = await db.department.findMany({
      where: { businessArea: sector, roles: { some: {} } }, orderBy: { name: "asc" },
      select: { name: true, _count: { select: { roles: true } } },
    });
    return departments.length ? { kind: "choices", choices: departments.map(item => groupChoice(item.name, item._count.roles, "role")) } : { kind: "missing" };
  }
  const scope = { businessArea: sector, department: domain };
  if (!role) {
    const roles = await db.rolePackage.findMany({ where: scope, orderBy: [{ levelledTitle: "asc" }, { rolePackageId: "asc" }] });
    return roles.length ? { kind: "choices", choices: roles.map(roleChoice) } : { kind: "missing" };
  }
  const selected = await db.rolePackage.findFirst({
    where: { ...scope, rolePackageId: role },
    include: {
      tasks: { orderBy: [{ position: "asc" }, { taskId: "asc" }], include: {
        subtasks: { orderBy: [{ position: "asc" }, { subtaskId: "asc" }], include: {
          atomicTasks: { orderBy: [{ position: "asc" }, { atomicId: "asc" }] },
        } },
      } },
    },
  });
  return selected ? { kind: "map", role: selected } : { kind: "missing" };
}

let examples: Promise<CatalogueRole[]> | undefined;
async function sampleView({ sector, domain, role }: Trail): Promise<View> {
  examples ??= readFile(join(process.cwd(), "prisma", "sample-roles.csv"), "utf8").then(parseMasterCsv);
  const roles = await examples;
  if (!sector) {
    const sectors = [...new Set(roles.map(item => item.businessArea))].sort();
    return { kind: "choices", choices: sectors.map(name => {
      const domains = new Set(roles.filter(item => item.businessArea === name).map(item => item.department));
      return groupChoice(name, domains.size, "business domain");
    }) };
  }
  const inSector = roles.filter(item => item.businessArea === sector);
  if (!domain) {
    const names = [...new Set(inSector.map(item => item.department))].sort();
    return names.length ? { kind: "choices", choices: names.map(name => groupChoice(name, inSector.filter(item => item.department === name).length, "role")) } : { kind: "missing" };
  }
  const inDomain = inSector.filter(item => item.department === domain);
  if (!role) {
    return inDomain.length ? { kind: "choices", choices: inDomain.map(roleChoice).sort((a, b) => a.title.localeCompare(b.title)) } : { kind: "missing" };
  }
  const selected = inDomain.find(item => item.rolePackageId === role);
  return selected ? { kind: "map", role: selected } : { kind: "missing" };
}

export async function browseCatalogue(trail: Trail, sampleRequested: boolean) {
  if (sampleRequested) return { view: await sampleView(trail), sample: true, offline: false };
  if (process.env.DATABASE_URL) {
    try {
      const view = await liveView(trail);
      if (trail.sector || view.kind !== "choices" || view.choices.length) return { view, sample: false, offline: false };
      return { view: await sampleView({}), sample: true, offline: false };
    } catch (error) {
      const unavailable = error instanceof Prisma.PrismaClientInitializationError ||
        (error instanceof Prisma.PrismaClientKnownRequestError && ["P1001", "P1002", "P1017", "P2021", "P2022", "P2024"].includes(error.code));
      if (!unavailable) throw error;
      console.error("Role catalogue unavailable", error instanceof Prisma.PrismaClientKnownRequestError ? error.code : "connection");
    }
  }
  if (trail.sector) return { view: { kind: "unavailable" } as const, sample: false, offline: true };
  return { view: await sampleView({}), sample: true, offline: !!process.env.DATABASE_URL };
}

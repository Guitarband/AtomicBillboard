import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { db } from "../db";
import { parseMasterCsv, type CatalogueRole } from "../catalogue/master.mjs";
import { numericScore, type Profile } from "./model";

type InputRole = Pick<
  CatalogueRole,
  | "businessArea"
  | "department"
  | "roleFamily"
  | "levelledTitle"
  | "jobGrade"
  | "rolePackageId"
> & {
  tasks: {
    taskId: string;
    title: string;
    subtasks: {
      subtaskId: string;
      title: string;
      atomicTasks: Pick<
        CatalogueRole["tasks"][number]["subtasks"][number]["atomicTasks"][number],
        | "title"
        | "atomicId"
        | "humanInvolvement"
        | "sfiaLevel"
        | "automationPropensity"
        | "actionType"
        | "workResult"
        | "riskIfFailed"
        | "controlQuality"
      >[];
    }[];
  }[];
};
function profile(r: InputRole): Profile {
  return {
    id: r.rolePackageId,
    title: r.levelledTitle,
    family: r.roleFamily || r.levelledTitle,
    area: r.businessArea,
    department: r.department,
    grade: r.jobGrade || "",
    steps: r.tasks.flatMap((t) =>
      t.subtasks.flatMap((sub) =>
        sub.atomicTasks.map((a) => ({
          id: JSON.stringify([t.taskId, sub.subtaskId, a.atomicId]),
          title: a.title,
          flow: t.title,
          flowId: t.taskId,
          sub: sub.title,
          human: a.humanInvolvement || "",
          score: numericScore(a.automationPropensity),
          sfia: a.sfiaLevel || "",
          action: a.actionType || "",
          result: a.workResult || "",
          risk: a.riskIfFailed || "",
          control: a.controlQuality || "",
        })),
      ),
    ),
  };
}
async function live() {
  const rows = await db.rolePackage.findMany({
    orderBy: [{ levelledTitle: "asc" }, { rolePackageId: "asc" }],
    include: {
      tasks: {
        orderBy: { position: "asc" },
        select: {
          taskId: true,
          title: true,
          subtasks: {
            orderBy: { position: "asc" },
            select: {
              subtaskId: true,
              title: true,
              atomicTasks: {
                orderBy: { position: "asc" },
                select: {
                  atomicId: true,
                  title: true,
                  automationPropensity: true,
                  sfiaLevel: true,
                  humanInvolvement: true,
                  actionType: true,
                  workResult: true,
                  controlQuality: true,
                  riskIfFailed: true,
                },
              },
            },
          },
        },
      },
    },
  });
  return rows.map(profile);
}
let cached: { expires: number; value: Promise<Profile[]> } | undefined;
export async function catalogue(sample = false) {
  if (!sample && process.env.DATABASE_URL) {
    try {
      if (!cached || cached.expires < Date.now())
        cached = { expires: Date.now() + 300000, value: live() };
      const roles = await cached.value;
      if (roles.length) return { roles, sample: false };
    } catch {
      cached = undefined;
      throw new Error("Live catalogue unavailable");
    }
  }
  const csv = await readFile(
    path.join(process.cwd(), "prisma/sample-roles.csv"),
    "utf8",
  );
  return { roles: parseMasterCsv(csv).map(profile), sample: true };
}

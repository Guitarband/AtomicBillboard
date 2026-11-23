import type { AtomicTask, RolePackage } from "@prisma/client";

export type CatalogueAtomic = Omit<AtomicTask, "rolePackageId" | "taskId" | "subtaskId" | "position">;
export type CatalogueSubtask = { subtaskId: string; title: string; atomicTasks: CatalogueAtomic[] };
export type CatalogueTask = { taskId: string; title: string; subtasks: CatalogueSubtask[] };
export type CatalogueRole = RolePackage & { tasks: CatalogueTask[] };

export function parseMasterCsv(csv: string): CatalogueRole[];

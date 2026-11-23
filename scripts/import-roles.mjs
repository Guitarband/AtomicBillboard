import { readFile } from "node:fs/promises";
import { PrismaClient } from "@prisma/client";
import { parseMasterCsv } from "../lib/catalogue/master.mjs";

const file = process.argv[2];
if (!file || process.argv.length !== 3) {
  console.error('Usage: npm run catalog:import -- "path/to/master.csv"');
  process.exitCode = 1;
} else {
  const db = new PrismaClient();
  try {
    const roles = parseMasterCsv(await readFile(file, "utf8"));
    for (const { tasks, ...role } of roles) {
      const { rolePackageId, businessArea, department } = role;
      const domainKey = { businessArea, name: department };
      const writes = [
        db.businessArea.upsert({ where: { name: businessArea }, create: { name: businessArea }, update: {} }),
        db.department.upsert({ where: { businessArea_name: domainKey }, create: domainKey, update: {} }),
        db.rolePackage.upsert({ where: { rolePackageId }, create: role, update: role }),
      ];
      for (const [position, task] of tasks.entries()) {
        const taskKey = { rolePackageId, taskId: task.taskId };
        const taskData = { title: task.title, position };
        writes.push(db.roleTask.upsert({
          where: { rolePackageId_taskId: taskKey }, create: { ...taskKey, ...taskData }, update: taskData,
        }));
        for (const [position, subtask] of task.subtasks.entries()) {
          const subtaskKey = { ...taskKey, subtaskId: subtask.subtaskId };
          const subtaskData = { title: subtask.title, position };
          writes.push(db.roleSubtask.upsert({
            where: { rolePackageId_taskId_subtaskId: subtaskKey }, create: { ...subtaskKey, ...subtaskData }, update: subtaskData,
          }));
          for (const [position, { atomicId, ...fields }] of subtask.atomicTasks.entries()) {
            const atomicKey = { ...subtaskKey, atomicId };
            const data = { ...fields, position };
            writes.push(db.atomicTask.upsert({
              where: { rolePackageId_taskId_subtaskId_atomicId: atomicKey }, create: { ...atomicKey, ...data }, update: data,
            }));
          }
        }
      }
      await db.$transaction(writes);
    }
    console.log(`Imported ${roles.length} role package${roles.length === 1 ? "" : "s"}.`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await db.$disconnect();
  }
}

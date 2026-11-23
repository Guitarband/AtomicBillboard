import type { CatalogueAtomic, CatalogueRole } from "../../lib/catalogue/master.mjs";

export type Task = {
  id: string;
  sourceId: string;
  title: string;
  level: "High-level task" | "Subtask" | "Atomic task";
  children?: Task[];
  atomic?: CatalogueAtomic;
};

// Each source ID is local to its parent. Encoding the whole path also preserves
// IDs containing punctuation and distinguishes task, subtask and atomic nodes.
export function roleTaskTree(role: CatalogueRole): Task[] {
  return role.tasks.map(task => {
    const taskPath = [role.rolePackageId, task.taskId];
    return {
      id: JSON.stringify(taskPath), sourceId: task.taskId, title: task.title, level: "High-level task",
      children: task.subtasks.map(subtask => {
        const subtaskPath = [...taskPath, subtask.subtaskId];
        return {
          id: JSON.stringify(subtaskPath), sourceId: subtask.subtaskId, title: subtask.title, level: "Subtask",
          children: subtask.atomicTasks.map(atomic => ({
            id: JSON.stringify([...subtaskPath, atomic.atomicId]), sourceId: atomic.atomicId,
            title: atomic.title, level: "Atomic task", atomic,
          })),
        };
      }),
    };
  });
}

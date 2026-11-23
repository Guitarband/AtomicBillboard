import { parse } from "csv-parse/sync";

const roleFields = {
  "Role package ID": "rolePackageId",
  "Business Area": "businessArea",
  "Department": "department",
  "Role Family / source title": "roleFamily",
  "Levelled role title": "levelledTitle",
  "Job grade": "jobGrade",
  "Grade description": "gradeDescription",
};

const atomicFields = {
  "Atomic ID": "atomicId",
  "Atomic Task": "title",
  "SFIA Level (indicative)": "sfiaLevel",
  "Automation propensity (est)": "automationPropensity",
  "Human Involvement": "humanInvolvement",
  "Work Result": "workResult",
  "Evidence": "evidence",
  "Control / Quality": "controlQuality",
  "Potential risk if failed": "riskIfFailed",
  "Action type": "actionType",
  "Record Basis": "recordBasis",
  "Validation Status": "validationStatus",
};

const headers = [...Object.keys(roleFields), "task ID", "Task", "SubTask ID", "Subtask", ...Object.keys(atomicFields)];
const required = ["Business Area", "Department", "Levelled role title", "Role package ID", "task ID", "Task", "SubTask ID", "Subtask", "Atomic ID", "Atomic Task"];

function readFields(row, fields) {
  return Object.fromEntries(Object.entries(fields).map(([header, key]) => [key, row[header].trim() || null]));
}

// Source IDs may repeat below different parents. A conflicting definition at the
// same path is an import error rather than a last-row-wins change of meaning.
function group(index, key, fields, children, line) {
  const existing = index.get(key);
  if (existing) {
    for (const field of Object.keys(fields)) {
      if (existing[field] !== fields[field]) {
        throw new Error(`Line ${line}: conflicting ${field} for ${key}.`);
      }
    }
    return existing;
  }
  const item = { ...fields, ...children };
  index.set(key, item);
  return item;
}

export function parseMasterCsv(csv) {
  const records = parse(csv, {
    bom: true,
    skip_empty_lines: true,
    info: true,
    columns(raw) {
      const names = raw.map(name => name.trim());
      const missing = headers.filter(header => !names.includes(header));
      if (missing.length) throw new Error(`Missing columns: ${missing.join(", ")}.`);
      if (new Set(names).size !== names.length) throw new Error("The header contains duplicate column names.");
      return names;
    },
  });
  if (!records.length) throw new Error("The catalogue file has no data rows.");

  const roles = new Map();
  for (const { record, info } of records) {
    const missing = required.find(header => !record[header].trim());
    if (missing) throw new Error(`Line ${info.lines}: ${missing} is required.`);
    const roleFieldsForRow = readFields(record, roleFields);
    const role = group(roles, roleFieldsForRow.rolePackageId, roleFieldsForRow, { tasks: new Map() }, info.lines);
    const taskId = record["task ID"].trim();
    const task = group(role.tasks, taskId, { taskId, title: record.Task.trim() }, { subtasks: new Map() }, info.lines);
    const subtaskId = record["SubTask ID"].trim();
    const subtask = group(task.subtasks, subtaskId, { subtaskId, title: record.Subtask.trim() }, { atomicTasks: new Map() }, info.lines);
    const atomic = readFields(record, atomicFields);
    group(subtask.atomicTasks, atomic.atomicId, atomic, {}, info.lines);
  }

  return Array.from(roles.values(), role => ({
    ...role,
    tasks: Array.from(role.tasks.values(), task => ({
      ...task,
      subtasks: Array.from(task.subtasks.values(), subtask => ({
        ...subtask, atomicTasks: Array.from(subtask.atomicTasks.values()),
      })),
    })),
  }));
}

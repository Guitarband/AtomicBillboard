import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
import { parseMasterCsv } from "../lib/catalogue/master.mjs";

function loadTypeScript(path) {
  const source = readFileSync(new URL(path, import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const module = { exports: {} };
  new Function("module", "exports", compiled)(module, module.exports);
  return module.exports;
}

const { roleTaskTree } = loadTypeScript("../app/tasks/data.ts");
const { layoutTasks, findTask } = loadTypeScript("../app/tasks/graph-layout.ts");
const roles = parseMasterCsv(readFileSync(new URL("../prisma/sample-roles.csv", import.meta.url), "utf8"));
const role = roles.find(item => item.rolePackageId === "DEMO-LEND-05");
const tasks = roleTaskTree(role);

test("opening a branch reveals only that subtree and its atomic details", () => {
  const task = tasks[0], firstBranch = task.children[0], sibling = task.children[1];
  assert.equal(layoutTasks(tasks, new Set()).length, tasks.length);
  const graph = layoutTasks(tasks, new Set([task.id, firstBranch.id]));
  const ids = new Set(graph.map(node => node.task.id));
  assert.ok(ids.has(firstBranch.children[0].id));
  assert.ok(!ids.has(sibling.children[0].id));
  const atomic = findTask(tasks, firstBranch.children[0].id);
  assert.equal(atomic.sourceId, "A01");
  assert.equal(atomic.atomic.evidence, "Intake form and identity check log.");
  assert.equal(atomic.atomic.validationStatus, "Unvalidated sample");
  assert.equal(findTask(tasks, "missing"), undefined);
});

test("reused source IDs produce distinct nodes within and across roles", () => {
  const allIds = new Set();
  for (const role of roles) {
    const roots = roleTaskTree(role);
    const expanded = new Set(roots.flatMap(task => [task.id, ...task.children.map(child => child.id)]));
    const graph = layoutTasks(roots, expanded);
    const ids = new Set(graph.map(node => node.task.id));
    assert.equal(graph.length, ids.size);
    for (const node of graph) {
      assert.ok(!allIds.has(node.task.id));
      allIds.add(node.task.id);
      assert.ok(Number.isFinite(node.x) && Number.isFinite(node.y));
      assert.ok(node.x >= node.radius && node.x <= 960 - node.radius);
      assert.ok(node.y >= node.radius && node.y <= 650 - node.radius);
      if (node.parentId) assert.ok(ids.has(node.parentId));
    }
  }
});

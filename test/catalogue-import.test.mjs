import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { parseMasterCsv } from "../lib/catalogue/master.mjs";

const csv = readFileSync(new URL("../prisma/sample-roles.csv", import.meta.url), "utf8");
const [header, first] = csv.trimEnd().split(/\r?\n/);

test("catalogue rows retain quoted evidence, optional blanks and source scales", () => {
  const row = first.replace("Intake form and identity check log.", '"Signed form, page 1\r\nReview log"')
    .replace(",High,", ",30–50%,").replace(",A01,", ",0007,").replace(",Illustrative workflow,", ",,");
  const [role] = parseMasterCsv(`\uFEFF${header}\r\n${row}\r\n${row}`);
  assert.equal(role.jobGrade, "G5");
  assert.equal(role.department, "Lending operations");
  const atoms = role.tasks[0].subtasks[0].atomicTasks;
  assert.equal(atoms.length, 1);
  assert.equal(atoms[0].atomicId, "0007");
  assert.equal(atoms[0].automationPropensity, "30–50%");
  assert.equal(atoms[0].recordBasis, null);
  assert.equal(atoms[0].evidence, "Signed form, page 1\r\nReview log");
});

test("invalid master files identify missing columns, IDs or contradictory definitions", () => {
  assert.throws(() => parseMasterCsv(csv.replace("Job grade,", "")), /Missing columns: Job grade/);
  assert.throws(() => parseMasterCsv(`${header}\n${first.replace(",T01,", ",,")}`), /task ID is required/);
  assert.throws(() => parseMasterCsv(`${header}\n${first}\n${first.replace("Credit analyst", "Branch manager")}`), /conflicting levelledTitle/);
  assert.throws(() => parseMasterCsv(`${header}\n${first}\n${first.replace("Assess a credit file", "Process payments")}`), /conflicting title/);
  assert.throws(() => parseMasterCsv(`${header}\n${first}\n${first.replace(",High,", ",Low,")}`), /conflicting automationPropensity/);
});

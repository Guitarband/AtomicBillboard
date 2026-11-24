import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import ts from "typescript";

const source = readFileSync(new URL("../lib/intelligence/model.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { numericScore, average, eligible, matchWorkflows } = await import("data:text/javascript;base64," + Buffer.from(compiled).toString("base64"));

test("scoring handles source percentages, fractions, qualitative estimates and missing values", () => {
  assert.deepEqual(["65%", "0.65", "85", "High", "Unknown", "101%", null].map(numericScore), [65,65,85,85,null,null,null]);
  const steps = [{score:90,time:1},{score:30,time:5},{score:null,time:8}];
  assert.equal(average(steps),60);
  assert.equal(average(steps,true,s=>s.time),40);
  assert.equal(average(steps,true,()=>0),null);
});

test("protected decisions and missing controls are excluded even at high propensity", () => {
  assert.equal(eligible({score:95, human:"Human decision under delegation",action:"Approval"}),false);
  assert.equal(eligible({score:95,human:"",action:"Data entry"}),false);
  assert.equal(eligible({score:85,human:"Exception review",action:"Records"}),true);
});

test("brief matching keeps distinct workflow IDs and returns no plans for unrelated terms", () => {
  const role = {title:"Analyst",department:"Banking",steps:[{flow:"Review AML alert",flowId:"A",title:"Record review"},{flow:"Prepare report",flowId:"B",title:"Record review"}]};
  assert.deepEqual(matchWorkflows([role],["aml"]).map(m=>m.flowId),["A"]);
  assert.deepEqual(matchWorkflows([role],["absent"]),[]);
});


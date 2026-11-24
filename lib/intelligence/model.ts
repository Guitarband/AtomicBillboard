export type Step = {
  id: string;
  title: string;
  flow: string;
  flowId: string;
  sub: string;
  score: number | null;
  human: string;
  sfia: string;
  action: string;
  result: string;
  risk: string;
  control: string;
};
export type Profile = {
  id: string;
  title: string;
  family: string;
  area: string;
  department: string;
  grade: string;
  steps: Step[];
};

export function numericScore(value: string | null) {
  if (!value) return null;
  const match = /^(\d+(?:\.\d+)?)\s*(%)?$/.exec(value.trim());
  if (!match)
    return (
      ({ high: 85, medium: 55, low: 25 } as Record<string, number>)[
        value.toLowerCase()
      ] ?? null
    );
  const n = Number(match[1]);
  const score = !match[2] && n > 0 && n < 1 ? n * 100 : n;
  return score <= 100 ? score : null;
}
export const protectedStep = (s: Step) =>
  /human (decision|execut|interaction)|policy owner|delegat(ed|ion)|customer interaction|human.led/i.test(
    s.human + " " + s.action,
  );
export const eligible = (s: Step, threshold = 65) =>
  s.score !== null && s.score >= threshold && !!s.human && !protectedStep(s);
export const minutes = (s: Step): number =>
  protectedStep(s)
    ? 15
    : /analy|assess|investigat/i.test(s.action)
      ? 10
      : /record|evidence/i.test(s.action)
        ? 2
        : 5;
export function average(steps: Step[], weighted = false, time = minutes) {
  let total = 0,
    weight = 0;
  for (const s of steps) {
    if (s.score === null) continue;
    const w = weighted ? time(s) : 1;
    weight += w;
    total += s.score * w;
  }
  return weight ? Math.round(total / weight) : null;
}
export const pct = (n: number | null) => (n === null ? "Unscored" : n + "%");
export const roleUrl = (p: Profile, sample = false) =>
  "/?" +
  new URLSearchParams({
    sector: p.area,
    domain: p.department,
    role: p.id,
    ...(sample ? { sample: "1" } : {}),
  });
export const toolsIndex = [
  [
    "scores",
    "Role scoring",
    "Compare workflows and filter atomic steps by suitability and human oversight.",
  ],
  [
    "impact",
    "Adoption model",
    "Model handling time, review effort and first-year costs for a workflow.",
  ],
  [
    "planner",
    "Problem planner",
    "Trace an operational problem to roles, workflows and human checkpoints.",
  ],
  [
    "reuse",
    "Patterns & outcomes",
    "Find work shared across roles and the outcomes those roles can influence.",
  ],
  [
    "pay",
    "Salary benchmarks",
    "Compare annual pay scenarios across the seven G7 markets.",
  ],
] as const;
export const topics = [
  {
    title: "Reduce AML false positives",
    terms: [
      "aml",
      "financial crime",
      "transaction monitoring",
      "suspicious",
      "sanctions",
    ],
    kpi: "False-positive alerts per 100 alerts reviewed",
    check:
      "Review escalations and sample closed alerts for missed suspicious activity.",
  },
  {
    title: "Speed up credit decisions",
    terms: ["credit", "underwriting", "lending", "loan", "mortgage"],
    kpi: "Median time from complete application to decision",
    check:
      "Keep delegated credit decisions and exception approvals with the accountable lender.",
  },
  {
    title: "Shorten the financial close",
    terms: [
      "reconciliation",
      "general ledger",
      "financial close",
      "accounting",
    ],
    kpi: "Working days from period end to approved close",
    check:
      "Require the controller to release journals and sign off reconciliations.",
  },
  {
    title: "Resolve customer complaints sooner",
    terms: ["complaint", "dispute", "customer service", "customer support"],
    kpi: "Median working days to resolve a complaint",
    check: "Review redress, material communications and unresolved complaints.",
  },
  {
    title: "Reduce payment repairs",
    terms: ["payment", "settlement", "clearing", "transfer"],
    kpi: "Repair cases per 1,000 payments",
    check: "Require authorised release of exceptions and payment corrections.",
  },
  {
    title: "Improve account opening",
    terms: ["account opening", "onboarding", "deposit", "identity"],
    kpi: "Share of applications completed without rework",
    check:
      "Have an accountable reviewer resolve identity and evidence exceptions.",
  },
];
export function matchWorkflows(roles: Profile[], terms: string[]) {
  const matches: {
    role: Profile;
    flow: string;
    flowId: string;
    steps: Step[];
    rank: number;
  }[] = [];
  for (const role of roles) {
    const flows = new Map<string, Step[]>();
    for (const s of role.steps) {
      if (!flows.has(s.flowId)) flows.set(s.flowId, []);
      flows.get(s.flowId)!.push(s);
    }
    for (const [flowId, steps] of flows) {
      const flow = steps[0].flow;
      const rank = terms.reduce(
        (sum, t) =>
          sum +
          (role.title.toLowerCase().includes(t) ? 4 : 0) +
          (flow.toLowerCase().includes(t) ? 5 : 0) +
          (role.department.toLowerCase().includes(t) ? 2 : 0) +
          (steps.some((s) => s.title.toLowerCase().includes(t)) ? 1 : 0),
        0,
      );
      if (rank) matches.push({ role, flow, flowId, steps, rank });
    }
  }
  return matches.sort(
    (a, b) =>
      b.rank - a.rank ||
      b.steps.length - a.steps.length ||
      a.role.title.localeCompare(b.role.title),
  );
}

"use server";

import { z } from "zod";
import { browseCatalogue } from "../../lib/catalogue/browse";
import { findTaskPath } from "../tasks/graph-layout";
import { roleTaskTree } from "../tasks/data";

export async function resolveShortlist(hrefs: string[]) {
  const batch = z.array(z.string().max(8192)).max(8).parse(hrefs);
  const roles = new Map<string, ReturnType<typeof browseCatalogue>>();
  return Promise.all(batch.map(async href => {
    const params = new URLSearchParams(href.split("?")[1]);
    const [sector, domain, role] = ["sector", "domain", "role"].map(key => params.get(key));
    const sample = params.get("sample") === "1";
    if (!sector || !domain || !role) return null;
    const key = JSON.stringify([sector, domain, role, sample]);
    const result = roles.get(key) ?? browseCatalogue({ sector, domain, role }, sample);
    roles.set(key, result);
    const { view } = await result;
    if (view.kind !== "map") return null;
    const node = params.get("node");
    if (!node) return { title: view.role.levelledTitle, context: [domain, view.role.jobGrade].filter(Boolean).join(" · ") };
    const path = findTaskPath(roleTaskTree(view.role), node);
    return path.at(-1)?.atomic ? { title: path.at(-1)!.title, context: [view.role.levelledTitle, ...path.slice(0,-1).map(t => t.title)].join(" / ") } : null;
  }));
}

export function selectionHref(roleHref: string, node: string) {
  const [path, search] = roleHref.split("?");
  const params = new URLSearchParams(search);
  params.set("node", node);
  return path + "?" + params;
}

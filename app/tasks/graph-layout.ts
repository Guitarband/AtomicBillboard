import type { Task } from "./data";

export type GraphNode = { task: Task; parentId: string | null; depth: number; x: number; y: number; radius: number; vx: number; vy: number; anchorX: number; anchorY: number };

/** Build a deterministic force-directed layout for the currently visible branches. */
export function layoutTasks(roots: Task[], expanded: Set<string>): GraphNode[] {
  const nodes: GraphNode[] = [];
  const add = (task: Task, parent: GraphNode | null, index: number, count: number) => {
    const depth = parent ? parent.depth + 1 : 0;
    const angle = parent ? (Math.PI * 2 * index / count) - Math.PI / 2 + depth * 0.55 : Math.PI + Math.PI * 2 * index / count;
    const anchorX = parent ? parent.x + Math.cos(angle) * 158 : 480 + (count === 1 ? 0 : Math.cos(angle) * 190);
    const anchorY = parent ? parent.y + Math.sin(angle) * 158 : 325 + (count === 1 ? 0 : Math.sin(angle) * 125);
    const node: GraphNode = {task, parentId: parent?.task.id ?? null, depth, x: anchorX, y: anchorY, anchorX, anchorY, vx: 0, vy: 0, radius: depth === 0 ? 64 : depth === 1 ? 57 : 51};
    nodes.push(node);
    if (expanded.has(task.id)) task.children?.forEach((child, i, all) => add(child, node, i, all.length));
  };
  roots.forEach((root, i) => add(root, null, i, roots.length));
  const byId = new Map(nodes.map(node => [node.task.id, node]));

  for (let tick = 0; tick < 260; tick++) {
    for (const node of nodes) {
      node.vx += (node.anchorX - node.x) * 0.003;
      node.vy += (node.anchorY - node.y) * 0.003;
      const parent = node.parentId ? byId.get(node.parentId) : undefined;
      if (parent) {
        const dx = node.x - parent.x, dy = node.y - parent.y;
        const distance = Math.max(1, Math.hypot(dx, dy));
        const pull = (distance - 155) * 0.012;
        node.vx -= dx / distance * pull; node.vy -= dy / distance * pull;
        parent.vx += dx / distance * pull; parent.vy += dy / distance * pull;
      }
    }
    for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j];
      const dx = b.x - a.x || 0.01, dy = b.y - a.y || 0.01;
      const distance = Math.max(1, Math.hypot(dx, dy));
      const minimum = a.radius + b.radius + 25;
      const force = 950 / (distance * distance) + Math.max(0, minimum - distance) * 0.09;
      a.vx -= dx / distance * force; a.vy -= dy / distance * force;
      b.vx += dx / distance * force; b.vy += dy / distance * force;
    }
    for (const node of nodes) {
      node.vx *= 0.78; node.vy *= 0.78;
      node.x = Math.max(node.radius + 12, Math.min(960 - node.radius - 12, node.x + node.vx));
      node.y = Math.max(node.radius + 12, Math.min(650 - node.radius - 12, node.y + node.vy));
    }
  }
  return nodes;
}

export function findTaskPath(roots: Task[], id: string): Task[] {
  for (const task of roots) {
    if (task.id === id) return [task];
    const path = task.children && findTaskPath(task.children, id);
    if (path?.length) return [task, ...path];
  }
  return [];
}

export function findTask(roots: Task[], id: string): Task | undefined {
  const path = findTaskPath(roots, id);
  return path[path.length - 1];
}

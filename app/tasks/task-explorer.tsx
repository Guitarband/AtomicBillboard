"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type PointerEvent } from "react";
import type { Task } from "./data";
import { findTaskPath, layoutTasks } from "./graph-layout";
import "./map.css";

const levelNames = { "High-level task": "Task", Subtask: "Subtask", "Atomic task": "Atomic step" };

function ViewIcon({ outline }: { outline?: boolean }) {
  return <svg width="17" height="17" viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
    {outline ? <>
      <path d="M6 4h11M8 10h9M8 16h9M3 7v9h2M3 10h2" />
      <rect x="1.5" y="2.5" width="3" height="3" rx=".7" />
    </> : <>
      <path d="m5 9 8-5M5 11l8 5" />
      <rect x="1.5" y="7" width="6" height="6" rx="1.4" fill="currentColor" />
      <circle cx="15.5" cy="3.5" r="2.3" /><circle cx="15.5" cy="16.5" r="2.3" />
    </>}
  </svg>;
}

const compactScreen = "(max-width: 760px)";
function subscribeToWidth(onChange: () => void) {
  const media = window.matchMedia(compactScreen);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function splitTitle(title: string, radius: number) {
  const limit = Math.floor(radius / 4);
  const lines: string[] = [];
  for (const word of title.split(/\s+/)) {
    const last = lines.length - 1;
    if (last >= 0 && `${lines[last]} ${word}`.length <= limit) lines[last] += ` ${word}`;
    else lines.push(word.length > limit ? word.slice(0, limit - 1) + "…" : word);
  }
  if (lines.length > 3) lines[2] = lines[2].slice(0, limit - 1) + "…";
  return lines.slice(0, 3);
}

export function TaskExplorer({ tasks }: { tasks: Task[] }) {
  if (!tasks.length) return <p className="catalogue-message">This role has no tasks yet.</p>;
  const subtasks = tasks.flatMap(task => task.children ?? []);
  const stepCount = subtasks.reduce((total, subtask) => total + (subtask.children?.length ?? 0), 0);
  return <>
    <header className="index-heading">
      <h2>Task index</h2>
      <p>{tasks.length} {tasks.length === 1 ? "task" : "tasks"} <span>·</span> {subtasks.length} {subtasks.length === 1 ? "subtask" : "subtasks"} <span>·</span> {stepCount} atomic {stepCount === 1 ? "step" : "steps"}</p>
    </header>
    <TaskWorkspace tasks={tasks} />
  </>;
}

function TaskWorkspace({ tasks }: { tasks: Task[] }) {
  const [expanded, setExpanded] = useState(() => new Set<string>());
  const [selectedId, setSelectedId] = useState<string | null>(tasks[0].id);
  const compact = useSyncExternalStore(subscribeToWidth, () => window.matchMedia(compactScreen).matches, () => false);
  const [mode, setMode] = useState<"map" | "list">("list");
  const [zoom, setZoom] = useState(1);
  const [mobileDetail, setMobileDetail] = useState(false);
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});
  const svg = useRef<SVGSVGElement>(null);
  const details = useRef<HTMLElement>(null);
  const panel = useRef<HTMLElement>(null);
  const focusDetails = useRef(false);
  const drag = useRef<{ id: string; x: number; y: number; offsetX: number; offsetY: number; moved: boolean } | null>(null);
  const skipClick = useRef(false);
  const graph = useMemo(() => mode === "map" ? layoutTasks(tasks, expanded) : [], [tasks, expanded, mode]);
  const frame = useMemo(() => {
    if (!graph.length) return { x: 480, y: 325, width: 960, height: 650 };
    const left = Math.min(...graph.map(node => node.x - node.radius));
    const right = Math.max(...graph.map(node => node.x + node.radius));
    const top = Math.min(...graph.map(node => node.y - node.radius));
    const bottom = Math.max(...graph.map(node => node.y + node.radius));
    return { x: (left + right) / 2, y: (top + bottom) / 2, width: Math.max(460, right - left + 54), height: Math.max(300, bottom - top + 54) };
  }, [graph]);
  const width = frame.width / zoom, height = frame.height / zoom;
  const path = useMemo(() => selectedId === null ? [] : findTaskPath(tasks, selectedId), [tasks, selectedId]);
  const selected = path.at(-1);
  const parent = path[path.length - 2];
  useEffect(() => {
    details.current?.scrollTo({ top: 0 });
    if (focusDetails.current) {
      details.current?.focus();
      focusDetails.current = false;
    }
  }, [selectedId, mobileDetail]);
  const coords = new Map(graph.map(node => [node.task.id, positions[node.task.id] ?? node]));

  function showDetails(task: Task) {
    focusDetails.current = compact || !!details.current?.contains(document.activeElement);
    setSelectedId(task.id);
    if (compact) setMobileDetail(true);
  }

  function returnToTasks() {
    setMobileDetail(false);
    requestAnimationFrame(() => panel.current?.querySelector<HTMLElement | SVGElement>(
      '[aria-controls="task-details"][aria-pressed="true"]'
    )?.focus());
  }

  function toggle(task: Task) {
    if (!task.children?.length) {
      showDetails(task);
      return;
    }
    setSelectedId(task.id);
    setExpanded(previous => {
      const next = new Set(previous);
      if (next.has(task.id)) next.delete(task.id);
      else next.add(task.id);
      return next;
    });
    setPositions({});
  }

  function chooseFromOutline(task: Task) {
    if (!task.children?.length) {
      showDetails(task);
      return;
    }
    setSelectedId(task.id);
    setExpanded(previous => previous.has(task.id) ? previous : new Set([...previous, task.id]));
  }

  function openChild(parent: Task, child: Task) {
    setExpanded(previous => new Set([...previous, parent.id]));
    showDetails(child);
  }

  function reset() {
    setExpanded(new Set());
    setSelectedId(tasks[0].id);
    setPositions({});
    setZoom(1);
    setMobileDetail(false);
  }

  function canvasPoint(event: PointerEvent<SVGGElement>) {
    const matrix = svg.current?.getScreenCTM();
    if (!svg.current || !matrix) return;
    const p = svg.current.createSVGPoint();
    p.x = event.clientX;
    p.y = event.clientY;
    return p.matrixTransform(matrix.inverse());
  }

  function moveNode(event: PointerEvent<SVGGElement>, id: string, radius: number) {
    const current = drag.current;
    if (!current || current.id !== id) return;
    if (Math.hypot(event.clientX - current.x, event.clientY - current.y) > 4) current.moved = true;
    if (!current.moved) return;
    const point = canvasPoint(event);
    if (!point) return;
    setPositions(previous => ({ ...previous, [id]: {
      x: Math.max(frame.x - width / 2 + radius, Math.min(frame.x + width / 2 - radius, point.x + current.offsetX)),
      y: Math.max(frame.y - height / 2 + radius, Math.min(frame.y + height / 2 - radius, point.y + current.offsetY)),
    } }));
  }

  return <div className="work-map" data-view={mode} data-mobile-detail={mobileDetail}>
    <section ref={panel} className="map-panel" aria-label="Role tasks">
      <div className="map-toolbar">
        <div className="view-switch" role="group" aria-label="Task view">
          <button type="button" aria-pressed={mode === "map"} onClick={() => setMode("map")}><ViewIcon />Map</button>
          <button type="button" aria-pressed={mode === "list"} onClick={() => setMode("list")}><ViewIcon outline />Outline</button>
        </div>
        <div className="map-actions">
          {mode === "map" && <>
            <button type="button" aria-label="Zoom out" disabled={zoom <= 0.8} onClick={() => setZoom(value => Math.max(0.8, +(value - 0.2).toFixed(1)))}>−</button>
            <span aria-label={`Zoom ${Math.round(zoom * 100)} percent`}>{Math.round(zoom * 100)}%</span>
            <button type="button" aria-label="Zoom in" disabled={zoom >= 1.6} onClick={() => setZoom(value => Math.min(1.6, +(value + 0.2).toFixed(1)))}>+</button>
          </>}
          <button className="reset-view" type="button" onClick={reset} aria-label="Reset view">Reset</button>
        </div>
      </div>
      {mode === "list" ? <div className="accessible-list">
        <TaskList items={tasks} expanded={expanded} selectedId={selectedId} onSelect={chooseFromOutline} onToggle={toggle} />
      </div> : <>
        <div className="map-canvas">
          <svg ref={svg} viewBox={`${frame.x - width / 2} ${frame.y - height / 2} ${width} ${height}`} role="group" aria-label="Interactive task map">
            <g aria-hidden="true">{graph.map(node => {
              const parent = node.parentId && coords.get(node.parentId);
              const child = coords.get(node.task.id)!;
              return parent && <line key={node.task.id} x1={parent.x} y1={parent.y} x2={child.x} y2={child.y}
                className={`task-connection${path.some(step => step.id === node.task.id) ? " on-path" : ""}`} />;
            })}</g>
            {graph.map(({ task, depth, radius }) => {
              const position = coords.get(task.id)!;
              const count = task.children?.length ?? 0;
              const active = task.id === selectedId;
              const lines = splitTitle(task.title, radius);
              return <g key={task.id} className={`task-node task-depth-${depth}${active ? " is-selected" : ""}`} transform={`translate(${position.x} ${position.y})`}
                role="button" tabIndex={0} aria-label={`${task.title}, ${levelNames[task.level]}`} aria-controls="task-details"
                aria-expanded={count ? expanded.has(task.id) : undefined} aria-pressed={active}
                onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); toggle(task); } }}
                onClick={() => { if (!skipClick.current) toggle(task); skipClick.current = false; }}
                onPointerDown={event => {
                  if (event.button !== 0) return;
                  const point = canvasPoint(event);
                  if (!point) return;
                  skipClick.current = false;
                  event.currentTarget.setPointerCapture(event.pointerId);
                  drag.current = {
                    id: task.id, x: event.clientX, y: event.clientY, moved: false,
                    offsetX: position.x - point.x, offsetY: position.y - point.y,
                  };
                }}
                onPointerMove={event => moveNode(event, task.id, radius)}
                onPointerUp={event => {
                  skipClick.current = drag.current?.moved ?? false;
                  drag.current = null;
                  if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
                }}
                onPointerCancel={() => { drag.current = null; }}>
                <title>{task.title}</title>
                <g className="node-face">
                  {depth === 0 ? <>
                    <rect className="node-ring" x={-radius * 1.06 - 5} y={-radius * .72 - 5} width={radius * 2.12 + 10} height={radius * 1.44 + 10} rx="15" />
                    <rect className="node-shape" x={-radius * 1.06} y={-radius * .72} width={radius * 2.12} height={radius * 1.44} rx="10" />
                  </> : <>
                    <circle className="node-ring" r={radius + 5} />
                    <circle className="node-shape" r={radius} />
                  </>}
                  <text textAnchor="middle" className="node-name" y={5 - (lines.length - 1) * 8}>
                    {lines.map((line, i) => <tspan key={i} x="0" dy={i ? 16 : 0}>{line}</tspan>)}
                  </text>
                  {count > 0 && <g transform={`translate(0 ${depth === 0 ? radius * .72 : radius})`} className="node-toggle" aria-hidden="true">
                    <circle r="10" /><path d={expanded.has(task.id) ? "M-4 0h8" : "M-4 0h8M0 -4v8"} />
                  </g>}
                </g>
              </g>;
            })}
          </svg>
        </div>
        <div className="map-footer"><div className="map-key">
          <span><i className="key-root" />Task</span>
          {graph.some(node => node.depth === 1) && <span><i className="key-sub" />Subtask</span>}
          {graph.some(node => node.depth === 2) && <span><i className="key-atomic" />Atomic step</span>}
        </div><p>Drag to arrange</p></div>
      </>}
      {selected && <button type="button" className="detail-jump" onClick={() => showDetails(selected)}>View selected details</button>}
    </section>
    <aside ref={details} id="task-details" className="task-details" tabIndex={-1} aria-label="Selected task details">
      {selected ? <>
      <button type="button" className="detail-back" onClick={returnToTasks}><span aria-hidden="true">‹ </span>Back to {mode === "list" ? "outline" : "map"}</button>
      <div className="detail-level"><span>{levelNames[selected.level]}</span><span className="source-reference" title="Source ID">{selected.sourceId}</span></div>
      <h2 aria-live="polite">{selected.title}</h2>
      <div className="detail-content" key={selected.id}>
      {parent && <button className="parent-task" type="button" onClick={() => showDetails(parent)} aria-label={`Back to ${parent.title}`}>
        <span aria-hidden="true">↰</span> {parent.title}
      </button>}
      {selected.children && <div className="detail-section">
        <h3>{selected.level === "High-level task" ? "Subtasks" : "Atomic steps"} <span>{selected.children.length}</span></h3>
        {selected.children.length ? <ol className="work-sequence" aria-label={selected.level === "Subtask" ? "Atomic steps" : "Subtasks"}>{selected.children.map((child, index) =>
          <li key={child.id}><button type="button" onClick={() => openChild(selected, child)}>
            <span className="work-position" aria-hidden="true">{index + 1}</span><strong>{child.title}</strong>
            {child.children && <small>{child.children.length} atomic {child.children.length === 1 ? "step" : "steps"}</small>}
          </button></li>
        )}</ol> : <p>No steps recorded.</p>}
      </div>}
      {selected.atomic && <AtomicDetails task={selected.atomic} />}
      </div>
      </> : <div className="task-prompt">
        <h2>Choose a task</h2>
        <p>Select a task in the {mode === "list" ? "outline" : "map"} to see how the work breaks down.</p>
      </div>}
    </aside>
  </div>;
}

function AtomicDetails({ task }: { task: NonNullable<Task["atomic"]> }) {
  const overview = [["Work result", task.workResult], ["Human involvement", task.humanInvolvement], ["Automation potential (estimate)", task.automationPropensity]];
  const groups = [
    { label: "Evidence and controls", fields: [["Evidence", task.evidence], ["Quality checks", task.controlQuality], ["Risk if the step fails", task.riskIfFailed]] },
    { label: "Classification and source", fields: [["SFIA level (indicative)", task.sfiaLevel], ["Action type", task.actionType], ["Record basis", task.recordBasis], ["Validation status", task.validationStatus]] },
  ];
  function facts(fields: (string | null)[][]) {
    const recorded = fields.filter(([, value]) => value);
    return recorded.length ? <dl className="atomic-fields">{recorded.map(([label, value]) =>
      <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl> : null;
  }
  const summary = facts(overview);
  const sections = groups.filter(group => group.fields.some(([, value]) => value));
  if (!summary && !sections.length) return <p>No further details have been recorded for this step.</p>;
  return <>{summary}{sections.map(group => <details key={group.label} className="record-section">
    <summary>{group.label}</summary>{facts(group.fields)}
  </details>)}</>;
}

type ListProps = {
  items: Task[]; expanded: Set<string>; selectedId: string | null;
  onSelect: (task: Task) => void; onToggle: (task: Task) => void;
};

function TaskList({ items, expanded, selectedId, onSelect, onToggle }: ListProps) {
  return <ul>{items.map(task => <li key={task.id}>
    <div className="list-row">
      {!!task.children?.length && <button type="button" className="list-toggle" aria-label={`${expanded.has(task.id) ? "Collapse" : "Expand"} ${task.title}`}
        aria-expanded={expanded.has(task.id)} onClick={() => onToggle(task)}>{expanded.has(task.id) ? "−" : "+"}</button>}
      <button type="button" className="list-title" aria-controls="task-details" aria-pressed={selectedId === task.id} onClick={() => onSelect(task)}>{task.title}</button>
    </div>
    {task.children && expanded.has(task.id) && <TaskList items={task.children} expanded={expanded} selectedId={selectedId} onSelect={onSelect} onToggle={onToggle} />}
  </li>)}</ul>;
}


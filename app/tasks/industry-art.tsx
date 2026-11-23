"use client";

import { useEffect, useRef } from "react";

type Motif = "coins" | "gears" | "freight" | "blocks";
type Point = [number, number];
type Ink = { paper: string; light: string; mid: string; dark: string; line: string };
const inks: Record<Motif, Ink> = {
  coins: { paper: "#dce9da", light: "#e8f2dc", mid: "#9dbda0", dark: "#74967f", line: "#315b49" },
  gears: { paper: "#f4e8cd", light: "#fcf1d1", mid: "#d9b77d", dark: "#b78b55", line: "#705230" },
  freight: { paper: "#dce9ec", light: "#e7f2f0", mid: "#9ebfc5", dark: "#6c969f", line: "#355c66" },
  blocks: { paper: "#e6e6ee", light: "#f0eff5", mid: "#b7b7cd", dark: "#989ab6", line: "#505573" },
};

function motifFor(name: string): Motif {
  if (/financ|bank|insur/i.test(name)) return "coins";
  if (/manufactur|industrial|engineer/i.test(name)) return "gears";
  if (/transport|logistic|freight/i.test(name)) return "freight";
  return "blocks";
}

function draw(ctx: CanvasRenderingContext2D, motif: Motif, t: number) {
  const ink = inks[motif];
  ctx.clearRect(0, 0, 360, 190);
  ctx.lineJoin = "round";
  ctx.lineWidth = 1.15;
  ctx.strokeStyle = ink.line;
  function polygon(points: Point[], fill: string) {
    ctx.beginPath();
    points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
    ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); ctx.stroke();
  }
  function ellipse(x: number, y: number, rx: number, ry: number, fill: string, outline = true) {
    ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = fill; ctx.fill(); if (outline) ctx.stroke();
  }
  function line(a: Point, b: Point) {
    ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke();
  }
  // A common projection and ground plane keep new industries in the same visual language.
  const project = (x: number, y: number, z: number): Point => [174 + x - y, 128 + x * .42 + y * .42 - z];
  function box(x: number, y: number, z: number, w: number, d: number, h: number, ribbed: boolean) {
    const a = project(x, y, z + h), b = project(x + w, y, z + h);
    const c = project(x + w, y + d, z + h), e = project(x, y + d, z + h);
    polygon([e, c, project(x + w, y + d, z), project(x, y + d, z)], ink.mid);
    polygon([c, b, project(x + w, y, z), project(x + w, y + d, z)], ink.dark);
    polygon([a, b, c, e], ink.light);
    if (ribbed) {
      for (let u = 5; u < w - 3; u += 6) {
        line(project(x + u, y + d, z + 3), project(x + u, y + d, z + h - 3));
        line(project(x + u, y + 3, z + h), project(x + u, y + d - 3, z + h));
      }
      line(project(x + w, y + d / 2, z + 1), project(x + w, y + d / 2, z + h - 1));
    }
  }
  function coinStack(x: number, bottom: number, radius: number, count: number, lift: number) {
    const ry = radius * .42;
    for (let i = 0; i < count; i++) {
      const y = bottom - i * 5.7 - (i === count - 1 ? lift : 0);
      ctx.beginPath(); ctx.ellipse(x, y + 4, radius, ry, 0, 0, Math.PI);
      ctx.lineTo(x - radius, y); ctx.ellipse(x, y, radius, ry, 0, Math.PI, 0, true);
      ctx.closePath(); ctx.fillStyle = ink.mid; ctx.fill(); ctx.stroke();
      for (let j = 1; j < 15; j++) {
        const theta = j * Math.PI / 15;
        const p: Point = [x + Math.cos(theta) * radius, y + Math.sin(theta) * ry];
        line(p, [p[0], p[1] + 3]);
      }
      ellipse(x, y, radius, ry, ink.light);
      if (i === count - 1) {
        ellipse(x, y, radius * .82, ry * .79, ink.light);
        polygon([[x - 10, y], [x, y - 5], [x + 10, y], [x, y + 5]], ink.mid);
      }
    }
  }
  function gear(x: number, y: number, radius: number, teeth: number, angle: number) {
    const top: Point[] = [];
    for (let i = 0; i < teeth; i++) {
      for (const [fraction, scale] of [[0, .81], [.18, .81], [.28, 1], [.63, 1], [.73, .81]]) {
        const a = angle + (i + fraction) * Math.PI * 2 / teeth;
        top.push([x + radius * scale * Math.cos(a), y + .62 * radius * scale * Math.sin(a)]);
      }
    }
    const h = radius * .21;
    for (let i = 0; i < top.length; i++) {
      const a = top[i], b = top[(i + 1) % top.length];
      if (b[0] < a[0]) polygon([a, b, [b[0], b[1] + h], [a[0], a[1] + h]], b[1] > a[1] ? ink.dark : ink.mid);
    }
    polygon(top, ink.light);
    ellipse(x, y, radius * .55, radius * .33, ink.mid);
    ellipse(x, y - 4, radius * .55, radius * .33, ink.light);
    ellipse(x, y - 4, radius * .29, radius * .18, ink.dark);
    for (let i = 0; i < 4; i++) {
      const a = angle + i * Math.PI / 2;
      ellipse(x + Math.cos(a) * radius * .43, y - 4 + Math.sin(a) * radius * .26, 1.7, 1.1, ink.line, false);
    }
  }
  ctx.save();
  ctx.globalAlpha = .075;
  ellipse(181, 146, 107, 17, ink.line, false);
  ctx.restore();
  if (motif === "coins") {
    coinStack(181, 117, 39, 12, 7 * t);
    coinStack(129, 135, 35, 7, 0);
    coinStack(216, 147, 37, 4, 0);
  } else if (motif === "gears") {
    gear(227, 83, 39, 10, .2 - t * .28);
    gear(153, 109, 62, 13, t * .22);
  } else if (motif === "freight") {
    box(-62, -43, 0, 89, 31, 29, true);
    box(-62, -43, 30 + t * 8, 89, 31, 29, true);
    box(-44, -8, 0, 89, 31, 29, true);
  } else {
    box(-35, -42, 0, 39, 39, 64 + t * 6, false);
    box(8, -42, 0, 39, 39, 37, false);
    box(-35, 1, 0, 39, 39, 38, false);
    box(8, 1, 0, 39, 39, 20, false);
  }
}

export function IndustryArt({ name, active }: { name: string; active: boolean }) {
  const motif = motifFor(name);
  const canvas = useRef<HTMLCanvasElement>(null);
  const progress = useRef(0);
  useEffect(() => {
    const element = canvas.current;
    const ctx = element?.getContext("2d");
    if (!element || !ctx) return;
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    element.width = 360 * scale; element.height = 190 * scale;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const from = progress.current, to = active && !reduced ? 1 : 0;
    const start = performance.now();
    let frame = 0;
    function paint(now: number) {
      const elapsed = reduced || from === to ? 1 : Math.min(1, (now - start) / 180);
      progress.current = from + (to - from) * (1 - (1 - elapsed) ** 3);
      draw(ctx!, motif, progress.current);
      if (elapsed < 1) frame = requestAnimationFrame(paint);
    }
    paint(start);
    return () => cancelAnimationFrame(frame);
  }, [active, motif]);
  return <span className="industry-art" style={{ backgroundColor: inks[motif].paper }} aria-hidden="true">
    <canvas ref={canvas} width="360" height="190" />
  </span>;
}

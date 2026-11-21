/**
 * Ambient page background: a washed-out, slowly moving scene where quantum computing,
 * machine learning, chemistry and materials science meet.
 *
 *  Quantum   – a quantum circuit drifting along its wires with an execution sweep;
 *              a Bloch sphere with a precessing state vector.
 *  Materials – periodic solids: a 2×2×2 perovskite supercell whose octahedra tilt back
 *              and forth (a soft phonon mode), a diamond unit cell with an NV centre,
 *              and an hBN bilayer with a boron vacancy.
 *  Chemistry – C60, caffeine, benzene and water turning in perspective.
 *  AI        – a multilayer perceptron with forward-pass pulses; self-attention arcs;
 *              message passing that hops along chemical bonds like a graph neural network.
 *  Notation  – a few faint lines of maths.
 *
 * Colours come from the theme's CSS custom properties, so it follows light and dark mode.
 * Honours prefers-reduced-motion (one still frame) and pauses in hidden tabs.
 *
 * Two motion levels: `lively` (home page) and `calm` (reading pages). Calm runs the scene
 * clock at an eighth of the speed and drops every discrete event (bond ripples, neural-net
 * pulses, the circuit's execution sweep) and the scroll parallax, so the page reads like a
 * still image that is barely breathing.
 * The scene clock is shared across navigations, so nothing jumps between pages.
 */

type V3 = [number, number, number];
type El = 'C' | 'H' | 'N' | 'O' | 'A' | 'B' | 'Bn' | 'X';
interface Mol {
  atoms: { p: V3; el: El }[];
  bonds: [number, number, number?][]; // i, j, order (0 = dotted guide, 2 = double)
  neighbours: number[][];
  cage?: [number, number][]; // unit-cell edges
  polys?: number[][]; // coordination polyhedra (filled faintly)
  scale: number; // normalisation applied by finish()
  animate?: (t: number, base: V3[]) => V3[];
}
interface Pulse { a: number; b: number; t0: number; dur: number; hop: number }
type Kind = 'mol' | 'mlp' | 'attn' | 'text' | 'circuit' | 'bloch';
interface Thing {
  kind: Kind;
  x: number; y: number; // viewport fraction
  size: number; // fraction of the scene scale
  depth: number; // strength and parallax, 0..1
  rot?: V3; spin?: V3;
  mol?: Mol;
  glow: Map<number, number>;
  pulses: Pulse[];
  drift: number;
  minWidth?: number;
  text?: string;
  nextFire?: number;
}

const TAU = Math.PI * 2;
const PHI = (1 + Math.sqrt(5)) / 2;
const dist = (a: V3, b: V3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

/* ------------------------------------------------------------ structures */

function finish(atoms: Mol['atoms'], bonds: Mol['bonds'], extra: Partial<Mol> = {}): Mol {
  const c: V3 = [0, 0, 0];
  atoms.forEach((a) => { c[0] += a.p[0]; c[1] += a.p[1]; c[2] += a.p[2]; });
  c.forEach((_, k) => (c[k] /= atoms.length));
  let r = 0;
  atoms.forEach((a) => {
    a.p = [a.p[0] - c[0], a.p[1] - c[1], a.p[2] - c[2]];
    r = Math.max(r, Math.hypot(...a.p));
  });
  atoms.forEach((a) => (a.p = [a.p[0] / r, a.p[1] / r, a.p[2] / r]));
  const neighbours: number[][] = atoms.map(() => []);
  bonds.forEach(([i, j]) => { neighbours[i].push(j); neighbours[j].push(i); });
  return { atoms, bonds, neighbours, scale: 1 / r, ...extra };
}

function bondsWithin(atoms: Mol['atoms'], max: number, min = 0.01): Mol['bonds'] {
  const out: Mol['bonds'] = [];
  for (let i = 0; i < atoms.length; i++)
    for (let j = i + 1; j < atoms.length; j++) {
      const d = dist(atoms[i].p, atoms[j].p);
      if (d > min && d < max) out.push([i, j, 1]);
    }
  return out;
}

function cubeCage(atoms: Mol['atoms'], n: number, side = 1): [number, number][] {
  // indices of the atoms sitting on the outer cube corners, joined along edges
  const corner = (x: number, y: number, z: number) =>
    atoms.findIndex((a) => dist(a.p, [x, y, z]) < 1e-6);
  const L = n * side, out: [number, number][] = [];
  const cs: V3[] = [];
  for (const x of [0, L]) for (const y of [0, L]) for (const z of [0, L]) cs.push([x, y, z]);
  for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++) {
    const a = cs[i], b = cs[j];
    if ([0, 1, 2].filter((k) => a[k] !== b[k]).length === 1) {
      const ia = corner(...a), ib = corner(...b);
      if (ia >= 0 && ib >= 0) out.push([ia, ib]);
    }
  }
  return out;
}

function fullerene(): Mol {
  const pts: V3[] = [];
  const evenPerms = (v: V3): V3[] => [v, [v[1], v[2], v[0]], [v[2], v[0], v[1]]];
  const signs = (v: V3): V3[] => {
    const out: V3[] = [];
    for (const sx of v[0] ? [1, -1] : [1]) for (const sy of v[1] ? [1, -1] : [1]) for (const sz of v[2] ? [1, -1] : [1])
      out.push([v[0] * sx, v[1] * sy, v[2] * sz]);
    return out;
  };
  for (const base of [[0, 1, 3 * PHI], [1, 2 + PHI, 2 * PHI], [PHI, 2, PHI ** 3]] as V3[])
    for (const p of evenPerms(base)) pts.push(...signs(p));
  const atoms = pts.map((p) => ({ p, el: 'C' as El }));
  return finish(atoms, bondsWithin(atoms, 2.05));
}

function benzene(): Mol {
  const atoms: Mol['atoms'] = [];
  for (let k = 0; k < 6; k++) atoms.push({ p: [Math.cos((k * TAU) / 6), Math.sin((k * TAU) / 6), 0], el: 'C' });
  for (let k = 0; k < 6; k++) atoms.push({ p: [1.78 * Math.cos((k * TAU) / 6), 1.78 * Math.sin((k * TAU) / 6), 0], el: 'H' });
  const bonds: Mol['bonds'] = [];
  for (let k = 0; k < 6; k++) { bonds.push([k, (k + 1) % 6, k % 2 ? 1 : 2]); bonds.push([k, k + 6, 1]); }
  return finish(atoms, bonds);
}

function caffeine(): Mol {
  const P: Record<string, [number, number, El]> = {
    C5: [0.866, 0.5, 'C'], C4: [0.866, -0.5, 'C'], C6: [0, 1, 'C'], N1: [-0.866, 0.5, 'N'],
    C2: [-0.866, -0.5, 'C'], N3: [0, -1, 'N'], N7: [1.817, 0.809, 'N'], C8: [2.405, 0, 'C'],
    N9: [1.817, -0.809, 'N'], O6: [0, 2, 'O'], O2: [-1.732, -1, 'O'], M1: [-1.732, 1, 'C'],
    M3: [0, -2, 'C'], M7: [2.126, 1.76, 'C'], H8: [3.3, 0, 'H'],
  };
  const keys = Object.keys(P);
  const atoms = keys.map((k) => ({ p: [P[k][0], P[k][1], 0] as V3, el: P[k][2] }));
  const id = (k: string) => keys.indexOf(k);
  const B: [string, string, number][] = [
    ['C5', 'C6', 1], ['C6', 'N1', 1], ['N1', 'C2', 1], ['C2', 'N3', 1], ['N3', 'C4', 1], ['C4', 'C5', 2],
    ['C5', 'N7', 1], ['N7', 'C8', 1], ['C8', 'N9', 2], ['N9', 'C4', 1],
    ['C6', 'O6', 2], ['C2', 'O2', 2], ['N1', 'M1', 1], ['N3', 'M3', 1], ['N7', 'M7', 1], ['C8', 'H8', 1],
  ];
  return finish(atoms, B.map(([a, b, o]) => [id(a), id(b), o]));
}

function water(): Mol {
  const a = (104.5 / 2) * (Math.PI / 180);
  return finish(
    [{ p: [0, 0, 0], el: 'O' }, { p: [Math.sin(a), Math.cos(a), 0], el: 'H' }, { p: [-Math.sin(a), Math.cos(a), 0], el: 'H' }],
    [[0, 1, 1], [0, 2, 1]],
  );
}

/** 2×2×2 ABO3 perovskite supercell; BO6 octahedra tilt in an a0a0c- pattern that breathes. */
function perovskiteSupercell(n = 2): Mol {
  const atoms: Mol['atoms'] = [];
  const at = (p: V3, el: El) => { atoms.push({ p, el }); return atoms.length - 1; };
  for (let i = 0; i <= n; i++) for (let j = 0; j <= n; j++) for (let k = 0; k <= n; k++) at([i, j, k], 'A');
  const Bs: { idx: number; c: V3; sign: number; Os: number[] }[] = [];
  const oIndex = new Map<string, number>();
  const oOwner = new Map<number, { c: V3; sign: number }>();
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) for (let k = 0; k < n; k++) {
    const c: V3 = [i + 0.5, j + 0.5, k + 0.5];
    const sign = (i + j + k) % 2 ? -1 : 1;
    const idx = at(c, 'B');
    const Os: number[] = [];
    for (const d of [[0.5, 0, 0], [-0.5, 0, 0], [0, 0.5, 0], [0, -0.5, 0], [0, 0, 0.5], [0, 0, -0.5]] as V3[]) {
      const p: V3 = [c[0] + d[0], c[1] + d[1], c[2] + d[2]];
      const key = p.join(',');
      let o = oIndex.get(key);
      if (o === undefined) { o = at(p, 'O'); oIndex.set(key, o); oOwner.set(o, { c, sign }); }
      Os.push(o);
    }
    Bs.push({ idx, c, sign, Os });
  }
  const bonds: Mol['bonds'] = [];
  Bs.forEach((b) => b.Os.forEach((o) => bonds.push([b.idx, o, 1])));
  const cage = cubeCage(atoms, n);
  const m = finish(atoms, bonds, { cage, polys: Bs.map((b) => b.Os) });
  // soft mode: in-plane oxygens rotate about c around their owning B site
  const owners = [...oOwner.entries()].map(([o, w]) => ({ o, sign: w.sign, c: w.c }));
  const raw = atoms.map((a) => a.p.map((v) => v / m.scale) as V3); // un-normalised offsets (centred)
  m.animate = (t, base) => {
    const phi = 0.16 * Math.sin(t * 0.45);
    const out = base.slice();
    for (const { o, sign } of owners) {
      const p = raw[o];
      // find the owning B centre in centred coordinates
      const bc = Bs.find((b) => b.Os.includes(o))!;
      const cb = raw[bc.idx];
      const dx = p[0] - cb[0], dy = p[1] - cb[1];
      if (Math.abs(p[2] - cb[2]) > 1e-6) continue; // apical O does not move for c-axis tilts
      const a = phi * sign;
      const nx = dx * Math.cos(a) - dy * Math.sin(a), ny = dx * Math.sin(a) + dy * Math.cos(a);
      out[o] = [(cb[0] + nx) * m.scale, (cb[1] + ny) * m.scale, base[o][2]];
    }
    return out;
  };
  return m;
}

/** Conventional diamond unit cell with a nitrogen–vacancy centre. */
function diamondCell(): Mol {
  const pts: V3[] = [];
  const add = (p: V3) => { if (!pts.some((q) => dist(p, q) < 1e-6)) pts.push(p); };
  for (const x of [0, 1]) for (const y of [0, 1]) for (const z of [0, 1]) add([x, y, z]);
  for (const f of [[0.5, 0.5, 0], [0.5, 0.5, 1], [0.5, 0, 0.5], [0.5, 1, 0.5], [0, 0.5, 0.5], [1, 0.5, 0.5]] as V3[]) add(f);
  for (const q of [[0.25, 0.25, 0.25], [0.75, 0.75, 0.25], [0.75, 0.25, 0.75], [0.25, 0.75, 0.75]] as V3[]) add(q);
  const atoms = pts.map((p) => ({ p, el: 'C' as El }));
  const bonds = bondsWithin(atoms, 0.44);
  // N on one interior site; the vacancy on one of its lattice neighbours
  const n = atoms.findIndex((a) => dist(a.p, [0.75, 0.75, 0.25]) < 1e-6);
  const v = atoms.findIndex((a) => dist(a.p, [0.5, 0.5, 0]) < 1e-6);
  atoms[n].el = 'N';
  atoms[v].el = 'X';
  const cage = cubeCage(atoms, 1);
  return finish(atoms, bonds.filter(([a, b]) => a !== v && b !== v), { cage });
}

/** Two AA′-stacked hexagonal boron nitride layers (4×4 cells) with a boron vacancy. */
function hbnBilayer(): Mol {
  const atoms: Mol['atoms'] = [];
  const a1: V3 = [1, 0, 0], a2: V3 = [0.5, Math.sqrt(3) / 2, 0];
  const N = 4, gap = 1.25;
  for (let layer = 0; layer < 2; layer++)
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      const o: V3 = [i * a1[0] + j * a2[0], i * a1[1] + j * a2[1], layer * gap];
      const swap = layer === 1; // AA′: B over N
      atoms.push({ p: [o[0], o[1], o[2]], el: swap ? 'N' : 'Bn' });
      atoms.push({ p: [o[0] + 0.5, o[1] + Math.sqrt(3) / 6, o[2]], el: swap ? 'Bn' : 'N' });
    }
  const bonds = bondsWithin(atoms, 0.6).filter(([i, j]) => Math.abs(atoms[i].p[2] - atoms[j].p[2]) < 0.1);
  // boron vacancy near the middle of the top layer
  let v = -1, best = 1e9;
  const mid: V3 = [1.5 * a1[0] + 1.5 * a2[0], 1.5 * a2[1], gap];
  atoms.forEach((a, i) => { if (a.el === 'Bn' && a.p[2] === gap && dist(a.p, mid) < best) { best = dist(a.p, mid); v = i; } });
  atoms[v].el = 'X';
  // supercell outline on each layer
  const cage: [number, number][] = [];
  const corner = (i: number, j: number, layer: number) =>
    atoms.findIndex((a) => dist(a.p, [i * a1[0] + j * a2[0], i * a1[1] + j * a2[1], layer * gap]) < 1e-6);
  for (const L of [0, 1]) {
    const c = [corner(0, 0, L), corner(N - 1, 0, L), corner(N - 1, N - 1, L), corner(0, N - 1, L)];
    for (let q = 0; q < 4; q++) if (c[q] >= 0 && c[(q + 1) % 4] >= 0) cage.push([c[q], c[(q + 1) % 4]]);
  }
  return finish(atoms, bonds.filter(([a, b]) => a !== v && b !== v), { cage });
}

/* ------------------------------------------------------------------ scene */

function scene(): Thing[] {
  const T = (o: Partial<Thing> & Pick<Thing, 'kind' | 'x' | 'y' | 'size'>): Thing => ({
    depth: 0.7, glow: new Map(), pulses: [], drift: Math.random() * TAU, ...o,
  });
  return [
    // quantum
    T({ kind: 'bloch', x: 0.058, y: 0.24, size: 0.052, depth: 0.85, rot: [0.42, 0, 0], spin: [0, 0.05, 0] }),
    T({ kind: 'circuit', x: 0.64, y: 0.9, size: 0.3, depth: 0.7, minWidth: 720 }),
    // periodic solids
    T({ kind: 'mol', mol: perovskiteSupercell(), x: 0.915, y: 0.8, size: 0.115, depth: 0.8, rot: [0.5, 0.65, 0], spin: [0.02, 0.06, 0] }),
    T({ kind: 'mol', mol: diamondCell(), x: 0.12, y: 0.88, size: 0.085, depth: 0.75, rot: [0.4, 0.6, 0.1], spin: [0.03, 0.07, 0.02] }),
    T({ kind: 'mol', mol: hbnBilayer(), x: 0.37, y: 0.9, size: 0.1, depth: 0.6, rot: [1.05, 0, 0.3], spin: [0, 0, 0.05], minWidth: 900 }),
    // molecules
    T({ kind: 'mol', mol: fullerene(), x: 0.885, y: 0.22, size: 0.105, depth: 0.85, rot: [0.4, 0.2, 0], spin: [0.05, 0.09, 0.02] }),
    T({ kind: 'mol', mol: caffeine(), x: 0.7, y: 0.42, size: 0.085, depth: 0.55, rot: [0.6, -0.4, 0.2], spin: [0.03, 0.07, 0.015], minWidth: 720 }),
    T({ kind: 'mol', mol: benzene(), x: 0.31, y: 0.13, size: 0.045, depth: 0.55, rot: [0.9, 0.3, 0], spin: [0.04, 0.11, 0.03], minWidth: 900 }),
    T({ kind: 'mol', mol: water(), x: 0.05, y: 0.45, size: 0.02, depth: 0.4, rot: [0, 1, 0], spin: [0.15, 0.25, 0.2] }),
    T({ kind: 'mol', mol: water(), x: 0.52, y: 0.62, size: 0.018, depth: 0.35, rot: [1, 0, 0], spin: [0.25, 0.15, 0.2], minWidth: 900 }),
    // machine learning
    T({ kind: 'mlp', x: 0.1, y: 0.6, size: 0.11, depth: 0.75, spin: [0, 0.12, 0] }),
    T({ kind: 'attn', x: 0.6, y: 0.075, size: 0.12, depth: 0.6, minWidth: 900 }),
    // notation
    T({ kind: 'text', text: '⟨ψ|Ĥ|ψ⟩', x: 0.79, y: 0.5, size: 0.013, depth: 0.5, minWidth: 720 }),
    T({ kind: 'text', text: 'E_{xc}[ρ]', x: 0.22, y: 0.36, size: 0.012, depth: 0.45, minWidth: 900 }),
    T({ kind: 'text', text: 'softmax(QK^{⊤}/√d)', x: 0.44, y: 0.2, size: 0.011, depth: 0.45, minWidth: 1100 }),
    T({ kind: 'text', text: '|G⟩ = ∏ CZ_{ab} |+⟩^{⊗n}', x: 0.2, y: 0.74, size: 0.011, depth: 0.45, minWidth: 900 }),
  ];
}

const MLP_LAYERS = [4, 6, 6, 3];
function mlpNodes(): { p: V3; layer: number }[] {
  const out: { p: V3; layer: number }[] = [];
  MLP_LAYERS.forEach((n, l) => {
    for (let i = 0; i < n; i++)
      out.push({ p: [(l / (MLP_LAYERS.length - 1)) * 2 - 1, (i - (n - 1) / 2) * 0.32, 0], layer: l });
  });
  return out;
}

/** A repeating quantum circuit pattern: [wire(s), op] per column. */
type Op = { k: 'H' | 'X' | 'R' | 'M'; w: number } | { k: 'CX' | 'CZ'; c: number; w: number };
const CIRCUIT: Op[][] = [
  [{ k: 'H', w: 0 }, { k: 'H', w: 1 }, { k: 'H', w: 2 }, { k: 'H', w: 3 }],
  [{ k: 'CZ', c: 0, w: 1 }, { k: 'CZ', c: 2, w: 3 }],
  [{ k: 'CZ', c: 1, w: 2 }],
  [{ k: 'R', w: 0 }, { k: 'R', w: 2 }],
  [{ k: 'CX', c: 3, w: 1 }],
  [{ k: 'R', w: 1 }, { k: 'X', w: 3 }],
  [{ k: 'CX', c: 0, w: 2 }],
  [{ k: 'H', w: 2 }, { k: 'R', w: 3 }],
  [{ k: 'CZ', c: 1, w: 3 }],
  [{ k: 'M', w: 0 }, { k: 'M', w: 1 }, { k: 'M', w: 2 }, { k: 'M', w: 3 }],
];

/* ---------------------------------------------------------------- colour */

type RGB = [number, number, number];
function hexToRgb(h: string): RGB {
  h = h.trim().replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const rgba = (c: RGB, a: number) => `rgba(${c[0]},${c[1]},${c[2]},${Math.max(0, Math.min(1, a)).toFixed(3)})`;

function hull(pts: { x: number; y: number }[]) {
  const p = pts.slice().sort((a, b) => a.x - b.x || a.y - b.y);
  const cross = (o: any, a: any, b: any) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const lo: typeof p = [], up: typeof p = [];
  for (const q of p) { while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (const q of p.reverse()) { while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}

/* ------------------------------------------------------------------- run */

export function startBackground(canvas: HTMLCanvasElement, opts: { calm?: boolean } = {}) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const calm = !!opts.calm;
  const RATE = calm ? 0.12 : 1; // scene-clock speed
  const FRAME_MS = calm ? 66 : 33; // ~15 fps is plenty when barely moving
  const PARALLAX = calm ? 0 : 0.035;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const things = scene();
  const mlp = mlpNodes();
  let W = 0, H = 0, M = 0, dpr = 1;
  let C: Record<string, RGB> = {};
  let dark = false;
  let pointer = { x: -1e4, y: -1e4, t: -10 };
  let scrollY = window.scrollY;

  // scene clock: advances at RATE, persists across page navigations
  const KEY = 'gs-bg-clock';
  let clock0 = 0;
  try { clock0 = parseFloat(sessionStorage.getItem(KEY) || '0') || 0; } catch {}
  let sceneT = clock0, lastReal = performance.now();
  const tick = () => {
    const n = performance.now();
    sceneT += Math.min(0.1, (n - lastReal) / 1000) * RATE; // clamp so a hidden tab does not leap ahead
    lastReal = n;
    return sceneT;
  };
  const realNow = () => performance.now() / 1000;
  addEventListener('pagehide', () => { try { sessionStorage.setItem(KEY, String(sceneT)); } catch {} });

  function readColours() {
    const cs = getComputedStyle(document.documentElement);
    const g = (n: string) => hexToRgb(cs.getPropertyValue(n) || '#888888');
    C = { line: g('--line'), strong: g('--line-strong'), ink: g('--ink-muted'), n: g('--nitrogen'), o: g('--oxygen'), s: g('--sulfur'), surface: g('--surface') };
    dark = cs.getPropertyValue('color-scheme').includes('dark');
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    // scene scale: tracks the viewport but stays sensible on very wide or very short screens
    M = Math.max(520, Math.min(Math.hypot(W, H) * 0.75, 1500));
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function rotate(p: V3, r: V3): V3 {
    const [a, b, c] = r;
    let [x, y, z] = p;
    let t = y * Math.cos(a) - z * Math.sin(a); z = y * Math.sin(a) + z * Math.cos(a); y = t;
    t = x * Math.cos(b) + z * Math.sin(b); z = -x * Math.sin(b) + z * Math.cos(b); x = t;
    t = x * Math.cos(c) - y * Math.sin(c); y = x * Math.sin(c) + y * Math.cos(c); x = t;
    return [x, y, z];
  }

  function centre(th: Thing, t: number): [number, number] {
    const dx = Math.sin(t * 0.07 + th.drift) * 14 * th.depth;
    const dy = Math.cos(t * 0.05 + th.drift * 1.3) * 10 * th.depth - Math.min(scrollY, 2400) * PARALLAX * th.depth;
    return [th.x * W + dx, th.y * H + dy];
  }

  const S = () => (dark ? 1.2 : 1); // hairlines fade faster on dark surfaces
  const glowAt = (th: Thing, i: number, t: number) => {
    const g = th.glow.get(i);
    return g === undefined ? 0 : Math.exp(-(t - g) / 0.9);
  };
  const ease = (u: number) => u * u * (3 - 2 * u);

  function fire(th: Thing, i: number, t: number, hop = 0) {
    th.glow.set(i, t);
    if (hop >= 4 || !th.mol) return;
    for (const j of th.mol.neighbours[i])
      if (Math.random() < 0.72 - hop * 0.12) th.pulses.push({ a: i, b: j, t0: t, dur: 0.55 + Math.random() * 0.35, hop: hop + 1 });
  }
  function stepPulses(th: Thing, t: number, onArrive: (p: Pulse) => void) {
    const done: Pulse[] = [];
    th.pulses = th.pulses.filter((p) => (t - p.t0 >= p.dur ? (done.push(p), false) : true));
    done.forEach(onArrive);
  }
  const dot = (x: number, y: number, r: number, fill: string) => {
    ctx!.fillStyle = fill; ctx!.beginPath(); ctx!.arc(x, y, r, 0, TAU); ctx!.fill();
  };
  const line = (x0: number, y0: number, x1: number, y1: number) => {
    ctx!.beginPath(); ctx!.moveTo(x0, y0); ctx!.lineTo(x1, y1); ctx!.stroke();
  };

  const STYLE: Record<El, { r: number; c: string; a: number }> = {
    C: { r: 2.4, c: 'ink', a: 0.42 }, H: { r: 1.4, c: 'strong', a: 0.34 }, N: { r: 2.7, c: 'n', a: 0.62 },
    O: { r: 2.3, c: 'o', a: 0.5 }, A: { r: 3.0, c: 'ink', a: 0.26 }, B: { r: 2.7, c: 's', a: 0.55 },
    Bn: { r: 2.4, c: 'o', a: 0.32 }, X: { r: 2.6, c: 'strong', a: 0.5 },
  };

  /* --------------------------------------------------------- molecules */
  function drawMol(th: Thing, t: number) {
    const mol = th.mol!;
    const [cx, cy] = centre(th, t);
    const R = th.size * M;
    const rot: V3 = [th.rot![0] + th.spin![0] * t, th.rot![1] + th.spin![1] * t, th.rot![2] + th.spin![2] * t];
    const base = mol.atoms.map((a) => a.p);
    const pos = mol.animate && !reduce.matches ? mol.animate(t, base) : base;
    const f = 3.2;
    const P = pos.map((p0) => {
      const q = rotate(p0, rot);
      const s = f / (f + q[2]);
      return { x: cx + q[0] * R * s, y: cy + q[1] * R * s, z: q[2], s };
    });
    const k = th.depth * S();
    const depthA = (z: number) => 0.5 + 0.5 * (1 - (z + 1) / 2);

    if (!calm && realNow() - pointer.t < 0.2 && t > (th.nextFire ?? 0)) {
      let best = -1, bd = 80;
      P.forEach((p, i) => { const d = Math.hypot(p.x - pointer.x, p.y - pointer.y); if (d < bd && mol.atoms[i].el !== 'X') { bd = d; best = i; } });
      if (best >= 0) { fire(th, best, t); th.nextFire = t + 1.4; }
    }
    stepPulses(th, t, (p) => fire(th, p.b, t, p.hop));

    // coordination polyhedra, filled faintly (VESTA-style)
    if (mol.polys) {
      for (const poly of mol.polys) {
        const h = hull(poly.map((i) => P[i]));
        const z = poly.reduce((s, i) => s + P[i].z, 0) / poly.length;
        ctx!.fillStyle = rgba(C.s, (dark ? 0.06 : 0.07) * k * depthA(z));
        ctx!.beginPath(); h.forEach((q, i) => (i ? ctx!.lineTo(q.x, q.y) : ctx!.moveTo(q.x, q.y))); ctx!.closePath(); ctx!.fill();
      }
    }
    if (mol.cage) {
      ctx!.setLineDash([2, 4]); ctx!.lineWidth = 0.8;
      for (const [i, j] of mol.cage) {
        ctx!.strokeStyle = rgba(C.strong, 0.26 * k * depthA((P[i].z + P[j].z) / 2));
        line(P[i].x, P[i].y, P[j].x, P[j].y);
      }
      ctx!.setLineDash([]);
    }

    for (const [i, j, order = 1] of mol.bonds) {
      const a = P[i], b = P[j];
      const da = depthA((a.z + b.z) / 2);
      const g = Math.max(glowAt(th, i, t), glowAt(th, j, t)) * 0.6;
      ctx!.lineWidth = 1;
      ctx!.strokeStyle = g > 0.05 ? rgba(C.n, (0.3 + g * 0.5) * k * da) : rgba(C.strong, (order === 0 ? 0.16 : 0.34) * k * da);
      if (order === 0) ctx!.setLineDash([1.5, 3]);
      line(a.x, a.y, b.x, b.y);
      if (order === 0) ctx!.setLineDash([]);
      if (order === 2) {
        const dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy) || 1;
        let nx = -dy / L, ny = dx / L;
        if ((cx - (a.x + b.x) / 2) * nx + (cy - (a.y + b.y) / 2) * ny < 0) { nx = -nx; ny = -ny; }
        const o = Math.max(2.2, R * 0.05) * ((a.s + b.s) / 2), sh = 0.18;
        line(a.x + dx * sh + nx * o, a.y + dy * sh + ny * o, b.x - dx * sh + nx * o, b.y - dy * sh + ny * o);
      }
    }
    for (const p of th.pulses) {
      const u = (t - p.t0) / p.dur, a = P[p.a], b = P[p.b];
      dot(a.x + (b.x - a.x) * u, a.y + (b.y - a.y) * u, 1.8, rgba(C.n, 0.75 * k));
    }

    const order = P.map((_, i) => i).sort((i, j) => P[j].z - P[i].z);
    const sizeK = Math.max(0.7, Math.min(1.2, R / 120));
    for (const i of order) {
      const a = mol.atoms[i], p = P[i], st = STYLE[a.el];
      const da = depthA(p.z), g = glowAt(th, i, t);
      const r = st.r * sizeK * p.s * (1 + g * 0.5);
      if (a.el === 'X') {
        ctx!.setLineDash([1.5, 2.5]); ctx!.lineWidth = 1;
        ctx!.strokeStyle = rgba(C.strong, 0.55 * k * da);
        ctx!.beginPath(); ctx!.arc(p.x, p.y, r + 1.5, 0, TAU); ctx!.stroke();
        ctx!.setLineDash([]);
        continue;
      }
      dot(p.x, p.y, r + 0.8, rgba(C.surface, 1)); // knock out bonds behind the atom
      dot(p.x, p.y, r, g > 0.05 ? rgba(C.n, (0.45 + 0.5 * g) * k) : rgba(C[st.c], st.a * k * da));
      if (g > 0.05) {
        ctx!.lineWidth = 1; ctx!.strokeStyle = rgba(C.n, 0.35 * g * k);
        ctx!.beginPath(); ctx!.arc(p.x, p.y, r + 4 + (1 - g) * 6, 0, TAU); ctx!.stroke();
      }
    }
    if (!calm && !reduce.matches && th.pulses.length === 0 && Math.random() < 0.0022 * (th.depth + 0.3))
      fire(th, Math.floor(Math.random() * mol.atoms.length), t);
  }

  /* ------------------------------------------------------- perceptron */
  function drawMLP(th: Thing, t: number) {
    const [cx, cy] = centre(th, t);
    const R = th.size * M;
    const yaw = Math.sin(t * th.spin![1] + th.drift) * 0.35;
    const P = mlp.map((n) => {
      const q = rotate(n.p, [0.15, yaw, 0]);
      const s = 3 / (3 + q[2]);
      return { x: cx + q[0] * R * s, y: cy + q[1] * R * s, s };
    });
    const k = th.depth * S();
    ctx!.lineWidth = 0.8;
    let off = 0;
    for (let l = 0; l < MLP_LAYERS.length - 1; l++) {
      const n0 = MLP_LAYERS[l], n1 = MLP_LAYERS[l + 1];
      for (let i = 0; i < n0; i++) for (let j = 0; j < n1; j++) {
        const a = P[off + i], b = P[off + n0 + j];
        const g = Math.min(glowAt(th, off + i, t), glowAt(th, off + n0 + j, t));
        ctx!.strokeStyle = g > 0.1 ? rgba(C.n, 0.35 * g * k) : rgba(C.strong, 0.13 * k);
        line(a.x, a.y, b.x, b.y);
      }
      off += n0;
    }
    if (!calm && !reduce.matches && t > (th.nextFire ?? 0)) {
      th.nextFire = t + 1.8 + Math.random() * 1.6;
      const i = Math.floor(Math.random() * MLP_LAYERS[0]);
      th.glow.set(i, t);
      for (let q = 0; q < 1 + Math.floor(Math.random() * 2); q++)
        th.pulses.push({ a: i, b: MLP_LAYERS[0] + Math.floor(Math.random() * MLP_LAYERS[1]), t0: t, dur: 0.7, hop: 1 });
    }
    stepPulses(th, t, (p) => {
      th.glow.set(p.b, t);
      const layer = mlp[p.b].layer;
      if (layer < MLP_LAYERS.length - 1) {
        const startNext = MLP_LAYERS.slice(0, layer + 1).reduce((a, b) => a + b, 0);
        for (let q = 0; q < 1 + (Math.random() < 0.4 ? 1 : 0); q++)
          th.pulses.push({ a: p.b, b: startNext + Math.floor(Math.random() * MLP_LAYERS[layer + 1]), t0: t, dur: 0.7, hop: p.hop + 1 });
      }
    });
    for (const p of th.pulses) {
      const e = ease((t - p.t0) / p.dur), a = P[p.a], b = P[p.b];
      dot(a.x + (b.x - a.x) * e, a.y + (b.y - a.y) * e, 1.7, rgba(C.n, 0.8 * k));
    }
    P.forEach((p, i) => {
      const g = glowAt(th, i, t), r = 3.1 * p.s;
      dot(p.x, p.y, r + 0.6, rgba(C.surface, 1));
      ctx!.lineWidth = 1;
      ctx!.strokeStyle = g > 0.05 ? rgba(C.n, (0.4 + 0.5 * g) * k) : rgba(C.strong, 0.42 * k);
      ctx!.fillStyle = rgba(C.n, 0.55 * g * k);
      ctx!.beginPath(); ctx!.arc(p.x, p.y, r, 0, TAU); ctx!.fill(); ctx!.stroke();
    });
  }

  /* -------------------------------------------------------- attention */
  let attnQ = 0, attnW: number[] = [], attnPrev: number[] = [], attnT = -10;
  function drawAttn(th: Thing, t: number) {
    const N = 7;
    const [cx, cy] = centre(th, t);
    const w = th.size * M, gap = w / (N - 1);
    const k = th.depth * S();
    if (t - attnT > 3.2 || attnW.length === 0) {
      attnPrev = attnW.length ? attnW : new Array(N).fill(0);
      attnQ = (attnQ + 1 + Math.floor(Math.random() * 2)) % N;
      const ex = new Array(N).fill(0).map((_, j) => Math.exp(((j === attnQ ? 0.6 : 0) + Math.random() * 2.4) * 1.6));
      const sum = ex.reduce((a, b) => a + b, 0);
      attnW = ex.map((x) => x / sum);
      attnT = t;
    }
    const e = ease(Math.min(1, (t - attnT) / 1.2));
    const xs = new Array(N).fill(0).map((_, i) => cx - w / 2 + i * gap);
    for (let j = 0; j < N; j++) {
      if (j === attnQ) continue;
      const a = attnPrev[j] + (attnW[j] - attnPrev[j]) * e;
      const x0 = xs[attnQ], x1 = xs[j], h = Math.abs(x1 - x0) * 0.42;
      ctx!.lineWidth = 0.6 + a * 5;
      ctx!.strokeStyle = rgba(C.n, (0.08 + a * 0.9) * k);
      ctx!.beginPath(); ctx!.moveTo(x0, cy - 6); ctx!.quadraticCurveTo((x0 + x1) / 2, cy - 6 - h, x1, cy - 6); ctx!.stroke();
    }
    for (let i = 0; i < N; i++) {
      const s = 9;
      ctx!.lineWidth = 1;
      ctx!.fillStyle = rgba(C.surface, 1);
      ctx!.strokeStyle = rgba(i === attnQ ? C.n : C.strong, (i === attnQ ? 0.6 : 0.38) * k);
      ctx!.beginPath(); ctx!.roundRect(xs[i] - s / 2, cy - s / 2, s, s, 2); ctx!.fill(); ctx!.stroke();
    }
  }

  /* ---------------------------------------------------------- circuit */
  function drawCircuit(th: Thing, t: number) {
    const [cx, cy] = centre(th, t);
    const L = th.size * M, wires = 4, gapY = 22, colW = 34;
    const x0 = cx - L / 2, x1 = cx + L / 2, y0 = cy - ((wires - 1) * gapY) / 2;
    const k = th.depth * S();
    const fade = (x: number) => Math.max(0, Math.min(1, (x - x0) / 50, (x1 - x) / 50));
    // wires, fading at both ends
    const grad = ctx!.createLinearGradient(x0, 0, x1, 0);
    grad.addColorStop(0, rgba(C.strong, 0)); grad.addColorStop(0.12, rgba(C.strong, 0.34 * k));
    grad.addColorStop(0.88, rgba(C.strong, 0.34 * k)); grad.addColorStop(1, rgba(C.strong, 0));
    ctx!.strokeStyle = grad; ctx!.lineWidth = 1;
    for (let w = 0; w < wires; w++) line(x0, y0 + w * gapY, x1, y0 + w * gapY);
    // ket labels
    ctx!.font = `13px "New Computer Modern", serif`;
    ctx!.fillStyle = rgba(C.ink, 0.32 * k); ctx!.textAlign = 'right'; ctx!.textBaseline = 'middle';
    for (let w = 0; w < wires; w++) ctx!.fillText('|0⟩', x0 - 4, y0 + w * gapY + 1);
    ctx!.textAlign = 'left';
    // gates drift left along the wires; an execution sweep lights them as it passes
    const period = CIRCUIT.length * colW + colW * 2;
    const shift = reduce.matches ? 0 : (t * 9) % period;
    const sweep = x0 + ((t * 0.12) % 1) * L;
    for (let rep = -1; rep <= Math.ceil(L / period) + 1; rep++) {
      CIRCUIT.forEach((col, ci) => {
        const x = x0 + 40 + rep * period + ci * colW - shift;
        const a = fade(x);
        if (a <= 0) return;
        const g = reduce.matches || calm ? 0 : Math.max(0, 1 - Math.abs(x - sweep) / 26);
        const stroke = g > 0.05 ? rgba(C.n, (0.35 + 0.55 * g) * k * a) : rgba(C.strong, 0.48 * k * a);
        const fill = rgba(C.surface, 1);
        ctx!.lineWidth = 1; ctx!.strokeStyle = stroke;
        for (const op of col) {
          const y = y0 + op.w * gapY;
          if (op.k === 'CX' || op.k === 'CZ') {
            const yc = y0 + op.c * gapY;
            line(x, yc, x, y);
            dot(x, yc, 2.6, stroke);
            if (op.k === 'CZ') dot(x, y, 2.6, stroke);
            else { dot(x, y, 6, fill); ctx!.beginPath(); ctx!.arc(x, y, 6, 0, TAU); ctx!.stroke(); line(x - 6, y, x + 6, y); line(x, y - 6, x, y + 6); }
          } else {
            const s = 14;
            ctx!.fillStyle = fill; ctx!.beginPath(); ctx!.roundRect(x - s / 2, y - s / 2, s, s, 2); ctx!.fill(); ctx!.stroke();
            if (op.k === 'M') {
              ctx!.beginPath(); ctx!.arc(x, y + 3, 4.5, Math.PI, 0); ctx!.stroke(); line(x, y + 3, x + 3.5, y - 3);
            } else {
              ctx!.font = `${op.k === 'R' ? 10 : 11}px "New Computer Modern", serif`;
              ctx!.fillStyle = stroke; ctx!.textAlign = 'center';
              ctx!.fillText(op.k === 'R' ? 'Rᵧ' : op.k, x, y + 1);
              ctx!.textAlign = 'left';
            }
          }
        }
      });
    }
  }

  /* ------------------------------------------------------------ Bloch */
  const trail: { t: number; v: V3 }[] = [];
  function drawBloch(th: Thing, t: number) {
    const [cx, cy] = centre(th, t);
    const R = th.size * M;
    const view: V3 = [th.rot![0], th.spin![1] * t + th.drift, 0];
    const k = th.depth * S();
    const proj = (p: V3) => { const q = rotate(p, view); const s = 4 / (4 + q[2]); return { x: cx + q[0] * R * s, y: cy - q[1] * R * s, z: q[2] }; };
    const circle = (fn: (a: number) => V3, alpha: number, dash = false) => {
      ctx!.lineWidth = 0.9;
      if (dash) ctx!.setLineDash([2, 3]);
      for (let i = 0; i < 64; i++) {
        const a = proj(fn((i / 64) * TAU)), b = proj(fn(((i + 1) / 64) * TAU));
        ctx!.strokeStyle = rgba(C.strong, alpha * k * (a.z > 0 ? 0.5 : 1));
        line(a.x, a.y, b.x, b.y);
      }
      ctx!.setLineDash([]);
    };
    circle((a) => [Math.cos(a), 0, Math.sin(a)], 0.36); // equator
    circle((a) => [Math.cos(a), Math.sin(a), 0], 0.2, true); // meridian
    circle((a) => [0, Math.sin(a), Math.cos(a)], 0.2, true); // meridian
    // axes
    ctx!.strokeStyle = rgba(C.strong, 0.3 * k);
    const zt = proj([0, 1.18, 0]), zb = proj([0, -1.18, 0]);
    line(zb.x, zb.y, zt.x, zt.y);
    ctx!.font = `12px "New Computer Modern", serif`;
    ctx!.fillStyle = rgba(C.ink, 0.36 * k); ctx!.textAlign = 'center'; ctx!.textBaseline = 'middle';
    ctx!.fillText('|0⟩', zt.x, zt.y - 9); ctx!.fillText('|1⟩', zb.x, zb.y + 10);
    ctx!.textAlign = 'left';
    // state: Larmor precession about z with a slow Rabi nutation of the polar angle
    const theta = 0.95 + 0.55 * Math.sin(t * 0.21), phi = t * 0.8;
    const v: V3 = [Math.sin(theta) * Math.cos(phi), Math.cos(theta), Math.sin(theta) * Math.sin(phi)];
    if (!reduce.matches) { trail.push({ t, v }); while (trail.length && t - trail[0].t > 6) trail.shift(); }
    for (let i = 1; i < trail.length; i++) {
      const a = proj(trail[i - 1].v), b = proj(trail[i].v);
      ctx!.strokeStyle = rgba(C.n, 0.4 * (1 - (t - trail[i].t) / 6) * k); ctx!.lineWidth = 1;
      line(a.x, a.y, b.x, b.y);
    }
    const o = proj([0, 0, 0]), tip = proj(v);
    ctx!.strokeStyle = rgba(C.n, 0.62 * k); ctx!.lineWidth = 1.4;
    line(o.x, o.y, tip.x, tip.y);
    dot(tip.x, tip.y, 3, rgba(C.n, 0.75 * k));
    dot(o.x, o.y, 1.6, rgba(C.strong, 0.5 * k));
  }

  /* ------------------------------------------------------------- text */
  function drawText(th: Thing, t: number) {
    const [cx, cy] = centre(th, t);
    const size = Math.max(13, th.size * M);
    const k = th.depth * S();
    ctx!.fillStyle = rgba(C.ink, 0.32 * k);
    ctx!.textBaseline = 'alphabetic';
    const parts: { s: string; d: number }[] = [];
    const re = /([_^])\{([^}]*)\}/g;
    let last = 0, m: RegExpExecArray | null;
    const src = th.text!;
    while ((m = re.exec(src))) {
      if (m.index > last) parts.push({ s: src.slice(last, m.index), d: 0 });
      parts.push({ s: m[2], d: m[1] === '_' ? 1 : -1 });
      last = re.lastIndex;
    }
    if (last < src.length) parts.push({ s: src.slice(last), d: 0 });
    const font = (sz: number) => `${sz}px "New Computer Modern", "Latin Modern Roman", serif`;
    let total = 0;
    parts.forEach((p) => { ctx!.font = font(p.d ? size * 0.68 : size); total += ctx!.measureText(p.s).width; });
    let x = cx - total / 2;
    for (const p of parts) {
      ctx!.font = font(p.d ? size * 0.68 : size);
      ctx!.fillText(p.s, x, cy + (p.d === 1 ? size * 0.25 : p.d === -1 ? -size * 0.38 : 0));
      x += ctx!.measureText(p.s).width;
    }
  }

  const DRAW: Record<Kind, (th: Thing, t: number) => void> = {
    mol: drawMol, mlp: drawMLP, attn: drawAttn, text: drawText, circuit: drawCircuit, bloch: drawBloch,
  };
  function frame(t: number) {
    ctx!.clearRect(0, 0, W, H);
    for (const th of things) if (!(th.minWidth && W < th.minWidth)) DRAW[th.kind](th, t);
  }

  let raf = 0, lastDraw = 0;
  function loop(ts: number) {
    raf = requestAnimationFrame(loop);
    if (ts - lastDraw < FRAME_MS) return;
    lastDraw = ts;
    frame(tick());
  }
  const still = () => frame(clock0 + 12);
  function run() {
    cancelAnimationFrame(raf);
    lastReal = performance.now();
    if (reduce.matches) still();
    else raf = requestAnimationFrame(loop);
  }

  readColours();
  resize();
  run();

  let rt = 0;
  addEventListener('resize', () => { clearTimeout(rt); rt = window.setTimeout(() => { resize(); if (reduce.matches) still(); }, 120); });
  addEventListener('scroll', () => { scrollY = window.scrollY; if (reduce.matches) still(); }, { passive: true });
  if (!calm) addEventListener('pointermove', (e) => { pointer = { x: e.clientX, y: e.clientY, t: realNow() }; }, { passive: true });
  reduce.addEventListener('change', run);
  const recolour = () => { readColours(); if (reduce.matches) still(); };
  new MutationObserver(recolour).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', recolour);
  document.fonts?.ready.then(() => { if (reduce.matches) still(); });
}

import { useEffect, useRef } from 'react';
import {
  animate,
  motion,
  useMotionValue,
  useTransform,
  type AnimationPlaybackControls,
  type MotionValue,
} from 'motion/react';
import { useReducedMotion } from '../lib/use-reduced-motion';

type Pt = { x: number; y: number };

// A permanent dog-ear says "this corner lifts".
const REST = 14;
// Hovering the corner lifts it a little further, as if your thumb found it.
const HOVER = 22;
// How far the corner may be dragged past the note's own edges, as a share of
// its size. Keeps the flap from ever widening the page.
const OVERDRAG = 0.1;
// Holds the corner to the finger with just enough give to feel like paper.
const SETTLE = { type: 'spring', stiffness: 500, damping: 34 } as const;

// Sticky-note paper is a physical material, so these are raw colors on
// purpose: the classic canary, then pink, mint and sky pads.
const PAPERS = {
  canary: { paper: '#fdf3a7', back: '#f1e68f' },
  pink: { paper: '#ffdbe7', back: '#f0c3d3' },
  mint: { paper: '#d7f6e2', back: '#c1e9cf' },
  sky: { paper: '#daeffb', back: '#c3e1f4' },
} as const;

// Ballpoint ink. The paper is light, so the ink is too.
const INK = '#33418f';

const dot = (a: Pt, b: Pt) => a.x * b.x + a.y * b.y;

// Keeps the part of a convex polygon on one side of the fold line.
function clipSide(poly: Pt[], m: Pt, n: Pt, keepCorner: boolean) {
  const out: Pt[] = [];
  const side = (p: Pt) => dot({ x: p.x - m.x, y: p.y - m.y }, n);
  const inside = (d: number) => (keepCorner ? d > 0 : d <= 0);
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const da = side(a);
    const db = side(b);
    if (inside(da)) out.push(a);
    if (inside(da) !== inside(db)) {
      const t = da / (da - db);
      out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
    }
  }
  return out;
}

const toPolygon = (pts: Pt[]) =>
  pts.length < 3
    ? 'polygon(0px 0px, 0px 0px, 0px 0px)'
    : `polygon(${pts.map((p) => `${p.x.toFixed(2)}px ${p.y.toFixed(2)}px`).join(', ')})`;

// The bottom-right corner C is lifted to P. The fold is the perpendicular
// bisector of CP: what lies past it is flipped over the line and shows its
// back. Reflection across a line is a single affine matrix, so the flap is
// just the same sheet, clipped and mirrored.
function fold(w: number, h: number, dx: number, dy: number) {
  const rect = [
    { x: 0, y: 0 },
    { x: w, y: 0 },
    { x: w, y: h },
    { x: 0, y: h },
  ];
  const len = Math.hypot(dx, dy);
  if (len < 0.5) {
    return {
      flat: toPolygon(rect),
      back: toPolygon([]),
      matrix: 'none',
      crease: 'none',
    };
  }
  const n = { x: -dx / len, y: -dy / len };
  const m = { x: w + dx / 2, y: h + dy / 2 };
  const k = 2 * dot(m, n);
  const a = 1 - 2 * n.x * n.x;
  const b = -2 * n.x * n.y;
  const d = 1 - 2 * n.y * n.y;
  // Lays a strip along the fold whose local +y points into the flap, so a
  // top-to-bottom gradient shades the paper right where it bends.
  const angle = Math.atan2(-n.x, n.y);
  const span = w + h;
  return {
    flat: toPolygon(clipSide(rect, m, n, false)),
    back: toPolygon(clipSide(rect, m, n, true)),
    matrix: `matrix(${a}, ${b}, ${b}, ${d}, ${k * n.x}, ${k * n.y})`,
    crease: `translate(${m.x}px, ${m.y}px) rotate(${angle}rad) translate(${-span}px, 0px)`,
  };
}

export type StickyPaper = keyof typeof PAPERS;

export type StickyPhotoProps = {
  src: string;
  alt: string;
  caption: string;
  paper?: StickyPaper;
  /** Degrees the note sits at, like a pad that has been handled. */
  tilt?: number;
  /** Fires on a plain click (not after a corner drag). */
  onTap?: () => void;
  className?: string;
};

export function StickyPhoto({
  src,
  alt,
  caption,
  paper = 'canary',
  tilt = -2,
  onTap,
  className = '',
}: StickyPhotoProps) {
  const reduceMotion = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: number; x: number; y: number; dx: number; dy: number } | null>(null);
  const dragged = useRef(false);
  const springs = useRef<AnimationPlaybackControls[]>([]);

  // The note's lifted corner, as an offset from its bottom-right.
  const dx = useMotionValue(-REST);
  const dy = useMotionValue(-REST);
  // Measured, so the fold stays exact at any width.
  const w = useMotionValue(280);
  const h = useMotionValue(300);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      w.set(entry.contentRect.width);
      h.set(entry.contentRect.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [w, h]);

  useEffect(() => {
    const list = springs.current;
    return () => list.forEach((c) => c.stop());
  }, []);

  const settle = (x: number, y: number) => {
    springs.current.forEach((c) => c.stop());
    if (reduceMotion) {
      dx.jump(x);
      dy.jump(y);
      return;
    }
    springs.current = [animate(dx, x, SETTLE), animate(dy, y, SETTLE)];
  };

  const geo = useTransform(() => fold(w.get(), h.get(), dx.get(), dy.get()));
  const flat = useTransform(geo, (g) => g.flat);
  const back = useTransform(geo, (g) => g.back);
  const matrix = useTransform(geo, (g) => g.matrix);
  const crease = useTransform(geo, (g) => g.crease);

  const colors = PAPERS[paper];

  // The sheet is tilted, so screen movement is turned into the sheet's own
  // axes before it moves the corner.
  const theta = (-tilt * Math.PI) / 180;
  const local = (x: number, y: number) => ({
    x: x * Math.cos(theta) - y * Math.sin(theta),
    y: x * Math.sin(theta) + y * Math.cos(theta),
  });

  const onEnter = (e: React.PointerEvent) => {
    if (e.pointerType !== 'touch' && !drag.current) settle(-HOVER, -HOVER);
  };
  const onLeave = (e: React.PointerEvent) => {
    if (e.pointerType !== 'touch' && !drag.current) settle(-REST, -REST);
  };
  const onDown = (e: React.PointerEvent) => {
    if (drag.current || e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    springs.current.forEach((c) => c.stop());
    dragged.current = false;
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, dx: dx.get(), dy: dy.get() };
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 5) dragged.current = true;
    const move = local(e.clientX - d.x, e.clientY - d.y);
    const width = w.get();
    const height = h.get();
    dx.set(Math.min(0, Math.max(-width * (1 + OVERDRAG), d.dx + move.x)));
    dy.set(Math.min(0, Math.max(-height * (1 + OVERDRAG), d.dy + move.y)));
  };
  const onUp = (e: React.PointerEvent) => {
    if (drag.current?.id !== e.pointerId) return;
    drag.current = null;
    // The corner always springs back: the note stays on the board.
    settle(-REST, -REST);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (dragged.current) {
      dragged.current = false;
      e.stopPropagation();
      return;
    }
    if (onTap) {
      e.stopPropagation();
      onTap();
    }
  };

  return (
    <div
      ref={root}
      onClick={handleClick}
      className={`relative group ${onTap ? 'cursor-pointer' : ''} ${className}`}
      style={{ rotate: `${tilt}deg` }}
    >
      {/* Shadow as a filter on a wrapper, so it follows the clipped shape
          instead of being cut away with it. */}
      <div className="[filter:drop-shadow(0_1px_1px_rgba(0,0,0,0.12))_drop-shadow(0_10px_12px_rgba(0,0,0,0.12))]">
        <motion.div
          style={{ clipPath: flat, backgroundColor: colors.paper }}
          className="relative p-2 pb-7"
        >
          {/* The adhesive strip reads as a slightly glossier band. */}
          <span
            aria-hidden
            className="absolute inset-x-0 top-0 h-7 bg-gradient-to-b from-black/[0.05] to-transparent pointer-events-none"
          />
          <img
            src={src}
            alt={alt}
            loading="eager"
            decoding="async"
            draggable={false}
            className="block aspect-[3/2] w-full select-none bg-ink/80 object-cover"
          />
          {/* Fixed-height caption box: every note stays the same height no
              matter how its caption wraps, so swapping the stack top never
              resizes the card around it. */}
          <div className="relative mt-1.5 flex h-9 items-center justify-center overflow-hidden">
            <p
              className="text-center font-handwritten text-[15px] leading-tight"
              style={{ color: INK }}
            >
              {caption}
            </p>
          </div>
        </motion.div>
      </div>

      {/* The flap: the same sheet mirrored across the fold, back side up. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [filter:drop-shadow(-1px_2px_2px_rgba(0,0,0,0.18))]"
      >
        <motion.div
          style={{
            clipPath: back,
            transform: matrix,
            backgroundColor: colors.back,
          }}
          className="absolute inset-0 origin-top-left overflow-hidden"
        >
          <motion.span
            style={{ transform: crease }}
            className="absolute top-0 left-0 h-10 w-[800px] origin-top-left bg-gradient-to-b from-black/[0.14] to-transparent"
          />
          <span className="absolute inset-0 bg-gradient-to-br from-white/25 to-transparent" />
        </motion.div>
      </div>

      {/* The corner you grab. */}
      <div
        aria-hidden
        onPointerEnter={onEnter}
        onPointerLeave={onLeave}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        className="absolute bottom-0 right-0 h-14 w-14 cursor-grab touch-none active:cursor-grabbing"
      />
    </div>
  );
}

"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/cn";

// The bottle, in viewBox units (100 x 124): a squat, heavy-based inkwell
// with sloped shoulders and a short neck. OUTER is the glass surface, INNER
// the cavity the ink fills; the gap between them is the glass itself.
const OUTER =
  "M36 36V48C36 54 8 54 8 66V108Q8 116 16 116H84Q92 116 92 108V66C92 54 64 54 64 48V36Z";
const INNER =
  "M39 36V49C39 57 11 57 11 67V104Q11 108 15 108H85Q89 108 89 104V67C89 57 61 57 61 49V36Z";
// The ink line when full (just under the shoulders) and when dry.
const FULL_Y = 64;
const DRY_Y = 107.5;
const LEFT = 11;
const RIGHT = 89;
// Ink is a physical material: connected to the website's ink variable with fallback
const INK = "var(--color-ink, #111111)";
// The dip pen's wood holder, brass ferrule and steel nib, also physical.
const WOOD = "#8b5a2b";
const BRASS = "#d4af37";
const STEEL = "#94a3b8";

// Ruled like writing paper: one rule under each 24px line, scrolling with
// the text. The first layer paints over the 14px top padding, where the
// repeat would otherwise put a stray rule above the first line.
const RULED = {
  backgroundImage:
    "linear-gradient(var(--color-background, var(--background, #fff)), var(--color-background, var(--background, #fff))), repeating-linear-gradient(to bottom, transparent 0 23px, color-mix(in srgb, var(--color-foreground, currentColor) 12%, transparent) 23px 24px)",
  backgroundSize: "100% 14px, 100% 24px",
  backgroundRepeat: "no-repeat, repeat",
  backgroundPosition: "0 0, 0 14px",
  backgroundAttachment: "local",
} as const;

// The level follows the count on a slightly loose spring so each keystroke
// lets the ink settle rather than step.
const LEVEL_K = 90;
const LEVEL_C = 16;
// Surface ripples die out over about a second and a half once typing stops.
const WAVE_DECAY = 2.4;
const WAVE_MAX = 3.2;
// Below this, the surface is flat enough to stop drawing frames.
const REST = 0.02;
// Remaining-count fraction where the ink turns to the danger color.
const WARN = 0.1;

export type Bucket = "ok" | "warn" | "full" | "over";

export function bucketFor(remaining: number, limit: number): Bucket {
  if (remaining < 0) return "over";
  if (remaining === 0) return "full";
  if (remaining <= Math.max(1, Math.round(limit * WARN))) return "warn";
  return "ok";
}

// The body of ink, closed below the bottle.
function surfacePath(level: number, amp: number, phase: number) {
  return `${surfaceLine(level, amp, phase)}L${RIGHT} 124L${LEFT} 124Z`;
}

// Just the top edge, drawn again as the thin bright line where light
// catches the meniscus.
function surfaceLine(level: number, amp: number, phase: number) {
  let d = "";
  // Two detuned sines read as liquid; a single one reads as a graph.
  for (let x = LEFT; x <= RIGHT; x += 2) {
    const y =
      level +
      amp * Math.sin(x * 0.16 + phase) +
      amp * 0.45 * Math.sin(x * 0.37 - phase * 1.4);
    d += `${d ? "L" : "M"}${x} ${y.toFixed(2)}`;
  }
  return d;
}

/**
 * InkWellBottle: Standalone physical ink bottle and dip pen with physics sloshing
 */
export function InkWellBottle({
  value,
  limit = 200,
  className,
  onSloshRef,
}: {
  value: string;
  limit?: number;
  className?: string;
  onSloshRef?: React.MutableRefObject<(() => void) | null>;
}) {
  const id = useId();
  const reduceMotion = useReducedMotion();
  const remaining = limit - value.length;
  const bucket = bucketFor(remaining, limit);
  const fraction = Math.min(Math.max(remaining / limit, 0), 1);
  const target = DRY_Y - (DRY_Y - FULL_Y) * fraction;

  const inkRef = useRef<SVGPathElement>(null);
  const lineRef = useRef<SVGPathElement>(null);
  const [initialInk] = useState(() => surfacePath(target, 0, 0));
  const [initialLine] = useState(() => surfaceLine(target, 0, 0));
  const sim = useRef({ level: target, vel: 0, amp: 0, phase: 0, target });
  const frame = useRef(0);
  const lastInput = useRef(0);

  const draw = () => {
    const s = sim.current;
    inkRef.current?.setAttribute("d", surfacePath(s.level, s.amp, s.phase));
    lineRef.current?.setAttribute("d", surfaceLine(s.level, s.amp, s.phase));
  };

  const run = () => {
    if (frame.current) return;
    let last = performance.now();
    const tick = (now: number) => {
      const s = sim.current;
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      s.vel += (-LEVEL_K * (s.level - s.target) - LEVEL_C * s.vel) * dt;
      s.level += s.vel * dt;
      s.amp *= Math.exp(-WAVE_DECAY * dt);
      s.phase += dt * 7;
      draw();
      const still =
        s.amp < REST &&
        Math.abs(s.vel) < REST &&
        Math.abs(s.level - s.target) < REST;
      if (still) {
        s.amp = 0;
        s.level = s.target;
        draw();
        frame.current = 0;
        return;
      }
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
  };

  const slosh = () => {
    if (reduceMotion) return;
    const now = performance.now();
    const gap = now - lastInput.current;
    lastInput.current = now;
    const kick = Math.min(1, 90 / Math.max(gap, 30)) * 0.9 + 0.15;
    const s = sim.current;
    s.amp = Math.min(WAVE_MAX, s.amp + kick);
    run();
  };

  if (onSloshRef) {
    onSloshRef.current = slosh;
  }

  useEffect(() => {
    const s = sim.current;
    s.target = target;
    if (reduceMotion) {
      cancelAnimationFrame(frame.current);
      frame.current = 0;
      Object.assign(s, { level: target, vel: 0, amp: 0 });
      draw();
      return;
    }
    run();
  }, [target, reduceMotion]);

  useEffect(
    () => () => {
      cancelAnimationFrame(frame.current);
      frame.current = 0;
    },
    [],
  );

  const dry = remaining <= 0;
  const hot = bucket !== "ok";

  return (
    <div className={cn("flex w-[96px] shrink-0 flex-col items-center justify-end sm:w-[124px]", className)}>
      <svg
        viewBox="0 0 100 124"
        className="w-full overflow-visible drop-shadow-[0_4px_8px_rgba(0,0,0,0.15)]"
        aria-hidden
      >
        <defs>
          <clipPath id={`${id}-cavity`}>
            <path d={INNER} />
          </clipPath>
        </defs>
        {/* Where the heavy base meets the desk. */}
        <ellipse
          cx={50}
          cy={117}
          rx={46}
          ry={4}
          fill="rgba(0,0,0,0.18)"
          className="blur-[2px]"
        />
        {/* The far wall of the glass, seen through the cavity. */}
        <path d={INNER} fill="rgba(255,255,255,0.08)" />

        {/* A dip pen resting in the well, leaning on the neck. */}
        <g transform="translate(47 101) rotate(12.2)">
          <path d="M0 0L-2.4 -11H2.4Z" fill={STEEL} />
          <path d="M0 -2V-9" stroke="#475569" strokeWidth={0.6} />
          <rect x={-3} y={-17} width={6} height={6} rx={1} fill={BRASS} />
          <path d="M-2.6 -17L-2 -106Q0 -109 2 -106L2.6 -17Z" fill={WOOD} />
          <path
            d="M-1.2 -20L-1 -100"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth={0.8}
            strokeLinecap="round"
          />
        </g>

        <g clipPath={`url(#${id}-cavity)`}>
          {/* A dried ring where the last of the ink sat. */}
          <ellipse
            cx={50}
            cy={106}
            rx={34}
            ry={2}
            className={cn(
              "fill-none transition-[opacity] duration-300 ease-out",
              dry ? "opacity-40" : "opacity-0",
            )}
            stroke={INK}
            strokeWidth={1}
          />
          <path
            ref={inkRef}
            d={initialInk}
            fill={INK}
            className={cn(
              "transition-[fill] duration-200 ease-out",
              hot && "fill-[#dc2626]",
            )}
            style={hot ? undefined : { fill: INK }}
          />
          {/* Light catching the meniscus. */}
          <path
            ref={lineRef}
            d={initialLine}
            fill="none"
            stroke="rgba(255,255,255,0.45)"
            strokeWidth={1}
            className={cn(
              "transition-[opacity] duration-300 ease-out",
              dry && "opacity-0",
            )}
          />
        </g>

        {/* The glass itself: the band between the two walls, thickest
            in the base, tinting what sits behind it. */}
        <path
          d={`${OUTER}${INNER}`}
          fillRule="evenodd"
          fill="rgba(255,255,255,0.22)"
        />
        <path
          d={OUTER}
          fill="none"
          stroke="rgba(17,17,17,0.45)"
          strokeWidth={1.25}
          strokeLinejoin="round"
        />
        <path
          d={INNER}
          fill="none"
          stroke="rgba(17,17,17,0.18)"
          strokeWidth={0.75}
        />
        {/* The rolled lip of the neck. */}
        <rect
          x={33}
          y={31}
          width={34}
          height={6}
          rx={2.5}
          fill="rgba(255,255,255,0.25)"
          stroke="rgba(17,17,17,0.45)"
          strokeWidth={1.25}
        />
        {/* Specular light on curved glass is white in any room. */}
        <path
          d="M14 72V100"
          strokeWidth={3}
          strokeLinecap="round"
          stroke="rgba(255,255,255,0.7)"
        />
        <path
          d="M19.5 62C24 58 30 57 34 55"
          fill="none"
          strokeWidth={2}
          strokeLinecap="round"
          stroke="rgba(255,255,255,0.7)"
        />
        <path
          d="M85 76V90"
          strokeWidth={1.5}
          strokeLinecap="round"
          stroke="rgba(255,255,255,0.55)"
        />
        <path
          d="M22 112.5H78"
          strokeWidth={1}
          strokeLinecap="round"
          stroke="rgba(255,255,255,0.5)"
        />
      </svg>
      <p
        aria-hidden
        className={cn(
          "mt-2 text-center text-[12.5px] leading-tight transition-[color] duration-200 ease-out select-none",
          hot ? "text-danger font-bold" : "text-muted",
        )}
      >
        <span className="block text-xl sm:text-2xl font-semibold tracking-tight tabular-nums">
          {remaining}
        </span>
        {remaining < 0 ? "over the limit" : "left"}
      </p>
    </div>
  );
}

/**
 * InkWell: Full textarea + Ink bottle component
 */
export function InkWell({
  value,
  onChange,
  limit = 200,
  label,
  placeholder,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  limit?: number;
  label: string;
  placeholder?: string;
  className?: string;
}) {
  const id = useId();
  const remaining = limit - value.length;
  const bucket = bucketFor(remaining, limit);
  const bottleSloshRef = useRef<(() => void) | null>(null);

  // Announce only when crossing a threshold
  const [announcement, setAnnouncement] = useState("");
  const lastBucket = useRef(bucket);
  useEffect(() => {
    if (bucket === lastBucket.current) return;
    lastBucket.current = bucket;
    setAnnouncement(
      bucket === "warn"
        ? `${remaining} characters left`
        : bucket === "full"
          ? "Character limit reached"
          : bucket === "over"
            ? "Over the character limit"
            : "",
    );
  }, [bucket, remaining]);

  return (
    <div className={cn("w-[min(520px,100%)]", className)}>
      <label
        htmlFor={`${id}-field`}
        className="mb-2 block text-sm font-medium text-foreground"
      >
        {label}
      </label>
      <div className="flex items-stretch gap-4 sm:gap-6">
        <textarea
          id={`${id}-field`}
          value={value}
          placeholder={placeholder}
          aria-describedby={`${id}-count`}
          aria-invalid={remaining < 0 || undefined}
          onChange={(e) => {
            onChange(e.target.value);
            bottleSloshRef.current?.();
          }}
          rows={6}
          style={RULED}
          className={cn(
            "block h-[208px] min-w-0 flex-1 resize-none rounded-xl bg-background px-4 py-3.5 text-[15px] leading-6 text-foreground shadow-raised outline-hidden transition-[box-shadow] duration-150 ease-out placeholder:text-muted focus:shadow-[0_0_0_1.5px_var(--foreground)]",
            remaining < 0 &&
              "shadow-[0_0_0_1.5px_var(--danger)] focus:shadow-[0_0_0_1.5px_var(--danger)]",
          )}
        />
        <InkWellBottle
          value={value}
          limit={limit}
          onSloshRef={bottleSloshRef}
        />
      </div>
      <span id={`${id}-count`} className="sr-only">
        {remaining < 0
          ? `${-remaining} characters over the ${limit} character limit`
          : `${remaining} of ${limit} characters remaining`}
      </span>
      <span className="sr-only" aria-live="polite">
        {announcement}
      </span>
    </div>
  );
}

export default function InkWellDemo() {
  const [text, setText] = useState(
    "Dear Ada, the prototype finally runs. ",
  );
  return (
    <InkWell
      label="Postcard"
      placeholder="Write a short note"
      limit={160}
      value={text}
      onChange={setText}
    />
  );
}

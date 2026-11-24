"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  animate,
  motion,
  useMotionValue,
  useTransform,
  type AnimationPlaybackControls,
  type MotionValue,
  type ValueAnimationTransition,
} from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/cn";
import { Tape } from "@/components/ui/tape";
import { InkWellBottle } from "./InkWell";

type Phase = "compose" | "sending" | "sent";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const;
const EASE_IN = [0.55, 0, 1, 0.45] as const;

// Scaled envelope geometry:
// Paper area is 220 tall, envelope is 296 x 184 px centered with 18px margins.
const PAPER_H = 220;
const ENV_W = 296;
const ENV_H = 184;
const ENV_TOP = (PAPER_H - ENV_H) / 2; // 18px
const FLAP_H = 104;
const POCKET_V = 100;
const NOTE_W = 252;
const MONTHS = "JAN FEB MAR APR MAY JUN JUL AUG SEP OCT NOV DEC".split(" ");

// Wax seal: 19px circle with 13 soft lobes
const SEAL_R = 19;
const SEAL_PATH =
  Array.from({ length: 52 }, (_, i) => {
    const a = (i / 52) * Math.PI * 2;
    const r = SEAL_R - 2.2 + Math.sin(a * 13) * 1.5 + Math.sin(a * 5 + 1) * 0.7;
    const x = (SEAL_R + Math.cos(a) * r).toFixed(2);
    const y = (SEAL_R + Math.sin(a) * r).toFixed(2);
    return `${i === 0 ? "M" : "L"}${x} ${y}`;
  }).join(" ") + " Z";

// Theme-connected physical materials
const WAX = "var(--color-stamp, #b3261e)";
const WAX_LIGHT = "color-mix(in srgb, var(--color-stamp, #d9594b) 70%, white)";
const AIR_RED = "#d4483b";
const AIR_BLUE = "#2d5bb8";

const noop = () => () => {};
const readModifier = () =>
  typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform)
    ? "⌘"
    : "Ctrl";

export function EnvelopeSend({
  onSend,
  title = "Send feedback",
  description = "Tell us what to fix. We read every note.",
  placeholder = "What could be better?",
  namePlaceholder = "Your name or callsign...",
  limit = 200,
  showInkWell = true,
  className,
  variant = "default",
}: {
  onSend?: (message: string, name?: string) => void;
  title?: string;
  description?: string;
  placeholder?: string;
  namePlaceholder?: string;
  limit?: number;
  showInkWell?: boolean;
  className?: string;
  variant?: "default" | "sticky";
}) {
  const reduceMotion = useReducedMotion();
  const modifier = useSyncExternalStore(noop, readModifier, () => "Ctrl");
  const fieldId = useId();
  const nameFieldId = useId();
  const [phase, setPhase] = useState<Phase>("compose");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const paperRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const againRef = useRef<HTMLButtonElement>(null);
  const running = useRef<AnimationPlaybackControls[]>([]);
  const svgId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const [sentOn, setSentOn] = useState("");
  const bottleSloshRef = useRef<(() => void) | null>(null);

  const chrome = useMotionValue(1);
  const noteScale = useMotionValue(1);
  const noteY = useMotionValue(0);
  const envOpacity = useMotionValue(0);
  const envY = useMotionValue(16);
  const flap = useMotionValue(180);
  const seal = useMotionValue(0);
  const groupX = useMotionValue(0);
  const groupY = useMotionValue(0);
  const groupRotate = useMotionValue(0);
  const groupOpacity = useMotionValue(1);
  const groupBlur = useMotionValue(0);
  const groupFilter = useTransform(groupBlur, (b) =>
    b > 0.01 ? `blur(${b}px)` : "none",
  );
  const flapZ = useTransform(flap, (r) => (r > 90 ? 1 : 4));
  const sealScale = useTransform(seal, [0, 1], [1.35, 1]);

  useEffect(() => {
    const list = running;
    return () => list.current.forEach((c) => c.stop());
  }, []);

  const play = (
    value: MotionValue<number>,
    to: number,
    transition: ValueAnimationTransition<number>,
  ) => {
    const controls = animate(value, to, transition);
    running.current.push(controls);
    return controls;
  };

  const finish = () => {
    running.current = [];
    setPhase("sent");
    requestAnimationFrame(() => againRef.current?.focus());
  };

  const send = async () => {
    const text = message.trim();
    const paper = paperRef.current;
    if (phase !== "compose" || !text || !paper || (limit && message.length > limit)) return;
    setPhase("sending");
    const now = new Date();
    setSentOn(`${now.getDate()} ${MONTHS[now.getMonth()]}`);
    onSend?.(text, name.trim());

    if (reduceMotion) {
      chrome.jump(0);
      groupOpacity.jump(0);
      finish();
      return;
    }

    const scale = NOTE_W / paper.offsetWidth;
    const noteH = PAPER_H * scale;

    await Promise.all([
      play(chrome, 0, { duration: 0.15, ease: EASE_OUT }),
      play(noteScale, scale, { duration: 0.24, ease: EASE_IN_OUT }),
      play(noteY, ENV_TOP - noteH * 0.55, {
        duration: 0.24,
        ease: EASE_IN_OUT,
      }),
      play(envOpacity, 1, { duration: 0.18, ease: EASE_OUT }),
      play(envY, 0, { duration: 0.24, ease: EASE_OUT }),
    ]);

    await play(noteY, ENV_TOP + 12, { duration: 0.16, ease: EASE_IN });
    await play(flap, 0, { duration: 0.18, ease: EASE_IN_OUT });
    play(seal, 1, { type: "spring", duration: 0.3, bounce: 0.25 });
    const away = { duration: 0.34, ease: EASE_IN, delay: 0.22 };
    await Promise.all([
      play(groupX, 240, away),
      play(groupY, -80, away),
      play(groupRotate, -12, away),
      play(groupOpacity, 0, away),
    ]);
    finish();
  };

  const writeAnother = () => {
    setName("");
    setMessage("");
    setPhase("compose");
    noteScale.jump(1);
    noteY.jump(0);
    envOpacity.jump(0);
    envY.jump(16);
    flap.jump(180);
    seal.jump(0);
    groupX.jump(0);
    groupRotate.jump(0);
    if (reduceMotion) {
      groupY.jump(0);
      groupOpacity.jump(1);
      chrome.jump(1);
    } else {
      groupY.jump(8);
      groupBlur.jump(4);
      const enter = { duration: 0.3, ease: EASE_OUT };
      play(groupY, 0, enter);
      play(groupBlur, 0, enter);
      play(groupOpacity, 1, enter);
      play(chrome, 1, enter);
    }
    requestAnimationFrame(() => textRef.current?.focus());
  };

  const empty = message.trim() === "";
  const isOverLimit = limit ? message.length > limit : false;
  const FLAP_PATH = `M1 1 L${ENV_W - 1} 1 L${ENV_W / 2 + 10} ${FLAP_H - 8} Q${ENV_W / 2} ${FLAP_H} ${ENV_W / 2 - 10} ${FLAP_H - 8} Z`;
  const POCKET_PATH = `M0.5 0.5 L${ENV_W / 2} ${POCKET_V} L${ENV_W - 0.5} 0.5 L${ENV_W - 0.5} ${ENV_H - 8} Q${ENV_W - 0.5} ${ENV_H - 0.5} ${ENV_W - 8} ${ENV_H - 0.5} L8 ${ENV_H - 0.5} Q0.5 ${ENV_H - 0.5} 0.5 ${ENV_H - 8} Z`;
  const envelopeBox = {
    left: `calc(50% - ${ENV_W / 2}px)`,
    top: ENV_TOP,
    width: ENV_W,
  };

  return (
    <div className={cn("flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-6 w-full max-w-3xl", className)}>
      {/* Main Stationery Card */}
      <div
        className={cn(
          "relative h-[415px] sm:h-[430px] w-[min(460px,100%)] p-5 sm:p-6 transition-colors duration-300 shrink-0",
          variant === "sticky"
            ? "rounded-none bg-[#fef08a] text-[#1c1917] border border-[#eab308]/60 shadow-[0_12px_28px_-6px_rgba(0,0,0,0.22),0_4px_10px_-2px_rgba(0,0,0,0.1)] transform -rotate-[0.8deg]"
            : "rounded-[22px] bg-surface shadow-raised border border-ink/15"
        )}
        style={variant === "sticky" ? {
          backgroundColor: "#fef08a",
          ['--color-surface' as string]: '#fef08a',
          ['--color-background' as string]: '#fef9c3',
          ['--color-foreground' as string]: '#1c1917',
          ['--color-muted' as string]: '#713f12',
        } : undefined}
      >
        {/* Sticky Note Top Tape */}
        {variant === "sticky" && (
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 pointer-events-none z-30">
            <Tape
              kind="washi-gingham"
              color="sky"
              ends="scissor"
              length={84}
              height={22}
              angle={1.8}
              seed="sticky-envelope-tape"
              style={{ rotate: "1.8deg" }}
            />
          </div>
        )}
        <div inert={phase !== "compose"} className="flex h-full flex-col">
          <motion.div style={{ opacity: chrome }} className="mb-0.5">
            <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight">{title}</h2>
            <p className="mt-0.5 text-xs sm:text-sm text-muted">{description}</p>
          </motion.div>

          <motion.div
            className="relative mt-3 shrink-0"
            style={{
              height: PAPER_H,
              x: groupX,
              y: groupY,
              rotate: groupRotate,
              opacity: groupOpacity,
              filter: groupFilter,
            }}
          >
            {/* Envelope back */}
            <motion.svg
              aria-hidden
              viewBox={`0 0 ${ENV_W} ${ENV_H}`}
              className="pointer-events-none absolute z-[1] overflow-visible"
              style={{
                ...envelopeBox,
                height: ENV_H,
                opacity: envOpacity,
                y: envY,
              }}
            >
              <rect
                x="0.5"
                y="0.5"
                width={ENV_W - 1}
                height={ENV_H - 1}
                rx="8"
                fill="#fbf8ef"
                stroke="#d5c8a5"
              />
              <rect
                x="0.5"
                y="0.5"
                width={ENV_W - 1}
                height={ENV_H - 1}
                rx="8"
                fill="rgba(0,0,0,0.03)"
              />
              <defs>
                <pattern
                  id={`${svgId}-air`}
                  width="24"
                  height="24"
                  patternUnits="userSpaceOnUse"
                  patternTransform="rotate(45)"
                >
                  <rect width="7" height="24" style={{ fill: AIR_RED }} />
                  <rect x="12" width="7" height="24" style={{ fill: AIR_BLUE }} />
                </pattern>
              </defs>
            </motion.svg>

            {/* The flap */}
            <motion.svg
              aria-hidden
              viewBox={`0 0 ${ENV_W} ${FLAP_H}`}
              className="pointer-events-none absolute overflow-visible"
              style={{
                ...envelopeBox,
                height: FLAP_H,
                opacity: envOpacity,
                y: envY,
                rotateX: flap,
                zIndex: flapZ,
                transformPerspective: 700,
                originY: 0,
              }}
            >
              <clipPath id={`${svgId}-flap`}>
                <path d={FLAP_PATH} />
              </clipPath>
              <path
                d={FLAP_PATH}
                strokeLinejoin="round"
                fill="#fbf8ef"
                stroke="#d5c8a5"
              />
              <rect
                x="0"
                y="0"
                width={ENV_W}
                height={ENV_H}
                fill="none"
                stroke={`url(#${svgId}-air)`}
                strokeWidth="12"
                clipPath={`url(#${svgId}-flap)`}
                opacity="0.9"
              />
            </motion.svg>

            {/* The Paper Note */}
            <motion.div
              ref={paperRef}
              className="absolute inset-0 z-[2] rounded-[16px] bg-background shadow-raised border border-foreground/10 flex flex-col overflow-hidden"
              style={{
                scale: noteScale,
                y: noteY,
                originY: 0,
                backgroundImage:
                  "repeating-linear-gradient(to bottom, transparent 0 25px, color-mix(in srgb, var(--color-ink, currentColor) 10%, transparent) 25px 26px)",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "20px 48px",
                backgroundSize: "calc(100% - 40px) calc(100% - 56px)",
              }}
            >
              <Stamp className="pointer-events-none absolute top-3 right-3 rotate-[3deg]" />
              
              {/* FROM / Name field */}
              <div className="pt-3 pb-1.5 pl-4 pr-[76px] border-b border-foreground/15 flex items-center gap-2 shrink-0">
                <label
                  htmlFor={nameFieldId}
                  className="text-[12px] sm:text-[13px] font-bold text-muted uppercase tracking-wider select-none font-typewriter"
                >
                  FROM:
                </label>
                <input
                  id={nameFieldId}
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    bottleSloshRef.current?.();
                  }}
                  placeholder={namePlaceholder}
                  readOnly={phase !== "compose"}
                  className="w-full bg-transparent text-[14px] sm:text-[15px] font-semibold text-foreground outline-hidden placeholder:text-muted/60 font-typewriter"
                />
              </div>

              <label htmlFor={fieldId} className="sr-only">
                {title}
              </label>
              <textarea
                id={fieldId}
                ref={textRef}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  bottleSloshRef.current?.();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder={placeholder}
                readOnly={phase !== "compose"}
                className="block size-full flex-1 resize-none bg-transparent pt-3 pr-[72px] pl-4 text-[15px] sm:text-[16px] leading-[26px] text-foreground outline-hidden placeholder:text-muted focus-visible:outline-none"
              />
            </motion.div>

            {/* Pocket front */}
            <motion.svg
              aria-hidden
              viewBox={`0 0 ${ENV_W} ${ENV_H}`}
              className="pointer-events-none absolute z-[3] overflow-visible"
              style={{
                ...envelopeBox,
                height: ENV_H,
                opacity: envOpacity,
                y: envY,
              }}
            >
              <clipPath id={`${svgId}-pocket`}>
                <path d={POCKET_PATH} />
              </clipPath>
              <path
                d={POCKET_PATH}
                strokeLinejoin="round"
                fill="#fbf8ef"
                stroke="#d5c8a5"
              />
              <rect
                x="0"
                y="0"
                width={ENV_W}
                height={ENV_H}
                fill="none"
                stroke={`url(#${svgId}-air)`}
                strokeWidth="12"
                clipPath={`url(#${svgId}-pocket)`}
                opacity="0.9"
              />
              <path
                d={`M1 ${ENV_H - 1} L${ENV_W / 2 - 18} ${POCKET_V + 24} M${ENV_W - 1} ${ENV_H - 1} L${ENV_W / 2 + 18} ${POCKET_V + 24}`}
                fill="none"
                stroke="#d5c8a5"
              />
            </motion.svg>

            {/* Wax seal */}
            <motion.svg
              aria-hidden
              viewBox={`0 0 ${SEAL_R * 2} ${SEAL_R * 2}`}
              className="pointer-events-none absolute z-[5] overflow-visible"
              style={{
                width: SEAL_R * 2,
                height: SEAL_R * 2,
                left: `calc(50% - ${SEAL_R}px)`,
                top: ENV_TOP + FLAP_H - SEAL_R - 6,
                scale: sealScale,
                opacity: seal,
              }}
            >
              <path
                d={SEAL_PATH}
                style={{ fill: WAX }}
                className="drop-shadow-[0_2px_3px_rgb(0_0_0/0.3)]"
              />
              <circle
                cx={SEAL_R}
                cy={SEAL_R}
                r={SEAL_R - 8}
                fill="none"
                strokeWidth="2"
                style={{ stroke: WAX_LIGHT }}
                opacity="0.7"
              />
              <path
                d={`M${SEAL_R - 7} ${SEAL_R + 1} l4.5 4.5 l8.5 -9`}
                fill="none"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ stroke: WAX_LIGHT }}
              />
            </motion.svg>
          </motion.div>

          {/* Footer with Key hint and Send Button */}
          <motion.div
            className="mt-auto flex items-center justify-between gap-3 pt-2"
            style={{ opacity: chrome }}
          >
            <span className="text-xs sm:text-sm text-muted">
              <kbd className="font-sans px-1.5 py-0.5 rounded bg-foreground/5 border border-foreground/10 text-[11px] sm:text-xs">{modifier}</kbd>
              {" + "}
              <kbd className="font-sans px-1.5 py-0.5 rounded bg-foreground/5 border border-foreground/10 text-[11px] sm:text-xs">Enter</kbd> to send
            </span>
            <button
              type="button"
              onClick={send}
              disabled={empty || isOverLimit}
              className="flex h-11 touch-manipulation items-center gap-2 rounded-full bg-foreground px-5 text-sm sm:text-base font-semibold text-background outline-hidden transition-[scale,opacity] duration-150 ease-out select-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-foreground active:scale-[0.96] disabled:opacity-40 disabled:active:scale-100 hover:opacity-90 shadow-sm cursor-pointer disabled:cursor-not-allowed"
            >
              <svg
                aria-hidden
                viewBox="0 0 16 16"
                className="size-4 sm:size-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.75}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="1.75" y="3.5" width="12.5" height="9" rx="1.5" />
                <path d="m2.25 4.25 5.75 4.25 5.75-4.25" />
              </svg>
              Send
            </button>
          </motion.div>
        </div>

        {/* Sent Postmark View */}
        <div
          inert={phase !== "sent"}
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center text-center p-8",
            "transition-[opacity,filter,translate] ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-[opacity]",
            phase === "sent"
              ? "translate-y-0 opacity-100 filter-none duration-300"
              : "pointer-events-none translate-y-1.5 opacity-0 blur-[4px] duration-150 motion-reduce:translate-y-0 motion-reduce:filter-none",
          )}
        >
          <Postmark date={sentOn} />
          <p className="mt-5 text-xl sm:text-2xl font-bold text-foreground">
            On its way
          </p>
          <p className="mt-2 text-sm sm:text-base text-muted">
            Thanks for the note. We read every one.
          </p>
          <button
            ref={againRef}
            type="button"
            onClick={writeAnother}
            className="mt-6 h-11 touch-manipulation rounded-full bg-background px-6 text-sm sm:text-base font-semibold text-foreground shadow-raised border border-foreground/15 outline-hidden transition-[scale,background-color] duration-150 ease-out select-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-foreground active:scale-[0.96] hover:bg-surface cursor-pointer"
          >
            Write another
          </button>
        </div>

        <span className="sr-only" aria-live="polite">
          {phase === "sent" ? "Feedback sent" : ""}
        </span>
      </div>

      {/* InkWell Bottle */}
      {showInkWell && (
        <motion.div
          animate={{ opacity: phase === "sending" ? 0.35 : 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center justify-end self-center md:self-end pb-2 shrink-0"
        >
          <InkWellBottle
            value={message}
            limit={limit}
            onSloshRef={bottleSloshRef}
            className="w-[100px] sm:w-[120px]"
          />
        </motion.div>
      )}
    </div>
  );
}

// A postage stamp
function Stamp({ className }: { className?: string }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const W = 44;
  const H = 52;
  const holes: [number, number][] = [];
  for (let x = 3.5; x <= W - 3.5; x += 6.5) holes.push([x, 0], [x, H]);
  for (let y = 3.5; y <= H - 3.5; y += 6.5) holes.push([0, y], [W, y]);
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${W} ${H}`}
      width={W}
      height={H}
      className={cn("drop-shadow-[0_1.5px_2px_rgb(0_0_0/0.2)]", className)}
    >
      <mask id={`${id}-perf`}>
        <rect width={W} height={H} fill="white" />
        {holes.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="2" fill="black" />
        ))}
      </mask>
      <g mask={`url(#${id}-perf)`}>
        <rect width={W} height={H} fill="#fcfaf5" />
        <rect
          x="0"
          y="0"
          width={W}
          height={H}
          fill="rgba(0,0,0,0.03)"
        />
        <rect x="5" y="5" width="34" height="42" rx="1.5" fill="#2d5bb8" opacity="0.95" />
        <circle cx="30" cy="17" r="4.5" fill="#f59e0b" />
        <path d="M5 36 Q14 25 23 32 T39 28 V47 H5 Z" fill="#d4483b" />
        <path d="M5 41 Q16 32 39 37 V47 H5 Z" fill="#fcfaf5" opacity="0.45" />
        <text
          x="8.5"
          y="15.5"
          fontSize="8.5"
          fontWeight="700"
          fill="#ffffff"
          className="font-sans"
        >
          2c
        </text>
      </g>
    </svg>
  );
}

// Postmark stamped on the sent screen
function Postmark({ date }: { date: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 150 76"
      className="h-[80px] w-[160px] -rotate-6 text-foreground"
      fill="none"
      stroke="currentColor"
    >
      <circle cx="38" cy="38" r="35" strokeWidth="1.75" opacity="0.8" />
      <circle cx="38" cy="38" r="28" strokeWidth="1" opacity="0.5" />
      <text
        x="38"
        y="35"
        textAnchor="middle"
        fontSize="12"
        fontWeight="600"
        letterSpacing="1.5"
        className="fill-current font-sans"
        stroke="none"
      >
        SENT
      </text>
      <text
        x="38"
        y="50"
        textAnchor="middle"
        fontSize="12"
        className="fill-current font-sans tabular-nums"
        stroke="none"
        opacity="0.7"
      >
        {date}
      </text>
      {[22, 32, 42, 52].map((y) => (
        <path
          key={y}
          d={`M78 ${y} q8 -5 16 0 t16 0 t16 0 t16 0`}
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.55"
        />
      ))}
    </svg>
  );
}

export default function EnvelopeSendDemo() {
  return <EnvelopeSend />;
}

"use client";

import { AnimatePresence, motion } from "motion/react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";
import { GitCommitHorizontal, Star, Terminal, ArrowUpRight } from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";

export type ActivityKind = "commit" | "comment" | "deploy" | "github" | "leetcode" | "x" | "star";

export type ActivityEvent = {
  id: string;
  kind: ActivityKind;
  actor: string;
  action: string;
  target: string;
  detail: string;
  // Epoch milliseconds.
  at: number;
  url?: string;
};

const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const OPEN = { duration: 0.25, ease: EASE_OUT };
const REVEAL = { duration: 0.22, ease: EASE_OUT, delay: 0.03 };
const LEAVE = { duration: 0.15, ease: EASE_OUT };
const INSTANT = { duration: 0 };

export function relativeTime(ms: number) {
  const s = Math.max(0, Math.round(ms / 1000));
  if (s < 45) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d}d ago`;
  const mo = Math.round(d / 30);
  return `${mo}mo ago`;
}

export function ActivityTimeline({
  events,
  now,
  label = "Activity transcript",
  className,
}: {
  events: ActivityEvent[];
  now: number;
  label?: string;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <ol aria-label={label} className={cn("flex-1 flex flex-col justify-between font-sans", className)}>
      <AnimatePresence initial={false}>
        {events.map((event, i) => {
          const isLast = i === events.length - 1;

          return (
            <motion.li
              key={event.id}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0, transition: reduceMotion ? INSTANT : LEAVE }}
              transition={reduceMotion ? INSTANT : OPEN}
              className={cn(
                "relative flex-1 flex flex-col justify-center",
                !isLast && "border-b border-[#8fb0d4]/30"
              )}
            >
              {/* Vertical connecting ink rail line */}
              {!isLast && (
                <span
                  aria-hidden
                  className="absolute top-1/2 bottom-0 left-[21px] w-[1px] bg-[#8fb0d4]/55"
                />
              )}
              {i > 0 && (
                <span
                  aria-hidden
                  className="absolute top-0 bottom-1/2 left-[21px] w-[1px] bg-[#8fb0d4]/55"
                />
              )}

              <motion.div
                initial={
                  reduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, filter: "blur(2px)", y: -2 }
                }
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                transition={REVEAL}
                className="group flex items-center gap-3 px-2.5 py-2.5 rounded-xs transition-colors hover:bg-[#8fb0d4]/10"
              >
                {/* Ink-tinted circular platform badge */}
                <div
                  aria-hidden
                  className={cn(
                    "size-6.5 rounded-full border grid place-items-center shrink-0 z-10 transition-colors bg-[#faf8f2] shadow-[0_1px_2px_rgba(26,23,21,0.06)]",
                    (event.kind === "commit" || event.kind === "github") &&
                      "border-[#1f4488]/30 text-[#1f4488]",
                    event.kind === "star" &&
                      "border-[#b45309]/35 text-[#b45309]",
                    event.kind === "leetcode" &&
                      "border-[#c2410c]/35 text-[#c2410c]",
                    event.kind === "x" &&
                      "border-[#b23a28]/35 text-[#b23a28]"
                  )}
                >
                  <KindIcon kind={event.kind} />
                </div>

                {/* Event text body */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2 flex-wrap">
                    <div className="min-w-0 flex items-center flex-wrap gap-1 text-[12.5px] leading-snug text-[#4a433b]">
                      <span className="font-semibold tracking-tight text-[#1a1715]">
                        {event.actor}
                      </span>
                      <span className="text-[#685f54] text-[12px]">
                        {event.action}
                      </span>
                      {event.url ? (
                        <a
                          href={event.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-[#1f4488] hover:text-[#b23a28] hover:underline inline-flex items-center gap-0.5 truncate max-w-[175px] sm:max-w-[215px] transition-colors"
                        >
                          <span className="truncate">{event.target}</span>
                          <ArrowUpRight className="size-3 opacity-50 group-hover:opacity-100 shrink-0 transition-opacity" />
                        </a>
                      ) : (
                        <span className="font-semibold text-[#1a1715] truncate max-w-[175px] sm:max-w-[215px]">
                          {event.target}
                        </span>
                      )}
                    </div>

                    {/* Timestamp */}
                    <span className="shrink-0 text-[10.5px] text-[#685f54] tabular-nums font-type">
                      {relativeTime(now - event.at)}
                    </span>
                  </div>

                  {/* Clean 1-line detail text */}
                  {event.detail && (
                    <p className="text-[11.5px] text-[#5c5349] font-type mt-0.5 truncate">
                      {event.detail}
                    </p>
                  )}
                </div>
              </motion.div>
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ol>
  );
}

function KindIcon({ kind }: { kind: ActivityKind }) {
  if (kind === "commit" || kind === "github") {
    return <GitCommitHorizontal className="size-3.5" />;
  }

  if (kind === "leetcode") {
    return <Terminal className="size-3.5" />;
  }

  if (kind === "x") {
    return <FaXTwitter className="size-3" />;
  }

  if (kind === "star") {
    return <Star className="size-3.5 fill-current" />;
  }

  return <GitCommitHorizontal className="size-3.5" />;
}

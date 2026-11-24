import React, { useEffect, useRef, useState, type ReactNode } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useVelocity,
  useReducedMotion,
} from "motion/react";
import { cn } from "../lib/cn";

const CARD_W = 232;
const GAP = 10;
const GUTTER = 8;
const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const FOLLOW = { stiffness: 260, damping: 26, mass: 0.6 } as const;
const MAX_TILT = 7;
const TILT_AT_SPEED = 1400;
const TOUCH_LINGER = 1400;

type Mode = "cursor" | "anchored";

export interface HoverPreviewLinkProps {
  href: string;
  title: string;
  domain: string;
  image?: ReactNode;
  imageUrl?: string;
  children: ReactNode;
  simulate?: { x: number; below?: boolean } | null;
  className?: string;
}

export function HoverPreviewLink({
  href,
  title,
  domain,
  image,
  imageUrl,
  children,
  simulate,
  className,
}: HoverPreviewLinkProps) {
  const reduceMotion = useReducedMotion();
  const wrap = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState<Mode | null>(null);
  const [below, setBelow] = useState(false);
  const linger = useRef<ReturnType<typeof setTimeout>>(undefined);

  const targetX = useMotionValue(0);
  const x = useSpring(targetX, FOLLOW);
  const speed = useVelocity(x);
  const tilt = useSpring(
    useTransform(speed, [-TILT_AT_SPEED, TILT_AT_SPEED], [MAX_TILT, -MAX_TILT], {
      clamp: true,
    }),
    { stiffness: 400, damping: 30 },
  );

  useEffect(() => () => clearTimeout(linger.current), []);

  const scaleOf = (el: HTMLElement, r: DOMRect) =>
    el.offsetWidth ? r.width / el.offsetWidth : 1;

  const clampLeft = (left: number) => {
    const el = wrap.current;
    if (!el) return left;
    const r = el.getBoundingClientRect();
    const s = scaleOf(el, r);
    const vw = document.documentElement.clientWidth;
    const min = (GUTTER - r.left) / s;
    const max = (vw - GUTTER - r.left) / s - CARD_W;
    return Math.round(Math.min(Math.max(left, min), Math.max(min, max)));
  };

  const place = (mode: Mode, clientX?: number) => {
    const el = wrap.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const centre =
      mode === "cursor" && clientX !== undefined
        ? (clientX - r.left) / scaleOf(el, r)
        : el.offsetWidth / 2;
    return clampLeft(centre - CARD_W / 2);
  };

  const show = (mode: Mode, clientX?: number) => {
    const el = wrap.current;
    const left = place(mode, clientX);
    if (!el || left === undefined) return;
    clearTimeout(linger.current);
    setBelow(el.getBoundingClientRect().top < 200);
    if (!open) {
      targetX.jump(left);
      x.jump(left);
      tilt.jump(0);
    } else {
      targetX.set(left);
    }
    setOpen(mode);
  };

  const hide = () => {
    clearTimeout(linger.current);
    setOpen(null);
  };

  const simX = simulate?.x;
  const simBelow = simulate?.below ?? false;
  const simOpen = useRef(false);
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    if (simX === undefined) {
      if (simOpen.current) setOpen(null);
      simOpen.current = false;
      return;
    }
    const left = clampLeft(simX * el.offsetWidth - CARD_W / 2);
    if (!simOpen.current) {
      targetX.jump(left);
      x.jump(left);
      tilt.jump(0);
      setBelow(simBelow);
      setOpen("cursor");
      simOpen.current = true;
    } else {
      targetX.set(left);
    }
  }, [simX, simBelow]);

  return (
    <span ref={wrap} className="relative inline-block">
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        onPointerEnter={(e) => {
          if (e.pointerType !== "touch") show("cursor", e.clientX);
        }}
        onPointerMove={(e) => {
          if (e.pointerType === "touch" || !open) return;
          if (reduceMotion) return;
          targetX.set(place("cursor", e.clientX) ?? 0);
        }}
        onPointerLeave={(e) => {
          if (e.pointerType !== "touch") hide();
        }}
        onPointerDown={(e) => {
          if (e.pointerType === "touch") show("anchored");
        }}
        onPointerUp={(e) => {
          if (e.pointerType !== "touch") return;
          clearTimeout(linger.current);
          linger.current = setTimeout(hide, TOUCH_LINGER);
        }}
        onPointerCancel={hide}
        onFocus={(e) => {
          if (e.currentTarget.matches(":focus-visible")) show("anchored");
        }}
        onBlur={hide}
        onKeyDown={(e) => {
          if (e.key === "Escape") hide();
        }}
        className={cn(
          "rounded-[2px] font-bold text-ink underline decoration-stamp/40 underline-offset-4 outline-hidden transition-colors duration-150 ease-out hover:decoration-stamp hover:text-stamp focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-stamp",
          className,
        )}
      >
        {children}
      </a>

      <AnimatePresence>
        {open ? (
          <motion.span
            aria-hidden
            className={cn(
              "pointer-events-none absolute left-0 z-50 block",
              below ? "top-full" : "bottom-full",
            )}
            style={{
              x,
              rotate: reduceMotion ? 0 : tilt,
              width: CARD_W,
              paddingTop: below ? GAP : 0,
              paddingBottom: below ? 0 : GAP,
              transformOrigin: below ? "50% 0%" : "50% 100%",
            }}
          >
            <motion.span
              className="block overflow-hidden rounded-xl border border-ink/25 bg-[#faf6ee] p-1.5 shadow-[0_12px_28px_-4px_rgba(40,25,10,0.22)]"
              style={{ transformOrigin: below ? "50% 0%" : "50% 100%" }}
              initial={
                reduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.88, y: below ? -6 : 6, filter: "blur(4px)" }
              }
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
                filter: "blur(0px)",
                transition: { duration: 0.18, ease: EASE_OUT },
              }}
              exit={{
                opacity: 0,
                scale: reduceMotion ? 1 : 0.96,
                filter: reduceMotion ? "blur(0px)" : "blur(2px)",
                transition: { duration: 0.12, ease: EASE_OUT },
              }}
            >
              {/* Concentric image viewport */}
              <span className="block h-[104px] overflow-hidden rounded-lg bg-[#231911] border border-ink/15">
                {image ? (
                  image
                ) : imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="flex items-center justify-center h-full text-xs font-mono text-[#d4b992]">
                    [PREVIEW INTEL]
                  </span>
                )}
              </span>
              <span className="block px-2 pt-2 pb-1.5">
                <span className="block truncate text-[13px] font-stamp font-black text-ink">
                  {title}
                </span>
                <span className="block truncate text-[11px] font-mono text-ink/60">{domain}</span>
              </span>
            </motion.span>
          </motion.span>
        ) : null}
      </AnimatePresence>
    </span>
  );
}

export default HoverPreviewLink;

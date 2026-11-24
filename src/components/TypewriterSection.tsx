import { useEffect, useRef, useState } from 'react';
import { useScroll, useMotionValueEvent } from 'motion/react';
import { useReducedMotion } from '../lib/use-reduced-motion';

type Seg = { kind: 'type'; text: string } | { kind: 'del'; count: number };

const ACT_ONE = [
  'SERVICE RECORD // MOIN A.',
  '========================================',
  'NEW DELHI / SOFTWARE DEV',
  'B.TECH DATA SCIENCE - VIPS-TC   CGPA 8.27',
  '',
  '2026  IEEE PAPER (ICAUC 2026):',
  '      GEN-AI HALLUCINATION RISK.',
  '2026  HERMES X GROWTHX - WINNER ($5,800)',
  '2026  PROMPTWARS, INNERVE - 1ST PLACE',
  '2025  PARANOX 2.0 - TOP 40',
  '========================================',
].join('\n');

const ACT_TWO = [
  'WORK: TERMS OF ENGAGEMENT',
  '----------------------------',
  '01  DEMO OVER DECK. ALWAYS.',
  '02  FULL-STACK + ML, ONE PAIR.',
  '03  WEEKLY BUILDS, LOUD COMMITS.',
  '04  SHIP IT, THEN WRITE IT UP.',
  '----------------------------',
].join('\n');

const SEGMENTS: Seg[] = [
  { kind: 'type', text: ACT_ONE },
  { kind: 'type', text: '\n\nHOW I WOKR' },
  { kind: 'del', count: 4 },
  { kind: 'type', text: ACT_TWO },
];

const DEL_WEIGHT = 8;
const TYPE_END = 0.58;
const FULL_TEXT = `${ACT_ONE}\n\nHOW I ${ACT_TWO}`;

const COSTS = SEGMENTS.map((seg) => (seg.kind === 'type' ? seg.text.length : seg.count * DEL_WEIGHT));
const TOTAL = COSTS.reduce((sum, cost) => sum + cost, 0);

const KEY_ROWS = ['QWERTYUIOP', 'ASDFGHJKL'];

const LETTERS = [
  {
    eyebrow: 'Verified',
    body: 'IEEE ICAUC 2026 accepted our paper on Gen-AI hallucination risk.',
    foot: '2026 — Publication',
    href: 'https://ieeexplore.ieee.org/document/11441054',
    tilt: '-rotate-[1.2deg]',
  },
  {
    eyebrow: 'Winner',
    body: 'Hermes x GrowthX: shipped LazyClip in 8h, 100+ signups, $5,800 in credits.',
    foot: '2026 — Lazyclip.buzz',
    href: 'https://lazyclip.buzz',
    tilt: 'rotate-[1.4deg]',
  },
];

function bufferAt(step: number): { buffer: string; deleting: boolean } {
  let remaining = step;
  let buffer = '';
  for (let i = 0; i < SEGMENTS.length; i += 1) {
    const seg = SEGMENTS[i];
    const cost = COSTS[i];
    if (remaining >= cost) {
      buffer = seg.kind === 'type' ? buffer + seg.text : buffer.slice(0, buffer.length - seg.count);
      remaining -= cost;
    } else if (seg.kind === 'type') {
      return { buffer: buffer + seg.text.slice(0, remaining), deleting: false };
    } else {
      const removed = Math.floor(remaining / DEL_WEIGHT);
      return { buffer: buffer.slice(0, buffer.length - removed), deleting: remaining > 0 };
    }
  }
  return { buffer, deleting: false };
}

function stepFromProgress(progress: number, reduced: boolean): number {
  if (reduced) return TOTAL;
  const clamped = Math.min(Math.max(progress, 0), 1) / TYPE_END;
  return Math.round(Math.min(clamped, 1) * TOTAL);
}

function clamp01(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}

function ramp(progress: number, start: number, end: number): number {
  return clamp01((progress - start) / (end - start));
}

export function TypewriterSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });

  const [step, setStep] = useState(0);
  const [prog, setProg] = useState(0);
  const [scale, setScale] = useState(1);

  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    const nextStep = stepFromProgress(value, reduced);
    setStep((prev) => (prev === nextStep ? prev : nextStep));
    setProg((prev) => (prev === value ? prev : value));
  });

  useEffect(() => {
    const value = scrollYProgress.get();
    const nextStep = stepFromProgress(value, reduced);
    setStep((prev) => (prev === nextStep ? prev : nextStep));
    setProg((prev) => (prev === value ? prev : value));
  }, [reduced, scrollYProgress]);

  useEffect(() => {
    if (reduced) {
      setScale(1);
      return;
    }
    let cancelled = false;
    const fit = () => {
      const el = contentRef.current;
      if (!el) return;
      const bottomPad = window.innerWidth < 640 ? 96 : 40;
      const available = window.innerHeight - bottomPad;
      const height = el.offsetHeight;
      if (available <= 0 || height <= 0) return;
      setScale(Math.min(1, Math.max(available / height, 0.45)));
    };
    fit();
    window.addEventListener('resize', fit);
    document.fonts.ready.then(() => {
      if (!cancelled) fit();
    });
    return () => {
      cancelled = true;
      window.removeEventListener('resize', fit);
    };
  }, [reduced]);

  const { buffer, deleting } = bufferAt(step);
  const lastChar = buffer.slice(-1);
  const activeKey = deleting
    ? '⌫'
    : lastChar === ' '
      ? ' '
      : lastChar === '' || lastChar === '\n'
        ? ''
        : lastChar.toUpperCase();
  const pct = Math.round((step / TOTAL) * 100);
  const status = step === 0 ? 'SCROLL TO TYPE ↓' : step >= TOTAL ? 'COMPLETE ✓' : `${pct}% TYPED`;
  const lettersLive = reduced || prog >= 0.62;

  const tLetter1 = reduced ? 1 : ramp(prog, 0.62, 0.7);
  const tLetter2 = reduced ? 1 : ramp(prog, 0.68, 0.76);
  const tPs = reduced ? 1 : ramp(prog, 0.8, 0.9);
  const tStampFade = reduced ? 1 : ramp(prog, 0.9, 0.94);
  const tStampLand = reduced ? 1 : ramp(prog, 0.9, 0.97);

  return (
    <section
      ref={sectionRef}
      aria-label="Statement on file"
      className={`print:hidden relative z-10 ${reduced ? 'h-auto' : 'h-[340vh]'}`}
    >
      <div
        className={
          reduced
            ? 'relative flex flex-col items-center justify-center py-12'
            : 'sticky top-0 flex h-svh flex-col items-center justify-center overflow-hidden pb-24 sm:pb-10'
        }
      >
        <div
          ref={contentRef}
          style={scale === 1 ? undefined : { transform: `scale(${scale})` }}
          className="mx-auto w-[94%] shrink-0 max-w-[1360px] sm:w-[85%] lg:w-[79%]"
        >
          <div className="mb-4 flex items-center gap-3 px-1">
            <h2 className="font-stamp text-xs uppercase tracking-[0.25em] text-paper/85 sm:text-sm">
              Statement on File
            </h2>
            <span className="h-px flex-1 bg-paper/20" aria-hidden="true" />
            <span className="select-none font-mono text-[9px] tracking-[0.2em] text-paper/60">{status}</span>
          </div>

          <div className="relative mx-auto w-full max-w-[600px]">
            <div className="relative mx-auto h-[312px] w-full max-w-[540px] overflow-hidden rounded-[2px] border border-black/10 bg-doc bg-texture shadow-[0_20px_45px_-15px_rgba(0,0,0,0.7)] sm:h-[410px]">
              <div className="absolute inset-y-0 left-9 w-px bg-stamp/25" aria-hidden="true" />
              <div
                aria-hidden="true"
                className="absolute inset-0 overflow-hidden pl-11 pr-4 pt-4 font-typewriter text-[9.5px] leading-[1.45] text-ink sm:pl-12 sm:pr-5 sm:text-[11.5px] sm:leading-[1.5]"
              >
                <span className="whitespace-pre-wrap">{buffer}</span>
                <span className="tw-caret ml-px inline-block h-[0.95em] w-[7px] translate-y-[0.1em] bg-ink" />
              </div>

              <div className="sr-only">{FULL_TEXT}</div>

              <p
                style={reduced ? undefined : { clipPath: `inset(0 ${100 * (1 - tPs)}% 0 0)` }}
                className="absolute bottom-3 left-11 right-4 font-handwritten text-[11px] leading-snug text-ink/85 sm:bottom-4 sm:left-12 sm:right-5 sm:text-[14px]"
              >
                P.S. off duty: books, deep web, Delhi Metro mayhem.
              </p>

              <div
                aria-hidden="true"
                style={
                  reduced
                    ? { opacity: 1, transform: 'scale(1) rotate(-14deg)' }
                    : {
                        opacity: tStampFade,
                        transform: `scale(${2.4 - 1.4 * tStampLand}) rotate(${-34 + 20 * tStampLand}deg)`,
                      }
                }
                className="absolute right-3 top-3 origin-center select-none border-[2.5px] border-stamp/70 px-2.5 py-1 text-center font-stamp text-stamp/90 sm:right-5 sm:top-4"
              >
                <span className="block text-[15px] font-bold leading-none tracking-[0.18em] sm:text-[18px]">
                  APPROVED
                </span>
                <span className="mt-1 block text-[7px] leading-none tracking-[0.3em] sm:text-[8px]">FILE 2026</span>
              </div>
            </div>

            <div
              aria-hidden="true"
              className="relative mx-auto mt-3.5 w-full rounded-md border border-black/40 bg-footer-bg px-3 pb-3 pt-2.5 shadow-[0_16px_35px_-12px_rgba(0,0,0,0.75)] sm:px-4"
            >
              <div className="relative mx-auto mb-3 h-3 w-[94%] rounded-full bg-gradient-to-b from-zinc-400 via-zinc-200 to-zinc-500 shadow-[inset_0_-2px_3px_rgba(0,0,0,0.35)]">
                <span className="absolute -left-2 -top-1 h-5 w-5 rounded-full bg-gradient-to-b from-zinc-500 to-zinc-700 shadow-md" />
                <span className="absolute -right-2 -top-1 h-5 w-5 rounded-full bg-gradient-to-b from-zinc-500 to-zinc-700 shadow-md" />
              </div>
              {KEY_ROWS.map((row, rowIndex) => (
                <div key={row} className="mb-1.5 flex gap-1 sm:gap-1.5">
                  {row.split('').map((key) => (
                    <span
                      key={key}
                      className={`flex h-6 flex-1 items-center justify-center rounded-[3px] border border-black/40 text-[9px] font-bold shadow-[0_2px_0_rgba(0,0,0,0.4)] transition-colors duration-100 sm:h-7 sm:text-[10px] ${
                        activeKey === key ? 'bg-tape text-ink' : 'bg-black/25 text-paper/70'
                      }`}
                    >
                      {key}
                    </span>
                  ))}
                  {rowIndex === 1 && (
                    <span
                      className={`flex h-6 w-9 flex-none items-center justify-center rounded-[3px] border border-black/40 text-[9px] font-bold shadow-[0_2px_0_rgba(0,0,0,0.4)] transition-colors duration-100 sm:h-7 sm:w-11 sm:text-[10px] ${
                        activeKey === '⌫' ? 'bg-tape text-ink' : 'bg-black/25 text-paper/70'
                      }`}
                    >
                      ⌫
                    </span>
                  )}
                </div>
              ))}
              <div className="flex gap-1 sm:gap-1.5">
                <span className="flex-1" />
                <span
                  className={`h-6 flex-[6] rounded-[3px] border border-black/40 shadow-[0_2px_0_rgba(0,0,0,0.4)] sm:h-7 ${
                    activeKey === ' ' ? 'bg-tape' : 'bg-black/25'
                  }`}
                />
                <span className="flex-1" />
              </div>
              <div className="mt-2.5 text-center font-stamp text-[8px] tracking-[0.35em] text-paper/60">
                MOIN//TYPE-1
              </div>
            </div>

            <div className="mx-auto mt-3.5 grid w-full max-w-[600px] grid-cols-2 gap-2.5 sm:gap-3">
              {LETTERS.map((letter, index) => (
                <a
                  key={letter.eyebrow}
                  href={letter.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  inert={!lettersLive}
                  style={
                    reduced
                      ? undefined
                      : {
                          opacity: index === 0 ? tLetter1 : tLetter2,
                          transform: `translateX(${index === 0 ? -36 * (1 - tLetter1) : 36 * (1 - tLetter2)}px)`,
                        }
                  }
                  className="group block rounded-[2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper/70"
                >
                  <div
                    className={`h-full border border-black/15 bg-polaroid p-2.5 shadow-[0_10px_25px_rgba(0,0,0,0.45)] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1 ${letter.tilt}`}
                  >
                    <div className="mb-1 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-stamp" aria-hidden="true" />
                      <span className="font-mono text-[8px] font-black uppercase tracking-[0.25em] text-ink/60">
                        {letter.eyebrow}
                      </span>
                    </div>
                    <p className="font-typewriter text-[10px] leading-snug text-ink/85 sm:text-[11px]">{letter.body}</p>
                    <div className="mt-1.5 flex items-center justify-between gap-2">
                      <span className="font-mono text-[7.5px] uppercase tracking-[0.18em] text-ink/55">
                        {letter.foot}
                      </span>
                      <span className="font-mono text-[8px] font-bold uppercase text-ink underline decoration-stamp/70 underline-offset-2 group-hover:decoration-stamp">
                        Open ↗
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

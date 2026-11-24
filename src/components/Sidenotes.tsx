import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/cn';
import { useReducedMotion } from '@/lib/use-reduced-motion';

const WIDE_AT = 560;
const MARGIN = 176;
const GUTTER = 32;
const STACK_GAP = 12;

const REVEAL = { duration: 0.25, ease: [0.2, 0.85, 0.25, 1] } as const;
const HIDE_GRACE_MS = 220;

export type MarginNoteData = {
  title?: string;
  body: ReactNode;
};

export type Paragraph = {
  id: string;
  text: ReactNode;
  note?: MarginNoteData;
  className?: string;
};

export type Segment = {
  label?: string;
  paragraphs: Paragraph[];
};

type Layout = {
  containerW: number;
  svgH: number;
  textW: number;
  tops: number[];
  anchors: number[];
};

type SidenotesApi = {
  show: (id: string) => void;
  scheduleHide: (id: string) => void;
  toggle: (id: string) => void;
  isVisible: (id: string) => boolean;
  isPinned: (id: string) => boolean;
};

const SidenotesContext = createContext<SidenotesApi | null>(null);

export function NoteAnchor({
  id,
  n,
  children,
}: {
  id: string;
  n?: number;
  children: ReactNode;
}) {
  const api = useContext(SidenotesContext);
  if (!api) return <>{children}</>;
  const visible = api.isVisible(id);
  return (
    <button
      type="button"
      className={cn(
        'inline cursor-pointer text-left align-baseline rounded-[2px] underline-offset-[3px] decoration-2 transition-colors',
        visible
          ? 'bg-blue-900/25 text-blue-950 underline decoration-blue-900'
          : 'bg-blue-900/10 text-ink underline decoration-blue-900/60 hover:bg-blue-900/20 hover:text-blue-950 hover:decoration-blue-900'
      )}
      onMouseEnter={() => api.show(id)}
      onMouseLeave={() => api.scheduleHide(id)}
      onFocus={() => api.show(id)}
      onBlur={() => api.scheduleHide(id)}
      onClick={(e) => {
        e.stopPropagation();
        api.toggle(id);
      }}
      aria-pressed={api.isPinned(id)}
    >
      {children}
      {typeof n === 'number' && (
        <sup className="ml-0.5 text-[8px] font-bold text-blue-900/70">{n}</sup>
      )}
    </button>
  );
}

function NoteBody({ note }: { note: MarginNoteData }) {
  return (
    <>
      {note.title && (
        <div className="mb-1.5 border-t border-blue-900/50 pt-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-blue-900">
          {note.title}
        </div>
      )}
      <div className="font-mono text-[11px] leading-[1.65] text-ink/85">{note.body}</div>
    </>
  );
}

export function Sidenotes({ segments, className }: { segments: Segment[]; className?: string }) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const paraRefs = useRef<Array<HTMLElement | null>>([]);
  const noteRefs = useRef<Array<HTMLElement | null>>([]);
  const wideRef = useRef(false);
  const hideTimerRef = useRef<number | null>(null);
  const [wide, setWide] = useState(false);
  const [layout, setLayout] = useState<Layout | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string[]>([]);
  const reduceMotion = useReducedMotion();

  const isPinned = (id: string) => pinned.includes(id);
  const isVisible = (id: string) => pinned.includes(id) || hoverId === id;

  const show = (id: string) => {
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    setHoverId(id);
  };

  const scheduleHide = (id: string) => {
    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    hideTimerRef.current = window.setTimeout(() => {
      hideTimerRef.current = null;
      setHoverId((h) => (h === id ? null : h));
    }, HIDE_GRACE_MS);
  };

  const cancelHide = () => {
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const toggle = (id: string) => {
    setPinned((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  };

  useEffect(
    () => () => {
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    },
    []
  );

  const noteSlots = segments.reduce(
    (n, s) => n + s.paragraphs.filter((p) => p.note && isVisible(p.id)).length,
    0
  );

  function measure() {
    const root = rootRef.current;
    if (!root) return;
    const isWide = root.clientWidth >= WIDE_AT;
    if (wideRef.current !== isWide) {
      wideRef.current = isWide;
      setWide(isWide);
      setLayout(null);
      return;
    }
    if (!isWide) return;

    const rootTop = root.getBoundingClientRect().top;
    const containerW = root.clientWidth;
    const textW = Math.max(120, containerW - MARGIN - GUTTER);
    const tops: number[] = [];
    const anchors: number[] = [];
    const bottoms: number[] = [];
    let prevBottom = -Infinity;
    let pIdx = 0;
    let nIdx = 0;
    let missing = false;

    for (const seg of segments) {
      for (const p of seg.paragraphs) {
        const para = paraRefs.current[pIdx++];
        if (!p.note || !isVisible(p.id)) continue;
        const note = noteRefs.current[nIdx++];
        if (!para || !note) {
          missing = true;
          continue;
        }
        const anchor = para.getBoundingClientRect().top - rootTop + 11;
        const h = note.offsetHeight;
        const top = Math.max(anchor - 11, prevBottom + STACK_GAP);
        anchors.push(anchor);
        tops.push(top);
        bottoms.push(top + h);
        prevBottom = top + h;
      }
    }
    if (missing || nIdx < noteSlots) return;

    const contentH = contentRef.current?.offsetHeight ?? root.offsetHeight;
    const svgH = Math.max(contentH, ...(bottoms.length ? bottoms : [0])) + 12;

    setLayout((prev) => {
      if (
        prev &&
        prev.containerW === containerW &&
        prev.svgH === svgH &&
        prev.textW === textW &&
        prev.tops.length === tops.length &&
        prev.tops.every((t, i) => Math.abs(t - tops[i]) < 0.5 && Math.abs(prev.anchors[i] - anchors[i]) < 0.5)
      ) {
        return prev;
      }
      return { containerW, svgH, textW, tops, anchors };
    });
  }

  useLayoutEffect(() => {
    measure();
  });

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(root);
    const timer = window.setTimeout(() => measure(), 350);
    return () => {
      ro.disconnect();
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const api: SidenotesApi = { show, scheduleHide, toggle, isVisible, isPinned };

  let pIdx = 0;
  let nIdx = 0;

  return (
    <SidenotesContext.Provider value={api}>
      <div
        ref={rootRef}
        className={cn('relative', className)}
        style={{
          ...(wide ? { paddingRight: GUTTER + MARGIN } : null),
          ...(wide && layout ? { minHeight: layout.svgH } : null),
        }}
      >
        <div ref={contentRef}>
          {segments.map((seg, si) => (
            <div key={seg.label ?? si} className={si > 0 ? 'mt-6' : undefined}>
              {seg.label && (
                <div className="mb-2.5 flex items-center gap-2.5">
                  <span className="text-[9px] font-black uppercase tracking-[0.22em] text-blue-900">
                    {seg.label}
                  </span>
                  <span className="h-px flex-1 bg-blue-900/25" />
                </div>
              )}
              <div className="space-y-4">
                {seg.paragraphs.map((p) => {
                  const pi = pIdx++;
                  const visible = !!p.note && isVisible(p.id);
                  const noteIndex = visible ? nIdx++ : -1;
                  return (
                    <div key={p.id}>
                      <p
                        ref={(el) => {
                          paraRefs.current[pi] = el;
                        }}
                        className={cn(
                          'font-sans text-[13.5px] leading-[1.8] text-ink/85 sm:text-[14.5px]',
                          p.className
                        )}
                      >
                        {p.text}
                      </p>
                      {visible &&
                        (wide ? (
                          <motion.div
                            key={p.id}
                            ref={(el) => {
                              noteRefs.current[noteIndex] = el;
                            }}
                            className="absolute right-0"
                            style={{ top: layout ? layout.tops[noteIndex] ?? 0 : 0, width: MARGIN }}
                            initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={reduceMotion ? { duration: 0 } : { ...REVEAL, delay: 0.05 }}
                            onMouseEnter={cancelHide}
                            onMouseLeave={() => hoverId && scheduleHide(hoverId)}
                          >
                            <NoteBody note={p.note!} />
                          </motion.div>
                        ) : (
                          <motion.aside
                            key={p.id}
                            ref={(el) => {
                              noteRefs.current[noteIndex] = el;
                            }}
                            className="mt-2.5 border-l-2 border-blue-900/40 bg-blue-900/[0.05] py-2 pl-3 pr-2"
                            initial={{ opacity: 0, y: reduceMotion ? 0 : 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={reduceMotion ? { duration: 0 } : REVEAL}
                          >
                            <NoteBody note={p.note!} />
                          </motion.aside>
                        ))}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {wide && layout && (
          <svg
            className="pointer-events-none absolute left-0 top-0 text-blue-900/45"
            style={{ width: layout.containerW, height: layout.svgH }}
            viewBox={`0 0 ${layout.containerW} ${layout.svgH}`}
            aria-hidden="true"
          >
            {layout.anchors.map((ay, j) => {
              const ny = (layout.tops[j] ?? 0) + 11;
              const x1 = layout.textW;
              const x2 = x1 + GUTTER / 2;
              const x3 = x1 + GUTTER;
              return (
                <g key={j} stroke="currentColor" strokeWidth="1" fill="none" shapeRendering="crispEdges">
                  <polyline points={`${x1},${ay} ${x2},${ay} ${x2},${ny} ${x3},${ny}`} />
                  <circle cx={x1} cy={ay} r="1.75" fill="currentColor" stroke="none" />
                </g>
              );
            })}
          </svg>
        )}
      </div>
    </SidenotesContext.Provider>
  );
}

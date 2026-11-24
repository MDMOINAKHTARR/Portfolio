import { memo, useEffect, useRef } from 'react';
import { useReducedMotion } from '../lib/use-reduced-motion';
import { cn } from '../lib/cn';
import { CATEGORY_MAP } from './ProjectBentoCard';
import type { Project } from '../data/projectsData';
import { audioEngine } from '../lib/audio';

// Layout is fixed in px so every scroll position can be computed instead of
// measured: sticky elements report their stuck position, not their natural
// one, so measuring them mid-scroll would be wrong anyway.
const CARD = 280;
// Scroll distance between one card settling and the next one arriving.
const GAP = 80;
const FIRST_TOP = 20;
// Each stuck card sits this much lower, leaving a strip of every card
// beneath it visible.
const STEP = 14;
// Per card resting on top. Four cards deep this reaches 0.56, still wide
// enough that the stack reads as cards rather than a fan.
const SCALE_PER_CARD = 0.04;
const DIM_PER_CARD = 0.12;
const MAX_DIM = 0.4;
// Blank strip kept below the finished stack so the last card's shadow is not
// clipped by the scroller edge.
const BOTTOM_PAD = 20;

const top = (i: number) => FIRST_TOP + i * STEP;
const natural = (i: number) => i * (CARD + GAP);

export const ProjectScrollStack = memo(function ProjectScrollStack({
  projects,
  onOpen,
  label = 'Project dossiers',
  className,
}: {
  projects: Project[];
  onOpen: (project: Project) => void;
  label?: string;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const scroller = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLElement | null)[]>([]);
  const shades = useRef<(HTMLElement | null)[]>([]);
  const fills = useRef<(HTMLElement | null)[]>([]);
  const dots = useRef<(HTMLButtonElement | null)[]>([]);

  const last = projects.length - 1;
  // The scroller is sized to the finished stack (last card's stuck spot plus
  // its height) so no blank strip is left below the final card, and the scroll
  // still ends exactly when that card settles.
  const height = top(Math.max(last, 0)) + CARD + BOTTOM_PAD;
  const bottomPad = BOTTOM_PAD;

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    let frame = 0;
    let current = -1;

    // One read (scrollTop) and a batch of transform and opacity writes per
    // frame, nothing that triggers layout.
    const update = () => {
      frame = 0;
      const s = el.scrollTop;
      // How far card i + 1 has slid over card i, 0 to 1: from its top edge
      // meeting card i's bottom edge until it sticks.
      const covered = projects.map((_, i) => {
        if (i === last) return 0;
        const start = natural(i + 1) - top(i) - CARD;
        const end = natural(i + 1) - top(i + 1);
        return Math.min(Math.max((s - start) / (end - start), 0), 1);
      });

      let depth = 0;
      for (let i = last; i >= 0; i--) {
        depth += covered[i];
        const card = cards.current[i];
        const shade = shades.current[i];
        if (card) {
          card.style.transform = reduceMotion ? '' : `scale(${1 - depth * SCALE_PER_CARD})`;
        }
        if (shade) {
          shade.style.opacity = reduceMotion ? '0' : String(Math.min(depth * DIM_PER_CARD, MAX_DIM));
        }
        const fill = fills.current[i];
        if (fill) {
          const arrived = i === 0 ? 1 : covered[i - 1];
          fill.style.transform = `scaleY(${arrived})`;
        }
      }

      const front = covered.filter((c) => c >= 0.5).length;
      if (front !== current) {
        dots.current[current]?.removeAttribute('aria-current');
        dots.current[front]?.setAttribute('aria-current', 'step');
        current = front;
      }
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [projects, last, reduceMotion]);

  const goTo = (i: number) => {
    scroller.current?.scrollTo({
      top: i === 0 ? 0 : natural(i) - top(i),
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  };

  const openProject = (project: Project) => {
    try { audioEngine.playPaper(); } catch {}
    onOpen(project);
  };

  return (
    <div className={cn('flex w-full gap-1 pl-8 pr-0', className)}>
      <div
        ref={scroller}
        role="region"
        aria-label={label}
        tabIndex={0}
        data-lenis-prevent
        className="min-w-0 flex-1 overflow-y-auto overscroll-contain outline-hidden [scrollbar-width:none] focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-stamp [&::-webkit-scrollbar]:hidden"
        style={{ height }}
      >
        <div style={{ paddingBottom: bottomPad }}>
          {projects.map((project, i) => {
            const catMeta = CATEGORY_MAP[project.category] || CATEGORY_MAP.ai;
            return (
              <article
                key={project.id}
                ref={(node) => {
                  cards.current[i] = node;
                }}
                role="button"
                tabIndex={0}
                aria-label={`Open case file for ${project.title}`}
                onClick={() => openProject(project)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openProject(project);
                  }
                }}
                className="sticky flex origin-top cursor-pointer select-none flex-col overflow-hidden rounded-2xl border border-ink/20 bg-paper shadow-[0_1px_2px_rgba(40,25,10,0.08),0_10px_24px_-8px_rgba(40,25,10,0.18)] will-change-transform focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-stamp"
                style={{
                  top: top(i),
                  height: CARD,
                  marginTop: i === 0 ? 0 : GAP,
                }}
              >
                {/* Screenshot band */}
                <div className="relative h-[116px] w-full shrink-0 overflow-hidden border-b border-ink/15 bg-ink/5">
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                    className="h-full w-full object-cover object-top"
                  />
                  <span className="absolute left-3 top-2 font-mono text-[11px] font-black tabular-nums text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span
                    className="absolute right-3 top-2 inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 font-mono text-[8.5px] font-black uppercase tracking-wider shadow-[0_1px_2px_rgba(0,0,0,0.25)]"
                    style={{
                      borderColor: catMeta.pillBorder,
                      borderWidth: 1,
                      backgroundColor: catMeta.pillBg,
                      color: catMeta.pillText,
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: catMeta.dot }} />
                    {project.categoryLabel || catMeta.label}
                  </span>
                </div>

                {/* Body */}
                <div className="flex min-h-0 flex-1 flex-col justify-between gap-2 p-4">
                  <div className="space-y-1.5">
                    <h3 className="font-stamp text-[17px] font-black uppercase leading-tight tracking-tight text-ink">
                      {project.title}
                    </h3>
                    <p className="text-[12px] font-typewriter leading-relaxed text-ink/70 line-clamp-3">
                      {project.tagline}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[9.5px] font-black uppercase tracking-wider text-ink/55">
                      {project.id} // {project.status}
                    </span>
                    <span className="font-mono text-[10px] font-black uppercase tracking-wider text-stamp">
                      Case file →
                    </span>
                  </div>
                </div>

                <div
                  ref={(node) => {
                    shades.current[i] = node;
                  }}
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-[inherit] bg-black opacity-0"
                />
              </article>
            );
          })}
        </div>
      </div>

      <nav aria-label="Jump to card" className="flex flex-col justify-center">
        {projects.map((project, i) => (
          <button
            key={project.id}
            ref={(node) => {
              dots.current[i] = node;
            }}
            type="button"
            aria-label={`${i + 1}. ${project.title}`}
            onClick={() => goTo(i)}
            className="group flex h-10 w-6 touch-manipulation items-center justify-center rounded-full outline-hidden transition-[scale] duration-150 ease-out focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-stamp active:scale-[0.96] motion-reduce:transition-none"
          >
            <span className="h-7 w-[3px] overflow-hidden rounded-full bg-ink/20 transition-[scale] duration-150 ease-out group-hover:scale-x-150 motion-reduce:transition-none">
              <span
                ref={(node) => {
                  fills.current[i] = node;
                }}
                className="block size-full origin-top bg-stamp"
                // Matches scroll position 0 before the effect first runs.
                style={{ transform: `scaleY(${i === 0 ? 1 : 0})` }}
              />
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
});

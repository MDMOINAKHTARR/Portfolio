import { useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { RotateCcw } from 'lucide-react';
import { PROJECTS, type Project } from '../data/projectsData';
import { audioEngine } from '../lib/audio';
import { Tape, type TapeProps } from './ui/tape';
import { Paper } from './ui/paper';

const MAT_PROJECT_IDS = [
  'OP-410',
  'OP-001',
  'OP-317',
  'OP-081',
  'OP-109',
  'OP-012',
  'OP-044',
  'OP-256',
];

const MAT_PROJECTS: Project[] = MAT_PROJECT_IDS
  .map((id) => PROJECTS.find((project) => project.id === id))
  .filter((project): project is Project => Boolean(project));

const RULER_NUMBERS_TOP = Array.from({ length: 24 }, (_, i) => i + 1);
const RULER_NUMBERS_SIDE = Array.from({ length: 16 }, (_, i) => i + 1);

const INITIAL_ROTATIONS = [-3.2, 1.8, -2.0, 2.3, -1.5, 2.8, -2.5, 1.6, -2.1];

const STICKY_CARD_THEMES = [
  { stock: 'sticky-yellow' as const, bg: '#fdf2b3', gum: 'rgba(209, 181, 62, 0.22)' },
  { stock: 'sticky-blue' as const, bg: '#dceeff', gum: 'rgba(110, 162, 212, 0.20)' },
  { stock: 'sticky-green' as const, bg: '#dff3d6', gum: 'rgba(122, 174, 96, 0.20)' },
  { stock: 'sticky-orange' as const, bg: '#fee6ce', gum: 'rgba(218, 142, 78, 0.20)' },
] as const;

interface TapeStripSpec {
  className: string;
  kind: NonNullable<TapeProps['kind']>;
  color?: TapeProps['color'];
  ends?: TapeProps['ends'];
  length?: number;
  height?: number;
  angle: number;
}

const POLAROID_TAPE_STYLES: ReadonlyArray<ReadonlyArray<TapeStripSpec>> = [
  // 0: Classic torn masking tape centered at top
  [
    {
      className: 'left-1/2 -translate-x-1/2 -top-3.5',
      kind: 'masking',
      ends: 'torn',
      length: 78,
      height: 22,
      angle: 2.5,
    },
  ],
  // 1: Dual corner red striped washi tape
  [
    {
      className: '-left-4 -top-2.5',
      kind: 'washi-stripes',
      color: 'tomato',
      ends: 'scissor',
      length: 60,
      height: 20,
      angle: -32,
    },
    {
      className: '-right-4 -top-2.5',
      kind: 'washi-stripes',
      color: 'tomato',
      ends: 'scissor',
      length: 60,
      height: 20,
      angle: 30,
    },
  ],
  // 2: Brown archival kraft tape on top-right
  [
    {
      className: 'right-3 -top-3.5',
      kind: 'kraft',
      ends: 'saw',
      length: 72,
      height: 22,
      angle: 6.5,
    },
  ],
  // 3: Sky gingham washi tape centered at top
  [
    {
      className: 'left-1/2 -translate-x-1/2 -top-3.5',
      kind: 'washi-gingham',
      color: 'sky',
      ends: 'scissor',
      length: 76,
      height: 21,
      angle: -3,
    },
  ],
  // 4: Translucent clear Scotch tape on top-left
  [
    {
      className: 'left-3 -top-3.5',
      kind: 'clear',
      ends: 'saw',
      length: 74,
      height: 21,
      angle: -6,
    },
  ],
  // 5: Grass-green zigzag washi tape on top-right
  [
    {
      className: 'right-4 -top-3.5',
      kind: 'washi-zigzag',
      color: 'grass',
      ends: 'torn',
      length: 72,
      height: 21,
      angle: 4.5,
    },
  ],
  // 6: Warm lemon polka-dot washi tape centered at top
  [
    {
      className: 'left-1/2 -translate-x-1/2 -top-3.5',
      kind: 'washi-dots',
      color: 'lemon',
      ends: 'scissor',
      length: 76,
      height: 22,
      angle: -2.2,
    },
  ],
  // 7: Mixed archival corner tapes (kraft top-left + masking bottom-right)
  [
    {
      className: '-left-3.5 -top-2.5',
      kind: 'kraft',
      ends: 'torn',
      length: 62,
      height: 20,
      angle: -28,
    },
    {
      className: 'right-3 -top-3.5',
      kind: 'washi-stripes',
      color: 'tangerine',
      ends: 'saw',
      length: 66,
      height: 20,
      angle: 5.5,
    },
  ],
];

const MAT_GRID = [
  'radial-gradient(ellipse at 50% 45%, rgba(255,255,255,0.04) 0%, transparent 65%, rgba(0,0,0,0.28) 100%)',
  'repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 12px)',
  'repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 12px)',
  'repeating-linear-gradient(0deg, rgba(255,255,255,0.065) 0 1px, transparent 1px 24px)',
  'repeating-linear-gradient(90deg, rgba(255,255,255,0.065) 0 1px, transparent 1px 24px)',
  'repeating-linear-gradient(0deg, rgba(255,255,255,0.14) 0 1px, transparent 1px 120px)',
  'repeating-linear-gradient(90deg, rgba(255,255,255,0.14) 0 1px, transparent 1px 120px)',
].join(', ');

interface CuttingMatCardProps {
  project: Project;
  index: number;
  constraintsRef: React.RefObject<HTMLDivElement | null>;
  zIndex: number;
  onBringToFront: () => void;
}

function CuttingMatCard({
  project,
  index,
  constraintsRef,
  zIndex,
  onBringToFront,
}: CuttingMatCardProps) {
  const navigate = useNavigate();
  const isDraggingRef = useRef(false);
  const href = project.liveUrl ?? project.githubUrl ?? project.youtubeUrl ?? '/operations';
  const isExternal = href.startsWith('http');
  const initialRotate = INITIAL_ROTATIONS[index % INITIAL_ROTATIONS.length];
  const tapeStrips = POLAROID_TAPE_STYLES[index % POLAROID_TAPE_STYLES.length];
  const stickyTheme = STICKY_CARD_THEMES[index % STICKY_CARD_THEMES.length];

  const handleOpen = useCallback(() => {
    if (isDraggingRef.current) return;
    try {
      audioEngine.init();
      audioEngine.playClick();
    } catch {}
    if (isExternal) {
      window.open(href, '_blank', 'noopener,noreferrer');
    } else {
      navigate(href);
    }
  }, [href, isExternal, navigate]);

  return (
    <motion.div
      drag
      dragConstraints={constraintsRef}
      dragElastic={0.08}
      dragMomentum={false}
      initial={{ rotate: initialRotate }}
      whileHover={{ y: -4, scale: 1.015 }}
      whileDrag={{
        scale: 1.04,
        boxShadow: '0 24px 46px rgba(0,0,0,0.58)',
        cursor: 'grabbing',
      }}
      transition={{ type: 'spring', stiffness: 360, damping: 26 }}
      onPointerDown={() => {
        onBringToFront();
      }}
      onDragStart={() => {
        isDraggingRef.current = true;
        onBringToFront();
      }}
      onDragEnd={() => {
        window.setTimeout(() => {
          isDraggingRef.current = false;
        }, 140);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleOpen();
        }
      }}
      style={{ zIndex }}
      role="group"
      tabIndex={0}
      aria-label={`${project.title} (${project.id}) — drag to reposition, or click Open to view`}
      data-prevent-page-swipe
      className="group relative w-[235px] sm:w-[250px] lg:w-full max-w-[285px] mx-auto cursor-grab active:cursor-grabbing select-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f0e6cd]"
    >
      {/* 3D Sticky-Note Peel Shadows underneath bottom corners */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-1.5 left-3 right-1/2 h-4 bg-black/45 blur-[5px] -rotate-[2.5deg] rounded-full transition-opacity duration-300 group-hover:opacity-80"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-2 right-2.5 left-1/3 h-4 bg-black/55 blur-[6px] rotate-[3deg] rounded-full transition-transform duration-300 group-hover:translate-y-0.5"
      />

      {tapeStrips.map((strip, stripIdx) => (
        <div
          key={stripIdx}
          className={`absolute pointer-events-none z-20 ${strip.className}`}
          aria-hidden="true"
        >
          <Tape
            kind={strip.kind}
            color={strip.color}
            ends={strip.ends}
            length={strip.length ?? 74}
            height={strip.height ?? 21}
            angle={strip.angle}
            seed={`${project.id}-tape-${stripIdx}`}
            style={{ rotate: `${strip.angle}deg` }}
          />
        </div>
      ))}

      <Paper
        stock={stickyTheme.stock}
        rules="dots"
        tilt={0}
        seed={`mat-sticky-${project.id}`}
        style={{
          backgroundColor: stickyTheme.bg,
        }}
        className="relative z-10 flex flex-col overflow-hidden rounded-[2px] p-2.5 pt-4 pb-3 shadow-[0_6px_16px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.65)]"
      >
        {/* Top adhesive gum band */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-3"
          style={{ backgroundColor: stickyTheme.gum }}
        />

        {/* Crisp edge-to-edge screenshot */}
        <div
          onDoubleClick={handleOpen}
          className="relative z-10 overflow-hidden rounded-[2px] border border-black/15 bg-zinc-200 shadow-xs"
        >
          <img
            src={project.imageUrl}
            alt={`${project.title} project screenshot`}
            loading={index < 6 ? 'eager' : 'lazy'}
            decoding="async"
            draggable={false}
            className="w-full aspect-[16/10] object-cover object-top pointer-events-none select-none transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </div>

        {/* Title & Tagline */}
        <div className="relative z-10 mt-2.5 px-0.5">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="font-sans text-[13.5px] font-black tracking-tight text-[#11100e] leading-snug truncate">
              {project.title}
            </h3>
            <span className="font-mono text-[8.5px] font-bold text-[#2b2419]/75 shrink-0">
              {project.id}
            </span>
          </div>
          <p className="mt-1 font-sans text-[11.5px] font-medium leading-snug text-[#231f1a]/85 line-clamp-2">
            {project.tagline}
          </p>
        </div>

        {/* Footer */}
        <div className="relative z-10 mt-2.5 pt-2 border-t border-black/10 flex items-center justify-between gap-2 px-0.5">
          <span
            className={`border px-1.5 py-0.5 rounded-sm font-mono text-[8px] font-bold uppercase leading-none tracking-wider ${project.statusColor}`}
          >
            {project.status}
          </span>
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              handleOpen();
            }}
            className="font-mono text-[8.5px] font-black uppercase tracking-wider text-[#11100e] bg-black/[0.08] hover:bg-[#11100e] hover:text-white px-2 py-0.5 rounded-[2px] cursor-pointer transition-colors"
          >
            OPEN →
          </button>
        </div>
      </Paper>
    </motion.div>
  );
}

function MatPrecisionOverlay() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none select-none z-0 opacity-[0.22]"
      viewBox="0 0 1200 900"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {/* Diagonal cutting angle guides (45° and 30°/60° reference lines) */}
      <line x1="0" y1="900" x2="900" y2="0" stroke="white" strokeWidth="1" strokeDasharray="6 6" />
      <line x1="300" y1="900" x2="1200" y2="0" stroke="white" strokeWidth="1" strokeDasharray="6 6" />
      <line x1="0" y1="0" x2="900" y2="900" stroke="white" strokeWidth="0.75" strokeDasharray="4 8" />
      <line x1="300" y1="0" x2="1200" y2="900" stroke="white" strokeWidth="0.75" strokeDasharray="4 8" />

      {/* Center calibration target & concentric rings */}
      <circle cx="600" cy="450" r="220" fill="none" stroke="white" strokeWidth="1" strokeDasharray="8 6" />
      <circle cx="600" cy="450" r="140" fill="none" stroke="white" strokeWidth="0.85" />
      <circle cx="600" cy="450" r="60" fill="none" stroke="white" strokeWidth="0.75" strokeDasharray="3 4" />
      <line x1="350" y1="450" x2="850" y2="450" stroke="white" strokeWidth="0.85" />
      <line x1="600" y1="200" x2="600" y2="700" stroke="white" strokeWidth="0.85" />

      {/* Protractor arc at bottom center */}
      <path
        d="M 420 900 A 180 180 0 0 1 780 900"
        fill="none"
        stroke="white"
        strokeWidth="1.1"
      />
      <path
        d="M 465 900 A 135 135 0 0 1 735 900"
        fill="none"
        stroke="white"
        strokeWidth="0.75"
        strokeDasharray="3 5"
      />

      {/* Standard paper crop / registration marks (A3 / A4 / B5) */}
      <rect x="90" y="75" width="1020" height="750" fill="none" stroke="white" strokeWidth="1" strokeDasharray="12 6" />
      <rect x="210" y="150" width="780" height="600" fill="none" stroke="white" strokeWidth="0.75" strokeDasharray="6 6" />

      {/* Corner registration crosshairs */}
      <g stroke="white" strokeWidth="1.2">
        <path d="M 60 85 H 85 M 72.5 72.5 V 97.5" />
        <path d="M 1115 85 H 1140 M 1127.5 72.5 V 97.5" />
        <path d="M 60 815 H 85 M 72.5 802.5 V 827.5" />
        <path d="M 1115 815 H 1140 M 1127.5 802.5 V 827.5" />
      </g>
    </svg>
  );
}

export function CuttingMatSection() {
  const matRef = useRef<HTMLDivElement>(null);
  const [resetSeed, setResetSeed] = useState(0);
  const [zMap, setZMap] = useState<Record<string, number>>(() =>
    Object.fromEntries(MAT_PROJECTS.map((p, idx) => [p.id, idx + 1]))
  );
  const topZRef = useRef(MAT_PROJECTS.length + 2);

  const bringToFront = useCallback((id: string) => {
    topZRef.current += 1;
    const nextZ = topZRef.current;
    setZMap((prev) => ({ ...prev, [id]: nextZ }));
  }, []);

  const handleResetLayout = useCallback(() => {
    try {
      audioEngine.init();
      audioEngine.playPaper();
    } catch {}
    setResetSeed((prev) => prev + 1);
    setZMap(Object.fromEntries(MAT_PROJECTS.map((p, idx) => [p.id, idx + 1])));
    topZRef.current = MAT_PROJECTS.length + 2;
  }, []);

  const fileCountLabel = String(MAT_PROJECTS.length).padStart(2, '0');

  return (
    <motion.section
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      aria-label="Selected field work"
      className="block print:hidden relative z-10 w-[94%] sm:w-[84%] lg:w-[76%] max-w-[1160px] mx-auto mt-10 sm:mt-16 mb-6"
    >
      <div className="mb-3.5 flex items-center gap-3 px-1">
        <h2 className="font-stamp text-xs sm:text-sm uppercase tracking-[0.25em] text-paper/85">
          Selected Field Work
        </h2>
        <span className="h-px flex-1 bg-paper/20" aria-hidden="true" />
        <button
          type="button"
          onClick={handleResetLayout}
          className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-paper/65 border border-paper/20 px-2 py-0.5 rounded-xs cursor-pointer"
          title="Reset all project cards to their default positions"
        >
          <RotateCcw className="w-2.5 h-2.5" />
          <span>Reset Mat</span>
        </button>
        <span className="font-mono text-[9px] tracking-[0.2em] text-paper/60">
          {fileCountLabel} FILES
        </span>
      </div>

      <div
        ref={matRef}
        data-prevent-page-swipe
        className="relative rounded-xl border-[4px] border-[#223652] bg-cutmat overflow-hidden shadow-[0_28px_65px_-15px_rgba(0,0,0,0.85),inset_0_0_0_1px_rgba(255,255,255,0.12),inset_0_2px_24px_rgba(0,0,0,0.5)] min-h-[640px] sm:min-h-[740px] lg:min-h-[820px]"
        style={{
          backgroundColor: 'var(--color-cutmat, #16253b)',
          backgroundImage: MAT_GRID,
        }}
      >
        {/* Outer printed border frame inside the cutting mat */}
        <div
          className="absolute inset-3 sm:inset-4 border border-white/20 rounded-md pointer-events-none z-0"
          aria-hidden="true"
        />

        {/* Precision technical markings (angles, circles, registration marks) */}
        <MatPrecisionOverlay />

        {/* Top Ruler with Tick Marks */}
        <div
          className="absolute inset-x-4 sm:inset-x-6 top-3 sm:top-4 flex justify-between pt-1 border-t border-white/25 font-mono text-[8px] tracking-widest text-white/75 select-none pointer-events-none z-0"
          aria-hidden="true"
        >
          {RULER_NUMBERS_TOP.map((n) => (
            <span
              key={n}
              className={`relative flex flex-col items-center ${n > 18 ? 'hidden md:flex' : 'flex'}`}
            >
              <span className="w-px h-1.5 bg-white/45 -mt-1 mb-0.5" />
              <span>{n}</span>
            </span>
          ))}
        </div>

        {/* Bottom Ruler with Tick Marks */}
        <div
          className="hidden sm:flex absolute inset-x-6 bottom-4 justify-between pb-1 border-b border-white/20 font-mono text-[7.5px] tracking-widest text-white/50 select-none pointer-events-none z-0"
          aria-hidden="true"
        >
          {RULER_NUMBERS_TOP.map((n) => (
            <span
              key={n}
              className={`relative flex flex-col items-center ${n > 18 ? 'hidden md:flex' : 'flex'}`}
            >
              <span>{n}</span>
              <span className="w-px h-1.5 bg-white/35 mt-0.5 -mb-1" />
            </span>
          ))}
        </div>

        {/* Left Side Ruler */}
        <div
          className="hidden sm:flex absolute inset-y-10 left-4 flex-col justify-between pl-1 border-l border-white/25 font-mono text-[7.5px] tracking-widest text-white/60 select-none pointer-events-none z-0"
          aria-hidden="true"
        >
          {RULER_NUMBERS_SIDE.map((n) => (
            <span key={n} className="flex items-center gap-1 -ml-1">
              <span className="w-1.5 h-px bg-white/45" />
              <span>{n}</span>
            </span>
          ))}
        </div>

        {/* Right Side Ruler */}
        <div
          className="hidden lg:flex absolute inset-y-10 right-4 flex-col justify-between pr-1 border-r border-white/20 font-mono text-[7.5px] tracking-widest text-white/45 select-none pointer-events-none z-0"
          aria-hidden="true"
        >
          {RULER_NUMBERS_SIDE.map((n) => (
            <span key={n} className="flex items-center justify-end gap-1 -mr-1">
              <span>{n}</span>
              <span className="w-1.5 h-px bg-white/35" />
            </span>
          ))}
        </div>

        {/* Corner Scale Badges */}
        <div
          className="hidden md:flex absolute top-6 right-8 items-center gap-2 font-mono text-[7.5px] tracking-[0.22em] text-white/45 uppercase select-none pointer-events-none z-0"
          aria-hidden="true"
        >
          <span>45° // 60° ANGLE GUIDES</span>
          <span>·</span>
          <span>SCALE 1:1 (INCH / CM)</span>
        </div>

        <div className="relative z-10 px-4 sm:px-8 lg:px-10 pt-8 pb-6 sm:pt-10 sm:pb-8 h-full flex flex-col justify-between">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-handwritten text-[#f0e6cd] text-base sm:text-xl -rotate-1 drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)] select-none">
                Handle every project with care.
              </p>
              <span className="block mt-0.5 font-mono text-[7.5px] uppercase tracking-[0.25em] text-white/50 select-none">
                A1 ARCHIVAL CUTTING SURFACE // 9-SLOT WORKBENCH
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[8px] uppercase tracking-[0.22em] text-[#f0e6cd]/85 bg-black/25 border border-white/20 px-2 py-0.5 rounded-xs select-none">
                ✥ Drag cards anywhere on mat
              </span>
              <span className="hidden sm:block shrink-0 font-mono text-[8.5px] uppercase tracking-[0.3em] text-white/75 border border-white/25 px-2 py-0.5 rounded-2xs select-none">
                CASE BOARD
              </span>
            </div>
          </div>

          <div
            key={resetSeed}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-6 sm:gap-x-6 sm:gap-y-7 lg:gap-x-7 lg:gap-y-7 items-start justify-items-center py-2 sm:py-3"
          >
            {MAT_PROJECTS.map((project, index) => (
              <CuttingMatCard
                key={`${project.id}-${resetSeed}`}
                project={project}
                index={index}
                constraintsRef={matRef}
                zIndex={zMap[project.id] ?? index + 1}
                onBringToFront={() => bringToFront(project.id)}
              />
            ))}
          </div>

          <div className="mt-4 pt-2.5 border-t border-white/15 flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-[8px] uppercase tracking-[0.22em] text-white/65 select-none">
              SELF-HEALING // MMA EDITION · 24&quot; × 16&quot; TACTICAL GRID
            </span>
            <span className="font-mono text-[8px] uppercase tracking-[0.22em] text-white/65 select-none">
              CAPACITY: 09 EXHIBITS // {fileCountLabel} LOADED
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end px-1">
        <Link
          to="/operations"
          className="group flex items-center gap-2 font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] text-paper/75 transition-colors hover:text-paper"
        >
          <span className="border-b border-dashed border-paper/40 group-hover:border-paper">
            Full operations log
          </span>
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </motion.section>
  );
}

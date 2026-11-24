import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useInView } from 'motion/react';

export interface HeatmapDay {
  date: string; // YYYY-MM-DD
  count: number;
  level?: number; // 0-4 override, else derived from count
}

const STAGGER_MS = 8;
const ROWS = 7;
const COLUMNS = 7;
const FALLBACK_SHOW_MS = 1500;

// Cell size tiers: pick the largest tier that fits the card so the grid fills
// its column instead of leaving a dead zone. Capped at 14px to keep cards compact;
// small tiers let side-by-side twin graphs fit without horizontal scrolling.
const TIERS = [
  { cell: 14, pitch: 19 },
  { cell: 13, pitch: 17 },
  { cell: 12, pitch: 16 },
  { cell: 11, pitch: 14 },
  { cell: 10, pitch: 13 },
  { cell: 9, pitch: 11 },
  { cell: 8, pitch: 10 },
  { cell: 7, pitch: 9 },
  { cell: 7, pitch: 8 },
  { cell: 6, pitch: 8 },
  { cell: 6, pitch: 7 },
  { cell: 5, pitch: 7 },
  { cell: 5, pitch: 6 },
] as const;
// Used when nothing fits (narrow phones): readable cells + horizontal scroll.
const FALLBACK_TIER = { cell: 10, pitch: 13 };
// Weekday column (22px label + 4px margin) + scroller padding (2px each side).
const WEEKDAY_GUTTER = 30;

const THRESHOLDS = [1, 4, 7, 10];
const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export type HeatmapTone = 'green' | 'blue';

// One hue per platform, light to dark at rising opacity.
export const TONE_LEVELS: Record<HeatmapTone, readonly string[]> = {
  green: ['bg-emerald-500/12', 'bg-emerald-500/40', 'bg-emerald-500/65', 'bg-emerald-500/85', 'bg-emerald-700'],
  blue: ['bg-blue-500/12', 'bg-blue-500/40', 'bg-blue-500/65', 'bg-blue-500/85', 'bg-blue-700'],
};

export const levelFor = (count: number): number => {
  const i = THRESHOLDS.findIndex((t) => count <= t);
  return i === -1 ? 4 : i;
};

const parseUTC = (date: string) => new Date(`${date}T00:00:00Z`);

const formatDate = (date: string) =>
  parseUTC(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });

interface CellProps {
  day: HeatmapDay | null;
  pos: number;
  col: number;
  shown: boolean;
  isRoving: boolean;
  levels: readonly string[];
  size: number;
}

const CELL_BASE = 'rounded-[1px]';
const CELL_ANIM =
  'transition-[opacity,transform] duration-300 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none';
const SHOWN_CLS = 'opacity-100 scale-100';
const HIDDEN_CLS = 'opacity-0 scale-[0.6]';

const Cell = memo(function Cell({ day, pos, col, shown, isRoving, levels, size }: CellProps) {
  const levelClass = day ? levels[day.level ?? levelFor(day.count)] : levels[0];
  const stateCls = shown ? SHOWN_CLS : HIDDEN_CLS;
  const style: React.CSSProperties = { width: size, height: size, transitionDelay: shown ? `${col * STAGGER_MS}ms` : '0ms' };

  // Padding slots still render as the lightest tile: the grid is fully filled,
  // never a transparent hole.
  if (!day) {
    return <div aria-hidden="true" className={`${levelClass} ${CELL_BASE} ${stateCls} ${CELL_ANIM}`} style={style} />;
  }

  return (
    <div
      role="gridcell"
      data-pos={pos}
      tabIndex={isRoving ? 0 : -1}
      aria-label={`${day.count} on ${formatDate(day.date)}`}
      className={`${levelClass} ${CELL_BASE} cursor-default outline-hidden hover:outline-solid hover:outline-1 hover:outline-offset-1 hover:outline-ink/45 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink ${stateCls} ${CELL_ANIM}`}
      style={style}
    />
  );
});

export function HeatmapLegend({ tone = 'green', className = '' }: { tone?: HeatmapTone; className?: string }) {
  return (
    <div className={`flex items-center gap-[5px] text-[9px] font-medium leading-none text-muted ${className}`} aria-hidden="true">
      <span>Less</span>
        {TONE_LEVELS[tone].map((level, i) => (
          <span key={i} className={`${level} h-[var(--hm-cell,10px)] w-[var(--hm-cell,10px)] rounded-[1px] ring-1 ring-inset ring-ink/15`} />
        ))}
      <span>More</span>
    </div>
  );
}

interface ContributionHeatmapProps {
  days: HeatmapDay[];
  unit?: string;
  tone?: HeatmapTone;
  ariaLabel?: string;
}

export function ContributionHeatmap({ days, unit = 'contributions', tone = 'green', ariaLabel }: ContributionHeatmapProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const inView = useInView(gridRef, { once: true, amount: 0.4 });
  const [forcedShown, setForcedShown] = useState(false);
  const [focusPos, setFocusPos] = useState<number | null>(null);
  const [tier, setTier] = useState<{ cell: number; pitch: number }>({ cell: 10, pitch: 13 });

  // Safety net: never leave cells stuck at opacity 0 if intersection never fires
  // (the grid lives inside a horizontally clipped scroller).
  useEffect(() => {
    if (inView || forcedShown) return;
    const t = setTimeout(() => setForcedShown(true), FALLBACK_SHOW_MS);
    return () => clearTimeout(t);
  }, [inView, forcedShown]);

  const shown = inView || forcedShown;

  const { weeks, total, firstPos, lastPos, cellsCount } = useMemo(() => {
    if (!days.length) {
      return { weeks: [] as (HeatmapDay | null)[][], total: 0, firstPos: 0, lastPos: 0, cellsCount: 0 };
    }
    const padStart = parseUTC(days[0].date).getUTCDay();
    const cells: (HeatmapDay | null)[] = [
      ...Array.from({ length: padStart }, () => null),
      ...days,
    ];
    while (cells.length % ROWS) cells.push(null);
    const weekList: (HeatmapDay | null)[][] = [];
    for (let i = 0; i < cells.length; i += ROWS) weekList.push(cells.slice(i, i + ROWS));
    const sum = days.reduce((s, d) => s + d.count, 0);
    let first = cells.findIndex(Boolean);
    let last = cells.length - 1 - [...cells].reverse().findIndex(Boolean);
    if (first < 0) first = 0;
    if (last < 0) last = 0;
    return { weeks: weekList, total: sum, firstPos: first, lastPos: last, cellsCount: cells.length };
  }, [days]);

  // Open on the most recent weeks.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [weeks.length, tier.pitch]);

  // Fill the available width: pick the largest cell tier that fits the card.
  useEffect(() => {
    const host = wrapRef.current?.parentElement;
    if (!host) return;
    const fit = () => {
      const avail = host.clientWidth - WEEKDAY_GUTTER;
      if (avail <= 0) return;
      const pick =
        TIERS.find((t) => weeks.length * t.pitch - (t.pitch - t.cell) <= avail) ??
        FALLBACK_TIER;
      setTier((p) => (p.cell === pick.cell ? p : pick));
      // Legend swatches (siblings of this component) track the cell size.
      host.style.setProperty('--hm-cell', `${pick.cell}px`);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(host);
    return () => ro.disconnect();
  }, [weeks.length]);

  // Month labels: column of the first week containing the 1st of a month,
  // skipping labels that would collide (>= 3 columns apart).
  const monthTicks = useMemo(() => {
    const ticks: { label: string; col: number; key: string }[] = [];
    let lastCol = -Infinity;
    let lastMonth = -1;
    weeks.forEach((week, w) => {
      for (const d of week) {
        if (!d) continue;
        const dt = parseUTC(d.date);
        if (dt.getUTCDate() === 1 && dt.getUTCMonth() !== lastMonth) {
          if (ticks.length === 0 || w - lastCol >= 3) {
            ticks.push({ label: MONTH_LABELS[dt.getUTCMonth()], col: w, key: `${dt.getUTCFullYear()}-${dt.getUTCMonth()}` });
            lastCol = w;
            lastMonth = dt.getUTCMonth();
          }
        }
      }
    });
    return ticks;
  }, [weeks]);

  const unitOne = unit.endsWith('s') ? unit.slice(0, -1) : unit;

  const showTip = useCallback(
    (day: HeatmapDay, cell: HTMLElement) => {
      const tip = tipRef.current;
      const wrap = wrapRef.current;
      if (!tip || !wrap) return;
      const n = day.count;
      tip.textContent = `${n} ${n === 1 ? unitOne : unit} · ${formatDate(day.date)}`;
      tip.dataset.show = '1';
      requestAnimationFrame(() => {
        const wr = wrap.getBoundingClientRect();
        const cr = cell.getBoundingClientRect();
        const tr = tip.getBoundingClientRect();
        let left = cr.left - wr.left + cr.width / 2;
        left = Math.max(tr.width / 2 + 2, Math.min(left, wr.width - tr.width / 2 - 2));
        tip.style.left = `${left}px`;
        tip.style.top = `${cr.top - wr.top - 6}px`;
      });
    },
    [unit, unitOne]
  );

  const hideTip = useCallback(() => {
    const tip = tipRef.current;
    if (tip) delete tip.dataset.show;
  }, []);

  const cellFromEvent = (e: React.SyntheticEvent): HTMLElement | null => {
    const target = e.target as HTMLElement | null;
    const cell = target?.closest?.('[data-pos]') as HTMLElement | null;
    return cell && gridRef.current?.contains(cell) ? cell : null;
  };

  const cellDay = (cell: HTMLElement): HeatmapDay | null => {
    const pos = Number(cell.dataset.pos);
    const row = Math.floor(pos / ROWS);
    const d = pos % ROWS;
    return weeks[row]?.[d] ?? null;
  };

  const handleMouseOver = (e: React.MouseEvent) => {
    const cell = cellFromEvent(e);
    if (cell) {
      const day = cellDay(cell);
      if (day) showTip(day, cell);
    }
  };

  const handleMouseOut = (e: React.MouseEvent) => {
    const next = (e.relatedTarget as HTMLElement | null)?.closest?.('[data-pos]');
    if (next) return;
    hideTip();
  };

  const handleFocusIn = (e: React.FocusEvent) => {
    const cell = cellFromEvent(e);
    if (cell) {
      const day = cellDay(cell);
      if (day) showTip(day, cell);
      setFocusPos(Number(cell.dataset.pos));
    }
  };

  const focusCell = (pos: number) => {
    const el = gridRef.current?.querySelector<HTMLElement>(`[data-pos="${pos}"]`);
    if (!el) return false;
    setFocusPos(pos);
    el.focus();
    return true;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (cellsCount === 0) return;
    const current = focusPos ?? firstPos;
    const row = Math.floor(current / ROWS);
    const d = current % ROWS;
    let target = current;

    switch (e.key) {
      case 'ArrowUp':
        target = d > 0 ? current - 1 : current;
        break;
      case 'ArrowDown':
        target = d < ROWS - 1 ? current + 1 : current;
        break;
      case 'ArrowLeft':
        target = row > 0 ? current - ROWS : current;
        break;
      case 'ArrowRight':
        target = row < Math.floor((cellsCount - 1) / ROWS) ? current + ROWS : current;
        break;
      case 'Home':
        target = current - d;
        break;
      case 'End':
        target = Math.min(cellsCount - 1, current - d + COLUMNS - 1);
        break;
      default:
        return;
    }

    e.preventDefault();
    // Step over padded (data-less) slots in the direction of travel.
    const step = target >= current ? 1 : -1;
    while (target >= 0 && target < cellsCount) {
      if (focusCell(target)) return;
      target += step;
    }
  };

  if (!weeks.length) return null;

  const gridWidth = weeks.length * tier.pitch - (tier.pitch - tier.cell);
  const rovingPos = focusPos ?? firstPos;
  const levels = TONE_LEVELS[tone];
  const gap = tier.pitch - tier.cell;
  const labelFont = Math.round(9 + (tier.cell - 10) * 0.25);

  return (
    <div ref={wrapRef} className="relative w-fit max-w-full select-none">
      <div className="flex">
        {/* Weekday labels, aligned to grid rows */}
        <div
          className="mr-[4px] mt-[17px] flex flex-col text-muted"
          style={{ gap }}
          aria-hidden="true"
        >
          {DAY_LABELS.map((label, i) => (
            <span key={i} className="flex w-[22px] items-center justify-end" style={{ height: tier.cell, fontSize: labelFont }}>
              {label}
            </span>
          ))}
        </div>

        <div
          ref={scrollRef}
          className="max-w-full overflow-x-auto p-[2px] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="relative">
            {/* Month labels scroll with the grid */}
            <div className="relative mb-[5px] h-[10px] font-medium leading-none text-muted" aria-hidden="true">
              {monthTicks.map((tick) => (
                <span key={tick.key} className="absolute top-0" style={{ left: tick.col * tier.pitch, fontSize: labelFont }}>
                  {tick.label}
                </span>
              ))}
            </div>

            <div
              ref={gridRef}
              role="grid"
              aria-label={ariaLabel ?? `Contributions calendar. ${total} ${unit} in the last year.`}
              className="flex"
              style={{ width: gridWidth, gap }}
              data-shown={shown || undefined}
              onKeyDown={handleKeyDown}
              onMouseOver={handleMouseOver}
              onMouseOut={handleMouseOut}
              onFocus={handleFocusIn}
              onBlur={(e) => {
                const next = (e.relatedTarget as HTMLElement | null)?.closest?.('[data-pos]');
                if (!next) hideTip();
              }}
            >
              {weeks.map((week, w) => (
                <div key={w} role="row" className="flex flex-col" style={{ gap }}>
                  {week.map((day, d) => (
                    <Cell
                      key={d}
                      day={day}
                      pos={w * ROWS + d}
                      col={w}
                      shown={shown}
                      isRoving={day ? w * ROWS + d === rovingPos : false}
                      levels={levels}
                      size={tier.cell}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating tooltip, moved via direct DOM writes (no re-render) */}
      <div
        ref={tipRef}
        role="status"
        data-hm-tip=""
        className="pointer-events-none absolute left-0 top-0 z-30 max-w-[240px] -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[13px] font-medium leading-snug text-background opacity-0 shadow-md transition-opacity duration-75 data-[show=1]:opacity-100 data-[show=1]:duration-100 motion-reduce:transition-none"
      />
    </div>
  );
}

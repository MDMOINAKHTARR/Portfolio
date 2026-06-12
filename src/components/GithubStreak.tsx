import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { ExternalLink, Trophy, Flame, Calendar, RefreshCw, Layers, Sparkles, AlertCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ContributionDay {
  date: string;
  count: number;
  level: number; // 0 to 4
  idx: number;
  row: number;
  col: number;
}

export function GithubStreak() {
  const { theme } = useTheme();
  const [hoveredDay, setHoveredDay] = useState<ContributionDay | null>(null);
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<number | null>(null);
  // Track clicked cell index for CSS ripple (no per-frame JS cost)
  const [clickedIdx, setClickedIdx] = useState<number | null>(null);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Real API state
  const [usernameInput, setUsernameInput] = useState(() => {
    return localStorage.getItem('github_username') || 'MDMOINAKHTARR';
  });
  const [activeUsername, setActiveUsername] = useState(usernameInput);
  const [data, setData] = useState<ContributionDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalContributions, setTotalContributions] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    fetch(`/api/github-contributions?username=${encodeURIComponent(activeUsername)}`)
      .then(res => {
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Incorrect response format from server (expected JSON)');
        }
        if (!res.ok) {
          throw new Error(`Profile not found or API exceeded rate limit`);
        }
        return res.json();
      })
      .then(payload => {
        if (!isMounted) return;
        if (payload.success) {
          const daysRaw = payload.days || [];
          
          // Map to ContributionDay layout with grid row/col indexes
          const mappedDays: ContributionDay[] = daysRaw.map((day: any, index: number) => {
            const rowIdx = index % 7;
            const colIdx = Math.floor(index / 7);
            return {
              date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              count: day.count,
              level: day.level,
              idx: index,
              row: rowIdx,
              col: colIdx
            };
          });

          setData(mappedDays);

          // Calculate total contributions
          const total = daysRaw.reduce((sum: number, d: any) => sum + d.count, 0);
          setTotalContributions(total);

          // Calculate streaks
          let maxStr = 0;
          let runningStreak = 0;

          for (const day of daysRaw) {
            if (day.count > 0) {
              runningStreak++;
              if (runningStreak > maxStr) {
                maxStr = runningStreak;
              }
            } else {
              runningStreak = 0;
            }
          }

          // Calculate current streak backwards from last active date inside standard limits
          let currStr = 0;
          let activeIndex = -1;
          const todayString = new Date().toISOString().split('T')[0];
          const yesterdayString = new Date(Date.now() - 86400000).toISOString().split('T')[0];

          for (let i = daysRaw.length - 1; i >= 0; i--) {
            if (daysRaw[i].count > 0) {
              const dDate = daysRaw[i].date;
              // Streak is active if the last contribution is today or yesterday
              if (dDate === todayString || dDate === yesterdayString || i === daysRaw.length - 1 || daysRaw[i+1].count > 0) {
                activeIndex = i;
              }
              break;
            }
          }

          if (activeIndex !== -1) {
            for (let i = activeIndex; i >= 0; i--) {
              if (daysRaw[i].count > 0) {
                currStr++;
              } else {
                break;
              }
            }
          }

          setCurrentStreak(currStr);
          setLongestStreak(maxStr);
          localStorage.setItem('github_username', activeUsername);
        } else {
          throw new Error(payload.error || "Failed to load data");
        }
        setIsLoading(false);
      })
      .catch(err => {
        if (!isMounted) return;
        console.error("Failed to load GitHub streak data:", err);
        const errorMessage = err.message === 'Failed to fetch' 
          ? 'Network Error / Dev Server Restarting' 
          : (err.message || "Failed to fetch streak data");
        setError(errorMessage);
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeUsername]);

  const cols = useMemo(() => {
    return Math.ceil(data.length / 7) || 53;
  }, [data]);
  const rows = 7;

  // Memoized color lookup — no per-frame recalculation
  const getBoxStyle = useCallback((day: ContributionDay): React.CSSProperties => {
    const isDark = theme === 'noir';
    const isFiltered = selectedLevelFilter !== null && day.level !== selectedLevelFilter;

    let backgroundColor: string;
    switch (day.level) {
      case 1: backgroundColor = isDark ? '#064e3b' : '#c1f3d8'; break;
      case 2: backgroundColor = isDark ? '#0f766e' : '#88e4b3'; break;
      case 3: backgroundColor = '#10b981'; break;
      case 4: backgroundColor = '#047857'; break;
      default: backgroundColor = isDark ? '#1b2323' : '#ebebeb';
    }

    return {
      backgroundColor,
      opacity: isFiltered ? 0.15 : undefined,
    };
  }, [theme, selectedLevelFilter]);

  const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];
  
  const handleCellClick = (day: ContributionDay) => {
    setClickedIdx(day.idx);
    clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => setClickedIdx(null), 600);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameInput.trim()) {
      setActiveUsername(usernameInput.trim());
    }
  };

  return (
    <div className="h-full border-2 border-ink border-dashed p-4 sm:p-5 bg-paper text-ink rounded-[2px] shadow-[inset_0_0_10px_rgba(0,0,0,0.05)] relative select-none flex flex-col gap-3 font-typewriter">
      
      {/* Primary Header Segment: Ultra Compact & Solid Layout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b-2 border-ink/30 pb-2 relative z-10">
        <div className="flex flex-wrap items-center gap-x-3.5 gap-y-0.5">
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-ink text-paper font-bold tracking-widest text-[10px] font-mono shadow-[2px_2px_0_rgba(0,0,0,0.2)] dark:shadow-[2px_2px_0_rgba(255,255,255,0.2)]">
            <Sparkles className="w-3.5 h-3.5 animate-pulse shrink-0" />
            <span className="uppercase uppercase">
              ACTIVITY MATRIX
            </span>
          </div>
          <div className="flex items-center gap-1.5 ml-1">
            <span className="text-lg font-black font-stamp tracking-tight text-ink drop-shadow-sm">
              {isLoading ? "..." : totalContributions.toLocaleString()}
            </span>
            <span className="text-[10px] font-mono opacity-80 uppercase tracking-widest font-bold">
              COMMITS
            </span>
          </div>
        </div>

        {/* Action Controls WITH input box */}
        <div className="flex items-center gap-2">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-1 bg-transparent px-1.5 py-0.5 border-b border-ink/40 focus-within:border-ink transition-colors">
            <span className="text-[10px] font-mono font-bold opacity-50 select-none">ID:</span>
            <input 
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              className="bg-transparent border-none text-[12px] font-mono font-bold text-ink focus:outline-none w-[90px] sm:w-[130px] p-0 uppercase"
              placeholder="github user"
            />
            <button 
              type="submit"
              className="text-[9px] font-bold tracking-widest font-mono px-2 py-0.5 border border-ink hover:bg-ink hover:text-paper transition-colors ml-0.5 select-none"
            >
              SYNC
            </button>
          </form>

          <button 
            onClick={() => {
              const current = activeUsername;
              setActiveUsername("");
              setTimeout(() => setActiveUsername(current), 50);
            }}
            className="p-1 border border-ink/20 hover:border-ink hover:bg-ink/5 transition-all active:scale-95 text-ink"
            title="Reload Data Matrix"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Grid Heatmap Showcase Frame: Highly optimized cell dimensions */}
      <div className="w-full overflow-x-auto pb-1.5 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative z-10">
        {isLoading ? (
          <div className="h-[76px] flex flex-col items-center justify-center gap-2 bg-ink/5 rounded-[2px] border-2 border-dashed border-ink/20">
            <RefreshCw className="w-5 h-5 text-ink animate-spin" />
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-ink">
              FETCHING @{activeUsername} MATRIX...
            </span>
          </div>
        ) : error ? (
          <div className="h-[76px] flex flex-col items-center justify-center gap-1 bg-red-900/10 rounded-[2px] border-2 border-dashed border-red-900/30 text-red-900 dark:text-red-500 text-center px-4">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase mt-1">
              {error}
            </span>
            <button 
              onClick={() => setActiveUsername('MDMOINAKHTARR')}
              className="text-[9px] underline opacity-80 hover:opacity-100 font-bold font-mono tracking-widest uppercase mt-1"
            >
              Reset to @MDMOINAKHTARR
            </button>
          </div>
        ) : (
          <div className="min-w-[550px] sm:min-w-[600px] flex flex-col gap-0.5 select-none pt-2">
            {/* Months Headings Banner with explicit column padding */}
            <div className="flex pl-8 text-[9px] font-mono font-bold opacity-60 tracking-wider uppercase mb-1 text-ink">
              {months.map((m, i) => (
                <div key={i} style={{ width: `${100 / months.length}%` }}>
                  {m}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              {/* Weekdays Side column: tight and condensed height matching the grid height */}
              <div className="flex flex-col justify-between text-[8px] font-mono opacity-60 font-bold pr-1 py-[1px] text-ink uppercase leading-none h-[82px] sm:h-[102px] w-6">
                <span>Mon</span>
                <span>Wed</span>
                <span>Fri</span>
              </div>

              {/* Main Interactive Grid Container */}
              <div className="flex-1 grid grid-flow-col gap-[2px] sm:gap-[3px] justify-between h-[82px] sm:h-[102px]">
                {Array.from({ length: cols }).map((_, cIdx) => (
                  <div key={cIdx} className="grid grid-rows-7 gap-[2px] sm:gap-[3px] h-[82px] sm:h-[102px]">
                    {Array.from({ length: rows }).map((_, rIdx) => {
                      const day = data[cIdx * rows + rIdx];
                      if (!day) return <div key={rIdx} className="w-[10px] h-[10px] sm:w-[12px] sm:h-[12px]" />;

                      return (
                        <div
                          key={rIdx}
                          onClick={() => handleCellClick(day)}
                          onMouseEnter={() => setHoveredDay(day)}
                          onMouseLeave={() => setHoveredDay(null)}
                          style={getBoxStyle(day)}
                          className={`w-[10px] h-[10px] sm:w-[12px] sm:h-[12px] rounded-[1px] cursor-pointer transition-colors duration-150 hover:scale-[1.3] border border-ink/10 ${
                            clickedIdx === day.idx ? 'ring-2 ring-emerald-400 ring-offset-0 scale-125' : ''
                          }`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer statistics & Interaction panel: High spatial density split view */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 border-t-2 border-ink/30 pt-3 items-center relative z-10 text-[10px] font-mono">
        {/* Dynamic Tooltip and Cell details */}
        <div className="min-h-[20px] flex items-center">
          {hoveredDay ? (
            <div className="flex items-center gap-2 animate-in fade-in duration-100 bg-ink/5 px-2 py-1 border border-ink/10">
              <div 
                className="w-3 h-3 rounded-[1px] shadow-sm border border-ink/20 shrink-0 select-none"
                style={{ backgroundColor: getBoxStyle(hoveredDay).backgroundColor }}
              />
              <div className="text-ink">
                <span className="font-bold tracking-widest">{hoveredDay.date}</span> : <span className="font-bold underline">{hoveredDay.count || 'No'} CLASSIFIED LOGS</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 opacity-60 italic text-[10px] text-ink">
              <Layers className="w-3 h-3 shrink-0" />
              <span>Hover records for details or select to trigger analysis.</span>
            </div>
          )}
        </div>

        {/* Legend filters & level triggers */}
        <div className="flex items-center justify-between md:justify-end gap-3 leading-none text-[10px]">
          <div className="flex items-center gap-2 font-bold text-ink">
            <span className="opacity-70">FILTER:</span>
            <div className="flex gap-[3px]">
              {[0, 1, 2, 3, 4].map((level) => {
                let col = '';
                const isDark = theme === 'noir';
                if (level === 0) col = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
                if (level === 1) col = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)';
                if (level === 2) col = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';
                if (level === 3) col = isDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.75)';
                if (level === 4) col = isDark ? 'rgba(255,255,255,1)' : 'rgba(0,0,0,1)';

                const isSelected = selectedLevelFilter === level;

                return (
                  <button
                    key={level}
                    onClick={() => {
                      if (selectedLevelFilter === level) {
                        setSelectedLevelFilter(null);
                      } else {
                        setSelectedLevelFilter(level);
                      }
                    }}
                    style={{ backgroundColor: col }}
                    className={`w-3 h-3 rounded-[1px] transition-all hover:scale-110 focus:outline-none border-2 ${
                      isSelected ? 'ring-2 ring-ink ring-offset-1 scale-110 border-ink' : 'border-ink/20'
                    }`}
                    title={`Filter tier ${level}`}
                  />
                );
              })}
            </div>
            {selectedLevelFilter !== null && (
              <button 
                onClick={() => setSelectedLevelFilter(null)}
                className="text-[9px] underline text-red-700 font-bold pl-1 active:scale-95 animate-pulse tracking-widest uppercase"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Ultra Narrow Stats Badges */}
      <div className="grid grid-cols-3 gap-2 mt-2 pt-3 border-t border-dashed border-ink/20 relative z-10 text-[10px] sm:text-xs font-mono font-bold tracking-widest uppercase">
        <div className="flex items-start gap-2 text-ink">
          <Flame className="w-4 h-4 text-ink shrink-0 mt-0.5" />
          <div className="leading-none">
            <span className="opacity-50 text-[9px] block mb-1">STREAK</span>
            <span>{isLoading ? "..." : `[ ${currentStreak} ] DAYS`}</span>
          </div>
        </div>
        <div className="flex items-start gap-2 text-ink">
          <Trophy className="w-4 h-4 text-ink shrink-0 mt-0.5" />
          <div className="leading-none">
            <span className="opacity-50 text-[9px] block mb-1">LONGEST</span>
            <span>{isLoading ? "..." : `[ ${longestStreak} ] DAYS`}</span>
          </div>
        </div>
        <a 
          href={`https://github.com/${activeUsername}`} 
          target="_blank" 
          rel="noreferrer" 
          className="flex items-start gap-2 text-ink hover:text-red-700 transition-colors select-none"
        >
          <ExternalLink className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="leading-none overflow-hidden">
            <span className="opacity-50 text-[9px] block mb-1">GITHUB ID</span>
            <span className="truncate max-w-[80px] sm:max-w-[120px] block border-b border-transparent hover:border-current">@{activeUsername}</span>
          </div>
        </a>
      </div>
    </div>
  );
}

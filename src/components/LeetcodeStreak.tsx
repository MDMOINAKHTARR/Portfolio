import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { ExternalLink, Trophy, Flame, Calendar, RefreshCw, Sparkles, AlertCircle, Star } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ContributionDay {
  date: string;
  count: number;
  level: number; // 0 to 4
  idx: number;
  row: number;
  col: number;
}

interface LeetCodeData {
  username: string;
  ranking: number;
  reputation: number;
  totalQuestions: number;
  easyQuestions: number;
  mediumQuestions: number;
  hardQuestions: number;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  totalSubmissions: number;
  days?: { date: string; count: number; level: number }[];
}

export function LeetcodeStreak() {
  const { theme } = useTheme();
  
  // Hover & selection states for the heatmap
  const [hoveredDay, setHoveredDay] = useState<ContributionDay | null>(null);
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<number | null>(null);
  const [clickedIdx, setClickedIdx] = useState<number | null>(null);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // State for username input and active profile
  const [usernameInput, setUsernameInput] = useState(() => {
    return localStorage.getItem('leetcode_username') || '__moinn_';
  });
  const [activeUsername, setActiveUsername] = useState(usernameInput);
  
  // API loading and data states
  const [data, setData] = useState<LeetCodeData | null>(null);
  const [daysData, setDaysData] = useState<ContributionDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [totalSubmissions, setTotalSubmissions] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    fetch(`/api/leetcode-stats?username=${encodeURIComponent(activeUsername)}`)
      .then(async (res) => {
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Incorrect response format from server (expected JSON)');
        }
        const payload = await res.json();
        if (!res.ok) {
          throw new Error(payload.error || `LeetCode request failed with status ${res.status}`);
        }
        return payload;
      })
      .then((payload) => {
        if (!isMounted) return;
        if (payload.success) {
          setData(payload);
          localStorage.setItem('leetcode_username', activeUsername);

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

          setDaysData(mappedDays);

          // Calculate total submissions in last 365 days
          const total = daysRaw.reduce((sum: number, d: any) => sum + d.count, 0);
          setTotalSubmissions(total);

          // Calculate streaks based on submissions calendar
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

          let currStr = 0;
          let activeIndex = -1;
          const todayString = new Date().toISOString().split('T')[0];
          const yesterdayString = new Date(Date.now() - 86400000).toISOString().split('T')[0];

          for (let i = daysRaw.length - 1; i >= 0; i--) {
            if (daysRaw[i].count > 0) {
              const dDate = daysRaw[i].date;
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
        } else {
          throw new Error(payload.error || 'Failed to load LeetCode data');
        }
        setIsLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Failed to load LeetCode data:', err);
        const errorMessage = err.message === 'Failed to fetch'
          ? 'Network error while contacting LeetCode proxy'
          : (err.message || 'Failed to fetch LeetCode data');
        setError(errorMessage);
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeUsername]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameInput.trim()) {
      setActiveUsername(usernameInput.trim());
    }
  };

  const cols = useMemo(() => {
    return Math.ceil(daysData.length / 7) || 53;
  }, [daysData]);
  const rows = 7;

  // Memoized color lookup using Amber/Orange palette for Leetcode
  const getBoxStyle = useCallback((day: ContributionDay): React.CSSProperties => {
    const isDark = theme === 'noir';
    const isFiltered = selectedLevelFilter !== null && day.level !== selectedLevelFilter;

    let backgroundColor: string;
    switch (day.level) {
      case 1: backgroundColor = isDark ? '#0d2a47' : '#dbeafe'; break;
      case 2: backgroundColor = isDark ? '#1e4d8c' : '#93c5fd'; break;
      case 3: backgroundColor = isDark ? '#1d6fd4' : '#3b82f6'; break;
      case 4: backgroundColor = isDark ? '#60a5fa' : '#1d4ed8'; break;
      default: backgroundColor = isDark ? '#1b2323' : '#ebebeb';
    }

    return {
      backgroundColor,
      opacity: isFiltered ? 0.15 : undefined,
    };
  }, [theme, selectedLevelFilter]);

  const handleCellClick = (day: ContributionDay) => {
    setClickedIdx(day.idx);
    clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => setClickedIdx(null), 600);
  };

  // Helper values for percentages
  const totalSolvedPct = data ? (data.totalSolved / data.totalQuestions) * 100 : 0;
  const easySolvedPct = data ? (data.easySolved / data.easyQuestions) * 100 : 0;
  const mediumSolvedPct = data ? (data.mediumSolved / data.mediumQuestions) * 100 : 0;
  const hardSolvedPct = data ? (data.hardSolved / data.hardQuestions) * 100 : 0;

  // Formatting helper for ranking
  const formatRanking = (ranking: number) => {
    if (ranking === 0) return 'N/A';
    return `#${ranking.toLocaleString()}`;
  };

  const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];

  return (
    <div data-prevent-page-swipe className="border-2 border-ink border-dashed p-3 sm:p-4 bg-paper text-ink rounded-[2px] shadow-[inset_0_0_10px_rgba(0,0,0,0.05)] relative select-none flex flex-col gap-3 font-typewriter">
      
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-2 border-b border-ink/20 pb-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-ink text-paper font-bold tracking-widest text-[9px] font-mono shadow-[2px_2px_0_rgba(0,0,0,0.2)]">
            <Sparkles className="w-3 h-3 animate-pulse shrink-0 text-amber-400" />
            <span>LEETCODE MATRIX</span>
          </div>
          {!isLoading && data && (
            <span className="text-base font-black font-stamp text-ink">
              {data.totalSolved.toLocaleString()}
              <span className="text-[9px] font-mono font-bold opacity-50 ml-1 tracking-widest">SOLVED</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-1 border-b border-ink/40 focus-within:border-ink transition-colors">
            <span className="text-[9px] font-mono font-bold opacity-40">@</span>
            <input
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              className="bg-transparent border-none text-[10px] font-mono font-bold text-ink focus:outline-none w-[80px] sm:w-[110px] p-0 uppercase"
              placeholder="username"
            />
            <button type="submit" className="border border-ink bg-ink px-1.5 py-0.5 font-mono text-[8px] font-bold tracking-widest text-paper hover:bg-amber-500 hover:text-black">GO</button>
          </form>
          <button
            onClick={() => { const u = activeUsername; setActiveUsername(""); setTimeout(() => setActiveUsername(u), 50); }}
            className="border border-amber-500 bg-amber-100 p-1 text-zinc-950 transition-all hover:bg-amber-200 active:scale-95 dark:border-amber-600 dark:bg-amber-800/30 dark:text-amber-400"
            title="Reload"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Stats and Calendar Grid Showcase */}
      <div className="flex-grow relative z-10 flex flex-col gap-4">
        {isLoading ? (
          <div className="h-[180px] flex flex-col items-center justify-center gap-2 bg-ink/5 rounded-[2px] border-2 border-dashed border-ink/20">
            <RefreshCw className="w-5 h-5 text-ink animate-spin" />
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-ink">
              FETCHING @{activeUsername} LEETCODE...
            </span>
          </div>
        ) : error ? (
          <div className="h-[180px] flex flex-col items-center justify-center gap-1 bg-red-900/10 rounded-[2px] border-2 border-dashed border-red-900/30 text-red-900 dark:text-red-500 text-center px-4">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase mt-1">
              {error}
            </span>
            <button 
              onClick={() => setActiveUsername('__moinn_')}
              className="mt-1 border border-red-800/40 bg-red-800/10 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-red-900 transition-colors hover:bg-red-800 hover:text-white dark:text-red-400"
            >
              Reset to @__moinn_
            </button>
          </div>
        ) : data ? (
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Difficulty Cards + Radial */}
              <div className="flex items-stretch gap-2 lg:w-[340px] shrink-0">
                {/* Easy */}
                <div className="flex-1 flex flex-col gap-1 border-l-4 border-emerald-500 bg-zinc-50 dark:bg-zinc-800/40 p-2 rounded-[2px]">
                  <span className="text-[8px] font-mono font-black tracking-[0.15em] text-emerald-950 dark:text-emerald-400 uppercase">Easy</span>
                  <span className="text-xl font-black font-stamp leading-none text-emerald-950 dark:text-paper">{data.easySolved}</span>
                  <div className="h-1 w-full bg-emerald-950/10 dark:bg-paper/10 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 transition-all duration-700 rounded-full" style={{ width: `${easySolvedPct}%` }} />
                  </div>
                  <span className="text-[8px] font-mono font-bold text-emerald-950/60 dark:text-paper/50">/ {data.easyQuestions}</span>
                </div>
                {/* Medium */}
                <div className="flex-1 flex flex-col gap-1 border-l-4 border-amber-500 bg-zinc-50 dark:bg-zinc-800/40 p-2 rounded-[2px]">
                  <span className="text-[8px] font-mono font-black tracking-[0.15em] text-amber-950 dark:text-amber-400 uppercase">Medium</span>
                  <span className="text-xl font-black font-stamp leading-none text-amber-950 dark:text-paper">{data.mediumSolved}</span>
                  <div className="h-1 w-full bg-amber-950/10 dark:bg-paper/10 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 transition-all duration-700 rounded-full" style={{ width: `${mediumSolvedPct}%` }} />
                  </div>
                  <span className="text-[8px] font-mono font-bold text-amber-950/60 dark:text-paper/50">/ {data.mediumQuestions}</span>
                </div>
                {/* Hard */}
                <div className="flex-1 flex flex-col gap-1 border-l-4 border-red-500 bg-zinc-50 dark:bg-zinc-800/40 p-2 rounded-[2px]">
                  <span className="text-[8px] font-mono font-black tracking-[0.15em] text-red-950 dark:text-red-400 uppercase">Hard</span>
                  <span className="text-xl font-black font-stamp leading-none text-red-950 dark:text-paper">{data.hardSolved}</span>
                  <div className="h-1 w-full bg-red-950/10 dark:bg-paper/10 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 transition-all duration-700 rounded-full" style={{ width: `${hardSolvedPct}%` }} />
                  </div>
                  <span className="text-[8px] font-mono font-bold text-red-950/60 dark:text-paper/50">/ {data.hardQuestions}</span>
                </div>
                {/* Radial total */}
                <div className="flex flex-col items-center justify-center w-[68px] shrink-0 relative">
                  <svg className="w-full h-[68px] transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" className="stroke-ink/10 fill-none" strokeWidth="10" />
                    <circle cx="50" cy="50" r="40" className="stroke-blue-500 fill-none transition-all duration-1000" strokeWidth="10"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - totalSolvedPct / 100)}`}
                      strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center leading-none text-center">
                    <span className="text-sm font-black font-mono text-ink">{data.totalSolved}</span>
                    <span className="text-[7px] font-bold opacity-50 tracking-wide">/{data.totalQuestions}</span>
                    <span className="text-[7px] font-black text-blue-600 dark:text-blue-400">{totalSolvedPct.toFixed(0)}%</span>
                  </div>
                </div>
              </div>

              {/* Heatmap */}
              <div className="flex-grow pt-2 lg:pt-0 flex flex-col gap-1 overflow-hidden">
                <div className="flex items-center justify-between text-[8px] font-mono font-bold tracking-widest opacity-70 uppercase mb-0.5">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> 365-DAY ACTIVITY</span>
                  <span className="opacity-60 text-[7px] text-right">{hoveredDay ? `${hoveredDay.count} SUBMISSIONS · ${hoveredDay.date}` : 'HOVER FOR DETAILS'}</span>
                </div>
                <div className="w-full overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  <div className="min-w-[520px] flex flex-col gap-0.5">
                    <div className="flex pl-7 text-[7px] font-mono font-bold opacity-50 tracking-wider uppercase">
                      {months.map((m, i) => (
                        <div key={i} style={{ width: `${100 / months.length}%` }}>{m}</div>
                      ))}
                    </div>
                    <div className="flex gap-1.5">
                      <div className="flex flex-col justify-between text-[6px] font-mono opacity-50 font-bold pr-0.5 py-[1px] uppercase leading-none h-[72px] w-6">
                        <span>Mon</span><span>Wed</span><span>Fri</span>
                      </div>
                      <div className="flex-1 grid grid-flow-col gap-[2px] justify-between h-[72px]">
                        {Array.from({ length: cols }).map((_, cIdx) => (
                          <div key={cIdx} className="grid grid-rows-7 gap-[2px] h-[72px]">
                            {Array.from({ length: rows }).map((_, rIdx) => {
                              const day = daysData[cIdx * rows + rIdx];
                              if (!day) return <div key={rIdx} className="w-[9px] h-[9px]" />;
                              return (
                                <div
                                  key={rIdx}
                                  onClick={() => handleCellClick(day)}
                                  onMouseEnter={() => setHoveredDay(day)}
                                  onMouseLeave={() => setHoveredDay(null)}
                                  style={getBoxStyle(day)}
                                  className={`w-[9px] h-[9px] rounded-[1px] cursor-pointer transition-colors duration-150 hover:scale-125 border border-ink/10 ${
                                    clickedIdx === day.idx ? 'ring-1 ring-blue-500 scale-125' : ''
                                  }`}
                                />
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        ) : null}
      </div>

      {/* ── Footer Stats ── */}
      <div className="grid grid-cols-4 gap-2 border-t border-ink/20 pt-2 text-[8px] sm:text-[9px] font-mono font-bold tracking-widest uppercase">
        <div className="flex items-center gap-1 text-ink">
          <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <div className="leading-tight">
            <span className="opacity-60 text-[7px] block">RANK</span>
            <span>{isLoading ? "…" : data ? formatRanking(data.ranking) : 'N/A'}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-ink">
          <Flame className="w-3.5 h-3.5 text-blue-500 shrink-0 animate-pulse" />
          <div className="leading-tight">
            <span className="opacity-60 text-[7px] block">STREAK</span>
            <span>{isLoading ? "…" : `${currentStreak}d`}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-ink">
          <Star className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <div className="leading-tight">
            <span className="opacity-60 text-[7px] block">BEST</span>
            <span>{isLoading ? "…" : `${longestStreak}d`}</span>
          </div>
        </div>
        <a href={`https://leetcode.com/${activeUsername}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-ink hover:text-amber-600 transition-colors">
          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
          <div className="leading-tight overflow-hidden">
            <span className="opacity-60 text-[7px] block">PROFILE</span>
            <span className="truncate block max-w-[56px] sm:max-w-[80px]">@{activeUsername}</span>
          </div>
        </a>
      </div>

    </div>
  );
}

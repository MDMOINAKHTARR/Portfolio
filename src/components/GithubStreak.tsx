import { useState, useEffect } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { ContributionHeatmap, HeatmapLegend, type HeatmapDay } from './ContributionHeatmap';

const RECENT_DAYS = 182;

export function GithubStreak() {
  const [activeUsername] = useState(
    () => localStorage.getItem('github_username') || 'MDMOINAKHTARR'
  );
  const [data, setData] = useState<HeatmapDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalContributions, setTotalContributions] = useState(0);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    fetch(`/api/github-contributions?username=${encodeURIComponent(activeUsername)}`)
      .then(async res => {
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Incorrect response format from server (expected JSON)');
        }
        const payload = await res.json();
        if (!res.ok) {
          throw new Error(payload.error || `GitHub request failed with status ${res.status}`);
        }
        return payload;
      })
      .then(payload => {
        if (!isMounted) return;
        if (payload.success) {
          const daysRaw = payload.days || [];
          const mappedDays: HeatmapDay[] = daysRaw.map((day: any) => ({
            date: day.date,
            count: day.count,
            level: day.level,
          }));
          setData(mappedDays.slice(-RECENT_DAYS));
          setTotalContributions(daysRaw.reduce((sum: number, d: any) => sum + d.count, 0));
        } else {
          throw new Error(payload.error || 'Failed to load data');
        }
        setIsLoading(false);
      })
      .catch(err => {
        if (!isMounted) return;
        console.error('Failed to load GitHub streak data:', err);
        const errorMessage = err.message === 'Failed to fetch'
          ? 'Network error while contacting GitHub'
          : (err.message || 'Failed to fetch streak data');
        setError(errorMessage);
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeUsername]);

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
        <div className="flex items-baseline gap-2">
          <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent-gh)]">GitHub</h3>
          <span className="text-[11px] tabular-nums text-ink/65">
            {isLoading || error ? '…' : `${totalContributions.toLocaleString()} commits`}
          </span>
        </div>
        {!isLoading && !error && data.length > 0 && <HeatmapLegend tone="green" />}
      </div>

      {isLoading ? (
        <div className="flex h-[110px] items-center justify-center gap-2 rounded-lg bg-ink/[0.04] text-[11px] font-bold uppercase tracking-[0.14em] text-ink/65">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Fetching @{activeUsername}…</span>
        </div>
      ) : error ? (
        <div className="flex h-[110px] flex-col items-center justify-center gap-2 rounded-lg bg-ink/[0.04] px-4 text-center">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-700" />
          <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-red-700">{error}</span>
        </div>
      ) : data.length > 0 ? (
        <ContributionHeatmap
          days={data}
          tone="green"
          unit="commits"
          ariaLabel={`GitHub contributions calendar for @${activeUsername}`}
        />
      ) : null}
    </div>
  );
}

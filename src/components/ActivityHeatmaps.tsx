import { LeetcodeStreak } from './LeetcodeStreak';
import { GithubStreak } from './GithubStreak';

export function ActivityHeatmaps() {
  return (
    <section
      data-prevent-page-swipe
      className="relative z-10 select-none flex flex-col rounded-xl border border-ink/15 bg-paper p-4 font-mono text-ink shadow-[0_1px_2px_rgba(0,0,0,0.04),0_14px_32px_-20px_rgba(0,0,0,0.45)] sm:p-5"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        <LeetcodeStreak />
        <GithubStreak />
      </div>
    </section>
  );
}

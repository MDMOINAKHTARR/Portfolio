import { useTheme } from '../context/ThemeContext';

const MUSIC_THEME_LABELS = {
  'am-i-dreaming': 'DREAMING',
  sunflower: 'SUNFLOWER',
  quicksilver: 'QUICKSILVER',
  starman: 'STARMAN',
} as const;

export function ThemeToggle() {
  const { theme, musicTheme, toggleTheme } = useTheme();
  const atmosphereLabel = musicTheme
    ? MUSIC_THEME_LABELS[musicTheme]
    : theme === 'color' ? 'COLOR' : 'NOIR';

  return (
    <div className="absolute top-6 right-6 sm:top-8 sm:right-12 z-[200] flex flex-col items-center gap-2">
      <button onClick={toggleTheme} className="group outline-none" title="Toggle Visual Mode">
        <div className="relative transform transition-all duration-300 hover:scale-105 hover:-rotate-2">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-14 h-5 bg-tape opacity-90 rotate-[-5deg] shadow-sm z-10 transition-colors
            before:absolute before:content-[''] before:-left-[2px] before:w-1 before:h-full before:bg-tape
            after:absolute after:content-[''] after:-right-[2px] after:w-1 after:h-full after:bg-tape"
            style={{ clipPath: 'polygon(5% 0%, 95% 5%, 100% 100%, 0% 95%)' }} />

          <div className="bg-paper border border-folder-dark/40 px-4 py-2 sm:px-5 sm:py-3 shadow-[2px_4px_6px_rgba(0,0,0,0.25)] transform rotate-3 transition-colors relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] mix-blend-multiply pointer-events-none" />

            <div className="flex flex-col items-center gap-1 relative z-10">
              <span className="font-typewriter text-[9px] sm:text-[10px] text-ink/60 font-bold uppercase tracking-[0.2em] mb-1 pb-1 border-b-[1px] border-border/20 w-full text-center">
                Atmosphere
              </span>
              <span className={`font-stamp font-bold tracking-widest ${musicTheme ? 'text-sm sm:text-lg text-stamp' : `text-lg sm:text-2xl ${theme === 'noir' ? 'text-ink' : 'text-stamp'}`}`}>
                {atmosphereLabel}
              </span>
            </div>
          </div>
        </div>
      </button>

    </div>
  );
}

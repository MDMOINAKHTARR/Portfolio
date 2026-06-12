import { useTheme } from '../context/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="absolute top-6 right-6 sm:top-8 sm:right-12 z-[200] group outline-none"
      title="Toggle Visual Mode"
    >
      <div className="relative transform transition-all duration-300 hover:scale-105 hover:-rotate-2">
        {/* Masking tape piece */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-14 h-5 bg-tape opacity-90 rotate-[-5deg] shadow-sm z-10 transition-colors
          before:absolute before:content-[''] before:-left-[2px] before:w-1 before:h-full before:bg-tape
          after:absolute after:content-[''] after:-right-[2px] after:w-1 after:h-full after:bg-tape"
          style={{ clipPath: 'polygon(5% 0%, 95% 5%, 100% 100%, 0% 95%)' }} />
        
        {/* Scrap of paper / evidence tag */}
        <div className="bg-paper border border-folder-dark/40 px-4 py-2 sm:px-5 sm:py-3 shadow-[2px_4px_6px_rgba(0,0,0,0.25)] transform rotate-3 transition-colors relative overflow-hidden">
          {/* subtle paper texture overlay */}
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] mix-blend-multiply pointer-events-none"></div>

          <div className="flex flex-col items-center gap-1 relative z-10">
            <span className="font-typewriter text-[9px] sm:text-[10px] text-ink/60 font-bold uppercase tracking-[0.2em] mb-1 pb-1 border-b-[1px] border-border/20 w-full text-center">
              Atmosphere
            </span>
            <span className={`font-stamp text-lg sm:text-2xl font-bold tracking-widest ${theme === 'noir' ? 'text-ink' : 'text-stamp'}`}>
              {theme === 'color' ? 'COLOR' : 'NOIR'}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

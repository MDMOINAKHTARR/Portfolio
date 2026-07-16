import { Fragment, useEffect, useRef, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Command, CornerDownLeft, Keyboard, SquareTerminal, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MUSIC_TRACKS, musicEngine, type PlaybackSnapshot } from '../lib/music';
import { useTheme } from '../context/ThemeContext';

const INITIAL_PLAYBACK: PlaybackSnapshot = {
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  trackIndex: 0,
  volume: 0.5,
};

const SHORTCUTS = [
  ['Space', 'Play / pause'],
  ['N / B', 'Next / previous track'],
  ['UP / DOWN', 'Volume up / down'],
  ['T', 'Color / Noir'],
  ['?', 'Shortcut guide'],
  ['Ctrl + `', 'Terminal mode'],
] as const;

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export function CommandCenter() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalLines, setTerminalLines] = useState<string[]>(['MMA FIELD TERMINAL // TYPE "help"']);
  const playbackRef = useRef(INITIAL_PLAYBACK);
  const typedBuffer = useRef('');
  const konamiProgress = useRef(0);

  useEffect(() => musicEngine.subscribe((snapshot) => { playbackRef.current = snapshot; }), []);

  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isTyping = target.matches('input, textarea, select') || target.isContentEditable;

      if (event.key === 'Escape' && (terminalOpen || showShortcuts)) {
        event.preventDefault();
        setTerminalOpen(false);
        setShowShortcuts(false);
        return;
      }

      if (event.ctrlKey && (event.key === '`' || event.key === '~')) {
        event.preventDefault();
        setTerminalOpen((open) => !open);
        return;
      }

      if (isTyping || terminalOpen || event.metaKey || event.ctrlKey || event.altKey) return;

      const key = event.key.toLowerCase();
      const currentPlayback = playbackRef.current;
      if (event.code === 'Space') {
        event.preventDefault();
        void musicEngine.toggle(currentPlayback.trackIndex);
      } else if (key === 'n') {
        void musicEngine.play((currentPlayback.trackIndex + 1) % MUSIC_TRACKS.length);
      } else if (key === 'b') {
        void musicEngine.play((currentPlayback.trackIndex - 1 + MUSIC_TRACKS.length) % MUSIC_TRACKS.length);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        musicEngine.setVolume(Math.min(1, currentPlayback.volume + 0.08));
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        musicEngine.setVolume(Math.max(0, currentPlayback.volume - 0.08));
      } else if (key === 't') {
        toggleTheme();
      } else if (event.key === '?') {
        setShowShortcuts(true);
      }

      if (key.length === 1 && /[a-z]/.test(key)) {
        typedBuffer.current = `${typedBuffer.current}${key}`.slice(-24);
        if (typedBuffer.current.endsWith('superman')) void musicEngine.play(MUSIC_TRACKS.findIndex((track) => track.id === 'starman'));
        if (typedBuffer.current.endsWith('spiderverse')) void musicEngine.play(MUSIC_TRACKS.findIndex((track) => track.id === 'am-i-dreaming'));
      }

      const konami = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
      if (key === konami[konamiProgress.current]) {
        konamiProgress.current += 1;
        if (konamiProgress.current === konami.length) {
          konamiProgress.current = 0;
          setTerminalLines(['DEVELOPER MODE UNLOCKED', 'All field commands are now available.', 'Type "help" to inspect the system.']);
          setTerminalOpen(true);
        }
      } else {
        konamiProgress.current = key === konami[0] ? 1 : 0;
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [showShortcuts, terminalOpen, toggleTheme]);

  const runCommand = (event: FormEvent) => {
    event.preventDefault();
    const command = terminalInput.trim();
    if (!command) return;
    const [verb, ...args] = command.split(/\s+/);
    const value = args.join(' ');
    const output = executeCommand(verb.toLowerCase(), value);
    setTerminalLines((lines) => [...lines, `> ${command}`, ...output].slice(-14));
    setTerminalInput('');
  };

  const executeCommand = (verb: string, value: string): string[] => {
    if (verb === 'help') return ['about | projects | awards | contact', 'play <song> | pause | theme <color/noir>', 'resume | github | clear'];
    if (verb === 'about') { navigate('/'); return ['Opening subject dossier...']; }
    if (verb === 'projects') { navigate('/operations'); return ['Opening operation archive...']; }
    if (verb === 'awards') { navigate('/evidence'); return ['Opening evidence vault...']; }
    if (verb === 'contact') { navigate('/comms'); return ['Opening secure comms...']; }
    if (verb === 'resume') { window.open('/MdMoinAkhtar.pdf', '_blank', 'noopener,noreferrer'); return ['Resume released in a new tab.']; }
    if (verb === 'github') { window.open('https://github.com/MDMOINAKHTARR', '_blank', 'noopener,noreferrer'); return ['External repository channel opened.']; }
    if (verb === 'pause') { musicEngine.pause(); return ['Transmission paused.']; }
    if (verb === 'play') {
      const query = normalize(value);
      const index = MUSIC_TRACKS.findIndex((track) => track.id.includes(query) || normalize(track.title).includes(query) || track.theme?.includes(query));
      if (index < 0 || !query) return ['Track not found. Try: starman, sunflower, let-it-happen, dreaming, sweet-dreams.'];
      void musicEngine.play(index);
      return [`Transmitting ${MUSIC_TRACKS[index].title}.`];
    }
    if (verb === 'theme') {
      if (value !== 'color' && value !== 'noir') return ['Usage: theme color | theme noir'];
      if (theme !== value) toggleTheme();
      return [`Base atmosphere set to ${value}.`];
    }
    if (verb === 'clear') { setTerminalLines([]); return []; }
    return [`Unknown command: ${verb}. Type "help".`];
  };

  return (
    <>
      <aside className="field-console-launcher fixed bottom-[76px] right-3 z-[380] flex items-center overflow-hidden border border-folder-dark/55 bg-paper text-ink shadow-[3px_5px_16px_rgba(0,0,0,0.24)] print:hidden sm:bottom-10 sm:right-6" aria-label="Field console">
        <button type="button" onClick={() => { setTerminalOpen((open) => !open); setShowShortcuts(false); }} className={`flex items-center gap-1.5 border-r border-ink/10 px-2.5 py-2 font-mono text-[9px] font-black tracking-[0.1em] transition-colors hover:bg-ink/5 ${terminalOpen ? 'bg-ink text-paper' : ''}`} aria-expanded={terminalOpen} title="Open field terminal (Ctrl + `)">
          <SquareTerminal className="h-4 w-4" /><span className="hidden sm:inline">TERMINAL</span>
        </button>
        <button type="button" onClick={() => { setShowShortcuts((open) => !open); setTerminalOpen(false); }} className={`flex items-center gap-1.5 px-2.5 py-2 font-mono text-[9px] font-black tracking-[0.1em] transition-colors hover:bg-ink/5 ${showShortcuts ? 'bg-stamp text-paper' : ''}`} aria-expanded={showShortcuts} title="View keyboard shortcuts (?)">
          <Keyboard className="h-4 w-4" /><span className="hidden sm:inline">KEYS</span>
        </button>
      </aside>

      <AnimatePresence>
        {showShortcuts && (
          <motion.section className="fixed bottom-[122px] right-3 z-[390] w-[min(92vw,340px)] border border-folder-dark bg-paper p-5 text-ink shadow-2xl sm:bottom-24 sm:right-6" initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.98 }} aria-label="Keyboard shortcuts">
              <div className="flex items-center justify-between border-b border-ink/15 pb-3">
                <span className="flex items-center gap-2 font-stamp text-xl font-black"><Command className="h-5 w-5" /> FIELD CONTROLS</span>
                <button type="button" onClick={() => setShowShortcuts(false)} aria-label="Close shortcuts"><X className="h-5 w-5" /></button>
              </div>
              <p className="mt-3 font-mono text-[9px] font-bold leading-relaxed opacity-55">These controls work anywhere unless you are typing in a form.</p>
              <dl className="mt-4 grid grid-cols-[90px_1fr] gap-y-2 font-mono text-[10px]">
                {SHORTCUTS.map(([key, action]) => <Fragment key={key}><dt className="font-black text-stamp">{key}</dt><dd className="font-bold opacity-65">{action}</dd></Fragment>)}
              </dl>
          </motion.section>
        )}

        {terminalOpen && (
          <motion.aside
            className="field-terminal fixed inset-x-3 bottom-[122px] z-[410] mx-auto max-w-2xl font-mono text-[#a9ffc6] sm:bottom-24"
            initial={{ opacity: 0, y: 18, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.99 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-label="Secure navigation terminal"
          >
            <div className="terminal-chassis relative overflow-hidden border-2 border-[#536168] bg-[#172126] p-2 shadow-[0_18px_50px_rgba(0,0,0,0.48)]">
              <header className="terminal-header flex items-center gap-3 border border-white/10 bg-[#0c1215] px-3 py-2">
                <span className="flex gap-1.5" aria-hidden="true">
                  <span className="terminal-light terminal-light--red" />
                  <span className="terminal-light terminal-light--amber" />
                  <span className="terminal-light terminal-light--green" />
                </span>
                <span className="min-w-0 flex-1 truncate text-[9px] font-black tracking-[0.16em] text-[#c7d3d7]">MMA SECURE NAVIGATION CONSOLE</span>
                <span className="hidden items-center gap-1.5 text-[8px] font-black tracking-[0.12em] text-[#70e99c] sm:flex"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />LINK STABLE</span>
                <button type="button" onClick={() => setTerminalOpen(false)} className="flex h-6 w-6 items-center justify-center border border-white/10 text-[#91a0a5] transition-colors hover:border-[#ff7770]/60 hover:text-[#ff7770]" aria-label="Close terminal"><X className="h-3.5 w-3.5" /></button>
              </header>

              <nav className="terminal-function-row mt-2 grid grid-cols-4 gap-1.5" aria-label="Terminal navigation shortcuts">
                {([['F1', 'DOSSIER', '/'], ['F2', 'PROJECTS', '/operations'], ['F3', 'EVIDENCE', '/evidence'], ['F4', 'COMMS', '/comms']] as const).map(([key, label, path]) => (
                  <button key={key} type="button" onClick={() => navigate(path)} className="group/key flex min-w-0 items-center border border-white/10 bg-[#222e33] px-2 py-1.5 text-left transition-colors hover:border-[#7bf0a5]/45 hover:bg-[#293a3e]">
                    <span className="mr-2 border border-[#7bf0a5]/25 px-1 py-0.5 text-[7px] font-black text-[#7bf0a5] group-hover/key:bg-[#7bf0a5] group-hover/key:text-[#0b1712]">{key}</span>
                    <span className="truncate text-[8px] font-black tracking-[0.08em] text-[#b9c4c7]">{label}</span>
                  </button>
                ))}
              </nav>

              <section className="terminal-screen relative mt-2 overflow-hidden border-2 border-[#263d35] bg-[#06110c] shadow-[inset_0_0_28px_rgba(30,245,112,0.08)]">
                <div className="terminal-screen-bar relative z-10 flex items-center justify-between border-b border-[#74f5a1]/15 px-3 py-1.5 text-[7px] font-black tracking-[0.14em] text-[#68b981]">
                  <span>SESSION // MOIN-AKHTAR-01</span><span>ENCRYPTED CHANNEL 7</span>
                </div>
                <div className="terminal-output relative z-10 h-32 overflow-y-auto px-3 py-2.5 text-[11px] leading-relaxed sm:h-36 sm:text-xs">
                  {terminalLines.map((line, index) => (
                    <div key={`${line}-${index}`} className={line.startsWith('>') ? 'terminal-command-line text-[#effff3]' : 'text-[#86dca3]'}>
                      {line.startsWith('>') ? <><span className="mr-2 text-[#ffc765]">MMA›</span>{line.slice(1).trim()}</> : line}
                    </div>
                  ))}
                </div>
              </section>

              <form onSubmit={runCommand} className="terminal-input-deck mt-2 flex items-stretch border border-white/10 bg-[#0b1114]">
                <span className="flex shrink-0 items-center border-r border-white/10 bg-[#202c31] px-3 text-[9px] font-black tracking-[0.08em] text-[#ffc765]">MMA:\\&gt;</span>
                <input autoFocus value={terminalInput} onChange={(event) => setTerminalInput(event.target.value)} placeholder="type a command or 'help'" className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-[11px] font-bold text-[#d7ffe4] placeholder:text-[#6c8274] outline-none sm:text-xs" aria-label="Terminal command" />
                <button type="submit" className="flex w-10 items-center justify-center border-l border-white/10 text-[#7bf0a5] transition-colors hover:bg-[#7bf0a5] hover:text-[#07110b]" aria-label="Run command"><CornerDownLeft className="h-4 w-4" /></button>
              </form>

              <footer className="flex items-center justify-between px-1 pt-2 text-[7px] font-black tracking-[0.1em] text-[#708087]">
                <span>ESC CLOSES CONSOLE</span><span>CTRL + ` TOGGLE // ? KEY MAP</span>
              </footer>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

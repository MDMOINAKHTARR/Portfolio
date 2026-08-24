import { Fragment, useEffect, useRef, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Bookmark, CheckSquare, Command, CornerDownLeft, Keyboard, Square, X, BookOpen, Compass, Paperclip, Terminal, Play, FolderGit2, UserCheck } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  ['Space', 'Play / pause transmission'],
  ['N / B', 'Next / previous track'],
  ['UP / DOWN', 'Volume adjust'],
  ['T', 'Color / Noir atmosphere'],
  ['?', 'Field control guide'],
  ['Ctrl + `', 'Pull / Close Journal'],
] as const;

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const NAV_CHECKLIST = [
  { id: 'dossier', label: 'Home & About', path: '/', note: 'Main Profile' },
  { id: 'projects', label: 'Projects', path: '/operations', note: 'My Work' },
  { id: 'evidence', label: 'Certificates', path: '/evidence', note: 'Credentials & Proof' },
  { id: 'comms', label: 'Contact', path: '/comms', note: 'Get in Touch' },
] as const;

const QUICK_ACTIONS = [
  { label: 'HELP', command: 'help' },
  { label: 'PROJECTS', command: 'projects' },
  { label: 'PLAY MUSIC', command: 'play starman' },
  { label: 'GITHUB', command: 'github' },
] as const;

export function CommandCenter() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [journalOpen, setJournalOpen] = useState(false);
  const [journalInput, setJournalInput] = useState('');
  const [journalLines, setJournalLines] = useState<string[]>([
    'FIELD NOTEBOOK // LOG #047',
    'Type "help" to inspect directives or select a sector checkbox to navigate.',
  ]);
  const playbackRef = useRef(INITIAL_PLAYBACK);
  const typedBuffer = useRef('');
  const konamiProgress = useRef(0);

  useEffect(() => musicEngine.subscribe((snapshot) => { playbackRef.current = snapshot; }), []);

  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isTyping = target.matches('input, textarea, select') || target.isContentEditable;

      if (event.key === 'Escape' && (journalOpen || showShortcuts)) {
        event.preventDefault();
        setJournalOpen(false);
        setShowShortcuts(false);
        return;
      }

      if (event.ctrlKey && (event.key === '`' || event.key === '~')) {
        event.preventDefault();
        setJournalOpen((open) => !open);
        return;
      }

      if (isTyping || journalOpen || event.metaKey || event.ctrlKey || event.altKey) return;

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
          setJournalLines(['FIELD CLEARANCE GRANTED', 'All classified directives unlocked.', 'Type "help" for field instructions.']);
          setJournalOpen(true);
        }
      } else {
        konamiProgress.current = key === konami[0] ? 1 : 0;
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [showShortcuts, journalOpen, toggleTheme]);

  const runCommandText = (commandText: string) => {
    const command = commandText.trim();
    if (!command) return;
    const [verb, ...args] = command.split(/\s+/);
    const value = args.join(' ');
    const output = executeCommand(verb.toLowerCase(), value);
    setJournalLines((lines) => [...lines, `> ${command}`, ...output].slice(-14));
    setJournalInput('');
  };

  const runCommand = (event: FormEvent) => {
    event.preventDefault();
    runCommandText(journalInput);
  };

  const executeCommand = (verb: string, value: string): string[] => {
    if (verb === 'help') return ['Nav: about | projects | awards | contact', 'Music: play <song> | pause | resume', 'System: theme <color/noir> | github | clear'];
    if (verb === 'about') { navigate('/'); return ['Opening subject dossier...']; }
    if (verb === 'projects') { navigate('/operations'); return ['Opening operation archive...']; }
    if (verb === 'awards') { navigate('/evidence'); return ['Opening evidence vault...']; }
    if (verb === 'contact') { navigate('/comms'); return ['Opening secure comms...']; }
    if (verb === 'resume') { window.open('/MdMoinAkhtar.pdf', '_blank', 'noopener,noreferrer'); return ['Resume file released in a new tab.']; }
    if (verb === 'github') { window.open('https://github.com/MDMOINAKHTARR', '_blank', 'noopener,noreferrer'); return ['External repository channel opened.']; }
    if (verb === 'pause') { musicEngine.pause(); return ['Transmission paused.']; }
    if (verb === 'play') {
      const query = normalize(value);
      const index = MUSIC_TRACKS.findIndex((track) => track.id.includes(query) || normalize(track.title).includes(query) || track.theme?.includes(query));
      if (index < 0 || !query) return ['Track not found. Try: starman, sunflower, let-it-happen, dreaming, sweet-dreams.'];
      void musicEngine.play(index);
      return [`Playing ${MUSIC_TRACKS[index].title}.`];
    }
    if (verb === 'theme') {
      if (value !== 'color' && value !== 'noir') return ['Usage: theme color | theme noir'];
      if (theme !== value) toggleTheme();
      return [`Atmosphere adjusted to ${value}.`];
    }
    if (verb === 'clear') { setJournalLines([]); return []; }
    return [`Directive unrecognized: "${verb}". Type "help".`];
  };

  return (
    <>
      {/* Flat side-by-side Launcher Dock */}
      <aside
        className="field-agent-launcher-dock fixed bottom-4 right-4 z-[380] flex items-center rounded-lg border-2 border-ink bg-paper p-1 shadow-[4px_4px_0_var(--c-ink)] print:hidden sm:right-8"
        aria-label="Field Agent Control Launcher"
      >
        {/* Journal Tab Button */}
        <button
          type="button"
          onClick={() => { setJournalOpen((open) => !open); setShowShortcuts(false); }}
          className={`group relative flex items-center gap-2 rounded px-3 py-1.5 font-mono text-[10px] font-black tracking-wider transition-all focus:outline-none ${
            journalOpen
              ? 'bg-stamp text-paper shadow-sm'
              : 'text-ink hover:bg-ink/10'
          }`}
          aria-expanded={journalOpen}
          title="Open Field Pocket Journal (Ctrl + `)"
        >
          {/* Subtle Satin Bookmark Tag hanging off top */}
          <div className="absolute -top-2 right-3 h-3.5 w-2 rounded-b-xs border-x border-b border-paper/40 bg-stamp shadow-xs" />

          <BookOpen className={`h-3.5 w-3.5 transition-transform group-hover:scale-110 ${journalOpen ? 'text-paper' : 'text-stamp'}`} />
          <span className="uppercase">JOURNAL</span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" title="System Active" />
        </button>

        <div className="mx-1 h-4 w-px bg-ink/20" />

        {/* Keys Guide Tab Button */}
        <button
          type="button"
          onClick={() => { setShowShortcuts((open) => !open); setJournalOpen(false); }}
          className={`group flex items-center gap-1.5 rounded px-2.5 py-1.5 font-mono text-[10px] font-black tracking-wider transition-all focus:outline-none ${
            showShortcuts
              ? 'bg-ink text-paper shadow-sm'
              : 'text-ink/80 hover:bg-ink/10'
          }`}
          aria-expanded={showShortcuts}
          title="Field Keyboard Shortcuts (?)"
        >
          <Command className={`h-3.5 w-3.5 transition-transform group-hover:scale-110 ${showShortcuts ? 'text-paper' : 'text-ink/60'}`} />
          <span className="uppercase">KEYS</span>
        </button>
      </aside>

      <AnimatePresence>
        {/* Shortcuts Guide Card */}
        {showShortcuts && (
          <motion.section
            className="fixed bottom-[90px] right-4 z-[390] w-[min(92vw,330px)] border-[3px] border-ink bg-paper p-5 text-ink shadow-[8px_8px_0_var(--c-ink)] sm:right-8"
            initial={{ opacity: 0, y: 14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            aria-label="Keyboard shortcuts"
          >
            <div className="flex items-center justify-between border-b-2 border-ink/20 pb-2.5">
              <span className="flex items-center gap-2 font-stamp text-lg font-black text-ink">
                <Compass className="h-5 w-5 text-stamp" /> FIELD DIRECTIVES
              </span>
              <button type="button" onClick={() => setShowShortcuts(false)} aria-label="Close shortcuts" className="hover:text-stamp">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-2 font-['Kalam',cursive] text-xs font-bold text-ink/75 leading-relaxed">
              Global shortcuts active across all agent files:
            </p>
            <dl className="mt-3 grid grid-cols-[100px_1fr] gap-y-2 font-mono text-[10px]">
              {SHORTCUTS.map(([key, action]) => (
                <Fragment key={key}>
                  <dt className="font-black text-stamp">{key}</dt>
                  <dd className="font-bold text-ink/80">{action}</dd>
                </Fragment>
              ))}
            </dl>
          </motion.section>
        )}

        {/* Enhanced 2-Page Vintage Field Journal Overlay */}
        {journalOpen && (
          <motion.aside
            className="field-pocket-journal fixed inset-x-3 bottom-[65px] z-[410] mx-auto max-w-3xl sm:bottom-10 pointer-events-none"
            initial={{ opacity: 0, y: 40, rotate: -1.5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, rotate: 1, scale: 0.95 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-label="Field Pocket Journal"
          >
            {/* Textured Sleeve Wrapper using Theme Colors */}
            <div className="relative rounded-xl border-[3px] border-ink bg-folder-dark p-3 sm:p-4 shadow-[0_25px_60px_rgba(0,0,0,0.5)] pointer-events-auto">
              
              {/* Double stitched borders inside the cover */}
              <div className="absolute inset-1.5 rounded-lg border border-dashed border-ink/20 pointer-events-none" />
              <div className="absolute inset-2.5 rounded-md border border-dotted border-ink/10 pointer-events-none" />

              {/* Brass Corner Brackets */}
              <div className="absolute top-2 left-2 h-4 w-4 rounded-tl border-t-2 border-l-2 border-ink/40 pointer-events-none" />
              <div className="absolute top-2 right-2 h-4 w-4 rounded-tr border-t-2 border-r-2 border-ink/40 pointer-events-none" />
              <div className="absolute bottom-2 left-2 h-4 w-4 rounded-bl border-b-2 border-l-2 border-ink/40 pointer-events-none" />
              <div className="absolute bottom-2 right-2 h-4 w-4 rounded-br border-b-2 border-r-2 border-ink/40 pointer-events-none" />

              {/* Crimson Bookmark Satin Ribbon */}
              <div 
                className="absolute top-0 right-[42%] w-3.5 h-24 bg-stamp z-30 pointer-events-none shadow-md border-x border-b border-paper/30"
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 86%, 0 100%)' }}
              />

              {/* Protruding Index Tabs for Tactile Navigation */}
              <div className="absolute right-[-14px] top-10 bottom-10 flex flex-col justify-around pointer-events-auto z-[-1] hidden sm:flex">
                {NAV_CHECKLIST.map((item, idx) => {
                  const isActive = location.pathname === item.path;
                  const tabColors = [
                    'bg-folder text-ink',
                    'bg-stamp text-paper',
                    'bg-band-bg text-paper border-band-border',
                    'bg-tape text-ink'
                  ];
                  const romanNumerals = ['I', 'II', 'III', 'IV'];
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => navigate(item.path)}
                      className={`group flex items-center justify-end w-10 h-9 border-y border-r border-ink rounded-r shadow-xs transition-all hover:w-11 focus:outline-none ${
                        isActive 
                          ? 'w-11 pr-2 bg-paper text-ink font-black scale-105 z-10 border-l border-paper' 
                          : `${tabColors[idx % tabColors.length]} opacity-80 hover:opacity-100`
                      }`}
                      title={item.label}
                    >
                      <span className="font-mono text-[9px] font-black tracking-widest text-center pr-1 uppercase transform rotate-90 block">
                        {romanNumerals[idx]}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Stacked Paper Spread */}
              <div className="relative rounded-lg border-2 border-ink bg-folder p-0.5 shadow-2xl">
                
                {/* Uneven Stacked Paper Edges */}
                <div className="absolute -bottom-1 inset-x-2 h-2 rounded bg-paper/60 border border-ink/10 pointer-events-none -z-10" />
                <div className="absolute -bottom-2 inset-x-4.5 h-2 rounded bg-paper/30 border border-ink/10 pointer-events-none -z-20" />

                {/* Double Page Layout */}
                <div className="relative grid grid-cols-1 md:grid-cols-2 gap-0 overflow-hidden rounded bg-paper text-ink">
                  
                  {/* Crease line shadow */}
                  <div className="hidden md:block absolute inset-y-0 left-1/2 -translate-x-1/2 w-6 bg-gradient-to-r from-black/10 via-black/25 to-black/10 z-20 pointer-events-none" />

                  {/* Metal Wire Spiral Binding Spine */}
                  <div className="hidden md:flex absolute inset-y-0 left-1/2 -translate-x-1/2 flex-col justify-around py-5 z-25 pointer-events-none w-8">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div key={i} className="relative flex items-center justify-between w-full h-3 -my-0.5">
                        {/* Left binder hole */}
                        <div className="w-1.5 h-1.5 rounded-full bg-ink/75 shadow-[inset_0.5px_0.5px_1px_rgba(0,0,0,0.8)]" />
                        {/* Curved wire ring */}
                        <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-6 h-2 rounded-full border-t border-b border-stone-400 bg-gradient-to-b from-stone-200 via-stone-100 to-stone-400 shadow-[1px_1px_2px_rgba(0,0,0,0.25)]" />
                        {/* Right binder hole */}
                        <div className="w-1.5 h-1.5 rounded-full bg-ink/75 shadow-[inset_0.5px_0.5px_1px_rgba(0,0,0,0.8)]" />
                      </div>
                    ))}
                  </div>

                  {/* Sleek Fabric Ribbon Bookmark integrated cleanly down the Center Spine */}
                  <div className="hidden md:block absolute -top-3 left-1/2 -translate-x-1/2 h-[calc(100%+26px)] w-3.5 z-22 pointer-events-none filter drop-shadow-[2px_4px_5px_rgba(0,0,0,0.3)]">
                    <div 
                      className="w-full h-full bg-gradient-to-r from-red-950 via-stamp via-rose-700 to-red-900 border-x border-black/30 relative"
                      style={{
                        backgroundImage: 'repeating-linear-gradient(90deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 1px, transparent 1px, transparent 3px)',
                        clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), 50% 100%, 0 calc(100% - 10px))'
                      }}
                    >
                      {/* Golden Satin Sheen Line down the ribbon */}
                      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] bg-gradient-to-b from-amber-200/50 via-amber-300/30 to-transparent" />

                      {/* Brass Ring Accent near bottom tail */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full border border-amber-600 bg-amber-400 shadow-xs" />
                    </div>
                  </div>

                  {/* ================= PAGE 1: Case Dossier & Sector Directory ================= */}
                  <div className="relative p-3.5 sm:p-4 font-typewriter border-b md:border-b-0 md:border-r border-ink/20 overflow-hidden flex flex-col justify-between space-y-3">
                    
                    {/* Horizontal ruled paper lines background */}
                    <div 
                      className="absolute inset-0 opacity-[0.06] pointer-events-none z-0"
                      style={{
                        backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 21px, var(--c-ink) 22px)',
                        backgroundSize: '100% 22px'
                      }}
                    />

                    {/* Red margin line on the left */}
                    <div className="absolute inset-y-0 left-5 w-[2px] bg-rose-500/25 pointer-events-none z-10" />

                    {/* Faded diagonal CLASSIFIED stamp watermark */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden opacity-[0.035] z-0">
                      <span className="font-stamp text-[48px] font-black text-stamp tracking-[0.2em] -rotate-12 uppercase">
                        CLASSIFIED
                      </span>
                    </div>

                    {/* Top Content Area */}
                    <div className="relative z-10 space-y-3 pl-2">

                      {/* Subject Identity Header */}
                      <div className="relative bg-paper/90 border border-ink/25 p-2 rounded shadow-2xs space-y-0.5">
                        {/* Tape Strip Accent */}
                        <div className="absolute -top-2 left-4 bg-tape/40 border border-tape/30 px-1.5 py-0.2 font-mono text-[8px] font-bold text-ink/70 uppercase tracking-widest rotate-[-1deg]">
                          FIELD JOURNAL
                        </div>

                        <div className="flex items-center justify-between border-b border-ink/15 pb-0.5 pt-0.5">
                          <span className="font-mono text-[9px] font-black text-stamp uppercase tracking-wider">
                            PORTFOLIO JOURNAL // FILE #001
                          </span>
                          <UserCheck className="w-3.5 h-3.5 text-stamp" />
                        </div>

                        <div className="flex items-baseline justify-between pt-0.5">
                          <span className="font-mono text-sm font-black text-ink tracking-tight">
                            MD MOIN AKHTAR
                          </span>
                          <span className="font-mono text-[10px] font-bold text-stamp bg-stamp/10 px-1.5 py-0.2 rounded border border-stamp/20">
                            DEVELOPER
                          </span>
                        </div>
                      </div>

                      {/* Sector Directory (Compact & Simple Navigation) */}
                      <div className="space-y-1.5">
                        <div className="font-mono text-[11px] font-black text-ink/70 uppercase tracking-wider flex items-center justify-between border-b border-ink/20 pb-0.5">
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3 text-stamp" /> // PAGES INDEX
                          </span>
                          <span className="text-[9px] font-bold text-stamp">CLICK TO OPEN</span>
                        </div>

                        <nav className="space-y-1" aria-label="Field Sector Directory">
                          {NAV_CHECKLIST.map((item, idx) => {
                            const isActive = location.pathname === item.path;
                            const pageNumbers = ['PG 01', 'PG 02', 'PG 03', 'PG 04'];
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => navigate(item.path)}
                                className={`w-full group text-left px-2 py-1.5 rounded-xs transition-all border flex items-center justify-between ${
                                  isActive
                                    ? 'bg-stamp/10 border-stamp shadow-2xs ring-1 ring-stamp/30'
                                    : 'bg-paper/70 border-ink/15 hover:bg-ink/10 hover:border-ink/35'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className={`font-mono text-xs font-black shrink-0 ${
                                    isActive ? 'text-stamp' : 'text-ink/40 group-hover:text-ink'
                                  }`}>
                                    {isActive ? '►' : '○'}
                                  </span>
                                  <div className="min-w-0">
                                    <div className={`font-mono text-xs font-black tracking-wide leading-tight ${
                                      isActive ? 'text-stamp' : 'text-ink group-hover:text-stamp'
                                    }`}>
                                      {item.label}
                                    </div>
                                    <div className="font-mono text-[10px] text-ink/65 font-medium leading-none mt-0.5">
                                      {item.note}
                                    </div>
                                  </div>
                                </div>

                                <span className={`font-mono text-[9px] font-bold shrink-0 px-1.5 py-0.2 rounded border ${
                                  isActive 
                                    ? 'bg-stamp text-paper border-stamp font-black' 
                                    : 'bg-ink/5 text-ink/55 border-ink/20 group-hover:border-ink/40 group-hover:text-ink'
                                }`}>
                                  {pageNumbers[idx]}
                                </span>
                              </button>
                            );
                          })}
                        </nav>
                      </div>

                      {/* Operational Directives Reference Box */}
                      <div className="border border-dashed border-ink/25 bg-paper/80 p-2 rounded-xs space-y-1 shadow-2xs">
                        <div className="font-mono text-[10px] font-black text-stamp uppercase tracking-wider flex items-center gap-1 border-b border-ink/15 pb-0.5">
                          <Terminal className="w-3.5 h-3.5 text-stamp" /> QUICK COMMANDS
                        </div>

                        <div className="space-y-0.5 font-mono text-[10.5px] text-ink">
                          <div className="flex items-center justify-between">
                            <code className="font-black text-stamp bg-stamp/10 px-1 py-0.2 rounded border border-stamp/20">help</code>
                            <span className="text-ink/75 font-semibold text-[10px]">Show command list</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <code className="font-black text-stamp bg-stamp/10 px-1 py-0.5 rounded border border-stamp/20">projects</code>
                            <span className="text-ink/75 font-semibold text-[10px]">View projects list</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <code className="font-black text-stamp bg-stamp/10 px-1 py-0.2 rounded border border-stamp/20">play [track]</code>
                            <span className="text-ink/75 font-semibold text-[10px]">Play music (e.g. starman)</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <code className="font-black text-stamp bg-stamp/10 px-1 py-0.2 rounded border border-stamp/20">theme [x]</code>
                            <span className="text-ink/75 font-semibold text-[10px]">Switch theme (color / noir)</span>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Bottom Status Stamp Bar */}
                    <div className="relative z-10 pl-2 pt-1 border-t border-ink/15 flex items-center justify-between">
                      <span className="inline-block -rotate-1 border border-stamp bg-stamp/10 px-1.5 py-0.2 font-stamp text-[8px] font-black text-stamp tracking-widest uppercase">
                        PORTFOLIO JOURNAL • ONLINE
                      </span>
                      <span className="font-mono text-[10px] font-extrabold text-ink/40">PAGE 01</span>
                    </div>

                  </div>

                  {/* ================= PAGE 2: Ruled Journal Logger ================= */}
                  <div className="relative p-4 sm:p-5 font-typewriter overflow-hidden flex flex-col justify-between">
                    
                    {/* Ruled lines */}
                    <div 
                      className="absolute inset-0 opacity-[0.06] pointer-events-none"
                      style={{
                        backgroundImage: 'linear-gradient(to bottom, transparent 23px, var(--c-ink) 24px)',
                        backgroundSize: '100% 24px'
                      }}
                    />

                    <div>
                      {/* Header */}
                      <div className="relative z-10 flex items-center justify-between border-b border-ink/15 pb-1.5 mb-2">
                        <div className="flex items-center gap-1.5">
                          <BookOpen className="h-4 w-4 text-stamp shrink-0" />
                          <span className="font-mono text-[9px] font-black tracking-widest text-ink/80 uppercase">
                            DIRECTIVE CONSOLE & LOGS
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setJournalOpen(false)}
                          className="flex h-5 w-5 items-center justify-center border border-ink/30 text-ink/75 hover:bg-ink hover:text-paper transition-all rounded-xs"
                          aria-label="Close Field Journal"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Paperclipped shortcuts card */}
                      <div className="relative z-10 mx-auto mb-3 w-full border border-ink/15 bg-paper/70 px-2.5 py-1.5 shadow-xs rounded-sm">
                        {/* Brass paperclip visual overlay */}
                        <div className="absolute -top-3.5 right-6 w-3 h-8 border-2 border-stone-500 rounded-full rotate-[20deg] shadow-xs bg-transparent z-30">
                          <div className="absolute inset-0.5 border border-stone-500 rounded-full" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 70%, 0 70%)' }} />
                        </div>
                        
                        <div className="font-mono font-bold text-[8px] text-stamp uppercase border-b border-ink/10 pb-0.5">
                          FIELD CHEAT SHEET
                        </div>
                        <dl className="mt-1 grid grid-cols-[65px_1fr] gap-x-1.5 font-mono text-[8px] text-ink/80">
                          {SHORTCUTS.slice(0, 4).map(([key, action]) => (
                            <Fragment key={key}>
                              <dt className="font-black text-stamp truncate">{key}</dt>
                              <dd className="truncate text-ink/70">{action}</dd>
                            </Fragment>
                          ))}
                        </dl>
                      </div>

                      {/* Stamped Directives Chips */}
                      <div className="relative z-10 flex items-center gap-1 mb-2 overflow-x-auto pb-1">
                        <span className="font-mono text-[8px] font-black text-ink/40 uppercase shrink-0">DIRECTIVES:</span>
                        {QUICK_ACTIONS.map((action) => (
                          <button
                            key={action.label}
                            type="button"
                            onClick={() => runCommandText(action.command)}
                            className="shrink-0 border border-ink/30 bg-ink/5 px-1.5 py-0.5 font-mono text-[8px] font-bold text-ink hover:border-stamp hover:bg-stamp hover:text-paper transition-colors"
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>

                      {/* Command log printout */}
                      <div className="relative z-10 h-28 sm:h-32 overflow-y-auto font-mono text-[10px] sm:text-[11px] leading-relaxed space-y-1 pr-1 border-b border-ink/15 pb-2">
                        {journalLines.map((line, index) => (
                          <div
                            key={`${line}-${index}`}
                            className={line.startsWith('>') ? 'font-black text-ink' : 'text-ink/75'}
                          >
                            {line.startsWith('>') ? (
                              <>
                                <span className="mr-1.5 text-stamp font-black">ENTRY›</span>
                                {line.slice(1).trim()}
                              </>
                            ) : (
                              line
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Underlined Ink Directive Line & Prominent Tactile Pencil */}
                    <div className="relative z-10 mt-2 space-y-1.5">
                      {/* Tactile Yellow Field Pencil Resting Above Input */}
                      <div className="flex items-center justify-between pt-0.5">
                        <span className="font-mono text-[9px] font-extrabold text-stamp uppercase tracking-wider flex items-center gap-1">
                          ✏ FIELD PENCIL #2
                        </span>
                        {/* High-Visibility Tactile Pencil */}
                        <div className="flex items-center w-32 sm:w-36 h-3 sm:h-3.5 z-30 rotate-[-1deg] drop-shadow-md select-none pointer-events-none">
                          <div className="w-3 h-full bg-rose-400 rounded-l-xs border border-ink/30 shadow-inner" />
                          <div className="w-2 h-full bg-gradient-to-r from-stone-400 via-stone-200 to-stone-500 border-y border-ink/30" />
                          <div className="flex-1 h-full bg-gradient-to-b from-amber-300 via-yellow-400 to-amber-500 border-y border-ink/30 relative flex items-center justify-center">
                            <span className="font-mono text-[7px] font-black text-amber-950 tracking-widest uppercase">
                              FIELD HB #2
                            </span>
                          </div>
                          <div className="w-3 h-full bg-amber-200 border-y border-ink/30" style={{ clipPath: 'polygon(0 0, 100% 50%, 0 100%)' }} />
                          <div className="w-1.5 h-full bg-stone-900" style={{ clipPath: 'polygon(0 35%, 100% 50%, 0 65%)' }} />
                        </div>
                      </div>

                      <form onSubmit={runCommand} className="flex items-center border-b-2 border-ink bg-paper/50 px-1 py-1 rounded-xs">
                        <span className="flex shrink-0 items-center px-1 font-mono text-xs font-black text-stamp select-none">
                          ✍ directive:
                        </span>
                        <input
                          autoFocus
                          value={journalInput}
                          onChange={(e) => setJournalInput(e.target.value)}
                          placeholder="type command (e.g. help, projects)..."
                          className="min-w-0 flex-1 bg-transparent px-1.5 text-[11px] font-mono font-bold text-ink placeholder:text-ink/40 outline-none"
                          aria-label="Directive input"
                        />
                        <button
                          type="submit"
                          className="flex h-5 w-5 items-center justify-center text-ink/70 hover:text-stamp hover:scale-110 transition-all"
                          aria-label="Execute directive"
                        >
                          <CornerDownLeft className="h-3.5 w-3.5" />
                        </button>
                      </form>

                      <div className="mt-1 flex items-center justify-between font-mono text-[8px] font-bold text-ink/40 uppercase tracking-widest">
                        <span>ESC TO CLOSE</span>
                        <span>PAGE 02</span>
                      </div>
                    </div>

                  </div>

                </div>

              </div>

            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}




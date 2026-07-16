import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ChevronDown,
  Disc3,
  Pause,
  Play,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
} from 'lucide-react';
import { MUSIC_TRACKS, musicEngine } from '../lib/music';

const readStoredNumber = (key: string, fallback: number) => {
  if (typeof window === 'undefined') return fallback;
  const rawValue = window.localStorage.getItem(key);
  if (rawValue === null) return fallback;
  const storedValue = Number(rawValue);
  return Number.isFinite(storedValue) ? storedValue : fallback;
};

const DEFAULT_VOLUME = 0.5;
const VOLUME_DEFAULT_VERSION = '2';

const readStoredVolume = () => {
  if (typeof window === 'undefined') return DEFAULT_VOLUME;
  const storedVolume = readStoredNumber('case-radio-volume', DEFAULT_VOLUME);
  const hasCurrentDefault = window.localStorage.getItem('case-radio-volume-default-version') === VOLUME_DEFAULT_VERSION;

  if (!hasCurrentDefault && (storedVolume === 0 || storedVolume === 0.35)) {
    return DEFAULT_VOLUME;
  }

  return Math.min(1, Math.max(0, storedVolume));
};

export function MusicPlayer({ mobileNav = false }: { mobileNav?: boolean }) {
  const expandedPlayerRef = useRef<HTMLElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackIndex, setTrackIndex] = useState(() => {
    const storedIndex = readStoredNumber('case-radio-track', 0);
    return Math.min(MUSIC_TRACKS.length - 1, Math.max(0, storedIndex));
  });
  const [volume, setVolume] = useState(readStoredVolume);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const currentTrack = MUSIC_TRACKS[trackIndex];

  useEffect(() => {
    musicEngine.select(trackIndex);
    return musicEngine.subscribe((snapshot) => {
      setIsPlaying(snapshot.isPlaying);
      setTrackIndex(snapshot.trackIndex);
      setCurrentTime(snapshot.currentTime);
      setDuration(snapshot.duration);
    });
  }, []);

  useEffect(() => {
    musicEngine.setVolume(volume);
    window.localStorage.setItem('case-radio-volume', String(volume));
    window.localStorage.setItem('case-radio-volume-default-version', VOLUME_DEFAULT_VERSION);
  }, [volume]);

  useEffect(() => {
    window.localStorage.setItem('case-radio-track', String(trackIndex));
  }, [trackIndex]);

  useEffect(() => {
    if (!isExpanded || !mobileNav) return;

    const closeOnOutsidePress = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && !expandedPlayerRef.current?.contains(target)) {
        setIsExpanded(false);
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsExpanded(false);
    };

    document.addEventListener('pointerdown', closeOnOutsidePress);
    document.addEventListener('keydown', closeOnEscape);

    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePress);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isExpanded, mobileNav]);

  useEffect(() => () => musicEngine.destroy(), []);

  const playTrack = async (index: number) => {
    setTrackIndex(index);
    await musicEngine.play(index);
  };

  const togglePlayback = async () => {
    await musicEngine.toggle(trackIndex);
  };

  const moveTrack = async (direction: -1 | 1) => {
    const nextIndex = (trackIndex + direction + MUSIC_TRACKS.length) % MUSIC_TRACKS.length;
    await playTrack(nextIndex);
  };

  const shuffleTrack = async () => {
    if (MUSIC_TRACKS.length < 2) return;
    let nextIndex = trackIndex;
    while (nextIndex === trackIndex) {
      nextIndex = Math.floor(Math.random() * MUSIC_TRACKS.length);
    }
    await playTrack(nextIndex);
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;
  const containerClassName = mobileNav
    ? 'pointer-events-none relative flex min-w-[36px] flex-1 items-center justify-center font-mono print:hidden'
    : 'pointer-events-none fixed bottom-10 left-6 z-[96] hidden w-[280px] font-mono print:hidden sm:block';
  const collapsedClassName = mobileNav
    ? 'pointer-events-auto relative flex h-10 w-full touch-manipulation flex-col items-center justify-center rounded-full text-ink/60 transition-all hover:bg-ink/5 hover:text-ink active:scale-90'
    : 'pointer-events-auto relative flex h-[52px] w-[68px] items-center justify-center border border-folder-dark/60 bg-zinc-950 text-[#f2d28b] shadow-[3px_5px_14px_rgba(0,0,0,0.4)] transition-all hover:-translate-y-0.5 hover:border-red-500/60 hover:text-white active:translate-y-0';
  const expandedClassName = mobileNav
    ? 'pointer-events-auto absolute bottom-[calc(100%+12px)] right-0 z-[110] w-[min(92vw,320px)] touch-manipulation overflow-hidden border-2 border-folder-dark/60 bg-paper text-ink shadow-[5px_7px_22px_rgba(0,0,0,0.5)]'
    : 'pointer-events-auto relative overflow-hidden border-2 border-folder-dark/60 bg-paper text-ink shadow-[5px_7px_18px_rgba(0,0,0,0.46)]';

  return (
    <div
      data-prevent-page-swipe
      className={containerClassName}
    >
      <AnimatePresence mode="wait" initial={false}>
        {!isExpanded ? (
          <motion.button
            key="collapsed"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.18 }}
            type="button"
            onMouseEnter={mobileNav ? undefined : () => setIsExpanded(true)}
            onFocus={() => setIsExpanded(true)}
            onClick={() => setIsExpanded(true)}
            className={collapsedClassName}
            aria-label="Open Case File Radio"
            title="Case File Radio"
          >
            {mobileNav ? (
              <>
                <Disc3 className={`h-4 w-4 transition-colors ${isPlaying ? 'case-radio-reel text-red-700' : ''}`} />
                <span className={`overflow-hidden text-[7px] font-bold leading-none transition-all ${isPlaying ? 'mt-0.5 max-h-3 text-red-800 opacity-100' : 'max-h-0 opacity-0'}`}>
                  PLAYING
                </span>
              </>
            ) : isPlaying ? (
              <Disc3 className="case-radio-reel h-8 w-8 text-red-400" />
            ) : (
              <MiniCassette isPlaying={false} />
            )}
            {!mobileNav && <span className={`absolute right-1 top-1 h-1.5 w-1.5 rounded-full ${isPlaying ? 'animate-pulse bg-emerald-400' : 'bg-zinc-500'}`} />}
          </motion.button>
        ) : (
          <motion.aside
            ref={expandedPlayerRef}
            key="expanded"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onMouseLeave={mobileNav ? undefined : () => setIsExpanded(false)}
            className={expandedClassName}
            aria-label="Case File Radio music player"
          >
            <div className="absolute left-1/2 top-0 h-4 w-24 -translate-x-1/2 -translate-y-1/2 rotate-[-2deg] bg-tape opacity-90" />

            <div className="flex items-center justify-between border-b-2 border-red-800/70 bg-ink px-2.5 py-1.5 text-paper">
              <div>
                <div className="text-[8px] font-bold tracking-[0.2em] text-red-400">FIELD RADIO // ACTIVE</div>
                <div className="text-[10px] font-black tracking-[0.1em]">SURVEILLANCE TAPES - VOL. 01</div>
              </div>
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="rounded-sm p-1.5 text-paper/70 transition-colors hover:bg-paper/10 hover:text-paper"
                aria-label="Collapse music player"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>

            <div className="p-2">
              <div className="mb-2 flex items-center gap-2 border-b border-ink/15 pb-2">
                <Cassette isPlaying={isPlaying} trackNumber={trackIndex + 1} />

                <div className="min-w-0 flex-1">
                  <div className="mb-1 text-[8px] font-bold tracking-[0.2em] text-stamp">NOW TRANSMITTING</div>
                  <div className="font-stamp text-sm font-bold leading-tight tracking-wider">{currentTrack.title}</div>
                  <div className="mt-1 text-[8px] font-bold leading-tight tracking-wider opacity-60">{currentTrack.artist}</div>
                  <div className="mt-2 flex items-center gap-2 text-[8px] font-bold tracking-widest opacity-60">
                    <span className={`h-1.5 w-1.5 rounded-full ${isPlaying ? 'animate-pulse bg-emerald-600' : 'bg-ink/30'}`} />
                    {isPlaying ? 'PLAYING' : 'STANDBY'} // {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                </div>
              </div>

              <label className="mb-2 flex items-center gap-2 border-b border-ink/15 pb-2 text-[8px] font-bold tracking-widest opacity-75">
                <Volume2 className="h-4 w-4 shrink-0" />
                <span className="shrink-0">MUSIC LEVEL</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(event) => setVolume(Number(event.target.value))}
                  className="case-radio-range w-full cursor-pointer"
                  style={{ '--radio-progress': `${volume * 100}%` } as CSSProperties}
                  aria-label="Music volume"
                />
                <span className="w-7 text-right">{Math.round(volume * 100)}</span>
              </label>

              <div className="mb-2 grid grid-cols-2 gap-1">
                {MUSIC_TRACKS.map((track, index) => {
                  const isActive = index === trackIndex;
                  return (
                    <button
                      key={track.id}
                      type="button"
                      onClick={() => void playTrack(index)}
                      className={`group/track flex w-full min-w-0 items-center gap-2 border px-1.5 py-1 text-left transition-all active:scale-[0.99] ${
                        isActive
                          ? 'border-red-700/60 bg-red-700/10 text-red-900 shadow-[inset_3px_0_0_#b91c1c]'
                          : 'border-ink/15 bg-ink/[0.03] hover:border-ink/30 hover:bg-ink/[0.07]'
                      }`}
                    >
                      <span className={`flex h-5 w-5 shrink-0 items-center justify-center border text-[7px] font-black ${isActive ? 'border-red-700/40 bg-red-700 text-white' : 'border-ink/20 bg-paper'}`}>
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[9px] font-black tracking-wide">{track.title}</span>
                        <span className="block truncate text-[7px] font-bold tracking-wide opacity-55">{track.artist}</span>
                      </span>
                      {isActive && <Equalizer isPlaying={isPlaying} />}
                    </button>
                  );
                })}
              </div>

              <label className="mb-2 flex items-center gap-2 text-[8px] font-bold tracking-widest opacity-75">
                <span className="w-8 tabular-nums">{formatTime(currentTime)}</span>
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  step="0.1"
                  value={Math.min(currentTime, duration || 0)}
                  onChange={(event) => musicEngine.seek(Number(event.target.value))}
                  className="case-radio-range w-full cursor-pointer"
                  style={{ '--radio-progress': `${progress}%` } as CSSProperties}
                  aria-label="Song position"
                  disabled={!duration}
                />
                <span className="w-8 text-right tabular-nums">{formatTime(duration)}</span>
              </label>

              <div className="flex items-center justify-center gap-2.5 border-y border-ink/15 bg-ink/[0.025] py-1.5">
                <button type="button" onClick={() => void shuffleTrack()} className="rounded-full p-2 opacity-60 transition-all hover:bg-ink/10 hover:opacity-100 active:scale-90" aria-label="Shuffle track">
                  <Shuffle className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => void moveTrack(-1)} className="rounded-full p-2 opacity-70 transition-all hover:bg-ink/10 hover:opacity-100 active:scale-90" aria-label="Previous track">
                  <SkipBack className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => void togglePlayback()}
                  className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-ink bg-ink text-paper shadow-[0_2px_0_rgba(0,0,0,0.25)] transition-all hover:scale-105 hover:bg-red-800 active:translate-y-0.5 active:scale-95 active:shadow-none"
                  aria-label={isPlaying ? 'Pause music' : 'Play music'}
                >
                  {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="ml-0.5 h-5 w-5 fill-current" />}
                </button>
                <button type="button" onClick={() => void moveTrack(1)} className="rounded-full p-2 opacity-70 transition-all hover:bg-ink/10 hover:opacity-100 active:scale-90" aria-label="Next track">
                  <SkipForward className="h-5 w-5" />
                </button>
              </div>

            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}

function formatTime(time: number) {
  if (!Number.isFinite(time) || time <= 0) return '0:00';
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function Cassette({ isPlaying, trackNumber }: { isPlaying: boolean; trackNumber: number }) {
  return (
    <div className="relative h-[54px] w-[68px] shrink-0 rotate-[-1deg] border-2 border-zinc-950 bg-[#d5bd84] p-1 shadow-[2px_2px_0_rgba(0,0,0,0.2)]">
      <div className="absolute left-2 top-1 text-[6px] font-black tracking-[0.18em] text-zinc-900/60">MMA // {String(trackNumber).padStart(2, '0')}</div>
      <div className="mt-2 flex h-6 items-center justify-around border border-zinc-800/50 bg-[#eee2c4] px-1">
        {[0, 1].map((reel) => (
          <Disc3
            key={reel}
            className={`h-4 w-4 text-zinc-900 ${isPlaying ? 'case-radio-reel' : ''}`}
            style={{ animationDelay: `${reel * -450}ms` }}
          />
        ))}
      </div>
      <div className="mx-auto mt-1 h-1.5 w-10 border-x-[6px] border-b-2 border-x-transparent border-b-zinc-900/70" />
      <span className="absolute bottom-0.5 right-1.5 text-[5px] font-black tracking-widest text-red-800">CLASSIFIED</span>
    </div>
  );
}

function MiniCassette({ isPlaying }: { isPlaying: boolean }) {
  return (
    <span className="relative flex h-10 w-[60px] items-center justify-around border border-[#d5bd84] bg-[#d5bd84] px-1.5 shadow-inner">
      <span className="absolute left-1 top-0.5 text-[4px] font-black tracking-widest text-zinc-900/60">MMA</span>
      {[0, 1].map((reel) => (
        <Disc3
          key={reel}
          className={`mt-1 h-5 w-5 text-zinc-900 ${isPlaying ? 'case-radio-reel' : ''}`}
          style={{ animationDelay: `${reel * -450}ms` }}
        />
      ))}
      <span className="absolute bottom-1 left-1/2 h-0.5 w-8 -translate-x-1/2 bg-red-800/70" />
    </span>
  );
}

function Equalizer({ isPlaying }: { isPlaying: boolean }) {
  return (
    <span className="ml-1 flex h-5 shrink-0 items-end gap-0.5" aria-hidden="true">
      {[45, 80, 60].map((height, index) => (
        <span
          key={height}
          className={`w-0.5 bg-red-500 ${isPlaying ? 'case-radio-level' : 'opacity-40'}`}
          style={{ height: `${height}%`, animationDelay: `${index * -120}ms` }}
        />
      ))}
    </span>
  );
}

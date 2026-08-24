import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

import { audioEngine } from '../lib/audio';
import {
  MUSIC_THEME_ARTWORK,
  MUSIC_TRACKS,
  musicEngine,
  type MusicTheme,
  type MusicTrack,
  type MusicVisual,
} from '../lib/music';

type Theme = 'color' | 'noir';

interface ThemeContextType {
  theme: Theme;
  /** Active music theme ID (e.g. 'am-i-dreaming', 'sunflower', 'quicksilver', 'starman') for current track. */
  musicTheme: MusicTheme | null;
  /** Current track object (gives components access to track id, visual GIF/video overlay, theme, etc.). */
  activeMusicTrack: MusicTrack | null;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const preloadedMusicVisuals = new Map<string, HTMLImageElement | HTMLVideoElement>();
const preloadedThemeArtwork = new Map<MusicTheme, HTMLImageElement>();

const preloadMusicVisual = (visual: MusicVisual, priority: 'high' | 'low') => {
  if (visual.type !== 'image') return;
  const source = encodeURI(visual.src);
  if (preloadedMusicVisuals.has(source)) return;

  const image = new Image();
  image.decoding = 'async';
  image.fetchPriority = priority;
  preloadedMusicVisuals.set(source, image);
  image.src = source;
  void image.decode().catch(() => undefined);
};

const preloadThemeArtwork = (theme: MusicTheme, priority: 'high' | 'low') => {
  if (preloadedThemeArtwork.has(theme)) return;

  const image = new Image();
  image.decoding = 'async';
  image.fetchPriority = priority;
  preloadedThemeArtwork.set(theme, image);
  image.src = MUSIC_THEME_ARTWORK[theme];
  void image.decode().catch(() => undefined);
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('app-theme-mode');
    return saved === 'noir' ? 'noir' : 'color';
  });

  // Track state sourced directly from musicEngine snapshot
  const [activeMusicTrack, setActiveMusicTrack] = useState<MusicTrack | null>(
    () => MUSIC_TRACKS[0] ?? null
  );
  const [isPlaying, setIsPlaying] = useState(false);

  const musicTheme = isPlaying ? (activeMusicTrack?.theme ?? null) : null;
  const previousMusicTheme = useRef<MusicTheme | null>(null);

  // Persist & apply color/noir toggle.
  useEffect(() => {
    localStorage.setItem('app-theme-mode', theme);
    if (theme === 'noir') {
      document.documentElement.classList.add('theme-noir');
    } else {
      document.documentElement.classList.remove('theme-noir');
    }
  }, [theme]);

  // Subscribe to musicEngine: updates activeMusicTrack on any track change or selection.
  useEffect(() => {
    return musicEngine.subscribe((snapshot) => {
      const currentTrack = MUSIC_TRACKS[snapshot.trackIndex] ?? null;
      setActiveMusicTrack(currentTrack);
      setIsPlaying(snapshot.isPlaying);
    });
  }, []);


  // Preload assets for current track & peek ahead at upcoming tracks.
  useEffect(() => {
    if (!activeMusicTrack) return;

    if (activeMusicTrack.visual) preloadMusicVisual(activeMusicTrack.visual, 'high');
    if (activeMusicTrack.theme) preloadThemeArtwork(activeMusicTrack.theme, 'high');

    const currentIndex = MUSIC_TRACKS.findIndex((t) => t.id === activeMusicTrack.id);
    if (currentIndex === -1) return;

    const upcomingTracks = Array.from({ length: MUSIC_TRACKS.length - 1 }, (_, offset) =>
      MUSIC_TRACKS[(currentIndex + offset + 1) % MUSIC_TRACKS.length]
    );
    const nextVisual = upcomingTracks.find((track) => track.visual)?.visual;
    const nextTheme = upcomingTracks.find((track) => track.theme)?.theme;
    if (!nextVisual && !nextTheme) return;

    const idleWindow = window as typeof window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
      cancelIdleCallback?: (handle: number) => void;
    };
    let idleHandle: number | undefined;
    let fallbackTimer: number | undefined;

    const preloadUpcomingAssets = () => {
      if (nextVisual) preloadMusicVisual(nextVisual, 'low');
      if (nextTheme) preloadThemeArtwork(nextTheme, 'low');
    };

    if (idleWindow.requestIdleCallback) {
      idleHandle = idleWindow.requestIdleCallback(preloadUpcomingAssets, { timeout: 1800 });
    } else {
      fallbackTimer = window.setTimeout(preloadUpcomingAssets, 700);
    }

    return () => {
      if (idleHandle !== undefined) idleWindow.cancelIdleCallback?.(idleHandle);
      if (fallbackTimer !== undefined) window.clearTimeout(fallbackTimer);
    };
  }, [activeMusicTrack]);

  // Apply / remove music-theme CSS classes on <html>.
  // Runs whenever musicTheme changes to trigger smooth theme transitions.
  useEffect(() => {
    const root = document.documentElement;
    const musicThemeClasses = [
      'music-theme-am-i-dreaming',
      'music-theme-sunflower',
      'music-theme-quicksilver',
      'music-theme-starman',
    ] as const;

    // Remove old music theme classes and add the active one
    root.classList.remove(...musicThemeClasses);
    if (musicTheme) {
      root.classList.add(`music-theme-${musicTheme}`);
    }

    // Trigger transition class only when theme actually changes (not on mount)
    let transitionFrame: number | undefined;
    let transitionTimer: number | undefined;
    if (previousMusicTheme.current !== musicTheme && (previousMusicTheme.current || musicTheme)) {
      root.classList.remove('music-theme-transition');
      transitionFrame = window.requestAnimationFrame(() => {
        root.classList.add('music-theme-transition');
        transitionTimer = window.setTimeout(
          () => root.classList.remove('music-theme-transition'),
          520
        );
      });
    }
    previousMusicTheme.current = musicTheme;

    return () => {
      if (transitionFrame !== undefined) window.cancelAnimationFrame(transitionFrame);
      if (transitionTimer !== undefined) window.clearTimeout(transitionTimer);
    };
  }, [musicTheme]);

  const toggleTheme = () => {
    audioEngine.init();
    audioEngine.playSwitch();
    setTheme((t) => (t === 'color' ? 'noir' : 'color'));
  };

  return (
    <ThemeContext.Provider value={{ theme, musicTheme, activeMusicTrack, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

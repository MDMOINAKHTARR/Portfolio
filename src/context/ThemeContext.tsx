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
  musicTheme: MusicTheme | null;
  activeMusicTrack: MusicTrack | null;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const preloadedMusicVisuals = new Map<string, HTMLImageElement | HTMLVideoElement>();
const preloadedThemeArtwork = new Map<MusicTheme, HTMLImageElement>();

const preloadMusicVisual = (visual: MusicVisual, priority: 'high' | 'low') => {
  const source = encodeURI(visual.src);
  if (preloadedMusicVisuals.has(source)) return;

  if (visual.type === 'image') {
    const image = new Image();
    image.decoding = 'async';
    image.fetchPriority = priority;
    preloadedMusicVisuals.set(source, image);
    image.src = source;
    void image.decode().catch(() => undefined);
    return;
  }

  const video = document.createElement('video');
  video.preload = 'auto';
  video.muted = true;
  video.src = source;
  preloadedMusicVisuals.set(source, video);
  video.load();
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
    return (saved as Theme) || 'color';
  });
  const [activeMusicTrack, setActiveMusicTrack] = useState<MusicTrack | null>(null);
  const [selectedTrackIndex, setSelectedTrackIndex] = useState(0);
  const musicTheme = activeMusicTrack?.theme ?? null;
  const previousMusicTheme = useRef<MusicTheme | null>(null);

  useEffect(() => {
    localStorage.setItem('app-theme-mode', theme);
    if (theme === 'noir') {
      document.documentElement.classList.add('theme-noir');
    } else {
      document.documentElement.classList.remove('theme-noir');
    }
  }, [theme]);

  useEffect(() => musicEngine.subscribe((snapshot) => {
    setSelectedTrackIndex(snapshot.trackIndex);
    setActiveMusicTrack(snapshot.isPlaying ? MUSIC_TRACKS[snapshot.trackIndex] : null);
  }), []);

  useEffect(() => {
    const selectedTrack = MUSIC_TRACKS[selectedTrackIndex];
    const selectedVisual = selectedTrack.visual;
    if (selectedVisual) preloadMusicVisual(selectedVisual, 'high');
    if (selectedTrack.theme) preloadThemeArtwork(selectedTrack.theme, 'high');

    const upcomingTracks = Array.from({ length: MUSIC_TRACKS.length - 1 }, (_, offset) => (
      MUSIC_TRACKS[(selectedTrackIndex + offset + 1) % MUSIC_TRACKS.length]
    ));
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
  }, [selectedTrackIndex]);

  useEffect(() => {
    const root = document.documentElement;
    const musicThemeClasses = [
      'music-theme-am-i-dreaming',
      'music-theme-sunflower',
      'music-theme-quicksilver',
      'music-theme-starman',
    ];
    root.classList.remove(...musicThemeClasses);

    if (musicTheme) {
      root.classList.add(`music-theme-${musicTheme}`);
    }

    let transitionFrame: number | undefined;
    let transitionTimer: number | undefined;
    if (previousMusicTheme.current !== musicTheme && (previousMusicTheme.current || musicTheme)) {
      root.classList.remove('music-theme-transition');
      transitionFrame = window.requestAnimationFrame(() => {
        root.classList.add('music-theme-transition');
        transitionTimer = window.setTimeout(() => root.classList.remove('music-theme-transition'), 520);
      });
    }
    previousMusicTheme.current = musicTheme;

    return () => {
      if (transitionFrame) window.cancelAnimationFrame(transitionFrame);
      if (transitionTimer) window.clearTimeout(transitionTimer);
      root.classList.remove('music-theme-transition', ...musicThemeClasses);
    };
  }, [musicTheme]);

  const toggleTheme = () => {
    audioEngine.init();
    audioEngine.playSwitch();
    setTheme(t => t === 'color' ? 'noir' : 'color');
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

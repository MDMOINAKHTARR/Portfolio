import React, { type CSSProperties } from 'react';
import { motion } from 'motion/react';
import { useTheme } from '../context/ThemeContext';
import { MUSIC_THEME_ARTWORK, type MusicTheme } from '../lib/music';

type ArtworkPieceKind = 'building' | 'flower' | 'roller' | 'chrome' | 'cape' | 'cloud' | 'crystal' | 'hero';
type ArtworkMotion = 'float-a' | 'float-b' | 'tilt' | 'sway' | 'pulse' | 'rush-left' | 'rush-right' | 'flutter' | 'drift' | 'glint' | 'hero-flight';

interface ArtworkPiece {
  id: string;
  kind: ArtworkPieceKind;
  motion: ArtworkMotion;
  x: number;
  y: number;
  width: number;
  height: number;
  duration: number;
  delay: number;
  origin?: string;
}

const THEME_ARTWORK_PIECES: Record<MusicTheme, readonly ArtworkPiece[]> = {
  'am-i-dreaming': [
    { id: 'dream-building-northwest', kind: 'building', motion: 'float-a', x: 0, y: 0, width: 27, height: 30, duration: 5.4, delay: -1.2 },
    { id: 'dream-building-west', kind: 'building', motion: 'tilt', x: 0, y: 27, width: 25, height: 34, duration: 6.1, delay: -3.4, origin: '12% 86%' },
    { id: 'dream-building-southwest', kind: 'building', motion: 'float-b', x: 0, y: 58, width: 36, height: 42, duration: 5.8, delay: -2.1, origin: '22% 100%' },
    { id: 'dream-building-north', kind: 'building', motion: 'float-b', x: 32, y: 0, width: 30, height: 21, duration: 7.2, delay: -4.8, origin: '50% 0%' },
    { id: 'dream-building-northeast', kind: 'building', motion: 'pulse', x: 62, y: 0, width: 38, height: 39, duration: 5.1, delay: -2.7, origin: '72% 38%' },
    { id: 'dream-building-east', kind: 'building', motion: 'tilt', x: 72, y: 31, width: 28, height: 32, duration: 6.4, delay: -1.7, origin: '100% 62%' },
    { id: 'dream-building-southeast', kind: 'building', motion: 'float-a', x: 58, y: 61, width: 42, height: 39, duration: 5.6, delay: -3.9, origin: '78% 100%' },
  ],
  sunflower: [
    { id: 'sunflower-left-large', kind: 'flower', motion: 'sway', x: 0, y: 37, width: 24, height: 37, duration: 4.9, delay: -1.5, origin: '42% 88%' },
    { id: 'sunflower-right-large', kind: 'flower', motion: 'sway', x: 77, y: 40, width: 23, height: 39, duration: 5.7, delay: -3.1, origin: '60% 92%' },
    { id: 'sunflower-right-small', kind: 'flower', motion: 'pulse', x: 67, y: 69, width: 22, height: 31, duration: 4.5, delay: -2.4, origin: '55% 90%' },
    { id: 'sunflower-roller-top', kind: 'roller', motion: 'tilt', x: 0, y: 0, width: 24, height: 35, duration: 4.2, delay: -1.8, origin: '20% 65%' },
    { id: 'sunflower-roller-bottom', kind: 'roller', motion: 'float-b', x: 73, y: 72, width: 27, height: 28, duration: 5.3, delay: -3.6, origin: '75% 82%' },
    { id: 'sunflower-city-west', kind: 'building', motion: 'float-a', x: 0, y: 9, width: 19, height: 35, duration: 6.3, delay: -4.2, origin: '0% 70%' },
    { id: 'sunflower-city-south', kind: 'building', motion: 'float-b', x: 22, y: 62, width: 29, height: 38, duration: 7.1, delay: -2.9, origin: '50% 100%' },
  ],
  quicksilver: [
    { id: 'chrome-upper-left', kind: 'chrome', motion: 'rush-right', x: 0, y: 0, width: 44, height: 34, duration: 3.8, delay: -1.4, origin: '0% 30%' },
    { id: 'chrome-upper-right', kind: 'chrome', motion: 'rush-left', x: 53, y: 0, width: 47, height: 47, duration: 4.4, delay: -2.7, origin: '100% 28%' },
    { id: 'chrome-east-burst', kind: 'chrome', motion: 'pulse', x: 72, y: 20, width: 28, height: 57, duration: 3.3, delay: -1.1, origin: '100% 52%' },
    { id: 'chrome-lower-right', kind: 'chrome', motion: 'rush-left', x: 62, y: 50, width: 38, height: 50, duration: 4.1, delay: -3.2, origin: '100% 82%' },
    { id: 'chrome-lower-left', kind: 'chrome', motion: 'rush-right', x: 0, y: 58, width: 57, height: 42, duration: 4.7, delay: -2.2, origin: '0% 84%' },
    { id: 'chrome-middle-left', kind: 'chrome', motion: 'float-a', x: 0, y: 27, width: 38, height: 43, duration: 5.2, delay: -4.1, origin: '0% 55%' },
    { id: 'chrome-vanishing-point', kind: 'chrome', motion: 'glint', x: 55, y: 37, width: 24, height: 30, duration: 2.9, delay: -1.9, origin: '72% 52%' },
  ],
  starman: [
    { id: 'starman-cape-top', kind: 'cape', motion: 'flutter', x: 0, y: 0, width: 56, height: 38, duration: 4.2, delay: -1.4, origin: '0% 18%' },
    { id: 'starman-cape-west', kind: 'cape', motion: 'sway', x: 0, y: 19, width: 33, height: 51, duration: 5.1, delay: -3.3, origin: '0% 72%' },
    { id: 'starman-cape-south', kind: 'cape', motion: 'flutter', x: 0, y: 76, width: 69, height: 24, duration: 4.7, delay: -2.6, origin: '18% 100%' },
    { id: 'starman-cloud-west', kind: 'cloud', motion: 'drift', x: 5, y: 31, width: 38, height: 49, duration: 7.8, delay: -4.5, origin: '20% 70%' },
    { id: 'starman-cloud-east', kind: 'cloud', motion: 'float-b', x: 67, y: 23, width: 33, height: 58, duration: 6.9, delay: -2.1, origin: '86% 70%' },
    { id: 'starman-crystal-west-one', kind: 'crystal', motion: 'glint', x: 0, y: 56, width: 8, height: 44, duration: 3.6, delay: -1.3, origin: '45% 100%' },
    { id: 'starman-crystal-west-two', kind: 'crystal', motion: 'tilt', x: 4, y: 67, width: 12, height: 33, duration: 4.4, delay: -3.5, origin: '50% 100%' },
    { id: 'starman-crystal-east-one', kind: 'crystal', motion: 'glint', x: 79, y: 51, width: 10, height: 44, duration: 3.1, delay: -2.2, origin: '50% 100%' },
    { id: 'starman-crystal-east-two', kind: 'crystal', motion: 'tilt', x: 87, y: 40, width: 13, height: 55, duration: 4.8, delay: -1.7, origin: '55% 100%' },
    { id: 'starman-hero', kind: 'hero', motion: 'hero-flight', x: 84, y: 4, width: 12, height: 17, duration: 4.1, delay: -2.9, origin: '58% 55%' },
  ],
};

type PieceStyle = CSSProperties & {
  '--art-image-width': string;
  '--art-image-height': string;
  '--art-image-left': string;
  '--art-image-top': string;
};

const getPieceStyle = (piece: ArtworkPiece): PieceStyle => ({
  left: `${piece.x}%`,
  top: `${piece.y}%`,
  width: `${piece.width}%`,
  height: `${piece.height}%`,
  transformOrigin: piece.origin ?? '50% 50%',
  animationDuration: `${piece.duration}s`,
  animationDelay: `${piece.delay}s`,
  '--art-image-width': `${10000 / piece.width}%`,
  '--art-image-height': `${10000 / piece.height}%`,
  '--art-image-left': `${(-piece.x / piece.width) * 100}%`,
  '--art-image-top': `${(-piece.y / piece.height) * 100}%`,
});

export function BackgroundElements() {
  const { musicTheme, activeMusicTrack } = useTheme();

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden print:hidden">
      {/* Wood Texture Background */}
      <div 
        className="desk-wood-texture absolute inset-0 z-0 opacity-40 mix-blend-multiply"
        style={{
          backgroundImage: `url("https://www.transparenttextures.com/patterns/wood-pattern.png")`,
          backgroundRepeat: 'repeat'
        }}
      />

      {/* Song-specific static textures: visually rich without continuous repaints. */}
      <div className="music-theme-texture absolute inset-0 z-0" aria-hidden="true" />

      {musicTheme && (
        <div className={`music-theme-motion music-theme-motion--${musicTheme} absolute inset-0 z-0`} aria-hidden="true">
          <div className="music-theme-artboard">
            {THEME_ARTWORK_PIECES[musicTheme].map((piece) => (
              <span
                key={piece.id}
                className={`music-theme-piece music-theme-piece--${piece.kind} music-theme-piece--${piece.motion}`}
                style={getPieceStyle(piece)}
              >
                <img src={MUSIC_THEME_ARTWORK[musicTheme]} alt="" draggable={false} />
              </span>
            ))}
          </div>
        </div>
      )}

      {musicTheme && (
        <div className={`music-ambient-light music-ambient-light--${musicTheme} absolute inset-0 z-0`} aria-hidden="true" />
      )}

      {activeMusicTrack && (
        <div className="ambient-waveform absolute bottom-10 left-1/2 z-0 flex -translate-x-1/2 items-end gap-1 opacity-20" aria-hidden="true">
          {[34, 62, 45, 78, 52, 88, 66, 42, 74, 48, 82, 38].map((height, index) => (
            <span key={`${height}-${index}`} style={{ height: `${height}%`, animationDelay: `${index * -90}ms` }} />
          ))}
        </div>
      )}
      
      {/* Subtle vignette/shadow around the edges of the desk */}
      <div className="desk-edge-vignette absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.5)] z-0" />
      
      {/* Texture overlay */}
      <div className="absolute inset-0 bg-texture mix-blend-overlay opacity-30 z-0" />

      {/* Decorative minimalistic lines / framing */}
      <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-slate-500/20 z-0" />
      <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-slate-500/20 z-0" />
      <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-slate-500/20 z-0" />
      <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-slate-500/20 z-0" />

      {/* Subtle classified watermark */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.03 }}
        transition={{ duration: 2 }}
        className="absolute bottom-12 left-12 font-stamp text-6xl md:text-8xl text-ink tracking-widest transform -rotate-12 select-none z-0"
      >
        TOP SECRET
      </motion.div>

      {/* Coordinates / Meta text */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 font-typewriter text-[10px] text-slate-500/30 tracking-[0.2em] uppercase select-none z-0">
        SYS.REQ // DIRECTIVE: ARCHIVE
      </div>
    </div>
  );
}

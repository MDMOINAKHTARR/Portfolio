import React, { type CSSProperties } from 'react';
import { motion } from 'motion/react';
import { useTheme } from '../context/ThemeContext';
import { MUSIC_THEME_ARTWORK, type MusicTheme } from '../lib/music';
import { slipDeskBackground } from '../lib/ink/textures';

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
    { id: 'sunflower-top-left', kind: 'flower', motion: 'sway', x: 0, y: 0, width: 23, height: 42, duration: 5.2, delay: -1.4, origin: '18% 22%' },
    { id: 'sunflower-bottom-left', kind: 'flower', motion: 'sway', x: 0, y: 62, width: 25, height: 38, duration: 5.6, delay: -2.8, origin: '22% 88%' },
    { id: 'sunflower-bottom-right', kind: 'flower', motion: 'sway', x: 82, y: 55, width: 18, height: 45, duration: 5.0, delay: -2.1, origin: '88% 85%' },
    { id: 'sunflower-brooklyn-rooftops', kind: 'building', motion: 'float-a', x: 0, y: 40, width: 34, height: 58, duration: 6.8, delay: -3.5, origin: '10% 80%' },
    { id: 'sunflower-brooklyn-bridge', kind: 'building', motion: 'float-b', x: 63, y: 2, width: 37, height: 92, duration: 7.4, delay: -2.4, origin: '88% 45%' },
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
  const { musicTheme, theme } = useTheme();
  const isSlipDesk = !musicTheme && theme !== 'noir';

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden print:hidden">
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

      {/* Sunflower Golden-Hour Sunburst & Drifting Pollen Bokeh */}
      {musicTheme === 'sunflower' && (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
          {/* Upper-right golden sun-flare */}
          <div
            className="absolute -top-24 -right-24 w-[420px] h-[420px] sm:w-[560px] sm:h-[560px] rounded-full opacity-75 mix-blend-screen"
            style={{
              background:
                'radial-gradient(circle, rgba(254, 240, 138, 0.65) 0%, rgba(251, 191, 36, 0.38) 32%, rgba(234, 88, 12, 0.14) 58%, transparent 76%)',
            }}
          />
          {/* Lower-left warm amber horizon glow */}
          <div
            className="absolute -bottom-28 -left-24 w-[460px] h-[460px] sm:w-[620px] sm:h-[620px] rounded-full opacity-65 mix-blend-screen"
            style={{
              background:
                'radial-gradient(circle, rgba(251, 191, 36, 0.42) 0%, rgba(234, 88, 12, 0.24) 42%, transparent 74%)',
            }}
          />
        </div>
      )}

      {/* Slip Stock Desk Surface Texture or Charcoal Felt for Noir */}
      {isSlipDesk ? (
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={slipDeskBackground('#224836', { seed: 'site-desk-canvas' })}
          aria-hidden="true"
        />
      ) : (
        <>
          {/* Matte Charcoal Felt / Wool Desk Pad micro-weave grain */}
          <div
            className="desk-wood-texture absolute inset-0 z-0 opacity-90"
            style={{
              backgroundImage: [
                'radial-gradient(ellipse 65% 55% at 10% 8%, rgba(255, 214, 153, 0.12) 0%, rgba(255, 192, 118, 0.045) 40%, transparent 72%)',
                'repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.014) 0px, rgba(255, 255, 255, 0.014) 1px, rgba(0, 0, 0, 0.09) 1px, rgba(0, 0, 0, 0.09) 2px)',
                'repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.012) 0px, rgba(255, 255, 255, 0.012) 1px, rgba(0, 0, 0, 0.07) 1px, rgba(0, 0, 0, 0.07) 3px)',
                'repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.008) 0px, rgba(255, 255, 255, 0.008) 1px, transparent 1px, transparent 4px)',
              ].join(', '),
            }}
            aria-hidden="true"
          />

          {/* Fine wool fiber noise texture overlay */}
          <div className="absolute inset-0 bg-texture mix-blend-overlay opacity-35 z-0" aria-hidden="true" />
        </>
      )}

      {/* Subtle classified watermark */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.025 }}
        transition={{ duration: 2 }}
        className="absolute bottom-12 left-12 font-stamp text-6xl md:text-8xl text-ink tracking-widest transform -rotate-12 select-none z-0"
      >
        TOP SECRET
      </motion.div>
    </div>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { MUSIC_TRACKS, musicEngine, type MusicTrack } from '../lib/music';

const CRT_TV_TRACK_IDS = ['bully-maguire', 'raindrops', 'come-and-get-your-love', 'im-amazing'];

// All video src paths used by the CRT TV widget — preloaded silently on mount
const CRT_TV_VIDEO_SRCS = MUSIC_TRACKS
  .filter((t) => CRT_TV_TRACK_IDS.includes(t.id) && t.visual?.type === 'video')
  .map((t) => t.visual!.src);

// Also grab any track whose audio src is a video (e.g. bully-maguire.mp4 doubles as audio+video)
const CRT_TV_AUDIO_VIDEO_SRCS = MUSIC_TRACKS
  .filter((t) => CRT_TV_TRACK_IDS.includes(t.id) && t.src.endsWith('.mp4'))
  .map((t) => t.src);

const ALL_TV_PRELOAD_SRCS = [...new Set([...CRT_TV_VIDEO_SRCS, ...CRT_TV_AUDIO_VIDEO_SRCS])];

/** Silently preloads all CRT TV video files as soon as the app mounts. */
export function VideoPreloader() {
  const videoRefs = useRef<HTMLVideoElement[]>([]);

  useEffect(() => {
    // Create hidden video elements that instruct the browser to download & cache the files
    videoRefs.current = ALL_TV_PRELOAD_SRCS.map((src) => {
      const v = document.createElement('video');
      v.src = src;
      v.preload = 'auto';
      v.muted = true;
      v.style.display = 'none';
      v.style.position = 'absolute';
      v.style.pointerEvents = 'none';
      v.setAttribute('aria-hidden', 'true');
      document.body.appendChild(v);
      // Load just enough to fill decode buffers — we don't need to play
      v.load();
      return v;
    });

    return () => {
      videoRefs.current.forEach((v) => {
        v.pause();
        v.removeAttribute('src');
        v.load();
        v.remove();
      });
      videoRefs.current = [];
    };
  }, []);

  return null;
}

export function CrtTvWidget() {
  const [playing, setPlaying] = useState(false);
  const [show, setShow] = useState(false);
  const [currentTvTrack, setCurrentTvTrack] = useState<MusicTrack | null>(() => {
    return MUSIC_TRACKS.find((t) => t.id === 'bully-maguire') ?? null;
  });
  const trackIdxRef = useRef(-1);

  useEffect(() => {
    return musicEngine.subscribe((s) => {
      const isInitialMount = trackIdxRef.current === -1;
      const isNew = s.trackIndex !== trackIdxRef.current;
      const track = MUSIC_TRACKS[s.trackIndex];
      const isTvTrack = CRT_TV_TRACK_IDS.includes(track?.id);

      if (isTvTrack) {
        setCurrentTvTrack(track);
        const isTvOffByUser = typeof window !== 'undefined' && localStorage.getItem('crt_tv_off') === 'true';
        if (isInitialMount) {
          if (isTvOffByUser) {
            setShow(false);
          } else {
            setShow(true);
          }
        } else if (isNew) {
          // When user selects a new video track, open the TV
          setShow(true);
          if (typeof window !== 'undefined') {
            localStorage.removeItem('crt_tv_off');
          }
        }
      } else {
        // Automatically close TV when any song without a TV video is played
        setShow(false);
      }
      trackIdxRef.current = s.trackIndex;
      setPlaying(s.isPlaying);
    });
  }, []);

  const handleClose = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('crt_tv_off', 'true');
    }
    setShow(false);
  };

  if (!currentTvTrack) return null;

  return typeof document !== 'undefined'
    ? createPortal(
        <AnimatePresence>
          {show && (
            <motion.div
              key="tv-portal-wrapper"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9998,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Background Filter Overlay */}
              <motion.div
                key="tv-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(0, 0, 0, 0.45)',
                  backdropFilter: 'blur(4px) brightness(0.75)',
                  WebkitBackdropFilter: 'blur(4px) brightness(0.75)',
                }}
                onClick={handleClose}
              />

              {/* TV Unit */}
              <motion.div
                key="tv-unit"
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.88 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  position: 'relative',
                  zIndex: 1,
                  pointerEvents: 'auto',
                }}
              >
                <VintageTv track={currentTvTrack} playing={playing} onClose={handleClose} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )
    : null;
}

/* ─── Vintage Walnut TV ─── */
function VintageTv({
  track,
  playing,
  onClose,
}: {
  track: MusicTrack;
  playing: boolean;
  onClose: () => void;
}) {
  const vidRef = useRef<HTMLVideoElement>(null);
  const vidBigRef = useRef<HTMLVideoElement>(null);
  const [expanded, setExpanded] = useState(() => track.id === 'im-amazing');
  const [ended, setEnded] = useState(false);
  const [vol, setVol] = useState(0.7);
  const [volAngle, setVolAngle] = useState(140);

  const videoSrc = track.visual?.src ?? '';

  // Start video on mount or track switch
  useEffect(() => {
    setEnded(false);
    if (track.id === 'im-amazing') {
      setExpanded(true);
    }
    vidRef.current?.play().catch(() => {});
  }, [track.id]);

  useEffect(() => {
    if (expanded) {
      vidBigRef.current?.play().catch(() => {});
    }
  }, [expanded, track.id]);

  // Periodically check drift between video currentTime and audio engine when TV is playing
  useEffect(() => {
    if (!playing) return;

    const syncInterval = setInterval(() => {
      const audioTime = musicEngine.getCurrentTime();
      const syncVideo = (v: HTMLVideoElement | null) => {
        if (!v || v.readyState < 2) return;
        // Only adjust if drift exceeds 0.6s to avoid constant video decoding seeks
        if (Math.abs(v.currentTime - audioTime) > 0.6) {
          v.currentTime = audioTime;
        }
      };
      syncVideo(vidRef.current);
      syncVideo(vidBigRef.current);
    }, 1000);

    return () => clearInterval(syncInterval);
  }, [playing]);

  // Subscribe to engine state for play/pause sync
  useEffect(() => {
    return musicEngine.subscribe((s) => {
      const currentTrack = MUSIC_TRACKS[s.trackIndex];
      if (!CRT_TV_TRACK_IDS.includes(currentTrack?.id)) return;

      const syncState = (v: HTMLVideoElement | null) => {
        if (!v) return;
        if (s.isPlaying && v.paused) v.play().catch(() => {});
        if (!s.isPlaying && !v.paused) v.pause();
      };
      syncState(vidRef.current);
      syncState(vidBigRef.current);
    });
  }, []);

  // Close TV on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (expanded) {
          setExpanded(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [expanded, onClose]);

  const replay = () => {
    setEnded(false);
    musicEngine.seek(0);
    const v = expanded ? vidBigRef.current : vidRef.current;
    if (v) {
      v.currentTime = 0;
      v.play().catch(() => {});
    }
  };

  const clickVol = () => {
    const next = (volAngle + 30) % 330;
    setVolAngle(next);
    const newVol = Math.max(0.05, Math.min(1, next / 300));
    setVol(newVol);
    musicEngine.setVolume(newVol);
  };

  return (
    <div style={{ pointerEvents: 'auto', position: 'relative' }}>
      <AnimatePresence mode="wait">
        {!expanded ? (
          <motion.div
            key={`tv-${track.id}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.35 }}
            style={{ width: 'min(82vw, 700px)', position: 'relative' }}
          >
            {/* ── ANTENNAS ── */}
            <div
              style={{
                position: 'absolute',
                top: -60,
                left: '48%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: 16,
                alignItems: 'flex-end',
                zIndex: 1,
              }}
            >
              {['-20deg', '-2deg', '20deg'].map((r, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    transform: `rotate(${r})`,
                    transformOrigin: 'bottom center',
                  }}
                >
                  <div
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: '50%',
                      background: 'radial-gradient(circle at 35% 35%,#ddd,#888)',
                      marginBottom: 1,
                    }}
                  />
                  <div
                    style={{
                      width: 2,
                      height: 56,
                      background: 'linear-gradient(to top,#777,#ccc)',
                      borderRadius: 1,
                    }}
                  />
                </div>
              ))}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: -8,
                  right: -8,
                  height: 6,
                  background: 'linear-gradient(180deg,#9a6030,#6a4020)',
                  borderRadius: 3,
                }}
              />
            </div>

            {/* ── TV BODY ── */}
            <div
              style={{
                background: 'linear-gradient(155deg,#b07840,#8a5828,#9a6432,#6a3e18)',
                borderRadius: 14,
                border: '2px solid #4a2e10',
                boxShadow:
                  '0 24px 64px rgba(0,0,0,0.85),inset 0 1px 0 rgba(255,255,255,0.15)',
                padding: '18px 14px 12px 18px',
                display: 'flex',
                gap: 12,
                position: 'relative',
              }}
            >
              {/* ── SCREEN ── */}
              <div style={{ flex: 1 }}>
                {/* Chrome bezel */}
                <div
                  style={{
                    background: 'linear-gradient(145deg,#c8c0b0,#807870,#b0a898,#787068)',
                    borderRadius: 10,
                    padding: 5,
                    boxShadow: 'inset 0 3px 8px rgba(0,0,0,0.6)',
                  }}
                >
                  <div style={{ background: '#080806', borderRadius: 6, padding: 4 }}>
                    {/* CRT screen */}
                    <div
                      onClick={() => setExpanded(true)}
                      title="Click to expand to full screen"
                      style={{
                        width: '100%',
                        aspectRatio: '4/3',
                        background: '#000',
                        borderRadius: '28px 32px 32px 28px / 20px 26px 26px 20px',
                        overflow: 'hidden',
                        position: 'relative',
                        cursor: 'pointer',
                        boxShadow: 'inset 0 0 60px rgba(0,0,0,0.9)',
                      }}
                    >
                      <video
                        key={videoSrc}
                        ref={vidRef}
                        src={videoSrc}
                        preload="auto"
                        muted
                        playsInline
                        autoPlay
                        onEnded={() => setEnded(true)}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <CrtFx />
                      {/* Glass highlight */}
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background:
                            'radial-gradient(ellipse at 36% 30%,rgba(255,255,255,0.08),transparent 56%)',
                          pointerEvents: 'none',
                        }}
                      />
                      {/* REC dot */}
                      {!ended && (
                        <div
                          style={{
                            position: 'absolute',
                            top: 6,
                            left: 8,
                            display: 'flex',
                            gap: 3,
                            alignItems: 'center',
                          }}
                        >
                          <div
                            style={{
                              width: 5,
                              height: 5,
                              borderRadius: '50%',
                              background: '#ff3b30',
                              boxShadow: '0 0 5px rgba(255,59,48,0.9)',
                            }}
                            className="animate-pulse"
                          />
                          <span
                            style={{
                              fontSize: 5.5,
                              fontWeight: 900,
                              color: 'rgba(255,80,60,0.9)',
                              fontFamily: 'monospace',
                              letterSpacing: '0.1em',
                            }}
                          >
                            REC // {track.codename}
                          </span>
                        </div>
                      )}
                      {ended ? (
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(0,0,0,0.7)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 8,
                              color: 'rgba(255,255,255,0.5)',
                              fontFamily: 'monospace',
                            }}
                          >
                            — END OF TAPE —
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              replay();
                            }}
                            style={{
                              padding: '4px 10px',
                              background: '#cc2200',
                              border: 'none',
                              borderRadius: 4,
                              color: '#fff',
                              fontSize: 8,
                              fontFamily: 'monospace',
                              cursor: 'pointer',
                              letterSpacing: '0.1em',
                            }}
                          >
                            ↺ REPLAY
                          </button>
                        </div>
                      ) : (
                        <div
                          style={{
                            position: 'absolute',
                            bottom: 5,
                            right: 8,
                            fontSize: 5.5,
                            color: 'rgba(255,255,255,0.3)',
                            fontFamily: 'monospace',
                          }}
                        >
                          ⊞ EXPAND
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── RIGHT CONTROLS ── */}
              <div
                style={{
                  width: 90,
                  flexShrink: 0,
                  background: 'linear-gradient(180deg, #2d241c 0%, #1e1711 50%, #130f0a 100%)',
                  borderRadius: 8,
                  border: '1.5px solid #3d2f20',
                  padding: '10px 8px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: 'inset 2px 3px 8px rgba(0,0,0,0.95), inset -1px -1px 2px rgba(255,255,255,0.08), 0 0 0 1px #0d0906',
                  position: 'relative',
                }}
              >
                {/* Corner Metallic Screws / Rivets */}
                <div style={{ position: 'absolute', top: 4, left: 5, width: 3.5, height: 3.5, borderRadius: '50%', background: 'radial-gradient(circle, #c5b596, #3d301e)', boxShadow: '0 0.5px 1px rgba(0,0,0,0.9)' }} />
                <div style={{ position: 'absolute', top: 4, right: 5, width: 3.5, height: 3.5, borderRadius: '50%', background: 'radial-gradient(circle, #c5b596, #3d301e)', boxShadow: '0 0.5px 1px rgba(0,0,0,0.9)' }} />
                <div style={{ position: 'absolute', bottom: 4, left: 5, width: 3.5, height: 3.5, borderRadius: '50%', background: 'radial-gradient(circle, #c5b596, #3d301e)', boxShadow: '0 0.5px 1px rgba(0,0,0,0.9)' }} />
                <div style={{ position: 'absolute', bottom: 4, right: 5, width: 3.5, height: 3.5, borderRadius: '50%', background: 'radial-gradient(circle, #c5b596, #3d301e)', boxShadow: '0 0.5px 1px rgba(0,0,0,0.9)' }} />

                {/* VOL — large 3D dial */}
                <ControlBlock label="VOLUME" hint="Click to adjust volume">
                  <BigDial angle={volAngle} onClick={clickVol} size={42} />
                </ControlBlock>

                <div style={{ width: '85%', height: 1.5, background: 'linear-gradient(90deg, transparent, #4a3b2a 20%, #4a3b2a 80%, transparent)', boxShadow: '0 1px 0 rgba(0,0,0,0.9)' }} />

                {/* REPLAY + EXPAND — 3D push buttons */}
                <div style={{ display: 'flex', gap: 6 }}>
                  <ControlBlock label="REPLAY" hint="Restart video from beginning">
                    <OldTvBtn onClick={replay}>↺</OldTvBtn>
                  </ControlBlock>
                  <ControlBlock label="EXPAND" hint="Expand to full screen">
                    <OldTvBtn onClick={() => setExpanded(true)}>⊞</OldTvBtn>
                  </ControlBlock>
                </div>

                <div style={{ width: '85%', height: 1.5, background: 'linear-gradient(90deg, transparent, #4a3b2a 20%, #4a3b2a 80%, transparent)', boxShadow: '0 1px 0 rgba(0,0,0,0.9)' }} />

                {/* Speaker grille */}
                <div style={{ display: 'flex', gap: 3.5, flex: 1, alignItems: 'center', width: '100%', padding: '0 4px' }}>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        width: 3.5,
                        flex: 1,
                        height: 42,
                        borderRadius: 1.5,
                        background: 'linear-gradient(180deg, #090705 0%, #16100a 100%)',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.95), 0 1px 0 rgba(255,255,255,0.08)',
                        borderTop: '0.5px solid rgba(0,0,0,0.9)',
                      }}
                    />
                  ))}
                </div>

                {/* POWER — 3D ruby lens button */}
                <ControlBlock label="POWER" hint="Turn off TV">
                  <OldTvBtn onClick={onClose} accent="#cc2200">
                    ⏻
                  </OldTvBtn>
                </ControlBlock>
              </div>
            </div>

            {/* Feet */}
            <div style={{ display: 'flex', justifyContent: 'space-around', padding: '0 32px' }}>
              {[0, 1].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 24,
                    height: 8,
                    background: 'linear-gradient(180deg,#6a3e18,#4a2a10)',
                    borderRadius: '0 0 5px 5px',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.5)',
                  }}
                />
              ))}
            </div>
          </motion.div>
        ) : (
          /* ── EXPANDED FULL-SCREEN VIDEO ── */
          <motion.div
            key={`expanded-${track.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: 'rgba(0,0,0,0.93)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'auto',
            }}
            onClick={() => setExpanded(false)}
          >
            <motion.div
              initial={{ scale: 0.7 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: 'min(94vw,1280px)',
                aspectRatio: '16/9',
                position: 'relative',
                borderRadius: 6,
                overflow: 'hidden',
                boxShadow: '0 0 120px rgba(0,0,0,1)',
              }}
            >
              <video
                key={`big-${videoSrc}`}
                ref={vidBigRef}
                src={videoSrc}
                preload="auto"
                muted
                playsInline
                autoPlay
                onEnded={() => {
                  setEnded(true);
                  setExpanded(false);
                }}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <CrtFx />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'radial-gradient(ellipse at 32% 28%,rgba(255,255,255,0.04),transparent 55%)',
                  pointerEvents: 'none',
                }}
              />
              {/* REC */}
              <div
                style={{
                  position: 'absolute',
                  top: 12,
                  left: 14,
                  display: 'flex',
                  gap: 5,
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: '#ff3b30',
                    boxShadow: '0 0 8px rgba(255,59,48,0.9)',
                  }}
                  className="animate-pulse"
                />
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 900,
                    color: 'rgba(255,80,60,0.95)',
                    fontFamily: 'monospace',
                    letterSpacing: '0.12em',
                  }}
                >
                  REC // LIVE FEED
                </span>
              </div>
              <div
                style={{
                  position: 'absolute',
                  bottom: 12,
                  left: 14,
                  fontSize: 8,
                  color: 'rgba(255,220,100,0.65)',
                  fontFamily: 'monospace',
                  letterSpacing: '0.12em',
                }}
              >
                {track.codename} // {track.title.toUpperCase()}
              </div>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                style={{
                  position: 'absolute',
                  top: 12,
                  right: 14,
                  width: 30,
                  height: 30,
                  borderRadius: 6,
                  background: 'rgba(0,0,0,0.6)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'rgba(255,255,255,0.7)',
                  cursor: 'pointer',
                  fontSize: 14,
                }}
                className="hover:!bg-black transition-colors"
              >
                ✕
              </button>
              <div
                style={{
                  position: 'absolute',
                  bottom: 12,
                  right: 14,
                  fontSize: 7,
                  color: 'rgba(255,255,255,0.25)',
                  fontFamily: 'monospace',
                }}
              >
                CLICK OUTSIDE OR ✕ TO COLLAPSE
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── CRT filter overlays ── */
function CrtFx() {
  return (
    <>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(255,0,0,0.05)',
          transform: 'translateX(1.5px)',
          mixBlendMode: 'screen',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,255,0.05)',
          transform: 'translateX(-1.5px)',
          mixBlendMode: 'screen',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'repeating-linear-gradient(0deg,rgba(0,0,0,0.13) 0,rgba(0,0,0,0.13) 1px,transparent 1px,transparent 3px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at center,transparent 48%,rgba(0,0,0,0.7) 100%)',
          pointerEvents: 'none',
        }}
      />
    </>
  );
}

/* ── Labelled control block ── */
function ControlBlock({
  label,
  hint,
  children,
}: {
  label: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}
      title={hint}
    >
      {children}
      <span
        style={{
          fontSize: 5,
          fontWeight: 700,
          color: '#5a4a30',
          fontFamily: 'monospace',
          letterSpacing: '0.15em',
        }}
      >
        {label}
      </span>
    </div>
  );
}

/* ── Large 3D metallic dial ── */
function BigDial({ angle, onClick, size }: { angle: number; onClick: () => void; size: number }) {
  return (
    <div style={{ position: 'relative', width: size + 6, height: size + 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Outer socket bezel / tick ring */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: 'linear-gradient(145deg, #18120c, #3a2e20)',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.95), 0 1px 1px rgba(255,255,255,0.1)',
        }}
      />

      <button
        type="button"
        onClick={onClick}
        aria-label="Volume dial"
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          cursor: 'pointer',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          /* Brushed metal conic sheen */
          background: 'conic-gradient(from 45deg at 50% 50%, #d8cbb8 0%, #8c7c68 25%, #e8dcc8 50%, #786955 75%, #d8cbb8 100%)',
          border: '2px solid #140e0a',
          boxShadow: `
            0 5px 10px rgba(0,0,0,0.85),
            0 2px 3px rgba(0,0,0,0.9),
            inset 0 2px 2px rgba(255,255,255,0.6),
            inset 0 -3px 4px rgba(0,0,0,0.7),
            0 0 0 2px #382c1e,
            0 0 0 3.5px #100b07
          `,
          transition: 'transform 0.15s ease, filter 0.15s ease',
        }}
        className="hover:brightness-110 active:scale-95 group"
      >
        {/* Tactile knurled edge ridges */}
        <div
          style={{
            position: 'absolute',
            inset: 1,
            borderRadius: '50%',
            background: 'repeating-conic-gradient(rgba(255,255,255,0.12) 0deg 4deg, rgba(0,0,0,0.3) 4deg 8deg)',
            mixBlendMode: 'overlay',
            pointerEvents: 'none',
          }}
        />

        {/* 3D Indicator Needle / Notch */}
        <div
          style={{
            position: 'absolute',
            top: '8%',
            left: '50%',
            width: 3.5,
            height: 10,
            borderRadius: 2,
            background: 'linear-gradient(180deg, #ffffff 0%, #e0d0b0 100%)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.8), 0 0 4px rgba(255,255,255,0.9)',
            transform: `translateX(-50%) rotate(${angle}deg)`,
            transformOrigin: '50% 210%',
            transition: 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        />

        {/* Multi-layered Center Cap */}
        <div
          style={{
            width: size * 0.42,
            height: size * 0.42,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, #f0e6d6 0%, #9e8e7c 65%, #594c3c 100%)',
            border: '1.5px solid #281e14',
            boxShadow: '0 2px 4px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
          }}
        >
          {/* Inner brass accent dot */}
          <div
            style={{
              width: size * 0.16,
              height: size * 0.16,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 35%, #ffd777, #997011)',
              boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.8), 0 1px 2px rgba(0,0,0,0.5)',
            }}
          />
        </div>
      </button>
    </div>
  );
}

/* ── Physical 3D old-TV push button ── */
function OldTvBtn({
  onClick,
  children,
  accent = '#2a2010',
}: {
  onClick: () => void;
  children: React.ReactNode;
  accent?: string;
}) {
  const isPower = accent === '#cc2200';

  return (
    <div
      style={{
        position: 'relative',
        padding: 2,
        borderRadius: 6,
        background: '#100c08',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.95), 0 1px 1px rgba(255,255,255,0.08)',
      }}
    >
      <button
        type="button"
        onClick={onClick}
        style={{
          width: 30,
          height: 30,
          borderRadius: 4,
          cursor: 'pointer',
          background: isPower
            ? 'radial-gradient(circle at 35% 30%, #ff4433 0%, #c91800 60%, #730000 100%)'
            : 'linear-gradient(180deg, #483d30 0%, #2a2218 50%, #1a140e 100%)',
          border: `1.5px solid ${isPower ? '#ff6655' : '#5c4c38'}`,
          boxShadow: isPower
            ? '0 4px 6px rgba(0,0,0,0.8), inset 0 1.5px 1px rgba(255,255,255,0.5), inset 0 -2px 3px rgba(0,0,0,0.6), 0 0 10px rgba(255,40,0,0.5)'
            : '0 4px 6px rgba(0,0,0,0.85), inset 0 1.5px 1px rgba(255,255,255,0.35), inset 0 -2px 3px rgba(0,0,0,0.7), inset 2px 0 2px rgba(255,255,255,0.1), inset -2px 0 2px rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isPower ? '#ffffff' : '#e6d5bc',
          fontSize: 14,
          fontWeight: 900,
          lineHeight: 1,
          textShadow: isPower
            ? '0 0 4px rgba(255,255,255,0.9)'
            : '0 1px 0 rgba(255,255,255,0.25), 0 -1px 1px rgba(0,0,0,0.9)',
          transition: 'transform 0.1s ease, boxShadow 0.1s ease, filter 0.1s ease',
          fontFamily: 'monospace',
        }}
        className="hover:brightness-125 active:translate-y-[2.5px] active:!shadow-[0_1px_2px_rgba(0,0,0,0.9),inset_0_2px_4px_rgba(0,0,0,0.8)]"
      >
        {children}
      </button>
    </div>
  );
}

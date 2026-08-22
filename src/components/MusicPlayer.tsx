import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, Pause, Play, Shuffle, SkipBack, SkipForward, Volume2, VolumeX, Disc2, Disc, Film } from 'lucide-react';
import { MUSIC_TRACKS, musicEngine } from '../lib/music';

const readNum = (k: string, fb: number) => { const v = Number(localStorage.getItem(k)); return Number.isFinite(v) ? v : fb; };
const readVol = () => { const v = readNum('case-radio-volume', 0.5); const ok = localStorage.getItem('case-radio-volume-v') === '2'; return (!ok && (v === 0 || v === 0.35)) ? 0.5 : Math.min(1, Math.max(0, v)); };
const ft = (t: number) => !Number.isFinite(t) || t <= 0 ? '0:00' : `${Math.floor(t / 60)}:${Math.floor(t % 60).toString().padStart(2, '0')}`;

const TRACK_ACCENTS = [
  '#7c3aed', // Am I Dreaming — royal violet
  '#d97706', // Sunflower — warm amber gold
  '#0284c7', // Let It Happen — deep sapphire
  '#059669', // Sweet Dreams — emerald
  '#dc2626', // Starman — ruby red
  '#b45309', // Raindrops — cognac gold
  '#991b1b', // Bully Maguire — burgundy
  '#0891b2', // Come & Get Your Love — rich teal
  '#ea580c', // I'm Amazing — vibrant orange
];

export function MusicPlayer({ mobileNav = false }: { mobileNav?: boolean }) {
  const exRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [idx, setIdx] = useState(() => Math.min(MUSIC_TRACKS.length - 1, Math.max(0, readNum('case-radio-track', 0))));
  const [vol, setVol] = useState(readVol);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);

  const track = MUSIC_TRACKS[idx];
  const prog = dur ? (cur / dur) * 100 : 0;
  const accent = TRACK_ACCENTS[idx] ?? '#b45309';

  useEffect(() => {
    musicEngine.select(idx);
    return musicEngine.subscribe(s => {
      setPlaying(s.isPlaying);
      setIdx(s.trackIndex);
      setCur(s.currentTime);
      setDur(s.duration);
    });
  }, []);

  useEffect(() => {
    musicEngine.setVolume(vol);
    localStorage.setItem('case-radio-volume', String(vol));
    localStorage.setItem('case-radio-volume-v', '2');
  }, [vol]);

  useEffect(() => {
    localStorage.setItem('case-radio-track', String(idx));
  }, [idx]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector('[data-active="true"]') as HTMLElement | null;
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [idx, open]);

  useEffect(() => {
    if (!open || !mobileNav) return;
    const fn = (e: PointerEvent) => { if (!exRef.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', fn);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('pointerdown', fn); document.removeEventListener('keydown', esc); };
  }, [open, mobileNav]);

  useEffect(() => () => musicEngine.destroy(), []);

  const play = async (i: number) => { setIdx(i); await musicEngine.play(i); };
  const move = (d: -1 | 1) => play((idx + d + MUSIC_TRACKS.length) % MUSIC_TRACKS.length);
  const shuffle = () => { if (MUSIC_TRACKS.length < 2) return; let n = idx; while (n === idx) n = Math.floor(Math.random() * MUSIC_TRACKS.length); play(n); };

  const wrap = mobileNav
    ? 'pointer-events-none relative flex min-w-[36px] flex-1 items-center justify-center font-mono print:hidden'
    : 'pointer-events-none fixed bottom-6 left-4 z-[96] hidden font-mono print:hidden sm:block';

  return (
    <div data-prevent-page-swipe className={wrap}>
      <AnimatePresence mode="wait" initial={false}>
        {!open ? (
          <motion.button key="c" initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.9 }} transition={{ duration:0.18 }}
            type="button" onMouseEnter={mobileNav ? undefined : () => setOpen(true)} onFocus={() => setOpen(true)} onClick={() => setOpen(true)}
            aria-label="Open Awesome Mix Turntable Console"
            className={mobileNav ? 'pointer-events-auto relative flex h-full w-full flex-col items-center justify-center gap-0.5 rounded-full text-ink/60 transition-all hover:bg-ink/5 hover:text-ink active:scale-90' : 'pointer-events-auto relative'}
          >
            {mobileNav
              ? <MiniCassette playing={playing} />
              : <AwesomeMixCassette playing={playing} accent={accent} />}
          </motion.button>
        ) : (
          <motion.aside ref={exRef} key="e"
            initial={{ opacity:0, y:18, scale:0.94 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:18, scale:0.94 }}
            transition={{ duration:0.22, ease:[0.16,1,0.3,1] }}
            onMouseLeave={mobileNav ? undefined : () => setOpen(false)}
            aria-label="Awesome Mix Classy Turntable Console"
            style={{
              background: 'linear-gradient(165deg, rgba(253,251,247,0.98) 0%, rgba(244,238,228,0.99) 100%)',
              border: '1.5px solid rgba(212,175,55,0.35)',
              borderRadius: 20,
              boxShadow: `0 20px 50px rgba(15,23,42,0.16), 0 0 30px ${accent}20`,
              overflow: 'hidden',
              backdropFilter: 'blur(20px)',
              color: '#0f172a'
            }}
            className={mobileNav
              ? 'pointer-events-auto fixed bottom-[76px] left-1/2 -translate-x-1/2 z-[110] w-[92vw] max-w-[385px]'
              : 'pointer-events-auto relative w-[385px]'
            }
          >
            {/* Ambient Background Glow Spot */}
            <div style={{
              position: 'absolute', top: -30, right: -30, width: 160, height: 160,
              background: `radial-gradient(circle, ${accent}18 0%, transparent 70%)`,
              pointerEvents: 'none', zIndex: 0
            }} />

            {/* ── CLASSY HEADER BAR ── */}
            <div style={{
              padding: '11px 14px 9px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'linear-gradient(180deg, #ffffff 0%, #f8f4ec 100%)',
              borderBottom: '1px solid rgba(212,175,55,0.22)',
              position: 'relative', zIndex: 2
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: playing ? accent : '#94a3b8',
                  boxShadow: playing ? `0 0 10px ${accent}` : 'none'
                }} className={playing ? 'animate-pulse' : ''} />

                <div>
                  <div style={{ fontSize: 10, fontWeight: 900, color: '#0f172a', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                    AWESOME MIX • STUDIO
                  </div>
                  <div style={{ fontSize: 7.5, fontWeight: 800, color: '#b45309', letterSpacing: '0.06em' }}>
                    HI-FI TURNTABLE DECK
                  </div>
                </div>
              </div>

              {/* Close Button Only */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button type="button" onClick={() => setOpen(false)}
                  style={{
                    width: 22, height: 22, borderRadius: 7, background: '#ffffff',
                    border: '1px solid rgba(0,0,0,0.1)', color: '#475569',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                  }}
                  className="hover:!text-slate-900 hover:!bg-amber-50 transition-all"
                  aria-label="Close Studio Console">
                  <ChevronDown style={{ width: 14, height: 14 }} />
                </button>
              </div>
            </div>

            {/* ── SINGLE UNIFIED CONSOLE VIEW ── */}
            <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 12, position: 'relative', zIndex: 1 }}>
              
              {/* Hero Turntable Section */}
              <div style={{
                background: 'linear-gradient(145deg, #ffffff, #f7f3eb)',
                border: '1.5px solid rgba(212,175,55,0.25)',
                borderRadius: 14, padding: '12px 10px',
                boxShadow: '0 6px 20px rgba(15,23,42,0.06), inset 0 1px 0 #ffffff',
                display: 'flex', alignItems: 'center', gap: 12,
                position: 'relative', overflow: 'hidden'
              }}>
                {/* Glass Sheen */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, transparent 60%)', pointerEvents: 'none' }} />

                {/* Spinning Vinyl Record Disc with Gold Outer Ring */}
                <div style={{ position: 'relative', width: 122, height: 122, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {/* Gold Outer Dash Ring */}
                  <div style={{
                    position: 'absolute', inset: -3, borderRadius: '50%',
                    border: `2px dashed ${playing ? accent : 'rgba(212,175,55,0.3)'}`,
                    opacity: playing ? 0.85 : 0.3,
                    animation: playing ? 'case-radio-reel 12s linear infinite' : 'none'
                  }} />

                  {/* High-Gloss Black & Gold Vinyl Record */}
                  <div style={{
                    width: 116, height: 116, borderRadius: '50%',
                    background: 'radial-gradient(circle, #262626 22%, #171717 24%, #262626 35%, #0a0a0a 48%, #1f1f1f 65%, #0d0d0d 100%)',
                    border: '2px solid #d4af37',
                    boxShadow: `0 6px 16px rgba(0,0,0,0.3), 0 0 12px ${accent}25`,
                    animation: playing ? 'case-radio-reel 3.6s linear infinite' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative'
                  }}>
                    {/* Micro Grooves */}
                    <div style={{ position: 'absolute', inset: 9, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)' }} />
                    <div style={{ position: 'absolute', inset: 19, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.08)' }} />

                    {/* Center Label */}
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: `radial-gradient(circle, #fef3c7 0%, ${accent} 100%)`,
                      border: '1.5px solid #ffffff',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.3)', color: '#78350f', textAlign: 'center', padding: 2
                    }}>
                      <Disc style={{ width: 13, height: 13, color: '#78350f' }} />
                      <span style={{ fontSize: 6, fontWeight: 900, letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: 0.5, color: '#78350f' }}>CLASSIC</span>
                    </div>
                    <div style={{ position: 'absolute', width: 6, height: 6, borderRadius: '50%', background: '#171717', border: '1px solid #d4af37', zIndex: 5 }} />
                  </div>

                  {/* Gold Finished Tonearm Needle */}
                  <div style={{
                    position: 'absolute', top: 2, right: 3, width: 42, height: 60,
                    pointerEvents: 'none', zIndex: 10,
                    transformOrigin: 'top right',
                    transform: playing ? 'rotate(18deg)' : 'rotate(0deg)',
                    transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
                  }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, width: 10, height: 10, borderRadius: '50%', background: '#d4af37', border: '1px solid #b45309' }} />
                    <div style={{ position: 'absolute', top: 4, right: 3, width: 2, height: 47, background: 'linear-gradient(180deg, #d4af37, #997b19)', borderRadius: 1.5 }} />
                    <div style={{ position: 'absolute', bottom: 5, right: 1, width: 7, height: 10, background: accent, borderRadius: 1.5, border: '1px solid #fff' }} />
                  </div>
                </div>

                {/* Track Info & Progress Integrated */}
                <div style={{
                  flex: 1, display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 14.5, fontWeight: 900, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.2 }}>
                        {track.title}
                      </div>
                      <div style={{ fontSize: 11.5, fontWeight: 700, color: '#64748b', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {track.artist}
                      </div>
                    </div>
                    <span style={{ fontSize: 8.5, fontWeight: 900, color: accent, background: `${accent}15`, border: `1px solid ${accent}30`, borderRadius: 5, padding: '2px 5px', flexShrink: 0, marginLeft: 4 }}>
                      #{String(idx + 1).padStart(2, '0')}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                      if (dur > 0) musicEngine.seek(pct * dur);
                    }}
                    style={{ height: 6, background: '#f1f5f9', borderRadius: 99, cursor: 'pointer', overflow: 'hidden', position: 'relative', marginTop: 2 }}
                  >
                    <div style={{ height: '100%', width: `${prog}%`, background: `linear-gradient(90deg, ${accent}cc, ${accent})`, borderRadius: 99 }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 10, color: '#1e293b', fontFamily: 'monospace', fontWeight: 800 }}>{ft(cur)}</span>
                    <span style={{ fontSize: 10, color: '#64748b', fontFamily: 'monospace', fontWeight: 700 }}>{ft(dur)}</span>
                  </div>
                </div>

              </div>

              {/* ── TACTILE CONTROLS & VOLUME ── */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 12px', background: '#ffffff',
                borderRadius: 12, border: '1px solid rgba(212,175,55,0.22)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ClassyCircleBtn onClick={shuffle} label="Shuffle"><Shuffle style={{ width: 13, height: 13 }} /></ClassyCircleBtn>
                  <ClassyCircleBtn onClick={() => move(-1)} label="Previous Track"><SkipBack style={{ width: 14, height: 14 }} /></ClassyCircleBtn>

                  {/* Glowing Circular Play Button */}
                  <button type="button" onClick={() => musicEngine.toggle(idx)} aria-label={playing ? 'Pause' : 'Play'}
                    style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: `linear-gradient(135deg, ${accent}, ${accent}dd)`, color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      boxShadow: `0 3px 14px ${accent}45, inset 0 1px 0 rgba(255,255,255,0.5)`,
                      border: '1px solid rgba(255,255,255,0.4)', transition: 'transform 0.15s'
                    }}
                    className="hover:scale-105 active:scale-95">
                    {playing
                      ? <Pause style={{ width: 16, height: 16, fill: '#fff', color: '#fff' }} />
                      : <Play style={{ width: 16, height: 16, fill: '#fff', color: '#fff', marginLeft: 1 }} />}
                  </button>

                  <ClassyCircleBtn onClick={() => move(1)} label="Next Track"><SkipForward style={{ width: 14, height: 14 }} /></ClassyCircleBtn>
                </div>

                {/* Volume Slider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, width: 110 }}>
                  <button type="button" onClick={() => setVol(v => v === 0 ? 0.5 : 0)} aria-label="Mute" style={{ color: '#64748b' }}>
                    {vol === 0 ? <VolumeX style={{ width: 14, height: 14 }} /> : <Volume2 style={{ width: 14, height: 14 }} />}
                  </button>
                  <input type="range" min="0" max="1" step="0.01" value={vol} onChange={e => setVol(Number(e.target.value))}
                    style={{
                      appearance: 'none', width: '100%', height: 4, borderRadius: 99, outline: 'none', cursor: 'pointer',
                      background: `linear-gradient(to right, ${accent} 0%, ${accent} ${vol * 100}%, #e2e8f0 ${vol * 100}%, #e2e8f0 100%)`
                    }}
                    aria-label="Volume" />
                </div>
              </div>

              {/* ── TRACK LIST INTEGRATED ── */}
              {/* ── TRACK LIST INTEGRATED ── */}
              <div style={{
                position: 'relative', // for masking tape/clip/tab placement
                background: '#fdfbf7', // light cream paper texture
                border: '1.5px solid rgba(139, 92, 26, 0.15)',
                borderRadius: 12,
                padding: '14px 10px 6px', // slightly more top padding for tape/clip
                boxShadow: '0 2px 6px rgba(139, 92, 26, 0.04)'
              }}>
                {/* Vintage Masking Tape Strip */}
                <div style={{
                  position: 'absolute',
                  top: -6,
                  left: '52%',
                  transform: 'translateX(-50%) rotate(1.5deg)',
                  width: 52,
                  height: 12,
                  background: 'rgba(235, 220, 180, 0.45)',
                  backdropFilter: 'blur(0.5px)',
                  borderLeft: '1px dashed rgba(139, 92, 26, 0.15)',
                  borderRight: '1px dashed rgba(139, 92, 26, 0.15)',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                  pointerEvents: 'none',
                  zIndex: 10
                }} />

                {/* 3D Metal Paperclip */}
                <div style={{
                  position: 'absolute',
                  top: -8,
                  left: 20,
                  width: 8,
                  height: 24,
                  borderRadius: 6,
                  border: '1.8px solid #94a3b8',
                  background: 'transparent',
                  boxShadow: '0.5px 1px 2px rgba(0,0,0,0.12)',
                  zIndex: 12,
                  transform: 'rotate(-4deg)',
                  pointerEvents: 'none'
                }}>
                  {/* Inner loop of the clip */}
                  <div style={{
                    position: 'absolute',
                    top: 4,
                    left: 0.8,
                    width: 2.8,
                    height: 12,
                    borderRadius: 3,
                    border: '1.2px solid #94a3b8',
                    borderBottom: 'none'
                  }} />
                </div>

                {/* Notebook divider tab sticking out on the right edge */}
                <div style={{
                  position: 'absolute', right: -6, top: 40,
                  background: '#fbbf24', // golden yellow tab
                  fontSize: 7, fontWeight: 800, color: '#78350f',
                  fontFamily: 'Courier New, monospace',
                  padding: '2px 4px', borderRadius: '0 4px 4px 0',
                  transform: 'rotate(90deg) translateY(-50%)',
                  transformOrigin: 'right center',
                  boxShadow: '1px 1px 2px rgba(0,0,0,0.05)',
                  pointerEvents: 'none',
                  zIndex: 1
                }}>
                  SIDE-A
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  padding: '0 4px 6px',
                  borderBottom: '1px solid rgba(139, 92, 26, 0.15)',
                  marginBottom: 6
                }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: '#8b5a2b', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'Courier New, Courier, monospace' }}>
                    LINER NOTES // A-SIDE
                  </span>
                  <span style={{ fontSize: 8, color: '#8b5a2b', fontWeight: 600, opacity: 0.8, fontFamily: 'Courier New, Courier, monospace' }}>
                    {MUSIC_TRACKS.length} INDEX
                  </span>
                </div>

                {/* Relative Scroll Area Wrapper with Top and Bottom Fade Indicators */}
                <div style={{ position: 'relative', width: '100%', background: '#faf6eb', borderRadius: 8, border: '1px solid rgba(139, 92, 26, 0.1)', overflow: 'hidden' }}>
                  {/* Binder Ring Holes on the far left */}
                  <div style={{ position: 'absolute', left: 5, top: 25, width: 4.5, height: 4.5, borderRadius: '50%', background: 'rgba(0,0,0,0.11)', boxShadow: 'inset 0.5px 0.5px 1px rgba(0,0,0,0.18)', pointerEvents: 'none', zIndex: 11 }} />
                  <div style={{ position: 'absolute', left: 5, top: '50%', transform: 'translateY(-50%)', width: 4.5, height: 4.5, borderRadius: '50%', background: 'rgba(0,0,0,0.11)', boxShadow: 'inset 0.5px 0.5px 1px rgba(0,0,0,0.18)', pointerEvents: 'none', zIndex: 11 }} />
                  <div style={{ position: 'absolute', left: 5, bottom: 25, width: 4.5, height: 4.5, borderRadius: '50%', background: 'rgba(0,0,0,0.11)', boxShadow: 'inset 0.5px 0.5px 1px rgba(0,0,0,0.18)', pointerEvents: 'none', zIndex: 11 }} />

                  {/* Tear Perforation Line */}
                  <div style={{
                    position: 'absolute', left: 14, top: 0, bottom: 0, width: 1,
                    borderLeft: '1.2px dashed rgba(139, 92, 26, 0.22)', pointerEvents: 'none', zIndex: 11
                  }} />

                  {/* Vertical Red Notebook Margin Line */}
                  <div style={{
                    position: 'absolute', left: 40, top: 0, bottom: 0, width: 1.5,
                    background: 'rgba(239, 68, 68, 0.28)', pointerEvents: 'none', zIndex: 5
                  }} />

                  {/* Top Shadow Fade overlay */}
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 8,
                    background: 'linear-gradient(to bottom, #faf6eb 0%, transparent 100%)',
                    pointerEvents: 'none', zIndex: 4, borderRadius: '6px 6px 0 0'
                  }} />

                  {/* Scroll Container */}
                  <div ref={listRef} style={{
                    maxHeight: 220, overflowY: 'auto', display: 'flex', flexDirection: 'column',
                    scrollbarWidth: 'none', // clean typewriter index card layout
                    paddingRight: 0, paddingBottom: 4, paddingTop: 4
                  }}>
                    {MUSIC_TRACKS.map((t, i) => {
                      const a = TRACK_ACCENTS[i] ?? '#b45309';
                      const active = i === idx;
                      const hasMedia = Boolean(t.visual);
                      // Dynamic colored highlighter matched to the song's accent
                      const highlighterBg = active ? `${a}1a` : 'transparent';
                      
                      return (
                        <button key={t.id} data-active={active} type="button" onClick={() => play(i)}
                          style={{
                            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '9px 8px 9px 20px', // padding left is 20px to clear perforation line
                            background: highlighterBg,
                            border: 'none',
                            borderBottom: '1px solid rgba(139, 92, 26, 0.08)', // Ruled Notebook Lines
                            textAlign: 'left', transition: 'background 0.15s ease', position: 'relative',
                            flexShrink: 0
                          }}
                          className="hover:!bg-amber-200/20 active:scale-[0.995]">
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0, width: '100%' }}>
                            {/* Hand-drawn red pen circle around index number */}
                            {active && (
                              <div style={{
                                position: 'absolute',
                                left: 16,
                                top: '50%',
                                width: 22,
                                height: 22,
                                border: '1.2px solid rgba(239, 68, 68, 0.75)',
                                borderRadius: '48% 52% 43% 57% / 55% 45% 55% 45%', // slightly irregular organic loop
                                transform: 'translateY(-50%) rotate(-6deg)',
                                pointerEvents: 'none',
                                zIndex: 7
                              }} />
                            )}

                            {/* Monospace Index Number (Left of the Red Margin Line) */}
                            <span style={{
                              fontSize: 10.5,
                              fontWeight: active ? 700 : 500,
                              color: active ? a : '#94a3b8',
                              fontFamily: 'Courier New, Courier, monospace',
                              width: 14,
                              textAlign: 'right',
                              flexShrink: 0,
                              zIndex: 6
                            }}>
                              {String(i + 1).padStart(2, '0')}
                            </span>

                            {/* Title & Artist (Right of the Red Margin Line) */}
                            <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1, paddingLeft: 4, zIndex: 6 }}>
                              <div style={{
                                fontSize: 12,
                                fontWeight: active ? 700 : 500,
                                color: active ? a : '#475569', // Colored ink matches the song color
                                fontFamily: 'Courier New, Courier, monospace',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                lineHeight: 1.2
                              }}>
                                {active ? `> ${t.title}` : t.title}
                              </div>
                              <div style={{
                                fontSize: 10,
                                color: active ? a : '#94a3b8',
                                opacity: active ? 0.9 : 0.8,
                                fontFamily: 'Courier New, Courier, monospace',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                lineHeight: 1.1
                              }}>
                                {t.artist}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, marginLeft: 4, zIndex: 6 }}>
                            {hasMedia && (
                              <span style={{
                                fontSize: 8,
                                fontWeight: 700,
                                color: '#dc2626',
                                fontFamily: 'Courier New, Courier, monospace',
                                letterSpacing: '-0.05em'
                              }}>
                                [AV]
                              </span>
                            )}

                            {active && playing && (
                              <span className="animate-pulse" style={{
                                fontSize: 8,
                                fontWeight: 700,
                                color: a,
                                fontFamily: 'Courier New, Courier, monospace'
                              }}>
                                *PLAYING
                              </span>
                            )}

                            {active && !playing && (
                              <span style={{
                                fontSize: 8,
                                fontWeight: 700,
                                color: '#94a3b8',
                                fontFamily: 'Courier New, Courier, monospace'
                              }}>
                                *PAUSED
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Bottom Shadow Fade overlay */}
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, height: 8,
                    background: 'linear-gradient(to top, #faf6eb 0%, transparent 100%)',
                    pointerEvents: 'none', zIndex: 4, borderRadius: '0 0 6px 6px'
                  }} />
                </div>

                {/* Pencil Doodle in bottom corner */}
                <div style={{
                  position: 'absolute',
                  bottom: -1,
                  right: 12,
                  fontSize: 7.5,
                  fontWeight: 700,
                  color: 'rgba(139, 92, 26, 0.28)',
                  fontFamily: 'Courier New, Courier, monospace',
                  transform: 'rotate(-2deg)',
                  pointerEvents: 'none',
                  userSelect: 'none'
                }}>
                  ★ mix ok
                </div>
              </div>

            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}

function ClassyCircleBtn({ onClick, label, children }: { onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-label={label}
      style={{
        width: 30, height: 30, borderRadius: '50%',
        background: 'linear-gradient(180deg, #ffffff 0%, #f1ece1 100%)',
        border: '1px solid rgba(212,175,55,0.3)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#475569', flexShrink: 0
      }}
      className="hover:!text-slate-900 hover:!border-amber-400 transition-all active:scale-90">
      {children}
    </button>
  );
}

/* ── Tiny Cassette for mobile nav dock button ── */
function MiniCassette({ playing }: { playing: boolean }) {
  return (
    <>
      <div style={{
        width: 28, height: 17, position: 'relative',
        background: 'linear-gradient(180deg, #2c2c2c 0%, #1a1a1a 100%)',
        borderRadius: 3, border: '1px solid #080808',
        boxShadow: '0 2px 6px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', flexShrink: 0,
      }}>
        {/* Label area */}
        <div style={{
          position: 'absolute', top: 1, left: 2, right: 2, height: 9,
          background: '#f4ecd0', borderRadius: '1px 1px 0 0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 2px', overflow: 'hidden',
        }}>
          <span style={{ fontSize: 3.5, fontFamily: 'Caveat, cursive', fontWeight: 700, color: '#1d3557', whiteSpace: 'nowrap', lineHeight: 1 }}>Mix</span>
        </div>
        {/* Reel window */}
        <div style={{
          position: 'absolute', bottom: 2, left: 2, right: 2, height: 5,
          background: '#0a0a0a', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 3px',
        }}>
          <div style={{
            width: 5, height: 5, borderRadius: '50%',
            background: '#f0f0f0', border: '0.5px solid #111',
            animation: playing ? 'case-radio-reel 2.2s linear infinite' : 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ width: 2, height: 2, borderRadius: '50%', background: '#111' }} />
          </div>
          <div style={{ flex: 1, height: 1.5, background: '#2b180d', margin: '0 2px', borderRadius: 1 }} />
          <div style={{
            width: 4, height: 4, borderRadius: '50%',
            background: '#f0f0f0', border: '0.5px solid #111',
            animation: playing ? 'case-radio-reel 2.2s linear infinite reverse' : 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ width: 1.5, height: 1.5, borderRadius: '50%', background: '#111' }} />
          </div>
        </div>
        {/* Playing indicator dot */}
        {playing && (
          <div style={{
            position: 'absolute', top: 1.5, right: 1.5, width: 2.5, height: 2.5, borderRadius: '50%',
            background: '#10b981', boxShadow: '0 0 3px #10b981',
          }} className="animate-pulse" />
        )}
      </div>
      <span className={`text-[7px] font-black tracking-widest leading-none mt-0.5 ${playing ? 'text-red-700' : 'text-current'}`}>MIX</span>
    </>
  );
}

/* ── Realistic CSS Awesome Mix Black Cassette Tape (Compact Button View) ── */
function AwesomeMixCassette({ playing, accent }: { playing: boolean; accent: string }) {
  return (
    <div style={{
      width: 180, height: 106, position: 'relative',
      background: 'linear-gradient(180deg, #2c2c2c 0%, #1a1a1a 60%, #111111 100%)',
      borderRadius: 7, border: '1.8px solid #080808',
      boxShadow: '0 12px 35px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(0,0,0,0.8)',
      padding: '5px 6px 3px', cursor: 'pointer',
      display: 'flex', flexDirection: 'column', gap: 3,
    }}>
      {[
        { top: 4, left: 5 }, { top: 4, right: 5 },
        { bottom: 22, left: 5 }, { bottom: 22, right: 5 },
        { top: 4, left: '50%', transform: 'translateX(-50%)' }
      ].map((pos, i) => (
        <div key={i} style={{
          position: 'absolute', width: 5, height: 5, borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 35%, #bbbbbb 0%, #444444 70%, #111111 100%)',
          border: '0.5px solid #000',
          boxShadow: '0 0.5px 1px rgba(0,0,0,0.8)',
          ...pos
        }} />
      ))}

      <div style={{
        flex: 1, background: '#121212', borderRadius: 4, border: '1px solid #050505',
        display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative'
      }}>
        <div style={{
          height: 68, background: '#f4ecd0', margin: '2px 4px 0', borderRadius: '3px 3px 0 0',
          border: '1px solid rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', overflow: 'hidden',
          position: 'relative'
        }}>
          <div style={{ padding: '3px 8px 2px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: 17, fontFamily: 'Caveat, cursive', fontWeight: 700, color: '#1d3557', lineHeight: 1, whiteSpace: 'nowrap', textShadow: '0 0 1px rgba(29,53,87,0.2)' }}>
              Awesome Mix Vol. 1
            </div>
            <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
              <span style={{ fontSize: 7.5, fontWeight: 900, color: '#666', letterSpacing: '0.05em' }}>C-90</span>
              <span style={{ fontSize: 10, fontWeight: 900, color: '#d90429', border: '1px solid #d90429', borderRadius: 2, padding: '0 3px', lineHeight: '1.1' }}>A</span>
            </div>
          </div>

          <div style={{
            flex: 1, background: '#0a0a0a', margin: '2px 5px', borderRadius: 3,
            border: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 12px', position: 'relative', overflow: 'hidden',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.9)'
          }}>
            <div style={{ position: 'absolute', top: 2, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 4, opacity: 0.5 }}>
              {[0, 25, 50, 75, 100].map(v => <div key={v} style={{ width: 1.2, height: v === 50 ? 5 : 3, background: '#ffffff' }} />)}
            </div>

            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'radial-gradient(circle, #3d2314 50%, #2b180d 85%, transparent 86%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CssReel spinning={playing} delay={0} size={18} />
              </div>
            </div>

            <div style={{ flex: 1, height: 3, background: '#2b180d', margin: '0 3px', borderRadius: 1.5, opacity: 0.8 }} />

            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'radial-gradient(circle, #3d2314 40%, #2b180d 75%, transparent 76%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CssReel spinning={playing} delay={-0.7} size={15} />
              </div>
            </div>
          </div>

          <div style={{ height: 12, flexShrink: 0, background: 'linear-gradient(180deg, #d90429 0px, #d90429 4px, #f77f00 4px, #f77f00 8px, #fcbf49 8px, #fcbf49 12px)' }} />
        </div>

        <div style={{
          height: 22, background: 'linear-gradient(180deg, #222222 0%, #151515 100%)',
          margin: '0 3px 3px', borderRadius: '0 0 3px 3px', borderTop: '1px solid #333333',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px',
          clipPath: 'polygon(0% 0%, 100% 0%, 93% 100%, 7% 100%)'
        }}>
          <div style={{ width: 7.5, height: 7.5, borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, #b58900, #422d00)', border: '0.5px solid #d4af37' }} />
          <div style={{ width: 35, height: 6, background: '#080808', borderRadius: 1.5, border: '0.5px solid #444', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.8)' }} />
          <div style={{ width: 7.5, height: 7.5, borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, #b58900, #422d00)', border: '0.5px solid #d4af37' }} />
        </div>
      </div>

      <div style={{
        position: 'absolute', top: 8, right: 10, width: 5, height: 5, borderRadius: '50%',
        background: playing ? '#10b981' : '#333333',
        boxShadow: playing ? '0 0 6px #10b981' : 'none'
      }} className={playing ? 'animate-pulse' : ''} />
    </div>
  );
}

function CssReel({ spinning, delay, size = 14 }: { spinning: boolean; delay: number; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0, position: 'relative',
      background: '#f8f8f8',
      border: '1px solid #111111',
      boxShadow: '0 1px 2px rgba(0,0,0,0.5)',
      animation: spinning ? 'case-radio-reel 2.2s linear infinite' : 'none',
      animationDelay: `${delay}s`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden'
    }}>
      <div style={{ width: size * 0.4, height: size * 0.4, borderRadius: '50%', background: '#111111', zIndex: 1 }} />
      {[0, 60, 120].map((a) => (
        <div key={a} style={{
          position: 'absolute', top: '50%', left: '50%',
          width: '100%', height: 1.5, background: '#111111',
          transformOrigin: 'center center',
          transform: `translate(-50%, -50%) rotate(${a}deg)`
        }} />
      ))}
      <div style={{ position: 'absolute', width: size * 0.3, height: size * 0.3, borderRadius: '50%', background: '#ffffff', zIndex: 2 }} />
    </div>
  );
}

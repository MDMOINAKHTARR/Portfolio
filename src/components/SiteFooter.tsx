import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUp, Feather } from 'lucide-react';
import { audioEngine } from '../lib/audio';
import { scrollToTop } from '../lib/smoothScroll';

interface SiteFooterProps {
  visits?: number;
  uniqueVisits?: number;
  caseId?: string;
}

const SERRATED_TAPE_CLIP =
  'polygon(0% 8%, 4% 0%, 8% 10%, 12% 0%, 96% 0%, 100% 8%, 96% 18%, 100% 28%, 96% 38%, 100% 48%, 96% 58%, 100% 68%, 96% 78%, 100% 88%, 96% 100%, 4% 100%, 0% 90%, 4% 80%, 0% 70%, 4% 60%, 0% 50%, 4% 40%, 0% 30%, 4% 20%)';

/**
 * True die-cut postage stamp CSS mask: punches semicircular perforation teeth
 * around the outer perimeter while keeping the interior 100% solid.
 */
const POSTAGE_STAMP_MASK: React.CSSProperties = {
  WebkitMaskImage:
    'radial-gradient(circle at 5px 5px, transparent 3.3px, black 3.7px), linear-gradient(black, black)',
  WebkitMaskSize: '10px 10px, calc(100% - 10px) calc(100% - 10px)',
  WebkitMaskPosition: '-5px -5px, center',
  WebkitMaskRepeat: 'repeat, no-repeat',
  maskImage:
    'radial-gradient(circle at 5px 5px, transparent 3.3px, black 3.7px), linear-gradient(black, black)',
  maskSize: '10px 10px, calc(100% - 10px) calc(100% - 10px)',
  maskPosition: '-5px -5px, center',
  maskRepeat: 'repeat, no-repeat',
};

export function SiteFooter({ caseId = 'AX-2026' }: SiteFooterProps) {
  const footerRef = useRef<HTMLElement>(null);
  const [sealStamped, setSealStamped] = useState(true);
  const [stampPulseKey, setStampPulseKey] = useState(0);
  const [sigReplayKey, setSigReplayKey] = useState(0);

  // Smoothly retract floating corner/edge widgets when footer enters viewport
  useEffect(() => {
    const el = footerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting;
        document.documentElement.classList.toggle('footer-in-view', visible);
        window.dispatchEvent(new CustomEvent('footer-visibility', { detail: visible }));
      },
      { threshold: 0.02, rootMargin: '0px 0px 100px 0px' }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      document.documentElement.classList.remove('footer-in-view');
      window.dispatchEvent(new CustomEvent('footer-visibility', { detail: false }));
    };
  }, []);

  const handleBackToTop = useCallback(() => {
    try {
      audioEngine.init();
      audioEngine.playPaper();
    } catch { }
    scrollToTop(false);
  }, []);

  const handleSealClick = useCallback(() => {
    try {
      audioEngine.init();
      audioEngine.playClick();
    } catch { }
    setSealStamped((prev) => {
      const next = !prev;
      if (next) setStampPulseKey((k) => k + 1);
      return next;
    });
  }, []);

  const handleReplaySignature = useCallback(() => {
    try {
      audioEngine.init();
      audioEngine.playPaper();
    } catch { }
    setSigReplayKey((k) => k + 1);
  }, []);

  return (
    <footer
      id="site-footer"
      ref={footerRef}
      aria-label="Site footer"
      className="hidden sm:block print:hidden relative z-[92] w-screen left-1/2 -translate-x-1/2 mt-20 sm:mt-28 -mb-[64px] sm:-mb-12 select-none"
    >
      {/* Shared SVG Filters for Authentic Distressed Rubber-Stamp Ink Bleed */}
      <svg aria-hidden="true" className="absolute w-0 h-0 overflow-hidden pointer-events-none">
        <defs>
          <filter id="footer-stamp-grunge" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.6" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* Physical Die-Cut Manila Folder Tabs (matching top of main dossier) */}
      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-4 sm:px-12 flex items-end justify-between pointer-events-none">
        {/* Left Folder Tab with Metal Eyelet */}
        <div className="pointer-events-auto relative h-8 sm:h-9 px-6 bg-folder border-t-2 border-x-2 border-folder-dark rounded-t-md transform -skew-x-[18deg] flex items-center shadow-[0_-6px_16px_rgba(0,0,0,0.32)]">
          <div className="absolute inset-0 bg-cardboard opacity-55 mix-blend-overlay pointer-events-none" />
          <div className="absolute inset-x-2 top-1 border-t border-dashed border-ink/20 pointer-events-none" />
          <div className="transform skew-x-[18deg] flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-folder-dark border-2 border-ink/45 shadow-inner shrink-0" />
            <span className="font-stamp text-ink/85 tracking-[0.2em] text-[10.5px] sm:text-xs uppercase font-bold">
              CLOSING STATEMENT // FILE: {caseId || 'MMA-2026'}
            </span>
          </div>
        </div>

        {/* Right Interactive Folder Tab (Back to Top) */}
        <button
          type="button"
          onClick={handleBackToTop}
          className="pointer-events-auto group relative h-8 sm:h-9 px-5 sm:px-6 bg-folder hover:bg-paper border-t-2 border-x-2 border-folder-dark rounded-t-md transform skew-x-[18deg] flex items-center gap-2 shadow-[0_-6px_16px_rgba(0,0,0,0.32)] transition-all cursor-pointer"
        >
          <div className="absolute inset-0 bg-cardboard opacity-55 mix-blend-overlay pointer-events-none" />
          <div className="absolute inset-x-2 top-1 border-t border-dashed border-ink/20 pointer-events-none" />
          <span className="font-stamp text-ink group-hover:text-stamp tracking-[0.18em] text-[10.5px] sm:text-xs uppercase transform -skew-x-[18deg] font-bold flex items-center gap-1.5 transition-colors">
            <span>RETURN TO TOP</span>
            <ArrowUp className="w-3.5 h-3.5 text-stamp transition-transform duration-200 group-hover:-translate-y-0.5" />
          </span>
        </button>
      </div>

      {/* Double-Layered Torn / Deckle Paper Edge + Manila Backing */}
      <div className="relative w-full">
        {/* Manila Folder Backing Lip with Ruler Tick Marks */}
        <div className="w-full h-3.5 bg-folder border-t-2 border-folder-dark shadow-[0_-12px_32px_rgba(0,0,0,0.5)] relative overflow-hidden">
          <div className="absolute inset-0 bg-cardboard opacity-60 mix-blend-overlay" />
          <div
            className="absolute inset-x-0 top-0 h-1.5 opacity-25"
            style={{
              backgroundImage:
                'repeating-linear-gradient(to right, currentColor 0, currentColor 1px, transparent 1px, transparent 12px)',
            }}
          />
        </div>

        {/* Multi-layered SVG Torn / Deckle Paper Top Edge */}
        <div className="relative w-full h-5 -mt-2 overflow-hidden pointer-events-none z-20">
          <svg
            viewBox="0 0 1440 28"
            preserveAspectRatio="none"
            className="w-full h-full block drop-shadow-[0_-3px_3px_rgba(0,0,0,0.22)]"
          >
            <path
              d="M0,28 L0,9 Q18,2 36,10 T72,7 T108,11 T144,6 T180,10 T216,7 T252,11 T288,6 T324,10 T360,8 T396,11 T432,5 T468,10 T504,7 T540,11 T576,6 T612,10 T648,8 T684,11 T720,6 T756,10 T792,7 T828,11 T864,6 T900,10 T936,8 T972,11 T1008,6 T1044,10 T1080,7 T1116,11 T1152,6 T1188,10 T1224,8 T1260,11 T1296,6 T1332,10 T1368,7 T1404,11 L1440,8 L1440,28 Z"
              fill="var(--c-folder)"
              opacity="0.7"
            />
            <path
              d="M0,28 L0,14 Q12,6 24,14 T48,12 T72,15 T96,10 T120,14 T144,9 T168,15 T192,11 T216,14 T240,10 T264,15 T288,11 T312,14 T336,12 T360,15 T384,9 T408,14 T432,11 T456,15 T480,12 T504,14 T528,10 T552,15 T576,11 T600,14 T624,12 T648,15 T672,9 T696,14 T720,11 T744,15 T768,12 T792,14 T816,10 T840,15 T864,11 T888,14 T912,12 T936,15 T960,9 T984,14 T1008,11 T1032,15 T1056,12 T1080,14 T1104,10 T1128,15 T1152,11 T1176,14 T1200,12 T1224,15 T1248,9 T1272,14 T1296,11 T1320,15 T1344,12 T1368,14 T1392,10 T1416,15 L1440,12 L1440,28 Z"
              fill="var(--c-paper)"
            />
          </svg>
        </div>

        {/* Main Tactile Archival Paper Sheet */}
        <div className="relative w-full bg-paper text-ink overflow-hidden pb-7 pt-3 sm:py-8 border-b-4 border-folder-dark">
          {/* Paper grain & subtle ruled legal/archival stationery lines */}
          <div className="absolute inset-0 bg-texture opacity-40 mix-blend-multiply pointer-events-none" />
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{
              backgroundImage:
                'repeating-linear-gradient(to bottom, transparent 0px, transparent 27px, currentColor 28px)',
            }}
          />
          <div className="absolute inset-0 shadow-[inset_0_0_32px_rgba(0,0,0,0.08)] pointer-events-none" />

          {/* Left Archival Margin Rule + 3 Punched Binder Holes with Reinforcement Rings */}
          <div className="hidden lg:block absolute top-0 bottom-0 left-16 w-[2px] bg-stamp/25 pointer-events-none" />
          <div className="hidden lg:block absolute top-0 bottom-0 left-[68px] w-[1px] bg-stamp/15 pointer-events-none" />
          <div
            aria-hidden="true"
            className="hidden lg:flex absolute top-0 bottom-0 left-5 flex-col justify-around py-5 pointer-events-none"
          >
            {[0, 1, 2].map((hole) => (
              <div
                key={hole}
                className="w-6 h-6 rounded-full bg-folder/55 border border-folder-dark/45 flex items-center justify-center shadow-xs"
              >
                <div className="w-3 h-3 rounded-full bg-[#1b1d21] shadow-[inset_0_2px_4px_rgba(0,0,0,0.85)]" />
              </div>
            ))}
          </div>

          {/* Serrated Drafting Masking Tape Strips at Top Corners + Steel Paperclip */}
          <div
            aria-hidden="true"
            style={{ clipPath: SERRATED_TAPE_CLIP }}
            className="hidden sm:block absolute -top-1.5 left-20 w-28 h-6 bg-folder/90 border-y border-folder-dark/40 rotate-[-5deg] shadow-sm opacity-85 pointer-events-none"
          />
          <div
            aria-hidden="true"
            style={{ clipPath: SERRATED_TAPE_CLIP }}
            className="hidden sm:block absolute -top-1.5 right-20 w-28 h-6 bg-folder/90 border-y border-folder-dark/40 rotate-[4deg] shadow-sm opacity-85 pointer-events-none"
          />

          <svg
            aria-hidden="true"
            viewBox="0 0 36 80"
            className="hidden md:block absolute -top-3 left-36 w-6 h-14 text-ink/50 rotate-[8deg] drop-shadow-[1px_2px_2px_rgba(0,0,0,0.25)] pointer-events-none z-20"
            fill="none"
          >
            <path
              d="M10 18 V58 C10 67 26 67 26 58 V14 C26 6 8 6 8 14 V52 C8 58 20 58 20 52 V20"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
            />
          </svg>

          {/* Subtle Coffee Cup Rim Stain watermark in background */}
          <svg
            aria-hidden="true"
            viewBox="0 0 120 120"
            className="hidden md:block absolute -bottom-10 left-1/2 -translate-x-12 w-32 h-32 text-folder-dark/15 pointer-events-none rotate-12"
            fill="none"
          >
            <circle cx="60" cy="60" r="48" stroke="currentColor" strokeWidth="3.5" strokeDasharray="40 8 18 6" />
            <circle cx="60" cy="60" r="44" stroke="currentColor" strokeWidth="1" strokeDasharray="12 10" />
          </svg>

          {/* Inner Content Spread */}
          <div className="relative z-10 w-full max-w-[1380px] mx-auto px-6 sm:px-12 lg:pl-24 lg:pr-14 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            {/* LEFT / CENTER: Name, Bio & Handwritten Fountain-Pen Signature */}
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-2 py-0.5 mb-2 bg-folder/45 border border-folder-dark/40 rounded-xs font-mono text-[8.5px] font-black uppercase tracking-[0.22em] text-ink/70">
                <span className="w-1.5 h-1.5 rounded-full bg-stamp" />
                <span>FORM 94-A // INVESTIGATOR SIGN-OFF &amp; CERTIFICATION</span>
              </div>

              <div className="flex flex-wrap items-baseline gap-x-3.5 gap-y-1">
                <h2 className="font-stamp text-2xl sm:text-[32px] font-black uppercase tracking-[0.08em] text-ink leading-none">
                  MD MOIN AKHTAR
                </h2>
                <span className="font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-stamp">
                  // AI &amp; FULL-STACK ENGINEER · NEW DELHI
                </span>
              </div>

              <p className="mt-2.5 font-typewriter text-xs sm:text-[13.5px] text-ink/80 leading-relaxed">
                Wrapping machine-learning models into real, user-facing products across the full stack — backed by published IEEE research and shipped end to end.
              </p>

              {/* Handwritten Signature Block on Dotted Archival Baseline */}
              <div className="mt-4 pt-1.5 flex flex-wrap items-end gap-6 sm:gap-9">
                <button
                  type="button"
                  onClick={handleReplaySignature}
                  title="Click to re-sign with fountain pen"
                  className="group relative text-left cursor-pointer focus:outline-none"
                >
                  <div className="flex items-end gap-2">
                    <span className="font-mono text-[11px] font-black uppercase tracking-widest text-stamp/70 select-none mb-1.5">
                      ✗
                    </span>
                    <motion.div
                      key={`sig-text-${sigReplayKey}`}
                      initial={{ opacity: 0.25, clipPath: 'inset(0 100% 0 0)' }}
                      whileInView={{ opacity: 1, clipPath: 'inset(0 0% 0 0)' }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.05, ease: 'easeOut' }}
                      className="text-[28px] sm:text-[35px] text-ink/90 leading-none -rotate-2 tracking-wide pr-2"
                      style={{ fontFamily: "'Caveat', 'Kalam', cursive", fontWeight: 700 }}
                    >
                      Md Moin Akhtar
                    </motion.div>
                    <Feather className="w-3.5 h-3.5 text-ink/40 group-hover:text-stamp transition-colors mb-2 -ml-1 rotate-[-12deg]" />
                  </div>

                  <svg
                    key={`sig-flourish-${sigReplayKey}`}
                    viewBox="0 0 230 16"
                    className="w-48 sm:w-56 h-3.5 text-ink/75 -mt-1"
                    fill="none"
                  >
                    <motion.path
                      d="M4 10 C58 2, 148 2, 222 8 C178 12, 98 13, 36 7"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9, delay: 0.2, ease: 'easeInOut' }}
                    />
                  </svg>

                  <div className="border-t border-dashed border-ink/40 pt-1 flex items-center justify-between gap-4 font-mono text-[8.5px] font-bold uppercase tracking-[0.22em] text-ink/60 group-hover:text-ink transition-colors">
                    <span>INVESTIGATOR SIGNATURE · AUTHENTICATED</span>
                    <span className="text-stamp/75">INK VERIFIED</span>
                  </div>
                </button>

                {/* Biometric Thumbprint + Filed Coordinates Stamp */}
                <div className="flex items-center gap-3 border-l-2 border-ink/20 pl-3.5 py-0.5">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 36 44"
                    className="w-7 h-8 text-ink/35 shrink-0 -rotate-6"
                    fill="none"
                  >
                    <path d="M18 4 C8 4 4 12 4 22 C4 32 9 40 18 40 C27 40 32 32 32 22" stroke="currentColor" strokeWidth="1.4" strokeDasharray="5 2" />
                    <path d="M18 8 C11 8 8 14 8 22 C8 30 12 36 18 36 C24 36 28 30 28 22 C28 14 25 8 18 8" stroke="currentColor" strokeWidth="1.3" strokeDasharray="8 2" />
                    <path d="M18 13 C14 13 12 17 12 22 C12 27 14 31 18 31 C22 31 24 27 24 22" stroke="currentColor" strokeWidth="1.3" />
                    <path d="M18 17 C16 17 15 19 15 22 C15 25 16 27 18 27" stroke="currentColor" strokeWidth="1.4" />
                  </svg>
                  <div className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-ink/60 leading-snug">
                    <div className="font-black text-ink/80">FILED IN NEW DELHI, IN</div>
                    <div>28.6139° N, 77.2090° E · © 2026</div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: Museum-Grade Intaglio Postage Stamps, Postmark & Distressed Rubber/Wax Seal */}
            <div className="relative flex items-center gap-5 sm:gap-7 self-end lg:self-center shrink-0 py-1">
              {/* Hand-Stamped Circular GPO Cancellation Postmark + 5 Wavy Killer Bars (overlapping stamps) */}
              <svg
                aria-hidden="true"
                viewBox="0 0 240 100"
                style={{ filter: 'url(#footer-stamp-grunge)' }}
                className="hidden sm:block absolute -left-12 -top-2 w-56 h-24 text-ink/40 pointer-events-none z-30 -rotate-8 mix-blend-multiply"
                fill="none"
              >
                <defs>
                  <path id="postmark-top-arc" d="M 16,50 A 32,32 0 1,1 80,50" />
                  <path id="postmark-bot-arc" d="M 80,50 A 32,32 0 1,1 16,50" />
                </defs>
                {/* Double circular cancellation dial */}
                <circle cx="48" cy="50" r="39" stroke="currentColor" strokeWidth="2" />
                <circle cx="48" cy="50" r="26" stroke="currentColor" strokeWidth="1.2" />
                <text fill="currentColor" fontSize="6.5" fontFamily="monospace" fontWeight="bold" letterSpacing="1.8">
                  <textPath href="#postmark-top-arc" startOffset="50%" textAnchor="middle">
                    ★ NEW DELHI G.P.O. ★
                  </textPath>
                </text>
                <text fill="currentColor" fontSize="6" fontFamily="monospace" fontWeight="bold" letterSpacing="1.5">
                  <textPath href="#postmark-bot-arc" startOffset="50%" textAnchor="middle">
                    AIR MAIL · INDIA
                  </textPath>
                </text>
                {/* Center date bridge */}
                <line x1="22" y1="43" x2="74" y2="43" stroke="currentColor" strokeWidth="1" />
                <line x1="22" y1="57" x2="74" y2="57" stroke="currentColor" strokeWidth="1" />
                <text x="48" y="52.5" textAnchor="middle" fill="currentColor" fontSize="7" fontFamily="monospace" fontWeight="bold" letterSpacing="1">
                  07 NOV 26
                </text>
                {/* 5 Wavy Postal Cancellation Killer Lines */}
                <path d="M92 22 Q112 14 132 22 T172 22 T212 22 L232 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M94 36 Q114 28 134 36 T174 36 T214 36 L232 33" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M94 50 Q114 42 134 50 T174 50 T214 50 L232 47" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M94 64 Q114 56 134 64 T174 64 T214 64 L232 61" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M92 78 Q112 70 132 78 T172 78 T212 78 L232 75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>

              {/* STAMP 1: INDIA AIR MAIL — Vintage Intaglio Engraved Postage Stamp */}
              <motion.div
                whileHover={{ rotate: 0, y: -5, scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                className="relative drop-shadow-[3px_6px_10px_rgba(0,0,0,0.32)] -rotate-4 z-10"
                title="India Post · Par Avion Air Mail · New Delhi (2026)"
              >
                <div
                  style={POSTAGE_STAMP_MASK}
                  className="w-[96px] h-[118px] sm:w-[104px] sm:h-[128px] bg-[#f6eedc] p-[7px] flex flex-col justify-between"
                >
                  {/* Engraved Inner Frame with Fine Intaglio Scanlines */}
                  <div
                    className="w-full h-full border-[2px] border-[#263c54] bg-[#ebe0c7] p-1.5 flex flex-col justify-between relative overflow-hidden"
                    style={{
                      backgroundImage:
                        'repeating-linear-gradient(0deg, rgba(38,60,84,0.07) 0px, rgba(38,60,84,0.07) 1px, transparent 1px, transparent 3px)',
                    }}
                  >
                    {/* Ornate Corner Rosettes & Inner Hairline Border */}
                    <div className="absolute inset-[2px] border border-[#263c54]/45 pointer-events-none" />
                    <span className="absolute top-0.5 left-0.5 w-1.5 h-1.5 border-r border-b border-[#263c54]/60 pointer-events-none" />
                    <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 border-l border-b border-[#263c54]/60 pointer-events-none" />
                    <span className="absolute bottom-0.5 left-0.5 w-1.5 h-1.5 border-r border-t border-[#263c54]/60 pointer-events-none" />
                    <span className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 border-l border-t border-[#263c54]/60 pointer-events-none" />

                    {/* Top Country & Denomination Header */}
                    <div className="relative z-10 flex items-start justify-between border-b border-[#263c54]/30 pb-0.5">
                      <div className="leading-none">
                        <div className="font-mono text-[5.5px] font-bold tracking-[0.18em] text-[#263c54]/75">
                          भारतीय डाक
                        </div>
                        <div className="font-stamp text-[8px] font-black tracking-[0.14em] text-[#263c54] mt-0.5">
                          INDIA
                        </div>
                      </div>
                      <div className="bg-[#263c54] text-[#f6eedc] px-1 py-0.5 rounded-[1px] font-stamp text-[7.5px] font-black leading-none tracking-wider">
                        ₹20
                      </div>
                    </div>

                    {/* Center Intaglio Engraving: Vintage Twin-Engine Airliner & Globe Meridians */}
                    <div className="relative z-10 my-auto py-0.5 flex flex-col items-center">
                      <svg viewBox="0 0 72 48" className="w-full h-11 text-[#263c54]" fill="none">
                        {/* Guilloche Sun / Globe Medallion */}
                        <circle cx="36" cy="25" r="18" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 1.5" opacity="0.55" />
                        <circle cx="36" cy="25" r="14" stroke="currentColor" strokeWidth="0.7" opacity="0.4" />
                        <ellipse cx="36" cy="25" rx="14" ry="6" stroke="currentColor" strokeWidth="0.6" opacity="0.35" />
                        <ellipse cx="36" cy="25" rx="6" ry="14" stroke="currentColor" strokeWidth="0.6" opacity="0.35" />
                        {/* Radiating Sunbeams */}
                        <path d="M36 3 V7 M16 9 L19 12 M56 9 L53 12 M8 25 H13 M59 25 H64" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
                        {/* Twin-Propeller Dakota Airliner */}
                        <path
                          d="M6 26 L66 17 L61 21 L38 25 L48 35 L42 36 L29 27 L14 30 L10 34 L7 34 L11 27 Z"
                          fill="currentColor"
                        />
                        {/* Upper Wing Highlight */}
                        <path d="M14 16 L58 23" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                        {/* Clouds at bottom */}
                        <path d="M10 42 Q18 38 26 42 T44 42 T62 42" stroke="currentColor" strokeWidth="1" opacity="0.6" />
                      </svg>
                      <div className="font-mono text-[5.5px] font-bold tracking-[0.2em] text-[#263c54]/75 uppercase -mt-0.5">
                        NEW DELHI · 28.61°N
                      </div>
                    </div>

                    {/* Inverted Crimson Bottom Ribbon */}
                    <div className="relative z-10 bg-stamp text-[#f6eedc] text-center py-0.5 px-1 font-stamp text-[7px] font-black uppercase tracking-[0.2em] leading-none shadow-xs">
                      PAR AVION
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* STAMP 2: IEEE XPLORE — Commemorative Research Postage Stamp (Clickable) */}
              <motion.a
                href="https://ieeexplore.ieee.org/document/11441054"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ rotate: 0, y: -5, scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                className="relative drop-shadow-[3px_6px_10px_rgba(0,0,0,0.32)] rotate-3 z-10 cursor-pointer group"
                title="Click to open IEEE Xplore Paper #11441054"
              >
                <div
                  style={POSTAGE_STAMP_MASK}
                  className="w-[96px] h-[118px] sm:w-[104px] sm:h-[128px] bg-[#f6eedc] p-[7px] flex flex-col justify-between"
                >
                  {/* Engraved Burgundy/Sepia Frame */}
                  <div
                    className="w-full h-full border-[2px] border-stamp bg-[#f2e5ce] p-1.5 flex flex-col justify-between relative overflow-hidden"
                    style={{
                      backgroundImage:
                        'repeating-linear-gradient(45deg, rgba(139,38,29,0.055) 0px, rgba(139,38,29,0.055) 1px, transparent 1px, transparent 3px)',
                    }}
                  >
                    <div className="absolute inset-[2px] border border-stamp/45 pointer-events-none" />
                    <span className="absolute top-0.5 left-0.5 w-1.5 h-1.5 border-r border-b border-stamp/60 pointer-events-none" />
                    <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 border-l border-b border-stamp/60 pointer-events-none" />
                    <span className="absolute bottom-0.5 left-0.5 w-1.5 h-1.5 border-r border-t border-stamp/60 pointer-events-none" />
                    <span className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 border-l border-t border-stamp/60 pointer-events-none" />

                    {/* Top Header */}
                    <div className="relative z-10 flex items-start justify-between border-b border-stamp/30 pb-0.5">
                      <div className="leading-none">
                        <div className="font-mono text-[5.5px] font-bold tracking-[0.14em] text-stamp/80">
                          ICAUC · 2026
                        </div>
                        <div className="font-stamp text-[8px] font-black tracking-[0.1em] text-stamp mt-0.5">
                          IEEE XPLORE
                        </div>
                      </div>
                      <div className="border border-stamp text-stamp px-1 py-0.5 font-mono text-[6.5px] font-black leading-none">
                        1ST
                      </div>
                    </div>

                    {/* Center Intaglio Art: Guilloche Rosette + Neural Graph & Archival Laurels */}
                    <div className="relative z-10 my-auto flex flex-col items-center">
                      <svg viewBox="0 0 72 44" className="w-full h-10 text-stamp" fill="none">
                        {/* Outer laurel / compass ring */}
                        <circle cx="36" cy="22" r="17" stroke="currentColor" strokeWidth="0.9" strokeDasharray="3 1.5" opacity="0.6" />
                        <circle cx="36" cy="22" r="13.5" stroke="currentColor" strokeWidth="0.7" opacity="0.4" />
                        {/* Neural Network Graph inside medallion */}
                        <line x1="25" y1="22" x2="36" y2="13" stroke="currentColor" strokeWidth="1.2" />
                        <line x1="25" y1="22" x2="36" y2="31" stroke="currentColor" strokeWidth="1.2" />
                        <line x1="36" y1="13" x2="47" y2="22" stroke="currentColor" strokeWidth="1.2" />
                        <line x1="36" y1="31" x2="47" y2="22" stroke="currentColor" strokeWidth="1.2" />
                        <line x1="36" y1="13" x2="36" y2="31" stroke="currentColor" strokeWidth="1" strokeDasharray="2 1" />
                        <circle cx="25" cy="22" r="2.6" fill="currentColor" />
                        <circle cx="36" cy="13" r="2.6" fill="currentColor" />
                        <circle cx="36" cy="31" r="2.6" fill="currentColor" />
                        <circle cx="47" cy="22" r="2.6" fill="currentColor" />
                        <circle cx="36" cy="22" r="2" fill="var(--c-ink)" />
                      </svg>
                      <div className="font-stamp text-[7.5px] font-black tracking-[0.12em] text-ink leading-none">
                        AI RISK ESTIMATOR
                      </div>
                      <div className="font-mono text-[5.5px] font-bold tracking-[0.15em] text-ink/65 mt-0.5">
                        DOC #11441054
                      </div>
                    </div>

                    {/* Bottom Banner */}
                    <div className="relative z-10 bg-ink text-[#f6eedc] group-hover:bg-stamp transition-colors text-center py-0.5 px-1 font-stamp text-[6.5px] font-black uppercase tracking-[0.18em] leading-none">
                      PUBLISHED PAPER ↗
                    </div>
                  </div>
                </div>
              </motion.a>

              {/* STAMP 3: Official Circular Curved-Text Rubber / Wax Dossier Seal (Interactive) */}
              <div className="relative ml-1 flex items-center justify-center">
                {/* Shockwave ring when stamped */}
                <AnimatePresence>
                  {sealStamped && stampPulseKey > 0 && (
                    <motion.span
                      key={stampPulseKey}
                      initial={{ scale: 0.85, opacity: 0.75 }}
                      animate={{ scale: 1.45, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.55, ease: 'easeOut' }}
                      className="absolute inset-0 rounded-full border-2 border-stamp pointer-events-none z-0"
                    />
                  )}
                </AnimatePresence>

                <motion.button
                  type="button"
                  onClick={handleSealClick}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.9 }}
                  animate={
                    sealStamped
                      ? { scale: [1.28, 0.95, 1], rotate: -10 }
                      : { scale: 0.94, rotate: 0 }
                  }
                  transition={{ type: 'spring', stiffness: 340, damping: 18 }}
                  title="Click to stamp or lift official investigator seal"
                  className="relative z-20 w-[104px] h-[104px] sm:w-[116px] sm:h-[116px] flex items-center justify-center cursor-pointer focus:outline-none"
                >
                  <svg
                    viewBox="0 0 140 140"
                    style={{ filter: 'url(#footer-stamp-grunge)' }}
                    className={`w-full h-full transition-opacity duration-200 ${sealStamped
                        ? 'text-stamp opacity-95 drop-shadow-[0_2px_4px_rgba(139,38,29,0.28)]'
                        : 'text-stamp/30 opacity-60'
                      }`}
                  >
                    <defs>
                      <path
                        id="seal-ring-top"
                        d="M 21,70 A 49,49 0 1,1 119,70"
                      />
                      <path
                        id="seal-ring-bottom"
                        d="M 119,70 A 49,49 0 1,1 21,70"
                      />
                    </defs>

                    {/* Outer Heavy Rubber-Stamp Double Rim */}
                    <circle
                      cx="70"
                      cy="70"
                      r="64"
                      fill={sealStamped ? 'rgba(139, 38, 29, 0.07)' : 'transparent'}
                      stroke="currentColor"
                      strokeWidth="3.5"
                    />
                    <circle
                      cx="70"
                      cy="70"
                      r="58"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeDasharray="6 3"
                    />
                    {/* Inner Ring */}
                    <circle
                      cx="70"
                      cy="70"
                      r="39"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />

                    {/* Curved Perimeter Typography */}
                    <text
                      fill="currentColor"
                      fontSize="7.8"
                      fontFamily="monospace"
                      fontWeight="900"
                      letterSpacing="2.1"
                    >
                      <textPath href="#seal-ring-top" startOffset="50%" textAnchor="middle">
                        ★ PRINCIPAL INVESTIGATOR ★
                      </textPath>
                    </text>

                    <text
                      fill="currentColor"
                      fontSize="7.5"
                      fontFamily="monospace"
                      fontWeight="900"
                      letterSpacing="2.2"
                    >
                      <textPath href="#seal-ring-bottom" startOffset="50%" textAnchor="middle">
                        NEW DELHI · DOSSIER 2026
                      </textPath>
                    </text>

                    {/* Center Crest Stars (Above & Below Center Stamp Bar) */}
                    <text
                      x="70"
                      y="49"
                      textAnchor="middle"
                      fill="currentColor"
                      fontSize="7.5"
                      fontFamily="monospace"
                      fontWeight="bold"
                      letterSpacing="2"
                    >
                      ★★★
                    </text>

                    {/* Angled Rectangular Stamp Banner Across Center */}
                    <rect
                      x="8"
                      y="55"
                      width="124"
                      height="30"
                      rx="2"
                      fill="var(--c-paper)"
                      stroke="currentColor"
                      strokeWidth="2.8"
                    />
                    <rect
                      x="11"
                      y="58"
                      width="118"
                      height="24"
                      fill={sealStamped ? 'currentColor' : 'transparent'}
                    />

                    <text
                      x="70"
                      y="73.5"
                      textAnchor="middle"
                      fill={sealStamped ? 'var(--c-paper)' : 'currentColor'}
                      fontSize="11.5"
                      fontFamily="Special Elite, Courier Prime, monospace"
                      fontWeight="900"
                      letterSpacing="2.4"
                    >
                      {sealStamped ? 'VERIFIED' : 'STAMP ME'}
                    </text>

                    {/* Bottom Sub-code inside inner circle */}
                    <text
                      x="70"
                      y="98"
                      textAnchor="middle"
                      fill="currentColor"
                      fontSize="6.8"
                      fontFamily="monospace"
                      fontWeight="bold"
                      letterSpacing="1.5"
                    >
                      ID: M.M.A.
                    </text>
                  </svg>
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

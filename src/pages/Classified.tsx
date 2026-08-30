import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { PageTransition } from '../components/PageTransition';
import { 
  Play, Pause, ArrowRight, ChevronLeft, ChevronRight,
  Code2, Globe, Database, Layers, Cpu, X
} from 'lucide-react';
import { audioEngine } from '../lib/audio';
import { 
  MONOLOGUE_SECTIONS, 
  MONOLOGUE_AUDIO_SRC, 
  MONOLOGUE_TOTAL_DURATION,
  WordTimestamp 
} from '../data/originMonologue';

// Master flattened word array for 100% gapless word-level synchronization
const ALL_WORDS: (WordTimestamp & { sectionId: string; globalIdx: number })[] = [];
MONOLOGUE_SECTIONS.forEach((section) => {
  section.words.forEach((w) => {
    ALL_WORDS.push({
      ...w,
      sectionId: section.id,
      globalIdx: ALL_WORDS.length,
    });
  });
});

export function Classified() {
  const navigate = useNavigate();

  // Dedicated Voiceover Audio Element
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(MONOLOGUE_TOTAL_DURATION);

  // Responsive Mobile Detection (< 768px)
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Desktop Spread Index (0..3):
  // Spread 0: Closed Cover
  // Spread 1: Open Book Side-by-Side (Page 1 & Page 2)
  // Spread 2: Open Book Side-by-Side (Page 3 & Page 4)
  // Spread 3: Open Book Side-by-Side (Page 5 & Page 6)
  const [currentSpread, setCurrentSpread] = useState<number>(0);
  const currentSpreadRef = useRef<number>(0);

  // Mobile Single Page Index (0..6):
  // Page 0: Cover
  // Page 1: Act I + II (The 5 Phases)
  // Page 2: Act III (Combat Cycles)
  // Page 3: Act IV (The Turning Point)
  // Page 4: Act V (The Builder Creed)
  // Page 5: Act VI (The Resilience Loop)
  // Page 6: Back Cover
  const [mobilePage, setMobilePage] = useState<number>(0);
  const mobilePageRef = useRef<number>(0);
  
  // StPageFlip realistic paper turning leaf state
  const [turningLeafIndex, setTurningLeafIndex] = useState<number | null>(null);
  const [turningDirection, setTurningDirection] = useState<number>(1);
  const isFlippingRef = useRef<boolean>(false);

  // Interactive Easter eggs & Screen shake
  const [creedThud, setCreedThud] = useState<boolean>(false);
  const [screenShake, setScreenShake] = useState<boolean>(false);

  // Touch gesture state
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const TOTAL_SPREADS = 4;
  const TOTAL_MOBILE_PAGES = 7;

  useEffect(() => {
    currentSpreadRef.current = currentSpread;
  }, [currentSpread]);

  useEffect(() => {
    mobilePageRef.current = mobilePage;
  }, [mobilePage]);

  // Turn Desktop Spread with authentic StPageFlip physics
  const goToSpread = (targetSpread: number) => {
    if (targetSpread < 0 || targetSpread >= TOTAL_SPREADS || targetSpread === currentSpreadRef.current || isFlippingRef.current) return;
    
    isFlippingRef.current = true;
    const prev = currentSpreadRef.current;
    const direction = targetSpread > prev ? 1 : -1;

    audioEngine.init();
    audioEngine.playPaper();

    setTurningDirection(direction);
    setTurningLeafIndex(prev);
    setCurrentSpread(targetSpread);
    currentSpreadRef.current = targetSpread;

    setTimeout(() => {
      setTurningLeafIndex(null);
      isFlippingRef.current = false;
    }, 850);
  };

  // Turn Mobile Single Page with authentic StPageFlip physics
  const goToMobilePage = (targetPage: number) => {
    if (targetPage < 0 || targetPage >= TOTAL_MOBILE_PAGES || targetPage === mobilePageRef.current || isFlippingRef.current) return;
    
    isFlippingRef.current = true;
    const prev = mobilePageRef.current;
    const direction = targetPage > prev ? 1 : -1;

    audioEngine.init();
    audioEngine.playPaper();

    setTurningDirection(direction);
    setTurningLeafIndex(prev);
    setMobilePage(targetPage);
    mobilePageRef.current = targetPage;

    setTimeout(() => {
      setTurningLeafIndex(null);
      isFlippingRef.current = false;
    }, 850);
  };

  // Unified Turn Handler
  const handleTurnNext = () => {
    if (isMobile) {
      goToMobilePage(Math.min(TOTAL_MOBILE_PAGES - 1, mobilePage + 1));
    } else {
      goToSpread(Math.min(TOTAL_SPREADS - 1, currentSpread + 1));
    }
  };

  const handleTurnPrev = () => {
    if (isMobile) {
      goToMobilePage(Math.max(0, mobilePage - 1));
    } else {
      goToSpread(Math.max(0, currentSpread - 1));
    }
  };

  // 60fps frame loop for word-level sync & automatic page turning
  const animationFrameRef = useRef<number | null>(null);

  const syncAudioTime = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      const time = audioRef.current.currentTime;
      setCurrentTime(time);

      if (isMobile) {
        // Auto-turn single page on mobile
        let targetPage = 0;
        if (time < 2.2) targetPage = 0; // Cover
        else if (time < 25.8) targetPage = 1; // Act I+II
        else if (time < 43.2) targetPage = 2; // Act III
        else if (time < 57.0) targetPage = 3; // Act IV
        else if (time < 72.4) targetPage = 4; // Act V
        else if (time < 88.0) targetPage = 5; // Act VI
        else targetPage = 6; // Back Cover

        if (targetPage !== mobilePageRef.current && !isFlippingRef.current) {
          goToMobilePage(targetPage);
        }
      } else {
        // Auto-turn spread on desktop
        let targetSpread = 0;
        if (time < 2.2) targetSpread = currentSpreadRef.current === 0 ? 0 : 1;
        else if (time < 43.2) targetSpread = 1; // Open Pages 1 & 2
        else if (time < 72.4) targetSpread = 2; // Open Pages 3 & 4
        else targetSpread = 3; // Open Pages 5 & 6

        if (targetSpread !== currentSpreadRef.current && !isFlippingRef.current) {
          goToSpread(targetSpread);
        }
      }

      animationFrameRef.current = requestAnimationFrame(syncAudioTime);
    }
  }, [isMobile]);

  // Audio Event Listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 1.0;
    audio.muted = false;

    const handlePlay = () => {
      setIsPlaying(true);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = requestAnimationFrame(syncAudioTime);
    };

    const handlePause = () => {
      setIsPlaying(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [syncAudioTime]);

  // Master Play / Pause Toggle
  const handleTogglePlay = () => {
    audioEngine.init();

    if (!audioRef.current) return;

    if (isPlaying) {
      audioEngine.playClick();
      audioRef.current.pause();
    } else {
      if (isMobile) {
        if (mobilePageRef.current === 0) goToMobilePage(1);
      } else {
        if (currentSpreadRef.current === 0) goToSpread(1);
      }

      audioEngine.playClick();
      audioRef.current.play().catch((err) => {
        console.warn("Audio autoplay prevented:", err);
      });
    }
  };

  // Jump voiceover playback to timestamp
  const handleSeek = (time: number, targetSpreadIndex?: number, targetMobilePageIndex?: number) => {
    audioEngine.init();
    audioEngine.playPaper();

    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
      if (!isPlaying) {
        audioRef.current.play().catch((err) => console.warn(err));
      }
    }

    if (isMobile && targetMobilePageIndex !== undefined) {
      goToMobilePage(targetMobilePageIndex);
    } else if (!isMobile && targetSpreadIndex !== undefined) {
      goToSpread(targetSpreadIndex);
    }
  };

  // Exit handler
  const handleExitPage = () => {
    audioEngine.init();
    audioEngine.playClick();
    if (audioRef.current) {
      audioRef.current.pause();
    }
    navigate('/');
  };

  // Wheel listener: Debounced turn
  useEffect(() => {
    let lastWheelTime = 0;
    const handleGlobalWheel = (e: WheelEvent) => {
      const now = Date.now();
      if (now - lastWheelTime < 600 || isFlippingRef.current) return;

      if (Math.abs(e.deltaY) > 20 || Math.abs(e.deltaX) > 20) {
        const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        if (delta > 0) {
          lastWheelTime = now;
          handleTurnNext();
        } else {
          lastWheelTime = now;
          handleTurnPrev();
        }
      }
    };

    window.addEventListener('wheel', handleGlobalWheel, { passive: true });
    return () => {
      window.removeEventListener('wheel', handleGlobalWheel);
    };
  }, [isMobile, currentSpread, mobilePage]);

  // Keyboard navigation (Left / Right / Space / Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        handleTurnNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        handleTurnPrev();
      } else if (e.key === ' ') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.key === 'Escape') {
        handleExitPage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isMobile, currentSpread, mobilePage]);

  // Touch Swipe Handlers (Optimized for Mobile single page turns)
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null || isFlippingRef.current) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (diff > 45) {
      handleTurnNext();
    } else if (diff < -45) {
      handleTurnPrev();
    }
    setTouchStartX(null);
  };

  // Helper to extract section words
  const getSectionWords = (sectionId: string) => {
    const sec = MONOLOGUE_SECTIONS.find((s) => s.id === sectionId);
    return sec ? sec.words : [];
  };

  // Unified Interactive Synchronized Word Renderer
  const renderSyncWords = (
    words: WordTimestamp[], 
    customClass = '',
    targetSpreadIndex?: number,
    targetMobilePageIndex?: number
  ) => {
    return words.map((w, idx) => {
      const nextWord = words[idx + 1];
      const endTime = nextWord ? nextWord.start : w.start + 0.38;
      const isActive = currentTime >= w.start && currentTime < endTime;
      const isPast = currentTime >= endTime;

      return (
        <span
          key={`${w.word}-${w.start}-${idx}`}
          onClick={(e) => {
            e.stopPropagation();
            handleSeek(w.start, targetSpreadIndex, targetMobilePageIndex);
          }}
          className={`inline-block mx-[1.5px] cursor-pointer select-text ${
            isActive 
              ? 'relative z-30 rounded-sm px-[3px] py-[1px] font-black' 
              : isPast
                ? 'opacity-90 font-bold'
                : 'opacity-70 font-medium'
          } ${customClass}`}
          style={isActive ? {
            background: '#ffe600',
            color: '#000',
            transform: 'scale(1.18) translateY(-1px)',
            boxShadow: '0 0 0 2px #000, 0 0 14px 4px #ffe600cc, 0 2px 8px rgba(0,0,0,0.4)',
            textShadow: 'none',
            letterSpacing: '0.03em',
            transition: 'all 0.1s ease',
          } : {
            transition: 'all 0.15s ease',
          }}
        >
          {w.word}
        </span>
      );
    });
  };

  // Dedicated Cover Page Renderer (Page 0)
  const renderCoverPage = () => {
    return (
      <article
        id="page-cover"
        className="w-full h-full bg-stone-900 border-4 border-stone-950 rounded-xs shadow-[24px_28px_50px_rgba(0,0,0,0.85)] flex flex-col justify-between relative overflow-hidden text-white z-20"
      >
        {/* User's Custom Comic Book Cover Artwork */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/moin cover.png" 
            alt="The Amazing Moin Akhtar Comic Book Cover" 
            className="w-full h-full object-cover object-center contrast-105 saturate-105"
          />
          <div 
            className="absolute inset-0 pointer-events-none opacity-10 mix-blend-overlay"
            style={{
              backgroundImage: 'radial-gradient(#000 1.5px, transparent 1.5px)',
              backgroundSize: '8px 8px'
            }}
          />
        </div>

        <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/60 to-transparent pointer-events-none z-30" />

        {/* StPageFlip Interactive Corner Curl Hint */}
        <div 
          onClick={() => isMobile ? goToMobilePage(1) : goToSpread(1)}
          className="absolute bottom-0 right-0 w-16 h-16 cursor-pointer z-40 group flex items-end justify-end p-1"
          title="Peel corner to turn page"
        >
          <div className="w-10 h-10 bg-gradient-to-tl from-amber-100/90 via-white/80 to-transparent border-t border-l border-stone-900/40 shadow-[-4px_-4px_10px_rgba(0,0,0,0.4)] rounded-tl-xs group-hover:scale-125 transition-transform duration-200" />
        </div>

        <div className="my-auto" />

        {/* Bottom Interactive Action Bar */}
        <div className="relative z-10 p-2.5 sm:p-3 pt-0 flex items-center justify-between gap-2">
          <div className="bg-black/85 backdrop-blur-xs text-[#ffe600] font-mono text-[8px] font-black uppercase px-2 py-0.8 border border-stone-900 rounded-2xs shadow-md">
            EARTH-1610 // ORIGIN
          </div>

          <button
            onClick={() => isMobile ? goToMobilePage(1) : goToSpread(1)}
            className="px-3.5 py-1.5 bg-[#ffe600] text-black text-[11px] font-black uppercase border-2 border-stone-950 rounded-xs flex items-center gap-1 shadow-[3px_3px_0_#000] hover:bg-amber-300 transition-all cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
          >
            <span>OPEN COMIC</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </article>
    );
  };

  // Dedicated Left Page Renderer (Page 1, 3, 5)
  const renderLeftPage = (spreadIndex: number) => {
    if (spreadIndex === 1) {
      return (
        <article
          id="page-act1-2"
          className="w-full h-full p-2.5 sm:p-4 flex flex-col justify-between relative overflow-hidden text-stone-950"
        >
          <div 
            className="absolute inset-0 pointer-events-none opacity-15"
            style={{
              backgroundImage: 'radial-gradient(#000 1.5px, transparent 1.5px)',
              backgroundSize: '10px 10px'
            }}
          />

          <div className="relative z-10 flex items-center justify-between border-b-2 border-stone-950 pb-1 font-mono text-[8.5px] sm:text-[9px] font-black uppercase text-stone-950">
            <span className="bg-[#ffe600] border-2 border-stone-950 px-2 py-0.5 tracking-wider shadow-2xs">
              ACT I + II // THE 5 PHASES
            </span>
            <span className="bg-white border-2 border-stone-950 px-1.5 py-0.5 shadow-2xs">
              ORIGIN TIMELINE
            </span>
          </div>

          <div className="relative z-10 grid grid-cols-12 gap-2 items-stretch">
            <div className="col-span-4 bg-white border-3 border-stone-950 rounded-xs p-1 sm:p-1.5 shadow-[3px_3px_0_#000] flex flex-col justify-between relative rotate-[-1deg]">
              <div className="absolute -top-2 -left-2 bg-[#ffe600] text-black font-mono text-[6.5px] sm:text-[7px] font-black px-1 py-0.2 border border-stone-950 rounded-xs shadow-2xs z-20">
                ⚡ ARCHITECT
              </div>
              
              <div className="w-full aspect-square rounded-xs border border-stone-950 overflow-hidden bg-stone-100 shadow-inner relative">
                <img 
                  src="/portrait.webp" 
                  alt="Md Moin Akhtar" 
                  className="w-full h-full object-cover contrast-110 saturate-110"
                />
              </div>

              <div className="mt-1 text-center bg-black text-[#ffe600] py-0.5 px-0.5 border border-black rounded-2xs">
                <span className="font-sans font-black text-[8.5px] sm:text-[9px] block leading-tight uppercase">
                  Moin Akhtar
                </span>
              </div>
            </div>

            <div className="col-span-8 bg-white border-3 border-stone-950 rounded-xl p-2 sm:p-2.5 shadow-[3px_3px_0_#000] flex flex-col justify-between relative">
              <div className="space-y-0.5 sm:space-y-1">
                <h2 className="font-sans font-black text-xs sm:text-base text-stone-950 leading-tight uppercase block border-b border-stone-200 pb-0.5">
                  {renderSyncWords(getSectionWords('hook'), "", 1, 1)}
                </h2>
                <div className="font-mono text-[11px] sm:text-[13px] font-bold text-stone-900 leading-snug">
                  {renderSyncWords(getSectionWords('name'), "", 1, 1)}{' '}
                  <span className="text-stone-800">
                    {renderSyncWords(getSectionWords('identity_intro'), "", 1, 1)}
                  </span>
                </div>
              </div>

              <div className="mt-1 pt-0.5 border-t border-dashed border-stone-300 flex items-center justify-between text-[7px] sm:text-[7.5px] font-mono font-bold text-stone-600">
                <span>// EARTH-1610</span>
                <span className="text-rose-700 font-black">AI & DATA SCIENTIST</span>
              </div>

              <div className="absolute -left-2 top-4 sm:top-5 w-2 sm:w-2.5 h-2 sm:h-2.5 bg-white border-b-3 border-l-3 border-stone-950 rotate-45" />
            </div>
          </div>

          <div className="relative z-10 p-1.5 sm:p-2 bg-[#ffe600] border-2 border-stone-950 rounded-xs text-[11px] sm:text-[13px] font-mono font-black text-stone-950 leading-snug shadow-[2px_2px_0_#000] rotate-[-0.5deg] flex items-center gap-1.5">
            <span className="font-mono text-[7.5px] sm:text-[8px] font-black uppercase text-white bg-black px-1.5 py-0.5 rounded-2xs">
              LOG:
            </span>
            <span>{renderSyncWords(getSectionWords('wakeup'), "text-black", 1, 1)}</span>
          </div>

          <div className="relative z-10 grid grid-cols-12 gap-1 sm:gap-1.5 flex-1 items-stretch">
            <div 
              onClick={() => handleSeek(17.92, 1, 1)}
              className="col-span-6 p-1.5 sm:p-2 bg-[#cffafe] border-2 border-stone-950 rounded-xs flex flex-col justify-between shadow-[3px_3px_0_#000] cursor-pointer hover:border-cyan-700 transition-colors relative overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-cyan-300 pb-0.5">
                <span className="font-mono font-black text-[10px] sm:text-xs text-cyan-950">1 CODE</span>
                <Code2 className="h-3 sm:h-3.5 w-3 sm:w-3.5 text-cyan-800" />
              </div>
              <span className="font-sans font-black text-[11px] sm:text-sm text-stone-950 uppercase leading-tight tracking-tight my-auto">
                {renderSyncWords(getSectionWords('evolution_steps').slice(0, 4), "", 1, 1)}
              </span>
            </div>

            <div 
              onClick={() => handleSeek(22.62, 1, 1)}
              className="col-span-6 p-1.5 sm:p-2 bg-[#dcfce7] border-2 border-stone-950 rounded-xs flex flex-col justify-between shadow-[3px_3px_0_#000] cursor-pointer hover:border-emerald-700 transition-colors relative overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-emerald-300 pb-0.5">
                <span className="font-mono font-black text-[10px] sm:text-xs text-emerald-950">4 ML</span>
                <Layers className="h-3 sm:h-3.5 w-3 sm:w-3.5 text-emerald-800" />
              </div>
              <span className="font-sans font-black text-[11px] sm:text-sm text-stone-950 uppercase leading-tight tracking-tight my-auto">
                {renderSyncWords(getSectionWords('evolution_steps').slice(10, 13), "", 1, 1)}
              </span>
            </div>

            <div 
              onClick={() => handleSeek(19.42, 1, 1)}
              className="col-span-4 p-1.5 sm:p-2 bg-[#fed7aa] border-2 border-stone-950 rounded-xs flex flex-col justify-between shadow-[3px_3px_0_#000] cursor-pointer hover:border-amber-700 transition-colors"
            >
              <div className="flex items-center justify-between border-b border-amber-300 pb-0.5">
                <span className="font-mono font-black text-[9px] sm:text-[10px] text-amber-950">2 WEB</span>
                <Globe className="h-3 w-3 text-amber-800" />
              </div>
              <span className="font-sans font-black text-[10px] sm:text-xs text-stone-950 uppercase leading-tight tracking-tight my-auto">
                {renderSyncWords(getSectionWords('evolution_steps').slice(4, 8), "", 1, 1)}
              </span>
            </div>

            <div 
              onClick={() => handleSeek(21.00, 1, 1)}
              className="col-span-4 p-1.5 sm:p-2 bg-[#bae6fd] border-2 border-stone-950 rounded-xs flex flex-col justify-between shadow-[3px_3px_0_#000] cursor-pointer hover:border-sky-700 transition-colors"
            >
              <div className="flex items-center justify-between border-b border-sky-300 pb-0.5">
                <span className="font-mono font-black text-[9px] sm:text-[10px] text-sky-950">3 DATA</span>
                <Database className="h-3 w-3 text-sky-800" />
              </div>
              <span className="font-sans font-black text-[10px] sm:text-xs text-stone-950 uppercase my-auto leading-tight tracking-tight">
                {renderSyncWords(getSectionWords('evolution_steps').slice(8, 10), "", 1, 1)}
              </span>
            </div>

            <div 
              onClick={() => handleSeek(24.18, 1, 1)}
              className="col-span-4 p-1.5 sm:p-2 bg-stone-950 text-white border-2 border-stone-950 rounded-xs flex flex-col justify-between shadow-[3px_3px_0_#000] cursor-pointer hover:bg-stone-900 transition-colors"
            >
              <div className="flex items-center justify-between border-b border-stone-800 pb-0.5">
                <span className="font-mono font-black text-[9px] sm:text-[10px] text-[#ffe600]">5 AI</span>
                <Cpu className="h-3 w-3 text-[#ffe600]" />
              </div>
              <span className="font-sans font-black text-[10px] sm:text-xs text-white uppercase my-auto leading-tight tracking-tight">
                {renderSyncWords(getSectionWords('evolution_steps').slice(13, 16), "text-white", 1, 1)}
              </span>
            </div>
          </div>

          <div className="relative z-10 border-t-2 border-stone-950 pt-1 flex items-center justify-between text-[8px] sm:text-[8.5px] font-mono font-black">
            <span className="text-stone-600">ACT I + II // THE 5 PHASES</span>
            <span className="bg-[#ffe600] text-black px-1.5 py-0.2 border border-stone-950 shadow-2xs">PG. 02</span>
          </div>
        </article>
      );
    }

    if (spreadIndex === 2) {
      return (
        <article
          id="page-act4"
          className="w-full h-full p-3 sm:p-4 flex flex-col justify-between gap-2 sm:gap-2.5 relative overflow-hidden text-stone-950"
        >
          <div 
            className="absolute inset-0 pointer-events-none opacity-40"
            style={{
              backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.06) 1px, transparent 1px)',
              backgroundSize: '16px 16px'
            }}
          />

          {/* Top Header */}
          <div className="relative z-10 flex items-center justify-between border-b-2 border-stone-950 pb-1 font-mono text-[8.5px] sm:text-[9.5px] font-black uppercase text-stone-950">
            <span className="bg-[#ffe600] border-2 border-stone-950 px-2 py-0.5 tracking-wider shadow-2xs">
              ACT IV // THE TURNING POINT
            </span>
            <span className="bg-white border-2 border-stone-950 px-1.5 py-0.5 shadow-2xs text-rose-800 font-bold">
              ⚡ OVERCOMING COLLAPSE
            </span>
          </div>

          {/* Top Box (Enlarged with larger text & substantial padding) */}
          <div className="relative z-10 p-3 sm:p-4 bg-white border-3 border-stone-950 rounded-lg shadow-[4px_4px_0_#000] flex flex-col justify-between gap-1.5">
            <div className="flex items-center justify-between border-b border-stone-200 pb-1">
              <span className="font-mono text-[8.5px] sm:text-[9.5px] font-black uppercase text-stone-600 tracking-wider">
                ARCHIVAL LOG // MOMENT OF CLARITY
              </span>
              <span className="font-mono text-[8px] sm:text-[8.5px] font-black text-rose-700 bg-rose-50 px-2 py-0.5 border border-rose-200 rounded-2xs">
                0x4E9A
              </span>
            </div>
            
            <p className="font-sans font-black text-sm sm:text-[15px] md:text-base text-stone-950 uppercase leading-snug tracking-tight">
              {renderSyncWords(getSectionWords('realization'), "", 2, 3)}
            </p>
          </div>

          {/* Middle Spider-Man Action Image Panel */}
          <div className="relative z-10 w-full flex-1 min-h-[160px] sm:min-h-[200px] md:min-h-[220px] rounded-xs border-3 border-stone-950 overflow-hidden shadow-[4px_4px_0_#000] bg-black flex items-center justify-center">
            <img 
              src="/Spider-Man-Rubble.avif" 
              alt="Spider-Man Lifting The Rubble" 
              className="w-full h-full object-cover object-center contrast-115 brightness-95"
            />
            <div className="absolute top-2 left-2 bg-[#ffe600] text-black font-mono text-[7.5px] sm:text-[8.5px] font-black px-2 py-0.5 border border-stone-950 rounded-2xs shadow-2xs rotate-[-1deg]">
              ⚡ RISING THROUGH FAILURE
            </div>

            <div className="absolute bottom-2 right-2 bg-black/85 text-white font-mono text-[7px] sm:text-[7.5px] font-bold px-2 py-0.5 border border-white/40 rounded-2xs backdrop-blur-xs">
              SYSTEM REFACTOR // 2026
            </div>
          </div>

          {/* Bottom Box (Enlarged with prominent text and bold quote callout) */}
          <div className="relative z-10 p-3 sm:p-4 bg-[#ffe600] border-3 border-stone-950 rounded-xs shadow-[4px_4px_0_#000] rotate-[-0.5deg] flex flex-col justify-between gap-2">
            <div className="flex items-center justify-between border-b border-stone-950/30 pb-1">
              <span className="font-mono text-[8.5px] sm:text-[9.5px] font-black text-stone-950 uppercase tracking-wider">
                CLASSIFIED AXIOM // THE BUILDER'S FORMULA
              </span>
              <span className="font-mono text-[7.5px] sm:text-[8px] text-white bg-black font-black px-2 py-0.5 rounded-2xs shadow-2xs">
                DECLAS
              </span>
            </div>

            <p className="font-sans font-black text-xs sm:text-[13.5px] md:text-[14px] text-stone-950 uppercase leading-snug tracking-tight">
              {renderSyncWords(getSectionWords('confession').slice(0, 10), "text-stone-950", 2, 3)}
            </p>

            <div 
              onClick={() => handleSeek(55.14, 2, 3)}
              className="p-2.5 sm:p-3 bg-white text-stone-950 border-2 border-stone-950 rounded-xs shadow-[3px_3px_0_#000] cursor-pointer hover:bg-stone-50 transition-colors"
            >
              <p className="font-sans font-black text-sm sm:text-base md:text-[17px] text-stone-950 uppercase leading-tight tracking-tight text-center">
                {renderSyncWords(getSectionWords('confession').slice(10), "text-black", 2, 3)}
              </p>
            </div>

            <div className="flex items-center justify-between text-[7.5px] sm:text-[8.5px] font-mono text-stone-900 font-black uppercase pt-0.5">
              <span>★ OPERATING PRINCIPLE</span>
              <span>EARTH-1610 PROTOCOL</span>
            </div>
          </div>

          {/* Bottom Page Footer */}
          <div className="relative z-10 border-t-2 border-stone-950 pt-1 flex items-center justify-between text-[8px] sm:text-[8.5px] font-mono font-black">
            <span className="text-stone-600">ACT IV // CLASSIFIED REALIZATION</span>
            <span className="bg-[#ffe600] text-black px-1.5 py-0.2 border border-stone-950 shadow-2xs">PG. 04</span>
          </div>
        </article>
      );
    }

    if (spreadIndex === 3) {
      return (
        <article
          id="page-act6"
          className="w-full h-full p-2.5 sm:p-4 flex flex-col justify-between relative overflow-hidden text-stone-950"
        >
          <div 
            className="absolute inset-0 pointer-events-none opacity-40"
            style={{
              backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.06) 1px, transparent 1px)',
              backgroundSize: '16px 16px'
            }}
          />

          <div className="relative z-10 flex items-center justify-between border-b-2 border-stone-950 pb-1 font-mono text-[8.5px] sm:text-[9px] font-black uppercase text-stone-950">
            <span className="bg-[#ffe600] border-2 border-stone-950 px-2 py-0.5 tracking-wider shadow-2xs">
              ACT VI // THE RESILIENCE LOOP
            </span>
            <span className="bg-rose-700 text-white border-2 border-stone-950 px-1.5 py-0.5 shadow-2xs font-black">
              ⚡ SPLASH FINALE
            </span>
          </div>

          <div className="relative z-10 p-1.5 sm:p-2 bg-white border-3 border-stone-950 rounded-lg shadow-[3px_3px_0_#000] flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-stone-200 pb-0.5 mb-0.5">
              <span className="font-mono text-[8px] sm:text-[8.5px] font-black uppercase text-stone-600">
                ORIGIN MONOLOGUE // RESILIENCE
              </span>
              <span className="font-mono text-[7px] sm:text-[7.5px] font-black bg-black text-[#ffe600] px-1.5 py-0.2 rounded-2xs shadow-2xs">
                72.6s ➔ 79.9s
              </span>
            </div>
            <p className="font-sans font-black text-xs sm:text-[12.5px] text-stone-950 uppercase leading-snug tracking-tight">
              {renderSyncWords(getSectionWords('resilience').slice(0, 23), "text-stone-950", 3, 5)}
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-12 gap-1.5 sm:gap-2 flex-1 min-h-[130px] sm:min-h-[180px]">
            <div className="col-span-6 h-full min-h-[120px] rounded-xs border-3 border-stone-950 overflow-hidden shadow-[4px_4px_0_#000] bg-black relative flex items-center justify-center">
              <img 
                src="/black spider cover.jpg" 
                alt="Spider-Man Resurrection" 
                className="w-full h-full object-cover object-top contrast-110"
              />
              <div className="absolute top-1.5 left-1.5 bg-[#ffe600] text-black font-mono text-[6.5px] sm:text-[7px] font-black px-1.5 py-0.5 border border-stone-950 rounded-2xs shadow-2xs rotate-[-1deg]">
                ⚡ RESURRECTION
              </div>
            </div>

            <div className="col-span-6 flex flex-col justify-between gap-1 h-full min-h-[120px]">
              <div 
                onClick={() => handleSeek(79.98, 3, 5)} 
                className="p-1 bg-[#fef08a] border-2 border-stone-950 rounded-2xs shadow-2xs flex-1 flex flex-col justify-center"
              >
                <span className="font-mono text-[6.5px] sm:text-[7px] font-black text-rose-800 uppercase block">01 // VISION</span>
                <p className="font-sans font-black text-[10px] sm:text-xs text-stone-950 uppercase leading-none">
                  {renderSyncWords(getSectionWords('resilience').slice(23, 28), "text-stone-950", 3, 5)}
                </p>
              </div>

              <div 
                onClick={() => handleSeek(82.32, 3, 5)} 
                className="p-1 bg-[#cffafe] border-2 border-stone-950 rounded-2xs shadow-2xs flex-1 flex flex-col justify-center"
              >
                <span className="font-mono text-[6.5px] sm:text-[7px] font-black text-cyan-900 uppercase block">02 // MASTERY</span>
                <p className="font-sans font-black text-[10px] sm:text-xs text-stone-950 uppercase leading-none">
                  {renderSyncWords(getSectionWords('resilience').slice(28, 32), "text-stone-950", 3, 5)}
                </p>
              </div>

              <div 
                onClick={() => handleSeek(83.80, 3, 5)} 
                className="p-1 bg-[#dcfce7] border-2 border-stone-950 rounded-2xs shadow-2xs flex-1 flex flex-col justify-center"
              >
                <span className="font-mono text-[6.5px] sm:text-[7px] font-black text-emerald-900 uppercase block">03 // EVOLUTION</span>
                <p className="font-sans font-black text-[10px] sm:text-xs text-stone-950 uppercase leading-none">
                  {renderSyncWords(getSectionWords('resilience').slice(32, 36), "text-stone-950", 3, 5)}
                </p>
              </div>

              <div 
                onClick={() => handleSeek(85.64, 3, 5)} 
                className="p-1 bg-[#ffe4e6] border-2 border-stone-950 rounded-2xs shadow-2xs flex-1 flex flex-col justify-center"
              >
                <span className="font-mono text-[6.5px] sm:text-[7px] font-black text-rose-900 uppercase block">04 // SELF</span>
                <p className="font-sans font-black text-[10px] sm:text-xs text-stone-950 uppercase leading-none">
                  {renderSyncWords(getSectionWords('resilience').slice(36), "text-stone-950", 3, 5)}
                </p>
              </div>
            </div>
          </div>

          <div 
            onClick={() => handleSeek(98.92, 3, 5)}
            className="relative z-10 p-1.5 sm:p-2 bg-white border-3 border-stone-950 rounded-xs shadow-[4px_4px_0_#000] text-center flex flex-col justify-between gap-1"
          >
            <p className="font-sans font-black text-[11px] sm:text-[13px] text-stone-900 uppercase leading-snug">
              {renderSyncWords(getSectionWords('climax').slice(0, 34), "", 3, 5)}
            </p>

            <h2 className="font-sans font-black text-lg sm:text-2xl md:text-3xl text-rose-600 uppercase tracking-tighter leading-none [text-shadow:2px_2px_0_#ffe600,3px_3px_0_#000]">
              {renderSyncWords(getSectionWords('climax').slice(34), "text-rose-600", 3, 5)}
            </h2>

            <div className="pt-0.5 flex items-center justify-between border-t border-stone-200">
              <span className="px-1.5 py-0.2 bg-black text-[#ffe600] font-mono text-[7px] sm:text-[8px] font-black uppercase rounded-2xs">
                ★ COMPLETED
              </span>
              <span className="font-['Caveat',cursive] text-stone-950 font-black text-sm sm:text-lg">
                Md Moin Akhtar ✍️
              </span>
            </div>
          </div>

          <div className="relative z-10 border-t-2 border-stone-950 pt-1 flex items-center justify-between text-[8px] sm:text-[8.5px] font-mono font-black text-stone-950">
            <span>ACT VI // GRAND FINALE</span>
            <span className="bg-[#ffe600] text-black px-1.5 py-0.2 border border-stone-950 shadow-2xs">PG. 06</span>
          </div>
        </article>
      );
    }

    return null;
  };

  // Dedicated Right Page Renderer (Page 2, 4, 6)
  const renderRightPage = (spreadIndex: number) => {
    if (spreadIndex === 0) {
      return renderCoverPage();
    }

    if (spreadIndex === 1) {
      return (
        <article
          id="page-act3"
          className="w-full h-full p-2.5 sm:p-4 flex flex-col justify-between relative overflow-hidden text-stone-950 bg-[#fbf9f4]"
        >
          <div 
            className="absolute inset-0 pointer-events-none opacity-15"
            style={{
              backgroundImage: 'radial-gradient(#000 1.5px, transparent 1.5px)',
              backgroundSize: '10px 10px'
            }}
          />

          <div className="relative z-10 flex items-center justify-between border-b-2 border-stone-950 pb-1 font-mono text-[8.5px] sm:text-[9px] font-black uppercase text-stone-950">
            <span className="bg-[#ffe600] border-2 border-stone-950 px-2 py-0.5 tracking-wider shadow-2xs">
              ACT III // COMBAT CYCLES
            </span>
            <span className="bg-white border-2 border-stone-950 px-1.5 py-0.5 shadow-2xs">
              ESCALATION
            </span>
          </div>

          <div className="relative z-10 space-y-0.5">
            <div className="flex items-center justify-between font-mono text-[7px] sm:text-[8px] font-bold text-stone-700 uppercase">
              <span>01. CODE</span>
              <span>02. WEB</span>
              <span>03. DATA</span>
              <span>04. ML</span>
              <span className="text-rose-700 font-black">05. AI</span>
            </div>
            <div className="h-1.5 sm:h-2 rounded-xs border-2 border-stone-950 flex overflow-hidden shadow-2xs">
              <div className="flex-1 bg-cyan-400" />
              <div className="flex-1 bg-amber-400" />
              <div className="flex-1 bg-sky-400" />
              <div className="flex-1 bg-emerald-400" />
              <div className="flex-1 bg-rose-600" />
            </div>
          </div>

          <div className="relative z-10 flex flex-col justify-between flex-1 gap-1.5 sm:gap-2 my-auto">
            <div 
              onClick={() => handleSeek(25.80, 1, 2)}
              className="p-2 sm:p-2.5 bg-[#fef08a] text-black border-3 border-stone-950 rounded-xs shadow-[3px_3px_0_#000] cursor-pointer hover:border-amber-600 transition-colors flex items-center gap-2 sm:gap-3 flex-1"
            >
              <div className="flex-1 flex flex-col justify-between h-full">
                <div className="flex items-center gap-1.5 border-b border-stone-950/20 pb-0.5">
                  <span className="font-mono font-black text-sm sm:text-base text-stone-950">01</span>
                  <span className="font-mono font-black text-[8px] sm:text-[9px] uppercase bg-black text-[#ffe600] px-1.5 py-0.2 rounded-2xs">
                    ITERATION LOOP
                  </span>
                </div>
                <p className="font-sans font-black text-[11px] sm:text-[13px] text-stone-950 uppercase leading-snug tracking-tight my-auto">
                  {renderSyncWords(getSectionWords('cycle_iteration'), "text-black", 1, 2)}
                </p>
                <div className="font-mono text-[7px] sm:text-[7.5px] font-bold text-stone-600">
                  // PROTOTYPE v2.4
                </div>
              </div>

              <div className="w-20 sm:w-28 h-full aspect-[4/3] shrink-0 rounded-xs border-2 border-stone-950 overflow-hidden bg-white shadow-2xs relative">
                <img 
                  src="/cassendra-dashboard.png" 
                  alt="Prototype System" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div 
              onClick={() => handleSeek(30.40, 1, 2)}
              className="p-2 sm:p-2.5 bg-[#ffe600] border-3 border-stone-950 rounded-xs shadow-[4px_4px_0_#000] rotate-[-0.5deg] cursor-pointer flex items-center gap-2 sm:gap-3 flex-1 relative overflow-hidden"
            >
              <div className="w-20 sm:w-28 h-full aspect-[4/3] shrink-0 rounded-xs border-2 border-stone-950 overflow-hidden shadow-xs bg-white relative">
                <img 
                  src="/hermeswin2-optimized.jpg" 
                  alt="Hackathon Trophy Win" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-0 right-0 bg-rose-600 text-white font-mono font-black text-[6px] sm:text-[6.5px] px-1 py-0.2 uppercase border-b border-l border-stone-950">
                  🏆 1ST PLACE
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-between h-full text-left">
                <div className="flex items-center gap-1.5 border-b border-stone-950/30 pb-0.5">
                  <span className="font-mono font-black text-sm sm:text-base text-stone-950">02</span>
                  <span className="font-mono font-black text-[8px] sm:text-[9px] uppercase bg-rose-700 text-white px-1.5 py-0.2 rounded-2xs">
                    48H HACKATHONS
                  </span>
                </div>
                <p className="font-sans font-black text-[11px] sm:text-[13px] text-stone-950 uppercase leading-snug tracking-tight my-auto">
                  {renderSyncWords(getSectionWords('cycle_hackathons'), "text-black", 1, 2)}
                </p>
                <div className="font-['Caveat',cursive] text-rose-800 text-[11px] sm:text-[13px] font-black">
                  ⚡ Trophy Victory!
                </div>
              </div>
            </div>

            <div 
              onClick={() => handleSeek(35.04, 1, 2)}
              className="p-2 sm:p-2.5 bg-rose-600 text-white border-3 border-stone-950 rounded-xs shadow-[4px_4px_0_#000] cursor-pointer hover:bg-rose-700 transition-colors flex items-center gap-2 sm:gap-3 flex-1"
            >
              <div className="flex-1 flex flex-col justify-between h-full">
                <div className="flex items-center justify-between border-rose-400/50 pb-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-black text-sm sm:text-base text-[#ffe600]">03</span>
                    <span className="font-mono font-black text-[8px] sm:text-[9px] uppercase bg-black text-white px-1.5 py-0.2 rounded-2xs">
                      APPLIED AI
                    </span>
                  </div>
                  <span className="font-mono text-[7px] sm:text-[7.5px] font-black text-yellow-300">
                    LIVE
                  </span>
                </div>
                <p className="font-sans font-black text-[11px] sm:text-[13px] text-white uppercase leading-snug tracking-tight my-auto">
                  {renderSyncWords(getSectionWords('cycle_applied'), "text-white", 1, 2)}
                </p>
                <div className="font-mono text-[7px] sm:text-[7.5px] font-bold text-rose-200">
                  // DEPLOYED
                </div>
              </div>

              <div className="w-20 sm:w-28 h-full aspect-[4/3] shrink-0 rounded-xs border-2 border-white overflow-hidden bg-stone-900 shadow-2xs relative">
                <img 
                  src="/devacation-mockup.jpg" 
                  alt="Applied Production System" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* StPageFlip Interactive Corner Curl Hint */}
          <div 
            onClick={() => isMobile ? goToMobilePage(3) : goToSpread(2)}
            className="absolute bottom-0 right-0 w-14 h-14 cursor-pointer z-40 group flex items-end justify-end p-1"
            title="Turn page ➔"
          >
            <div className="w-8 h-8 bg-gradient-to-tl from-amber-200/80 via-white/70 to-transparent border-t border-l border-stone-800/30 shadow-[-3px_-3px_8px_rgba(0,0,0,0.3)] rounded-tl-2xs group-hover:scale-125 transition-transform duration-200" />
          </div>

          <div className="relative z-10 border-t-2 border-stone-950 pt-1 flex items-center justify-between text-[8px] sm:text-[8.5px] font-mono font-black">
            <span className="text-stone-600">ACT III // 3 COMBAT CYCLES</span>
            <span className="bg-[#ffe600] text-black px-1.5 py-0.2 border border-stone-950 shadow-2xs">PG. 03</span>
          </div>
        </article>
      );
    }

    if (spreadIndex === 2) {
      return (
        <article
          id="page-act5"
          onClick={() => {
            setCreedThud(true);
            setScreenShake(true);
            setTimeout(() => {
              setCreedThud(false);
              setScreenShake(false);
            }, 350);
            handleSeek(70.80, 2, 4);
          }}
          className="w-full h-full p-2.5 sm:p-4 flex flex-col justify-between relative overflow-hidden text-stone-950 bg-[#fbf9f4]"
        >
          <div 
            className="absolute inset-0 pointer-events-none opacity-40"
            style={{
              backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.06) 1px, transparent 1px)',
              backgroundSize: '16px 16px'
            }}
          />

          <div className="relative z-10 flex items-center justify-between border-b-2 border-stone-950 pb-1 font-mono text-[8.5px] sm:text-[9px] font-black uppercase text-stone-950">
            <span className="bg-[#ffe600] border-2 border-stone-950 px-2 py-0.5 tracking-wider shadow-2xs">
              ACT V // THE BUILDER CREED
            </span>
            <span className="bg-rose-700 text-white border-2 border-stone-950 px-1.5 py-0.5 shadow-2xs font-black">
              ⚡ PASSION
            </span>
          </div>

          <div className="relative z-10 p-2 sm:p-2.5 bg-white border-3 border-stone-950 rounded-xs shadow-[4px_4px_0_#000] flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-stone-200 pb-0.5 mb-1">
              <span className="font-mono text-[8px] sm:text-[8.5px] font-black uppercase text-stone-600">
                ORIGIN MONOLOGUE // THE CALLING
              </span>
              <span className="font-mono text-[7px] sm:text-[7.5px] font-black bg-[#ffe600] text-black px-1.5 py-0.2 border border-stone-950 rounded-2xs">
                57.0s ➔ 66.8s
              </span>
            </div>
            <p className="font-sans font-black text-xs sm:text-[13.5px] text-stone-950 uppercase leading-snug tracking-tight">
              {renderSyncWords(getSectionWords('creed').slice(0, 24), "text-stone-950", 2, 4)}
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-12 gap-1.5 sm:gap-2 flex-1 min-h-[130px] sm:min-h-[180px]">
            <div className="col-span-7 h-full min-h-[120px] rounded-xs border-3 border-stone-950 overflow-hidden shadow-[4px_4px_0_#000] bg-black relative flex items-center justify-center">
              <img 
                src="/leave being.jpg" 
                alt="Spider-Man No More" 
                className="w-full h-full object-cover object-top contrast-110"
              />
              <div className="absolute top-1.5 left-1.5 bg-black/90 text-[#ffe600] font-mono text-[7px] sm:text-[7.5px] font-black px-1.5 py-0.5 border border-yellow-400/50 rounded-2xs shadow-2xs">
                NEVER WALKING AWAY
              </div>
            </div>

            <div className="col-span-5 flex flex-col justify-between h-full min-h-[120px] bg-[#ffe600] border-3 border-stone-950 rounded-xs shadow-[4px_4px_0_#000] p-1.5 sm:p-2 rotate-[-0.5deg]">
              <div className="flex items-center gap-1 sm:gap-1.5 border-b border-stone-950/30 pb-0.5 sm:pb-1">
                <div className="w-6 sm:w-8 h-6 sm:h-8 shrink-0 rounded-2xs border-2 border-stone-950 overflow-hidden bg-white shadow-2xs">
                  <img 
                    src="/portrait.webp" 
                    alt="Md Moin Akhtar" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="font-mono text-[7px] sm:text-[8px] font-black text-stone-950 uppercase leading-none">
                  ⚡ ARCHITECT
                </span>
              </div>
              <p className="font-sans font-black text-sm sm:text-[15px] md:text-base text-stone-950 uppercase leading-snug my-auto">
                {renderSyncWords(getSectionWords('creed').slice(24, 38), "text-stone-950", 2, 4)}
              </p>
            </div>
          </div>

          <div className="relative z-10 text-center p-2 sm:p-2.5 bg-[#ffe600] border-3 border-stone-950 rounded-xs shadow-[4px_4px_0_#000] flex flex-col items-center justify-center gap-1">
            <h2 className="font-sans font-black text-lg sm:text-2xl md:text-3xl text-stone-950 uppercase tracking-tight leading-none">
              {renderSyncWords(getSectionWords('creed').slice(38), "text-black", 2, 4)}
            </h2>

            <div className={`inline-block px-4 sm:px-5 py-0.5 bg-rose-600 text-white font-sans font-black text-xs sm:text-base uppercase tracking-wider border-2 border-stone-950 shadow-[3px_3px_0_#000] rotate-[-2deg] transition-transform hover:scale-105 active:scale-95 ${
              creedThud ? 'scale-115' : ''
            }`}>
              💥 THUD!
            </div>
          </div>

          {/* StPageFlip Interactive Corner Curl Hint */}
          <div 
            onClick={() => isMobile ? goToMobilePage(5) : goToSpread(3)}
            className="absolute bottom-0 right-0 w-14 h-14 cursor-pointer z-40 group flex items-end justify-end p-1"
            title="Turn page ➔"
          >
            <div className="w-8 h-8 bg-gradient-to-tl from-amber-200/80 via-white/70 to-transparent border-t border-l border-stone-800/30 shadow-[-3px_-3px_8px_rgba(0,0,0,0.3)] rounded-tl-2xs group-hover:scale-125 transition-transform duration-200" />
          </div>

          <div className="relative z-10 border-t-2 border-stone-950 pt-1 flex items-center justify-between text-[8px] sm:text-[8.5px] font-mono font-black text-stone-950">
            <span>ACT V // THE ULTIMATE CREED</span>
            <span className="bg-[#ffe600] text-black px-1.5 py-0.2 border border-stone-950 shadow-2xs">PG. 05</span>
          </div>
        </article>
      );
    }

    if (spreadIndex === 3) {
      return (
        <article
          id="page-ad"
          className="w-full h-full p-2.5 sm:p-4 flex flex-col justify-between relative overflow-hidden text-white bg-[#881337]"
        >
          <div 
            className="absolute inset-0 pointer-events-none opacity-15"
            style={{
              backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px), linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '12px 12px'
            }}
          />

          <div className="relative z-10 flex items-center justify-between border-b-2 border-stone-950 pb-1 font-mono text-[8.5px] sm:text-[9px] font-black uppercase text-stone-950">
            <span className="bg-[#ffe600] border-2 border-stone-950 px-2 py-0.5 tracking-wider shadow-2xs">
              EARTH-1610 // BACK COVER
            </span>
            <span className="bg-white text-stone-950 border-2 border-stone-950 px-1.5 py-0.5 shadow-2xs font-bold">
              ★ COLLECTOR'S EDITION ★
            </span>
          </div>

          <div className="relative z-10 p-2 sm:p-2.5 bg-white border-3 border-stone-950 rounded-xs shadow-[4px_4px_0_#000] text-center flex flex-col justify-between gap-1 text-stone-950">
            <div className="flex items-center justify-between border-b border-stone-200 pb-0.5">
              <span className="font-mono text-[8px] sm:text-[8.5px] font-black uppercase text-rose-800">
                OFFICIAL SAGA DOSSIER
              </span>
              <span className="font-mono text-[7px] sm:text-[7.5px] font-black bg-stone-100 px-1.5 py-0.2 border border-stone-300 rounded-2xs text-stone-700">
                VOL. 1 COMPLETE
              </span>
            </div>
            
            <h2 className="font-sans font-black text-sm sm:text-lg md:text-xl text-stone-950 uppercase tracking-tight leading-tight [text-shadow:1px_1px_0_#ffe600]">
              THE CLASSIFIED ORIGIN OF MOIN AKHTAR
            </h2>
            
            <p className="font-mono font-bold text-[11px] sm:text-[13px] text-stone-800 leading-snug">
              “From an 18-year-old with a laptop and a head full of questions... to winning hackathons and deploying real-world AI systems.”
            </p>
          </div>

          <div className="relative z-10 p-2 bg-[#ffe600] border-3 border-stone-950 rounded-xs shadow-[4px_4px_0_#000] rotate-[-0.5deg] flex flex-col justify-between gap-1 flex-1 min-h-[90px] sm:min-h-[110px] text-stone-950">
            <div className="flex items-center justify-between border-b border-stone-950/30 pb-0.5">
              <span className="font-mono text-[8px] sm:text-[8.5px] font-black text-stone-950 uppercase tracking-wider">
                ⚡ COMING UP IN ISSUE #02:
              </span>
              <span className="font-mono text-[7px] sm:text-[7.5px] text-white bg-black font-black px-1.5 py-0.2 rounded-2xs shadow-2xs">
                NEXT ARC
              </span>
            </div>

            <p className="font-sans font-black text-xs sm:text-sm text-stone-950 uppercase leading-snug my-auto">
              AUTONOMOUS AI AGENTS, MULTIMODAL INTELLIGENCE & NEXT-GENERATION CLOUD ARCHITECTURES.
            </p>

            <div className="flex items-center justify-between font-mono text-[7.5px] sm:text-[8px] font-bold text-stone-900 pt-0.5 border-t border-stone-950/20">
              <span>DIRECTED BY: MD MOIN AKHTAR</span>
              <span className="font-black uppercase text-rose-800">COMING 2026</span>
            </div>
          </div>

          <div className="relative z-10 p-1.5 sm:p-2 bg-white border-3 border-stone-950 rounded-xs shadow-[3px_3px_0_#000] flex items-center justify-between gap-2 text-stone-950">
            <div className="flex flex-col items-center shrink-0">
              <div className="flex items-end h-7 sm:h-8 gap-[1.5px] bg-white px-1 py-0.5 border border-stone-300">
                <div className="w-[2px] h-full bg-black" />
                <div className="w-[1px] h-full bg-black" />
                <div className="w-[3px] h-full bg-black" />
                <div className="w-[1px] h-full bg-black" />
                <div className="w-[2px] h-full bg-black" />
                <div className="w-[4px] h-full bg-black" />
                <div className="w-[1px] h-full bg-black" />
                <div className="w-[2px] h-full bg-black" />
              </div>
              <span className="font-mono text-[6px] sm:text-[6.5px] font-black text-stone-800 tracking-widest mt-0.5">
                7 59606 02450 1
              </span>
            </div>

            <div className="flex-1 text-left font-mono text-[7px] sm:text-[7.5px] space-y-0.5 text-stone-700 leading-tight">
              <div className="font-black text-stone-950 uppercase">DIRECT EDITION • FREE ACCESS</div>
              <div>STACK: REACT • PYTHON • PYTORCH • NEXT.JS</div>
              <div className="text-rose-700 font-bold">CONNECT: GITHUB • LINKEDIN • LOCALHOST</div>
            </div>

            <div className="w-8 sm:w-10 h-8 sm:h-10 shrink-0 border-2 border-stone-950 rounded-2xs flex flex-col items-center justify-center text-center p-0.5 bg-[#fef08a] shadow-2xs rotate-[2deg]">
              <span className="font-mono font-black text-[4.5px] sm:text-[5px] text-stone-900 leading-none">APPROVED</span>
              <span className="font-mono font-black text-[5.5px] sm:text-[6px] text-rose-700 leading-none">COMICS</span>
              <span className="font-mono font-black text-[4px] sm:text-[4.5px] text-stone-800 leading-none">CODE</span>
            </div>
          </div>

          <div className="relative z-10 border-t border-rose-900/60 pt-1 flex items-center justify-between text-[8px] sm:text-[8.5px] font-mono font-black text-rose-200">
            <span>MD MOIN AKHTAR // SAGA</span>
            <span className="bg-[#ffe600] text-black px-1.5 py-0.2 border border-stone-950 shadow-2xs">BACK COVER</span>
          </div>
        </article>
      );
    }

    return null;
  };

  // Helper for Mobile single page renderer
  const renderSingleMobilePage = (pageIdx: number) => {
    switch (pageIdx) {
      case 0:
        return renderCoverPage();
      case 1:
        return renderLeftPage(1);
      case 2:
        return renderRightPage(1);
      case 3:
        return renderLeftPage(2);
      case 4:
        return renderRightPage(2);
      case 5:
        return renderLeftPage(3);
      case 6:
        return renderRightPage(3);
      default:
        return renderCoverPage();
    }
  };

  return (
    <PageTransition className={`relative min-h-screen h-screen w-full bg-[#5f8772] text-stone-900 overflow-hidden select-none flex flex-col justify-between transition-transform duration-100 ${
      screenShake ? 'translate-x-[4px] translate-y-[-4px]' : ''
    }`}>
      
      {/* ========================================================================= */}
      {/* 1. SEAMLESS 100% FULL-BLEED SAGE GREEN ARCHITECT CUTTING MAT (Z-0) */}
      {/* ========================================================================= */}
      <div 
        className="fixed inset-0 w-full h-full pointer-events-none z-0"
        style={{
          background: `radial-gradient(ellipse at 50% 45%, #7da691 0%, #638c77 55%, #4e735f 100%)`
        }}
      />

      {/* Blueprint grid lines */}
      <div 
        className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-45"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.28) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.28) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px'
        }}
      />

      <div 
        className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-60"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.5) 1.5px, transparent 1.5px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.5) 1.5px, transparent 1.5px)
          `,
          backgroundSize: '120px 120px'
        }}
      />

      {/* Center Concentric Protractor Arcs */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-30 flex items-center justify-center"
      >
        <div className="w-[620px] h-[620px] rounded-full border border-dashed border-white/50 relative flex items-center justify-center">
          <div className="w-[450px] h-[450px] rounded-full border border-white/40 flex items-center justify-center">
            <div className="w-[280px] h-[280px] rounded-full border border-dashed border-white/35" />
          </div>
        </div>
      </div>

      {/* Hidden Native Audio Element */}
      <audio
        ref={audioRef}
        src={MONOLOGUE_AUDIO_SRC}
        preload="auto"
      />

      {/* ========================================================================= */}
      {/* 2. EXTREME CORNER FLOATING BUTTONS */}
      {/* ========================================================================= */}
      
      {/* Top Left Extreme Corner: Multiverse Issue Badge */}
      <div className="fixed top-2 sm:top-3 left-3 sm:left-6 z-50 flex items-center gap-2 font-mono text-[9px] sm:text-[10px] font-black uppercase text-white drop-shadow-sm pointer-events-none">
        <span className="bg-rose-600 text-white px-2 py-0.5 rounded-xs tracking-wider shadow-sm border border-rose-950 pointer-events-auto">
          EARTH-1610
        </span>
        <span className="bg-black text-[#ffe600] px-1.5 py-0.5 hidden md:inline border border-black shadow-xs pointer-events-auto">
          ISSUE #001
        </span>
      </div>

      {/* Top Right Extreme Corner: Tactile Play Voiceover + Exit Buttons */}
      <div className="fixed top-2 sm:top-3 right-3 sm:right-6 z-50 flex items-center gap-1.5 sm:gap-2.5">
        {isPlaying && (
          <div className="hidden sm:flex items-end gap-0.5 h-4 px-2 py-0.5 bg-black/85 border border-amber-500/40 rounded-xs shadow-xs">
            <span className="w-1 bg-[#ffe600] h-full animate-pulse border border-stone-950" />
            <span className="w-1 bg-rose-500 h-3/4 animate-pulse border border-stone-950" style={{ animationDelay: '0.15s' }} />
            <span className="w-1 bg-cyan-400 h-4/5 animate-pulse border border-stone-950" style={{ animationDelay: '0.3s' }} />
            <span className="w-1 bg-amber-400 h-2/3 animate-pulse border border-stone-950" style={{ animationDelay: '0.2s' }} />
          </div>
        )}

        <button
          onClick={handleTogglePlay}
          className={`px-2.5 sm:px-4 py-1.5 rounded-xs font-mono text-[11px] sm:text-xs font-black uppercase tracking-wider flex items-center gap-1 sm:gap-1.5 cursor-pointer border-2 sm:border-3 border-black shadow-[3px_3px_0_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all ${
            isPlaying 
              ? 'bg-rose-600 hover:bg-rose-700 text-white' 
              : 'bg-[#ffe600] hover:bg-amber-300 text-black'
          }`}
          title={isPlaying ? "Pause voice narration (Spacebar)" : "Play synchronized voice narration (Spacebar)"}
        >
          {isPlaying ? (
            <>
              <Pause className="h-3.5 sm:h-4 w-3.5 sm:w-4 fill-current" />
              <span className="hidden xs:inline">PAUSE VOICEOVER</span>
              <span className="xs:hidden">PAUSE</span>
            </>
          ) : (
            <>
              <Play className="h-3.5 sm:h-4 w-3.5 sm:w-4 fill-current" />
              <span className="hidden xs:inline">PLAY VOICEOVER</span>
              <span className="xs:hidden">PLAY</span>
            </>
          )}
        </button>

        {/* EXIT BUTTON */}
        <button
          onClick={handleExitPage}
          className="px-2 sm:px-3 py-1.5 bg-stone-950 hover:bg-rose-600 text-white font-mono text-[11px] sm:text-xs font-black uppercase tracking-wider flex items-center gap-1 border-2 sm:border-3 border-black shadow-[3px_3px_0_#000] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer transition-colors"
          title="Exit this page and return to base (Esc)"
        >
          <X className="h-3.5 sm:h-4 w-3.5 sm:w-4 stroke-[3]" />
          <span className="hidden sm:inline">EXIT</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN WORKSPACE */}
      {/* ========================================================================= */}
      <main
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative z-10 w-full flex-1 flex items-center justify-center max-w-[1600px] mx-auto px-2 sm:px-4 pt-1 sm:pt-2 pb-0.5 overflow-visible [perspective:2600px] -translate-y-2 sm:-translate-y-3"
      >
        <div className="flex items-center justify-center overflow-visible">
          
          {/* ------------------------------------------------------------- */}
          {/* A. MOBILE VIEW: SINGLE PAGE DISPLAY (ONE BY ONE) WITH StPageFlip */}
          {/* ------------------------------------------------------------- */}
          {isMobile ? (
            <div className="relative flex items-center justify-center [transform-style:preserve-3d]">
              
              {/* 3D Physical Book Outer Stack Edge Shadows on Desk */}
              <div className="absolute inset-0 bg-[#e3ded4] border-4 border-stone-950 rounded-xs shadow-[20px_25px_45px_rgba(0,0,0,0.85)] translate-x-2 translate-y-2.5 pointer-events-none" />
              <div className="absolute inset-0 bg-[#d5cfc3] border-4 border-stone-950 rounded-xs translate-x-3.5 translate-y-4 pointer-events-none opacity-70" />

              {/* Single Page Bed */}
              <div className="w-[88vw] max-w-[390px] h-[calc(100vh-100px)] min-h-[480px] max-h-[660px] relative overflow-visible bg-[#fbf9f4] border-4 border-stone-950 rounded-xs shadow-[0_15px_35px_rgba(0,0,0,0.7)] [transform-style:preserve-3d]">
                
                {/* Current Active Single Page */}
                <div className="w-full h-full relative z-10 overflow-hidden">
                  {renderSingleMobilePage(mobilePage)}
                </div>

                {/* StPageFlip Turning Leaf on Mobile */}
                <AnimatePresence mode="sync">
                  {turningLeafIndex !== null && (
                    <motion.div
                      key={`mobile-turning-leaf-${turningLeafIndex}`}
                      initial={{ 
                        rotateY: 0,
                        rotateZ: 0,
                        skewY: 0,
                        z: 0,
                        scale: 1,
                        opacity: 1,
                        transformOrigin: turningDirection === 1 ? 'left center' : 'right center'
                      }}
                      animate={{ 
                        rotateY: turningDirection === 1 ? -120 : 90,
                        rotateZ: turningDirection === 1 ? -4 : 4,
                        skewY: turningDirection === 1 ? -2 : 2,
                        z: 160,
                        scale: 1.04,
                        opacity: 0,
                        transformOrigin: turningDirection === 1 ? 'left center' : 'right center',
                        transition: { 
                          duration: 0.82,
                          ease: [0.22, 1, 0.36, 1] 
                        } 
                      }}
                      exit={{ opacity: 0 }}
                      style={{ willChange: 'transform, opacity' }}
                      className="absolute inset-0 z-30 [transform-style:preserve-3d] shadow-[-18px_12px_36px_rgba(0,0,0,0.65)] bg-[#fbf9f4] pointer-events-none rounded-xs overflow-hidden"
                    >
                      {/* Dynamic Traveling Lighting Wave */}
                      <motion.div 
                        initial={{ opacity: 0.8, x: '-20%' }}
                        animate={{ opacity: 0, x: '100%' }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-black/30 pointer-events-none z-40"
                      />

                      {/* Spine Crease Shading */}
                      <div className="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-black/50 via-black/20 to-transparent pointer-events-none z-40" />

                      {renderSingleMobilePage(turningLeafIndex)}
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>

            </div>
          ) : (
            /* ------------------------------------------------------------- */
            /* B. DESKTOP VIEW: DUAL-SPREAD DISPLAY (SPREADS 0..3) */
            /* ------------------------------------------------------------- */
            currentSpread === 0 ? (
              <motion.div
                key="spread-0-cover"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1, 
                  rotateY: 0,
                  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
                }}
                exit={{ 
                  rotateY: -125,
                  rotateZ: -4,
                  z: 180,
                  scale: 1.05,
                  opacity: 0,
                  transformOrigin: 'left center',
                  transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] } 
                }}
                style={{ willChange: 'transform, opacity' }}
                className="relative flex items-center justify-center [transform-style:preserve-3d]"
              >
                <div className="absolute inset-0 bg-[#e4dfd6] border-4 border-stone-950 rounded-xs shadow-[28px_32px_55px_rgba(0,0,0,0.88)] translate-x-3 translate-y-2.5 pointer-events-none" />
                <div className="absolute inset-0 bg-[#d8d2c7] border-4 border-stone-950 rounded-xs translate-x-5 translate-y-4 pointer-events-none opacity-80" />

                <div className="w-[300px] sm:w-[360px] md:w-[400px] lg:w-[425px] h-[calc(100vh-52px)] max-h-[820px] min-h-[620px] relative">
                  {renderCoverPage()}
                </div>
              </motion.div>
            ) : (
              <div className="relative flex items-center justify-center [transform-style:preserve-3d]">
                
                {/* 3D Physical Book Outer Stack Edge Shadows on Desk */}
                <div className="absolute inset-0 bg-[#e3ded4] border-4 border-stone-950 rounded-xs shadow-[30px_35px_60px_rgba(0,0,0,0.85)] translate-x-2.5 translate-y-3 pointer-events-none" />
                <div className="absolute inset-0 bg-[#d5cfc3] border-4 border-stone-950 rounded-xs translate-x-4.5 translate-y-5 pointer-events-none opacity-70" />

                <div className="flex items-center justify-center border-4 border-stone-950 rounded-xs bg-stone-950 relative [transform-style:preserve-3d] shadow-[0_20px_45px_rgba(0,0,0,0.7)]">
                  
                  {/* LEFT PAGE */}
                  <div className="w-[360px] sm:w-[440px] md:w-[490px] lg:w-[520px] h-[calc(100vh-52px)] max-h-[820px] min-h-[620px] relative overflow-hidden bg-[#fbf9f4] border-r border-stone-950/40 shadow-[inset_15px_0_20px_rgba(0,0,0,0.08)]">
                    {renderLeftPage(currentSpread)}
                  </div>

                  {/* CENTER COMIC BOOK SPINE GUTTER & METALLIC STAPLES */}
                  <div className="w-3 bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 h-[calc(100vh-52px)] max-h-[820px] min-h-[620px] flex flex-col justify-around py-16 shadow-inner z-30 pointer-events-none">
                    <div className="w-1.5 h-6 bg-slate-400/80 rounded-2xs border border-slate-600 shadow-xs mx-auto" />
                    <div className="w-1.5 h-6 bg-slate-400/80 rounded-2xs border border-slate-600 shadow-xs mx-auto" />
                  </div>

                  {/* RIGHT PAGE BED */}
                  <div className="w-[360px] sm:w-[440px] md:w-[490px] lg:w-[520px] h-[calc(100vh-52px)] max-h-[820px] min-h-[620px] relative overflow-visible bg-[#fbf9f4] border-l border-stone-950/40 shadow-[inset_-15px_0_20px_rgba(0,0,0,0.08)] [transform-style:preserve-3d]">
                    
                    <div className="w-full h-full relative z-10">
                      {renderRightPage(currentSpread)}
                    </div>

                    {/* StPageFlip Turning Paper Leaf */}
                    <AnimatePresence mode="sync">
                      {turningLeafIndex !== null && (
                        <motion.div
                          key={`turning-leaf-${turningLeafIndex}`}
                          initial={{ 
                            rotateY: 0,
                            rotateZ: 0,
                            skewY: 0,
                            z: 0,
                            scale: 1,
                            opacity: 1,
                            transformOrigin: turningDirection === 1 ? 'left center' : 'right center'
                          }}
                          animate={{ 
                            rotateY: turningDirection === 1 ? -130 : 100,
                            rotateZ: turningDirection === 1 ? -5 : 5,
                            skewY: turningDirection === 1 ? -3 : 3,
                            z: 190,
                            scale: 1.05,
                            opacity: 0,
                            transformOrigin: turningDirection === 1 ? 'left center' : 'right center',
                            transition: { 
                              duration: 0.85,
                              ease: [0.22, 1, 0.36, 1] 
                            } 
                          }}
                          exit={{ opacity: 0 }}
                          style={{ willChange: 'transform, opacity' }}
                          className="absolute inset-0 z-30 [transform-style:preserve-3d] shadow-[-22px_14px_48px_rgba(0,0,0,0.65)] bg-[#fbf9f4] pointer-events-none rounded-r-xs"
                        >
                          <motion.div 
                            initial={{ opacity: 0.8, x: '-20%' }}
                            animate={{ opacity: 0, x: '100%' }}
                            transition={{ duration: 0.82, ease: "easeOut" }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-black/30 pointer-events-none z-40"
                          />

                          <div className="absolute top-0 bottom-0 left-0 w-10 bg-gradient-to-r from-black/50 via-black/20 to-transparent pointer-events-none z-40" />

                          {turningLeafIndex === 0 ? renderCoverPage() : renderRightPage(turningLeafIndex)}
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </div>

                </div>

              </div>
            )
          )}

        </div>
      </main>

      {/* ========================================================================= */}
      {/* 4. BOTTOM DESK FOOTER */}
      {/* ========================================================================= */}
      <footer className="relative z-30 max-w-xl mx-auto w-full px-4 pb-1 pt-0 flex items-center justify-between font-mono text-xs text-white/90">
        
        <button
          onClick={handleTurnPrev}
          disabled={isMobile ? mobilePage === 0 : currentSpread === 0 || turningLeafIndex !== null}
          className="px-2.5 sm:px-3 py-1 bg-black/70 hover:bg-black disabled:opacity-30 text-white border border-white/20 rounded-xs flex items-center gap-1 cursor-pointer transition-colors text-[10px] sm:text-[10.5px] font-bold shadow-xs"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span>PREV</span>
        </button>

        {/* Page / Spread Indicator Dots */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {Array.from({ length: isMobile ? TOTAL_MOBILE_PAGES : TOTAL_SPREADS }).map((_, index) => {
            const active = isMobile ? mobilePage === index : currentSpread === index;
            return (
              <button
                key={index}
                onClick={() => isMobile ? goToMobilePage(index) : goToSpread(index)}
                disabled={turningLeafIndex !== null}
                className={`h-2.5 sm:h-3 rounded-full border border-black transition-all cursor-pointer ${
                  active 
                    ? 'w-5 sm:w-7 bg-[#ffe600] shadow-xs' 
                    : 'w-2 sm:w-3 bg-white/40 hover:bg-white/80'
                }`}
                title={isMobile ? `Page ${index}` : index === 0 ? "Cover" : `Spread ${index}`}
              />
            );
          })}
        </div>

        <button
          onClick={handleTurnNext}
          disabled={isMobile ? mobilePage === TOTAL_MOBILE_PAGES - 1 : currentSpread === TOTAL_SPREADS - 1 || turningLeafIndex !== null}
          className="px-2.5 sm:px-3 py-1 bg-black/70 hover:bg-black disabled:opacity-30 text-white border border-white/20 rounded-xs flex items-center gap-1 cursor-pointer transition-colors text-[10px] sm:text-[10.5px] font-bold shadow-xs"
        >
          <span>NEXT</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>

      </footer>

    </PageTransition>
  );
}

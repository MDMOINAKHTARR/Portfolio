import { Link } from 'react-router-dom';
import { Highlight } from '../components/Highlight';
import { TopSecretStamp } from '../components/Stamps';
import { Typewriter } from '../components/Typewriter';
import { PageTransition } from '../components/PageTransition';
import { useState, useEffect, useCallback, lazy, Suspense, type SyntheticEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Fingerprint, Search, MapPin, Activity, X, ExternalLink, Github, Award, Briefcase, BookOpen, Trophy, Code, Linkedin, Sparkles, ArrowRight, BookOpenCheck } from 'lucide-react';
import { FaXTwitter } from 'react-icons/fa6';
import { useTheme } from '../context/ThemeContext';
import { AnalyticsWidget } from '../components/AnalyticsWidget';
import { GithubStreak } from '../components/GithubStreak';
import { LeetcodeStreak } from '../components/LeetcodeStreak';
import { createPortal } from 'react-dom';
import { OperationCard } from '../components/OperationCard';
import { audioEngine } from '../lib/audio';

import { SkillsCarousel } from '../components/SkillsCarousel';
import { ContactPill } from '../components/ContactPill';
import { musicEngine, type MusicVisual } from '../lib/music';

const SPIDER_NOIR_GIF = 'https://media1.tenor.com/m/T4YtiVsOLu4AAAAC/spider-noir-nicolas-cage.gif';
const PdfViewer = lazy(() => import('../components/PdfViewer').then((module) => ({ default: module.PdfViewer })));

function RecTimestamp() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    };
    updateTime();
    const int = setInterval(updateTime, 1000);
    return () => clearInterval(int);
  }, []);

  return (
    <div className="absolute top-4 right-6 sm:right-16 text-[9px] sm:text-[10px] font-mono tracking-widest text-red-700/80 font-bold flex items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
      REC // {time}
    </div>
  );
}

export function Dossier() {
  const { theme, musicTheme, activeMusicTrack } = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    return musicEngine.subscribe((snapshot) => {
      setIsPlaying(snapshot.isPlaying);
    });
  }, []);

  const songVisual = isPlaying ? activeMusicTrack?.visual : null;
  const isCrtTvTrack = activeMusicTrack ? ['bully-maguire', 'raindrops', 'come-and-get-your-love', 'im-amazing'].includes(activeMusicTrack.id) : false;

  const portraitThemeClass = musicTheme ? `song-portrait--${musicTheme}` : '';
  const [isPortraitRevealed, setIsPortraitRevealed] = useState(true);
  const [showGif, setShowGif] = useState(false);
  const [gifFading, setGifFading] = useState(false);
  const [gifReady, setGifReady] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(() => window.matchMedia('(max-width: 639px)').matches);
  const [showQuoteGif, setShowQuoteGif] = useState(false);
  const [showUltimateCert, setShowUltimateCert] = useState(false);
  const [showDataScienceCert, setShowDataScienceCert] = useState(false);
  const revealPortrait = useCallback(() => setIsPortraitRevealed(true), []);

  useEffect(() => {
    setIsPortraitRevealed(!songVisual);
  }, [songVisual]);

  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 639px)');
    const handleViewportChange = (event: MediaQueryListEvent) => setIsMobileViewport(event.matches);
    const preloadedGif = new Image();
    let cancelled = false;
    const markGifReady = () => {
      if (!cancelled) setGifReady(true);
    };

    mobileQuery.addEventListener('change', handleViewportChange);
    preloadedGif.decoding = 'async';
    preloadedGif.src = SPIDER_NOIR_GIF;
    if (preloadedGif.complete) markGifReady();
    else preloadedGif.addEventListener('load', markGifReady, { once: true });

    return () => {
      cancelled = true;
      mobileQuery.removeEventListener('change', handleViewportChange);
      preloadedGif.removeEventListener('load', markGifReady);
    };
  }, []);

  useEffect(() => {
    if (theme === 'noir' && gifReady) {
      setShowGif(true);
      setGifFading(false);
      
      const fadeTimer = setTimeout(() => {
        setGifFading(true);
      }, 2200);

      const removeTimer = setTimeout(() => {
        setShowGif(false);
        setGifFading(false);
      }, 2800);
      
      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(removeTimer);
      };
    } else {
      setShowGif(false);
      setGifFading(false);
    }
  }, [theme, gifReady]);

  return (
    <PageTransition className="px-5 py-6 sm:px-20 sm:py-24 relative overflow-hidden h-full">
      
      {/* ========================================================= */}
      {/* MOBILE-ONLY VIEW (Hidden on sm and larger) */}
      {/* ========================================================= */}
      <div className="block sm:hidden w-full font-mono text-ink pb-4 relative z-20">
        
        {/* Mobile Layout: Photo on Left, Summary on Right */}
        <div className="flex gap-4 mb-2 relative z-20 items-start">
           
           {/* Mobile Photo */}
           <div className="w-[120px] shrink-0 transform -rotate-2 relative mt-4">
             <div className="song-photo-frame bg-polaroid p-1.5 pb-6 shadow-[2px_4px_10px_rgba(0,0,0,0.3)] border border-gray-300 relative">
               <div className="absolute -top-3 left-1/2 ml-1 w-1.5 h-6 border-[1.5px] border-slate-400 rounded-full bg-transparent z-30"></div>
               
               <div className="w-full h-[130px] bg-zinc-800 border border-zinc-700 relative overflow-hidden">
                 <SubjectPortrait
                   alt="Subject"
                   className="song-portrait w-full h-full object-cover relative z-10 opacity-100"
                 />

                 {/* Photo stays normal */}
                 
                 {/* Song visuals take over the portrait while music is playing. */}
                  {songVisual && !isCrtTvTrack ? (
                    <SongThemeOverlay key={songVisual.src} visual={songVisual} onRevealPortrait={revealPortrait} />
                  ) : (
                    showGif && isMobileViewport && <SpiderNoirThemeOverlay fading={gifFading} />
                  )}
                 
                 <div className="absolute inset-0 bg-ink/5 mix-blend-overlay z-20 pointer-events-none"></div>

                 {/* Surveillance UI Overlay */}
                 <div className="absolute inset-0 z-20 pointer-events-none p-0.5 flex flex-col justify-between opacity-80">
                    <div className="flex justify-between items-start">
                       <div className="w-1.5 h-1.5 border-t border-l border-red-500/80"></div>
                       <div className="w-1.5 h-1.5 border-t border-r border-red-500/80"></div>
                    </div>
                    <div className="flex justify-between items-end">
                       <div className="w-1.5 h-1.5 border-b border-l border-red-500/80"></div>
                       <div className="w-1.5 h-1.5 border-b border-r border-red-500/80"></div>
                    </div>
                 </div>
               </div>
               <div className="absolute bottom-1 w-full text-center left-0 font-typewriter text-[7px] text-ink/70 tracking-widest mt-1">
                  TARGET // LOCKED
               </div>
             </div>
           </div>

           {/* Profile Summary */}
           <div className="flex-1 flex flex-col">
             <div className="flex items-center gap-1 mb-1">
               <span className="w-2.5 h-2.5 bg-yellow-400 rounded-full shrink-0" />
               <h2 className="text-[11px] font-bold tracking-[0.1em] font-mono leading-none pt-[1px]">PROFILE SUMMARY</h2>
             </div>
             
             <div className="border-t border-ink/10 pt-1.5 flex flex-col gap-2 text-xs">
               <div>
                 <div className="opacity-60 font-bold tracking-widest text-[8px] mb-0.5">NAME:</div>
                 <div className="text-sm font-black tracking-widest leading-none">MD MOIN AKHTAR</div>
               </div>
               
               <div>
                 <div className="opacity-60 font-bold tracking-widest text-[8px] mb-0.5">ROLE:</div>
                 <div className="bg-hl-blue-bg border border-hl-blue-border px-2 py-1 rounded inline-block shadow-sm w-full">
                   <div className="font-bold tracking-wider leading-tight text-[9px] uppercase">
                     SOFTWARE DEVELOPER
                   </div>
                 </div>
               </div>
               
               <div>
                 <div className="opacity-60 font-bold tracking-widest text-[8px] mb-0.5">AFFILIATION:</div>
                 <div className="bg-hl-pink-bg border border-hl-pink-border px-2 py-1 rounded inline-block shadow-sm w-full">
                   <div className="font-bold tracking-wider leading-tight text-[9px] uppercase">
                     VIPS-TC (B.TECH, & DATA<br/>SCIENCE, CGPA: 8.03)
                   </div>
                 </div>
               </div>
               
               <div>
                  <div className="opacity-60 font-bold tracking-widest text-[8px] mb-0.5">LEADERSHIP:</div>
                  <div className="bg-hl-pink-bg border border-hl-pink-border px-2 py-1 rounded inline-block shadow-sm w-full">
                    <div className="font-bold tracking-wider leading-tight text-[9px] uppercase">
                      CORE MEMBER -<br/>CLUSTER DATA SCIENCE CLUB
                    </div>
                  </div>
                </div>
             </div>
           </div>
        </div>

        {/* About */}
        <section className="mb-4">
          <h2 className="text-[11px] font-bold tracking-[0.1em] font-mono leading-none mb-2 opacity-60 uppercase">About</h2>
          <div className="space-y-2">
            <p className="text-[13px] font-mono opacity-90 leading-[1.6]">
              <span className="font-bold">Initialized by curiosity</span>, my tech journey quickly compiled into a core directive. Operating out of <span className="font-bold border-b border-ink/40">New Delhi</span>, I engineer intelligent logic—fusing <span className="bg-hl-yellow-bg border-b-2 border-hl-yellow-border font-bold px-1">machine learning</span> with modern <span className="bg-hl-blue-bg border-b-2 border-hl-blue-border font-bold px-1">full-stack architecture</span>. <span className="font-bold tracking-widest uppercase text-xs">I explore, I build, I deploy.</span>
            </p>
            <p className="text-[13px] font-mono opacity-90 leading-[1.6]">
              When my IDE is offline, runtime is allocated to <span className="font-bold">devouring books</span>, navigating the depths of the web, and enduring the daily survival simulation known as the <span className="font-bold italic text-red-700">Delhi Metro transit network</span>.
            </p>
          </div>
        </section>

        <div className="space-y-6">

          {/* TECHNICAL SKILLS */}
          <section className="pt-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-3.5 h-3.5 bg-yellow-400 rounded-full shrink-0" />
              <h2 className="text-xs font-bold tracking-[0.1em] font-mono leading-none pt-[2px]">TECHNICAL SKILLS (PRIMARY & SECONDARY)</h2>
            </div>
            <div className="border-t border-ink/10 pt-1">
              <div className="-mx-6 sm:-mx-8 mb-0">
                <SkillsCarousel />
              </div>
              <p className="text-xs font-mono italic opacity-80 leading-relaxed max-w-[90%] mb-8">
                <span className="bg-hl-pink-bg border border-hl-pink-border px-2 py-0.5 rounded-full not-italic text-[10px] tracking-wider shadow-sm mr-1">RENEUTRALIZING</span> complex AI-integration for deployment ready modules.
              </p>
              
              {/* Premium Thematic 5-Banner Grid Layout */}
              <div className="grid grid-cols-10 gap-2 mb-4">
                {/* Left Column (LeetCode & LinkedIn) */}
                <div className="col-span-4 flex flex-col gap-2">
                  {/* LeetCode */}
                  <a
                    href="https://leetcode.com/__moinn_"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block relative w-full h-[130px] overflow-hidden border-2 border-ink/40 shadow-sm group bg-ink rounded-[2px]"
                  >
                    <img
                      src="/leetcode banner.jpg"
                      alt="LeetCode Operations"
                      className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent flex flex-col justify-end p-3 transition-all duration-300">
                      <div className="flex items-start gap-2 flex-col transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                        <Code className="w-5 h-5 text-paper shrink-0 group-hover:scale-110 transition-transform" />
                        <div>
                          <h3 className="text-paper font-bold font-mono tracking-widest text-sm sm:text-base leading-tight">LEETCODE</h3>
                          <p className="text-paper/70 font-mono text-[9px] sm:text-[11px] tracking-widest mt-0.5 font-bold">ALGORITHM CHALLENGES // @__moinn_</p>
                        </div>
                      </div>
                    </div>
                  </a>

                  {/* LinkedIn */}
                  <a
                    href="https://www.linkedin.com/in/mdmoinakhtar/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block relative w-full h-[120px] md:h-[210px] overflow-hidden border-2 border-ink/40 shadow-sm group bg-ink rounded-[2px]"
                  >
                    <img
                      src="/linkedin banner.jpg"
                      alt="LinkedIn Professional Network"
                      className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent flex flex-col justify-end p-3 transition-all duration-300">
                      <div className="flex items-start gap-2 flex-col transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                        <Linkedin className="w-5 h-5 text-paper shrink-0 group-hover:scale-110 transition-transform" />
                        <div>
                          <h3 className="text-paper font-bold font-mono tracking-widest text-sm sm:text-base leading-tight">LINKEDIN</h3>
                          <p className="text-paper/70 font-mono text-[9px] sm:text-[11px] tracking-widest mt-0.5 font-bold">PROFESSIONAL NETWORK // @mdmoinakhtar</p>
                        </div>
                      </div>
                    </div>
                  </a>
                </div>

                {/* Right Column (GitHub + bottom row) */}
                <div className="col-span-6 flex flex-col gap-2">
                  {/* GitHub */}
                  <a
                    href="https://github.com/MDMOINAKHTARR"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block relative w-full h-[160px] md:h-[220px] overflow-hidden border-2 border-ink/40 shadow-sm group bg-ink rounded-[2px]"
                  >
                    <img
                      src="https://media1.tenor.com/m/czm3QzVCDJIAAAAC/batman-bruce-wayne.gif"
                      alt="GitHub Operations Banner"
                      className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-700"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=1000';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent flex flex-col justify-end p-3 transition-all duration-300">
                      <div className="flex items-center gap-2 transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                        <Github className="w-5 h-5 text-paper shrink-0 group-hover:scale-110 transition-transform" />
                        <div>
                          <h3 className="text-paper font-bold font-mono tracking-widest text-sm sm:text-base leading-tight">GITHUB</h3>
                          <p className="text-paper/70 font-mono text-[9px] sm:text-[11px] tracking-widest mt-0.5 font-bold">SOURCE REPOSITORY // @MDMOINAKHTARR</p>
                        </div>
                      </div>
                    </div>
                  </a>

                  {/* Bottom row: 4th Image + Twitter */}
                  <div className="grid grid-cols-10 gap-2 h-[90px] md:h-[120px]">
                    {/* 4th Image */}
                    <div className="relative overflow-hidden border-2 border-ink/40 shadow-sm group bg-ink rounded-[2px] col-span-4 h-full">
                      <img
                        src="/4th image.jpg"
                        alt="Classified Operations"
                        className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-all duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent flex flex-col justify-end p-2 transition-all duration-300">
                        <div className="font-mono text-[8px] tracking-widest text-paper/70 font-bold">CLASSIFIED // DATA-04</div>
                      </div>
                    </div>

                    {/* Twitter / X */}
                    <a
                      href="https://x.com/___moinn_"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block relative overflow-hidden border-2 border-ink/40 shadow-sm group bg-ink rounded-[2px] col-span-6 h-full"
                    >
                      <img
                        src="/twitter banner.jpg"
                        alt="Twitter / X Banner"
                        className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent flex flex-col justify-end p-2 transition-all duration-300">
                        <div className="flex items-center gap-2 transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                          <FaXTwitter className="w-3.5 h-3.5 text-paper shrink-0 group-hover:scale-110 transition-transform" />
                          <div>
                            <h3 className="text-paper font-bold font-mono tracking-widest text-sm sm:text-base leading-tight">TWITTER / X</h3>
                            <p className="text-paper/70 font-mono text-[9px] sm:text-[11px] tracking-widest mt-0.5 font-bold">@___moinn_</p>
                          </div>
                        </div>
                      </div>
                    </a>
                  </div>
                </div>
              </div>

              {/* Interactive Contribution Matrices */}
              <div className="flex flex-col gap-6 mb-8">
                <LeetcodeStreak />
                <GithubStreak />
              </div>

              <div className="flex items-center gap-3 mb-6 mt-10 border-b-2 border-amber-900/20 pb-4">
                <div className="bg-amber-900/10 p-2.5 rounded-lg border border-amber-900/20 shadow-sm">
                  <Award className="w-6 h-6 sm:w-8 sm:h-8 text-amber-700 dark:text-amber-500" />
                </div>
                <h2 className="text-xl sm:text-3xl font-black tracking-[0.15em] font-mono leading-none pt-[2px] text-amber-900 dark:text-amber-500 uppercase drop-shadow-sm">
                  CERTIFICATES
                </h2>
              </div>

              <div 
                className="dossier-record dossier-record--certificate group flex w-full cursor-pointer items-start gap-3 p-4"
                onClick={() => setShowDataScienceCert(true)}
              >
                  <Typewriter delay={0.1} className="opacity-50 font-bold font-mono tracking-widest mt-1 shrink-0">[!]</Typewriter>
                  <div className="flex flex-col gap-1.5 flex-1 select-none">
                    <Typewriter delay={0.2} className="font-bold text-[11px] leading-tight sm:text-sm tracking-widest font-mono text-amber-900 dark:text-amber-500">
                      <Highlight style="circle" color="yellow" className="border-b border-dashed border-amber-500/40 pb-1">
                        CERTIFIED: DATA SCIENCE FOUNDATIONS (2024)
                      </Highlight>
                    </Typewriter>
                    <span className="evidence-action evidence-action--certificate mt-2.5 inline-flex w-full items-center justify-center gap-1.5 sm:w-fit">
                      <ExternalLink className="h-3.5 w-3.5" /> VIEW CERTIFICATE
                    </span>
                  </div>
              </div>

              <div 
                className="dossier-record dossier-record--certificate group mt-4 flex w-full cursor-pointer items-start gap-3 p-4"
                onClick={() => setShowUltimateCert(true)}
              >
                  <Typewriter delay={0.2} className="opacity-50 font-bold font-mono tracking-widest mt-1 shrink-0">[!]</Typewriter>
                  <div className="flex flex-col gap-1.5 flex-1 select-none">
                    <Typewriter delay={0.3} className="font-bold text-[11px] leading-tight sm:text-sm tracking-widest font-mono text-amber-900 dark:text-amber-500">
                      <Highlight style="circle" color="yellow" className="border-b border-dashed border-amber-500/40 pb-1">
                        CERTIFIED: THE ULTIMATE JOB READY DATA SCIENCE COURSE
                      </Highlight>
                    </Typewriter>
                    <span className="evidence-action evidence-action--certificate mt-2.5 inline-flex w-full items-center justify-center gap-1.5 sm:w-fit">
                      <ExternalLink className="h-3.5 w-3.5" /> VIEW CERTIFICATE
                    </span>
                  </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-6 mt-10 border-b-2 border-blue-950/20 pb-4">
              <div className="bg-blue-950/10 p-2.5 rounded-lg border border-blue-950/20 shadow-sm">
                <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-blue-900 dark:text-blue-400" />
              </div>
              <h2 className="text-xl sm:text-3xl font-black tracking-[0.15em] font-mono leading-none pt-[2px] text-blue-900 dark:text-blue-400 uppercase drop-shadow-sm">
                RESEARCH & PUBLICATIONS
              </h2>
            </div>
            
            <div className="space-y-6">
              <div 
                className="dossier-record dossier-record--research flex w-full flex-col gap-3 p-4"
              >
                  <div className="flex items-start gap-3 w-full">
                    <Typewriter delay={0.3} className="opacity-50 font-bold font-mono tracking-widest mt-1 shrink-0">[!]</Typewriter>
                    <div className="flex flex-col gap-1.5 flex-1 select-none">
                      <Typewriter delay={0.4} className="font-bold text-[11px] leading-tight sm:text-sm tracking-widest font-mono text-blue-900 dark:text-blue-400">
                        <Highlight style="circle" color="blue" className="border-b border-dashed border-blue-500/40 pb-1">
                          RESEARCH: A SENTENCE-LEVEL RISK ESTIMATOR FOR IDENTIFYING HALLUCINATIONS IN GENERATIVE AI
                        </Highlight>
                      </Typewriter>
                      <Typewriter delay={0.5} className="block italic opacity-80 mt-1 text-[11px] sm:text-xs text-ink/75">
                        International Conference on AI-Driven Smart Systems and Ubiquuting (ICAUC), 2026
                      </Typewriter>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 pt-3 border-t border-blue-950/10 dark:border-blue-500/10">
                    <a href="https://ieeexplore.ieee.org/document/11441054" target="_blank" rel="noreferrer" className="evidence-action evidence-action--ieee flex items-center justify-center gap-2">
                      <ExternalLink className="h-3.5 w-3.5" /> IEEE XPLORE PAPER
                    </a>
                    <a href="https://x.com/___moinn_/status/2038219385077375293?s=20" target="_blank" rel="noreferrer" className="evidence-action evidence-action--x flex items-center justify-center gap-2">
                      <ExternalLink className="h-3.5 w-3.5" /> VIEW X POST
                    </a>
                    <a href="https://www.linkedin.com/posts/mdmoinakhtar_ai-machinelearning-generativeai-share-7444005556559794176-z_Ot/?utm_source=share&utm_medium=member_desktop&rcm=ACoAAErQS70BROmbAnLMOHVZZb-iJMzWSNGt-lA" target="_blank" rel="noreferrer" className="evidence-action evidence-action--linkedin flex items-center justify-center gap-2">
                      <ExternalLink className="h-3.5 w-3.5" /> LINKEDIN POST
                    </a>
                  </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-6 mt-10 border-b-2 border-emerald-900/20 pb-4">
              <div className="bg-emerald-900/10 p-2.5 rounded-lg border border-emerald-900/20 shadow-sm">
                <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-800 dark:text-emerald-500" strokeWidth={1.5} />
              </div>
              <h2 className="text-xl sm:text-3xl font-black tracking-[0.15em] font-mono leading-none pt-[2px] text-emerald-800 dark:text-emerald-500 uppercase drop-shadow-sm">
                HACKATHONS & COMPETITIONS
              </h2>
            </div>
            
            <div className="space-y-4">
              <div className="dossier-record dossier-record--grand-win flex flex-row items-start gap-4 p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-amber-700/30 bg-amber-300/45 shadow-sm select-none">
                  <Trophy className="h-6 w-6 text-amber-800" strokeWidth={1.8} />
                </div>
                <div className="flex flex-1 flex-col gap-2">
                  <div className="flex w-full flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="h-2 w-2 shrink-0 rounded-full bg-amber-600" />
                      <span className="font-mono text-xs font-black tracking-wide text-ink sm:text-sm">HERMES X GROWTHX BUILDATHON</span>
                      <span className="rounded border border-amber-700/30 bg-amber-300/50 px-1.5 py-0.5 font-mono text-[10px] font-black uppercase leading-none text-amber-900">Winner · $5,800 Credits</span>
                    </div>
                    <div className="whitespace-nowrap font-mono text-[10px] font-bold opacity-60 sm:self-center">2026</div>
                  </div>
                  <p className="font-mono text-[12px] font-bold leading-relaxed text-ink/80">
                    Built <Highlight style="marker" color="yellow">LazyClip.buzz</Highlight> in 8 hours, generated every demo live, and reached 100+ signups in one day.
                  </p>
                </div>
              </div>

              <div className="dossier-record dossier-record--winner flex flex-row items-start gap-4 p-4">
                <div className="w-12 h-12 bg-white rounded-lg border border-emerald-900/20 flex items-center justify-center p-1 shrink-0 shadow-sm overflow-hidden select-none">
                  <svg className="w-10 h-10 text-emerald-800 dark:text-emerald-500" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="2" />
                    <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="0.75" strokeDasharray="3 2" />
                    <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="1" />
                    <path d="M50 32 L38 39 V54 C38 62 46 67 50 69 C54 67 62 62 62 54 V39 L50 32 Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M44 44 H56 M44 48 H56 M44 52 H52" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                    <path d="M50 20 L48 24 H52 L50 20 Z" fill="currentColor" />
                    <text x="50" y="78" fontFamily="monospace" fontSize="6.5" fontWeight="bold" textAnchor="middle" fill="currentColor" letterSpacing="0.5">IGDTUW</text>
                  </svg>
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 w-full">
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0"></span>
                      <span className="font-bold text-xs sm:text-sm font-mono tracking-wide text-ink">
                        PROMPTWARS | INNERVE 2026
                      </span>
                      <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded font-bold font-mono text-emerald-800 dark:text-emerald-400 uppercase leading-none">
                        1st Place (Winner)
                      </span>
                    </div>
                    <div className="text-[10px] font-mono opacity-60 font-bold whitespace-nowrap sm:self-center">
                      MAR 2026
                    </div>
                  </div>
                  <p className="text-[12px] font-mono opacity-80 leading-relaxed">
                    IGDTUW National Prompt Engineering Arena — Engineered and deployed the physics-based interactive <Highlight style="underline" color="green">Devcation</Highlight> platform.
                  </p>
                </div>
              </div>

              <div className="dossier-record dossier-record--finalist flex flex-row items-start gap-4 p-4">
                <div className="w-12 h-12 bg-emerald-900/10 rounded-lg border border-emerald-900/20 flex items-center justify-center shrink-0 shadow-sm select-none">
                  <Trophy className="w-6 h-6 text-emerald-800/80 dark:text-emerald-500" strokeWidth={1.5} />
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 w-full">
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-600 shrink-0"></span>
                      <span className="font-bold text-xs sm:text-sm font-mono tracking-wide text-ink">
                        PARANOX 2.0 NATIONAL HACKATHON
                      </span>
                      <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded font-bold font-mono text-emerald-800 dark:text-emerald-400 uppercase leading-none">
                        Top 40 Finalist
                      </span>
                    </div>
                    <div className="text-[10px] font-mono opacity-60 font-bold whitespace-nowrap sm:self-center">
                      NOV 2025
                    </div>
                  </div>
                  <p className="text-[12px] font-mono opacity-80 leading-relaxed">
                    National Level Innovation Hackathon — Qualified in the Top 200 teams nationwide for intelligent automation tracking platforms.
                  </p>
                </div>
              </div>

              <div className="dossier-record dossier-record--participation flex flex-row items-start gap-4 p-4">
                <div className="w-12 h-12 bg-emerald-900/10 rounded-lg border border-emerald-900/20 flex items-center justify-center shrink-0 shadow-sm select-none">
                  <Activity className="w-6 h-6 text-emerald-800/80 dark:text-emerald-500" strokeWidth={1.5} />
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 w-full">
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="w-2 h-2 rounded-full bg-zinc-500 shrink-0"></span>
                      <span className="font-bold text-xs sm:text-sm font-mono tracking-wide text-ink">
                        ALGOSQUEST 2025
                      </span>
                      <span className="text-[10px] bg-zinc-500/10 border border-zinc-500/20 px-1.5 py-0.5 rounded font-bold font-mono text-zinc-700 dark:text-zinc-400 uppercase leading-none">
                        Competitor
                      </span>
                    </div>
                    <div className="text-[10px] font-mono opacity-60 font-bold whitespace-nowrap sm:self-center">
                      FEB 2025
                    </div>
                  </div>
                  <p className="text-[12px] font-mono opacity-80 leading-relaxed">
                    Tracked Field Hackathon — Represented <Highlight style="marker" color="yellow">Team Kaizenn</Highlight>, recognized for exceptional technical adaptability and innovative engagement.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-b border-ink/10 mx-[-20px] my-6" />

            {/* PROJECT OBJECTIVE */}
            <div className="pt-2 mb-2">
              <h2 className="text-[11px] font-bold tracking-[0.25em] font-mono mb-3 text-ink">PROJECT OBJECTIVE</h2>
              <div className="border-t-2 border-ink/20 pt-4 text-[14px] sm:text-base font-bold font-mono leading-[1.8] text-ink select-none">
                Intelligent and <span className="bg-hl-blue-bg border-b-[3px] border-hl-blue-border px-1.5 py-0.5">analytical platforms</span> and executing <span className="bg-hl-blue-bg border-b-[3px] border-hl-blue-border px-1.5 py-0.5">seamless digital</span> <span className="bg-hl-blue-bg border-b-[3px] border-hl-blue-border px-1.5 py-0.5 mt-1.5 inline-block">experiences</span>. Currently reported developing scalable AI models and agents.
              </div>
            </div>

            <div className="border-b border-ink/15 mx-[-20px] my-6" />

            <div className="flex items-center gap-3 mb-6 mt-10 border-b-2 border-red-900/20 pb-4">
              <div className="bg-red-900/10 p-2.5 rounded-lg border border-red-900/20 shadow-sm">
                <Briefcase className="w-6 h-6 sm:w-8 sm:h-8 text-red-900" />
              </div>
              <h2 className="text-xl sm:text-3xl font-black tracking-[0.15em] font-mono leading-none pt-[2px] text-red-900 dark:text-red-500 uppercase drop-shadow-sm">
                PROJECTS
              </h2>
            </div>
            <div className="space-y-6">
              <OperationCard
                id="OP-001"
                delay={0.1}
                title="LAZYCLIP.BUZZ"
                tech="Open Source, Video Editing, Natural Language, Captions, Voice-over"
                status="ACTIVE"
                statusColor="text-emerald-800"
                imageUrl="/lazyclip.buzz mock.png"
                githubUrl="https://github.com/JAYATIAHUJA/LAZYCLIP.BUZZ"
                liveUrl="https://lazyclip.buzz"
                xUrl="https://x.com/___moinn_/status/2076235594209042859?s=20"
                defaultOpen={true}
                desc={
                  <>
                    An open-source video editor that turns prompts, uploads, or YouTube segments into captioned vertical videos with optional voice-over.
                  </>
                }
              />

              <OperationCard
                id="OP-317"
                delay={0.2}
                title="RELAY VAULT"
                tech="Monad Testnet, Smart Contracts, AI Agents, Escrow"
                status="ACTIVE"
                statusColor="text-emerald-800"
                imageUrl="/RelayVault landing page.png"
                githubUrl="https://github.com/MDMOINAKHTARR/Relay_Vault"
                youtubeUrl="https://youtu.be/IpkW9Zmbb7s?si=qtM8zDWlvqMVsKKQ"
                defaultOpen={true}
                desc={
                  <>
                    An on-chain marketplace where AI agents negotiate, exchange value, and complete protected workflows through smart-contract escrow.
                  </>
                }
              />

              <OperationCard
                id="OP-081"
                delay={0.3}
                title="UPSTART - STARTUP BLUEPRINT ENGINE"
                tech="Next.js, Node.js, SQLite, Google Gen AI"
                status="DEPLOYED"
                statusColor="text-emerald-800"
                imageUrl="/upstart-mockup.png"
                githubUrl="https://github.com/MDMOINAKHTARR"
                liveUrl="#"
                youtubeUrl="https://youtu.be/mIntn3mUa50?si=7fvye7ZSGPpWbKM6"
                defaultOpen={true}
                desc={
                  <>
                    An AI generation platform transforming concepts into validated plans and roadmaps using <Highlight style="circle" color="red">Google Generative AI</Highlight>.
                  </>
                }
              />

              <OperationCard 
                id="OP-109"
                delay={0.4}
                title="HALO AI"
                tech="React, Node.js, Next.js, REST API"
                status="ACTIVE"
                statusColor="text-emerald-800"
                imageUrl="/haloai mockup.png"
                githubUrl="https://github.com/MDMOINAKHTARR"
                liveUrl="#"
                youtubeUrl="https://youtu.be/x34yyyCvm3E?si=KWrS3WjbGiywp3Ai"
                defaultOpen={true}
                desc={
                  <>
                    A highly responsive workspace assistant pairing modern conversational models with a <Highlight style="squiggly" color="yellow">real-time streaming stream</Highlight>.
                  </>
                }
              />

              <OperationCard
                id="OP-044"
                delay={0.5}
                title="EMOTION-BASED MOVIE RECOMMENDER"
                tech="Python, DeepFace, OpenCV, MySQL"
                status="SUCCESS"
                statusColor="text-emerald-800"
                imageUrl="https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=1000"
                githubUrl="https://github.com/MDMOINAKHTARR"
                defaultOpen={true}
                desc={
                  <>
                    Real-time movie recommendations matching webcam facial responses using <Highlight style="circle" color="green">DeepFace</Highlight> OpenCV analysis.
                  </>
                }
              />

              <OperationCard 
                id="OP-012"
                delay={0.6}
                title="DEVCATION - HACKATHON ENVIRONMENT"
                tech="Next.js 15, Matter.js, React"
                status="VERIFIED"
                statusColor="text-emerald-800"
                imageUrl="/devacation-mockup.jpg"
                githubUrl="https://github.com/MDMOINAKHTARR"
                liveUrl="#"
                defaultOpen={true}
                desc={
                  <>
                    High-engagement physics engine portfolio site using <Highlight style="marker" color="yellow">Matter.js</Highlight> which secured 1st Place at PromptWars (IGDTUW 2026).
                  </>
                }
              />

              <OperationCard 
                id="OP-256"
                delay={0.7}
                title="CASSENDRA"
                tech="React, Data Analysis, Next.js, Tailwind"
                status="VERIFIED"
                statusColor="text-emerald-800"
                imageUrl="/cassendra-dashboard.png"
                githubUrl="https://github.com/MDMOINAKHTARR"
                liveUrl="#"
                defaultOpen={true}
                desc={
                  <>
                    High-performance structured dataset analyzer offering live querying and multi-attribute schema <Highlight style="marker" color="red">graph views</Highlight>.
                  </>
                }
              />
            </div>
          </section>

          <div className="border-b border-ink/5 mx-[-20px] mb-2" />

          <section className="pt-0">
            <div className="mt-8 relative z-10 border-2 border-postit-border border-solid bg-postit-bg p-5 shadow-sm text-center mx-1 cursor-pointer transition-transform active:scale-95" onClick={() => setShowQuoteGif(!showQuoteGif)}>
              <div className="absolute -top-[14px] left-1/2 -translate-x-1/2 bg-postit-title-bg px-2 text-[10px] font-bold tracking-widest text-ink/60 font-mono flex items-center justify-center">
                 <div className="h-6 w-[140px] bg-postit-title-bg absolute top-0 -z-10" />
                 THE SPIDER-NOIR QUOTE
              </div>
              <div className="border-l-[3px] border-postit-accent text-[15px] font-typewriter italic tracking-wider leading-relaxed text-left pl-4 py-1 text-ink font-bold">
                "Am I an extraordinary man? Yes. Am I an ordinary man? Yes. I'm both. I'm neither. But aren't we all?"
              </div>
              <div className="text-right mt-4 text-[11px] font-bold text-red-600 tracking-widest font-mono">
                /\\ SPIDER-NOIR(ME)
              </div>
            </div>
            
            <AnimatePresence>
              {showQuoteGif && (
                <motion.div 
                  initial={{ height: 0, opacity: 0, scale: 0.95 }}
                  animate={{ height: "auto", opacity: 1, scale: 1 }}
                  exit={{ height: 0, opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="flex justify-center relative z-0 pl-1 overflow-hidden pt-4 origin-top pb-4"
                >
                  <div className="w-[260px] transform rotate-[2deg] rounded-b border-x border-b border-ink/20 shadow-lg overflow-hidden aspect-video bg-ink/10">
                    <img src="https://media.tenor.com/XT5Z51WyY8EAAAAC/spiderman-spider-verse.gif" alt="Spider-Noir Quote" className="w-full h-full object-cover pointer-events-none" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          <div className="h-4 border-b border-ink/5 mx-[-20px]" />

          {/* DEPLOYMENT & METRICS STATUS */}
          <section className="pt-2 pb-0">
            <h2 className="text-[10px] font-bold tracking-[0.1em] font-mono mb-2 opacity-60 uppercase">Operational Status</h2>
            <div className="border border-ink/20 bg-ink/[0.02]">
              <div className="grid grid-cols-2 text-[9px] uppercase tracking-wider divide-x divide-y divide-ink/10 font-mono">
                <div className="p-2 flex flex-col gap-1">
                  <span className="opacity-50 font-bold">STATUS</span>
                  <span className="text-blue-600 font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                    ACTIVE / DEPLOYABLE
                  </span>
                </div>
                <div className="p-2 flex flex-col gap-1">
                  <span className="opacity-50 font-bold">LOCATION</span>
                  <span className="font-bold -ml-[6px] flex items-center"><MapPin className="w-3 h-3 text-ink/50 mr-[2px]" strokeWidth={2}/>NEW DELHI, IN</span>
                </div>
                
                <div className="p-2 flex flex-col gap-1 col-span-2">
                  <span className="opacity-50 font-bold">CONTACT</span>
                  <span className="font-bold">mohdmoinakhtar081@gmail.com</span>
                </div>
                
                <div className="p-2 flex flex-col gap-1">
                  <span className="opacity-50 font-bold">LAST ACCESSED</span>
                  <span className="font-bold">[2026-06-09]</span>
                </div>
                <div className="p-2 flex flex-col gap-1">
                  <span className="opacity-50 font-bold">CASE ID</span>
                  <span className="font-bold">AX-D4UV4R</span>
                </div>
              </div>
              <div className="bg-ink/5 p-1.5 text-[8px] text-center font-bold tracking-widest text-ink/70 border-t border-ink/10 font-mono uppercase">
                CENTRAL INTEL REGISTRY
              </div>
            </div>
          </section>

          <section>
            <AnalyticsWidget />
          </section>

          <section className="mt-8 border-t border-ink/10 pt-8 pb-4">
            <div className="flex flex-col items-center text-center space-y-4 max-w-sm mx-auto px-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-ink text-paper rounded text-[10px] sm:text-xs font-mono tracking-widest font-bold shadow-sm">
                AI Messaging Hub <span className="text-emerald-400">指</span>
              </span>
              <h2 className="text-3xl font-black tracking-tight text-ink font-sans">
                No Artificial Vibes
              </h2>
              <p className="text-base font-medium opacity-80 leading-relaxed text-ink text-center max-w-[440px]">
                Got something to say? Drop your message below, and let's talk artificial intelligence, machine learning, and all things data. No spam, just straight-up analytical vibes. Slide into my DMs on <a href="https://x.com/___moinn_" target="_blank" rel="noreferrer" className="font-bold text-ink hover:text-sky-400 underline decoration-ink/30 underline-offset-2 transition-colors">X/Twitter</a>, <a href="https://www.linkedin.com/in/mdmoinakhtar/" target="_blank" rel="noreferrer" className="font-bold text-ink hover:text-sky-400 underline decoration-ink/30 underline-offset-2 transition-colors">LinkedIn</a>, or drop a line via email.
              </p>
              <div className="w-full pt-2">
                <ContactPill />
              </div>
            </div>
          </section>

        </div>
      </div>


      {/* ========================================================= */}
      {/* DESKTOP-ONLY VIEW (Hidden on mobile) */}
      {/* ========================================================= */}
      <div className="hidden sm:block mt-[-20px] sm:mt-[-30px] lg:mt-[-40px] mb-[-10px] sm:mb-[-20px] lg:mb-[-30px]">
        <div className="scale-100 sm:scale-[0.65] lg:scale-[0.85] origin-top ml-[-20px] sm:ml-0">
          <TopSecretStamp />
        </div>
        
        {/* Massive confidential watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden opacity-[0.03]">
          <div className="transform -rotate-45 font-stamp text-[150px] leading-none text-ink tracking-widest select-none whitespace-nowrap">
            CONFIDENTIAL
          </div>
        </div>

        {/* Massive fingerprint watermark */}
        <div className="absolute -bottom-20 -left-20 opacity-[0.02] pointer-events-none z-0 mix-blend-multiply transform -rotate-12">
          <Fingerprint strokeWidth={0.5} className="w-[600px] h-[600px] text-ink" />
        </div>

        {/* Barcode Graphic */}
        <div className="absolute top-12 left-6 sm:left-20 flex flex-col gap-1 opacity-60">
          <div className="flex items-end h-8 gap-[2px]">
            <div className="w-1 h-full bg-ink"></div>
            <div className="w-2 h-full bg-ink"></div>
            <div className="w-[1px] h-full bg-ink"></div>
            <div className="w-1.5 h-full bg-ink"></div>
            <div className="w-3 h-full bg-ink"></div>
            <div className="w-[1px] h-full bg-ink"></div>
            <div className="w-2 h-full bg-ink"></div>
            <div className="w-[1px] h-full bg-ink"></div>
            <div className="w-1 h-full bg-ink"></div>
            <div className="w-3 h-full bg-ink"></div>
          </div>
          <div className="font-mono text-[8px] tracking-[0.3em] font-bold">MMA-2026-X</div>
        </div>

        {/* Surveillance Timestamp Overlay */}
        <RecTimestamp />

        {/* Attached Photo (Clipped to the Dossier) */}
        <div className="absolute top-12 -right-2 sm:right-0 lg:right-6 xl:right-10 z-20 flex flex-col items-center">
          <div className="transform rotate-3 relative group/photo">
            {/* Paperclip */}
            <div className="absolute -top-6 left-1/2 -ml-2 w-4 h-12 border-2 border-slate-400 rounded-full bg-transparent shadow-[1px_1px_2px_rgba(0,0,0,0.3)] z-30"></div>
            <div className="absolute -top-4 left-1/2 ml-1 w-2 h-8 border-[1.5px] border-slate-400 rounded-full bg-transparent z-30"></div>
            
            {/* Photo Container */}
            <div className="song-photo-frame w-[250px] h-[280px] sm:w-[290px] sm:h-[340px] lg:w-[350px] lg:h-[420px] bg-polaroid p-2 pb-6 sm:p-3 sm:pb-10 lg:p-4 lg:pb-12 shadow-[2px_4px_10px_rgba(0,0,0,0.3)] border border-gray-300 transition-all transform-gpu will-change-transform group-hover/photo:rotate-0 group-hover/photo:scale-[1.02] duration-700 ease-out relative z-20">
              
              <div className="w-full h-full bg-zinc-800 overflow-hidden relative border border-zinc-700 group/image">
                 <SubjectPortrait
                   alt="Subject 8092-AX"
                   className="song-portrait w-full h-full object-cover relative z-10 transition-transform duration-[420ms] ease-out transform-gpu will-change-transform opacity-100 group-hover/image:scale-[1.05]"
                   onError={(event) => {
                     event.currentTarget.style.display = 'none';
                   }}
                 />

                 {/* Photo stays normal */}
                 
                 {/* Song visuals take over the portrait for image assets (videos play on the CRT TV). */}
                  {songVisual && !isCrtTvTrack ? (
                    <SongThemeOverlay key={songVisual.src} visual={songVisual} onRevealPortrait={revealPortrait} />
                  ) : (
                    showGif && !isMobileViewport && <SpiderNoirThemeOverlay fading={gifFading} />
                  )}

                 {/* Surveillance UI Overlay */}
                 <div className="absolute inset-0 z-20 pointer-events-none p-1 flex flex-col justify-between opacity-80 group-hover/image:opacity-100 transition-opacity duration-700 ease-out">
                    <div className="flex justify-between items-start">
                       <div className="w-2 h-2 border-t-[1.5px] border-l-[1.5px] border-red-500/80"></div>
                       <div className="w-2 h-2 border-t-[1.5px] border-r-[1.5px] border-red-500/80"></div>
                    </div>
                    {/* Crosshair */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-all duration-700 ease-out scale-150 group-hover/image:scale-100">
                       <div className="w-full h-[1px] bg-red-500/30 absolute top-1/2"></div>
                       <div className="w-[1px] h-full bg-red-500/30 absolute left-1/2"></div>
                       <div className="w-6 h-6 border border-red-500/60 rounded-full flex items-center justify-center">
                         <div className="w-1 h-1 bg-red-500/80 rounded-full"></div>
                       </div>
                    </div>
                    <div className="flex justify-between items-end">
                       <div className="w-2 h-2 border-b-[1.5px] border-l-[1.5px] border-red-500/80"></div>
                       <div className="w-2 h-2 border-b-[1.5px] border-r-[1.5px] border-red-500/80"></div>
                    </div>
                 </div>

                 {/* Fallback silhouette if image fails to load */}
                 <div className="absolute inset-0 flex items-end justify-center pointer-events-none opacity-30">
                   <svg viewBox="0 0 24 24" fill="currentColor" className="w-20 h-20 text-white">
                     <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                   </svg>
                 </div>
                 <div className="absolute inset-0 bg-ink/5 mix-blend-overlay"></div>
              </div>
              <div className="absolute bottom-1 w-full text-center left-0 font-typewriter text-[8px] sm:text-[9px] lg:text-[11px] text-ink/70 tracking-widest mt-1 group-hover/photo:text-red-700 transition-colors duration-700 ease-out">
                TARGET // LOCKED
              </div>
            </div>
          </div>
          
          {/* Spider-Noir Quote Note under the image */}
          <div className="mt-8 ml-4 w-[240px] sm:w-[280px] lg:w-[320px] bg-paper shadow-[3px_6px_12px_rgba(0,0,0,0.3)] border-[2px] border-folder-dark/30 transform -rotate-3 relative transition-all duration-700 ease-out hover:scale-[1.02] active:scale-[0.98] z-30 p-4 sm:p-5 lg:p-6 cursor-pointer" onClick={() => setShowQuoteGif(!showQuoteGif)}>
            {/* Top Tape */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 sm:w-20 h-5 sm:h-6 bg-tape opacity-90 rotate-[-5deg] shadow-[1px_2px_3px_rgba(0,0,0,0.15)] transition-colors duration-500 ease-out z-10" />
            
            <div className="font-typewriter text-[11px] sm:text-xs lg:text-sm tracking-wide leading-[1.6] text-ink font-bold transition-colors relative z-10 border-l-[3px] border-ink/40 pl-3">
              "Am I an extraordinary man? Yes. Am I an ordinary man? Yes. I'm both. I'm neither. But aren't we all?"
            </div>
            
            <div className="mt-4 pt-3 border-t border-ink/20 flex gap-2 justify-end items-center relative z-10">
               <div className="flex gap-0.5 opacity-80">
                  <div className="w-0.5 h-3 bg-red-600 transform rotate-[15deg] transition-all duration-500"></div>
                  <div className="w-0.5 h-3 bg-red-600 transform -rotate-[15deg] transition-all duration-500"></div>
               </div>
               <div className="text-[10px] sm:text-[11px] lg:text-xs uppercase tracking-[0.15em] font-stamp text-stamp font-bold transition-colors duration-500">
                 Spider-Noir
               </div>
            </div>
          </div>
          
          <AnimatePresence>
            {showQuoteGif && (
              <motion.div 
                initial={{ opacity: 0, y: -20, rotate: -3 }}
                animate={{ opacity: 1, y: 0, rotate: 6 }}
                exit={{ opacity: 0, y: -20, rotate: -3 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="absolute top-full -mt-6 mt-[-10px] w-[240px] sm:w-[280px] lg:w-[320px] z-10 origin-top overflow-hidden pt-12 translate-x-4 sm:translate-x-10 pointer-events-none"
              >
                <div className="w-full border-x-2 border-b-2 border-slate-300 shadow-xl overflow-hidden aspect-[16/9] bg-ink/10">
                  <img src="https://media.tenor.com/XT5Z51WyY8EAAAAC/spiderman-spider-verse.gif" alt="Spider-Noir Quote" className="w-full h-full object-cover" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-[120px] sm:mt-[160px] lg:mt-0 lg:pr-[380px] xl:pr-[460px] relative z-10 w-full max-w-[1200px]">
          {/* Classification Header */}
          <div className="mt-2 lg:mt-6 mb-8 lg:mb-10 flex flex-col sm:flex-row sm:justify-between sm:items-end border-b-[3px] border-ink/20 pb-2 gap-2">
            <Typewriter delay={0.1} className="text-sm sm:text-[11px] md:text-xs tracking-tight font-bold opacity-80">
              FILE NO. ENR-06717711923 · DELHI DIVISION
            </Typewriter>
            <Typewriter delay={0.2} className="text-sm sm:text-[11px] md:text-xs tracking-tight font-bold opacity-80">
              ID: MMA-2026 · PAGE 1/4
            </Typewriter>
          </div>

          {/* Data Fields */}
          <div className="space-y-6 sm:space-y-8 text-sm sm:text-base leading-relaxed">
            
            <div className="grid grid-cols-[100px_1fr] sm:grid-cols-[140px_1fr] items-baseline gap-2">
              <Typewriter delay={0.4} className="font-bold opacity-60 tracking-wider text-sm sm:text-base">NAME:</Typewriter>
              <Typewriter delay={0.5} className="font-bold text-2xl sm:text-3xl uppercase tracking-widest px-1">MD MOIN AKHTAR</Typewriter>
            </div>

            <div className="grid grid-cols-[100px_1fr] sm:grid-cols-[140px_1fr] items-baseline gap-2">
              <Typewriter delay={0.6} className="font-bold opacity-60 tracking-wider text-sm sm:text-base">ROLE:</Typewriter>
              <Typewriter delay={0.7}><Highlight style="marker" color="blue" className="text-lg sm:text-xl uppercase font-bold">Software Developer</Highlight></Typewriter>
            </div>

            <div className="grid grid-cols-[100px_1fr] sm:grid-cols-[140px_1fr] items-baseline gap-2">
              <Typewriter delay={0.8} className="font-bold opacity-60 tracking-wider text-sm sm:text-base">AFFILIATION:</Typewriter>
              <Typewriter delay={0.9}><Highlight style="circle" color="red" className="uppercase font-bold text-base sm:text-lg">VIPS-TC (B.Tech AI & Data Science, CGPA: 8.03)</Highlight></Typewriter>
            </div>

            <div className="grid grid-cols-[100px_1fr] sm:grid-cols-[140px_1fr] items-baseline gap-2">
              <Typewriter delay={0.95} className="font-bold opacity-60 tracking-wider text-sm sm:text-base">LEADERSHIP:</Typewriter>
              <Typewriter delay={0.98}><Highlight style="squiggly" color="yellow" className="uppercase font-bold text-base sm:text-lg pl-1">Core Member  - Cluster Data Science Club</Highlight></Typewriter>
            </div>

            <div className="grid grid-cols-[100px_1fr] sm:grid-cols-[140px_1fr] items-baseline gap-2">
              <Typewriter delay={1.0} className="font-bold opacity-60 tracking-wider text-xs sm:text-sm">PRIMARY SKILL:</Typewriter>
              <Typewriter delay={1.1} className="leading-7 text-sm sm:text-base">
                Subject demonstrates extreme proficiency in <Highlight style="circle" color="yellow">React, TypeScript</Highlight>, and <Highlight style="underline" color="green">Python</Highlight> for AI implementation. Known capable of neutralizing <Highlight style="marker" color="pink">complex AI-integration</Highlight> with high efficiency.
              </Typewriter>
            </div>

            <div className="grid grid-cols-[100px_1fr] sm:grid-cols-[140px_1fr] items-baseline gap-2">
              <Typewriter delay={1.4} className="font-bold opacity-60 tracking-wider text-xs sm:text-sm">SECONDARY:</Typewriter>
              <Typewriter delay={1.5} className="leading-7 text-sm sm:text-base">
                Operational capacity extends into <Highlight style="marker" color="yellow">Machine Learning</Highlight>, <Highlight style="circle" color="blue">OpenCV / AI Agents</Highlight>, and <Highlight style="underline" color="red">Backend Architecture</Highlight> (Node.js/Express/Neo4j). History of success in highly competitive <Highlight style="squiggly" color="pink">Hackathon Environments</Highlight>.
              </Typewriter>
            </div>

            <div className="grid grid-cols-[100px_1fr] sm:grid-cols-[140px_1fr] items-baseline gap-2">
              <Typewriter delay={1.8} className="font-bold opacity-60 tracking-wider text-xs sm:text-sm">OBJECTIVE:</Typewriter>
              <Typewriter delay={1.9} className="leading-7 text-[15px] sm:text-[17px] font-bold text-ink">
                Tasked with engineering <Highlight style="underline" color="green">intelligent analytical platforms</Highlight> and executing <Highlight style="squiggly" color="blue">seamless digital experiences</Highlight>. Currently reported to be <Highlight style="marker" color="yellow">developing scalable AI models and agents</Highlight>.
              </Typewriter>
            </div>

          </div>
          
          <div className="mt-8 lg:mt-12 pt-6 border-t-[3px] border-ink/20">
            <div className="grid grid-cols-[100px_1fr] sm:grid-cols-[140px_1fr] items-baseline gap-2">
              <Typewriter delay={2.1} className="font-bold opacity-60 tracking-wider">STATUS:</Typewriter>
              <div className="space-y-2 text-sm sm:text-base">
                <Typewriter delay={2.2}>
                  <span className="opacity-50 inline-block w-28 text-xs sm:text-sm">LOCATION:</span> <strong className="uppercase">NEW DELHI, INDIA</strong>
                </Typewriter>
                <Typewriter delay={2.4}>
                  <span className="opacity-50 inline-block w-28 text-xs sm:text-sm">VERIFICATION:</span> ACTIVE / DEPLOYABLE
                </Typewriter>
                <Typewriter delay={2.6}>
                  <span className="opacity-50 inline-block w-28 text-xs sm:text-sm">CONTACT:</span> <Highlight>mohdmoinakhtar081@gmail.com</Highlight>
                </Typewriter>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDataScienceCert && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pb-20 sm:pb-6 bg-ink/80 backdrop-blur-sm" onClick={() => setShowDataScienceCert(false)}>
          <div className="relative w-full max-w-4xl max-h-[85vh] bg-paper shadow-2xl flex flex-col z-10 animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center bg-ink text-paper p-3 shrink-0">
               <span className="font-mono text-xs uppercase tracking-widest font-bold">SECURE VIEWER // [ENCRYPTED DATA]</span>
               <button onClick={() => setShowDataScienceCert(false)} className="hover:bg-paper/20 p-1 transition-colors">
                 <X className="w-5 h-5" />
               </button>
            </div>
            <div className="flex-1 w-full bg-zinc-200 relative overflow-hidden flex items-center justify-center p-4">
               <img src="/DATA SCIENCE FOUNDATIONS (2024).jpeg" alt="Data Science Foundations Certificate" className="max-w-full max-h-[75vh] object-contain shadow-md" />
            </div>
          </div>
        </div>,
        document.body
      )}

      {showUltimateCert && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pb-20 sm:pb-6 bg-ink/80 backdrop-blur-sm" onClick={() => setShowUltimateCert(false)}>
          <div className="relative w-full max-w-4xl h-[85vh] bg-paper shadow-2xl flex flex-col z-10 animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center bg-ink text-paper p-3 shrink-0">
               <span className="font-mono text-xs uppercase tracking-widest font-bold">SECURE VIEWER // [ENCRYPTED DATA]</span>
               <button onClick={() => setShowUltimateCert(false)} className="hover:bg-paper/20 p-1 transition-colors">
                 <X className="w-5 h-5" />
               </button>
            </div>
            <div className="flex-1 w-full bg-zinc-200 relative overflow-hidden flex items-center justify-center">
               <Suspense fallback={<SecureViewerFallback />}>
                 <PdfViewer url="/The_Ultimate_Job_Ready_Data_Science_Course_Certificate.pdf" />
               </Suspense>
            </div>
          </div>
        </div>,
        document.body
      )}
    </PageTransition>
  );
}

function SubjectPortrait({
  alt,
  className,
  onError,
}: {
  alt: string;
  className: string;
  onError?: (event: SyntheticEvent<HTMLImageElement>) => void;
}) {
  return (
    <picture className="contents">
      <source srcSet="/portrait.avif" type="image/avif" />
      <source srcSet="/portrait.webp" type="image/webp" />
      <img src="/portrait.jpg" alt={alt} className={className} loading="eager" decoding="async" onError={onError} />
    </picture>
  );
}

function SecureViewerFallback() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-zinc-200 p-8 font-mono text-zinc-700">
      <span className="text-[10px] font-black tracking-[0.22em] opacity-60">Loading viewer…</span>
    </div>
  );
}

function SpiderNoirThemeOverlay({ fading }: { fading: boolean }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 z-15 overflow-hidden transition-opacity duration-500 ease-out ${fading ? 'opacity-0' : 'opacity-100'}`}
      style={{ contain: 'paint', transform: 'translateZ(0)', willChange: 'opacity' }}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 z-30 bg-white"
        style={{ animation: 'flash 450ms ease-out forwards', willChange: 'opacity' }}
      />
      <div className="absolute inset-0 z-20 bg-ink/20" />
      <img
        src={SPIDER_NOIR_GIF}
        alt=""
        loading="eager"
        decoding="async"
        fetchPriority="high"
        draggable={false}
        className="absolute inset-0 z-10 h-full w-full object-cover opacity-95"
        style={{ backfaceVisibility: 'hidden', filter: 'none', transform: 'translateZ(0)' }}
      />
    </div>
  );
}

function SongThemeOverlay({ visual, onRevealPortrait }: { visual: MusicVisual; onRevealPortrait: () => void }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const [completedLoops, setCompletedLoops] = useState(0);
  const playCount = visual.playCount ?? 1;
  const mediaClassName = 'song-theme-media absolute inset-0 z-10 h-full w-full object-cover opacity-100';
  const mediaStyle = {
    backfaceVisibility: 'hidden' as const,
    objectPosition: visual.objectPosition ?? 'center',
    transform: 'translateZ(0)',
  };

  useEffect(() => {
    if (visual.type !== 'image') return;

    const totalDuration = (visual.cycleDurationMs ?? 3000) * playCount;
    const fadeTimer = window.setTimeout(() => {
      setIsFading(true);
      onRevealPortrait();
    }, Math.max(0, totalDuration - 420));
    const hideTimer = window.setTimeout(() => setIsVisible(false), totalDuration);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
    };
  }, [onRevealPortrait, playCount, visual.cycleDurationMs, visual.type]);

  if (!isVisible) return null;

  const handleVideoEnded = (video: HTMLVideoElement) => {
    const nextLoop = completedLoops + 1;
    if (nextLoop >= playCount) {
      onRevealPortrait();
      setIsVisible(false);
      return;
    }

    setCompletedLoops(nextLoop);
    video.currentTime = 0;
    void video.play();
  };

  return (
    <div
      className={`song-theme-overlay ${visual.type === 'image' ? 'song-theme-overlay--gif' : ''} pointer-events-none absolute inset-0 z-[15] overflow-hidden transition-opacity duration-[400ms] ease-out ${isFading ? 'opacity-0' : 'opacity-100'}`}
      style={{ contain: 'paint', transform: 'translateZ(0)' }}
      aria-hidden="true"
    >
      <div
        className="song-theme-flash absolute inset-0 z-30 bg-white"
        style={{ animation: 'flash 350ms ease-out forwards', willChange: 'opacity' }}
      />
      <div className="song-theme-frame-transition absolute inset-0 z-30" />
      <div className="absolute inset-0 z-20 bg-ink/10 mix-blend-overlay" />
      {visual.type === 'video' ? (
        <video
          src={visual.src}
          className={mediaClassName}
          style={mediaStyle}
          autoPlay
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          onTimeUpdate={(event) => {
            const video = event.currentTarget;
            if (completedLoops === playCount - 1 && video.duration - video.currentTime <= 0.4) {
              setIsFading(true);
              onRevealPortrait();
            }
          }}
          onEnded={(event) => handleVideoEnded(event.currentTarget)}
          onError={() => {
            onRevealPortrait();
            setIsVisible(false);
          }}
        />
      ) : (
        <img
          src={visual.src}
          alt=""
          className={mediaClassName}
          style={mediaStyle}
          loading="eager"
          decoding="async"
          draggable={false}
        />
      )}
    </div>
  );
}

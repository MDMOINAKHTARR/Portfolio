import { Highlight } from '../components/Highlight';
import { TopSecretStamp } from '../components/Stamps';
import { Typewriter } from '../components/Typewriter';
import { PageTransition } from '../components/PageTransition';
import { useState } from 'react';
import { Fingerprint, Search, MapPin, Activity, X, ExternalLink, Github, Terminal, Award, Code, Linkedin } from 'lucide-react';
import { FaXTwitter } from 'react-icons/fa6';
import { GithubStreak } from '../components/GithubStreak';
import { LeetcodeStreak } from '../components/LeetcodeStreak';
import { createPortal } from 'react-dom';
import { PdfViewer } from '../components/PdfViewer';
import { SkillsCarousel } from '../components/SkillsCarousel';

export function Capabilities() {
  const [showDataScienceCert, setShowDataScienceCert] = useState(false);
  const [showUltimateCert, setShowUltimateCert] = useState(false);

  return (
    <PageTransition className="px-6 pt-6 pb-12 sm:px-20 sm:pt-10 sm:pb-24 relative overflow-hidden">
      <div className="mb-6">
        <TopSecretStamp text="SKILLS & CERTIFICATES" />
      </div>

      {/* Decorative Thumbprint / Watermark */}
      <div className="absolute top-1/2 right-10 transform -translate-y-1/2 opacity-[0.03] pointer-events-none grayscale sepia select-none">
        <svg fill="currentColor" viewBox="0 0 24 24" className="w-[400px] h-[400px]">
           <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
        </svg>
      </div>

      {/* Classification Header */}


      {/* TECHNICAL SKILLS */}
      <section className="pt-2 z-10 relative">
        <div className="flex items-center gap-2 mb-1">
          <Terminal className="w-4 h-4" />
          <h2 className="text-xs font-bold tracking-[0.1em] font-mono leading-none pt-[2px]">TECHNICAL SKILLS (PRIMARY & SECONDARY)</h2>
        </div>
        <div className="border-t border-ink/10 pt-1">
          <div className="-mx-6 sm:-mx-8 mb-0">
            <SkillsCarousel />
          </div>
          <p className="text-xs font-mono italic opacity-80 leading-relaxed max-w-[90%] mb-12">
            <span className="bg-hl-pink-bg border border-hl-pink-border px-2 py-0.5 rounded-full not-italic text-[10px] tracking-wider shadow-sm mr-1">CERTIFIED</span> comprehensive stack and analytical tooling.
          </p>

          {/* Premium Thematic 5-Banner Grid Layout */}
          <div className="grid grid-cols-10 gap-2 mb-6">
            {/* Left Column (LeetCode & LinkedIn) */}
            <div className="col-span-4 flex flex-col gap-2">
              {/* LeetCode (Position 1: Top-Left) */}
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
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent flex flex-col justify-end p-4 transition-all duration-300">
                  <div className="flex items-start gap-3 flex-col transform translate-y-1 sm:translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <Code className="w-6 h-6 text-paper shrink-0 group-hover:scale-110 transition-transform" />
                    <div>
                      <h3 className="text-paper font-bold font-mono tracking-widest text-sm sm:text-base leading-tight">LEETCODE</h3>
                      <p className="text-paper/70 font-mono text-[9px] sm:text-[11px] tracking-widest mt-0.5 font-bold">ALGORITHM CHALLENGES // @__moinn_</p>
                    </div>
                  </div>
                </div>
              </a>

              {/* LinkedIn (Position 2: Bottom-Left - Taller) */}
              <a 
                href="https://www.linkedin.com/in/mdmoinakhtar/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block relative w-full h-[120px] md:h-[210px] overflow-hidden border-2 border-ink/40 shadow-sm group bg-ink rounded-[2px]"
              >
                <img 
                  src="/linkedin banner.jpg" 
                  alt="LinkedIn Operations" 
                  className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent flex flex-col justify-end p-4 transition-all duration-300">
                  <div className="flex items-start gap-3 flex-col transform translate-y-1 sm:translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <Linkedin className="w-6 h-6 text-paper shrink-0 group-hover:scale-110 transition-transform" />
                    <div>
                      <h3 className="text-paper font-bold font-mono tracking-widest text-sm sm:text-base leading-tight">LINKEDIN</h3>
                      <p className="text-paper/70 font-mono text-[9px] sm:text-[11px] tracking-widest mt-0.5 font-bold">PROFESSIONAL NETWORK // @mdmoinakhtar</p>
                    </div>
                  </div>
                </div>
              </a>
            </div>

            {/* Right Column (GitHub, 4th Image, Twitter) */}
            <div className="col-span-6 flex flex-col gap-2">
              {/* GitHub (Position 3: Top-Right - Biggest) */}
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
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent flex flex-col justify-end p-4 transition-all duration-300">
                  <div className="flex items-center gap-3 transform translate-y-1 sm:translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <Github className="w-6 h-6 text-paper shrink-0 group-hover:scale-110 transition-transform" />
                    <div>
                      <h3 className="text-paper font-bold font-mono tracking-widest text-sm sm:text-base leading-tight">GITHUB</h3>
                      <p className="text-paper/70 font-mono text-[9px] sm:text-[11px] tracking-widest mt-0.5 font-bold">SOURCE REPOSITORY // @MDMOINAKHTARR</p>
                    </div>
                  </div>
                </div>
              </a>

              {/* Bottom Row inside Right Column (4th Image & Twitter side-by-side) */}
              <div className="grid grid-cols-10 gap-2 h-[90px] md:h-[120px]">
                {/* 4th Image (Position 4: Bottom-Middle - Smallest) */}
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
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent flex flex-col justify-end p-2 sm:p-3 transition-all duration-300">
                    <div className="flex items-center gap-2 transform translate-y-1 sm:translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <FaXTwitter className="w-4 h-4 text-paper shrink-0 group-hover:scale-110 transition-transform" />
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
            className="p-4 bg-amber-900/5 border border-amber-900/10 shadow-sm flex items-start gap-3 w-full cursor-pointer hover:bg-amber-900/15 dark:bg-amber-500/5 dark:border-amber-500/10 dark:hover:bg-amber-500/10 transition-colors group"
            onClick={() => setShowDataScienceCert(true)}
          >
              <Typewriter delay={0.1} className="opacity-50 font-bold font-mono tracking-widest mt-1 shrink-0">[!]</Typewriter>
              <div className="flex flex-col gap-1.5 flex-1 select-none">
                <Typewriter delay={0.2} className="font-bold text-[11px] leading-tight sm:text-sm tracking-widest font-mono text-amber-900 dark:text-amber-500">
                  <Highlight style="circle" color="yellow" className="border-b border-dashed border-amber-500/40 pb-1">
                    CERTIFIED: DATA SCIENCE FOUNDATIONS (2024)
                  </Highlight>
                </Typewriter>
                <span className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono tracking-widest font-bold text-zinc-950 bg-amber-200 hover:bg-amber-300 dark:bg-amber-700 dark:hover:bg-amber-600 dark:text-white border border-amber-500 dark:border-amber-600 rounded shadow-sm group-hover:scale-[1.02] transition-all w-fit">
                  <ExternalLink className="w-3 h-3" /> VIEW CERTIFICATE
                </span>
              </div>
          </div>

          <div 
            className="mt-4 p-4 bg-amber-900/5 border border-amber-900/10 shadow-sm flex items-start gap-3 w-full cursor-pointer hover:bg-amber-900/15 dark:bg-amber-500/5 dark:border-amber-500/10 dark:hover:bg-amber-500/10 transition-colors group"
            onClick={() => setShowUltimateCert(true)}
          >
              <Typewriter delay={0.2} className="opacity-50 font-bold font-mono tracking-widest mt-1 shrink-0">[!]</Typewriter>
              <div className="flex flex-col gap-1.5 flex-1 select-none">
                <Typewriter delay={0.3} className="font-bold text-[11px] leading-tight sm:text-sm tracking-widest font-mono text-amber-900 dark:text-amber-500">
                  <Highlight style="circle" color="yellow" className="border-b border-dashed border-amber-500/40 pb-1">
                    CERTIFIED: THE ULTIMATE JOB READY DATA SCIENCE COURSE
                  </Highlight>
                </Typewriter>
                <span className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono tracking-widest font-bold text-zinc-950 bg-amber-200 hover:bg-amber-300 dark:bg-amber-700 dark:hover:bg-amber-600 dark:text-white border border-amber-500 dark:border-amber-600 rounded shadow-sm group-hover:scale-[1.02] transition-all w-fit">
                  <ExternalLink className="w-3 h-3" /> VIEW CERTIFICATE
                </span>
              </div>
          </div>
        </div>
      </section>

      {showDataScienceCert && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pb-20 sm:pb-6 bg-ink/80 backdrop-blur-sm" onClick={() => setShowDataScienceCert(false)}>
          <div className="relative w-full max-w-4xl max-h-[85vh] bg-paper shadow-2xl flex flex-col z-10 animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center bg-ink text-paper p-3 shrink-0">
               <span className="font-mono text-xs uppercase tracking-widest font-bold">SECURE VIEWER // [ENCRYPTED DATA]</span>
               <button onClick={() => setShowDataScienceCert(false)} className="p-1 transition-colors hover:bg-red-700 hover:text-white">
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
               <button onClick={() => setShowUltimateCert(false)} className="p-1 transition-colors hover:bg-red-700 hover:text-white">
                 <X className="w-5 h-5" />
               </button>
            </div>
            <div className="flex-1 w-full bg-zinc-200 relative overflow-hidden flex items-center justify-center">
               <PdfViewer url="/The_Ultimate_Job_Ready_Data_Science_Course_Certificate.pdf" />
            </div>
          </div>
        </div>,
        document.body
      )}
    </PageTransition>
  );
}

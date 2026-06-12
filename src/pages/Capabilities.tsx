import { Highlight } from '../components/Highlight';
import { TopSecretStamp } from '../components/Stamps';
import { Typewriter } from '../components/Typewriter';
import { PageTransition } from '../components/PageTransition';
import { useState } from 'react';
import { Fingerprint, Search, MapPin, Activity, X, ExternalLink, Github, Terminal, Award } from 'lucide-react';
import { GithubStreak } from '../components/GithubStreak';
import { createPortal } from 'react-dom';
import { PdfViewer } from '../components/PdfViewer';
import { SkillsCarousel } from '../components/SkillsCarousel';

export function Capabilities() {
  const [showDataScienceCert, setShowDataScienceCert] = useState(false);
  const [showUltimateCert, setShowUltimateCert] = useState(false);

  return (
    <PageTransition className="px-6 py-12 sm:px-20 sm:py-24 relative overflow-hidden">
      <TopSecretStamp text="SKILLS & CERTIFICATES" />

      {/* Decorative Thumbprint / Watermark */}
      <div className="absolute top-1/2 right-10 transform -translate-y-1/2 opacity-[0.03] pointer-events-none grayscale sepia select-none">
        <svg fill="currentColor" viewBox="0 0 24 24" className="w-[400px] h-[400px]">
           <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
        </svg>
      </div>

      {/* Classification Header */}
      <div className="mt-8 mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-end border-b-[3px] border-ink/20 pb-2 gap-2">
        <Typewriter delay={0.1} className="text-sm sm:text-[11px] md:text-xs tracking-tight font-bold opacity-80">
           SKILLS & CERTIFICATES
        </Typewriter>
        <Typewriter delay={0.3} className="text-sm sm:text-[11px] md:text-xs tracking-tight font-bold opacity-80">
           PAGE 2/4
        </Typewriter>
      </div>

      <Typewriter delay={0.5} className="mb-8 text-sm sm:text-base leading-relaxed border-l-[4px] border-stamp/60 pl-4 py-2 italic opacity-90 max-w-4xl" as="p">
        "Subject effectively coordinates rapid multi-agent development and implements intelligent data workflows. Demonstrates highly successful engagement in competitive Hackathon operations."
      </Typewriter>

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

          <div className="mb-4">
            <a 
              href="https://github.com/MDMOINAKHTARR" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block relative w-full h-36 sm:h-48 overflow-hidden border border-ink/20 shadow-sm group bg-ink"
            >
              <img 
                src="https://media1.tenor.com/m/czm3QzVCDJIAAAAC/batman-bruce-wayne.gif" 
                alt="GitHub Operations Banner" 
                className="absolute inset-0 w-full h-full object-cover object-center grayscale-[0.8] opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=1000';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-transparent flex flex-col justify-end p-4 sm:p-6 transition-all duration-300">
                <div className="flex items-center gap-3 transform translate-y-1 sm:translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <Github className="w-6 h-6 sm:w-8 sm:h-8 text-paper shrink-0 group-hover:scale-110 transition-transform" />
                  <div>
                    <h3 className="text-paper font-bold font-mono tracking-widest text-xs sm:text-base leading-tight">SECURE REPOSITORY ACCESS</h3>
                    <p className="text-paper/70 font-mono text-[10px] sm:text-xs tracking-widest mt-0.5">OPEN CONNECTION TO @MDMOINAKHTARR</p>
                  </div>
                </div>
              </div>
            </a>
          </div>

          <div className="mb-8">
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
                <span className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono tracking-widest font-bold text-zinc-800 dark:text-zinc-200 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 border border-zinc-300 dark:border-zinc-600 rounded shadow-sm group-hover:scale-[1.02] transition-all w-fit">
                  <ExternalLink className="w-3 h-3 text-sky-600 dark:text-sky-400" /> VIEW CERTIFICATE
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
                <span className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono tracking-widest font-bold text-zinc-800 dark:text-zinc-200 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 border border-zinc-300 dark:border-zinc-600 rounded shadow-sm group-hover:scale-[1.02] transition-all w-fit">
                  <ExternalLink className="w-3 h-3 text-sky-600 dark:text-sky-400" /> VIEW CERTIFICATE
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
               <PdfViewer url="/The_Ultimate_Job_Ready_Data_Science_Course_Certificate.pdf" />
            </div>
          </div>
        </div>,
        document.body
      )}
    </PageTransition>
  );
}

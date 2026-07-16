import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Highlight } from '../components/Highlight';
import { ClassifiedStamp } from '../components/Stamps';
import { Typewriter } from '../components/Typewriter';
import { PageTransition } from '../components/PageTransition';
import { Award, BookOpen, ExternalLink, Medal, Sparkles, Trophy, X } from 'lucide-react';
import { PdfViewer } from '../components/PdfViewer';

export function Evidence() {
  const [showPubDetails, setShowPubDetails] = useState(false);
  const [activePdf, setActivePdf] = useState<string | null>(null);

  return (
    <PageTransition className="awards-page relative overflow-hidden px-4 pb-10 pt-4 sm:px-20 sm:pb-24 sm:pt-6">
      <section className="awards-desktop-summary mt-2 hidden sm:grid" aria-label="Awards overview">
        <div className="awards-desktop-intro">
          <span className="awards-desktop-kicker"><Sparkles className="h-4 w-4" /> Selected achievements</span>
          <h1>Awards, wins & published work</h1>
          <p>A concise record of competitive builds, verified results, and research contributions.</p>
        </div>
        <div className="awards-desktop-metric awards-desktop-metric--gold">
          <Trophy className="h-6 w-6" />
          <span><strong>02</strong> First-place wins</span>
        </div>
        <div className="awards-desktop-metric awards-desktop-metric--green">
          <Medal className="h-6 w-6" />
          <span><strong>04</strong> Competition records</span>
        </div>
        <div className="awards-desktop-metric awards-desktop-metric--blue">
          <BookOpen className="h-6 w-6" />
          <span><strong>01</strong> IEEE paper</span>
        </div>
      </section>

      <section className="awards-mobile-hero mt-5 sm:hidden" aria-labelledby="mobile-awards-title">
        <div className="awards-mobile-eyebrow">
          <span><Sparkles className="h-3.5 w-3.5" /> Portfolio highlights</span>
          <span>2025—2026</span>
        </div>
        <h1 id="mobile-awards-title">Awards & Research</h1>
        <p>Competition results, certificates, and published work—organized for a quick review.</p>
        <div className="awards-mobile-stats" aria-label="Achievement summary">
          <span><strong>02</strong> Wins</span>
          <span><strong>04</strong> Events</span>
          <span><strong>01</strong> Paper</span>
        </div>
      </section>

      <div className="relative z-10 mt-7 space-y-9 sm:mt-8 sm:space-y-16">
        
        {/* Section 1: Hackathons */}
        <div className="mb-6 sm:mb-8">
          <Typewriter delay={0.5} className="award-section-heading mb-4 block border-b border-ink/30 pb-2 text-base font-black uppercase leading-snug tracking-[0.08em] sm:mb-6 sm:text-xl sm:tracking-widest">
            <span className="hidden sm:inline">[01] Tracked Field Deployments (Hackathons)</span>
            <span className="flex items-center justify-between gap-3 sm:hidden"><span className="flex items-center gap-2"><Trophy className="h-4 w-4" /> Hackathon wins</span><span className="award-section-count">04</span></span>
          </Typewriter>
          
          <div className="award-stack space-y-6 sm:space-y-8">
            {/* Deploy 1 */}
            <div className="award-card award-card--featured award-card--grand-win relative border border-ink/20 p-3 sm:p-6">
              <span className="award-mobile-seal sm:hidden"><Trophy className="h-4 w-4" /> Grand win</span>
              <Typewriter delay={0.7} className="award-kicker mb-2 block font-black text-stamp">[BUILDATHON WINNER]</Typewriter>
              <Typewriter delay={0.9} className="award-card-title text-base font-black leading-snug sm:text-lg">HERMES X GROWTHX BUILDATHON</Typewriter>
              <div className="award-prize-highlight" aria-label="$5,800 in winner credits">
                <strong>$5,800</strong>
                <span>Winner credits</span>
              </div>
              <Typewriter delay={1.1} className="mb-3 mt-2 block text-sm leading-relaxed sm:mb-4 sm:text-base">
                Built <Highlight style="circle" color="blue">LazyClip.buzz</Highlight> in 8 hours, won the Buildathon, and reached <Highlight style="marker" color="yellow">100+ signups on day one</Highlight>.
              </Typewriter>

              <div className="award-sponsor-block" aria-label="Technology partners">
                <span className="award-sponsor-label">Powered & supported by</span>
                <div className="award-sponsor-list">
                  <span className="award-sponsor award-sponsor--opencode">OpenCode</span>
                  <span className="award-sponsor award-sponsor--openai">OpenAI</span>
                  <span className="award-sponsor award-sponsor--elevenlabs">ElevenLabs</span>
                  <span className="award-sponsor award-sponsor--linkup">Linkup</span>
                  <span className="award-sponsor award-sponsor--dodo">Dodo Payments</span>
                  <span className="award-sponsor award-sponsor--wispr">Wispr Flow</span>
                  <span className="award-sponsor award-sponsor--cloudflare">Cloudflare</span>
                </div>
              </div>

              <div className="award-impact-row sm:hidden" aria-label="Buildathon impact">
                <span><strong>8 hrs</strong> to build</span>
                <span><strong>100+</strong> signups</span>
                <span><strong>$5.8k</strong> credits</span>
              </div>

              <div className="award-evidence-grid mt-4 grid grid-cols-2 gap-2 border-t border-ink/10 pt-4 sm:mt-6 sm:grid-cols-2 sm:gap-6 sm:pt-6">
                <div className="award-photo mx-auto w-full max-w-sm -rotate-1 transform border border-gray-300 bg-polaroid p-2 pb-4 shadow-[2px_4px_10px_rgba(0,0,0,0.3)] transition duration-500 hover:rotate-0 sm:-rotate-2 sm:p-3 sm:pb-8 sm:hover:scale-105">
                  <div className="aspect-video w-full overflow-hidden border border-zinc-700 bg-zinc-800 sm:aspect-[4/3]">
                    <img src="/hermeswin1.jpeg" alt="GrowthX Buildathon win" loading="lazy" decoding="async" className="w-full h-full object-cover opacity-90 hover:opacity-100 transition duration-500" />
                  </div>
                </div>
                <div className="award-photo mx-auto w-full max-w-sm rotate-1 transform border border-gray-300 bg-polaroid p-2 pb-4 shadow-[2px_4px_10px_rgba(0,0,0,0.3)] transition duration-500 hover:rotate-0 sm:rotate-2 sm:p-3 sm:pb-8 sm:hover:scale-105">
                  <div className="aspect-video w-full overflow-hidden border border-zinc-700 bg-zinc-800 sm:aspect-[4/3]">
                    <img src="/hermeswin2-optimized.jpg" alt="LazyClip.buzz team at GrowthX Buildathon" loading="lazy" decoding="async" className="w-full h-full object-cover opacity-90 hover:opacity-100 transition duration-500" />
                  </div>
                </div>

                <a href="https://lnkd.in/g-hDZPUq" target="_blank" rel="noreferrer" className="evidence-action evidence-action--x group mt-1 flex items-center justify-center gap-2 sm:mt-2">
                  <span className="text-xs text-white font-mono font-bold flex items-center gap-2"><ExternalLink className="w-4 h-4 text-white" /> VIEW X POST</span>
                </a>
                <a href="https://www.linkedin.com/posts/mdmoinakhtar_we-won-the-growthx-buildathon-%F0%9D%9F%B1%F0%9D%9F%B4%F0%9D%9F%AC%F0%9D%9F%AC-ugcPost-7482699137520513025-Rubs/?utm_source=share&amp;utm_medium=member_desktop&amp;rcm=ACoAAErQS70BROmbAnLMOHVZZb-iJMzWSNGt-lA" target="_blank" rel="noreferrer" className="evidence-action evidence-action--linkedin group mt-1 flex items-center justify-center gap-2 sm:mt-2">
                  <span className="text-xs text-white font-mono font-bold flex items-center gap-2"><ExternalLink className="w-4 h-4 text-white" /> VIEW LINKEDIN POST</span>
                </a>
              </div>
            </div>

            {/* Deploy 2 */}
            <div className="award-card award-card--featured award-card--winner relative border border-ink/20 p-3 sm:p-6">
              <span className="award-mobile-seal sm:hidden"><Medal className="h-4 w-4" /> 1st place</span>
              <Typewriter delay={0.8} className="award-kicker mb-2 block font-black text-stamp">[SUCCESS: 1ST PLACE]</Typewriter>
              <Typewriter delay={1.0} className="award-card-title text-base font-black leading-snug sm:text-lg">PROMPTWARS | INNERVE 2026 (MAR 2026)</Typewriter>
              <Typewriter delay={1.2} className="mb-3 mt-2 block text-sm leading-relaxed sm:mb-4 sm:text-base">Secured 1st Place at IGDTUW. Built <Highlight style="circle" color="red">Devcation platform</Highlight>.</Typewriter>

              <div className="award-impact-row sm:hidden" aria-label="PromptWars result">
                <span><strong>#1</strong> placement</span>
                <span><strong>IGDTUW</strong> host</span>
                <span><strong>2026</strong> season</span>
              </div>

              {/* Photo Evidence Grid */}
              <div className="award-evidence-grid mt-4 grid grid-cols-2 gap-2 border-t border-ink/10 pt-4 sm:mt-6 sm:grid-cols-2 sm:gap-6 sm:pt-6">
                <div className="award-photo mx-auto w-full max-w-sm -rotate-1 transform border border-gray-300 bg-polaroid p-2 pb-4 shadow-[2px_4px_10px_rgba(0,0,0,0.3)] transition duration-500 hover:rotate-0 sm:-rotate-2 sm:p-3 sm:pb-8 sm:hover:scale-105">
                  <div className="aspect-video w-full overflow-hidden border border-zinc-700 bg-zinc-800 sm:aspect-[4/3]">
                    <img src="https://plain-apac-prod-public.komododecks.com/202606/08/UetCU2yFfO1yPU1VnGh7/image.jpg" alt="Hackathon Win 1" className="w-full h-full object-cover opacity-90 hover:opacity-100 transition duration-500" />
                  </div>
                </div>
                <div className="award-photo mx-auto w-full max-w-sm rotate-1 transform border border-gray-300 bg-polaroid p-2 pb-4 shadow-[2px_4px_10px_rgba(0,0,0,0.3)] transition duration-500 hover:rotate-0 sm:rotate-2 sm:p-3 sm:pb-8 sm:hover:scale-105">
                  <div className="aspect-video w-full overflow-hidden border border-zinc-700 bg-zinc-800 sm:aspect-[4/3]">
                    <img src="https://plain-apac-prod-public.komododecks.com/202606/08/2zKDmOhXST56aBGDOvqi/image.jpg" alt="Hackathon Win 2" className="w-full h-full object-cover opacity-90 hover:opacity-100 transition duration-500" />
                  </div>
                </div>
                
                <a href="https://x.com/___moinn_/status/2034662071808508329?s=20" target="_blank" rel="noreferrer" className="evidence-action evidence-action--x group mt-1 flex items-center justify-center gap-2 sm:mt-2">
                   <span className="text-xs text-white font-mono font-bold flex items-center gap-2"><ExternalLink className="w-4 h-4 text-white"/> VIEW X POST</span>
                </a>
                <a href="https://www.linkedin.com/posts/mdmoinakhtar_promptengineering-promptwars-innerve2026-ugcPost-7440279761559576576-iRby/?utm_source=share&utm_medium=member_desktop&rcm=ACoAAErQS70BROmbAnLMOHVZZb-iJMzWSNGt-lA" target="_blank" rel="noreferrer" className="evidence-action evidence-action--linkedin group mt-1 flex items-center justify-center gap-2 sm:mt-2">
                   <span className="text-xs text-white font-mono font-bold flex items-center gap-2"><ExternalLink className="w-4 h-4 text-white"/> VIEW LINKEDIN POST</span>
                </a>
              </div>
            </div>

            {/* Deploy 3 & 4 Grid */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-8">
              {/* Deploy 3 */}
              <div className="award-card award-card--finalist relative flex h-full flex-col border border-ink/20 p-3 sm:p-6">
                <span className="award-mobile-seal sm:hidden"><Award className="h-4 w-4" /> Finalist</span>
                <Typewriter delay={1.5} className="award-kicker mb-2 block font-black text-stamp">[CLEARED: QUALIFIER]</Typewriter>
                <Typewriter delay={1.6} className="award-card-title text-base font-black leading-snug sm:text-lg">PARANOX 2.0 NATIONAL INNOVATION HACKATHON (NOV 2025)</Typewriter>
                <Typewriter delay={1.8} className="mb-4 mt-2 block text-sm leading-relaxed sm:text-base">Qualified in the Top 40 Teams.</Typewriter>
                
                <div className="mt-auto border-t border-ink/10 pt-4 sm:pt-6">
                  <button onClick={() => setActivePdf("/_Moin Akhtar__Certificate.pdf")} className="evidence-action evidence-action--certificate group flex w-full items-center justify-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    <span>VIEW CERTIFICATE</span>
                  </button>
                </div>
              </div>

              {/* Deploy 4 */}
              <div className="award-card award-card--participation relative flex h-full flex-col border border-ink/20 p-3 sm:p-6">
                <span className="award-mobile-seal sm:hidden"><Award className="h-4 w-4" /> Participant</span>
                <Typewriter delay={1.9} className="award-kicker mb-2 block font-black text-stamp">[CERTIFICATE OF PARTICIPATION]</Typewriter>
                <Typewriter delay={2.0} className="award-card-title text-base font-black leading-snug sm:text-lg">ALGOSQUEST 2025</Typewriter>
                <Typewriter delay={2.1} className="mb-4 mt-2 block text-sm leading-relaxed sm:text-base">Competed with <Highlight style="marker" color="yellow">Team Kaizenn</Highlight>. Recognised for active participation, exceptional tech knowledge, innovation and engagement.</Typewriter>
                
                <div className="mt-auto border-t border-ink/10 pt-4 sm:pt-6">
                  <button onClick={() => setActivePdf("/Team Kaizenn.pdf")} className="evidence-action evidence-action--certificate group flex w-full items-center justify-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    <span>VIEW CERTIFICATE</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
        
        {/* Section 2: Research */}
        <div className="award-research-section">
          <Typewriter delay={2.0} className="award-section-heading mb-4 block border-b border-ink/30 pb-2 text-base font-black uppercase leading-snug tracking-[0.08em] sm:mb-6 sm:text-xl sm:tracking-widest">
            <span className="hidden sm:inline">[02] Research & Publications</span>
            <span className="flex items-center justify-between gap-3 sm:hidden"><span className="flex items-center gap-2"><BookOpen className="h-4 w-4" /> Research</span><span className="award-section-count">01</span></span>
          </Typewriter>
          
          <div
            className="award-card award-card--research group relative mb-8 cursor-pointer border border-ink/20 p-3 transition-colors sm:mb-12 sm:p-6"
            onClick={() => setShowPubDetails(true)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                setShowPubDetails(true);
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="View research paper extract"
          >
             <span className="award-mobile-seal sm:hidden"><BookOpen className="h-4 w-4" /> Published</span>
             <div className="absolute top-0 right-0 p-2 opacity-30 text-xs font-bold">JAN 2026</div>
             
             <Typewriter delay={2.2} className="block pr-14 text-base font-black leading-snug transition-colors group-hover:text-amber-900 sm:pr-16 sm:text-lg">
               <span className="sm:hidden">SENTENCE-LEVEL HALLUCINATION RISK ESTIMATOR</span>
               <span className="hidden sm:inline">A SENTENCE-LEVEL RISK ESTIMATOR FOR IDENTIFYING HALLUCINATIONS IN GENERATIVE AI</span>
               <span className="research-extract-chip mb-1 ml-2 inline-block rounded border border-ink/30 bg-white px-1 text-[10px] align-middle pointer-events-none">VIEW EXTRACT</span>
             </Typewriter>
             
             <Typewriter delay={2.4} className="mt-2 block text-sm italic leading-relaxed opacity-80 sm:text-base">
               International Conference on AI-Driven Smart Systems and Ubiquitous Computing (ICAUC), 2026
             </Typewriter>
             
             <Typewriter delay={2.6} className="mt-4 hidden max-w-2xl text-sm opacity-80 sm:block">
               Proposed a framework detecting AI hallucinations combining semantic similarity (BERT), QA-based factuality checks, and NLI entailment.
             </Typewriter>

             <div className="research-desktop-brief hidden sm:grid" aria-label="Publication summary">
               <span><strong>IEEE Xplore</strong> Published</span>
               <span><strong>ICAUC 2026</strong> Conference</span>
               <span><strong>BERT · QA · NLI</strong> Method stack</span>
             </div>

             <div className="research-methods sm:hidden" aria-label="Research methods">
               <span>BERT</span><span>NLI</span><span>Factuality</span>
             </div>

             {/* Evidence Area */}
             <div className="mt-4 grid grid-cols-1 gap-2 border-t border-ink/10 pt-4 sm:mt-6 sm:grid-cols-3 sm:gap-4 sm:pt-6" onClick={(e) => e.stopPropagation()}>
               <a href="https://ieeexplore.ieee.org/document/11441054" target="_blank" rel="noreferrer" className="evidence-action evidence-action--ieee group flex items-center justify-center text-center">
                   <span className="text-xs text-white font-mono font-bold flex items-center gap-2"><ExternalLink className="w-4 h-4 text-white"/> IEEE XPLORE PAPER</span>
               </a>
               <a href="https://x.com/___moinn_/status/2038219385077375293?s=20" target="_blank" rel="noreferrer" className="evidence-action evidence-action--x group flex items-center justify-center text-center">
                   <span className="text-xs text-white font-mono font-bold flex items-center gap-2"><ExternalLink className="w-4 h-4 text-white"/> VIEW X POST</span>
               </a>
               <a href="https://www.linkedin.com/posts/mdmoinakhtar_ai-machinelearning-generativeai-share-7444005556559794176-z_Ot/?utm_source=share&utm_medium=member_desktop&rcm=ACoAAErQS70BROmbAnLMOHVZZb-iJMzWSNGt-lA" target="_blank" rel="noreferrer" className="evidence-action evidence-action--linkedin group flex items-center justify-center text-center">
                   <span className="text-xs text-white font-mono font-bold flex items-center gap-2"><ExternalLink className="w-4 h-4 text-white"/> VIEW LINKEDIN POST</span>
               </a>
             </div>
          </div>
        </div>

      </div>

      {/* Expanded Publication Modal */}
      {showPubDetails && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm" onClick={() => setShowPubDetails(false)}>
          <div 
            className="bg-paper p-6 sm:p-8 max-w-2xl w-full border border-ink/30 shadow-2xl relative font-mono text-ink"
            onClick={(e) => e.stopPropagation()}
            style={{ 
              backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 0 40px rgba(0,0,0,0.05)'
            }}
          >
            <button 
              onClick={() => setShowPubDetails(false)}
              className="absolute top-4 right-4 rounded p-1 opacity-60 transition-colors hover:bg-red-700 hover:text-white hover:opacity-100"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-[10px] font-bold tracking-widest text-stamp mb-4 border-b border-stamp/30 pb-2 inline-block">
              // CLASSIFIED MATERIAL - RESEARCH EXTRACT //
            </div>

            <h3 className="text-xl font-bold uppercase mb-2 leading-snug">
              A Sentence-Level Risk Estimator for Identifying Hallucinations in Generative AI
            </h3>
            
            <p className="italic opacity-80 border-l-2 border-ink/30 pl-3 mb-6">
              Presented at: International Conference on AI-Driven Smart Systems and Ubiquitous Computing (ICAUC), 2026
            </p>

            <div className="bg-ink/5 p-4 border border-ink/10 mb-6">
              <span className="text-[10px] font-bold opacity-50 uppercase tracking-wider block mb-2">Technical Abstract Outline</span>
              <ul className="space-y-4 text-sm leading-relaxed">
                <li className="flex gap-3">
                  <span className="opacity-50">01</span>
                  <span>Presented a research paper proposing a novel framework to detect hallucinations in generative AI strictly at the sentence level.</span>
                </li>
                <li className="flex gap-3">
                  <span className="opacity-50">02</span>
                  <span>Designed a unified risk scoring approach synthesizing <Highlight style="marker" color="yellow" className="whitespace-normal">semantic similarity (BERT)</Highlight>, QA-based factuality checks, and <Highlight style="circle" color="red" className="whitespace-normal">NLI entailment</Highlight>.</span>
                </li>
                <li className="flex gap-3">
                  <span className="opacity-50">03</span>
                  <span>Developed aiming to critically improve the reliability and factual consistency of large language model outputs in production environments.</span>
                </li>
              </ul>
            </div>

            <div className="flex justify-between items-end border-t border-ink/20 pt-4 mt-6">
              <div className="flex flex-col">
                <span className="text-[9px] opacity-50">AUTHORIZATION</span>
                <span className="font-bold">MD MOIN AKHTAR</span>
              </div>
              <div className="text-stamp opacity-40 transform rotate-[-5deg]">
                <ClassifiedStamp />
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* PDF Viewer Modal */}
      {activePdf && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pb-20 sm:pb-6 bg-ink/80 backdrop-blur-sm" onClick={() => setActivePdf(null)}>
          <div className="relative w-full max-w-5xl h-[85vh] bg-paper border border-ink/30 shadow-2xl flex flex-col z-10 animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center bg-ink text-paper p-3 shrink-0">
               <span className="font-mono text-xs uppercase tracking-widest font-bold">SECURE VIEWER // [ENCRYPTED DATA]</span>
               <button onClick={() => setActivePdf(null)} className="p-1 transition-colors hover:bg-red-700 hover:text-white">
                 <X className="w-5 h-5" />
               </button>
            </div>
            <div className="flex-1 w-full bg-zinc-200 relative overflow-hidden">
               <PdfViewer url={activePdf} />
            </div>
          </div>
        </div>,
        document.body
      )}
        
    </PageTransition>
  );
}

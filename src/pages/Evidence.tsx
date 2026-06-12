import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Highlight } from '../components/Highlight';
import { TopSecretStamp, ClassifiedStamp } from '../components/Stamps';
import { Typewriter } from '../components/Typewriter';
import { PageTransition } from '../components/PageTransition';
import { X, ExternalLink } from 'lucide-react';
import { PdfViewer } from '../components/PdfViewer';

export function Evidence() {
  const [showPubDetails, setShowPubDetails] = useState(false);
  const [activePdf, setActivePdf] = useState<string | null>(null);

  return (
    <PageTransition className="px-6 py-12 sm:px-20 sm:py-24 relative overflow-hidden">
      <TopSecretStamp text="ATTACHMENT B: FIELD EVIDENCE & RECORDS" />

      <div className="space-y-16 relative z-10 mt-8">
        
        {/* Section 1: Hackathons */}
        <div className="mb-8">
          <Typewriter delay={0.5} className="text-xl font-bold uppercase tracking-widest border-b border-ink/30 pb-2 mb-6 block">
            [01] Tracked Field Deployments (Hackathons)
          </Typewriter>
          
          <div className="space-y-8">
            {/* Deploy 1 */}
            <div className="border border-ink/20 bg-ink/5 p-4 sm:p-6 relative">
              <Typewriter delay={0.8} className="opacity-50 text-stamp font-bold mb-2 block">[SUCCESS: 1ST PLACE]</Typewriter>
              <Typewriter delay={1.0} className="text-lg font-bold">PROMPTWARS | INNERVE 2026 (MAR 2026)</Typewriter>
              <Typewriter delay={1.2} className="block mt-2 mb-4">Secured 1st Place at IGDTUW. Built <Highlight style="circle" color="red">Devcation platform</Highlight>.</Typewriter>

              {/* Photo Evidence Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6 border-t border-ink/10 pt-6">
                <div className="bg-polaroid p-3 pb-8 shadow-[2px_4px_10px_rgba(0,0,0,0.3)] border border-gray-300 transform -rotate-2 hover:rotate-0 hover:scale-105 transition duration-500 mx-auto max-w-sm w-full">
                  <div className="w-full aspect-[4/3] bg-zinc-800 overflow-hidden border border-zinc-700">
                    <img src="https://plain-apac-prod-public.komododecks.com/202606/08/UetCU2yFfO1yPU1VnGh7/image.jpg" alt="Hackathon Win 1" className="w-full h-full object-cover opacity-90 hover:opacity-100 transition duration-500" />
                  </div>
                </div>
                <div className="bg-polaroid p-3 pb-8 shadow-[2px_4px_10px_rgba(0,0,0,0.3)] border border-gray-300 transform rotate-2 hover:rotate-0 hover:scale-105 transition duration-500 mx-auto max-w-sm w-full">
                  <div className="w-full aspect-[4/3] bg-zinc-800 overflow-hidden border border-zinc-700">
                    <img src="https://plain-apac-prod-public.komododecks.com/202606/08/2zKDmOhXST56aBGDOvqi/image.jpg" alt="Hackathon Win 2" className="w-full h-full object-cover opacity-90 hover:opacity-100 transition duration-500" />
                  </div>
                </div>
                
                <a href="https://x.com/___moinn_/status/2034662071808508329?s=20" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 text-[10px] sm:text-xs font-mono font-bold tracking-widest bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 border border-zinc-300 dark:border-zinc-600 h-12 p-2.5 rounded shadow-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group mt-2">
                   <span className="text-xs text-zinc-800 dark:text-zinc-200 font-mono font-bold flex items-center gap-2 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors"><ExternalLink className="w-4 h-4 text-sky-600 dark:text-sky-400"/> VIEW X POST</span>
                </a>
                <a href="https://www.linkedin.com/posts/mdmoinakhtar_promptengineering-promptwars-innerve2026-ugcPost-7440279761559576576-iRby/?utm_source=share&utm_medium=member_desktop&rcm=ACoAAErQS70BROmbAnLMOHVZZb-iJMzWSNGt-lA" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 text-[10px] sm:text-xs font-mono font-bold tracking-widest bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 border border-zinc-300 dark:border-zinc-600 h-12 p-2.5 rounded shadow-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group mt-2">
                   <span className="text-xs text-zinc-800 dark:text-zinc-200 font-mono font-bold flex items-center gap-2 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors"><ExternalLink className="w-4 h-4 text-sky-600 dark:text-sky-400"/> VIEW LINKEDIN POST</span>
                </a>
              </div>
            </div>

            {/* Deploy 2 & 3 Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Deploy 2 */}
              <div className="border border-ink/20 bg-ink/5 p-4 sm:p-6 relative flex flex-col h-full">
                <Typewriter delay={1.5} className="opacity-50 mb-2 block font-bold">[CLEARED: QUALIFIER]</Typewriter>
                <Typewriter delay={1.6} className="text-lg font-bold">PARANOX 2.0 NATIONAL INNOVATION HACKATHON (NOV 2025)</Typewriter>
                <Typewriter delay={1.8} className="block mt-2 mb-4">Qualified in the Top 40 Teams.</Typewriter>
                
                <div className="mt-auto border-t border-ink/10 pt-6">
                  <button onClick={() => setActivePdf("/_Moin Akhtar__Certificate.pdf")} className="flex items-center justify-center gap-2 w-full text-[10px] sm:text-xs font-mono font-bold tracking-widest bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 border border-zinc-300 dark:border-zinc-600 h-12 p-2.5 rounded shadow-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group">
                    <ExternalLink className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    <span className="text-zinc-800 dark:text-zinc-200 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">VIEW CERTIFICATE</span>
                  </button>
                </div>
              </div>

              {/* Deploy 3 */}
              <div className="border border-ink/20 bg-ink/5 p-4 sm:p-6 relative flex flex-col h-full">
                <Typewriter delay={1.9} className="opacity-50 mb-2 block font-bold text-stamp">[CERTIFICATE OF PARTICIPATION]</Typewriter>
                <Typewriter delay={2.0} className="text-lg font-bold">ALGOSQUEST 2025</Typewriter>
                <Typewriter delay={2.1} className="block mt-2 mb-4">Competed with <Highlight style="marker" color="yellow">Team Kaizenn</Highlight>. Recognised for active participation, exceptional tech knowledge, innovation and engagement.</Typewriter>
                
                <div className="mt-auto border-t border-ink/10 pt-6">
                  <button onClick={() => setActivePdf("/Team Kaizenn.pdf")} className="flex items-center justify-center gap-2 w-full text-[10px] sm:text-xs font-mono font-bold tracking-widest bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 border border-zinc-300 dark:border-zinc-600 h-12 p-2.5 rounded shadow-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group">
                    <ExternalLink className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    <span className="text-zinc-800 dark:text-zinc-200 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">VIEW CERTIFICATE</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
        
        {/* Section 2: Research */}
        <div>
          <Typewriter delay={2.0} className="text-xl font-bold uppercase tracking-widest border-b border-ink/30 pb-2 mb-6 block">
            [02] Research & Publications
          </Typewriter>
          
          <div className="border border-ink/20 bg-ink/5 p-4 sm:p-6 relative mb-12 cursor-pointer hover:bg-ink/10 transition-colors group" onClick={() => setShowPubDetails(true)}>
             <div className="absolute top-0 right-0 p-2 opacity-30 text-xs font-bold">JAN 2026</div>
             
             <Typewriter delay={2.2} className="block font-bold text-lg group-hover:text-amber-900 transition-colors pr-16 leading-snug">
               A SENTENCE-LEVEL RISK ESTIMATOR FOR IDENTIFYING HALLUCINATIONS IN GENERATIVE AI 
               <span className="inline-block px-1 border border-ink/30 ml-2 rounded text-[10px] bg-white pointer-events-none align-middle mb-1">VIEW EXTRACT</span>
             </Typewriter>
             
             <Typewriter delay={2.4} className="block italic opacity-80 mt-2">
               International Conference on AI-Driven Smart Systems and Ubiquitous Computing (ICAUC), 2026
             </Typewriter>
             
             <Typewriter delay={2.6} className="block text-sm mt-4 opacity-80 max-w-2xl">
               Proposed a framework detecting AI hallucinations combining semantic similarity (BERT), QA-based factuality checks, and NLI entailment.
             </Typewriter>

             {/* Evidence Area */}
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 border-t border-ink/10 pt-6" onClick={(e) => e.stopPropagation()}>
               <a href="https://ieeexplore.ieee.org/document/11441054" target="_blank" rel="noreferrer" className="border border-zinc-300 dark:border-zinc-650 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 h-16 sm:h-auto flex flex-col items-center justify-center p-2.5 text-center shadow-sm transition-all rounded duration-300 hover:scale-[1.02] active:scale-[0.98] group">
                   <span className="text-xs text-zinc-800 dark:text-zinc-200 font-mono font-bold flex items-center gap-2 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors"><ExternalLink className="w-4 h-4 text-sky-600 dark:text-sky-400"/> IEEE XPLORE PAPER</span>
               </a>
               <a href="https://x.com/___moinn_/status/2038219385077375293?s=20" target="_blank" rel="noreferrer" className="border border-zinc-300 dark:border-zinc-650 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 h-16 sm:h-auto flex flex-col items-center justify-center p-2.5 text-center shadow-sm transition-all rounded duration-300 hover:scale-[1.02] active:scale-[0.98] group">
                   <span className="text-xs text-zinc-800 dark:text-zinc-200 font-mono font-bold flex items-center gap-2 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors"><ExternalLink className="w-4 h-4 text-sky-600 dark:text-sky-400"/> VIEW X POST</span>
               </a>
               <a href="https://www.linkedin.com/posts/mdmoinakhtar_ai-machinelearning-generativeai-share-7444005556559794176-z_Ot/?utm_source=share&utm_medium=member_desktop&rcm=ACoAAErQS70BROmbAnLMOHVZZb-iJMzWSNGt-lA" target="_blank" rel="noreferrer" className="border border-zinc-300 dark:border-zinc-650 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 h-16 sm:h-auto flex flex-col items-center justify-center p-2.5 text-center shadow-sm transition-all rounded duration-300 hover:scale-[1.02] active:scale-[0.98] group">
                   <span className="text-xs text-zinc-800 dark:text-zinc-200 font-mono font-bold flex items-center gap-2 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors"><ExternalLink className="w-4 h-4 text-sky-600 dark:text-sky-400"/> VIEW LINKEDIN POST</span>
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
              className="absolute top-4 right-4 p-1 hover:bg-ink/10 rounded transition-colors opacity-60 hover:opacity-100"
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
               <button onClick={() => setActivePdf(null)} className="hover:bg-paper/20 p-1 transition-colors">
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

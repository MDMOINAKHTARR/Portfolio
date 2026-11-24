import { Fragment, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { Highlight } from '../components/Highlight';
import { ClassifiedStamp } from '../components/Stamps';
import { PageTransition } from '../components/PageTransition';
import { 
  Award, BookOpen, ExternalLink, Medal, Trophy, X, ArrowRight,
  FileText, CheckCircle2, Shield
} from 'lucide-react';
import { PdfViewer } from '../components/PdfViewer';
import { StickyStack } from '../components/StickyStack';
import { Sidenotes, NoteAnchor } from '../components/Sidenotes';
import { audioEngine } from '../lib/audio';

const HEADER_STATS = [
  { label: 'Wins', value: '04', color: 'text-amber-700' },
  { label: 'Prize Pool', value: '$5,900', color: 'text-emerald-700' },
  { label: 'Events', value: '05', color: 'text-cyan-700' },
  { label: 'IEEE Paper', value: '01', color: 'text-blue-800' },
];

export function Evidence() {
  const [showPubDetails, setShowPubDetails] = useState(false);
  const [activePdf, setActivePdf] = useState<string | null>(null);

  const handleLinkClick = () => {
    audioEngine.init();
    audioEngine.playClick();
  };

  const handlePdfClick = (pdfUrl: string) => {
    audioEngine.init();
    audioEngine.playPaper();
    setActivePdf(pdfUrl);
  };

  const handleModalOpen = () => {
    audioEngine.init();
    audioEngine.playPaper();
    setShowPubDetails(true);
  };

  return (
    <PageTransition className="awards-page relative overflow-hidden px-3 py-4 sm:px-8 sm:py-6 font-mono text-ink">
      
      {/* ─────────────────────────────────────────────────────────────
          1. CERTIFICATE MASTHEAD (CENTERED)
         ───────────────────────────────────────────────────────────── */}
      <header className="mb-3 sm:mb-4 text-center text-ink">
        {/* Double rules */}
        <div className="border-t border-ink/30" />
        <div className="mt-1 border-t-2 border-ink/60" />

        {/* Tinted masthead band */}
        <div className="mt-3 rounded-[2px] border border-folder/60 bg-folder/30 px-3 py-3 sm:px-6 sm:py-4">
          {/* Eyebrow */}
          <div className="text-[9px] font-black uppercase tracking-[0.3em] text-ink/55">
            <span className="text-stamp mx-1.5">★</span>
            Record of Achievements &amp; Research
            <span className="text-stamp mx-1.5">★</span>
          </div>

          {/* Title */}
          <h1 className="mt-1.5 font-stamp font-black uppercase leading-none text-2xl sm:text-3xl md:text-4xl tracking-tight">
            Field Deployments <span className="text-ink/30">&amp;</span>{' '}
            <span className="text-stamp">Wins</span>
          </h1>

          {/* Stat line */}
          <div className="mt-2.5 flex flex-wrap items-baseline justify-center gap-x-2 gap-y-1 font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-ink/55">
            {HEADER_STATS.map((stat, i) => (
              <Fragment key={stat.label}>
                {i > 0 && <span className="text-ink/25" aria-hidden="true">·</span>}
                <span>
                  <span className={`font-stamp text-sm sm:text-base tracking-normal ${stat.color}`}>{stat.value}</span>{' '}
                  {stat.label}
                </span>
              </Fragment>
            ))}
          </div>
        </div>

        {/* Double rules */}
        <div className="mt-3 border-t-2 border-ink/60" />
        <div className="mt-1 border-t border-ink/30" />
      </header>


      {/* ─────────────────────────────────────────────────────────────
          2. FEATURED VICTORIES (EXHIBIT SHEETS + STICKY PHOTO EVIDENCE)
         ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 items-stretch">
        
        {/* ── CARD 1: HERMES X GROWTHX BUILDATHON ── */}
        <article className="relative flex flex-col rounded-[3px] border border-ink/20 bg-doc text-ink overflow-hidden shadow-[4px_4px_0_rgba(0,0,0,0.08)]">
          
          {/* Case-file header band */}
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-amber-300/70 bg-amber-100/70 px-4 py-1.5 sm:px-6">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-amber-700">
                Exhibit 01
              </span>
              <span className="hidden h-3 w-px bg-amber-400 sm:block" />
              <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-900">
                <Trophy className="h-3 w-3 fill-amber-600 text-amber-600" /> Grand Buildathon Winner
              </span>
            </div>
            <span className="font-mono text-[11px] font-bold text-ink/50">
              FEB 2026 • 8-HOUR SPRINT
            </span>
          </div>

          <div className="flex flex-1 flex-col gap-3 p-4">

            {/* Spec sheet beside sticky-note evidence */}
            <div className="flex flex-col gap-4 xl:flex-row">
              <div className="flex min-w-0 flex-1 flex-col gap-3">
                <h2 className="text-lg sm:text-xl font-black uppercase text-ink font-stamp tracking-tight leading-tight border-l-[3px] border-stamp pl-3">
                  Hermes x GrowthX Buildathon
                </h2>

                <p className="text-[13px] sm:text-sm xl:text-[15px] text-ink/80 font-sans leading-relaxed">
                  Engineered <Highlight style="circle" color="blue" className="text-ink font-mono">LazyClip.buzz</Highlight> in a single continuous 8-hour sprint—an open-source AI video editor using natural language prompt controls. Captured <Highlight style="marker" color="yellow" className="text-ink font-bold">100+ signups on launch day</Highlight>.
                </p>

                {/* Spec Strip */}
                <div className="grid grid-cols-3 divide-x divide-ink/15 border-y border-dashed border-ink/25 py-2 font-mono text-center text-xs">
                  <div className="px-1">
                    <div className="text-[9px] text-ink/55 uppercase font-bold">BUILD SPRINT</div>
                    <div className="font-black text-amber-700">8 Hours</div>
                  </div>
                  <div className="px-1">
                    <div className="text-[9px] text-ink/55 uppercase font-bold">LAUNCH TRACTION</div>
                    <div className="font-black text-emerald-700">100+ Signups</div>
                  </div>
                  <div className="px-1">
                    <div className="text-[9px] text-ink/55 uppercase font-bold">WINNER AWARD</div>
                    <div className="font-black text-amber-700">$5.8k Credits</div>
                  </div>
                </div>
              </div>

              <div className="flex w-[150px] shrink-0 flex-col justify-center self-center xl:self-stretch">
                <StickyStack
                  className="w-full"
                  notes={[
                    {
                      id: 'hermes-crew',
                      src: '/hermeswin2-optimized.jpg',
                      alt: 'LazyClip team',
                      caption: 'The LazyClip crew',
                      paper: 'pink',
                      tilt: 2,
                    },
                    {
                      id: 'hermes-win',
                      src: '/hermeswin1.jpeg',
                      alt: 'GrowthX Buildathon win',
                      caption: 'Winner announcement!',
                      paper: 'canary',
                      tilt: -2.5,
                    },
                  ]}
                />
                <p className="mt-4 text-center font-mono text-[8px] font-bold uppercase tracking-[0.15em] text-ink/45">
                  tap to shuffle the stack
                </p>
              </div>
            </div>

            {/* Tech chips + action buttons */}
            <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
              <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
                {['OpenCode', 'OpenAI', 'ElevenLabs', 'Linkup', 'Dodo Payments', 'Wispr Flow', 'Cloudflare'].map((tech) => (
                  <span key={tech} className="border border-ink/20 bg-ink/5 text-ink/70 px-2 py-0.5 rounded-[1px]">
                    {tech}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 font-mono text-xs">
                <a 
                  href="https://lnkd.in/g-hDZPUq" 
                  target="_blank" 
                  rel="noreferrer" 
                  onClick={handleLinkClick}
                  className="flex items-center gap-1.5 bg-ink text-paper hover:bg-stamp px-3 py-1.5 rounded-[2px] font-bold transition-all shadow-xs"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>X DISPATCH</span>
                </a>
                <a 
                  href="https://www.linkedin.com/posts/mdmoinakhtar_we-won-the-growthx-buildathon-%F0%9D%9F%B1%F0%9D%9F%B4%F0%9D%9F%AC%F0%9D%9F%AC-ugcPost-7482699137520513025-Rubs/" 
                  target="_blank" 
                  rel="noreferrer" 
                  onClick={handleLinkClick}
                  className="flex items-center gap-1.5 bg-[#0077b5] text-white hover:bg-[#005885] px-3 py-1.5 rounded-[2px] font-bold transition-all shadow-xs"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>LINKEDIN WIRE</span>
                </a>
              </div>
            </div>
          </div>
        </article>


        {/* ── CARD 2: PROMPTWARS 2026 WIN ── */}
        <article className="relative flex flex-col rounded-[3px] border border-ink/20 bg-doc text-ink overflow-hidden shadow-[4px_4px_0_rgba(0,0,0,0.08)]">
          
          {/* Case-file header band */}
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-emerald-300/70 bg-emerald-100/70 px-4 py-1.5 sm:px-6">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-emerald-700">
                Exhibit 02
              </span>
              <span className="hidden h-3 w-px bg-emerald-400 sm:block" />
              <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-900">
                <Medal className="h-3 w-3 fill-emerald-600 text-emerald-600" /> 1st Place Champion
              </span>
              <span className="font-mono text-[11px] font-bold text-emerald-700">
                INNERVE 2026 @ IGDTUW
              </span>
            </div>
            <span className="font-mono text-[11px] font-bold text-ink/50">
              MARCH 2026
            </span>
          </div>

          <div className="flex flex-1 flex-col gap-3 p-4">

            {/* Spec sheet beside sticky-note evidence */}
            <div className="flex flex-col gap-4 xl:flex-row">
              <div className="flex min-w-0 flex-1 flex-col gap-3">
                <h2 className="text-lg sm:text-xl font-black uppercase text-ink font-stamp tracking-tight leading-tight border-l-[3px] border-stamp pl-3">
                  PromptWars | Innerve 2026
                </h2>

                <p className="text-[13px] sm:text-sm xl:text-[15px] text-ink/80 font-sans leading-relaxed">
                  Claimed 1st Place out of national entries by building <Highlight style="circle" color="red" className="text-ink font-mono">Devcation</Highlight>—an interactive developer suite designed for rapid prompt chaining, live code evaluation, and micro-interaction speed.
                </p>

                {/* Spec Strip */}
                <div className="grid grid-cols-3 divide-x divide-ink/15 border-y border-dashed border-ink/25 py-2 font-mono text-center text-xs">
                  <div className="px-1">
                    <div className="text-[9px] text-ink/55 uppercase font-bold">PLACEMENT</div>
                    <div className="font-black text-emerald-700">1st Place</div>
                  </div>
                  <div className="px-1">
                    <div className="text-[9px] text-ink/55 uppercase font-bold">HOST CAMPUS</div>
                    <div className="font-black text-ink">IGDTUW</div>
                  </div>
                  <div className="px-1">
                    <div className="text-[9px] text-ink/55 uppercase font-bold">CORE PLATFORM</div>
                    <div className="font-black text-rose-600">Devcation</div>
                  </div>
                </div>
              </div>

              <div className="flex w-[150px] shrink-0 flex-col justify-center self-center xl:self-stretch">
                <StickyStack
                  className="w-full"
                  notes={[
                    {
                      id: 'promptwars-trophy',
                      src: 'https://plain-apac-prod-public.komododecks.com/202606/08/2zKDmOhXST56aBGDOvqi/image.jpg',
                      alt: 'PromptWars award',
                      caption: 'Winner trophy',
                      paper: 'sky',
                      tilt: -2,
                    },
                    {
                      id: 'promptwars-stage',
                      src: 'https://plain-apac-prod-public.komododecks.com/202606/08/UetCU2yFfO1yPU1VnGh7/image.jpg',
                      alt: 'PromptWars win stage',
                      caption: 'Stage presentation',
                      paper: 'mint',
                      tilt: 2,
                    },
                  ]}
                />
                <p className="mt-4 text-center font-mono text-[8px] font-bold uppercase tracking-[0.15em] text-ink/45">
                  tap to shuffle the stack
                </p>
              </div>
            </div>

            {/* Feature chips + action buttons */}
            <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
              <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
                {['Prompt Chaining', 'Live Code Eval', 'Micro-Interactions'].map((tag) => (
                  <span key={tag} className="border border-ink/20 bg-ink/5 text-ink/70 px-2 py-0.5 rounded-[1px]">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 font-mono text-xs">
                <a 
                  href="https://x.com/Moincrafted/status/2034662071808508329?s=20" 
                  target="_blank" 
                  rel="noreferrer" 
                  onClick={handleLinkClick}
                  className="flex items-center gap-1.5 bg-ink text-paper hover:bg-stamp px-3 py-1.5 rounded-[2px] font-bold transition-all shadow-xs"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>X ANNOUNCEMENT</span>
                </a>
                <a 
                  href="https://www.linkedin.com/posts/mdmoinakhtar_promptengineering-promptwars-innerve2026-ugcPost-7440279761559576576-iRby/?utm_source=share&utm_medium=member_desktop&rcm=ACoAAErQS70BROmbAnLMOHVZZb-iJMzWSNGt-lA" 
                  target="_blank" 
                  rel="noreferrer" 
                  onClick={handleLinkClick}
                  className="flex items-center gap-1.5 bg-[#0077b5] text-white hover:bg-[#005885] px-3 py-1.5 rounded-[2px] font-bold transition-all shadow-xs"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>LINKEDIN DISPATCH</span>
                </a>
              </div>
            </div>
          </div>
        </article>

      </div>


      {/* ─────────────────────────────────────────────────────────────
          3. ACADEMIC & PEER-REVIEWED RESEARCH DOSSIER
         ───────────────────────────────────────────────────────────── */}
      <section className="mb-8">
        <article className="relative rounded-[3px] border-2 border-blue-950/60 bg-doc text-ink p-5 sm:p-7 shadow-[5px_5px_0px_rgba(0,0,0,0.25)]">

          <div className="flex flex-wrap items-center justify-between border-b border-blue-950/20 pb-3 mb-4 gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-blue-900 text-white font-black px-2.5 py-0.5 text-[10px] uppercase tracking-wider rounded-[1px] flex items-center gap-1 shadow-xs">
                <BookOpen className="h-3 w-3" /> PEER-REVIEWED IEEE PAPER
              </span>
              <span className="text-[11px] font-bold text-blue-900 font-mono">
                ICAUC 2026 CONFERENCE
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-blue-900">
              JANUARY 2026
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-3">
              <h2
                onClick={handleModalOpen}
                className="text-xl sm:text-2xl font-black uppercase text-ink hover:text-stamp font-stamp tracking-tight leading-tight cursor-pointer transition-colors"
              >
                A Sentence-Level Risk Estimator for Identifying Hallucinations in Generative AI
              </h2>

              <p className="text-xs sm:text-sm text-ink/70 italic border-l-2 border-blue-900/70 pl-3">
                International Conference on AI-Driven Smart Systems and Ubiquitous Computing (ICAUC 2026)
              </p>

              <p className="text-xs sm:text-sm text-ink/80 font-sans leading-relaxed">
                Architected a sentence-level risk scoring framework to detect AI hallucinations combining semantic similarity (BERT), QA-based factuality checks, and NLI entailment scoring.
              </p>

              <div className="flex flex-wrap gap-1.5 pt-1 text-[10px] font-mono">
                <span className="bg-blue-900/10 border border-blue-900/30 text-blue-950 px-2 py-0.5 rounded-[1px]">
                  BERT Semantic Similarity
                </span>
                <span className="bg-blue-900/10 border border-blue-900/30 text-blue-950 px-2 py-0.5 rounded-[1px]">
                  QA Factuality Verification
                </span>
                <span className="bg-blue-900/10 border border-blue-900/30 text-blue-950 px-2 py-0.5 rounded-[1px]">
                  NLI Entailment Scoring
                </span>
              </div>
            </div>

            <div className="lg:col-span-4 bg-blue-900/[0.05] border border-blue-900/25 p-4 rounded-[2px] text-center space-y-2.5 font-mono text-xs">
              <button
                onClick={handleModalOpen}
                className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold p-2.5 rounded-[2px] transition-colors shadow-xs"
              >
                READ ABSTRACT EXTRACT &rarr;
              </button>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href="https://ieeexplore.ieee.org/document/11441054"
                  target="_blank"
                  rel="noreferrer"
                  onClick={handleLinkClick}
                  className="border border-blue-900/40 bg-white/60 hover:bg-blue-900/10 text-blue-950 p-2 text-center rounded-[2px] font-bold transition-colors"
                >
                  IEEE XPLORE
                </a>
                <a
                  href="https://x.com/Moincrafted/status/2038219385077375293?s=20"
                  target="_blank"
                  rel="noreferrer"
                  onClick={handleLinkClick}
                  className="border border-blue-900/40 bg-white/60 hover:bg-blue-900/10 text-blue-950 p-2 text-center rounded-[2px] font-bold transition-colors"
                >
                  X POST
                </a>
              </div>
            </div>
          </div>
        </article>
      </section>


      {/* ─────────────────────────────────────────────────────────────
          4. NATIONAL RECORDS BLUEPRINT GRID
         ───────────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Syndicate by Maximor */}
        <div className="rounded-[3px] border border-ink/40 bg-paper p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between border-b border-ink/20 pb-2 mb-3 text-[10px] font-bold uppercase">
              <span className="bg-emerald-700 text-white px-2 py-0.5">$100 GPU Credits</span>
              <span className="text-ink/60">MAXIMOR</span>
            </div>
            <h3 className="font-stamp text-lg font-black uppercase text-ink mb-1.5">
              Syndicate by Maximor
            </h3>
            <p className="text-xs font-sans text-ink/80 leading-relaxed mb-4">
              Won the Syndicate hackathon hosted by Maximor, earning $100 in GPU compute credits for rapid AI engineering.
            </p>
          </div>

          <Link
            to="/evidence-wall"
            onClick={handleLinkClick}
            className="w-full flex items-center justify-center gap-2 rounded-[2px] border border-ink bg-ink text-paper hover:bg-stamp p-2.5 text-xs font-bold transition-colors"
          >
            <Trophy className="h-3.5 w-3.5" />
            <span>VIEW AWARD RECORD</span>
          </Link>
        </div>

        {/* Paranox 2.0 */}
        <div className="rounded-[3px] border border-ink/40 bg-paper p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between border-b border-ink/20 pb-2 mb-3 text-[10px] font-bold uppercase">
              <span className="bg-blue-800 text-white px-2 py-0.5">Top 10 National Finalist</span>
              <span className="text-ink/60">NOV 2025</span>
            </div>
            <h3 className="font-stamp text-lg font-black uppercase text-ink mb-1.5">
              Paranox 2.0 National Hackathon
            </h3>
            <p className="text-xs font-sans text-ink/80 leading-relaxed mb-4">
              Qualified in the Top 10 Teams nationally for rapid software innovation and technical execution.
            </p>
          </div>

          <button
            onClick={() => handlePdfClick("/_Moin%20Akhtar__Certificate.pdf")}
            className="w-full flex items-center justify-center gap-2 rounded-[2px] border border-ink bg-ink text-paper hover:bg-stamp p-2.5 text-xs font-bold transition-colors"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>INSPECT CERTIFICATE (PDF)</span>
          </button>
        </div>

        {/* AlgosQuest 2025 */}
        <div className="rounded-[3px] border border-ink/40 bg-paper p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between border-b border-ink/20 pb-2 mb-3 text-[10px] font-bold uppercase">
              <span className="bg-amber-800 text-white px-2 py-0.5">Team Kaizenn</span>
              <span className="text-ink/60">2025 SEASON</span>
            </div>
            <h3 className="font-stamp text-lg font-black uppercase text-ink mb-1.5">
              AlgosQuest 2025 Competition
            </h3>
            <p className="text-xs font-sans text-ink/80 leading-relaxed mb-4">
              Competed with Team Kaizenn. Recognized for exceptional technical engagement and algorithmic problem solving.
            </p>
          </div>

          <button
            onClick={() => handlePdfClick("/Team%20Kaizenn.pdf")}
            className="w-full flex items-center justify-center gap-2 rounded-[2px] border border-ink bg-ink text-paper hover:bg-stamp p-2.5 text-xs font-bold transition-colors"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>INSPECT CERTIFICATE (PDF)</span>
          </button>
        </div>

      </section>


      {/* ─────────────────────────────────────────────────────────────
          5. CORKBOARD TEASER (EVIDENCE WALL CTA)
         ───────────────────────────────────────────────────────────── */}
      <section className="mt-6 sm:mt-8">
        <Link
          to="/evidence-wall"
          onClick={handleLinkClick}
          className="group relative block rounded-[3px] border-2 border-amber-950/80 bg-[#88624a] p-4 sm:p-6 shadow-[5px_5px_0px_rgba(0,0,0,0.25)] overflow-hidden transition-transform hover:-translate-y-0.5"
        >
          {/* Pushpins */}
          <span className="absolute top-3 left-3 w-3.5 h-3.5 rounded-full bg-rose-600 border border-rose-900 shadow-[inset_-1px_-1px_2px_rgba(0,0,0,0.45)]" />
          <span className="absolute bottom-3 right-3 w-3.5 h-3.5 rounded-full bg-cyan-500 border border-cyan-800 shadow-[inset_-1px_-1px_2px_rgba(0,0,0,0.45)]" />

          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            {/* Tilted mini polaroids */}
            <div className="relative shrink-0 h-[92px] w-[140px]">
              <div className="absolute left-0 top-2 -rotate-6 bg-white p-1 pb-3 shadow-md transition-transform group-hover:-rotate-[8deg]">
                <img src="/hermeswin1.jpeg" alt="" loading="lazy" className="h-[46px] w-[74px] object-cover" />
                <div className="mt-0.5 text-center font-mono text-[7px] font-bold text-stone-600">HERMES WIN</div>
              </div>
              <div className="absolute right-0 top-4 rotate-[5deg] bg-white p-1 pb-3 shadow-md transition-transform group-hover:rotate-[8deg]">
                <img src="/hermeswin2-optimized.jpg" alt="" loading="lazy" className="h-[46px] w-[74px] object-cover" />
                <div className="mt-0.5 text-center font-mono text-[7px] font-bold text-stone-600">THE CREW</div>
              </div>
              <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-amber-400 border border-amber-700 shadow-[inset_-1px_-1px_2px_rgba(0,0,0,0.45)]" />
            </div>

            {/* Copy */}
            <div className="flex-1 text-center sm:text-left">
              <div className="mb-1 font-mono text-[9px] font-black uppercase tracking-[0.25em] text-amber-200/90">
                Pinned &amp; waiting // Evidence Wall
              </div>
              <h2 className="font-stamp text-lg sm:text-2xl uppercase leading-tight text-[#fdfaf2]">
                The 2D Corkboard Exhibit
              </h2>
              <p className="mt-1 max-w-md font-mono text-[11px] leading-relaxed text-amber-50/85">
                Awards, certificates &amp; builds pinned to a draggable corkboard — 11 verified records you can flip through and inspect.
              </p>
            </div>

            {/* CTA */}
            <span className="inline-flex shrink-0 items-center gap-2 rounded-[2px] border border-amber-950/60 bg-[#fbbf24] px-4 py-2.5 font-mono text-xs font-black uppercase tracking-wider text-stone-950 shadow-[2px_2px_0_rgba(0,0,0,0.35)] transition-all group-hover:-translate-y-0.5 group-hover:shadow-[3px_3px_0_rgba(0,0,0,0.4)]">
              Open the Corkboard
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </Link>
      </section>


      {/* ─────────────────────────────────────────────────────────────
          6. MODALS (RESEARCH ABSTRACT & PDF VIEWER)
         ───────────────────────────────────────────────────────────── */}
      {showPubDetails && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink/70 backdrop-blur-sm" onClick={() => setShowPubDetails(false)}>
          <div 
            className="bg-paper p-6 sm:p-8 max-w-4xl max-h-[90vh] overflow-y-auto w-full border border-ink shadow-2xl relative font-mono text-ink animate-in fade-in zoom-in duration-200"
            data-lenis-prevent
            onClick={(e) => e.stopPropagation()}
            style={{ 
              backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")',
            }}
          >
            <button 
              onClick={() => setShowPubDetails(false)}
              className="absolute top-4 right-4 rounded p-1 opacity-60 transition-colors hover:bg-red-700 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="border-t-4 border-double border-ink" />

            <div className="grid grid-cols-3 items-center gap-2 border-b border-ink/60 pb-1.5 pt-1.5 font-typewriter text-[9px] font-bold uppercase tracking-[0.14em] text-ink/70">
              <span>ICAUC 2026 Conference</span>
              <span className="text-center">DOC #11441054</span>
              <span className="text-right">January 2026</span>
            </div>

            <p className="mt-2.5 text-center font-typewriter text-[10px] font-bold uppercase tracking-[0.26em] text-blue-900">
              Peer-Reviewed IEEE Paper
            </p>

            <h3 className="mt-1.5 text-center font-stamp text-[20px] uppercase leading-[1.1] tracking-tight text-ink sm:text-[25px]">
              A Sentence-Level Risk Estimator for Identifying Hallucinations in Generative AI
            </h3>

            <div className="mt-2.5 flex items-center justify-center gap-2.5 font-typewriter text-[10px] text-ink/70">
              <span className="h-px w-6 bg-ink/40" />
              <span className="font-bold uppercase tracking-[0.16em] text-ink">
                MD Moin Akhtar
                <sup className="text-[8px]">1</sup>
              </span>
              <span className="h-px w-6 bg-ink/40" />
            </div>
            <p className="mt-1 text-center font-typewriter text-[10px] italic text-ink/60">
              1 Vivekananda Institute of Professional Studies (VIPS-TC), New Delhi, India
            </p>

            <p className="mt-2 text-center font-typewriter text-[9px] italic tracking-wide text-ink/50">
              Hover or tap the marked passages to pull the margins
            </p>

            <div className="mt-3.5 flex items-center gap-2.5">
              <span className="h-px flex-1 bg-ink/50" />
              <span className="font-stamp text-[11px] uppercase tracking-[0.35em] text-ink">Key Findings</span>
              <span className="h-px flex-1 bg-ink/50" />
            </div>

            <Sidenotes
              className="mt-4"
              segments={[
                {
                  paragraphs: [
                    {
                      id: 'n1',
                      className:
                        'text-justify hyphens-auto first-letter:float-left first-letter:mr-2.5 first-letter:mt-1.5 first-letter:font-stamp first-letter:text-[40px] first-letter:leading-[0.8] first-letter:text-blue-900',
                      text: (
                        <>
                          Hallucinations rarely arrive as pure fiction — they hide inside otherwise fluent answers. The central finding of this work is that verdicts belong to sentences, not documents: the{' '}
                          <NoteAnchor id="n1" n={1}>
                            sentence-level risk estimator
                          </NoteAnchor>{' '}
                          scores each sentence independently and pinpoints the exact clause that broke from the source, where a document-level check can pass while a single fabricated quote, date, or name slips through.
                        </>
                      ),
                      note: {
                        title: 'Failure Mode',
                        body: 'A document-level score can pass while one sentence invents a quote, a date, or a name. Scoring sentence by sentence pins the blame on the exact clause.',
                      },
                    },
                    {
                      id: 'n2',
                      className: 'text-justify hyphens-auto',
                      text: (
                        <>
                          Each signal covers a different blind spot: BERT-based semantic similarity checks meaning against the reference, QA-based factuality checks whether the claim can be answered from the source, and NLI entailment checks whether the reference actually supports it. The second finding is that fusion is what makes the verdict trustworthy — the three signals are{' '}
                          <NoteAnchor id="n2" n={2}>
                            fused into one risk score
                          </NoteAnchor>{' '}
                          that only clears a sentence when the combined risk drops below the threshold.
                        </>
                      ),
                      note: {
                        title: 'How It Decides',
                        body: 'Three checks vote per sentence: meaning match (BERT), answerability (QA), and textual support (NLI). A sentence only clears when the combined risk drops below the threshold.',
                      },
                    },
                    {
                      id: 'n3',
                      className: 'text-justify hyphens-auto',
                      text: (
                        <>
                          On the CNN/DailyMail and XSum benchmarks, the estimator reaches precision 0.85, recall 0.75, and F1 0.80 — the headline result being a{' '}
                          <NoteAnchor id="n3" n={3}>
                            22% higher catch-rate
                          </NoteAnchor>{' '}
                          for hallucinated sentences than document-level baselines under the same threshold.
                        </>
                      ),
                      note: {
                        title: 'Benchmarks',
                        body: 'CNN/DailyMail (news summarization) and XSum (extreme short summaries). Precision 0.85, recall 0.75, F1 0.80 against human-annotated hallucination labels.',
                      },
                    },
                  ],
                },
              ]}
            />

            <div className="mt-5 flex items-end justify-between gap-4 border-t-2 border-double border-ink/70 pt-2.5">
              <div>
                <span className="block font-typewriter text-[8px] font-bold uppercase tracking-[0.3em] text-ink/50">
                  Author
                </span>
                <span className="font-stamp text-[13px] uppercase tracking-wide text-ink">MD MOIN AKHTAR</span>
              </div>
              <div className="rotate-[-6deg] text-stamp opacity-40">
                <ClassifiedStamp />
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {activePdf && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pb-20 sm:pb-6 bg-ink/80 backdrop-blur-sm" onClick={() => setActivePdf(null)}>
          <div className="relative w-full max-w-5xl h-[85vh] bg-paper border border-ink shadow-2xl flex flex-col z-10 animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center bg-ink text-paper p-3 shrink-0">
               <span className="font-mono text-xs uppercase tracking-widest font-bold">SECURE VIEWER // CERTIFICATE</span>
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

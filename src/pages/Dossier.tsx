import { Link } from 'react-router-dom';
import { Highlight } from '../components/Highlight';
import { TopSecretStamp } from '../components/Stamps';
import { Typewriter } from '../components/Typewriter';
import { PageTransition } from '../components/PageTransition';
import { Lettering } from '../components/ui/lettering';
import { useState, useEffect, useCallback, lazy, Suspense, type SyntheticEvent } from 'react';
import { Fingerprint, Search, Activity, ExternalLink, Github, Briefcase, BookOpen, Trophy, Code, Linkedin, Sparkles, ArrowRight, BookOpenCheck, FileText, Mail } from 'lucide-react';
import { FaXTwitter } from 'react-icons/fa6';
import { useTheme } from '../context/ThemeContext';
import { DeferredSection } from '../components/DeferredSection';
import { audioEngine } from '../lib/audio';
import { PROJECTS, type Project } from '../data/projectsData';

const AnalyticsWidget = lazy(() => import('../components/AnalyticsWidget').then((m) => ({ default: m.AnalyticsWidget })));
const ActivityHeatmaps = lazy(() => import('../components/ActivityHeatmaps').then((m) => ({ default: m.ActivityHeatmaps })));
const CertificatesSection = lazy(() => import('../components/CertificatesSection').then((m) => ({ default: m.CertificatesSection })));
const ProjectScrollStack = lazy(() => import('../components/ProjectScrollStack').then((m) => ({ default: m.ProjectScrollStack })));
const ProjectCaseModal = lazy(() => import('../components/ProjectCaseModal').then((m) => ({ default: m.ProjectCaseModal })));
const SkillsCarousel = lazy(() => import('../components/SkillsCarousel').then((m) => ({ default: m.SkillsCarousel })));
import { ContactPill } from '../components/ContactPill';
import { musicEngine, type MusicVisual } from '../lib/music';
import { getEffectiveVideoSrc, tryVideoFallback } from '../lib/media';
import { HoverPreviewLink } from '../components/HoverPreviewLink';
import { FocusParagraph } from '../components/FocusParagraph';

const SPIDER_NOIR_GIF = 'https://media1.tenor.com/m/T4YtiVsOLu4AAAAC/spider-noir-nicolas-cage.gif';
const lensGrad = 'radial-gradient(circle closest-side, black 0%, rgba(0,0,0,0.9) 32%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.15) 82%, transparent 100%)';

// Mobile stack shows only these four, in this order — keeps the scroll list light.
const DECK_PROJECT_IDS = ['OP-001', 'OP-410', 'OP-109', 'OP-081'];
const DECK_PROJECTS: Project[] = DECK_PROJECT_IDS
  .map((id) => PROJECTS.find((project) => project.id === id))
  .filter((project): project is Project => Boolean(project));

function RecTimestamp() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const pad = (n: number) => String(n).padStart(2, '0');
    const resolvedTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const tzLabel =
      resolvedTz === 'Asia/Kolkata' || resolvedTz === 'Asia/Calcutta'
        ? 'IST'
        : Intl.DateTimeFormat(undefined, { timeZoneName: 'short' })
          .formatToParts(new Date())
          .find((p) => p.type === 'timeZoneName')?.value ?? 'LOCAL';

    const updateTime = () => {
      const now = new Date();
      const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
      const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
      setTime(`${dateStr} ${timeStr} ${tzLabel}`);
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
  const [isPhotoFlipped, setIsPhotoFlipped] = useState(false);
  const [lensPos, setLensPos] = useState<{ x: number; y: number; active: boolean }>({ x: 137, y: 152, active: false });
  const revealPortrait = useCallback(() => setIsPortraitRevealed(true), []);

  const handleCardSequenceClick = useCallback(() => {
    audioEngine.init();
    audioEngine.playPaper();
    setIsPhotoFlipped((prev) => !prev);
  }, []);

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

  const [activeProject, setActiveProject] = useState<Project | null>(null);

  const handleOpenProject = useCallback((project: Project) => setActiveProject(project), []);

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
              <div aria-hidden="true" className="absolute bottom-1 w-full text-center left-0 font-typewriter text-[9px] text-ink/70 tracking-widest mt-1">
                TARGET // LOCKED
              </div>
            </div>
          </div>

          {/* Profile Summary */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center gap-1 mb-1">
              <span className="w-2.5 h-2.5 bg-yellow-400 rounded-full shrink-0" />
              <h2 className="text-xs font-bold tracking-[0.1em] font-mono leading-none pt-[1px]">PROFILE SUMMARY</h2>
            </div>

            <div className="border-t border-ink/10 pt-1.5 flex flex-col gap-2 text-xs">
              <div>
                <div className="opacity-65 font-bold tracking-widest text-[10px] mb-0.5">NAME:</div>
                <Lettering
                  as="div"
                  size="sm"
                  tone="marker"
                  wobble={0.3}
                  seed="moin-name-mobile"
                  style={{ ['--ll-marker' as string]: '#fba368', ['--ll-riso' as string]: '#fba368' }}
                  className="font-bold whitespace-nowrap text-base sm:text-lg tracking-tight uppercase leading-tight text-ink inline-block font-script"
                >
                  MD MOIN AKHTAR
                </Lettering>
              </div>

              <div>
                <div className="opacity-65 font-bold tracking-widest text-[10px] mb-0.5">ROLE:</div>
                <div className="bg-hl-blue-bg border border-hl-blue-border px-2 py-1 rounded inline-block shadow-sm w-full">
                  <div className="font-bold tracking-wider leading-tight text-[11px] uppercase">
                    SOFTWARE DEVELOPER
                  </div>
                </div>
              </div>

              <div>
                <div className="opacity-65 font-bold tracking-widest text-[10px] mb-0.5">AFFILIATION:</div>
                <div className="bg-hl-pink-bg border border-hl-pink-border px-2 py-1 rounded inline-block shadow-sm w-full">
                  <div className="font-bold tracking-wider leading-tight text-[10.5px] uppercase">
                    VIPS-TC (B.TECH AI &amp; DATA<br />SCIENCE, CGPA: 8.27)
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                <a
                  href="/MdMoinAkhtar_Resume.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => audioEngine.playClick()}
                  className="inline-flex items-center gap-1 bg-stamp text-white font-mono text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-xs border border-ink/30 shadow-xs"
                >
                  <FileText className="w-3 h-3" />
                  <span>RESUME.PDF</span>
                </a>
                <a
                  href="mailto:mohdmoinakhtar081@gmail.com"
                  onClick={() => audioEngine.playClick()}
                  className="inline-flex items-center gap-1 bg-paper text-ink font-mono text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-xs border border-ink/40 shadow-xs"
                >
                  <Mail className="w-3 h-3" />
                  <span>EMAIL ME</span>
                </a>
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
                <Suspense fallback={null}>
                  <SkillsCarousel />
                </Suspense>
              </div>
              <p className="text-xs font-mono italic opacity-80 leading-relaxed max-w-[90%] mb-8">
                <span className="bg-hl-pink-bg border border-hl-pink-border px-2 py-0.5 rounded-full not-italic text-[10px] tracking-wider shadow-sm mr-1">ARCHITECTING</span> complex AI-integration for deployment ready modules.
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
                      href="https://x.com/Moincrafted"
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
                            <p className="text-paper/70 font-mono text-[9px] sm:text-[11px] tracking-widest mt-0.5 font-bold">@Moincrafted</p>
                          </div>
                        </div>
                      </div>
                    </a>
                  </div>
                </div>
              </div>

              {/* Interactive Contribution Matrices */}
              <div className="flex flex-col gap-6 mb-8">
                <DeferredSection minHeight={340}>
                  <ActivityHeatmaps />
                </DeferredSection>
              </div>

              <DeferredSection minHeight={260}>
                <CertificatesSection />
              </DeferredSection>
            </div>

            <div className="flex items-center gap-3 mb-3 mt-8 border-b-2 border-red-900/20 pb-3">
              <div className="bg-red-900/10 p-2 rounded-lg border border-red-900/20 shadow-sm">
                <Briefcase className="w-5 h-5 text-red-900" />
              </div>
              <h2 className="text-lg font-black tracking-[0.15em] font-mono leading-none pt-[2px] text-red-900 dark:text-red-500 uppercase drop-shadow-sm">
                PROJECTS
              </h2>
            </div>

            {/* Project scroll stack */}
            {isMobileViewport ? (
              <DeferredSection minHeight={420}>
                <ProjectScrollStack projects={DECK_PROJECTS} onOpen={handleOpenProject} />
              </DeferredSection>
            ) : null}

            {activeProject ? (
              <Suspense fallback={null}>
                <ProjectCaseModal project={activeProject} onClose={() => setActiveProject(null)} />
              </Suspense>
            ) : null}

            <div className="border-b border-ink/15 mx-[-20px] my-4" />

            <div className="flex items-center gap-3 mb-6 mt-6 border-b-2 border-blue-950/20 pb-4">
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
                      International Conference on AI-Driven Smart Systems and Ubiquitous Computing (ICAUC), 2026
                    </Typewriter>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 pt-3 border-t border-blue-950/10 dark:border-blue-500/10">
                  <HoverPreviewLink
                    href="https://ieeexplore.ieee.org/document/11441054"
                    title="IEEE Xplore // Hallucination Risk Estimator"
                    domain="ieeexplore.ieee.org"
                    imageUrl="/moin cover.png"
                    className="evidence-action evidence-action--ieee flex items-center justify-center gap-2 no-underline"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> IEEE XPLORE PAPER
                  </HoverPreviewLink>
                  <HoverPreviewLink
                    href="https://x.com/Moincrafted/status/2038219385077375293?s=20"
                    title="Research Release Thread // X"
                    domain="x.com"
                    imageUrl="/twitter banner.jpg"
                    className="evidence-action evidence-action--x flex items-center justify-center gap-2 no-underline"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> VIEW X POST
                  </HoverPreviewLink>
                  <HoverPreviewLink
                    href="https://www.linkedin.com/posts/mdmoinakhtar_ai-machinelearning-generativeai-share-7444005556559794176-z_Ot/?utm_source=share&utm_medium=member_desktop&rcm=ACoAAErQS70BROmbAnLMOHVZZb-iJMzWSNGt-lA"
                    title="Publication Dispatch // LinkedIn"
                    domain="linkedin.com"
                    imageUrl="/linkedin banner.jpg"
                    className="evidence-action evidence-action--linkedin flex items-center justify-center gap-2 no-underline"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> LINKEDIN POST
                  </HoverPreviewLink>
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
                        Top 10 Finalist
                      </span>
                    </div>
                    <div className="text-[10px] font-mono opacity-60 font-bold whitespace-nowrap sm:self-center">
                      NOV 2025
                    </div>
                  </div>
                  <p className="text-[12px] font-mono opacity-80 leading-relaxed">
                    National Level Innovation Hackathon — Qualified in the Top 10 national finalists (out of 200+ teams nationwide) for intelligent automation tracking platforms.
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
          </section>

          <div className="border-b border-ink/5 mx-[-20px] mb-2" />

          <section>
            <DeferredSection minHeight={220}>
              <AnalyticsWidget />
            </DeferredSection>
          </section>

          <section className="mt-8 border-t border-ink/10 pt-8 pb-20 sm:pb-4">
            <div className="flex flex-col items-center text-center space-y-4 max-w-sm mx-auto px-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-ink text-paper rounded text-[10px] sm:text-xs font-mono tracking-widest font-bold shadow-sm">
                AI Messaging Hub <span className="text-emerald-400">指</span>
              </span>
              <h2 className="text-3xl font-black tracking-tight text-ink font-sans">
                No Artificial Vibes
              </h2>
              <FocusParagraph
                sentences={[
                  "Got something to say?",
                  "Drop your message below, and let's talk artificial intelligence, machine learning, and all things data.",
                  "No spam, just straight-up analytical vibes.",
                  <span>
                    Slide into my DMs on{" "}
                    <HoverPreviewLink
                      href="https://x.com/Moincrafted"
                      title="Moin Akhtar // @Moincrafted"
                      domain="x.com"
                      imageUrl="/twitter banner.jpg"
                    >
                      X/Twitter
                    </HoverPreviewLink>
                    ,{" "}
                    <HoverPreviewLink
                      href="https://www.linkedin.com/in/mdmoinakhtar/"
                      title="Md Moin Akhtar // LinkedIn"
                      domain="linkedin.com"
                      imageUrl="/linkedin banner.jpg"
                    >
                      LinkedIn
                    </HoverPreviewLink>
                    , or drop a line via email.
                  </span>,
                ]}
                className="text-base font-medium opacity-85 leading-relaxed text-ink text-center max-w-[440px]"
              />
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
        <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden opacity-[0.025]">
          <div className="transform -rotate-45 font-stamp text-[150px] leading-none text-ink tracking-widest select-none whitespace-nowrap">
            CONFIDENTIAL
          </div>
        </div>

        {/* Massive fingerprint watermark */}
        <div aria-hidden="true" className="absolute -bottom-20 -left-20 opacity-[0.015] pointer-events-none z-0 mix-blend-multiply transform -rotate-12">
          <Fingerprint strokeWidth={0.5} className="w-[600px] h-[600px] text-ink" />
        </div>

        {/* Barcode Graphic */}
        <div aria-hidden="true" className="absolute top-12 left-6 sm:left-20 flex flex-col gap-1 opacity-35">
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

        {/* Attached Photo (Clipped to the Dossier) - Interactive 3D Flip Card */}
        <div className="absolute top-12 -right-2 sm:right-0 lg:right-6 xl:right-10 z-20 flex flex-col items-center -translate-x-10">
          <div className="perspective-1000 relative">
            <div
              onClick={handleCardSequenceClick}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCardSequenceClick();
                }
              }}
              role="button"
              tabIndex={0}
              title={!isPhotoFlipped ? 'Click to reveal alter-ego' : 'Click to flip back to portrait'}
              aria-label={
                !isPhotoFlipped
                  ? 'Portrait photo. Click to flip and reveal Spider-Noir alter-ego.'
                  : 'Spider-Noir alter-ego and quote. Click to flip back to portrait.'
              }
              className={`relative cursor-pointer transition-transform duration-700 ease-[cubic-bezier(0.34,1.2,0.64,1)] transform-style-3d will-change-transform ${isPhotoFlipped ? 'rotate-y-180 -rotate-1' : 'rotate-3'
                } w-[260px] h-[320px] sm:w-[285px] sm:h-[365px] lg:w-[320px] lg:h-[410px]`}
            >
              {/* ========================================= */}
              {/* FRONT FACE: Polaroid Photo */}
              {/* ========================================= */}
              <div className="absolute inset-0 backface-hidden bg-polaroid p-2 pb-6 sm:p-3 sm:pb-9 lg:p-4 lg:pb-11 shadow-[2px_6px_18px_rgba(0,0,0,0.32)] border border-gray-300 rounded-[2px] flex flex-col z-20">
                {/* Paperclip front wire */}
                <div className="absolute -top-5 left-1/2 -ml-2 w-4 h-12 border-2 border-slate-400 rounded-full bg-transparent shadow-[1px_1px_2px_rgba(0,0,0,0.3)] z-30 pointer-events-none"></div>
                <div className="absolute -top-3 left-1/2 ml-1 w-2 h-8 border-[1.5px] border-slate-400 rounded-full bg-transparent z-30 pointer-events-none"></div>

                {/* Photo Image Area with Grained Gradient Black & White Effect */}
                <div
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setLensPos({
                      x: e.clientX - rect.left,
                      y: e.clientY - rect.top,
                      active: true,
                    });
                  }}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setLensPos({
                      x: e.clientX - rect.left,
                      y: e.clientY - rect.top,
                      active: true,
                    });
                  }}
                  onMouseLeave={() => {
                    setLensPos((prev) => ({ ...prev, active: false }));
                  }}
                  className="w-full flex-1 bg-zinc-800 overflow-hidden relative border border-zinc-700 select-none cursor-default"
                >
                  {/* Normal Color Portrait Base */}
                  <SubjectPortrait
                    alt="Subject 8092-AX"
                    className="song-portrait w-full h-full object-cover relative z-10 opacity-100"
                    onError={(event) => {
                      event.currentTarget.style.display = 'none';
                    }}
                  />

                  {/* Song visuals take over the portrait for image assets (videos play on the CRT TV). */}
                  {songVisual && !isCrtTvTrack ? (
                    <SongThemeOverlay key={songVisual.src} visual={songVisual} onRevealPortrait={revealPortrait} />
                  ) : (
                    showGif && !isMobileViewport && <SpiderNoirThemeOverlay fading={gifFading} />
                  )}

                  {/* Monochrome film-grain region with liquid (delayed) follow: mask-position eases toward the cursor, never resets */}
                  <div
                    className="absolute inset-0 z-15 pointer-events-none overflow-hidden"
                    style={{
                      maskImage: lensGrad,
                      WebkitMaskImage: lensGrad,
                      maskSize: '310px 310px',
                      WebkitMaskSize: '310px 310px',
                      maskPosition: `${lensPos.x - 155}px ${lensPos.y - 155}px`,
                      WebkitMaskPosition: `${lensPos.x - 155}px ${lensPos.y - 155}px`,
                      maskRepeat: 'no-repeat',
                      WebkitMaskRepeat: 'no-repeat',
                      filter: 'grayscale(1) contrast(1.12) brightness(1.03)',
                      opacity: lensPos.active ? 1 : 0,
                      transition: 'mask-position 0.5s cubic-bezier(0.22, 1, 0.36, 1), -webkit-mask-position 0.5s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  >
                    <SubjectPortrait
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    {songVisual && !isCrtTvTrack && (
                      <SongThemeOverlay key={`noir-lens-${songVisual.src}`} visual={songVisual} onRevealPortrait={revealPortrait} />
                    )}
                    {/* Static 35mm film grain, seeps in slightly after the monochrome layer */}
                    <div
                      className="film-grain pointer-events-none"
                      style={{
                        opacity: lensPos.active ? 0.5 : 0,
                        transition: 'opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.12s',
                      }}
                    />
                  </div>

                  {/* Surveillance UI Corner Brackets */}
                  <div className="absolute inset-0 z-20 pointer-events-none p-1 flex flex-col justify-between opacity-80">
                    <div className="flex justify-between items-start">
                      <div className="w-2 h-2 border-t-[1.5px] border-l-[1.5px] border-red-500/80"></div>
                      <div className="w-2 h-2 border-t-[1.5px] border-r-[1.5px] border-red-500/80"></div>
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

                {/* Bottom Polaroid Border Label */}
                <div className="mt-2 sm:mt-2.5 flex items-center px-1">
                  <span className="font-typewriter text-[8px] sm:text-[9px] lg:text-[10px] text-ink/70 tracking-widest">
                    TARGET // LOCKED
                  </span>
                </div>

                {/* Tactile Curled Paper Corner */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-0 right-0 w-7 h-7 overflow-hidden"
                >
                  <span className="absolute bottom-0 right-0 w-7 h-7 bg-gradient-to-tl from-stone-400/45 via-polaroid to-white border-t border-l border-ink/20 shadow-[-2px_-2px_5px_rgba(0,0,0,0.16)] [clip-path:polygon(100%_0,0_100%,100%_100%)]" />
                </span>
              </div>

              {/* ========================================= */}
              {/* BACK FACE: Alter-Ego Polaroid (GIF + Quote) */}
              {/* ========================================= */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 bg-polaroid p-2.5 pb-3 sm:p-3.5 sm:pb-4 shadow-[2px_6px_18px_rgba(0,0,0,0.32),inset_0_0_20px_rgba(0,0,0,0.06)] border border-gray-300 rounded-[2px] flex flex-col z-20 text-ink select-none">
                {/* Paperclip back wire */}
                <div className="absolute -top-3 left-1/2 -ml-1 w-3.5 h-10 border-2 border-slate-400 rounded-full bg-transparent z-30 pointer-events-none"></div>

                {/* Alter-Ego Polaroid Photo Window (Spider-Noir GIF) */}
                <div className="relative flex-1 min-h-0 w-full bg-black border border-ink/50 overflow-hidden">
                  <img
                    src="https://media.tenor.com/XT5Z51WyY8EAAAAC/spiderman-spider-verse.gif"
                    alt="Spider-Noir Scene"
                    className="w-full h-full object-cover contrast-105"
                  />
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        'radial-gradient(circle, transparent 52%, rgba(0,0,0,0.52) 100%)',
                    }}
                  />
                </div>

                {/* Bottom Polaroid Caption Area: Quote + Hand-Underlined Attribution */}
                <div className="shrink-0 pt-2.5 sm:pt-3 px-1 flex flex-col gap-1.5">
                  <p className="font-typewriter text-[9.5px] sm:text-[10.5px] lg:text-[11px] leading-[1.48] font-bold italic text-ink/90 border-l-2 border-red-700/85 pl-2.5">
                    &ldquo;Am I an extraordinary man? Yes. Am I an ordinary man? Yes. I&apos;m both. I&apos;m neither. But aren&apos;t we all?&rdquo;
                  </p>
                  <div className="flex items-center justify-between pt-0.5">
                    <span className="relative inline-block font-stamp text-[9.5px] sm:text-[10.5px] text-red-700 tracking-[0.14em] font-black uppercase pb-1">
                      — Spider-Noir
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 110 8"
                        className="pointer-events-none absolute left-0 bottom-0 w-full h-1.5 text-red-700/75"
                        fill="none"
                      >
                        <path
                          d="M2 5.5 Q35 1.5 72 4.5 T108 3"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                    <span className="font-mono text-[10px] text-ink/45 font-bold" aria-hidden="true">
                      ↺
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-[120px] sm:mt-[160px] lg:mt-0 lg:pr-[380px] xl:pr-[460px] relative z-10 w-full max-w-[1200px]">
          {/* Classification Header */}
          <div className="mt-2 lg:mt-6 mb-4 lg:mb-6 border-b-[3px] border-ink/20" />

          {/* Data Fields */}
          <div className="space-y-6 sm:space-y-8 text-sm sm:text-base leading-relaxed">

            <div className="grid grid-cols-[100px_1fr] sm:grid-cols-[140px_1fr] items-baseline gap-2">
              <Typewriter delay={0.4} className="font-bold opacity-60 tracking-wider text-sm sm:text-base">NAME:</Typewriter>
              <Typewriter delay={0.5} className="px-1">
                <Lettering
                  as="h1"
                  size="md"
                  tone="marker"
                  wobble={0.35}
                  seed="moin-name-desktop"
                  style={{ ['--ll-marker' as string]: '#fba368', ['--ll-riso' as string]: '#fba368' }}
                  className="font-bold whitespace-nowrap text-xl sm:text-2xl md:text-3xl lg:text-[2.35rem] tracking-tight uppercase leading-none text-ink inline-block font-script"
                >
                  MD MOIN AKHTAR
                </Lettering>
              </Typewriter>
            </div>

            <div className="grid grid-cols-[100px_1fr] sm:grid-cols-[140px_1fr] items-baseline gap-2">
              <Typewriter delay={0.6} className="font-bold opacity-60 tracking-wider text-sm sm:text-base">ROLE:</Typewriter>
              <Typewriter delay={0.7}><Highlight style="marker" color="blue" className="text-lg sm:text-xl uppercase font-bold">Software Developer</Highlight></Typewriter>
            </div>

            <div className="grid grid-cols-[100px_1fr] sm:grid-cols-[140px_1fr] items-baseline gap-2">
              <Typewriter delay={0.8} className="font-bold opacity-60 tracking-wider text-sm sm:text-base">AFFILIATION:</Typewriter>
              <Typewriter delay={0.9}><span className="uppercase font-bold text-base sm:text-lg">VIPS-TC (B.Tech AI &amp; Data Science, CGPA: 8.27)</span></Typewriter>
            </div>

            <div className="grid grid-cols-[100px_1fr] sm:grid-cols-[140px_1fr] items-baseline gap-2">
              <Typewriter delay={1.0} className="font-bold opacity-60 tracking-wider text-xs sm:text-sm">PRIMARY SKILL:</Typewriter>
              <Typewriter delay={1.1} className="leading-7 text-sm sm:text-base">
                Subject demonstrates extreme proficiency in <Highlight style="circle" color="yellow">React, TypeScript</Highlight>, and <strong className="font-bold">Python</strong> for AI implementation. Known capable of architecting <strong className="font-bold">complex AI-integration</strong> with high efficiency.
              </Typewriter>
            </div>

            <div className="grid grid-cols-[100px_1fr] sm:grid-cols-[140px_1fr] items-baseline gap-2">
              <Typewriter delay={1.4} className="font-bold opacity-60 tracking-wider text-xs sm:text-sm">SECONDARY:</Typewriter>
              <Typewriter delay={1.5} className="leading-7 text-sm sm:text-base">
                Operational capacity extends into <strong className="font-bold">Machine Learning</strong>, <strong className="font-bold">OpenCV / AI Agents</strong>, and <strong className="font-bold">Backend Architecture</strong> (Node.js/Express/Neo4j). History of success in highly competitive <Highlight style="squiggly" color="pink">Hackathon Environments</Highlight>.
              </Typewriter>
            </div>

            <div className="grid grid-cols-[100px_1fr] sm:grid-cols-[140px_1fr] items-baseline gap-2">
              <Typewriter delay={1.8} className="font-bold opacity-60 tracking-wider text-xs sm:text-sm">OBJECTIVE:</Typewriter>
              <Typewriter delay={1.9} className="leading-7 text-[15px] sm:text-[17px] font-bold text-ink">
                Tasked with engineering intelligent analytical platforms and executing seamless digital experiences. Currently reported to be developing scalable AI models and agents.
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
                  <span className="opacity-50 inline-block w-28 text-xs sm:text-sm">CONTACT:</span>{' '}
                  <a href="mailto:mohdmoinakhtar081@gmail.com" className="hover:underline font-bold">
                    <Highlight>mohdmoinakhtar081@gmail.com</Highlight>
                  </a>
                </Typewriter>

                <div className="flex flex-wrap items-center gap-3 pt-3">
                  <a
                    href="/MdMoinAkhtar_Resume.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => audioEngine.playClick()}
                    className="inline-flex items-center gap-2 bg-stamp hover:bg-red-800 text-white font-mono text-xs font-black uppercase tracking-[0.15em] px-4 py-2 rounded-xs border border-ink/30 shadow-[3px_3px_0_rgba(0,0,0,0.25)] transition-transform hover:-translate-y-0.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>DOWNLOAD RESUME.PDF</span>
                  </a>
                  <a
                    href="mailto:mohdmoinakhtar081@gmail.com"
                    onClick={() => audioEngine.playClick()}
                    className="inline-flex items-center gap-2 bg-paper hover:bg-folder/40 text-ink font-mono text-xs font-black uppercase tracking-[0.15em] px-4 py-2 rounded-xs border-2 border-ink/50 shadow-[3px_3px_0_rgba(0,0,0,0.18)] transition-transform hover:-translate-y-0.5"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>DIRECT DISPATCH (EMAIL)</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
          src={getEffectiveVideoSrc(visual.src, visual.fallbackSrc)}
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
          onError={(event) => {
            if (tryVideoFallback(event.currentTarget, visual.src, visual.fallbackSrc)) {
              return;
            }
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

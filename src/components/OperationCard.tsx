import { Typewriter } from './Typewriter';
import { ScrambleText } from './ScrambleText';
import { Lock, Unlock, Github, ExternalLink, PlayCircle, Cpu, Database, Settings, ChevronDown, Sparkles } from 'lucide-react';
import React, { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { audioEngine } from '../lib/audio';
import { 
  SiPython, SiReact, SiMysql, SiExpress, SiNodedotjs, SiNextdotjs, 
  SiTailwindcss, SiTypescript, SiGooglegemini, SiSqlite, SiOpencv
} from 'react-icons/si';
import { FaXTwitter } from 'react-icons/fa6';

function getTechIcon(name: string) {
  const norm = name.toLowerCase().trim();
  if (norm.includes('python')) return SiPython;
  if (norm.includes('react')) return SiReact;
  if (norm.includes('next.js') || norm.includes('nextjs')) return SiNextdotjs;
  if (norm.includes('node.js') || norm.includes('nodejs')) return SiNodedotjs;
  if (norm.includes('mysql')) return SiMysql;
  if (norm.includes('sqlite')) return SiSqlite;
  if (norm.includes('gemini') || norm.includes('gen ai')) return SiGooglegemini;
  if (norm.includes('opencv')) return SiOpencv;
  if (norm.includes('tailwind')) return SiTailwindcss;
  if (norm.includes('typescript')) return SiTypescript;
  if (norm.includes('spider-verse') || norm.includes('comic')) return Sparkles;
  if (norm.includes('deepface') || norm.includes('ai')) return Cpu;
  if (norm.includes('data analysis') || norm.includes('database')) return Database;
  if (norm.includes('matter')) return Cpu;
  return Settings; // fallback icon
}

function getTechColor(name: string) {
  const norm = name.toLowerCase().trim();
  if (norm.includes('python')) return '#3776AB';
  if (norm.includes('react')) return '#61DAFB';
  if (norm.includes('next.js') || norm.includes('nextjs')) return 'currentColor';
  if (norm.includes('node.js') || norm.includes('nodejs')) return '#339933';
  if (norm.includes('mysql')) return '#4479A1';
  if (norm.includes('sqlite')) return '#003B57';
  if (norm.includes('gemini') || norm.includes('gen ai')) return '#8E75B2';
  if (norm.includes('opencv')) return '#5C3EE8';
  if (norm.includes('tailwind')) return '#06B6D4';
  if (norm.includes('typescript')) return '#3178C6';
  if (norm.includes('spider-verse') || norm.includes('comic')) return '#E11D48';
  if (norm.includes('deepface') || norm.includes('ai')) return '#EC4899';
  if (norm.includes('data analysis') || norm.includes('database')) return '#3B82F6';
  if (norm.includes('matter')) return '#F59E0B';
  return 'currentColor';
}

interface OperationDetailsProps {
  id: string;
  title: string;
  tech: string;
  status: string;
  statusColor: string;
  desc: React.ReactNode;
  imageUrl?: string;
  githubUrl?: string;
  liveUrl?: string;
  liveLabel?: string;
  youtubeUrl?: string;
  xUrl?: string;
  caseEvidence?: CaseEvidence;
}

export interface CaseEvidence {
  problem: string;
  investigation: string;
  solution: string;
  result: string;
}

const OperationDetails = React.memo(function OperationDetails({
  id,
  title,
  tech,
  status,
  statusColor,
  desc,
  imageUrl,
  githubUrl,
  liveUrl,
  liveLabel,
  youtubeUrl,
  xUrl,
  caseEvidence,
}: OperationDetailsProps) {
  const techList = tech.split(',').map((item) => item.trim()).filter(Boolean);

  return (
    <div className="operation-dossier-grid block">
      <div className="min-w-0">
        <div className="mb-5 hidden items-center justify-between gap-3 border-b border-ink/15 pb-3 font-mono sm:flex">
          <div>
            <span className="block text-[9px] font-black tracking-[0.18em] opacity-50">CASE CLASSIFICATION</span>
            <span className="mt-1 block text-[11px] font-black tracking-[0.12em]">PRODUCT INVESTIGATION // {id}</span>
          </div>
          <span className={`inline-flex items-center gap-2 border border-current/25 px-2.5 py-1 text-[9px] font-black tracking-[0.14em] ${statusColor}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" /> {status}
          </span>
        </div>

        {caseEvidence && (
          <ol className="evidence-board relative mb-5 grid gap-3 md:grid-cols-3">
            {([
              ['01', 'CHALLENGE', caseEvidence.problem, 'problem'],
              ['02', 'BUILD', caseEvidence.solution, 'solution'],
              ['03', 'OUTCOME', caseEvidence.result, 'result'],
            ] as const).map(([number, label, detail, tone]) => (
              <li key={label} className={`evidence-note evidence-note--${tone} relative z-10 min-h-[104px] border border-ink/15 p-3 pt-4 shadow-[2px_3px_8px_rgba(0,0,0,0.12)]`}>
                <span className="evidence-note-tape absolute -top-2 left-1/2 h-4 w-16 -translate-x-1/2 rotate-[-2deg] bg-tape/90" aria-hidden="true" />
                <span className="flex items-center justify-between gap-3 border-b border-ink/10 pb-1.5">
                  <span className="font-mono text-[10px] font-black tracking-[0.13em] text-stamp">{label}</span>
                  <span className="font-stamp text-sm font-black opacity-25">{number}</span>
                </span>
                <span className="mt-2 block font-typewriter text-xs font-bold leading-relaxed opacity-85">{detail}</span>
              </li>
            ))}
          </ol>
        )}

        {imageUrl && (
          <aside className="operation-exhibit mx-auto mb-5 w-full max-w-2xl bg-polaroid p-2 pb-3 shadow-[4px_6px_16px_rgba(0,0,0,0.18)]">
            <div className="mx-auto -mt-4 mb-1 h-6 w-20 rotate-[-3deg] bg-tape opacity-90" />
            <div className="relative aspect-video w-full overflow-hidden bg-ink/10 object-cover">
              <img
                src={imageUrl}
                alt={title}
                loading="eager"
                decoding="async"
                fetchPriority="low"
                className="h-full w-full object-cover object-center"
                onError={(event) => {
                  event.currentTarget.style.display = 'none';
                }}
              />
              <div className="pointer-events-none absolute inset-0 bg-ink/5 mix-blend-overlay" />
            </div>
            <div className="mt-2 flex items-center justify-between gap-2 font-mono text-[9px] font-bold uppercase tracking-widest text-ink/60">
              <span>PROJECT IMAGE</span><span className="hidden sm:inline">{id}</span>
            </div>
          </aside>
        )}

        <div className="operation-field-summary border-l-[3px] border-stamp/45 bg-ink/[0.035] px-3 py-2.5 text-sm leading-relaxed font-typewriter">
          <span className="mb-1 block text-[9px] font-black tracking-[0.18em] opacity-50">INVESTIGATOR'S NOTE</span>
          {desc}
        </div>

        <div className="mt-4 border-t border-ink/10 pt-3">
          <span className="mb-2 block font-mono text-[9px] font-black tracking-[0.18em] opacity-50">TOOLS RECOVERED</span>
          <div className="flex flex-wrap gap-2">
            {techList.map((item, index) => {
              const Icon = getTechIcon(item);
              const color = getTechColor(item);
              return (
                <span key={item} className={`operation-tool operation-tool--${index % 4} flex items-center gap-1.5 border px-2.5 py-1.5 text-ink shadow-sm whitespace-nowrap`}>
                  <Icon className="h-3.5 w-3.5 shrink-0" style={{ color }} />
                  <span className="font-mono text-[11px] font-black leading-none">{item}</span>
                </span>
              );
            })}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
          {githubUrl && (
            <a href={githubUrl} target="_blank" rel="noreferrer" className="operation-action operation-action--source flex min-h-11 items-center justify-center gap-2 border px-3 py-2 text-[11px] font-black font-mono transition-[transform,box-shadow,background-color] sm:justify-start sm:text-[10px]">
              <Github className="w-3.5 h-3.5" />
              SOURCE CODE
            </a>
          )}
          {liveUrl && (
            liveUrl.startsWith('/') ? (
              <Link 
                to={liveUrl} 
                onClick={() => { audioEngine.init(); audioEngine.playClick(); }}
                className="operation-action operation-action--live flex min-h-11 items-center justify-center gap-2 border px-3 py-2 text-[11px] font-black font-mono transition-[transform,box-shadow,background-color] sm:justify-start sm:text-[10px]"
              >
                <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                {liveLabel || 'READ COMIC LOG'}
              </Link>
            ) : (
              <a href={liveUrl} target="_blank" rel="noreferrer" className="operation-action operation-action--live flex min-h-11 items-center justify-center gap-2 border px-3 py-2 text-[11px] font-black font-mono transition-[transform,box-shadow,background-color] sm:justify-start sm:text-[10px]">
                <ExternalLink className="w-3.5 h-3.5" />
                {liveLabel || 'LIVE DEPLOYMENT'}
              </a>
            )
          )}
          {youtubeUrl && (
            <a href={youtubeUrl} target="_blank" rel="noreferrer" className="operation-action operation-action--video flex min-h-11 items-center justify-center gap-2 border px-3 py-2 text-[11px] font-black font-mono transition-[transform,box-shadow,background-color] sm:justify-start sm:text-[10px]">
              <PlayCircle className="w-3.5 h-3.5" />
              WATCH DEMO
            </a>
          )}
          {xUrl && (
            <a href={xUrl} target="_blank" rel="noreferrer" className="operation-action operation-action--social flex min-h-11 items-center justify-center gap-2 border px-3 py-2 text-[11px] font-black font-mono transition-[transform,box-shadow,background-color] sm:justify-start sm:text-[10px]">
              <FaXTwitter className="w-3.5 h-3.5" />
              VIEW X POST
            </a>
          )}
        </div>
      </div>

    </div>
  );
});

export function OperationCard({ 
  id,
  title, 
  tech, 
  status, 
  statusColor, 
  desc, 
  delay,
  imageUrl,
  githubUrl,
  liveUrl,
  liveLabel,
  youtubeUrl,
  xUrl,
  caseEvidence,
  defaultOpen = false
}: { 
  id: string,
  title: string, 
  tech: string, 
  status: string, 
  statusColor: string, 
  desc: React.ReactNode, 
  delay: number,
  imageUrl?: string,
  githubUrl?: string,
  liveUrl?: string,
  liveLabel?: string,
  youtubeUrl?: string,
  xUrl?: string,
  caseEvidence?: CaseEvidence,
  defaultOpen?: boolean
}) {
  const detailsId = `operation-details-${useId().replace(/:/g, '')}`;
  const [isOpen, setIsOpen] = useState(() => defaultOpen && typeof window !== 'undefined' && window.matchMedia('(min-width: 640px)').matches);
  const techPreview = tech.split(',').map((item) => item.trim()).filter(Boolean).slice(0, 3);

  return (
    <article className={`operation-card operation-folder ${isOpen ? 'is-open' : ''} group relative mt-4 text-ink sm:mt-6`}>
      <Typewriter delay={delay} className="operation-folder-tab pointer-events-none absolute -top-[25px] left-0 z-10 hidden min-w-[132px] px-4 pb-2 pt-2 font-mono text-[9px] font-black tracking-[0.14em] sm:block">CASE FILE // {id}</Typewriter>
      <span className="operation-folder-corner absolute right-4 top-0 z-10 h-8 w-8" aria-hidden="true" />

      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className={`operation-folder-cover relative z-[2] grid w-full cursor-pointer grid-cols-1 items-center gap-3 px-3.5 py-3 text-left sm:gap-4 sm:px-5 sm:py-3.5 ${imageUrl ? 'sm:grid-cols-[124px_minmax(0,1fr)_64px]' : 'sm:grid-cols-[minmax(0,1fr)_64px]'}`}
        aria-expanded={isOpen}
        aria-controls={detailsId}
      >
        {imageUrl && (
          <span className="operation-cover-photo relative hidden w-[124px] rotate-[-1deg] border border-ink/20 bg-polaroid p-1 pb-4 shadow-[2px_3px_7px_rgba(0,0,0,0.18)] sm:block" aria-hidden="true">
            <span className="block h-[76px] overflow-hidden bg-ink/10">
              <img
                src={imageUrl}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover object-center"
              />
            </span>
            <span className="absolute bottom-1 left-0 w-full text-center font-mono text-[7px] font-black tracking-[0.15em] text-ink/55">PROJECT PREVIEW</span>
          </span>
        )}

        <span className="min-w-0">
          <span className="operation-title-slip block max-w-2xl border-y border-ink/15 bg-doc/70 px-3 py-1.5 font-stamp text-base font-black tracking-[0.08em] shadow-[2px_3px_0_rgba(17,17,17,0.08)] sm:text-xl">
            <span className="mb-1 flex items-center justify-between gap-3 font-mono text-[9px] font-black tracking-[0.12em] sm:text-[10px]">
              <span className="text-stamp">PROJECT</span>
              <span className={`inline-flex items-center gap-1.5 border border-current/25 px-1.5 py-0.5 text-[8px] tracking-[0.08em] ${statusColor}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{status}</span>
            </span>
            <ScrambleText text={title} delay={0} duration={700} className="block" />
          </span>
          <span className="mt-1.5 flex flex-wrap gap-1.5 font-mono text-[11px] font-black tracking-[0.02em] text-ink">
            {techPreview.map((item) => (
              <span key={item} className="border border-ink/15 border-b-stamp/45 bg-doc/75 px-1.5 py-0.5 shadow-[1px_1px_0_rgba(17,17,17,0.08)]">
                {item}
              </span>
            ))}
          </span>
        </span>

        <span className="operation-string-tie col-span-1 flex items-center justify-between gap-3 border border-stamp/20 bg-doc/55 px-3 py-2 font-mono shadow-[inset_3px_0_0_var(--c-stamp)] sm:flex-col sm:justify-center sm:border-0 sm:border-l sm:border-ink/10 sm:bg-transparent sm:px-0 sm:py-0 sm:pl-5 sm:shadow-none">
          <span className="operation-string-tie-graphic relative hidden h-9 w-12 items-center justify-between sm:flex" aria-hidden="true">
            <span className="absolute left-2 right-2 top-1/2 h-px -translate-y-1/2 rotate-[-18deg] bg-stamp/65" />
            <span className="z-10 h-5 w-5 rounded-full border-2 border-stamp bg-folder shadow-[inset_0_0_0_3px_var(--c-folder-dark)]" />
            <span className="z-10 h-5 w-5 rounded-full border-2 border-stamp bg-folder shadow-[inset_0_0_0_3px_var(--c-folder-dark)]" />
          </span>
          <span className="text-center text-[10px] font-black tracking-[0.08em] text-stamp sm:text-[9px]">{isOpen ? 'CLOSE DETAILS' : 'VIEW DETAILS'}</span>
          <span className={`flex h-6 w-6 items-center justify-center border border-ink/15 bg-paper/45 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
            {isOpen ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
          </span>
          <ChevronDown className={`h-3 w-3 opacity-35 transition-transform duration-200 sm:hidden ${isOpen ? 'rotate-180' : ''}`} />
        </span>
      </button>

      <div id={detailsId} className={`operation-card-details relative z-[1] border-t border-ink/15 bg-doc/80 px-3.5 py-5 sm:px-5 sm:py-6 ${isOpen ? '' : 'hidden'}`} aria-hidden={!isOpen}>
        {isOpen && (
          <OperationDetails
            id={id}
            title={title}
            tech={tech}
            status={status}
            statusColor={statusColor}
            desc={desc}
            imageUrl={imageUrl}
            githubUrl={githubUrl}
            liveUrl={liveUrl}
            liveLabel={liveLabel}
            youtubeUrl={youtubeUrl}
            xUrl={xUrl}
            caseEvidence={caseEvidence}
          />
        )}
      </div>
    </article>
  );
}

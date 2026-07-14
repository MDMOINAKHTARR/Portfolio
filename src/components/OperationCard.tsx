import { Highlight } from './Highlight';
import { Typewriter } from './Typewriter';
import { ScrambleText } from './ScrambleText';
import { Lock, Unlock, Github, ExternalLink, PlayCircle, Cpu, Database, Settings } from 'lucide-react';
import React, { useState } from 'react';
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
  youtubeUrl?: string;
  xUrl?: string;
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
  youtubeUrl,
  xUrl,
}: OperationDetailsProps) {
  const techList = tech.split(',').map((item) => item.trim()).filter(Boolean);

  return (
    <div className={`grid grid-cols-1 ${imageUrl ? 'sm:grid-cols-2' : ''} gap-4 sm:gap-6 mt-4 pb-2`}>
      <div className="order-2 sm:order-1">
        <div className="grid grid-cols-[80px_1fr] text-xs font-bold font-mono opacity-80 mb-4 border-b border-ink/10 pb-4 gap-y-3 mt-2">
          <span className="block text-ink/60 self-center">TECH:</span>
          <span className="block">
            <span className="flex flex-wrap gap-2">
              {techList.map((item) => {
                const Icon = getTechIcon(item);
                const color = getTechColor(item);

                return (
                  <span
                    key={item}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-paper border border-ink/15 rounded-full shadow-sm text-ink whitespace-nowrap"
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" style={{ color }} />
                    <span className="font-mono text-[10px] sm:text-xs font-bold leading-none">{item}</span>
                  </span>
                );
              })}
            </span>
          </span>

          <span className="block text-ink/60 self-center">STATUS:</span>
          <span className={`block ${statusColor} self-center tracking-widest font-bold`}>{status}</span>
        </div>

        <div className="text-sm leading-relaxed block font-typewriter">{desc}</div>

        <div className="mt-6 flex flex-wrap gap-4">
          {githubUrl && (
            <a href={githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-bold font-mono border border-ink/30 px-3 py-1.5 hover:bg-ink hover:text-doc transition-colors">
              <Github className="w-3.5 h-3.5" />
              SOURCE CODE
            </a>
          )}
          {liveUrl && (
            <a href={liveUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-bold font-mono border border-ink/30 px-3 py-1.5 hover:bg-ink hover:text-doc transition-colors text-emerald-800 border-emerald-800/30 hover:border-ink">
              <ExternalLink className="w-3.5 h-3.5" />
              LIVE DEPLOYMENT
            </a>
          )}
          {youtubeUrl && (
            <a href={youtubeUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-bold font-mono border border-ink/30 px-3 py-1.5 hover:bg-red-600 hover:text-white transition-colors text-red-600 border-red-600/30 hover:border-red-600">
              <PlayCircle className="w-3.5 h-3.5" />
              WATCH DEMO
            </a>
          )}
          {xUrl && (
            <a href={xUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-bold font-mono border border-ink/30 px-3 py-1.5 hover:bg-black hover:text-white transition-colors">
              <FaXTwitter className="w-3.5 h-3.5" />
              VIEW X POST
            </a>
          )}
        </div>
      </div>

      {imageUrl && (
        <div className="order-1 sm:order-2 border-[3px] border-ink/10 p-2 bg-polaroid shadow-sm transform rotate-1 hover:rotate-0 transition-transform duration-500 will-change-transform">
          <div className="relative w-full overflow-hidden bg-ink/10 aspect-[4/3] sm:aspect-video object-cover">
            <img
              src={imageUrl}
              alt={title}
              loading="eager"
              decoding="async"
              fetchPriority="low"
              className="w-full h-full object-cover object-center"
              onError={(event) => {
                event.currentTarget.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-ink/5 mix-blend-overlay pointer-events-none" />
          </div>
          <div className="text-[9px] font-mono font-bold tracking-widest text-ink/60 mt-2 text-center uppercase">
            SURVEILLANCE IMG // {id}
          </div>
        </div>
      )}
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
  youtubeUrl,
  xUrl,
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
  youtubeUrl?: string,
  xUrl?: string,
  defaultOpen?: boolean
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className={`operation-card ${isOpen ? 'is-open' : ''} relative group border border-ink/20 p-4 sm:p-6 bg-op-bg hover:bg-op-bg-hover transition-colors rounded-sm shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)] cursor-pointer`}
      onClick={() => setIsOpen((open) => !open)}
    >
      <Typewriter delay={delay} className="absolute top-0 right-0 p-2 opacity-30 font-mono text-xs font-bold block pointer-events-none">[FILE: {id}]</Typewriter>
      
      <div className="animate-in fade-in duration-700">
        <button
          type="button"
          className="operation-card-trigger block w-full cursor-pointer text-left"
          aria-expanded={isOpen}
          aria-controls={`operation-details-${id}`}
        >
          <div className="operation-card-heading flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isOpen ? (
                <Unlock className="w-4 h-4 text-emerald-700" />
              ) : (
                <Lock className="w-4 h-4 text-ink/50" />
              )}
              <div className="text-lg sm:text-lg lg:text-xl font-bold tracking-widest block font-stamp">
                <ScrambleText text={title} delay={0} duration={800} />
              </div>
            </div>
          </div>
        </button>
        
        <div
          id={`operation-details-${id}`}
          className={`operation-card-details ${isOpen ? '' : 'hidden'}`}
          aria-hidden={!isOpen}
          onClick={(event) => event.stopPropagation()}
        >
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
            youtubeUrl={youtubeUrl}
            xUrl={xUrl}
          />
        </div>
      </div>
    </div>
  );
}

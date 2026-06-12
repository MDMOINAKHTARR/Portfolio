import { Highlight } from './Highlight';
import { Typewriter } from './Typewriter';
import { ScrambleText } from './ScrambleText';
import { Lock, Unlock, Github, ExternalLink, PlayCircle, Cpu, Database, Settings } from 'lucide-react';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  SiPython, SiReact, SiMysql, SiExpress, SiNodedotjs, SiNextdotjs, 
  SiTailwindcss, SiTypescript, SiGooglegemini, SiSqlite, SiOpencv
} from 'react-icons/si';

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
  defaultOpen?: boolean
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const techList = tech.split(',').map(t => t.trim()).filter(Boolean);

  return (
    <div 
      className="relative group border border-ink/20 p-4 sm:p-6 bg-op-bg hover:bg-op-bg-hover transition-colors rounded-sm shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)] cursor-pointer"
      onClick={() => setIsOpen(!isOpen)}
    >
      <Typewriter delay={delay} className="absolute top-0 right-0 p-2 opacity-30 font-mono text-xs font-bold block pointer-events-none">[FILE: {id}]</Typewriter>
      
      <div className="animate-in fade-in duration-700">
        <div className={`flex items-center justify-between ${isOpen ? 'mb-3 border-b-2 border-ink pb-2' : ''}`}>
          <div className="flex items-center gap-3">
            {isOpen ? <Unlock className="w-4 h-4 text-emerald-700" /> : <Lock className="w-4 h-4 text-ink/50" />}
            <div className="text-lg sm:text-lg lg:text-xl font-bold tracking-widest block font-stamp">
              <ScrambleText text={title} delay={0} duration={800} />
            </div>
          </div>
        </div>
        
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden origin-top"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4 pb-2">
              <div className="order-2 sm:order-1">
                <div className="grid grid-cols-[80px_1fr] text-xs font-bold font-mono opacity-80 mb-4 border-b border-ink/10 pb-4 gap-y-3 mt-2">
                  <span className="block text-ink/60 self-center">TECH:</span>
                  <span className="block">
                    <div className="flex flex-wrap gap-2">
                      {techList.map((t, idx) => {
                        const Icon = getTechIcon(t);
                        const color = getTechColor(t);
                        return (
                          <div 
                            key={idx} 
                            className="flex items-center gap-1.5 px-2.5 py-1 bg-paper border border-ink/15 rounded-full shadow-sm text-ink whitespace-nowrap"
                          >
                            {Icon && <Icon className="w-3.5 h-3.5 shrink-0" style={{ color }} />}
                            <span className="font-mono text-[10px] sm:text-xs font-bold leading-none">{t}</span>
                          </div>
                        );
                      })}
                    </div>
                  </span>
                  
                  <span className="block text-ink/60 self-center">STATUS:</span>
                  <span className={`block ${statusColor} self-center tracking-widest font-bold`}>{status}</span>
                </div>
                <div className="text-sm leading-relaxed block font-typewriter">
                  {desc}
                </div>
                
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
                </div>
              </div>
              
              {imageUrl && (
                <div className="order-1 sm:order-2 border-[3px] border-ink/10 p-2 bg-polaroid shadow-sm transform rotate-1 hover:rotate-0 transition-transform duration-500 will-change-transform">
                  <div className="relative w-full overflow-hidden transition-all duration-700 bg-ink/10 aspect-[4/3] sm:aspect-video object-cover">
                    <img 
                      src={imageUrl} 
                      alt={title} 
                      className="w-full h-full object-cover object-center" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-ink/5 mix-blend-overlay pointer-events-none"></div>
                  </div>
                  <div className="text-[9px] font-mono font-bold tracking-widest text-ink/60 mt-2 text-center uppercase">
                    SURVEILLANCE IMG // {id}
                  </div>
                </div>
              )}
            </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

import React from 'react';
import { motion } from 'motion/react';
import { ExternalLink, Github, PlayCircle, Eye, ArrowUpRight, Linkedin } from 'lucide-react';
import { FaXTwitter } from 'react-icons/fa6';
import { Project } from '../data/projectsData';
import { audioEngine } from '../lib/audio';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { paperBackground } from '../lib/ink/textures';

interface ProjectBentoCardProps {
  project: Project;
  onOpenModal: (project: Project) => void;
  index: number;
}

export const CATEGORY_MAP: Record<string, { label: string; dot: string; pillBorder: string; pillBg: string; pillText: string }> = {
  ai: {
    label: 'AI & VIDEO',
    dot: '#1d4ed8',
    pillBorder: 'rgba(29, 78, 216, 0.35)',
    pillBg: 'rgba(255, 255, 255, 0.85)',
    pillText: '#1e3a8a',
  },
  web3: {
    label: 'WEB3 / ON-CHAIN',
    dot: '#047857',
    pillBorder: 'rgba(4, 120, 87, 0.35)',
    pillBg: 'rgba(255, 255, 255, 0.85)',
    pillText: '#064e3b',
  },
  ml: {
    label: 'ML / RESEARCH',
    dot: '#b45309',
    pillBorder: 'rgba(180, 83, 9, 0.35)',
    pillBg: 'rgba(255, 255, 255, 0.85)',
    pillText: '#78350f',
  },
  fullstack: {
    label: 'FULL-STACK',
    dot: '#c2410c',
    pillBorder: 'rgba(194, 65, 12, 0.35)',
    pillBg: 'rgba(255, 255, 255, 0.85)',
    pillText: '#7c2d12',
  },
};

export function ProjectBentoCard({ project, onOpenModal, index }: ProjectBentoCardProps) {
  const handleCardClick = () => {
    try { audioEngine.playPaper(); } catch {}
    onOpenModal(project);
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    try { audioEngine.playClick(); } catch {}
  };

  const catMeta = CATEGORY_MAP[project.category] || CATEGORY_MAP.ai;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.02 + index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      onClick={handleCardClick}
      data-category={project.category}
      className="project-card group relative flex flex-col break-inside-avoid overflow-hidden cursor-pointer mb-5 select-none rounded-xl border-2 border-[#543e2a]/40 bg-[#fbf7ee] shadow-[0_8px_24px_-4px_rgba(32,20,10,0.13),0_2px_6px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.9)] hover:border-[#20140a] hover:shadow-[0_20px_42px_-8px_rgba(32,20,10,0.22),0_6px_14px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300"
    >
      {/* ── CARD TOP CHROME RAIL (MacOS Traffic Lights + Domain + Metric Badge) ── */}
      <div className="project-card-chrome flex items-center justify-between px-3.5 py-2.5 border-b border-[#543e2a]/25 bg-gradient-to-b from-[#f6eedf] to-[#ece2cd] select-none">
        {/* Left: MacOS Traffic Dots + App Name */}
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="flex items-center gap-1 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] border border-[#e0443e]/70 shadow-[inset_0_1px_1px_rgba(255,255,255,0.45)]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] border border-[#dea123]/70 shadow-[inset_0_1px_1px_rgba(255,255,255,0.45)]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f] border border-[#1aab29]/70 shadow-[inset_0_1px_1px_rgba(255,255,255,0.45)]" />
          </div>
          <span className="text-[10px] font-mono ml-2 truncate font-bold text-[#453424] group-hover:text-[#1a120b] transition-colors">
            {project.title.toLowerCase().replace(/[^a-z0-9]/g, '')}.app
          </span>
        </div>

        {/* Right: Metrics or Live Status Looseleaf Badge */}
        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {project.metrics ? (
            <Badge
              variant="secondary"
              size="sm"
              seed={`metric-${project.id}`}
              className="font-mono text-[8.5px] font-bold uppercase tracking-tight px-1.5 py-0.5 shadow-xs border border-[#a68a68]/45 bg-white/85 text-[#3d2b19]"
            >
              <span className="text-[8.5px] text-[#b45309] mr-0.5">⚡</span>
              {project.metrics}
            </Badge>
          ) : (
            <Badge
              variant="outline"
              size="sm"
              seed={`status-${project.id}`}
              className="font-mono text-[8px] font-black uppercase tracking-wider text-[#3d2b19] border-emerald-700/30 bg-emerald-500/10 px-1.5 py-0.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse mr-1" />
              {project.status}
            </Badge>
          )}
        </div>
      </div>

      {/* ── SCREENSHOT VIEWPORT (Archival Recessed Matte Frame) ── */}
      <div
        className="project-image-frame relative w-full overflow-hidden border-b border-[#543e2a]/22 bg-[#e6dbca]"
        style={{ height: project.imageHeight ?? 185 }}
      >
        <img
          src={project.imageUrl}
          alt={project.title}
          loading={index < 6 ? 'eager' : 'lazy'}
          fetchPriority={index < 3 ? 'high' : 'auto'}
          decoding="async"
          className="project-card-image w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.025]"
        />

        {/* Hover overlay with tactile dossier badge */}
        <div className="project-card-overlay absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/15 backdrop-blur-[1px]">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-mono text-[10.5px] font-black uppercase tracking-wider bg-[#1c140e]/92 text-[#fbf7ee] shadow-xl border border-[#d4b992]/40">
            <Eye className="w-3.5 h-3.5 text-[#d4b992]" />
            Inspect Dossier
          </span>
        </div>
      </div>

      {/* ── CARD BODY (Looseleaf Textured Paper + Letterpress Typography) ── */}
      <div
        className="project-card-body flex flex-col gap-2.5 p-4 relative z-[2] flex-1 bg-[#fbf7ee]"
        style={paperBackground('card', { seed: `card-body-${project.id}` })}
      >
        <div className="space-y-1.5">
          {/* Category Looseleaf Badge */}
          <div className="flex items-center gap-1.5">
            <Badge
              variant="outline"
              size="sm"
              seed={`cat-${project.id}`}
              className="font-mono text-[8.5px] font-black tracking-wider uppercase shadow-xs px-2 py-0.5 border"
              style={{
                borderColor: catMeta.pillBorder,
                backgroundColor: catMeta.pillBg,
                color: catMeta.pillText,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full inline-block mr-1.5"
                style={{ backgroundColor: catMeta.dot }}
              />
              {project.categoryLabel || catMeta.label}
            </Badge>
          </div>

          {/* Project Title + Direction Arrow */}
          <div className="flex items-start justify-between gap-2 pt-0.5">
            <h3 className="font-stamp font-black text-[16px] uppercase tracking-tight leading-snug text-[#1c140d] transition-colors duration-200 group-hover:text-[#000000]">
              {project.title}
            </h3>
            <ArrowUpRight
              className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#73583f] transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#1c140d]"
            />
          </div>

          {/* Tagline / Description */}
          <p className="text-[12px] font-typewriter leading-relaxed text-[#4a3a2a]">
            {project.tagline}
          </p>
        </div>

        {/* Tech Stack Pills (Looseleaf Secondary Badges) */}
        <div className="flex flex-wrap gap-1 mt-auto pt-2">
          {project.tech.slice(0, 4).map((tech) => (
            <Badge
              key={tech}
              variant="secondary"
              size="sm"
              seed={`tech-${tech}-${project.id}`}
              className="font-mono text-[9px] font-bold px-2 py-0.5 text-[#3d2b19] border border-[#543e2a]/25 bg-[#ede4d1]/75 hover:bg-[#ede4d1]"
            >
              {tech}
            </Badge>
          ))}
          {project.tech.length > 4 && (
            <span className="px-1.5 py-0.5 font-mono text-[8.5px] font-black text-[#6d5138] self-center">
              +{project.tech.length - 4}
            </span>
          )}
        </div>
      </div>

      {/* ── CARD FOOTER (Looseleaf Archival Action Buttons) ── */}
      <div className="project-card-footer px-3.5 py-2.5 flex items-center justify-between gap-1.5 relative z-[2] border-t border-[#543e2a]/25 bg-gradient-to-b from-[#f6eedf] to-[#eee3ce] flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap" onClick={handleLinkClick}>
          {project.liveUrl && project.liveUrl !== '#' && (
            <Button
              asChild
              variant="default"
              size="xs"
              seed={`live-${project.id}`}
              className="h-6 px-2 font-mono text-[9.5px] font-bold uppercase tracking-wider"
            >
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Launch Live Application"
              >
                <ExternalLink className="w-2.5 h-2.5 mr-1" />
                <span>Live</span>
              </a>
            </Button>
          )}

          {project.githubUrl && (
            <Button
              asChild
              variant="outline"
              size="xs"
              seed={`gh-${project.id}`}
              className="h-6 px-2 font-mono text-[9.5px] font-bold uppercase tracking-wider border-[#543e2a]/30 bg-paper/70 hover:bg-paper"
            >
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Source Code"
              >
                <Github className="w-2.5 h-2.5 mr-1" />
                <span>Code</span>
              </a>
            </Button>
          )}

          {project.youtubeUrl && (
            <Button
              asChild
              variant="secondary"
              size="xs"
              seed={`yt-${project.id}`}
              className="h-6 px-2 font-mono text-[9.5px] font-bold uppercase tracking-wider"
            >
              <a
                href={project.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Watch Demo"
              >
                <PlayCircle className="w-2.5 h-2.5 mr-1" />
                <span>Demo</span>
              </a>
            </Button>
          )}

          {project.linkedinUrl && (
            <Button
              asChild
              variant="outline"
              size="xs"
              seed={`li-${project.id}`}
              className="h-6 px-2 font-mono text-[9.5px] font-bold uppercase tracking-wider border-[#543e2a]/30 bg-paper/70 hover:bg-paper"
            >
              <a
                href={project.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="View on LinkedIn"
              >
                <Linkedin className="w-2.5 h-2.5 mr-1" />
                <span>LinkedIn</span>
              </a>
            </Button>
          )}

          {project.xUrl && (
            <Button
              asChild
              variant="ghost"
              size="xs"
              seed={`x-${project.id}`}
              className="h-6 px-1.5 font-mono text-[9.5px] font-bold uppercase tracking-wider text-ink/80 hover:text-ink"
            >
              <a
                href={project.xUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="View on X"
              >
                <FaXTwitter className="w-2.5 h-2.5" />
                <span className="sr-only">X</span>
              </a>
            </Button>
          )}
        </div>

        {/* Dossier Intel Trigger */}
        <Button
          variant="ghost"
          size="xs"
          seed={`intel-${project.id}`}
          className="h-6 px-2 font-mono text-[9.5px] font-black tracking-wider uppercase text-[#a31d1d] hover:text-[#7f1717] group-hover:translate-x-0.5 transition-transform"
          onClick={() => {
            try { audioEngine.playPaper(); } catch {}
            onOpenModal(project);
          }}
        >
          <span>Intel →</span>
        </Button>
      </div>
    </motion.article>
  );
}

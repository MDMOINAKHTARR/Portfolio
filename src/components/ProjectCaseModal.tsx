import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink, Github, PlayCircle, ShieldCheck, ArrowRight, Layers, Cpu, Award, CheckCircle2 } from 'lucide-react';
import { FaXTwitter } from 'react-icons/fa6';
import { Project } from '../data/projectsData';
import { audioEngine } from '../lib/audio';
import { FocusParagraph } from './FocusParagraph';
import { HoverPreviewLink } from './HoverPreviewLink';

interface ProjectCaseModalProps {
  project: Project | null;
  onClose: () => void;
}

function splitSentences(text: string): string[] {
  if (!text) return [];
  const parts = text.match(/[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g);
  return parts ? parts.map((s) => s.trim()).filter(Boolean) : [text];
}

function getDomain(url?: string): string {
  if (!url) return '';
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return 'external link';
  }
}

export function ProjectCaseModal({ project, onClose }: ProjectCaseModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (project) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [project, onClose]);

  if (!project) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 md:p-10 overflow-y-auto" data-lenis-prevent>
      {/* Darkened Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => {
          try { audioEngine.playClick(); } catch {}
          onClose();
        }}
        className="fixed inset-0 bg-black/80 backdrop-blur-md"
      />

      {/* Dossier Document Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
        className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl bg-paper border border-ink/25 shadow-2xl flex flex-col text-ink my-auto"
      >
        {/* Top Sticky Header */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-paper/95 backdrop-blur border-b border-ink/15 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-black tracking-widest text-stamp uppercase border border-stamp/40 px-2 py-0.5 rounded-xs bg-stamp/5">
              CASE INTEL // {project.id}
            </span>
            <span className="hidden sm:inline font-mono text-[11px] text-ink/50 uppercase tracking-wider">
              {project.categoryLabel}
            </span>
          </div>

          <button
            onClick={() => {
              try { audioEngine.playClick(); } catch {}
              onClose();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-ink/20 hover:border-stamp bg-paper hover:bg-stamp hover:text-white transition-all duration-150 cursor-pointer text-xs font-mono font-bold"
            title="Close Case File (ESC)"
          >
            <span>CLOSE</span>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-7">
          {/* Header section with Title + Status */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 border-b border-ink/15 pb-6">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-mono font-black tracking-wider uppercase rounded-xs border ${project.statusColor}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {project.status}
                </span>
                {project.metrics && (
                  <span className="text-[11px] font-mono font-bold text-stamp uppercase">
                    ★ {project.metrics}
                  </span>
                )}
              </div>
              <h2 className="text-2xl sm:text-4xl font-black font-stamp tracking-tight text-ink uppercase">
                {project.title}
              </h2>
              {/* FocusParagraph for Overview */}
              <FocusParagraph
                sentences={splitSentences(project.desc)}
                className="text-sm sm:text-base text-ink/80 font-typewriter max-w-2xl leading-relaxed"
              />
            </div>

            {/* Direct Action Links with HoverPreviewLink Tilt Physics */}
            <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
              {project.liveUrl && project.liveUrl !== '#' && (
                <HoverPreviewLink
                  href={project.liveUrl}
                  title={project.title}
                  domain={getDomain(project.liveUrl)}
                  imageUrl={project.imageUrl}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md font-mono text-xs font-bold uppercase bg-stamp text-white hover:opacity-90 shadow-sm transition-all no-underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Live Deployment
                </HoverPreviewLink>
              )}
              {project.githubUrl && (
                <HoverPreviewLink
                  href={project.githubUrl}
                  title={`${project.title} // Source`}
                  domain="github.com"
                  imageUrl={project.imageUrl}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md font-mono text-xs font-bold uppercase border border-ink/30 bg-paper hover:bg-ink hover:text-paper shadow-2xs transition-all no-underline"
                >
                  <Github className="w-3.5 h-3.5" />
                  Source Repository
                </HoverPreviewLink>
              )}
              {project.youtubeUrl && (
                <HoverPreviewLink
                  href={project.youtubeUrl}
                  title={`${project.title} // Walkthrough`}
                  domain="youtube.com"
                  imageUrl={project.imageUrl}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md font-mono text-xs font-bold uppercase border border-ink/30 bg-paper hover:border-red-600 hover:text-red-600 shadow-2xs transition-all no-underline"
                >
                  <PlayCircle className="w-3.5 h-3.5" />
                  Video Walkthrough
                </HoverPreviewLink>
              )}
              {project.xUrl && (
                <HoverPreviewLink
                  href={project.xUrl}
                  title={`${project.title} // Field Notes`}
                  domain="x.com"
                  imageUrl={project.imageUrl}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md font-mono text-xs font-bold uppercase border border-ink/30 bg-paper hover:bg-ink hover:text-paper shadow-2xs transition-all no-underline"
                >
                  <FaXTwitter className="w-3.5 h-3.5" />
                  Field Notes (X)
                </HoverPreviewLink>
              )}
            </div>
          </div>

          {/* High-res Project Mockup Frame */}
          <div className="rounded-lg overflow-hidden border border-ink/20 shadow-md bg-ink/5">
            <div className="flex items-center gap-1.5 px-3 py-2 bg-ink/5 border-b border-ink/10">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/60 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/60 inline-block" />
              <span className="text-[10px] font-mono text-ink/40 ml-2">SYSTEM PREVIEW // {project.title.toLowerCase()}</span>
            </div>
            <img
              src={project.imageUrl}
              alt={project.title}
              className="w-full max-h-[420px] object-cover object-top"
            />
          </div>

          {/* 4-Step Engineering Debrief Grid with Interactive FocusParagraph */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-stamp" />
              <h3 className="font-mono text-xs font-black tracking-[0.2em] uppercase text-ink/75">
                Technical Debrief & Field Verification —
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Problem */}
              <div className="p-4 rounded-lg border border-ink/15 bg-paper/60 space-y-2">
                <span className="font-mono text-[10px] font-black tracking-wider text-red-700 uppercase block">
                  01 // THE ANOMALY & PROBLEM
                </span>
                <FocusParagraph
                  sentences={splitSentences(project.caseEvidence.problem)}
                  className="text-xs sm:text-[13px] text-ink/80 font-typewriter leading-relaxed"
                />
              </div>

              {/* Investigation */}
              <div className="p-4 rounded-lg border border-ink/15 bg-paper/60 space-y-2">
                <span className="font-mono text-[10px] font-black tracking-wider text-amber-700 uppercase block">
                  02 // RECONNAISSANCE & BOTTLENECK
                </span>
                <FocusParagraph
                  sentences={splitSentences(project.caseEvidence.investigation)}
                  className="text-xs sm:text-[13px] text-ink/80 font-typewriter leading-relaxed"
                />
              </div>

              {/* Solution */}
              <div className="p-4 rounded-lg border border-ink/15 bg-paper/60 space-y-2">
                <span className="font-mono text-[10px] font-black tracking-wider text-blue-700 uppercase block">
                  03 // TACTICAL ARCHITECTURE
                </span>
                <FocusParagraph
                  sentences={splitSentences(project.caseEvidence.solution)}
                  className="text-xs sm:text-[13px] text-ink/80 font-typewriter leading-relaxed"
                />
              </div>

              {/* Result */}
              <div className="p-4 rounded-lg border border-ink/15 bg-paper/60 space-y-2">
                <span className="font-mono text-[10px] font-black tracking-wider text-emerald-700 uppercase block">
                  04 // FIELD VERIFICATION & METRICS
                </span>
                <FocusParagraph
                  sentences={splitSentences(project.caseEvidence.result)}
                  className="text-xs sm:text-[13px] text-ink/80 font-typewriter leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Tech Stack Inventory */}
          <div className="border-t border-ink/15 pt-5 space-y-3">
            <span className="font-mono text-[11px] font-black tracking-[0.18em] uppercase text-ink/60 block">
              Core Technologies Deployed //
            </span>
            <div className="flex flex-wrap gap-2">
              {project.tech.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-doc/70 border border-ink/20 font-mono text-xs font-bold text-ink"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-stamp" />
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

import React, { useState, useMemo } from 'react';
import { Briefcase, Github, ExternalLink } from 'lucide-react';
import { PageTransition } from '../components/PageTransition';
import { Highlight } from '../components/Highlight';
import { ScrambleText } from '../components/ScrambleText';
import { ProjectBentoCard } from '../components/ProjectBentoCard';
import { ProjectCaseModal } from '../components/ProjectCaseModal';
import { ExpandingSearch } from '../components/ExpandingSearch';
import { Button } from '../components/ui/button';
import { PROJECTS, type Project } from '../data/projectsData';
import { audioEngine } from '../lib/audio';

const CATEGORIES = [
  { id: 'all', label: 'ALL PROJECTS' },
  { id: 'ai', label: 'AI & VIDEO' },
  { id: 'web3', label: 'WEB3 / ON-CHAIN' },
  { id: 'ml', label: 'ML / RESEARCH' },
  { id: 'fullstack', label: 'FULL-STACK' },
] as const;

export function Operations() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  const filteredProjects = useMemo(() => {
    return PROJECTS.filter((p) => {
      const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
      if (!matchesCategory) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const inTitle = p.title.toLowerCase().includes(q);
      const inTagline = p.tagline.toLowerCase().includes(q);
      const inDesc = p.desc.toLowerCase().includes(q);
      const inTech = p.tech.some((t) => t.toLowerCase().includes(q));
      const inCategory = (p.categoryLabel || p.category).toLowerCase().includes(q);
      return inTitle || inTagline || inDesc || inTech || inCategory;
    });
  }, [activeCategory, searchQuery]);

  return (
    <PageTransition className="px-4 sm:px-8 lg:px-12 pb-14 pt-8 sm:pt-10">
      {/* ── ENHANCED AESTHETIC PROJECTS MASTHEAD ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 mb-6 border-b-2 border-ink/15">
        {/* Left: Graphic Icon + Projects Title + Folio Count */}
        <div className="flex items-center gap-3 sm:gap-3.5 flex-wrap">
          {/* Tactile Stamped Icon Box */}
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border-2 border-stamp/40 bg-stamp/5 flex items-center justify-center shadow-xs shrink-0 transform -rotate-1">
            <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-stamp" strokeWidth={2.2} />
          </div>

          <div className="flex items-baseline gap-2.5 sm:gap-3">
            <h1 className="font-stamp font-black text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] uppercase tracking-tight text-ink leading-none select-none">
              <Highlight style="underline" color="red">
                <ScrambleText text="PROJECTS" duration={700} />
              </Highlight>
            </h1>

            <span className="font-mono text-xs sm:text-sm font-black text-stamp/85 tracking-widest self-baseline pb-1">
              [{filteredProjects.length.toString().padStart(2, '0')}]
            </span>
          </div>
        </div>

        {/* Right: GitHub Direct Link + Interactive Search Bar */}
        <div className="flex items-center gap-2.5 self-start sm:self-end shrink-0 flex-wrap">
          <Button
            asChild
            variant="outline"
            size="xs"
            seed="projects-github-archive"
            className="h-8 px-2.5 font-mono text-[10px] font-bold uppercase tracking-wider border-ink/20 bg-paper/60 hover:bg-paper text-ink/80 hover:text-ink shadow-xs"
          >
            <a
              href="https://github.com/MDMOINAKHTARR"
              target="_blank"
              rel="noopener noreferrer"
              title="Open GitHub Profile & Repositories"
            >
              <Github className="w-3 h-3 mr-1.5" />
              <span>GitHub</span>
              <ExternalLink className="w-2.5 h-2.5 ml-1 opacity-60" />
            </a>
          </Button>

          <ExpandingSearch
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search projects or stack..."
            width={240}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-6 pb-3 border-b border-ink/10">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                try { audioEngine.playClick(); } catch {}
                setActiveCategory(cat.id);
              }}
              className={`px-3 py-1 font-mono text-[10px] sm:text-[11px] font-black uppercase tracking-wider rounded-sm transition-all cursor-pointer ${
                isActive
                  ? 'bg-ink text-paper shadow-md scale-[1.02]'
                  : 'bg-paper/70 hover:bg-paper text-ink/75 hover:text-ink border border-ink/20'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Bento Grid or Empty State */}
      {filteredProjects.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-ink/20 rounded-lg bg-paper/40 flex flex-col items-center justify-center gap-3">
          <p className="font-stamp text-lg text-ink/75 uppercase">
            No projects matching "{searchQuery}"
          </p>
          <button
            onClick={() => {
              try { audioEngine.playClick(); } catch {}
              setSearchQuery('');
              setActiveCategory('all');
            }}
            className="px-3 py-1 font-mono text-[11px] font-bold text-stamp underline cursor-pointer hover:opacity-80"
          >
            Clear Search & Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
          {filteredProjects.map((project, idx) => (
            <ProjectBentoCard
              key={project.id}
              project={project}
              onOpenModal={(p) => setActiveProject(p)}
              index={idx}
            />
          ))}
        </div>
      )}

      {/* Project Case Modal for in-depth inspection */}
      <ProjectCaseModal
        project={activeProject}
        onClose={() => setActiveProject(null)}
      />
    </PageTransition>
  );
}

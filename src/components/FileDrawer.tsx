import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Folder, Database, Briefcase, FileSearch, Radio, X, ChevronRight } from 'lucide-react';
import { audioEngine } from '../lib/audio';

const DOSSIERS = [
  { id: '01', path: '/', label: 'SUBJECT PROFILE', sub: 'Bio, Portrait & Brief', icon: Folder, color: 'bg-[#f4e7d3]', spine: 'bg-rose-700/80' },
  { id: '02', path: '/capabilities', label: 'ARSENAL', sub: 'Stack & Engineering', icon: Database, color: 'bg-[#ebe8df]', spine: 'bg-sky-800/80' },
  { id: '03', path: '/operations', label: 'OPERATIONS', sub: '8 Shipped Systems', icon: Briefcase, color: 'bg-[#f6ebcf]', spine: 'bg-amber-700/80' },
  { id: '04', path: '/evidence', label: 'EVIDENCE', sub: '4 Wins & IEEE Paper', icon: FileSearch, color: 'bg-[#f5efd6]', spine: 'bg-emerald-700/80' },
  { id: '05', path: '/comms', label: 'COMMS', sub: 'Contact & Dispatch', icon: Radio, color: 'bg-[#f4e0de]', spine: 'bg-red-700/80' },
];

export function FileDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [footerVisible, setFooterVisible] = useState(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('footer-in-view')
  );
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onFooterVisibility = (e: Event) => {
      const visible = Boolean((e as CustomEvent<boolean>).detail);
      setFooterVisible(visible);
      if (visible) setIsOpen(false);
    };
    window.addEventListener('footer-visibility', onFooterVisibility);
    return () => window.removeEventListener('footer-visibility', onFooterVisibility);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  const handleToggle = () => {
    if (!isOpen) {
      audioEngine.playDrawer();
    } else {
      audioEngine.playDrawer();
    }
    setIsOpen(!isOpen);
  };

  const handleSelect = (path: string) => {
    audioEngine.playClick();
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      {/* Drawer Handle / Closed State Peek — smoothly retracts left when footer is in view */}
      <AnimatePresence>
        {!isOpen && !footerVisible && (
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            role="button"
            tabIndex={0}
            aria-label="Open dossier index drawer"
            aria-expanded={isOpen}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleToggle();
              }
            }}
            className="hidden sm:flex fixed left-0 top-1/2 -mt-32 w-14 h-64 bg-zinc-800 border-r-4 border-zinc-900 border-y border-y-zinc-700 rounded-r-lg z-[90] cursor-pointer shadow-[10px_0_20px_rgba(0,0,0,0.8)] flex-col items-center py-6 group"
            onClick={handleToggle}
            whileHover={{ width: 64, transition: { duration: 0.2 } }}
          >
            {/* Label Holder Placeholder */}
            <div className="w-8 h-10 mb-8 border-2 border-zinc-700 shadow-[inset_0_2px_5px_rgba(0,0,0,0.6)] bg-[#111] p-0.5 relative group-hover:w-10 transition-all">
              <div className="w-full h-full bg-amber-100/90 flex items-center justify-center opacity-80">
                <div className="text-[6px] font-typewriter text-ink/70 leading-none text-center transform -rotate-90 origin-center whitespace-nowrap">A - Z</div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
            </div>

            {/* Substantial Metallic Handle */}
            <div className="w-6 group-hover:w-8 transition-all h-32 flex justify-center bg-zinc-900 rounded-sm shadow-[inset_-2px_0_5px_rgba(0,0,0,0.8),_inset_2px_0_5px_rgba(255,255,255,0.1)] border-y border-ink relative">
              <div className="w-2 h-full bg-gradient-to-r from-zinc-600 via-zinc-400 to-zinc-600 shadow-[2px_0_4px_rgba(0,0,0,0.5)]"></div>
              <div className="absolute right-[-10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity font-mono text-[10px] text-zinc-300 tracking-widest pl-4 transform -rotate-90 origin-left top-1/2 mt-12 pointer-events-none">
                PULL DRAWER
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drawer Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink/60 z-[490] backdrop-blur-sm"
            onClick={handleToggle}
          />
        )}
      </AnimatePresence>

      {/* Drawer Cabinet Inner */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 35 }}
            className="fixed top-0 left-0 h-full w-[320px] sm:w-[380px] bg-[#1a1a1c] border-r-[16px] border-zinc-900 border-y-2 border-y-black z-[500] shadow-[30px_0_60px_rgba(0,0,0,0.9)] flex flex-col"
          >
            {/* Drawer Front Edge Detail (left side) */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-zinc-700 via-zinc-800 to-zinc-900 border-r-2 border-ink z-50 shadow-[4px_0_12px_rgba(0,0,0,0.85)] pointer-events-none flex flex-col items-center justify-between py-6">
              <div className="flex flex-col items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-amber-700/75 border border-black flex items-center justify-center"><span className="w-1.5 h-px bg-black/70 rotate-45" /></span>
                <span className="w-2 h-2 rounded-full bg-amber-700/75 border border-black flex items-center justify-center"><span className="w-1.5 h-px bg-black/70 -rotate-12" /></span>
              </div>
              {/* Center Brass Latch / Tumbler */}
              <div className="w-3.5 h-9 rounded-[2px] border border-amber-700/60 bg-zinc-950 shadow-inner flex flex-col items-center justify-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500/70" />
                <span className="w-0.5 h-2.5 bg-zinc-600 rounded-full" />
              </div>
              <div className="flex flex-col items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-amber-700/75 border border-black flex items-center justify-center"><span className="w-1.5 h-px bg-black/70 rotate-12" /></span>
                <span className="w-2 h-2 rounded-full bg-amber-700/75 border border-black flex items-center justify-center"><span className="w-1.5 h-px bg-black/70 -rotate-45" /></span>
              </div>
            </div>

            <div
              className="pl-8 flex flex-col h-full bg-[#111113] shadow-[inset_10px_0_30px_rgba(0,0,0,0.95)] relative"
              style={{
                backgroundImage:
                  'radial-gradient(ellipse 85% 32% at 50% 10%, rgba(255,218,155,0.085) 0%, transparent 72%), repeating-linear-gradient(90deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 18px)',
              }}
            >
              {/* Riveted Steel Cabinet Header */}
              <div className="p-4 bg-gradient-to-b from-zinc-800/95 to-zinc-900/95 border-b-2 border-black shadow-lg relative z-20">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-zinc-400 text-[9px] font-bold tracking-[0.22em] uppercase">
                    ARCHIVE DIVISION · 05 FILES
                  </span>
                  <button
                    type="button"
                    onClick={handleToggle}
                    aria-label="Close file cabinet"
                    className="h-6 w-6 rounded-[2px] border border-zinc-700 bg-zinc-950/80 text-zinc-400 hover:text-amber-200 hover:border-amber-500/50 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Brass-Trimmed Etched Nameplate */}
                <div className="relative bg-gradient-to-b from-[#17171a] to-[#08080a] px-3 py-2 border border-amber-700/45 shadow-[inset_0_2px_8px_rgba(0,0,0,0.95),0_1px_0_rgba(255,255,255,0.06)] flex items-center justify-between">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500/80 border border-black" />
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full border border-amber-600/50 bg-zinc-900 flex items-center justify-center">
                        <span className="w-0.5 h-1.5 bg-amber-400/60" />
                      </span>
                      <h2 className="font-stamp text-sm font-black text-zinc-100 tracking-[0.18em]">
                        FILE CABINET A-4
                      </h2>
                    </div>
                    <span className="font-mono text-[7px] font-bold tracking-[0.26em] text-amber-300/55 uppercase mt-0.5">
                      CASE MMA-2026 // DOSSIERS
                    </span>
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500/80 border border-black" />
                </div>
              </div>

              {/* Suspended Hanging Folders Area */}
              <div className="flex-1 overflow-y-auto px-4 pt-7 pb-10 space-y-5 relative" data-lenis-prevent>
                {/* Steel Cabinet Guide Rails */}
                <div className="absolute left-3 right-3 top-0 bottom-0 pointer-events-none z-0 flex justify-between">
                  <div className="w-2 h-full bg-gradient-to-r from-zinc-600 via-zinc-300 to-zinc-600 shadow-[2px_0_6px_rgba(0,0,0,0.85)]"></div>
                  <div className="w-2 h-full bg-gradient-to-r from-zinc-600 via-zinc-300 to-zinc-600 shadow-[-2px_0_6px_rgba(0,0,0,0.85)]"></div>
                </div>

                {DOSSIERS.map((dossier, index) => {
                  const isActive = location.pathname === dossier.path;
                  const Icon = dossier.icon;
                  return (
                    <motion.div
                      key={dossier.id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: isActive ? 6 : 0, opacity: 1 }}
                      transition={{ delay: index * 0.06 }}
                      onClick={() => handleSelect(dossier.path)}
                      whileHover={{ scale: 1.015, x: isActive ? 10 : 7 }}
                      className={`group/folder relative z-10 cursor-pointer h-[86px] ${dossier.color} rounded-b-[3px] border border-ink/40 overflow-visible flex transform transition-shadow ${isActive
                        ? 'shadow-[0_14px_26px_rgba(0,0,0,0.85)]'
                        : 'shadow-[0_8px_16px_rgba(0,0,0,0.68)] hover:shadow-[0_12px_22px_rgba(0,0,0,0.82)]'
                        }`}
                    >
                      {/* Multi-Sheet Inner Documents Peeking Out & Lifting on Hover */}
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -top-2.5 inset-x-4 h-2.5 bg-[#f7f3e8] border-t border-x border-ink/20 rounded-t-[2px] z-0 transition-transform duration-200 group-hover/folder:-translate-y-1 -rotate-[0.6deg]"
                      />
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -top-1.5 inset-x-3 h-2 bg-[#fcfaf2] border-t border-x border-ink/25 rounded-t-[2px] z-0 transition-transform duration-200 group-hover/folder:-translate-y-0.5 rotate-[0.4deg]"
                      />

                      {/* Right-Edge Category Spine Stripe */}
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none absolute right-0 top-1.5 bottom-0 w-1.5 rounded-br-[2px] ${dossier.spine}`}
                      />

                      {/* Metal Hanging Rod Resting on Rails */}
                      <div className="absolute top-0 left-[-6px] right-[-6px] h-1.5 bg-gradient-to-b from-zinc-200 to-zinc-500 border-b border-ink/45 shadow-[0_2px_4px_rgba(0,0,0,0.55)] z-20">
                        <div className="absolute left-0 top-[-2px] h-2.5 w-4 bg-zinc-300 border border-zinc-600 rounded-[2px] shadow-[inset_1px_1px_1px_rgba(255,255,255,0.5)]"></div>
                        <div className="absolute right-0 top-[-2px] h-2.5 w-4 bg-zinc-300 border border-zinc-600 rounded-[2px] shadow-[inset_1px_1px_1px_rgba(255,255,255,0.5)]"></div>
                      </div>

                      {/* Staggered Manila Folder Index Tab with Clear Plastic Sleeve Sheen */}
                      <div
                        className={`absolute -top-4 h-4 px-2.5 rounded-t-[3px] border border-b-0 border-t-2 border-t-white/60 border-ink/40 ${dossier.color} flex items-center gap-1.5 z-10 shadow-2xs overflow-hidden`}
                        style={{ left: `${14 + (index % 3) * 48}px` }}
                      >
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/45 via-transparent to-black/5"
                        />
                        <span className="relative font-mono text-[8.5px] font-black text-ink/80 tracking-wider">
                          FILE #{dossier.id}
                        </span>
                      </div>

                      {/* Metallic Paperclip on Active Folder */}
                      {isActive && (
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute -top-2.5 right-6 z-30 w-2.5 h-7 rounded-full border-[2px] border-stone-400 shadow-xs"
                        >
                          <div className="absolute inset-x-[1.5px] top-1 bottom-1 rounded-full border border-stone-300" />
                        </div>
                      )}

                      {/* Subtle Horizontal Folder Crease Line */}
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute top-4 inset-x-0 border-t border-ink/10"
                      />

                      <div className="flex w-full mt-2 px-3.5 items-center relative overflow-hidden z-10">
                        <div className="w-10 h-10 rounded-[3px] bg-white/75 flex items-center justify-center border border-ink/20 shadow-xs shrink-0">
                          <Icon strokeWidth={1.6} className="w-4.5 h-4.5 text-ink/85" />
                        </div>
                        <div className="ml-3 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-stamp text-[14px] font-black text-ink tracking-wider truncate">
                              {dossier.label}
                            </span>
                            {isActive && (
                              <span className="shrink-0 font-stamp text-[8px] font-black text-rose-800 bg-rose-50/90 px-1.5 py-0.5 border border-rose-700/60 rounded-[2px] -rotate-2 uppercase tracking-wider">
                                OPEN
                              </span>
                            )}
                          </div>
                          <div className="font-typewriter text-[10.5px] text-ink/65 truncate mt-0.5">
                            {dossier.sub}
                          </div>
                        </div>

                        <ChevronRight className="w-4 h-4 text-ink/35 group-hover/folder:text-ink/80 group-hover/folder:translate-x-0.5 transition-all shrink-0" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Riveted Steel Cabinet Bottom Lip */}
              <div className="shrink-0 px-4 py-2.5 bg-gradient-to-t from-zinc-950 to-zinc-900 border-t-2 border-black flex items-center justify-between font-mono text-[8.5px] font-bold tracking-[0.18em] text-zinc-500 uppercase relative z-20">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600/65 border border-black" />
                  <span>05 / 05 INDEXED</span>
                </span>
                <span className="flex items-center gap-2">
                  <span>ESC TO CLOSE</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600/65 border border-black" />
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

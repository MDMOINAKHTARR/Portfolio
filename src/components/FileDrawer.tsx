import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Folder, Database, Briefcase, FileSearch, Radio } from 'lucide-react';
import { audioEngine } from '../lib/audio';

const DOSSIERS = [
  { id: '01', path: '/', label: 'SUBJECT PROFILE', icon: Folder, color: 'bg-orange-100' },
  { id: '02', path: '/capabilities', label: 'ARSENAL', icon: Database, color: 'bg-stone-200' },
  { id: '03', path: '/operations', label: 'OPERATIONS', icon: Briefcase, color: 'bg-amber-100' },
  { id: '04', path: '/evidence', label: 'EVIDENCE', icon: FileSearch, color: 'bg-yellow-100' },
  { id: '05', path: '/comms', label: 'COMMS', icon: Radio, color: 'bg-red-100' },
];

export function FileDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleToggle = () => {
    if (!isOpen) {
      audioEngine.playDrawer();
    } else {
      audioEngine.playDrawer();
    }
    setIsOpen(!isOpen);
  };

  const handleSelect = (path: string) => {
    audioEngine.playPaper();
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      {/* Drawer Handle / Closed State Peek */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
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
            className="fixed inset-0 bg-ink/60 z-[95] backdrop-blur-sm"
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
            className="fixed top-0 left-0 h-full w-[320px] sm:w-[380px] bg-[#1a1a1c] border-r-[16px] border-zinc-900 border-y-2 border-y-black z-[100] shadow-[30px_0_60px_rgba(0,0,0,0.9)] flex flex-col"
          >
            {/* Drawer Front Edge Detail (left side) */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-zinc-800 border-r-2 border-ink z-50 shadow-[4px_0_10px_rgba(0,0,0,0.8)] pointer-events-none flex flex-col items-center py-8">
               <div className="w-1.5 h-1.5 rounded-full bg-zinc-950 mb-4 shadow-[0_1px_1px_rgba(255,255,255,0.1)]"></div>
               <div className="w-1.5 h-1.5 rounded-full bg-zinc-950 mb-4 shadow-[0_1px_1px_rgba(255,255,255,0.1)]"></div>
               <div className="h-full"></div>
               <div className="w-1.5 h-1.5 rounded-full bg-zinc-950 mt-4 shadow-[0_1px_1px_rgba(255,255,255,0.1)]"></div>
               <div className="w-1.5 h-1.5 rounded-full bg-zinc-950 mt-4 shadow-[0_1px_1px_rgba(255,255,255,0.1)]"></div>
            </div>

            <div className="pl-8 flex flex-col h-full bg-[#111] shadow-[inset_10px_0_30px_rgba(0,0,0,1)] relative">
                {/* Cabinet Header */}
                <div className="p-4 bg-zinc-900/80 border-b border-ink shadow-md relative z-20">
                  <div className="font-mono text-zinc-500 text-[10px] tracking-widest mb-1">SECURE STORAGE DIVISION</div>
                  <h2 className="font-bold text-zinc-300 tracking-widest bg-[#0a0a0c] p-2 border border-zinc-800 text-center shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)]">FILE CABINET A-4</h2>
                </div>

                {/* Suspended Files Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 pt-12 relative pb-20">
                  {/* Cabinet guide rails */}
                  <div className="absolute left-3 right-3 top-0 bottom-0 pointer-events-none z-0 flex justify-between">
                    <div className="w-2 h-full bg-gradient-to-r from-zinc-500 via-zinc-300 to-zinc-500 shadow-[2px_0_5px_rgba(0,0,0,0.8)]"></div>
                    <div className="w-2 h-full bg-gradient-to-r from-zinc-500 via-zinc-300 to-zinc-500 shadow-[-2px_0_5px_rgba(0,0,0,0.8)]"></div>
                  </div>

                  {DOSSIERS.map((dossier, index) => {
                    const isActive = location.pathname === dossier.path;
                    const Icon = dossier.icon;
                    return (
                      <motion.div
                        key={dossier.id}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.08 }}
                        onClick={() => handleSelect(dossier.path)}
                        whileHover={{ scale: 1.02, x: 10 }}
                        className={`relative z-10 cursor-pointer h-20 ${dossier.color} rounded-b border border-ink/30 overflow-hidden flex transform transition-colors ${isActive ? 'ring-2 ring-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'shadow-[0_8px_15px_rgba(0,0,0,0.6)]'}`}
                      >
                        {/* Metal Hanging Rod */}
                        <div className="absolute top-0 left-[-6px] right-[-6px] h-1.5 bg-gradient-to-b from-zinc-300 to-zinc-500 border-b border-ink/40 shadow-[0_2px_4px_rgba(0,0,0,0.5)] z-20">
                          <div className="absolute left-0 top-[-2px] h-2.5 w-4 bg-zinc-400 border border-zinc-500 rounded shadow-[inset_1px_1px_1px_rgba(255,255,255,0.4)]"></div>
                          <div className="absolute right-0 top-[-2px] h-2.5 w-4 bg-zinc-400 border border-zinc-500 rounded shadow-[inset_1px_1px_1px_rgba(255,255,255,0.4)]"></div>
                        </div>
                        
                        {/* Plastic Tab */}
                        <div className="absolute top-1.5 right-6 bg-paper/70 backdrop-blur-md border border-white/80 w-24 h-5 rounded-t-sm shadow-sm flex items-center justify-center z-10 transform -skew-x-[15deg]">
                           <span className="font-mono text-[9px] font-bold text-ink/80 transform skew-x-[15deg]">CASE #{dossier.id}</span>
                        </div>

                        <div className="flex w-full mt-4 px-4 items-center bg-ink/5 h-full relative">
                          <div className="w-10 h-10 rounded bg-paper/50 flex items-center justify-center border border-ink/10 shadow-sm mix-blend-multiply">
                            <Icon strokeWidth={1.5} className="w-5 h-5 text-ink/80" />
                          </div>
                          <div className="ml-4 flex-1">
                            <div className="font-stamp text-[14px] font-bold text-ink/90 tracking-widest">{dossier.label}</div>
                            {isActive && <div className="font-mono text-[8px] text-red-700 font-bold bg-paper/50 px-1 inline-block mt-0.5 border border-red-500/20">ACTIVE FILE</div>}
                          </div>

                          {/* File texture lines */}
                          <div className="absolute right-2 top-0 bottom-0 w-12 flex space-x-1 opacity-20 pointer-events-none">
                            <div className="w-px h-full bg-ink/50"></div>
                            <div className="w-px h-full bg-ink/50"></div>
                            <div className="w-px h-full bg-ink/50"></div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

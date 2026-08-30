import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { audioEngine } from '../lib/audio';

export function DeskComicWidget() {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    audioEngine.init();
    audioEngine.playClick();
  };

  return (
    <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40 print:hidden select-none">
      <Link
        to="/classified"
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative flex items-end block cursor-pointer"
        title="Open The Spider-Verse Origin Comic (Issue #001)"
      >
        {/* Floating Tooltip Hint */}
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ 
            opacity: isHovered ? 1 : 0, 
            y: isHovered ? 0 : 10,
            scale: isHovered ? 1 : 0.9 
          }}
          transition={{ duration: 0.2 }}
          className="absolute -top-12 right-0 pointer-events-none whitespace-nowrap bg-black text-[#ffe600] font-mono text-[10px] font-black uppercase px-3 py-1 border-2 border-[#ffe600] rounded-xs shadow-[3px_3px_0_#000] flex items-center gap-1.5"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
          <span>READ ORIGIN COMIC (ISSUE #001)</span>
          <ArrowRight className="w-3 h-3 text-white" />
        </motion.div>

        {/* Physical 3D Comic Book */}
        <motion.div
          animate={{
            rotate: isHovered ? 0 : -6,
            scale: isHovered ? 1.08 : 1,
            y: isHovered ? -8 : 0
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="relative w-20 sm:w-24 md:w-28 aspect-[2/3] rounded-xs border-2 sm:border-3 border-stone-950 bg-stone-900 shadow-[10px_14px_28px_rgba(0,0,0,0.7),4px_6px_0_rgba(0,0,0,0.8)] overflow-hidden"
        >
          {/* Cover Art */}
          <img
            src="/moin cover.png"
            alt="The Amazing Moin Akhtar Comic"
            className="w-full h-full object-cover contrast-105 saturate-105"
          />

          {/* Comic Spine highlight */}
          <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-gradient-to-r from-white/30 via-transparent to-black/40 pointer-events-none" />

          {/* Top Yellow Corner Tag */}
          <div className="absolute top-1 left-1 bg-[#ffe600] text-black font-mono text-[5.5px] sm:text-[6.5px] font-black px-1 py-0.2 border border-black rounded-2xs shadow-2xs">
            #001
          </div>

          {/* Bottom Red Clearance Seal */}
          <div className="absolute bottom-1 right-1 bg-rose-600 text-white font-mono text-[5px] sm:text-[6px] font-black px-1 py-0.2 uppercase border border-black rounded-2xs shadow-2xs">
            ORIGIN
          </div>

          {/* Halftone Dot Overlay */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-15 mix-blend-overlay"
            style={{
              backgroundImage: 'radial-gradient(#000 1.5px, transparent 1.5px)',
              backgroundSize: '6px 6px'
            }}
          />
        </motion.div>

        {/* Comic Ribbon Bookmark */}
        <div className="absolute -top-2.5 right-3 w-4 h-6 bg-rose-700 border-x border-t border-black shadow-xs rounded-t-2xs z-20 flex items-center justify-center">
          <Sparkles className="w-2.5 h-2.5 text-[#ffe600] animate-pulse" />
        </div>
      </Link>
    </div>
  );
}

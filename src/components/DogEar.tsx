import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useLocation } from 'react-router-dom';
import { Key, Vault, Fingerprint } from 'lucide-react';
import { audioEngine } from '../lib/audio';
import { useTheme } from '../context/ThemeContext';

export function DogEar() {
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();
  const { theme } = useTheme();

  const getMeta = () => {
    if (location.pathname === '/') return 'TARGET: ALPHA';
    if (location.pathname === '/capabilities') return 'LEVEL: SECURE';
    if (location.pathname === '/operations') return 'STATUS: ACTIVE';
    if (location.pathname === '/evidence') return 'VAULT: OPEN';
    return 'META: LOGGED';
  };

  const handleHover = (hover: boolean) => {
    if (hover !== isHovered) {
      audioEngine.playPaper();
      setIsHovered(hover);
    }
  };

  const size = isHovered ? 120 : 40; 

  return (
    <div className="absolute top-0 right-0 w-32 h-32 z-[60] pointer-events-none flex justify-end">
      {/* Interactive hit area */}
      <div 
         className="absolute top-0 right-0 w-24 h-24 pointer-events-auto cursor-pointer z-50 rounded-bl-full"
         onMouseEnter={() => handleHover(true)}
         onMouseLeave={() => handleHover(false)}
         onClick={() => handleHover(!isHovered)}
      />

      {/* Hidden metadata hole */}
      <motion.div 
        className="absolute top-0 right-0 bg-zinc-900 shadow-[inset_4px_4px_15px_rgba(0,0,0,1)] flex flex-col items-end border-b border-l border-zinc-950"
        animate={{
          width: size,
          height: size,
          clipPath: `polygon(100% 0, 100% 100%, 0 0)`
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
        {/* Fixed size inner container so content doesn't reflow */}
        <div className="w-[120px] h-[120px] absolute top-0 right-0 flex flex-col items-end pt-3 pr-2">
           <div className="flex items-center gap-1 text-[9px] font-mono text-zinc-500 mb-2 border-b border-zinc-800 pb-1 w-full justify-end">
               <Vault className="w-3 h-3" /> ARCHIVE
           </div>
           <div className="text-[10px] font-stamp text-red-600/90 uppercase tracking-widest mb-1.5 flex items-center gap-1">
              <Fingerprint className="w-3 h-3" /> DECRYPTED
           </div>
           <div className="text-[9px] font-mono text-emerald-500/90 mb-1 font-bold tracking-tight text-right w-full">
              {getMeta()}
           </div>
           <div className="flex items-center gap-1 text-[8px] font-mono text-zinc-400 opacity-60">
             <Key className="w-2.5 h-2.5" /> ID: 9X4-B
           </div>
        </div>
        {/* Grunge overlay for the hole */}
        <div className="absolute inset-0 bg-gradient-to-bl from-ink/80 to-transparent pointer-events-none"></div>
      </motion.div>

      {/* Flap Wrapper for Drop Shadow */}
      <motion.div
        className="absolute pointer-events-none"
        style={{ filter: 'drop-shadow(-4px 4px 6px rgba(0,0,0,0.5))' }}
        animate={{
           top: 0,
           right: 0,
           width: size,
           height: size,
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
         {/* The Flap Edge / Back of paper */}
         <div 
           className="w-full h-full bg-doc"
           style={{ 
              clipPath: `polygon(0 0, 100% 100%, 0 100%)`,
           }}
         >
            {/* Paper texture and shading */}
            <div className="absolute inset-0 bg-texture opacity-[0.4] pointer-events-none mix-blend-multiply" />
            <div className="absolute inset-0 bg-gradient-to-bl from-ink/20 via-transparent to-white/30 mix-blend-overlay" />
         </div>
      </motion.div>
    </div>
  );
}

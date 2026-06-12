import React from 'react';
import { motion } from 'motion/react';

export function BackgroundElements() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden print:hidden">
      {/* Wood Texture Background */}
      <div 
        className="absolute inset-0 z-0 opacity-40 mix-blend-multiply"
        style={{
          backgroundImage: `url("https://www.transparenttextures.com/patterns/wood-pattern.png")`,
          backgroundRepeat: 'repeat'
        }}
      />
      
      {/* Subtle vignette/shadow around the edges of the desk */}
      <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.5)] z-0" />
      
      {/* Texture overlay */}
      <div className="absolute inset-0 bg-texture mix-blend-overlay opacity-30 z-0" />

      {/* Decorative minimalistic lines / framing */}
      <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-slate-500/20 z-0" />
      <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-slate-500/20 z-0" />
      <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-slate-500/20 z-0" />
      <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-slate-500/20 z-0" />

      {/* Subtle classified watermark */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.03 }}
        transition={{ duration: 2 }}
        className="absolute bottom-12 left-12 font-stamp text-6xl md:text-8xl text-ink tracking-widest transform -rotate-12 select-none z-0"
      >
        TOP SECRET
      </motion.div>

      {/* Coordinates / Meta text */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 font-typewriter text-[10px] text-slate-500/30 tracking-[0.2em] uppercase select-none z-0">
        SYS.REQ // DIRECTIVE: ARCHIVE
      </div>
    </div>
  );
}


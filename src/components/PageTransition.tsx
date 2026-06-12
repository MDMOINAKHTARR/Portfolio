import { motion } from 'motion/react';
import React from 'react';

export const PageTransition = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
      className={`row-start-1 col-start-1 flex flex-col relative w-full h-full will-change-[opacity,transform] ${className}`}
    >
      {/* Base Paper Background to hide underlaying exiting page */}
      <div className="absolute [-inset-x-0] [-inset-y-0] pointer-events-none -z-20 bg-doc bg-texture" />
      
      {/* Darkening overlay for exiting page simulating the shadow cast by the flip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0 }}
        exit={{ opacity: 0.4 }}
        transition={{ duration: 0.6 }}
        className="absolute [-inset-x-0] [-inset-y-0] pointer-events-none -z-10 bg-black/80"
      />
      {children}
    </motion.div>
  );
};

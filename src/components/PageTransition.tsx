import { motion } from 'motion/react';
import React from 'react';

export const PageTransition = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        y: "80%", 
        scale: 1.05, 
        rotateX: -40,
        z: 300,
        zIndex: 50,
        filter: 'drop-shadow(0px -30px 40px rgba(0,0,0,0.6))'
      }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        scale: 1, 
        rotateX: 0,
        z: 0,
        zIndex: 40,
        filter: 'drop-shadow(0px 0px 0px rgba(0,0,0,0))'
      }}
      exit={{ 
        opacity: 0, 
        y: "-10%", 
        scale: 0.85,
        rotateX: 20,
        z: -300,
        zIndex: 10,
        filter: 'drop-shadow(0px 30px 20px rgba(0,0,0,0.2))'
      }}
      transition={{ 
        duration: 0.8, 
        ease: [0.16, 1, 0.3, 1] 
      }}
      style={{ transformOrigin: "50% 100%", transformPerspective: 2000 }}
      className={`row-start-1 col-start-1 flex flex-col relative w-full h-full transform-gpu ${className}`}
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

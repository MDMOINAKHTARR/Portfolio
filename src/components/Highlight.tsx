import React from 'react';

const COLORS = {
  yellow: "text-amber-300",
  blue: "text-sky-300",
  pink: "text-pink-300",
  green: "text-emerald-300",
  red: "text-red-500",
  ink: "text-ink",
};

export function Highlight({ 
  children, 
  className = "",
  style = "marker", 
  color = "yellow"
}: { 
  children: React.ReactNode, 
  className?: string,
  style?: "marker" | "circle" | "underline" | "squiggly",
  color?: keyof typeof COLORS
}) {
  const isString = typeof children === 'string';
  // Deterministic pseudo-random based on text length to vary the SVG path slightly
  const hash = isString ? children.length : 5;
  const cColor = COLORS[color];
  
  return (
    <span className={`relative inline-block sm:whitespace-nowrap whitespace-normal ${className}`}>
      <span className="relative z-10 font-bold">{children}</span>
      
      {style === "marker" && (
        <svg className={`absolute inset-0 w-[calc(100%+8px)] h-[calc(100%+4px)] -left-1 -top-0.5 mix-blend-multiply opacity-60 pointer-events-none z-0 ${cColor}`} preserveAspectRatio="none" viewBox="0 0 100 100">
           {hash % 2 === 0 ? (
              <path d="M2,15 Q50,5 98,18 L99,85 Q50,95 1,82 Z" fill="currentColor" />
           ) : (
              <path d="M1,20 Q50,10 99,15 L98,80 Q50,90 2,85 Z" fill="currentColor" />
           )}
        </svg>
      )}

      {style === "circle" && (
        <svg className={`hidden sm:block absolute inset-0 w-[calc(100%+16px)] h-[calc(100%+12px)] -left-2 -top-1.5 pointer-events-none z-10 opacity-70 ${cColor}`} preserveAspectRatio="none" viewBox="0 0 100 100">
          <ellipse cx="50" cy="50" rx="46" ry="40" fill="none" stroke="currentColor" strokeWidth={hash % 2 === 0 ? "3" : "4"} strokeLinecap="round" transform={hash % 2 === 0 ? "rotate(-2 50 50)" : "rotate(1 50 50)"} className="opacity-80" />
        </svg>
      )}

      {style === "underline" && (
        <svg className={`absolute w-[calc(100%+10px)] h-[12px] -bottom-[2px] -left-1 pointer-events-none z-10 opacity-80 ${cColor}`} preserveAspectRatio="none" viewBox="0 0 100 20">
           <path d={hash % 2 === 0 ? "M2,15 Q50,5 98,12" : "M2,10 Q50,15 98,8"} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="opacity-80" />
        </svg>
      )}
      
      {style === "squiggly" && (
        <svg className={`absolute w-[calc(100%+6px)] h-[12px] -bottom-[2px] -left-[3px] pointer-events-none z-10 opacity-80 ${cColor}`} preserveAspectRatio="none" viewBox="0 0 100 20">
           <path d="M0,10 Q10,0 20,10 T40,10 T60,10 T80,10 T100,10" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )}
    </span>
  );
}

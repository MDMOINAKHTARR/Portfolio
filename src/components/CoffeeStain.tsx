import React from 'react';
export function CoffeeStain({ className = "", style = {} }: { className?: string, style?: React.CSSProperties, key?: React.Key }) {
  return (
    <div className={`pointer-events-none absolute z-10 ${className}`} style={style}>
      {/* Outer blurred ring of the stain */}
      <div 
        className="w-32 h-32 md:w-48 md:h-48 rounded-full border-[5px] border-[var(--color-coffee)] opacity-15 mix-blend-multiply flex items-center justify-center transition-colors" 
        style={{ filter: "blur(0.5px) url(#displacement)" }}
      >
        {/* Inner pooling of the coffee */}
        <div className="w-28 h-28 md:w-[150px] md:h-[150px] rounded-full border-[2px] border-[var(--color-coffee-inner)] opacity-20 transition-colors" />
      </div>
      
      {/* Splatters */}
      <div className="absolute top-4 left-8 w-3 h-3 rounded-full bg-[var(--color-coffee)] opacity-15 mix-blend-multiply blur-[1px] transition-colors"></div>
      <div className="absolute top-20 -right-2 w-5 h-5 rounded-full bg-[var(--color-coffee)] opacity-10 mix-blend-multiply blur-[2px] transition-colors"></div>

      {/* SVG filter for organic coffee ring wobbly distortion */}
      <svg className="hidden">
        <filter id="displacement">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
    </div>
  );
}

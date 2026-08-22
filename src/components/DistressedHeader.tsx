import React from 'react';

export function DistressedHeader() {
  return (
    <div className="absolute top-0 left-0 right-0 h-48 sm:h-64 pointer-events-none z-10 opacity-70 mix-blend-multiply transition-opacity duration-500">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <defs>
          <filter id="agedPaper" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="3" result="noise" />
            <feColorMatrix type="matrix" values="1 0 0 0 0  0 0.95 0 0 0  0 0.85 0 0 0  0 0 0 0.1 0" in="noise" result="coloredNoise" />
            <feBlend mode="multiply" in="SourceGraphic" in2="coloredNoise" />
          </filter>
          <filter id="foldMap" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.02 0.08" numOctaves="2" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
        
        {/* Base distressed texture overlay */}
        <rect width="100%" height="100%" fill="transparent" filter="url(#agedPaper)" />
        
        {/* Fold lines with displacement map for an organic, hand-folded look */}
        <g filter="url(#foldMap)" opacity="0.6">
          {/* Vertical fold */}
          <line x1="33%" y1="0" x2="33%" y2="100%" stroke="black" strokeWidth="1.5" strokeOpacity="0.12" />
          <line x1="33.2%" y1="0" x2="33.2%" y2="100%" stroke="white" strokeWidth="1.5" strokeOpacity="0.3" />
          
          {/* Horizontal crease */}
          <line x1="0" y1="30%" x2="100%" y2="30%" stroke="black" strokeWidth="1" strokeOpacity="0.08" />
          <line x1="0" y1="30.2%" x2="100%" y2="30.2%" stroke="white" strokeWidth="1" strokeOpacity="0.2" />

          {/* Slight angled fold on the right */}
          <line x1="85%" y1="0" x2="82%" y2="100%" stroke="black" strokeWidth="1" strokeOpacity="0.06" />
          <line x1="85.2%" y1="0" x2="82.2%" y2="100%" stroke="white" strokeWidth="1" strokeOpacity="0.15" />
        </g>
      </svg>
      
      {/* Edge gradient to fade out the effect smoothly downwards */}
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-doc to-transparent border-none mix-blend-normal"></div>
    </div>
  );
}

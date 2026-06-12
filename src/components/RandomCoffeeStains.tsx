import React, { useState, useEffect } from 'react';
import { CoffeeStain } from './CoffeeStain';

export function RandomCoffeeStains() {
  const [stains, setStains] = useState<{ id: number; x: number; y: number; rotation: number; scale: number; opacity: number }[]>([]);

  useEffect(() => {
    // Generate 1-4 random stains
    const numStains = Math.floor(Math.random() * 4) + 1;
    const newStains = [];
    
    for (let i = 0; i < numStains; i++) {
        // Randomize position across the document, allowing stains to overlap edges
        newStains.push({
            id: i,
            x: Math.random() * 100, // 0% to 100% width
            y: Math.random() * 100, // 0% to 100% height
            rotation: Math.random() * 360,
            scale: 0.6 + Math.random() * 0.8, // 0.6 to 1.4 scale
            opacity: 0.4 + Math.random() * 0.6 // 0.4 to 1.0 (relative to base opacity)
        });
    }
    setStains(newStains);
  }, []);

  return (
    <>
      {/* Single shared SVG filter definition — all CoffeeStain instances reference this via url(#stain-displacement) */}
      <svg className="absolute w-0 h-0 overflow-hidden" aria-hidden="true">
        <defs>
          <filter id="stain-displacement">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-b-sm rounded-tr-sm z-10 print:hidden mix-blend-multiply">
        {stains.map((stain) => (
          <CoffeeStain 
            key={stain.id}
            style={{
               left: `${stain.x}%`,
               top: `${stain.y}%`,
               transform: `translate(-50%, -50%) rotate(${stain.rotation}deg) scale(${stain.scale})`,
               opacity: stain.opacity,
            }}
          />
        ))}
      </div>
    </>
  );
}

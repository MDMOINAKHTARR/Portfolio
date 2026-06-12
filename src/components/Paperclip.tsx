import React from 'react';

export function Paperclip({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute pointer-events-none z-50 ${className}`}>
      <svg width="40" height="90" viewBox="0 0 40 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-md">
        {/* Shadow */}
        <path d="M22 15V70C22 75.5228 17.5228 80 12 80C6.47715 80 2 75.5228 2 70V25C2 21.6863 4.68629 19 8 19C11.3137 19 14 21.6863 14 25V65" stroke="rgba(0,0,0,0.3)" strokeWidth="4" strokeLinecap="round" className="transform translate-x-[2px] translate-y-[2px]" />
        
        {/* Metal link */}
        <path d="M22 15V70C22 75.5228 17.5228 80 12 80C6.47715 80 2 75.5228 2 70V25C2 21.6863 4.68629 19 8 19C11.3137 19 14 21.6863 14 25V65" stroke="url(#metal)" strokeWidth="4" strokeLinecap="round" />
        
        <defs>
          <linearGradient id="metal" x1="0" y1="0" x2="24" y2="0" gradientUnits="userSpaceOnUse">
            <stop stopColor="#b0bec5" />
            <stop offset="0.3" stopColor="#eceff1" />
            <stop offset="0.7" stopColor="#78909c" />
            <stop offset="1" stopColor="#cfd8dc" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { audioEngine } from '../lib/audio';

export function AudioToggle() {
  const [isMuted, setIsMuted] = useState(audioEngine.isMuted);

  const toggleAudio = () => {
    audioEngine.init(); // Just in case it wasn't initialized
    audioEngine.toggleMute();
    setIsMuted(audioEngine.isMuted);
  };

  return (
    <button
      onClick={toggleAudio}
      className="hidden sm:block absolute top-[120px] right-12 z-[200] group outline-none"
      title={isMuted ? "Unmute Sound Effects" : "Mute Sound Effects"}
    >
      <div className="relative transform transition-all duration-300 hover:scale-105 hover:rotate-2">
        {/* Masking tape piece */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-4 bg-tape opacity-90 rotate-[8deg] shadow-sm z-10 
          before:absolute before:content-[''] before:-left-[2px] before:w-1 before:h-full before:bg-tape
          after:absolute after:content-[''] after:-right-[2px] after:w-1 after:h-full after:bg-tape"
          style={{ clipPath: 'polygon(0% 5%, 95% 0%, 100% 95%, 5% 100%)' }} />
        
        {/* Tag */}
        <div className="bg-paper border border-folder-dark/40 px-3 py-2 sm:px-4 sm:py-2.5 shadow-[2px_3px_5px_rgba(0,0,0,0.3)] transform -rotate-2 relative overflow-hidden transition-colors">
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] mix-blend-multiply pointer-events-none"></div>

          <div className="flex flex-col items-center gap-1 relative z-10">
            <span className="font-typewriter text-[8px] sm:text-[9px] text-ink/70 font-bold uppercase tracking-[0.1em] border-b-[1px] border-border/20 w-full text-center pb-0.5 mb-1 transition-colors">
              Surveillance
            </span>
            <div className={`flex items-center gap-2 transition-colors ${!isMuted ? 'text-stamp' : 'text-ink/40'}`}>
               {!isMuted ? 
                 <Volume2 className="w-5 h-5" strokeWidth={2.5} /> : 
                 <VolumeX className="w-5 h-5" strokeWidth={2} />
               }
            </div>
            <span className="font-stamp text-[10px] text-ink/80 font-bold uppercase mt-1 transition-colors">
                AUDIO
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

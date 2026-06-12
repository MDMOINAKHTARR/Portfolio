import React from 'react';
import { Github, Linkedin, Twitter, Code2, FileText, Link as LinkIcon } from 'lucide-react';
import { audioEngine } from '../lib/audio';

const SOCIAL_LINKS = [
  { id: 'resume', label: 'DOSSIER[CV]', stamp: 'REF', icon: FileText, url: '/CV.pdf' },
  { id: 'linkedin', label: 'LINKEDIN', stamp: 'NET', icon: Linkedin, url: 'https://www.linkedin.com/in/mdmoinakhtar/' },
  { id: 'github', label: 'GITHUB', stamp: 'GIT', icon: Github, url: 'https://github.com/MDMOINAKHTARR' },
  { id: 'leetcode', label: 'LEETCODE', stamp: 'LTC', icon: Code2, url: 'https://leetcode.com/u/__moinn_/' },
  { id: 'x', label: 'X-COMMS', stamp: 'COM', icon: Twitter, url: 'https://x.com/___moinn_' },
];

export function SocialSidebar() {
  const handleHover = () => {
     audioEngine.playPaper();
  };

  return (
    <div className="hidden sm:flex fixed right-0 top-1/3 flex-col items-end gap-3 z-[85] pointer-events-none">
      {SOCIAL_LINKS.map((link, index) => (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={handleHover}
          className="group pointer-events-auto flex items-center relative transition-transform duration-300 ease-out translate-x-[calc(100%-48px)] hover:translate-x-0 outline-none"
        >
          {/* Drop shadow / physical edge */}
          <div className="absolute inset-0 bg-black/40 translate-y-[3px] translate-x-[2px] blur-[3px] pointer-events-none rounded-l-sm" />
          
          {/* Paper body */}
          <div className="bg-paper border-y-[1.5px] border-l-[1.5px] border-ink/40 flex items-center h-[52px] w-[220px] relative overflow-hidden shadow-[inset_0_2px_10px_rgba(0,0,0,0.03)] rounded-l-md">
             <div className="absolute inset-0 bg-texture opacity-[0.25] pointer-events-none mix-blend-multiply" />
             
             {/* Icon container (the part that peeks out) */}
             <div className="w-[48px] h-full flex items-center justify-center shrink-0 border-r-[1.5px] border-ink/20 bg-ink/[0.04] relative z-10 group-hover:bg-ink/[0.08] transition-colors">
               <link.icon className="w-[20px] h-[20px] text-ink/70 group-hover:text-ink transition-colors drop-shadow-sm" strokeWidth={1.5} />
             </div>

             {/* Text Content */}
             <div className="flex-1 px-3 py-1 flex flex-col justify-center relative z-10">
                <span className="font-stamp text-[14px] font-bold text-ink/90 tracking-widest leading-none mt-1 group-hover:text-ink transition-colors">
                  {link.label}
                </span>
                <div className="flex items-center gap-2 mt-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    <span className="font-mono text-[9px] text-ink font-bold tracking-wider">ID:{link.stamp}</span>
                    <div className="flex-1 border-b border-dashed border-ink/40"></div>
                    <LinkIcon className="w-2.5 h-2.5 text-ink/60 mr-1" />
                </div>
             </div>
             
             {/* Red stamp accent */}
             <div className="absolute right-2 top-1.5 border border-stamp/50 text-stamp font-stamp text-[8px] transform rotate-[-12deg] px-1 rounded-sm opacity-0 group-hover:opacity-[0.85] transition-opacity duration-300 delay-100 backdrop-blur-sm bg-paper/50">
                SECURE
             </div>
          </div>
        </a>
      ))}
    </div>
  );
}

import React from 'react';
import { 
  SiPython, SiC, SiHtml5, SiCss, SiJavascript, SiReact, SiMysql,
  SiEclipseide, SiJupyter, SiGit, SiGithub,
  SiExpress, SiNodedotjs, SiSupabase, SiNextdotjs, SiTailwindcss, SiMaterialdesign, SiTypescript,
  SiFirebase, SiOpenai, SiGooglegemini
} from 'react-icons/si';
import { FaJava } from 'react-icons/fa';
import { VscVscode } from 'react-icons/vsc';
import { MousePointer2 } from 'lucide-react'; 

const row1 = [
  { name: 'Python', icon: SiPython, color: '#3776AB' },
  { name: 'Java', icon: FaJava, color: '#007396' },
  { name: 'C', icon: SiC, color: '#A8B9CC' },
  { name: 'HTML', icon: SiHtml5, color: '#E34F26' },
  { name: 'CSS', icon: SiCss, color: '#1572B6' },
  { name: 'JavaScript', icon: SiJavascript, color: '#F7DF1E' },
  { name: 'TypeScript', icon: SiTypescript, color: '#3178C6' },
  { name: 'Firebase', icon: SiFirebase, color: '#FFCA28' },
];

const row2 = [
  { name: 'React', icon: SiReact, color: '#61DAFB' },
  { name: 'Next.js', icon: SiNextdotjs, color: 'var(--color-ink)' },
  { name: 'Node.js', icon: SiNodedotjs, color: '#339933' },
  { name: 'Express.js', icon: SiExpress, color: 'var(--color-ink)' },
  { name: 'SQL', icon: SiMysql, color: '#4479A1' },
  { name: 'Supabase', icon: SiSupabase, color: '#3ECF8E' },
  { name: 'Tailwind CSS', icon: SiTailwindcss, color: '#06B6D4' },
  { name: 'OpenAI', icon: SiOpenai, color: 'var(--color-ink)' },
];

const row3 = [
  { name: 'Material Design', icon: SiMaterialdesign, color: '#757575' },
  { name: 'VS Code', icon: VscVscode, color: '#007ACC' },
  { name: 'Eclipse', icon: SiEclipseide, color: '#2C2255' },
  { name: 'Jupyter Notebook', icon: SiJupyter, color: '#F37626' },
  { name: 'Cursor', icon: MousePointer2, color: 'var(--color-ink)' },
  { name: 'Git', icon: SiGit, color: '#F05032' },
  { name: 'GitHub', icon: SiGithub, color: 'var(--color-ink)' },
  { name: 'Gemini', icon: SiGooglegemini, color: '#8E75B2' },
];

const MarqueeRow = ({ items, reverse = false, speed = 20 }: { items: any[], reverse?: boolean, speed?: number }) => {
  return (
    <div className="flex overflow-hidden group select-none flex-nowrap" style={{ maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)' }}>
      <div 
        className={`flex shrink-0 items-center gap-4 min-w-full pb-3 ${reverse ? 'animate-marquee-reverse' : 'animate-marquee'} group-hover:[animation-play-state:paused]`}
        style={{ animationDuration: `${speed}s` }}
      >
        {items.map((item, i) => (
          <div key={`${item.name}-${i}`} className="flex items-center gap-2 px-4 py-2 bg-paper border border-ink/20 rounded-full shadow-sm mx-2 -mb-2">
            <item.icon className="w-5 h-5 shrink-0" style={{ color: item.color }} />
            <span className="font-mono text-xs font-bold text-ink whitespace-nowrap">{item.name}</span>
          </div>
        ))}
        {items.map((item, i) => (
          <div key={`repeat1-${item.name}-${i}`} className="flex items-center gap-2 px-4 py-2 bg-paper border border-ink/20 rounded-full shadow-sm mx-2 -mb-2">
            <item.icon className="w-5 h-5 shrink-0" style={{ color: item.color }} />
            <span className="font-mono text-xs font-bold text-ink whitespace-nowrap">{item.name}</span>
          </div>
        ))}
        {items.map((item, i) => (
          <div key={`repeat2-${item.name}-${i}`} className="flex items-center gap-2 px-4 py-2 bg-paper border border-ink/20 rounded-full shadow-sm mx-2 -mb-2">
            <item.icon className="w-5 h-5 shrink-0" style={{ color: item.color }} />
            <span className="font-mono text-xs font-bold text-ink whitespace-nowrap">{item.name}</span>
          </div>
        ))}
      </div>
      <div 
        className={`flex shrink-0 items-center gap-4 min-w-full pb-3 ${reverse ? 'animate-marquee-reverse' : 'animate-marquee'} group-hover:[animation-play-state:paused]`}
        style={{ animationDuration: `${speed}s` }}
        aria-hidden="true"
      >
        {items.map((item, i) => (
          <div key={`${item.name}-${i}-2`} className="flex items-center gap-2 px-4 py-2 bg-paper border border-ink/20 rounded-full shadow-sm mx-2 -mb-2">
            <item.icon className="w-5 h-5 shrink-0" style={{ color: item.color }} />
            <span className="font-mono text-xs font-bold text-ink whitespace-nowrap">{item.name}</span>
          </div>
        ))}
        {items.map((item, i) => (
          <div key={`repeat1-${item.name}-${i}-2`} className="flex items-center gap-2 px-4 py-2 bg-paper border border-ink/20 rounded-full shadow-sm mx-2 -mb-2">
            <item.icon className="w-5 h-5 shrink-0" style={{ color: item.color }} />
            <span className="font-mono text-xs font-bold text-ink whitespace-nowrap">{item.name}</span>
          </div>
        ))}
        {items.map((item, i) => (
          <div key={`repeat2-${item.name}-${i}-2`} className="flex items-center gap-2 px-4 py-2 bg-paper border border-ink/20 rounded-full shadow-sm mx-2 -mb-2">
            <item.icon className="w-5 h-5 shrink-0" style={{ color: item.color }} />
            <span className="font-mono text-xs font-bold text-ink whitespace-nowrap">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export function SkillsCarousel() {
  return (
    <div className="w-full flex flex-col gap-3 py-2 relative overflow-hidden">
      <MarqueeRow items={row1} speed={60} reverse={false} />
      <MarqueeRow items={row2} speed={60} reverse={true} />
      <MarqueeRow items={row3} speed={60} reverse={false} />
    </div>
  );
}

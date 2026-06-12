import { QrCode, Folder, Lock, Grid, User, BarChart, Shield, Sun, Moon, Terminal, Briefcase, Award, Mail, Volume2, VolumeX, Github, Twitter, Linkedin, FileText, Code } from 'lucide-react';
import { Outlet, useLocation, Link, useOutlet, useNavigate } from 'react-router-dom';

const XIcon = (props: React.ComponentProps<'svg'>) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="none"
    className={props.className}
    {...props}
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

import { ClassifiedStamp } from './Stamps';
import { Paperclip } from './Paperclip';
import { RandomCoffeeStains } from './RandomCoffeeStains';
import { BackgroundElements } from './BackgroundElements';
import { ThemeToggle } from './ThemeToggle';
import { AudioToggle } from './AudioToggle';
import { audioEngine } from '../lib/audio';
import { FileDrawer } from './FileDrawer';
import { SocialSidebar } from './SocialSidebar';
import { DogEar } from './DogEar';
import { DistressedHeader } from './DistressedHeader';
import { NavTypewriter } from './NavTypewriter';
import { useState, useEffect } from 'react';
import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useTheme } from '../context/ThemeContext';

export function Layout() {
  const location = useLocation();
  const outlet = useOutlet();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [caseId, setCaseId] = useState('');
  const [timestamp, setTimestamp] = useState('');
  const [isMuted, setIsMuted] = useState(audioEngine.isMuted);
  const [visits, setVisits] = useState(0);
  const [uniqueVisits, setUniqueVisits] = useState(0);

  useEffect(() => {
    const trackVisit = async () => {
      try {
        // Check for owner flag in URL or dev environment to skip tracking
        const urlParams = new URLSearchParams(window.location.search);
        const isDev = window.location.hostname === 'localhost' || window.location.hostname.includes('ais-dev-');
        
        if (urlParams.get('owner') === 'true' || isDev) {
          localStorage.setItem('isOwner', 'true');
        }

        if (localStorage.getItem('isOwner') === 'true') {
          // Just fetch the stats without incrementing
          const res = await fetch('/api/system-status');
          if (res.ok) {
            const contentType = res.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              const data = await res.json();
              setVisits(data.totalVisits);
              setUniqueVisits(data.uniqueVisitors);
            }
          }
          return;
        }

        const isNewVisitor = !localStorage.getItem('hasVisitedBefore');
        if (isNewVisitor) {
          localStorage.setItem('hasVisitedBefore', 'true');
        }
        
        const res = await fetch('/api/system-status/ping', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isNewVisitor })
        });
        
        if (res.ok) {
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await res.json();
            setVisits(data.totalVisits);
            setUniqueVisits(data.uniqueVisitors);
          }
        }
      } catch (err) {
        // Silently ignore ping errors
      }
    };
    trackVisit();
  }, []);

  const [touchStart, setTouchStart] = useState<{x: number, y: number} | null>(null);
  const [touchEnd, setTouchEnd] = useState<{x: number, y: number} | null>(null);
  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
  };

  const desktopTabs = [
    { path: '/', label: 'ABOUT', icon: User },
    { path: '/capabilities', label: 'SKILLS', icon: Terminal },
    { path: '/operations', label: 'PROJECTS', icon: Briefcase },
    { path: '/evidence', label: 'AWARDS', icon: Award },
    { path: '/comms', label: 'CONTACT', icon: Mail }
  ];

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    
    const isLeftSwipe = distanceX > minSwipeDistance;
    const isRightSwipe = distanceX < -minSwipeDistance;
    
    // ensure horizontal swipe is greater than vertical swipe to prevent triggering on vertical scroll
    if (Math.abs(distanceX) > Math.abs(distanceY) * 1.5) {
      const paths = ['/', '/operations', '/evidence', '/comms'];
      const currentIdx = paths.indexOf(location.pathname);
      if (currentIdx === -1) return;
      
      if (isLeftSwipe && currentIdx < paths.length - 1) {
        navigate(paths[currentIdx + 1]);
      } else if (isRightSwipe && currentIdx > 0) {
        navigate(paths[currentIdx - 1]);
      }
    }
  };

  const toggleAudio = () => {
    audioEngine.init();
    audioEngine.toggleMute();
    setIsMuted(audioEngine.isMuted);
    // Notify AudioToggle by simulating a storage event or just let it be. Handled fine.
  };

  useEffect(() => {
    // Generate random case ID
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomId = 'AX-';
    for (let i = 0; i < 6; i++) {
      randomId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaseId(randomId);

    // Set timestamp
    const now = new Date();
    setTimestamp(now.toISOString().replace('T', ' ').slice(0, 19) + ' UTC');
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const tabs = [
    { path: '/', label: 'ABOUT', mobileLabel: 'ABOUT', icon: User, mobileIcon: User },
    { path: '/operations', label: 'PROJECTS', mobileLabel: 'PROJECTS', icon: Briefcase, mobileIcon: Briefcase },
    { path: '/evidence', label: 'AWARDS', mobileLabel: 'AWARDS', icon: Award, mobileIcon: Award },
    { path: '/comms', label: 'CONTACT', mobileLabel: 'CONTACT', icon: Mail, mobileIcon: Mail }
  ];

  return (
    <div className="print:p-0 print:bg-white min-h-screen bg-desk flex flex-col items-center justify-start pt-[56px] sm:pt-10 md:pt-12 px-0 sm:px-8 pb-[64px] sm:pb-12 font-typewriter text-ink selection:bg-folder selection:text-ink overflow-x-hidden relative">
      <BackgroundElements />
      
      {/* Top Mobile Header (visible only on small screens) */}
      <div className="flex sm:hidden absolute top-0 left-0 w-full bg-folder z-[100] px-4 py-2 items-center justify-between shadow-[0_4px_10px_rgba(0,0,0,0.15)] text-ink font-mono border-b border-folder-dark/50 transition-colors">
         <div className="absolute inset-0 bg-cardboard opacity-40 mix-blend-overlay pointer-events-none"></div>
         <div className="relative z-10 flex-1 pr-3 flex flex-col justify-center">
           <div className="text-[10px] text-ink/70 tracking-[0.2em] font-bold uppercase transition-colors">ID: MMA-2026</div>
           <div className="text-[18px] sm:text-[20px] font-stamp tracking-widest mt-0 px-0 uppercase leading-none font-bold text-ink">
             MD MOIN AKHTAR
           </div>
         </div>
         <div className="relative z-10 flex flex-col items-end gap-1 text-[8px] tracking-widest font-bold shrink-0">
           <div className="flex gap-2">
             <button onClick={toggleAudio} className="flex items-center gap-1.5 px-2 py-1 bg-ink/10 border border-ink/20 rounded-sm outline-none transition-colors hover:bg-ink/20 active:scale-95 text-ink/70">
               {!isMuted ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
             </button>
             <button onClick={toggleTheme} className="flex items-center gap-1.5 px-2 py-1 bg-ink/10 border border-ink/20 rounded-sm outline-none transition-colors hover:bg-ink/20 active:scale-95">
               <span className="text-ink/70 mt-0.5">THEME:</span>
               <span className={`font-black uppercase mt-0.5 ${theme === 'noir' ? 'text-ink/90' : 'text-red-700'}`}>
                 {theme === 'noir' ? 'COLOR' : 'NOIR'}
               </span>
             </button>
           </div>
         </div>
      </div>

      <div className="hidden sm:block">
        <ThemeToggle />
      </div>
      
      <AudioToggle />
      <FileDrawer />
      <SocialSidebar />

      <div className="w-[100%] sm:w-[92%] lg:w-[85%] max-w-[1600px] relative transition-all duration-300 mx-auto">
        {/* Manila Folder Background Layer */}
        <div className="hidden sm:block print:hidden absolute inset-0 -top-4 -bottom-4 -left-4 -right-4 bg-folder shadow-[0_20px_50px_-12px_rgba(0,0,0,0.8)] rounded-md border border-folder-dark transform rotate-[0.5deg] z-0">
          <div className="absolute inset-0 bg-cardboard opacity-60 mix-blend-overlay"></div>
          {/* Folder Crease */}
          <div className="absolute top-0 bottom-0 left-12 w-1 bg-folder-dark opacity-40 shadow-[1px_0_2px_rgba(0,0,0,0.1)]"></div>
          {/* Top Folder Tab */}
          <div className="absolute -top-7 right-12 w-56 h-8 bg-tab-folder border border-folder-dark border-b-0 rounded-t-md transform -skew-x-[20deg] flex items-center px-6">
            <span className="font-stamp text-ink/70 tracking-widest text-sm uppercase transform skew-x-[20deg]">SUBJECT: MR-MOIN</span>
          </div>
          {/* Right Folder Tab */}
          <div className="absolute top-64 -right-12 xl:-right-14 w-12 xl:w-14 h-64 bg-tab-folder border border-folder-dark border-l-0 rounded-r-[16px] shadow-[4px_5px_10px_-2px_rgba(0,0,0,0.5)] flex items-center justify-center z-[-1]">
             <div className="absolute inset-0 bg-cardboard opacity-40 mix-blend-overlay rounded-r-[16px]"></div>
             <span className="font-mono font-bold text-ink/80 tracking-[0.2em] text-sm xl:text-base whitespace-nowrap transform rotate-90 relative z-10">Active Project</span>
          </div>
        </div>

        {/* Paper Sheet 3 (Background) */}
        <div className="hidden sm:block print:hidden absolute inset-0 bg-paper-shadow border border-doc-border rounded-sm transform -rotate-[1.5deg] translate-y-1 -translate-x-1 z-0 shadow-sm"></div>
        {/* Paper Sheet 2 (Background) */}
        <div className="hidden sm:block print:hidden absolute inset-0 bg-paper border border-doc-border rounded-sm transform rotate-[0.5deg] translate-y-2 translate-x-1 z-0 shadow-sm"></div>

        {/* Navigation Tabs (Document Headers) */}
        <div className="hidden sm:block print:hidden w-full relative z-30 mt-4">
          
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end px-2 sm:px-6 relative w-full pt-2">
            <div className="flex flex-wrap items-end relative flex-1">
              {desktopTabs.map((tab, index) => {
                const active = location.pathname === tab.path;
                const Icon = tab.icon;
                return (
                  <Link 
                    key={tab.path} 
                    to={tab.path}
                    className={`group relative px-6 sm:px-8 pt-3 pb-3 transition-all flex flex-col items-center justify-center
                      h-[48px] sm:h-[56px] mb-[-2px]
                      ${index > 0 ? '-ml-2' : ''}
                    `}
                    style={{ zIndex: active ? 30 : 20 - index }}
                  >
                    {/* Tab Background */}
                    <div 
                      className={`absolute inset-0 origin-bottom transition-all z-0 bg-texture
                        ${active 
                          ? 'bg-tab-active shadow-[-4px_-2px_10px_rgba(0,0,0,0.25)] border-t-[2px] border-l-[2px] border-tab-active-border border-b-0' 
                          : 'bg-tab-inactive shadow-[-3px_0_8px_rgba(0,0,0,0.2)] border-t border-l border-tab-inactive-border border-b-0 group-hover:bg-tab-hover'}
                      `}
                      style={{
                        borderTopLeftRadius: '8px',
                        borderTopRightRadius: '18px',
                        borderRight: '2px solid var(--c-tab-border-right)',
                      }}
                    />
                    
                    {/* Tab Content */}
                    <div className={`flex items-center gap-2.5 relative z-10 transition-colors pt-1 ${active ? 'opacity-100 text-ink [text-shadow:0_0_1px_currentColor]' : 'opacity-70 text-ink group-hover:opacity-100'}`}>
                      {Icon && <Icon className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={active ? 3 : 2.5} />}
                      <span className="font-mono text-[14px] sm:text-[18px] font-black tracking-[0.08em] sm:tracking-[0.12em]">
                        <NavTypewriter text={tab.label} delay={index * 150} speed={40} />
                      </span>
                    </div>
                    
                    {/* Active Glow */}
                    {active && (
                      <div className="absolute bottom-[8px] w-10 h-[3px] bg-tab-glow shadow-[0_0_10px_var(--c-tab-glow-shadow)] rounded-sm z-20 transition-colors"></div>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
          
          {/* Thick Horizontal Grey Band connecting tabs */}
          <div className="absolute bottom-[2px] left-2 right-2 sm:left-6 sm:right-6 h-[4px] bg-band-bg border-y border-band-border shadow-[inset_0_1px_2px_rgba(0,0,0,0.15)] z-[25] pointer-events-none rounded-sm transition-colors" />
        </div>

        {/* Main Document Body */}
        <motion.main 
          whileHover="hover"
          initial="rest"
          onTouchStart={(e) => {
            if (window.innerWidth < 640 && window.matchMedia("(orientation: portrait)").matches) handleTouchStart(e);
          }}
          onTouchMove={(e) => {
            if (window.innerWidth < 640 && window.matchMedia("(orientation: portrait)").matches) handleTouchMove(e);
          }}
          onTouchEnd={() => {
            if (window.innerWidth < 640 && window.matchMedia("(orientation: portrait)").matches) handleTouchEnd();
          }}
          className="print:border-none print:shadow-none print:bg-white print:max-w-none print:w-full w-full relative transition-all duration-500 z-10 flex flex-col cursor-default sm:min-h-[700px] bg-paper sm:bg-transparent"
        >
          <div className="hidden sm:block"><DistressedHeader /></div>
          <div className="hidden sm:block"><DogEar /></div>
          
          {/* Weathered Background Layer */}
          <div 
            className="hidden sm:block print:hidden absolute inset-0 bg-doc bg-texture shadow-[0_5px_15px_-3px_rgba(0,0,0,0.1)] border-[2px] border-doc-border rounded-b-sm rounded-tr-sm z-0 overflow-hidden transition-colors"
          >
            {/* Charred inner edges */}
            <div className="absolute inset-0 shadow-[inset_0_0_25px_var(--c-distress-shadow),inset_0_0_8px_var(--c-distress-shadow-dark)] opacity-80 mix-blend-multiply rounded-b-sm rounded-tr-sm pointer-events-none transition-shadow"></div>
            {/* Edge distress border */}
            <div className="absolute inset-0 border-[4px] border-distress/20 pointer-events-none mix-blend-color-burn z-10 rounded-b-sm rounded-tr-sm transition-colors"></div>
          </div>

          <div className="sm:hidden absolute inset-0 bg-doc transition-colors bg-[linear-gradient(transparent_0px,transparent_calc(100%-1px),var(--color-grid-lines)_calc(100%-1px)),linear-gradient(90deg,transparent_0px,transparent_calc(100%-1px),var(--color-grid-lines)_calc(100%-1px))] bg-[size:10px_10px] pointer-events-none z-0"></div>

          {/* Bottom Right Page Curl */}
          <motion.div
            className="hidden sm:block print:hidden absolute bottom-0 right-0 z-50 pointer-events-none"
            variants={{
              rest: { width: 15, height: 15 },
              hover: { width: 55, height: 55 }
            }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
             <div 
                className="absolute inset-0 bg-folder border-t border-l border-folder-dark/40 shadow-[inset_2px_2px_6px_rgba(0,0,0,0.7)]" 
                style={{ clipPath: 'polygon(100% 0, 0 100%, 100% 100%)' }}
             />
             <div className="absolute inset-0 drop-shadow-[-3px_-3px_5px_rgba(0,0,0,0.4)]">
                <div 
                  className="absolute inset-0 bg-gradient-to-tl from-curl-from via-curl-via to-curl-to border-l border-t border-curl-border rounded-tl-sm transition-colors"
                  style={{ clipPath: 'polygon(0 100%, 100% 0, 0 0)' }}
                />
             </div>
          </motion.div>

          {/* Bottom Left Page Curl */}
          <motion.div
            className="hidden sm:block print:hidden absolute bottom-0 left-0 z-50 pointer-events-none"
            variants={{
              rest: { width: 15, height: 15 },
              hover: { width: 45, height: 45 }
            }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
             <div 
                className="absolute inset-0 bg-folder border-t border-r border-folder-dark/40 shadow-[inset_-2px_2px_6px_rgba(0,0,0,0.7)]" 
                style={{ clipPath: 'polygon(0 0, 100% 100%, 0 100%)' }}
             />
             <div className="absolute inset-0 drop-shadow-[3px_-3px_5px_rgba(0,0,0,0.4)]">
                <div 
                  className="absolute inset-0 bg-gradient-to-tr from-curl-from via-curl-via to-curl-to border-r border-t border-curl-border rounded-tr-sm transition-colors"
                  style={{ clipPath: 'polygon(0 0, 100% 100%, 100% 0)' }}
                />
             </div>
          </motion.div>

          {/* Document Content Container (Extends to fill) */}
          <div className="flex-1 relative z-20 w-full pb-8 sm:pb-0">
             <AnimatePresence mode="wait">
               {outlet && React.cloneElement(outlet as React.ReactElement, { key: location.pathname })}
             </AnimatePresence>
          </div>

          <div className="hidden sm:block">
             <RandomCoffeeStains />
             <ClassifiedStamp />
          </div>

          {/* Physical Document Footer */}
          <div className="hidden sm:flex px-6 sm:px-16 pb-6 pt-4 justify-between items-end relative z-40 border-t border-ink/5 mx-6 sm:mx-16 mt-auto">
            <div className="font-bold tracking-[0.2em] text-[10px] sm:text-xs opacity-60 uppercase">
              DECLASSIFICATION DATE: 2076
            </div>
            <div className="flex flex-col items-center gap-1 opacity-60 mix-blend-multiply">
               <QrCode className="w-8 h-8 sm:w-10 sm:h-10" strokeWidth={1.5} />
               <span className="text-[6px] sm:text-[8px] tracking-widest font-bold font-mono">SCAN FOR INTEGRITY</span>
            </div>
          </div>


        </motion.main>
      </div>

      {/* Floating Sticky Mobile Bottom Navigation */}
      <div className="flex sm:hidden fixed bottom-[max(16px,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 w-[96%] max-w-[400px] bg-paper/95 backdrop-blur-xl z-[100] justify-around items-center text-ink/60 font-mono text-[10px] py-1.5 px-2 shadow-[0_8px_30px_rgba(100,20,20,0.15)] border border-red-900/15 rounded-full transition-colors overflow-x-auto hide-scrollbar">
        {[
          { path: '/', label: 'ABOUT', icon: User },
          { path: '/operations', label: 'PROJECTS', icon: Briefcase },
          { path: '/evidence', label: 'AWARDS', icon: Award },
          { path: '/comms', label: 'CONTACT', icon: Mail },
          { path: 'https://github.com/moinakhtar', label: 'GITHUB', icon: Github, isExternal: true },
          { path: '/CV.pdf', label: 'CV', icon: FileText, isExternal: true },
          { action: toggleTheme, label: theme === 'noir' ? 'NOIR' : 'COLOR', icon: theme === 'noir' ? Moon : Sun, isAction: true }
         ].map(tab => {
           let targetPath = tab.path;
           const active = location.pathname === tab.path && !tab.isExternal && !tab.isAction;
           const Icon = tab.icon;

           const innerContent = (
             <>
               {active && <motion.div layoutId="dock-indicator" className="absolute inset-0 bg-red-600/10 border border-red-500/20 rounded-full z-0"></motion.div>}
               <Icon className={`w-4 h-4 sm:w-5 sm:h-5 relative z-10 transition-transform duration-300 ${active ? '-translate-y-0.5 text-red-700' : ''}`} strokeWidth={active ? 2.5 : 2} />
               <span className={`text-[7px] sm:text-[8px] leading-none uppercase font-bold relative z-10 overflow-hidden transition-all duration-300 ${active ? 'max-h-4 opacity-100 mt-0.5 text-red-800' : 'max-h-0 opacity-0'}`}>{tab.label}</span>
             </>
           );

           if (tab.isAction) {
             return (
               <button key={tab.label} onClick={tab.action} className="relative flex flex-col items-center justify-center flex-1 min-w-[36px] py-2 rounded-full transition-all duration-300 hover:text-ink hover:bg-ink/5">
                 {innerContent}
               </button>
             );
           }

           if (tab.isExternal) {
             return (
               <a key={tab.label} href={targetPath} target="_blank" rel="noopener noreferrer" className="relative flex flex-col items-center justify-center flex-1 min-w-[36px] py-2 rounded-full transition-all duration-300 hover:text-ink hover:bg-ink/5">
                 {innerContent}
               </a>
             );
           }

           return (
             <Link key={tab.label} to={targetPath as string} className={`relative flex flex-col items-center justify-center flex-1 min-w-[36px] py-2 rounded-full transition-all duration-300 ${active ? 'text-ink' : 'hover:text-ink hover:bg-ink/5'}`}>
               {innerContent}
             </Link>
           );
        })}
      </div>

      {/* Sticky Bottom Desktop Footer / Last Accessed string on Mobile inside body instead */}
      <div className="hidden sm:flex print:hidden fixed bottom-0 left-0 w-full px-4 py-2 bg-footer-bg border-t border-folder/20 text-folder text-[10px] sm:text-xs font-mono justify-between items-center sm:items-baseline tracking-widest z-50 shadow-[0_-5px_15px_rgba(0,0,0,0.5)] transition-colors">
        <div className="opacity-70"><span className="text-stamp font-bold mr-2">[AUTH: SECURE]</span> LAST ACCESSED: {timestamp}</div>
        <div className="hidden sm:block opacity-50 px-4 border-l border-r border-folder/20 min-w-[250px] text-center">
          {visits > 0 ? `TRAFFIC: ${visits} | UNIQUE: ${uniqueVisits}` : 'CENTRAL INTELLIGENCE REGISTRY'}
        </div>
        <div className="opacity-90 font-bold">ACTIVE CASE ID: {caseId}</div>
      </div>
    </div>
  );
}


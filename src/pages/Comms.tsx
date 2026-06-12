import { Highlight } from '../components/Highlight';
import React, { useState, useEffect, useRef } from 'react';
import { Typewriter } from '../components/Typewriter';
import { PageTransition } from '../components/PageTransition';
import { motion } from 'motion/react';
import { Terminal, GlobeLock, Radio, Lock, Activity, AlertTriangle, Send, Mail } from 'lucide-react';
import { TelexWidget } from '../components/TelexWidget';
import { ScrambleText } from '../components/ScrambleText';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*<>';

export function Comms() {
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [transmitted, setTransmitted] = useState(false);
  const [payload, setPayload] = useState('');
  const [name, setName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const originalPayloadRef = useRef('');

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTransmitting) {
      interval = setInterval(() => {
        setPayload(prev => 
          prev.split('').map(char => 
            char === ' ' || char === '\n' ? char : CHARS[Math.floor(Math.random() * CHARS.length)]
          ).join('')
        );
      }, 50);
    } else if (!isTransmitting && !transmitted) {
      // Restore if somehow cancelled
      setPayload(originalPayloadRef.current);
    }
    return () => clearInterval(interval);
  }, [isTransmitting, transmitted]);

  const handleTransmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    originalPayloadRef.current = payload;
    setIsTransmitting(true);
    
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, message: payload })
      });

      // Try to read actual error message from API
      let data: any = {};
      try { data = await response.json(); } catch {}

      if (!response.ok) {
        throw new Error(data?.error || `Server error (${response.status})`);
      }

      setIsTransmitting(false);
      setTransmitted(true);
      
      setPayload(''); // Clear for next time
      setName('');
    } catch (err: any) {
      console.error(err);
      setIsTransmitting(false);
      setFormError(err?.message || "Transmission failed. Please check network connection.");
    }
  };

  return (
    <PageTransition className="px-4 py-8 sm:px-12 sm:py-16 md:px-20 md:py-24 flex-1 flex flex-col max-w-7xl mx-auto w-full">
      {/* Header section */}
      <div className="mb-2 lg:mb-10 w-full flex flex-col gap-2">
        <div className="flex items-center justify-between border-b-[3px] border-ink/20 pb-2">
          <div className="flex items-center gap-3">
             <div className="bg-ink text-paper p-2 hidden sm:block">
               <Radio className="w-8 h-8" />
             </div>
              <div>
               <h1 className="text-2xl sm:text-4xl font-black tracking-tighter uppercase leading-none text-ink">
                 <ScrambleText text="CONTACT ME" />
               </h1>
               <Typewriter delay={0.3} className="text-[10px] sm:text-xs tracking-widest font-bold opacity-60 uppercase mt-1">
                 SEND ME A DIRECT MESSAGE
               </Typewriter>
             </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] sm:text-[11px] font-bold tracking-widest opacity-60 uppercase">STATUS:</span>
            <span className="text-xs font-black tracking-widest text-stamp flex items-center gap-1 mt-0.5">ONLINE</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 flex-1">
        
        {/* Left Side: Intercepts */}
        <div className="col-span-1 lg:col-span-4 hidden lg:flex flex-col gap-8 order-2 lg:order-1 border-r-0 lg:border-r-[3px] border-ink/20 pr-0 lg:pr-8">
          
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="pt-2 hidden lg:block"
          >
            <h2 className="font-bold tracking-widest text-[10px] sm:text-xs mb-4 text-stamp flex items-center gap-2">
              <span className="animate-pulse w-3 h-3 bg-stamp rounded-full shrink-0" />
              LIVE INTERCEPTS
            </h2>
            <div className="bg-ink/5 p-4 rounded-sm border border-ink/10 font-bold text-xs uppercase">
              <TelexWidget />
            </div>
          </motion.div>

        </div>

        {/* Right Side: The Form */}
        <div className="col-span-1 lg:col-span-8 flex flex-col order-1 lg:order-2">
          
          <div className="mb-2">
            <h2 className="font-black tracking-widest text-lg sm:text-2xl hidden sm:flex items-center gap-2 border-b-2 border-ink/20 pb-0.5 mb-1">
              <span className="w-4 h-4 sm:w-5 sm:h-5 bg-yellow-500 rounded-full shrink-0" />
              GET IN TOUCH
            </h2>
            <Typewriter delay={0.2} speed={0.01} className="text-xl sm:text-2xl font-black leading-tight font-typewriter pt-0.5 uppercase">
              Feel free to drop a message here.
            </Typewriter>
          </div>

          <div className="border-[3px] border-ink bg-doc p-6 sm:p-8 shadow-[8px_8px_0_rgba(0,0,0,0.5)] relative flex flex-col bg-texture">
            
            <div className="absolute top-0 right-8 w-16 h-8 bg-stamp/10 border-b border-l border-r border-stamp flex items-center justify-center">
              <span className="text-[10px] font-bold text-stamp tracking-widest animate-pulse">REC</span>
            </div>

            <div className="border-b-[3px] border-ink/20 pb-4 mb-4 flex justify-between items-end">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 opacity-80 shrink-0" />
                <span className="font-bold tracking-wider text-xl uppercase">CONTACT_FORM</span>
              </div>
              <span className="font-bold text-xs opacity-50 shrink-0"># {Math.floor(Math.random() * 90000) + 10000}</span>
            </div>

            <div className="flex-1 flex flex-col">
              {!transmitted ? (
                <form onSubmit={handleTransmit} className="flex flex-col gap-4 w-full h-full relative">

                  <div className="space-y-4 flex flex-col font-typewriter">
                    
                    <div className="flex flex-col sm:flex-row gap-2 w-full group">
                      <label className="font-bold text-sm uppercase flex items-center sm:w-32 shrink-0 text-ink/70">
                        NAME:
                      </label>
                      <input 
                          type="text" 
                          required
                          disabled={isTransmitting}
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="bg-ink/5 border border-ink/20 focus:border-ink outline-none w-full py-2 px-3 text-base font-bold transition-colors disabled:opacity-50 placeholder-ink/30 text-ink shadow-inner"
                          placeholder="ENTER NAME"
                      />
                    </div>

                    <div className="flex flex-col gap-2 w-full mt-2 group">
                      <label className="font-bold text-sm uppercase flex items-center gap-2 text-ink/70">
                        MESSAGE:
                      </label>
                      <div className="relative h-[120px]">
                        {/* Dossier lined paper effect for textarea */}
                        <div className="absolute inset-0 bg-[linear-gradient(transparent_27px,rgba(0,0,0,0.1)_28px)] bg-[size:100%_28px] pointer-events-none" />
                        <textarea 
                            required
                            disabled={isTransmitting}
                            value={payload}
                            onChange={(e) => setPayload(e.target.value)}
                            className="bg-ink/5 border border-ink/20 focus:border-ink outline-none w-full h-[120px] text-lg font-bold transition-colors disabled:opacity-50 resize-none absolute inset-0 p-4 pt-1 placeholder-ink/30 text-ink shadow-inner leading-[28px]"
                            placeholder="ENTER MESSAGE..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end mt-2 pt-2 relative z-20 flex-col gap-2">
                      {formError && (
                        <div className="w-full flex items-start gap-2 bg-red-900/10 border border-red-700/40 text-red-700 text-xs font-bold font-mono tracking-wider px-3 py-2 rounded-sm">
                          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                          <span className="uppercase">{formError}</span>
                        </div>
                      )}
                      <button 
                        disabled={isTransmitting}
                        className={`px-8 py-3 border-[3px] border-ink font-bold tracking-widest text-sm transition-all w-full sm:w-auto relative group overflow-hidden cursor-pointer ${isTransmitting ? 'bg-ink text-paper animate-pulse' : 'bg-transparent text-ink hover:bg-ink hover:text-paper shadow-[4px_4px_0_rgba(0,0,0,0.5)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0_rgba(0,0,0,0.5)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none bg-paper'}`}
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2 uppercase">
                          {isTransmitting ? 'SENDING...' : 'SEND MESSAGE'}
                          {!isTransmitting && <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                        </span>
                      </button>
                  </div>
                </form>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center p-6 border-[3px] border-ink bg-ink/5 w-full flex-1 min-h-[300px]"
                >
                  <Mail className="w-16 h-16 text-ink mb-6 mx-auto opacity-80" />
                  <Typewriter delay={0} speed={0.02} as="h3" className="text-xl sm:text-2xl font-black mb-4 tracking-widest uppercase">
                     MESSAGE SENT
                  </Typewriter>
                  <Typewriter delay={0.5} speed={0.01} as="p" className="text-sm mb-12 max-w-md mx-auto leading-relaxed font-bold opacity-70">
                    Your message has been successfully delivered to my Telegram. I'll get back to you as soon as possible.
                  </Typewriter>
                  <button 
                    onClick={() => {setTransmitted(false); originalPayloadRef.current = '';}} 
                    className="text-xs border-b-[3px] border-ink hover:bg-ink hover:text-paper transition-all px-6 py-3 uppercase tracking-widest font-black"
                  >
                    SEND ANOTHER MESSAGE
                  </button>
                </motion.div>
              )}
            </div>

          </div>
        
        </div>
      </div>
    </PageTransition>
  );
}

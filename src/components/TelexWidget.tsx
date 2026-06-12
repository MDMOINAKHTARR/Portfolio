import React, { useState, useEffect, useRef } from 'react';
import { Linkedin, Twitter, Github, Code2, Rss } from 'lucide-react';

const TELEX_MESSAGES = [
  { source: 'LNKD_NET', icon: Linkedin, url: 'https://www.linkedin.com/in/mdmoinakhtar', payload: 'PROFESSIONAL_DOSSIER_LOCATED // STATUS: ACTIVE' },
  { source: 'X_COMMS', icon: Twitter, url: 'https://x.com/___moinn_', payload: 'SHORT_BURST_TRANSMISSIONS_INTERCEPTED // MONITORING' },
  { source: 'GIT_ARCHIVE', icon: Github, url: 'https://github.com/MDMOINAKHTARR', payload: 'CODE_VAULT_ACCESSED // REPOSITORIES_SYNCED' },
  { source: 'LEET_ALGOS', icon: Code2, url: 'https://leetcode.com/u/__moinn_/', payload: 'PROBLEM_SOLVING_CAPABILITIES_VERIFIED // RANK: HIGH' }
];

export function TelexWidget() {
  const [messages, setMessages] = useState<{ id: string, text: string, type: 'header' | 'body' | 'link', url?: string, icon?: React.ElementType }[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    let isActive = true;
    let messageIndex = 0;

    const addMessagePart = async (text: string, type: 'header' | 'body' | 'link' = 'body', url?: string, icon?: React.ElementType) => {
      if (!isActive) return;
      setIsTyping(true);
      
      const newId = Math.random().toString(36).substr(2, 9);
      setMessages(prev => [...prev, { id: newId, text: '', type, url, icon }]);
      
      for (let i = 0; i < text.length; i++) {
        if (!isActive) break;
        
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].text = text.slice(0, i + 1);
          return newMessages;
        });

        // Scroll to bottom
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }

        await new Promise(r => setTimeout(r, 20 + Math.random() * 30));
      }
      setIsTyping(false);
    };

    const runTelexSequence = async () => {
      await new Promise(r => setTimeout(r, 2000)); // Initial delay

      while (isActive) {
        const msg = TELEX_MESSAGES[messageIndex];
        
        await addMessagePart(`> RECEIVING FROM: ${msg.source}`, 'header');
        await new Promise(r => setTimeout(r, 400));
        await addMessagePart(msg.payload, 'body');
        await new Promise(r => setTimeout(r, 400));
        await addMessagePart('OPEN CONNECTION', 'link', msg.url, msg.icon);
        
        await new Promise(r => setTimeout(r, 800));
        await addMessagePart('--- END_TRANSMISSION ---', 'body');
        
        messageIndex = (messageIndex + 1) % TELEX_MESSAGES.length;
        
        // Wait before next message
        await new Promise(r => setTimeout(r, 5000 + Math.random() * 3000));
      }
    };

    runTelexSequence();

    return () => {
      isActive = false;
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="border-[3px] border-ink bg-[#f4ebd0] p-1 font-mono text-[10px] sm:text-xs text-ink/90 relative shadow-[4px_4px_0_rgba(0,0,0,0.15)] flex flex-col h-[300px]">
       <div className="bg-ink text-[#f4ebd0] px-3 py-1 flex items-center justify-between shadow-sm z-10 w-full mb-1">
          <div className="flex items-center gap-2 font-bold tracking-widest">
            <Rss className="w-3.5 h-3.5 animate-pulse" />
            TELEX_INTERCEPT
          </div>
          <span className="text-[8px] animate-pulse">
            {isTyping ? 'RCV...' : 'STDBY'}
          </span>
       </div>
       
       <div 
         ref={containerRef}
         className="flex-1 overflow-y-hidden px-3 py-2 space-y-2 relative"
       >
         {messages.map((msg, i) => (
           <div key={msg.id} className={`${msg.type === 'header' ? 'font-bold mt-4' : msg.type === 'link' ? 'mt-2 mb-4' : 'opacity-80'}`}>
              {msg.type === 'link' && msg.url ? (
                <a href={msg.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border-[1.5px] border-ink px-2 py-1 hover:bg-ink hover:text-[#f4ebd0] transition-colors group">
                  {msg.icon && <msg.icon className="w-3 h-3 group-hover:scale-110 transition-transform" />}
                  <span className="font-bold underline decoration-ink/40 tracking-wider group-hover:decoration-transparent">{msg.text}</span>
                </a>
              ) : (
                <span>{msg.text}</span>
              )}
              {i === messages.length - 1 && isTyping && (
                <span className="inline-block w-1.5 h-3 bg-ink ml-1 mb-[-2px] animate-pulse"></span>
              )}
           </div>
         ))}
       </div>
       
       {/* Paper feed visual effect */}
       <div className="absolute inset-x-0 bottom-0 h-8 pointer-events-none bg-gradient-to-t from-[#f4ebd0] to-transparent z-10" />
       
       {/* Edge tearing visual */}
       <div className="absolute left-0 right-0 -bottom-1 h-2 flex pointer-events-none opacity-40">
           {Array.from({ length: 40 }).map((_, i) => (
              <div key={i} className="flex-1 h-full bg-[#f4ebd0]" style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)', transform: `translateY(${Math.random() * -2}px)` }} />
           ))}
       </div>
    </div>
  );
}

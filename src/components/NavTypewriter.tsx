import React, { useState, useEffect } from 'react';
import { audioEngine } from '../lib/audio';

export function NavTypewriter({ 
  text, 
  delay = 0, 
  speed = 50 
}: { 
  text: string; 
  delay?: number; 
  speed?: number;
}) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    let index = 0;
    let isActive = true;
    
    setDisplayedText("");
    
    const typeNext = () => {
      if (!isActive) return;
      
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        setIsTyping(true);
        
        if (text[index] !== ' ' && !audioEngine.isMuted) {
          audioEngine.playClack(); // Play soft clack for typing
        }

        index++;
        
        const randomSpeed = Math.max(20, speed * (0.7 + Math.random() * 0.6));
        timeout = setTimeout(typeNext, randomSpeed);
      } else {
        setIsTyping(false);
      }
    };
    
    if (delay > 0) {
      timeout = setTimeout(typeNext, delay);
    } else {
      typeNext();
    }
    
    return () => {
      isActive = false;
      clearTimeout(timeout);
    };
  }, [text, delay, speed]);

  return (
    <span className="relative inline-flex items-center justify-center">
      <span className="opacity-0 select-none pointer-events-none" aria-hidden="true">{text}</span>
      <span className="absolute inset-0 flex items-center justify-center whitespace-nowrap">
        <span>
          {displayedText}
          {isTyping && <span className="animate-pulse bg-ink w-[4px] h-[10px] inline-block ml-[1px] translate-y-[-1px] opacity-70" />}
        </span>
      </span>
    </span>
  );
}

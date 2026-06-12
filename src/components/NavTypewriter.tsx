import React, { useState, useEffect, useRef } from 'react';
import { audioEngine } from '../lib/audio';

// Module-level cache: once a label has finished typing, store the result so
// subsequent mounts skip the animation loop entirely (no more 5x concurrent timers).
const completedLabels = new Set<string>();

export function NavTypewriter({ 
  text, 
  delay = 0, 
  speed = 50 
}: { 
  text: string; 
  delay?: number; 
  speed?: number;
}) {
  const alreadyDone = completedLabels.has(text);
  const [displayedText, setDisplayedText] = useState(alreadyDone ? text : "");
  const [isTyping, setIsTyping] = useState(false);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    // Skip animation if this label was already typed before
    if (completedLabels.has(text)) {
      setDisplayedText(text);
      return;
    }

    let timeout: ReturnType<typeof setTimeout>;
    let index = 0;
    let isActive = true;
    let lastTime = 0;
    let nextDelay = delay > 0 ? delay : 0;

    setDisplayedText("");

    const step = (timestamp: number) => {
      if (!isActive) return;
      if (timestamp - lastTime < (nextDelay || Math.max(20, speed * (0.7 + Math.random() * 0.6)))) {
        rafRef.current = requestAnimationFrame(step);
        return;
      }
      lastTime = timestamp;
      nextDelay = 0;

      if (index < text.length) {
        const slice = text.slice(0, index + 1);
        setDisplayedText(slice);
        setIsTyping(true);
        if (text[index] !== ' ' && !audioEngine.isMuted) {
          audioEngine.playClack();
        }
        index++;
        rafRef.current = requestAnimationFrame(step);
      } else {
        setIsTyping(false);
        completedLabels.add(text);
      }
    };

    const startFn = () => {
      rafRef.current = requestAnimationFrame(step);
    };

    if (delay > 0) {
      timeout = setTimeout(startFn, delay);
    } else {
      startFn();
    }

    return () => {
      isActive = false;
      clearTimeout(timeout);
      cancelAnimationFrame(rafRef.current);
    };
  }, [text, delay, speed]);

  return (
    <span className="relative inline-flex items-center justify-center">
      <span className="opacity-0 select-none pointer-events-none" aria-hidden="true">{text}</span>
      <span className="absolute inset-0 flex items-center justify-center whitespace-nowrap">
        <span>
          {displayedText}
          {isTyping && <span className="bg-ink w-[4px] h-[10px] inline-block ml-[1px] translate-y-[-1px] opacity-70 animate-pulse" />}
        </span>
      </span>
    </span>
  );
}

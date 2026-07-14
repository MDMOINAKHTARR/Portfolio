import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'motion/react';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%-+=>*';

interface ScrambleTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  trigger?: boolean;
}

export const ScrambleText = React.memo(function ScrambleText({ text, className = "", delay = 0, duration = 1000, trigger = true }: ScrambleTextProps) {
  const [displayText, setDisplayText] = useState(text.replace(/[a-zA-Z0-9]/g, () => CHARS[Math.floor(Math.random() * CHARS.length)]));
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -50px 0px" });
  
  useEffect(() => {
    if (!isInView || !trigger) return;

    let timeout: ReturnType<typeof setTimeout>;
    let startTime: number;
    let animationFrame: number;
    let lastFrame = 0;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;

      // 30 FPS is visually fluid for a text scramble and leaves the main
      // thread free to respond immediately to card interactions.
      if (timestamp - lastFrame < 1000 / 30) {
        animationFrame = requestAnimationFrame(animate);
        return;
      }
      lastFrame = timestamp;

      const progress = timestamp - startTime;
      const progressRatio = Math.min(progress / duration, 1);
      
      let nextStr = "";
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === ' ' || char === '\n') {
          nextStr += char;
          continue;
        }
        
        if (progressRatio > (i / text.length) * 0.8) {
           if (Math.random() > 0.8 || progressRatio === 1) {
              nextStr += char;
           } else {
              nextStr += CHARS[Math.floor(Math.random() * CHARS.length)];
           }
        } else {
           nextStr += CHARS[Math.floor(Math.random() * CHARS.length)];
        }
      }
      
      setDisplayText(nextStr);
      
      if (progressRatio < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setDisplayText(text);
      }
    };

    timeout = setTimeout(() => {
      animationFrame = requestAnimationFrame(animate);
    }, delay * 1000);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(animationFrame);
    };
  }, [text, delay, duration, isInView, trigger]);

  return (
    <span ref={ref} className={className}>
      {displayText}
    </span>
  );
});

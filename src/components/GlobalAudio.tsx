import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { audioEngine } from '../lib/audio';

export function GlobalAudio() {
  const location = useLocation();

  useEffect(() => {
    // Initialize audio engine on first user interaction
    const initAudio = () => {
      audioEngine.init();
      document.removeEventListener('click', initAudio);
      document.removeEventListener('keydown', initAudio);
    };

    document.addEventListener('click', initAudio);
    document.addEventListener('keydown', initAudio);

    return () => {
      document.removeEventListener('click', initAudio);
      document.removeEventListener('keydown', initAudio);
    };
  }, []);

  useEffect(() => {
    // Play paper sound on route change
    audioEngine.playPaper();
  }, [location.pathname]);

  useEffect(() => {
    // Play clack on button and link clicks
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName.toLowerCase() === 'button' ||
        target.tagName.toLowerCase() === 'a' ||
        target.closest('button') ||
        target.closest('a')
      ) {
        audioEngine.playClack();
      }
    };

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  return null;
}

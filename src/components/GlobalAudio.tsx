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
    // Ensure audio engine is initialized on route change
    audioEngine.init();
  }, [location.pathname]);

  return null;
}

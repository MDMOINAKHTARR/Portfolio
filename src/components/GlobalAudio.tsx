import { useEffect } from 'react';
import { audioEngine } from '../lib/audio';

export function GlobalAudio() {
  useEffect(() => {
    // Initialize audio engine only on first user interaction
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

  return null;
}

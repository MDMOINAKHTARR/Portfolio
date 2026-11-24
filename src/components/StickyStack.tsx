import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useReducedMotion } from '../lib/use-reduced-motion';
import { StickyPhoto, type StickyPaper } from './StickyPhoto';

export type StackNote = {
  id: string;
  src: string;
  alt: string;
  caption: string;
  paper: StickyPaper;
  tilt: number;
};

const SPRING = { type: 'spring', stiffness: 260, damping: 24 } as const;
// A peel should start the instant the tap lands, then coast away.
const FLY = { duration: 0.5, ease: [0.2, 0.85, 0.25, 1] } as const;

/**
 * A small pile of sticky notes. The note on top fills the box; the ones
 * beneath peek out at an angle. Tap anywhere on the pile and the top note
 * peels off toward the bottom-right, uncovering the one below, then slips
 * back into the pile underneath — so the two keep trading places.
 */
export function StickyStack({ notes, className = '' }: { notes: StackNote[]; className?: string }) {
  const reduce = useReducedMotion();
  const [stack, setStack] = useState<StackNote[]>(notes);
  const [leaving, setLeaving] = useState<StackNote | null>(null);

  const peel = (note: StackNote) => {
    if (leaving || stack.length < 2) return;
    setStack((s) => s.filter((n) => n.id !== note.id));
    setLeaving(note);
  };

  const peelTop = () => {
    if (leaving || stack.length < 2) return;
    peel(stack[stack.length - 1]);
  };

  const landed = () => {
    if (!leaving) return;
    const note = leaving;
    setLeaving(null);
    setStack((s) => [note, ...s]);
  };

  return (
    <div className={`relative cursor-pointer ${className}`} onClick={peelTop}>
      {stack.map((note, i) => {
        const top = i === stack.length - 1;
        return (
          <motion.div
            key={note.id}
            className={top ? 'relative z-10' : 'absolute inset-0 z-0'}
            animate={{
              scale: top ? 1 : 0.96,
              y: top ? 0 : 10,
              rotate: top ? 0 : -7,
            }}
            transition={reduce ? { duration: 0 } : SPRING}
          >
            <StickyPhoto
              src={note.src}
              alt={note.alt}
              caption={note.caption}
              paper={note.paper}
              tilt={note.tilt}
              className="w-full"
            />
          </motion.div>
        );
      })}

      <AnimatePresence>
        {leaving && (
          <motion.div
            key={leaving.id}
            className="pointer-events-none absolute inset-0 z-20"
            initial={{ x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 }}
            animate={{ x: '55%', y: '75%', rotate: 16, opacity: 0, scale: 1.04 }}
            transition={reduce ? { duration: 0.01 } : FLY}
            onAnimationComplete={landed}
          >
            <StickyPhoto
              src={leaving.src}
              alt={leaving.alt}
              caption={leaving.caption}
              paper={leaving.paper}
              tilt={leaving.tilt}
              className="w-full"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { useEffect, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import { useReducedMotion } from './use-reduced-motion';

/**
 * Momentum smooth-scrolling for the whole app.
 *
 * Lenis drives the native scroll position (not a transform), so `position: sticky`,
 * IntersectionObserver and Motion's `useScroll` all keep working — they just receive
 * a much smoother signal to scrub against.
 *
 * Nested scroll areas (modals, the project stack, PDF viewer…) opt out with the
 * `data-lenis-prevent` attribute so their own scrolling stays native.
 */

let activeLenis: Lenis | null = null;

/** Return to the top of the page — smooth, or instant. Works with or without Lenis. */
export function scrollToTop(immediate = true) {
  if (activeLenis) {
    activeLenis.scrollTo(0, { immediate });
    return;
  }
  window.scrollTo(0, 0);
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const { pathname } = useLocation();

  useEffect(() => {
    // Respect the user's motion preference: fall back to native scrolling.
    if (reduced) return;

    const lenis = new Lenis({
      lerp: 0.085,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      smoothWheel: true,
    });
    activeLenis = lenis;

    let frame = requestAnimationFrame(function raf(time: number) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    });

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      if (activeLenis === lenis) activeLenis = null;
    };
  }, [reduced]);

  // Jump to the top whenever the route changes, keeping Lenis in sync.
  useEffect(() => {
    scrollToTop(true);
  }, [pathname]);

  return <>{children}</>;
}

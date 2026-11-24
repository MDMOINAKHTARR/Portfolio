import { Suspense, useEffect, useRef, useState, type ReactNode } from 'react';

interface DeferredSectionProps {
  children: ReactNode;
  minHeight?: number;
  rootMargin?: string;
}

/**
 * Defers mounting heavy below-the-fold sections until they are within
 * `rootMargin` of the viewport, keeping initial page load fast and scroll smooth.
 */
export function DeferredSection({
  children,
  minHeight = 320,
  rootMargin = '700px 0px',
}: DeferredSectionProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (shouldRender) return;
    const node = hostRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setShouldRender(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [shouldRender, rootMargin]);

  return (
    <div
      ref={hostRef}
      className="w-full"
      style={
        shouldRender
          ? undefined
          : {
              contentVisibility: 'auto',
              containIntrinsicSize: `auto ${minHeight}px`,
              minHeight,
            }
      }
    >
      {shouldRender ? <Suspense fallback={null}>{children}</Suspense> : null}
    </div>
  );
}


import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import posthog from 'posthog-js';

/**
 * Tracks pageviews on every route change.
 * Place this anywhere inside <BrowserRouter>.
 */
export function PageTracker() {
  const location = useLocation();

  useEffect(() => {
    posthog.capture('$pageview', {
      $current_url: window.location.href,
    });
  }, [location.pathname]);

  return null;
}

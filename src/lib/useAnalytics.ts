import { usePostHog } from 'posthog-js/react';
import { useCallback } from 'react';

/**
 * Convenience hook for PostHog analytics.
 *
 * Usage:
 *   const { track, identify, reset } = useAnalytics();
 *   track('resume_downloaded');
 *   track('project_viewed', { project: 'Portfolio' });
 */
export function useAnalytics() {
  const posthog = usePostHog();

  const track = useCallback(
    (event: string, properties?: Record<string, unknown>) => {
      posthog?.capture(event, properties);
    },
    [posthog],
  );

  const identify = useCallback(
    (id: string, properties?: Record<string, unknown>) => {
      posthog?.identify(id, properties);
    },
    [posthog],
  );

  const reset = useCallback(() => {
    posthog?.reset();
  }, [posthog]);

  return { track, identify, reset, posthog };
}

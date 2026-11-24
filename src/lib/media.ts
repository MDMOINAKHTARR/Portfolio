const DEFAULT_MEDIA_BASE_URL = 'https://media.moinn.dev';

const rawBaseUrl = import.meta.env.VITE_MEDIA_BASE_URL;
export const MEDIA_BASE_URL = (
  typeof rawBaseUrl === 'string' && rawBaseUrl.trim().length > 0
    ? rawBaseUrl.trim()
    : DEFAULT_MEDIA_BASE_URL
).replace(/\/+$/, '');

/**
 * Tracks CDN URLs that failed to load in this browser session so subsequent
 * mounts (e.g. expanding CRT TV or Dossier lens overlay) immediately use the
 * local fallback asset without waiting for another network timeout.
 */
const failedCdnUrls = new Set<string>();

/**
 * Builds the full Cloudflare R2 / CDN URL for a media object key.
 */
export function getMediaUrl(objectKey: string): string {
  const cleanKey = objectKey.replace(/^\/+/, '');
  if (!MEDIA_BASE_URL) {
    return `/${cleanKey}`;
  }
  return `${MEDIA_BASE_URL}/${encodeURI(cleanKey)}`;
}

/**
 * Returns the active video URL, automatically choosing `fallbackSrc` if the
 * primary CDN URL previously failed during this session.
 */
export function getEffectiveVideoSrc(primarySrc: string, fallbackSrc?: string): string {
  if (fallbackSrc && failedCdnUrls.has(primarySrc)) {
    return encodeURI(fallbackSrc);
  }
  return encodeURI(primarySrc);
}

/**
 * Marks a primary CDN URL as failed so future renders use its local fallback.
 */
export function markCdnUrlFailed(primarySrc: string): void {
  if (primarySrc) {
    failedCdnUrls.add(primarySrc);
  }
}

/**
 * Attempts to switch an HTMLVideoElement to its local fallback source on error.
 * Returns `true` if the fallback was applied, or `false` if no fallback is available
 * or the element is already using the fallback.
 */
export function tryVideoFallback(
  video: HTMLVideoElement,
  primarySrc: string,
  fallbackSrc?: string
): boolean {
  if (!fallbackSrc) return false;

  const encodedFallback = encodeURI(fallbackSrc);
  const currentAttrSrc = video.getAttribute('src') || '';

  // Avoid infinite error loops if already on the fallback source
  if (
    currentAttrSrc === fallbackSrc ||
    currentAttrSrc === encodedFallback ||
    video.src.endsWith(encodedFallback)
  ) {
    return false;
  }

  failedCdnUrls.add(primarySrc);
  const targetTime = video.currentTime || 0;
  video.src = encodedFallback;
  video.load();
  if (targetTime > 0) {
    video.addEventListener(
      'loadedmetadata',
      () => {
        video.currentTime = targetTime;
      },
      { once: true }
    );
  }
  if (video.autoplay || !video.paused) {
    void video.play().catch(() => {});
  }
  return true;
}


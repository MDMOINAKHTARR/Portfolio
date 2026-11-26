/**
 * Free, zero-API-key expressive TTS engine for WADE using Web Speech API
 * with emotion-aware prosody chunking and character-level text-to-voice sync.
 */

interface SpeechSegment {
  spokenText: string;
  rawStart: number;
  rawEnd: number;
  rate: number;
  pitch: number;
  spokenToRaw: number[];
}

export interface WadeVoiceCallbacks {
  onProgress: (rawCharCount: number) => void;
  onComplete: () => void;
}

let activeSessionId = 0;
let activeRafId: number | null = null;
let activeAudioEl: HTMLAudioElement | null = null;

function pickBestWadeVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const preferredPatterns = [
    /Microsoft Ryan Online.*Natural/i,
    /Microsoft Guy Online.*Natural/i,
    /Microsoft Christopher Online.*Natural/i,
    /Microsoft Eric Online.*Natural/i,
    /Google UK English Male/i,
    /Google US English/i,
    /Daniel/i,
    /Alex/i,
    /Natural/i,
  ];

  for (const pattern of preferredPatterns) {
    const match = voices.find((v) => v.lang.startsWith('en') && pattern.test(v.name));
    if (match) return match;
  }

  return voices.find((v) => v.lang.startsWith('en')) ?? voices[0] ?? null;
}

/**
 * Strips markdown/citations into clean spoken text while building an index map
 * back to the original raw string so `onboundary` reveals exact raw characters.
 */
function buildSpokenWithMap(raw: string, baseOffset: number): { spoken: string; map: number[] } {
  const spokenChars: string[] = [];
  const map: number[] = [];

  let i = 0;
  while (i < raw.length) {
    // Skip citation markers like [1], [2]
    if (raw[i] === '[' && /^\[\d+\]/.test(raw.slice(i))) {
      const m = raw.slice(i).match(/^\[\d+\]/);
      i += m ? m[0].length : 1;
      continue;
    }
    // Skip markdown bold/italic/code delimiters
    if (raw[i] === '*' || raw[i] === '`') {
      i += 1;
      continue;
    }
    // Replace bullet symbol with a brief natural pause
    if (raw[i] === '•') {
      spokenChars.push(' ');
      map.push(baseOffset + i);
      i += 1;
      continue;
    }
    spokenChars.push(raw[i]);
    map.push(baseOffset + i + 1);
    i += 1;
  }

  return {
    spoken: spokenChars.join('').replace(/\s{2,}/g, ' ').trimStart(),
    map,
  };
}

function splitIntoExpressiveSegments(rawText: string): SpeechSegment[] {
  const segments: SpeechSegment[] = [];
  // Split at sentence/clause boundaries while keeping punctuation
  const regex = /[^.!?\n—;]+(?:[.!?—;]+|\n|$)/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(rawText)) !== null) {
    const chunk = match[0];
    const rawStart = match.index;
    const rawEnd = rawStart + chunk.length;
    const trimmed = chunk.trim();
    if (!trimmed) continue;

    const { spoken, map } = buildSpokenWithMap(chunk, rawStart);
    if (!spoken.trim()) continue;

    // Emotion-aware prosody shifts for Wade Wilson cadence
    let rate = 1.09;
    let pitch = 0.99;

    if (trimmed.endsWith('!')) {
      rate = 1.15;
      pitch = 1.08;
    } else if (trimmed.endsWith('?')) {
      rate = 1.07;
      pitch = 1.11;
    } else if (trimmed.includes('—') || trimmed.includes('...')) {
      rate = 0.97;
      pitch = 0.9;
    } else if (/haha|lol|spoiler|plot twist|oops|uh|wait/i.test(trimmed)) {
      rate = 1.13;
      pitch = 1.05;
    }

    segments.push({
      spokenText: spoken,
      rawStart,
      rawEnd,
      rate,
      pitch,
      spokenToRaw: map,
    });
  }

  return segments;
}

export function isWadeVoiceSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    (('speechSynthesis' in window && 'SpeechSynthesisUtterance' in window) ||
      typeof Audio !== 'undefined')
  );
}

export function stopWadeVoice(): void {
  activeSessionId += 1;
  if (activeRafId !== null && typeof window !== 'undefined') {
    window.cancelAnimationFrame(activeRafId);
    activeRafId = null;
  }
  if (activeAudioEl) {
    try {
      activeAudioEl.pause();
      activeAudioEl.src = '';
    } catch {
      // ignore audio stop errors
    }
    activeAudioEl = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore speech synthesis cancel errors
    }
  }
}

interface NeuralVoiceResponse {
  success?: boolean;
  audioBase64?: string;
  mimeType?: string;
  alignment?: {
    characters: string[];
    character_start_times_seconds: number[];
    character_end_times_seconds: number[];
  } | null;
}

function playNeuralAudioSynced(
  rawText: string,
  payload: NeuralVoiceResponse,
  sessionId: number,
  callbacks: WadeVoiceCallbacks
): Promise<boolean> {
  return new Promise((resolve) => {
    if (!payload.audioBase64 || sessionId !== activeSessionId) {
      resolve(false);
      return;
    }

    const mime = payload.mimeType || 'audio/mpeg';
    const audio = new Audio(`data:${mime};base64,${payload.audioBase64}`);
    activeAudioEl = audio;

    const { map: spokenToRaw } = buildSpokenWithMap(rawText, 0);
    const startTimes = payload.alignment?.character_start_times_seconds;

    const tick = () => {
      if (sessionId !== activeSessionId) return;
      const t = audio.currentTime;

      if (Array.isArray(startTimes) && startTimes.length > 0) {
        let spokenIdx = 0;
        for (let i = 0; i < startTimes.length; i++) {
          if (startTimes[i] <= t) spokenIdx = i + 1;
          else break;
        }
        const mapped =
          spokenIdx <= 0
            ? 1
            : spokenToRaw[Math.min(spokenToRaw.length - 1, spokenIdx - 1)] ?? rawText.length;
        callbacks.onProgress(mapped);
      } else if (Number.isFinite(audio.duration) && audio.duration > 0) {
        const frac = Math.min(1, t / audio.duration);
        callbacks.onProgress(Math.max(1, Math.round(rawText.length * frac)));
      }

      if (!audio.paused && !audio.ended) {
        activeRafId = window.requestAnimationFrame(tick);
      }
    };

    audio.onplay = () => {
      if (sessionId !== activeSessionId) return;
      activeRafId = window.requestAnimationFrame(tick);
    };

    audio.onended = () => {
      if (activeRafId !== null) {
        window.cancelAnimationFrame(activeRafId);
        activeRafId = null;
      }
      if (activeAudioEl === audio) activeAudioEl = null;
      if (sessionId !== activeSessionId) return;
      callbacks.onProgress(rawText.length);
      callbacks.onComplete();
    };

    audio.onerror = () => {
      if (activeAudioEl === audio) activeAudioEl = null;
      resolve(false);
    };

    audio
      .play()
      .then(() => resolve(true))
      .catch(() => {
        if (activeAudioEl === audio) activeAudioEl = null;
        resolve(false);
      });
  });
}

export async function speakWadeSynced(rawText: string, callbacks: WadeVoiceCallbacks): Promise<void> {
  if (!isWadeVoiceSupported() || !rawText.trim()) {
    callbacks.onProgress(rawText.length);
    callbacks.onComplete();
    return;
  }

  stopWadeVoice();
  const sessionId = activeSessionId;

  // Try neural voice-cloning / ElevenLabs backend first if configured
  try {
    const res = await fetch('/api/dossier-voice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: rawText }),
      signal: AbortSignal.timeout(9500),
    });
    if (sessionId !== activeSessionId) return;
    if (res.ok) {
      const data = (await res.json()) as NeuralVoiceResponse;
      if (data?.success && data.audioBase64) {
        const started = await playNeuralAudioSynced(rawText, data, sessionId, callbacks);
        if (started) return;
      }
    }
  } catch {
    // Fall back to free browser Web Speech API below
  }

  if (sessionId !== activeSessionId) return;
  if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
    callbacks.onProgress(rawText.length);
    callbacks.onComplete();
    return;
  }

  const segments = splitIntoExpressiveSegments(rawText);

  if (segments.length === 0) {
    callbacks.onProgress(rawText.length);
    callbacks.onComplete();
    return;
  }

  const voice = pickBestWadeVoice();
  let segIndex = 0;

  const speakNext = () => {
    if (sessionId !== activeSessionId) return;
    if (segIndex >= segments.length) {
      callbacks.onProgress(rawText.length);
      callbacks.onComplete();
      return;
    }

    const seg = segments[segIndex];
    const utterance = new SpeechSynthesisUtterance(seg.spokenText);
    if (voice) utterance.voice = voice;
    utterance.lang = voice?.lang || 'en-US';
    utterance.rate = seg.rate;
    utterance.pitch = seg.pitch;
    utterance.volume = 1;

    let highestBoundaryRaw = seg.rawStart;
    let receivedBoundary = false;
    const segStartTime = performance.now();
    // Estimate ~14 chars/sec * rate as fallback if browser doesn't emit onboundary
    const estDurationMs = Math.max(350, (seg.spokenText.length / (14.5 * seg.rate)) * 1000);

    const tickFallback = () => {
      if (sessionId !== activeSessionId) return;
      if (!receivedBoundary) {
        const elapsed = performance.now() - segStartTime;
        const frac = Math.min(0.95, elapsed / estDurationMs);
        const estRaw = Math.round(seg.rawStart + (seg.rawEnd - seg.rawStart) * frac);
        if (estRaw > highestBoundaryRaw) {
          highestBoundaryRaw = estRaw;
          callbacks.onProgress(estRaw);
        }
      }
      activeRafId = window.requestAnimationFrame(tickFallback);
    };

    utterance.onboundary = (event: SpeechSynthesisEvent) => {
      if (sessionId !== activeSessionId) return;
      receivedBoundary = true;
      const charIdx = Math.min(
        seg.spokenToRaw.length - 1,
        Math.max(0, (event.charIndex ?? 0) + (event.charLength ?? 1) - 1)
      );
      const mappedRaw = seg.spokenToRaw[charIdx] ?? seg.rawEnd;
      if (mappedRaw > highestBoundaryRaw) {
        highestBoundaryRaw = mappedRaw;
        callbacks.onProgress(mappedRaw);
      }
    };

    utterance.onend = () => {
      if (activeRafId !== null) {
        window.cancelAnimationFrame(activeRafId);
        activeRafId = null;
      }
      if (sessionId !== activeSessionId) return;
      callbacks.onProgress(seg.rawEnd);
      segIndex += 1;
      speakNext();
    };

    utterance.onerror = () => {
      if (activeRafId !== null) {
        window.cancelAnimationFrame(activeRafId);
        activeRafId = null;
      }
      if (sessionId !== activeSessionId) return;
      callbacks.onProgress(rawText.length);
      callbacks.onComplete();
    };

    callbacks.onProgress(Math.max(1, seg.rawStart));
    activeRafId = window.requestAnimationFrame(tickFallback);
    window.speechSynthesis.speak(utterance);
  };

  speakNext();
}

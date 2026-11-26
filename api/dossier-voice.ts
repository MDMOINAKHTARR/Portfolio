import type { VercelRequest, VercelResponse } from '@vercel/node';

export interface VoiceAlignment {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
}

export interface DossierVoiceResult {
  success: boolean;
  provider?: 'custom-tts' | 'elevenlabs';
  fallback?: 'browser';
  audioBase64?: string;
  mimeType?: string;
  alignment?: VoiceAlignment | null;
  error?: string;
}

function cleanSpeechText(raw: string): string {
  return raw
    .replace(/\[\d+\]/g, '')
    .replace(/[*`]/g, '')
    .replace(/•/g, ', ')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .slice(0, 750);
}

export async function generateDossierVoiceReply(rawText: string): Promise<DossierVoiceResult> {
  const text = cleanSpeechText(rawText);
  if (!text) {
    return { success: false, fallback: 'browser', error: 'Empty text' };
  }

  const customTtsUrl = (process.env.CUSTOM_TTS_URL || '').trim();
  if (customTtsUrl) {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const customSecret = (process.env.CUSTOM_TTS_SECRET || '').trim();
      if (customSecret) {
        headers.Authorization = `Bearer ${customSecret}`;
      }

      const res = await fetch(customTtsUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ text, language: 'en' }),
        signal: AbortSignal.timeout(9000),
      });

      if (res.ok) {
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          const data: any = await res.json();
          if (typeof data?.audioBase64 === 'string' && data.audioBase64.length > 0) {
            return {
              success: true,
              provider: 'custom-tts',
              audioBase64: data.audioBase64,
              mimeType: data.mimeType || 'audio/wav',
              alignment: data.alignment ?? null,
            };
          }
        } else {
          const buf = Buffer.from(await res.arrayBuffer());
          if (buf.length > 0) {
            return {
              success: true,
              provider: 'custom-tts',
              audioBase64: buf.toString('base64'),
              mimeType: ct.split(';')[0] || 'audio/wav',
              alignment: null,
            };
          }
        }
      }
    } catch {
      // Fall through to ElevenLabs or browser fallback
    }
  }

  const elevenKey = (process.env.ELEVENLABS_API_KEY || '').trim();
  const elevenVoiceId = (process.env.ELEVENLABS_VOICE_ID || '').trim();
  if (elevenKey && elevenVoiceId) {
    try {
      const res = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(elevenVoiceId)}/with-timestamps`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': elevenKey,
          },
          body: JSON.stringify({
            text,
            model_id: 'eleven_flash_v2_5',
            voice_settings: {
              stability: 0.42,
              similarity_boost: 0.82,
              style: 0.65,
              use_speaker_boost: true,
            },
          }),
          signal: AbortSignal.timeout(9000),
        }
      );

      if (res.ok) {
        const data: any = await res.json();
        if (typeof data?.audio_base64 === 'string' && data.audio_base64.length > 0) {
          return {
            success: true,
            provider: 'elevenlabs',
            audioBase64: data.audio_base64,
            mimeType: 'audio/mpeg',
            alignment: data.alignment ?? null,
          };
        }
      }
    } catch {
      // Fall through to browser fallback
    }
  }

  return { success: false, fallback: 'browser' };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const parsedBody =
      typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const text = typeof parsedBody?.text === 'string' ? parsedBody.text : '';
    if (!text.trim()) {
      return res.status(400).json({ success: false, error: 'Missing text' });
    }

    const result = await generateDossierVoiceReply(text);
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(200).json({
      success: false,
      fallback: 'browser',
      error: err?.message || 'Voice synthesis fallback',
    });
  }
}

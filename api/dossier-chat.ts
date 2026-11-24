import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  GEMINI_MODEL_CASCADE,
  buildDossierPromptContext,
  sanitizeModelOutput,
} from './_dossierEngine.js';
import type {
  ConversationMessage,
  GeminiDossierResponse,
  VisitorLens,
} from '../src/lib/geminiDossierAi';

const SERVER_RATE_WINDOW_MS = 60_000;
const SERVER_MAX_REQUESTS_PER_IP = 18;
const ipRequestLog = new Map<string, number[]>();

function checkServerRateLimit(clientIp: string): boolean {
  const now = Date.now();
  const timestamps = (ipRequestLog.get(clientIp) || []).filter(
    (ts) => now - ts <= SERVER_RATE_WINDOW_MS
  );
  if (timestamps.length >= SERVER_MAX_REQUESTS_PER_IP) {
    ipRequestLog.set(clientIp, timestamps);
    return false;
  }
  timestamps.push(now);
  ipRequestLog.set(clientIp, timestamps);
  return true;
}

export async function generateDossierChatReply(options: {
  query: string;
  history?: ConversationMessage[];
  routeContext?: string;
  lens?: VisitorLens;
  clientIp?: string;
  onToken?: (chunkText: string) => void;
}): Promise<GeminiDossierResponse> {
  const t0 = Date.now();
  const ctx = buildDossierPromptContext(
    options.query,
    options.history || [],
    options.routeContext,
    options.lens
  );
  const { baseRag, followUps, abuseRefusal, systemPrompt, contents, temperature, fallbackAnswer, mode } =
    ctx;

  if (options.clientIp && !checkServerRateLimit(options.clientIp)) {
    return {
      ...baseRag,
      headline: 'WADE · Server Cooldown',
      answer:
        "Whoa—18 requests in a minute from one IP? Even I need a breather. Grab Moin's **RESUME.PDF** (`/MdMoinAkhtar_Resume.pdf`) while the server cools off.",
      bullets: [],
      followUps,
      modelUsed: 'server-rate-limiter',
      conversationMode: mode,
      latencyMs: 1,
    };
  }

  if (abuseRefusal) {
    return {
      ...baseRag,
      headline: 'WADE · Nice Try',
      answer: abuseRefusal,
      bullets: [],
      followUps,
      modelUsed: 'guardrail-filter',
      conversationMode: mode,
      latencyMs: 1,
    };
  }

  const serverApiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    '';
  if (serverApiKey) {
    for (const model of GEMINI_MODEL_CASCADE) {
      try {
        if (options.onToken) {
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${encodeURIComponent(serverApiKey)}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                systemInstruction: { parts: [{ text: systemPrompt }] },
                contents,
                generationConfig: { temperature, maxOutputTokens: 170 },
              }),
              signal: AbortSignal.timeout(6500),
            }
          );

          if (!res.ok || !res.body) continue;

          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';
          let fullRaw = '';

          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });

            const lines = buffer.split('\n');
            buffer = lines.pop() ?? '';

            for (const rawLine of lines) {
              const line = rawLine.trim();
              if (!line.startsWith('data:')) continue;
              const jsonStr = line.slice(5).trim();
              if (!jsonStr || jsonStr === '[DONE]') continue;
              try {
                const parsed: any = JSON.parse(jsonStr);
                const chunkText = parsed?.candidates?.[0]?.content?.parts
                  ?.map((p: any) => p?.text || '')
                  .join('');
                if (chunkText) {
                  fullRaw += chunkText;
                  options.onToken(chunkText);
                }
              } catch {
                // ignore partial SSE JSON frame
              }
            }
          }

          const finalText = sanitizeModelOutput(fullRaw);
          if (finalText) {
            return {
              ...baseRag,
              answer: finalText,
              bullets: [],
              followUps,
              modelUsed: model,
              conversationMode: mode,
              latencyMs: Math.max(1, Date.now() - t0),
            };
          }
        } else {
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(serverApiKey)}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                systemInstruction: { parts: [{ text: systemPrompt }] },
                contents,
                generationConfig: { temperature, maxOutputTokens: 170 },
              }),
              signal: AbortSignal.timeout(6500),
            }
          );

          if (!res.ok) continue;
          const data: any = await res.json();
          const rawText = data?.candidates?.[0]?.content?.parts
            ?.map((p: any) => p?.text || '')
            .join('')
            .trim();
          const generatedText = rawText ? sanitizeModelOutput(rawText) : '';
          if (generatedText) {
            return {
              ...baseRag,
              answer: generatedText,
              bullets: [],
              followUps,
              modelUsed: model,
              conversationMode: mode,
              latencyMs: Math.max(1, Date.now() - t0),
            };
          }
        }
      } catch {
        // try next model in cascade
      }
    }
  }

  return {
    ...baseRag,
    answer: fallbackAnswer,
    bullets: [],
    followUps,
    modelUsed: 'local-query-analyzer',
    conversationMode: mode,
    latencyMs: Math.max(1, Date.now() - t0),
  };
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
    const { query, history, routeContext, lens, stream } = parsedBody;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ success: false, error: 'Missing query' });
    }

    const forwardedFor = req.headers['x-forwarded-for'];
    const clientIp =
      (Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor)?.split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      'unknown';

    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      (res as any).flushHeaders?.();

      const reply = await generateDossierChatReply({
        query,
        history,
        routeContext,
        lens,
        clientIp,
        onToken: (text) => {
          res.write(`data: ${JSON.stringify({ type: 'token', text })}\n\n`);
        },
      });
      res.write(`data: ${JSON.stringify({ type: 'done', response: reply })}\n\n`);
      return res.end();
    }

    const reply = await generateDossierChatReply({
      query,
      history,
      routeContext,
      lens,
      clientIp,
    });
    return res.json({ success: true, ...reply });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err?.message || 'Failed to generate RAG response',
    });
  }
}

import 'dotenv/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import http from 'http';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';

function devApiProxyFallbackPlugin(): Plugin {
  return {
    name: 'dev-api-proxy-fallback',
    configureServer(server) {
      // Always handle /api/dossier-chat in Vite middleware (works in both standalone Vite and Express middlewareMode)
      server.middlewares.use('/api/dossier-chat', async (req, res, next) => {
        if (req.method !== 'POST') return next();
        try {
          let body: any = (req as any).body;
          if (!body || typeof body !== 'object') {
            const chunks: Buffer[] = [];
            for await (const chunk of req) {
              chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
            }
            const raw = Buffer.concat(chunks).toString('utf-8') || '{}';
            body = JSON.parse(raw);
          }
          const mod = await server.ssrLoadModule('/api/dossier-chat.ts');
          const clientIp =
            (typeof req.headers['x-forwarded-for'] === 'string'
              ? req.headers['x-forwarded-for'].split(',')[0].trim()
              : req.socket?.remoteAddress) || 'unknown';

          if (body.stream) {
            res.writeHead(200, {
              'Content-Type': 'text/event-stream; charset=utf-8',
              'Cache-Control': 'no-cache, no-transform',
              Connection: 'keep-alive',
            });
            const reply = await mod.generateDossierChatReply({
              query: body.query || '',
              history: body.history || [],
              routeContext: body.routeContext,
              lens: body.lens,
              clientIp,
              onToken: (text: string) => {
                res.write(`data: ${JSON.stringify({type: 'token', text})}\n\n`);
              },
            });
            res.write(`data: ${JSON.stringify({type: 'done', response: reply})}\n\n`);
            res.end();
            return;
          }

          const reply = await mod.generateDossierChatReply({
            query: body.query || '',
            history: body.history || [],
            routeContext: body.routeContext,
            lens: body.lens,
            clientIp,
          });
          res.writeHead(200, {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store, max-age=0',
          });
          res.end(JSON.stringify({success: true, ...reply}));
        } catch (e: any) {
          res.writeHead(500, {'Content-Type': 'application/json'});
          res.end(JSON.stringify({success: false, error: e?.message || 'RAG error'}));
        }
      });

      if (server.config.server.middlewareMode) return;

      server.middlewares.use('/api', (req, res) => {
        const reqUrl = req.url || '/';
        const bodyChunks: Buffer[] = [];
        req.on('data', (chunk) => {
          bodyChunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
        });

        const proxyReq = http.request(
          {
            hostname: '127.0.0.1',
            port: 3000,
            path: `/api${reqUrl}`,
            method: req.method,
            headers: {
              ...req.headers,
              host: 'localhost:3000',
            },
          },
          (proxyRes) => {
            res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
            proxyRes.pipe(res);
          },
        );

        proxyReq.on('error', async () => {
          if (res.headersSent || res.writableEnded) return;

          if (reqUrl.startsWith('/activity-timeline')) {
            try {
              const url = new URL(reqUrl, 'http://localhost');
              const githubUser = url.searchParams.get('githubUser') || undefined;
              const leetcodeUser = url.searchParams.get('leetcodeUser') || undefined;
              const xHandle = url.searchParams.get('xHandle') || undefined;
              const mod = await server.ssrLoadModule('/api/activity-timeline.ts');
              const payload = await mod.fetchActivityTimeline({
                githubUser,
                leetcodeUser,
                xHandle,
              });
              res.writeHead(200, {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store, max-age=0',
              });
              res.end(JSON.stringify({success: true, ...payload}));
              return;
            } catch {
              res.writeHead(503, {'Content-Type': 'application/json'});
              res.end(JSON.stringify({success: false, events: []}));
              return;
            }
          }

          if (reqUrl.startsWith('/dossier-chat') && req.method === 'POST') {
            try {
              const rawBody = Buffer.concat(bodyChunks).toString('utf-8') || '{}';
              const body = JSON.parse(rawBody);
              const mod = await server.ssrLoadModule('/api/dossier-chat.ts');
              const reply = await mod.generateDossierChatReply({
                query: body.query || '',
                history: body.history || [],
              });
              res.writeHead(200, {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store, max-age=0',
              });
              res.end(JSON.stringify({success: true, ...reply}));
              return;
            } catch (e: any) {
              res.writeHead(500, {'Content-Type': 'application/json'});
              res.end(JSON.stringify({success: false, error: e?.message || 'RAG error'}));
              return;
            }
          }

          if (reqUrl.startsWith('/system-status')) {
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({totalVisits: 0, uniqueVisitors: 0, offline: true}));
            return;
          }

          res.writeHead(503, {'Content-Type': 'application/json'});
          res.end(JSON.stringify({success: false, offline: true}));
        });

        req.pipe(proxyReq);
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), devApiProxyFallbackPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'motion-vendor': ['motion'],
            'icons-vendor': ['lucide-react', 'react-icons'],
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâ€”file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

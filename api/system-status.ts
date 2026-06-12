import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // On Vercel, filesystem is read-only — return static/env-based analytics
  if (req.method === 'POST') {
    // Analytics tracking is a no-op on serverless (no persistent state)
    return res.json({ success: true, totalVisits: 1, uniqueVisitors: 1 });
  }

  return res.json({ totalVisits: 0, uniqueVisitors: 0 });
}

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');

  try {
    if (req.method === 'POST') {
      const { isNewVisitor } = req.body ?? {};

      // Increment total visits atomically
      const totalVisits = await redis.incr('totalVisits');

      let uniqueVisitors: number;
      if (isNewVisitor) {
        uniqueVisitors = await redis.incr('uniqueVisitors');
      } else {
        uniqueVisitors = (await redis.get<number>('uniqueVisitors')) ?? 0;
      }

      return res.json({ success: true, totalVisits, uniqueVisitors });
    }

    // GET — fetch current counts
    const [totalVisits, uniqueVisitors] = await Promise.all([
      redis.get<number>('totalVisits'),
      redis.get<number>('uniqueVisitors'),
    ]);

    return res.json({
      totalVisits: totalVisits ?? 0,
      uniqueVisitors: uniqueVisitors ?? 0,
    });
  } catch (err: any) {
    console.error('Redis error:', err);
    return res.json({ totalVisits: 0, uniqueVisitors: 0 });
  }
}

import type { VercelRequest, VercelResponse } from '@vercel/node';

// CountAPI - free, persistent, zero-setup counter service
// Namespace: moinn-portfolio | Keys: total-visits, unique-visitors
const NAMESPACE = 'moinn-portfolio-v2';
const TOTAL_KEY = 'total-visits';
const UNIQUE_KEY = 'unique-visitors';

async function getCount(key: string): Promise<number> {
  try {
    const res = await fetch(`https://api.countapi.xyz/get/${NAMESPACE}/${key}`);
    const data: any = await res.json();
    return data.value ?? 0;
  } catch {
    return 0;
  }
}

async function hitCount(key: string): Promise<number> {
  try {
    const res = await fetch(`https://api.countapi.xyz/hit/${NAMESPACE}/${key}`);
    const data: any = await res.json();
    return data.value ?? 0;
  } catch {
    return 0;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Allow cross-origin from own domain
  res.setHeader('Access-Control-Allow-Origin', '*');

  const isPing = req.method === 'POST';

  if (isPing) {
    const { isNewVisitor } = req.body ?? {};

    // Always increment total visits
    const [totalVisits, uniqueVisitors] = await Promise.all([
      hitCount(TOTAL_KEY),
      isNewVisitor ? hitCount(UNIQUE_KEY) : getCount(UNIQUE_KEY),
    ]);

    return res.json({ success: true, totalVisits, uniqueVisitors });
  }

  // GET — just fetch current counts
  const [totalVisits, uniqueVisitors] = await Promise.all([
    getCount(TOTAL_KEY),
    getCount(UNIQUE_KEY),
  ]);

  return res.json({ totalVisits, uniqueVisitors });
}

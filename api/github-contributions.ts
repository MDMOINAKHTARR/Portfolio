import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getGitHubContributions } from '../lib/github-contributions';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const username = (req.query.username as string) || 'MDMOINAKHTARR';

  try {
    const days = await getGitHubContributions(username);
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.json({ success: true, username, days });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch contributions';
    const status = message === 'GitHub profile not found' ? 404 : message === 'Invalid GitHub username' ? 400 : 502;
    console.error('GitHub contribution calendar error:', error);
    return res.status(status).json({ success: false, error: message });
  }
}

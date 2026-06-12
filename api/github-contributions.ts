import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const username = (req.query.username as string) || 'MDMOINAKHTARR';

  try {
    const url = `https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(username)}?y=last`;
    const response = await fetch(url, { headers: { Accept: 'application/json' } });

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: `Contributions API returned status ${response.status}`,
      });
    }

    const json: any = await response.json();
    const rawDays: { date: string; count: number; level: number }[] = json.contributions || [];
    rawDays.sort((a, b) => a.date.localeCompare(b.date));

    return res.json({ success: true, username, days: rawDays });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch contributions' });
  }
}

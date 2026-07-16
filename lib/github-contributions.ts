export interface GitHubContributionDay {
  date: string;
  count: number;
  level: number;
}

const GITHUB_USERNAME_PATTERN = /^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i;
const CONTRIBUTION_CELL_PATTERN = /<td\b([^>]*\bdata-date="[^"]+"[^>]*)><\/td>\s*<tool-tip\b[^>]*>([^<]*)<\/tool-tip>/g;
const ONE_DAY_MS = 86_400_000;

const toIsoDate = (date: Date) => date.toISOString().slice(0, 10);

export function parseGitHubContributionCalendar(html: string): GitHubContributionDay[] {
  const days: GitHubContributionDay[] = [];

  for (const match of html.matchAll(CONTRIBUTION_CELL_PATTERN)) {
    const attributes = match[1];
    const tooltip = match[2];
    const date = attributes.match(/\bdata-date="(\d{4}-\d{2}-\d{2})"/)?.[1];
    const levelValue = attributes.match(/\bdata-level="([0-4])"/)?.[1];

    if (!date || levelValue === undefined) continue;

    const countValue = tooltip.match(/\b(\d+)\s+contributions?\b/i)?.[1];
    days.push({
      date,
      count: countValue ? Number.parseInt(countValue, 10) : 0,
      level: Number.parseInt(levelValue, 10),
    });
  }

  return days;
}

async function fetchContributionYear(username: string, year: number): Promise<GitHubContributionDay[]> {
  const from = `${year}-01-01`;
  const to = `${year}-12-31`;
  const url = `https://github.com/users/${encodeURIComponent(username)}/contributions?from=${from}&to=${to}`;
  const response = await fetch(url, {
    headers: {
      Accept: 'text/html',
      'User-Agent': 'Moin-Portfolio-Contributions',
    },
    signal: AbortSignal.timeout(8_000),
  });

  if (response.status === 404) {
    throw new Error('GitHub profile not found');
  }

  if (!response.ok) {
    throw new Error(`GitHub calendar returned status ${response.status}`);
  }

  const days = parseGitHubContributionCalendar(await response.text());
  if (days.length === 0) {
    throw new Error('GitHub returned an unreadable contribution calendar');
  }

  return days;
}

export async function getGitHubContributions(username: string, today = new Date()): Promise<GitHubContributionDay[]> {
  if (!GITHUB_USERNAME_PATTERN.test(username)) {
    throw new Error('Invalid GitHub username');
  }

  const end = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  const start = new Date(end.getTime() - (364 * ONE_DAY_MS));
  const years = Array.from(new Set([start.getUTCFullYear(), end.getUTCFullYear()]));
  const yearlyDays = await Promise.all(years.map((year) => fetchContributionYear(username, year)));
  const startDate = toIsoDate(start);
  const endDate = toIsoDate(end);

  return yearlyDays
    .flat()
    .filter((day) => day.date >= startDate && day.date <= endDate)
    .sort((left, right) => left.date.localeCompare(right.date));
}

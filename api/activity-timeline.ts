import type { VercelRequest, VercelResponse } from '@vercel/node';

export type TimelineEventKind = 'commit' | 'star' | 'leetcode' | 'x' | 'github';

export interface TimelineEvent {
  id: string;
  kind: TimelineEventKind;
  actor: string;
  action: string;
  target: string;
  detail: string;
  at: number;
  url?: string;
}

const DEFAULT_GITHUB_USER = 'MDMOINAKHTARR';
const DEFAULT_LEETCODE_USER = '__moinn_';
const DEFAULT_X_HANDLE = 'Moincrafted';

const KNOWN_X_TWEET_IDS = [
  '2097019500835311787',
  '2076235594209042859',
  '2038219385077375293',
  '2034662071808508329',
];

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

async function fetchGithubAtomEvents(username: string): Promise<TimelineEvent[]> {
  const res = await fetch(`https://github.com/${encodeURIComponent(username)}.atom`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; MoinPortfolio/1.0)',
      Accept: 'application/atom+xml,text/xml,*/*',
    },
    signal: AbortSignal.timeout(5000),
  });

  if (!res.ok) {
    throw new Error(`GitHub Atom feed returned ${res.status}`);
  }

  const xml = await res.text();
  const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].slice(0, 12);
  const out: TimelineEvent[] = [];

  for (const match of entries) {
    const entry = match[1];
    const rawId = entry.match(/<id>([\s\S]*?)<\/id>/)?.[1]?.trim() || '';
    const published = entry.match(/<published>([\s\S]*?)<\/published>/)?.[1]?.trim() || '';
    const link = entry.match(/<link[^>]*href="([^"]+)"/)?.[1]?.trim() || '';
    const title = decodeHtmlEntities(entry.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1]?.trim() || '');
    const contentRaw = entry.match(/<content[^>]*>([\s\S]*?)<\/content>/)?.[1] || '';
    const contentHtml = decodeHtmlEntities(contentRaw);

    const at = new Date(published).getTime();
    if (Number.isNaN(at)) continue;

    if (rawId.includes(':star/') || /\bstarred\b/i.test(title)) {
      const target = title.replace(new RegExp(`^${username}\\s+starred\\s+`, 'i'), '').trim();
      const descMatch = contentHtml.match(/repo-description[^>]*>\s*<p>([\s\S]*?)<\/p>/i);
      const detail = descMatch ? stripTags(descMatch[1]) : 'Starred repository on GitHub';
      const eventNum = rawId.split('/').pop() || target;

      out.push({
        id: `gh-star-${eventNum}`,
        kind: 'star',
        actor: username,
        action: 'starred',
        target,
        detail,
        at,
        url: link || `https://github.com/${target}`,
      });
      continue;
    }

    if (rawId.includes(':push/') || /\bpushed\b/i.test(title)) {
      const repoMatch = contentHtml.match(/href="\/([^/"]+\/[^/"]+)"[^>]*>[^<]+<\/a>\s*<span>/i);
      const fullRepo = repoMatch?.[1] || title.replace(new RegExp(`^${username}\\s+pushed\\s+(?:to\\s+)?`, 'i'), '').trim();
      const shortRepo = fullRepo.toLowerCase().startsWith(`${username.toLowerCase()}/`)
        ? fullRepo.slice(username.length + 1)
        : fullRepo;
      const branchMatch = contentHtml.match(/class="branch-name"[^>]*>([^<]+)<\/a>/i);
      const branch = branchMatch?.[1]?.trim() || 'main';
      const shaMatch = contentHtml.match(/\/commit\/([a-f0-9]{7,40})/i);
      const sha = shaMatch?.[1];
      const msgMatch = contentHtml.match(/<blockquote>([\s\S]*?)<\/blockquote>/i);
      const commitMsg = msgMatch ? stripTags(msgMatch[1]) : `Pushed commit to ${branch}`;
      const eventNum = sha ? sha.slice(0, 7) : rawId.split('/').pop() || String(at);

      out.push({
        id: `gh-push-${eventNum}`,
        kind: 'commit',
        actor: username,
        action: 'pushed to',
        target: `${shortRepo}:${branch}`,
        detail: commitMsg,
        at,
        url: sha && fullRepo.includes('/')
          ? `https://github.com/${fullRepo}/commit/${sha}`
          : link || `https://github.com/${fullRepo}`,
      });
      continue;
    }

    if (rawId.includes(':create/') || /\bcreated\b/i.test(title)) {
      const repoMatch = link.match(/github\.com\/([^/]+\/[^/]+)/i);
      const fullRepo = repoMatch?.[1] || title;
      const shortRepo = fullRepo.toLowerCase().startsWith(`${username.toLowerCase()}/`)
        ? fullRepo.slice(username.length + 1)
        : fullRepo;
      const eventNum = rawId.split('/').pop() || shortRepo;

      out.push({
        id: `gh-create-${eventNum}`,
        kind: 'github',
        actor: username,
        action: 'created',
        target: shortRepo,
        detail: title,
        at,
        url: link || `https://github.com/${username}`,
      });
    }
  }

  return out;
}

function githubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'Moin-Portfolio-Activity-Timeline',
  };
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function fetchGithubEvents(username: string): Promise<TimelineEvent[]> {
  try {
    const atomEvents = await fetchGithubAtomEvents(username);
    if (atomEvents.length > 0) {
      return atomEvents;
    }
  } catch {
    // Fall through to GitHub REST API if Atom feed fails
  }

  const res = await fetch(
    `https://api.github.com/users/${encodeURIComponent(username)}/events/public?per_page=15`,
    {
      headers: githubHeaders(),
      signal: AbortSignal.timeout(5000),
    }
  );

  if (!res.ok) {
    throw new Error(`GitHub events API returned ${res.status}`);
  }

  const data = await res.json();
  if (!Array.isArray(data)) {
    return [];
  }

  const relevant = data
    .filter((item: any) =>
      item?.type === 'PushEvent' ||
      item?.type === 'WatchEvent' ||
      item?.type === 'PullRequestEvent' ||
      (item?.type === 'CreateEvent' && item?.payload?.ref_type === 'repository')
    )
    .slice(0, 8);

  const mapped = await Promise.all(
    relevant.map(async (item: any): Promise<TimelineEvent | null> => {
      const repo: string = item.repo?.name || '';
      const at = new Date(item.created_at).getTime();
      if (!repo || Number.isNaN(at)) return null;

      const shortRepo = repo.toLowerCase().startsWith(`${username.toLowerCase()}/`)
        ? repo.slice(username.length + 1)
        : repo;

      if (item.type === 'PushEvent') {
        const sha: string | undefined = item.payload?.head;
        const branch = item.payload?.ref?.replace('refs/heads/', '') || 'main';
        let commitMsg: string = item.payload?.commits?.[0]?.message?.split('\n')[0]?.trim() || '';

        if (!commitMsg && sha) {
          try {
            const cRes = await fetch(`https://api.github.com/repos/${repo}/commits/${sha}`, {
              headers: githubHeaders(),
              signal: AbortSignal.timeout(3500),
            });
            if (cRes.ok) {
              const cData = await cRes.json();
              commitMsg = cData?.commit?.message?.split('\n')[0]?.trim() || '';
            }
          } catch {
            // Ignore secondary lookup failure
          }
        }

        return {
          id: `gh-push-${sha ? sha.slice(0, 7) : item.id}`,
          kind: 'commit',
          actor: username,
          action: 'pushed to',
          target: `${shortRepo}:${branch}`,
          detail: commitMsg || `Pushed commit to ${branch}`,
          at,
          url: `https://github.com/${repo}${sha ? `/commit/${sha}` : ''}`,
        };
      }

      if (item.type === 'WatchEvent') {
        let description = '';
        try {
          const rRes = await fetch(`https://api.github.com/repos/${repo}`, {
            headers: githubHeaders(),
            signal: AbortSignal.timeout(3500),
          });
          if (rRes.ok) {
            const rData = await rRes.json();
            description = typeof rData?.description === 'string' ? rData.description.trim() : '';
          }
        } catch {
          // Ignore secondary lookup failure
        }

        return {
          id: `gh-star-${item.id || repo}`,
          kind: 'star',
          actor: username,
          action: 'starred',
          target: repo,
          detail: description || 'Starred repository on GitHub',
          at,
          url: `https://github.com/${repo}`,
        };
      }

      if (item.type === 'PullRequestEvent') {
        const pr = item.payload?.pull_request;
        const prAction = pr?.merged ? 'merged PR in' : `${item.payload?.action || 'updated'} PR in`;
        return {
          id: `gh-pr-${item.id}`,
          kind: 'github',
          actor: username,
          action: prAction,
          target: shortRepo,
          detail: pr?.title || `Pull request #${item.payload?.number || ''}`.trim(),
          at,
          url: pr?.html_url || `https://github.com/${repo}`,
        };
      }

      if (item.type === 'CreateEvent') {
        return {
          id: `gh-create-${item.id}`,
          kind: 'github',
          actor: username,
          action: 'created',
          target: shortRepo,
          detail: item.payload?.description || 'Created new repository',
          at,
          url: `https://github.com/${repo}`,
        };
      }

      return null;
    })
  );

  return mapped.filter((e): e is TimelineEvent => e !== null);
}

async function fetchLeetCodeEvents(username: string): Promise<TimelineEvent[]> {
  const res = await fetch('https://leetcode.com/graphql', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      referer: 'https://leetcode.com',
    },
    body: JSON.stringify({
      query: `
        query recentAcSubmissions($username: String!, $limit: Int!) {
          recentAcSubmissionList(username: $username, limit: $limit) {
            id
            title
            titleSlug
            timestamp
          }
        }
      `,
      variables: { username, limit: 6 },
    }),
    signal: AbortSignal.timeout(5000),
  });

  if (!res.ok) {
    throw new Error(`LeetCode GraphQL returned ${res.status}`);
  }

  const json = await res.json();
  const list = json?.data?.recentAcSubmissionList;
  if (!Array.isArray(list)) {
    return [];
  }

  return list
    .filter((sub: any) => sub?.id && sub?.title && sub?.timestamp)
    .map((sub: any): TimelineEvent => ({
      id: `lc-${sub.id}`,
      kind: 'leetcode',
      actor: username,
      action: 'solved',
      target: sub.title,
      detail: 'Accepted submission on LeetCode',
      at: Number(sub.timestamp) * 1000,
      url: `https://leetcode.com/problems/${sub.titleSlug}/`,
    }));
}

async function fetchXSyndicationEvents(handle: string): Promise<TimelineEvent[]> {
  const results = await Promise.allSettled(
    KNOWN_X_TWEET_IDS.map(async (id): Promise<TimelineEvent | null> => {
      const res = await fetch(
        `https://cdn.syndication.twimg.com/tweet-result?id=${id}&lang=en&token=a`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; MoinPortfolio/1.0)',
            Accept: 'application/json',
          },
          signal: AbortSignal.timeout(4000),
        }
      );
      if (!res.ok) return null;
      const data = await res.json();
      const text = typeof data?.text === 'string'
        ? data.text.replace(/https?:\/\/t\.co\/\S+/g, '').replace(/\s+/g, ' ').trim()
        : '';
      if (!text) return null;
      const at = data?.created_at ? new Date(data.created_at).getTime() : Date.now();
      return {
        id: `x-${id}`,
        kind: 'x',
        actor: `@${handle}`,
        action: 'broadcast on',
        target: 'X-COMMS',
        detail: text,
        at: Number.isNaN(at) ? Date.now() : at,
        url: `https://x.com/${handle}/status/${id}`,
      };
    })
  );

  return results
    .filter((r): r is PromiseFulfilledResult<TimelineEvent | null> => r.status === 'fulfilled')
    .map((r) => r.value)
    .filter((e): e is TimelineEvent => e !== null);
}

async function fetchXEvents(handle: string): Promise<TimelineEvent[]> {
  const bearerToken = process.env.X_BEARER_TOKEN || process.env.TWITTER_BEARER_TOKEN;
  if (!bearerToken) {
    return fetchXSyndicationEvents(handle);
  }

  const userRes = await fetch(
    `https://api.twitter.com/2/users/by/username/${encodeURIComponent(handle)}`,
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      signal: AbortSignal.timeout(4000),
    }
  );
  if (!userRes.ok) return [];
  const userData = await userRes.json();
  const userId = userData?.data?.id;
  if (!userId) return [];

  const tweetsRes = await fetch(
    `https://api.twitter.com/2/users/${userId}/tweets?max_results=5&tweet.fields=created_at`,
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      signal: AbortSignal.timeout(4000),
    }
  );
  if (!tweetsRes.ok) return [];
  const tweetsData = await tweetsRes.json();
  if (!Array.isArray(tweetsData?.data)) return [];

  return tweetsData.data.map((t: any): TimelineEvent => ({
    id: `x-${t.id}`,
    kind: 'x',
    actor: `@${handle}`,
    action: 'broadcast on',
    target: 'X-COMMS',
    detail: (t.text || '').replace(/\s+/g, ' ').trim(),
    at: t.created_at ? new Date(t.created_at).getTime() : Date.now(),
    url: `https://x.com/${handle}/status/${t.id}`,
  }));
}

export function deduplicateTimelineEvents(list: TimelineEvent[]): TimelineEvent[] {
  const seenKeys = new Set<string>();
  const out: TimelineEvent[] = [];

  for (const item of list) {
    let key = '';
    if (item.kind === 'star') {
      key = `star:${item.target.toLowerCase().trim()}`;
    } else if (item.kind === 'commit' || item.kind === 'github') {
      const shaMatch = item.url?.match(/commit\/([a-f0-9]{7,40})/i) || item.id.match(/gh-push-([a-f0-9]{7})/i);
      if (shaMatch) {
        key = `commit:sha:${shaMatch[1].slice(0, 7).toLowerCase()}`;
      } else {
        key = `${item.kind}:${item.target.toLowerCase()}:${item.id}`;
      }
    } else if (item.kind === 'leetcode') {
      key = `lc:${item.target.toLowerCase().trim()}`;
    } else if (item.kind === 'x') {
      const statusIdMatch = item.url?.match(/status\/(\d+)/) || item.id.match(/\d{15,}/);
      key = statusIdMatch ? `x:${statusIdMatch[1]}` : `x:${item.id}`;
    } else {
      key = `${item.kind}:${item.id}`;
    }

    if (seenKeys.has(key)) continue;
    seenKeys.add(key);
    out.push(item);
  }

  return out.sort((a, b) => b.at - a.at);
}

export async function fetchActivityTimeline(options?: {
  githubUser?: string;
  leetcodeUser?: string;
  xHandle?: string;
}) {
  const githubUser = options?.githubUser || DEFAULT_GITHUB_USER;
  const leetcodeUser = options?.leetcodeUser || DEFAULT_LEETCODE_USER;
  const xHandle = options?.xHandle || DEFAULT_X_HANDLE;

  const [ghResult, lcResult, xResult] = await Promise.allSettled([
    fetchGithubEvents(githubUser),
    fetchLeetCodeEvents(leetcodeUser),
    fetchXEvents(xHandle),
  ]);

  const combined: TimelineEvent[] = [];
  const sources: Record<string, { ok: boolean; count: number }> = {
    github: { ok: ghResult.status === 'fulfilled', count: ghResult.status === 'fulfilled' ? ghResult.value.length : 0 },
    leetcode: { ok: lcResult.status === 'fulfilled', count: lcResult.status === 'fulfilled' ? lcResult.value.length : 0 },
    x: { ok: xResult.status === 'fulfilled', count: xResult.status === 'fulfilled' ? xResult.value.length : 0 },
  };

  if (ghResult.status === 'fulfilled') combined.push(...ghResult.value);
  if (lcResult.status === 'fulfilled') combined.push(...lcResult.value);
  if (xResult.status === 'fulfilled') combined.push(...xResult.value);

  const events = deduplicateTimelineEvents(combined);

  return {
    events,
    sources,
    fetchedAt: Date.now(),
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  try {
    const githubUser = typeof req.query.githubUser === 'string' ? req.query.githubUser : undefined;
    const leetcodeUser = typeof req.query.leetcodeUser === 'string' ? req.query.leetcodeUser : undefined;
    const xHandle = typeof req.query.xHandle === 'string' ? req.query.xHandle : undefined;

    const payload = await fetchActivityTimeline({ githubUser, leetcodeUser, xHandle });
    return res.json({ success: true, ...payload });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch activity timeline';
    console.error('Activity timeline error:', error);
    return res.status(500).json({ success: false, error: message, events: [] });
  }
}


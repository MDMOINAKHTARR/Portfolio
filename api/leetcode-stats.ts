import type { VercelRequest, VercelResponse } from '@vercel/node';

const LEETCODE_USERNAME_PATTERN = /^[a-z0-9_-]{3,30}$/i;

export async function fetchLeetCodeStats(username: string) {
  if (!LEETCODE_USERNAME_PATTERN.test(username)) {
    throw new Error('Invalid LeetCode username');
  }

  const response = await fetch('https://leetcode.com/graphql', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'referer': 'https://leetcode.com',
    },
    body: JSON.stringify({
      query: `
        query userProblemsSolved($username: String!) {
          allQuestionsCount {
            difficulty
            count
          }
          matchedUser(username: $username) {
            profile {
              ranking
              reputation
            }
            submissionCalendar
            submitStats {
              acSubmissionNum {
                difficulty
                count
                submissions
              }
            }
          }
        }
      `,
      variables: { username },
    }),
  });

  if (!response.ok) {
    throw new Error(`LeetCode API returned status ${response.status}`);
  }

  const result = await response.json();
  
  if (result.errors && result.errors.length > 0) {
    throw new Error(result.errors[0].message || 'Error querying LeetCode API');
  }

  const data = result.data;
  if (!data || !data.matchedUser) {
    throw new Error('LeetCode profile not found');
  }

  const allQuestions = data.allQuestionsCount || [];
  const solvedStats = data.matchedUser.submitStats?.acSubmissionNum || [];

  const getQuestionCount = (difficulty: string) => 
    allQuestions.find((q: any) => q.difficulty === difficulty)?.count || 0;

  const getSolvedCount = (difficulty: string) => 
    solvedStats.find((s: any) => s.difficulty === difficulty)?.count || 0;

  const getSubmissionsCount = (difficulty: string) => 
    solvedStats.find((s: any) => s.difficulty === difficulty)?.submissions || 0;

  // Parse submissionCalendar and generate 365-day array aligned to Sunday
  let calendar: Record<string, number> = {};
  try {
    calendar = JSON.parse(data.matchedUser.submissionCalendar || '{}');
  } catch (e) {
    console.error('Failed to parse LeetCode submissionCalendar:', e);
  }

  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 365);
  // Align to Sunday
  const startDayOfWeek = startDate.getDay();
  startDate.setDate(startDate.getDate() - startDayOfWeek);

  const days: { date: string; count: number; level: number }[] = [];
  const currentDate = new Date(startDate);
  currentDate.setUTCHours(0, 0, 0, 0);

  const endCompare = new Date(today);
  endCompare.setUTCHours(23, 59, 59, 999);

  while (currentDate <= endCompare) {
    const yyyy = currentDate.getUTCFullYear();
    const mm = String(currentDate.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(currentDate.getUTCDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    const utcTimestampSeconds = Math.floor(currentDate.getTime() / 1000);
    const count = calendar[String(utcTimestampSeconds)] || 0;

    let level = 0;
    if (count > 0) {
      if (count <= 2) level = 1;
      else if (count <= 5) level = 2;
      else if (count <= 9) level = 3;
      else level = 4;
    }

    days.push({
      date: dateStr,
      count,
      level,
    });

    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }

  return {
    username,
    ranking: data.matchedUser.profile?.ranking || 0,
    reputation: data.matchedUser.profile?.reputation || 0,
    totalQuestions: getQuestionCount('All'),
    easyQuestions: getQuestionCount('Easy'),
    mediumQuestions: getQuestionCount('Medium'),
    hardQuestions: getQuestionCount('Hard'),
    totalSolved: getSolvedCount('All'),
    easySolved: getSolvedCount('Easy'),
    mediumSolved: getSolvedCount('Medium'),
    hardSolved: getSolvedCount('Hard'),
    totalSubmissions: getSubmissionsCount('All'),
    days,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const username = (req.query.username as string) || '__moinn_';

  try {
    const stats = await fetchLeetCodeStats(username);
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.json({ success: true, ...stats });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch LeetCode statistics';
    const status = message === 'LeetCode profile not found' ? 404 : message === 'Invalid LeetCode username' ? 400 : 502;
    console.error('LeetCode stats error:', error);
    return res.status(status).json({ success: false, error: message });
  }
}

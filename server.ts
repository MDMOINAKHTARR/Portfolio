import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { fetchActivityTimeline } from "./api/activity-timeline";
import { generateDossierChatReply } from "./api/dossier-chat";
import { generateDossierVoiceReply } from "./api/dossier-voice";

// Visitor tracking memory state
const analyticsFile = path.join(process.cwd(), "analytics.json");
let totalVisits = 0;
let uniqueVisitors = 0;

if (fs.existsSync(analyticsFile)) {
  try {
    const data = JSON.parse(fs.readFileSync(analyticsFile, "utf-8"));
    totalVisits = data.totalVisits || 0;
    uniqueVisitors = data.uniqueVisitors || 0;
  } catch (err) {
    console.error("Error reading analytics file", err);
  }
}

function saveAnalytics() {
  try {
    fs.writeFileSync(analyticsFile, JSON.stringify({ totalVisits, uniqueVisitors }));
  } catch (err) {
    console.error("Error writing analytics file", err);
  }
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  // Use JSON middleware to parse POST requests
  app.use(express.json());

  // System endpoints
  app.post("/api/system-status/ping", (req, res) => {
    const { isNewVisitor } = req.body;
    totalVisits++;
    if (isNewVisitor) {
      uniqueVisitors++;
    }
    saveAnalytics();
    res.json({ totalVisits, uniqueVisitors });
  });

  app.get("/api/system-status", (req, res) => {
    res.json({ totalVisits, uniqueVisitors });
  });

  app.post("/api/dossier-chat", async (req, res) => {
    try {
      const { query, history, routeContext, lens, stream } = req.body || {};
      if (!query || typeof query !== "string") {
        return res.status(400).json({ success: false, error: "Missing query" });
      }
      const clientIp =
        (typeof req.headers["x-forwarded-for"] === "string"
          ? req.headers["x-forwarded-for"].split(",")[0].trim()
          : req.ip) || "unknown";

      if (stream) {
        res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
        res.setHeader("Cache-Control", "no-cache, no-transform");
        res.setHeader("Connection", "keep-alive");
        res.flushHeaders?.();

        const reply = await generateDossierChatReply({
          query,
          history,
          routeContext,
          lens,
          clientIp,
          onToken: (text) => {
            res.write(`data: ${JSON.stringify({ type: "token", text })}\n\n`);
          },
        });
        res.write(`data: ${JSON.stringify({ type: "done", response: reply })}\n\n`);
        return res.end();
      }

      const reply = await generateDossierChatReply({
        query,
        history,
        routeContext,
        lens,
        clientIp,
      });
      res.json({ success: true, ...reply });
    } catch (error: any) {
      console.error("Error in /api/dossier-chat:", error);
      res.status(500).json({ success: false, error: error?.message || "Failed to generate chat response" });
    }
  });

  app.post("/api/dossier-voice", async (req, res) => {
    try {
      const text = typeof req.body?.text === "string" ? req.body.text : "";
      if (!text.trim()) {
        return res.status(400).json({ success: false, error: "Missing text" });
      }
      const result = await generateDossierVoiceReply(text);
      res.json(result);
    } catch (error: any) {
      res.json({ success: false, fallback: "browser", error: error?.message || "Voice fallback" });
    }
  });

  app.get("/api/activity-timeline", async (req, res) => {
    try {
      res.setHeader("Cache-Control", "no-store, max-age=0");
      const githubUser = typeof req.query.githubUser === "string" ? req.query.githubUser : undefined;
      const leetcodeUser = typeof req.query.leetcodeUser === "string" ? req.query.leetcodeUser : undefined;
      const xHandle = typeof req.query.xHandle === "string" ? req.query.xHandle : undefined;

      const payload = await fetchActivityTimeline({ githubUser, leetcodeUser, xHandle });
      res.json({ success: true, ...payload });
    } catch (error: any) {
      console.error("Error in /api/activity-timeline:", error);
      res.status(500).json({ success: false, error: error.message || "Failed to fetch activity timeline", events: [] });
    }
  });

  app.get("/api/github-contributions", async (req, res) => {
    try {
      const username = (req.query.username as string) || "MDMOINAKHTARR";

      // Use public GitHub contributions JSON API (no auth required)
      const url = `https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(username)}?y=last`;

      const response = await fetch(url, { headers: { 'Accept': 'application/json' } });

      if (!response.ok) {
        return res.status(response.status).json({ success: false, error: `Contributions API returned status ${response.status}` });
      }

      const json: any = await response.json();

      // API returns { contributions: [ { date, count, level }, ... ] }
      const rawDays: { date: string; count: number; level: number }[] = json.contributions || [];
      rawDays.sort((a, b) => a.date.localeCompare(b.date));

      res.json({ success: true, username, days: rawDays });
    } catch (error: any) {
      console.error("Error in /api/github-contributions:", error);
      res.status(500).json({ success: false, error: error.message || "Failed to fetch GitHub contributions" });
    }
  });

  // In-memory cache for GitHub activity events (5-min TTL)
  let cachedGithubEvents: { timestamp: number; events: any[] } | null = null;

  app.get("/api/github-events", async (req, res) => {
    try {
      const username = (req.query.username as string) || "MDMOINAKHTARR";
      const now = Date.now();
      if (cachedGithubEvents && now - cachedGithubEvents.timestamp < 300_000) {
        return res.json({ success: true, events: cachedGithubEvents.events, source: "cache" });
      }

      const eventsRes = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/events`, {
        headers: { Accept: "application/vnd.github.v3+json", "User-Agent": "Antigravity-Portfolio" }
      });

      if (!eventsRes.ok) {
        if (cachedGithubEvents) {
          return res.json({ success: true, events: cachedGithubEvents.events, source: "stale_cache" });
        }
        return res.status(eventsRes.status).json({ success: false, error: `GitHub events API returned status ${eventsRes.status}` });
      }

      const data = await eventsRes.json();
      if (!Array.isArray(data)) {
        return res.status(500).json({ success: false, error: "Unexpected GitHub API response" });
      }

      const results = [];
      for (const item of data.slice(0, 10)) {
        const at = new Date(item.created_at).getTime();
        if (item.type === "PushEvent") {
          const sha = item.payload?.head;
          const repo = item.repo?.name || "";
          let commitMsg = "";
          if (item.payload?.commits && item.payload.commits[0]?.message) {
            commitMsg = item.payload.commits[0].message.split("\n")[0];
          } else if (sha && repo) {
            try {
              const cRes = await fetch(`https://api.github.com/repos/${repo}/commits/${sha}`, {
                headers: { Accept: "application/vnd.github.v3+json", "User-Agent": "Antigravity-Portfolio" }
              });
              if (cRes.ok) {
                const cData = await cRes.json();
                commitMsg = cData.commit?.message?.split("\n")[0] || "";
              }
            } catch {
              // ignore
            }
          }
          const targetRepo = repo.replace(`${username}/`, "");
          const branch = item.payload?.ref?.replace("refs/heads/", "") || "main";
          results.push({
            id: `gh-push-${sha ? sha.slice(0, 7) : item.id}`,
            kind: "commit",
            actor: username,
            action: "pushed to",
            target: `${targetRepo}:${branch}`,
            detail: commitMsg,
            at,
            url: `https://github.com/${repo}${sha ? `/commit/${sha}` : ""}`
          });
        } else if (item.type === "WatchEvent") {
          results.push({
            id: `gh-star-${item.id}`,
            kind: "star",
            actor: username,
            action: "starred",
            target: item.repo?.name || "repository",
            detail: "",
            at,
            url: `https://github.com/${item.repo?.name}`
          });
        }
      }

      cachedGithubEvents = { timestamp: now, events: results };
      res.json({ success: true, events: results, source: "live" });
    } catch (error: any) {
      console.error("Error in /api/github-events:", error);
      if (cachedGithubEvents) {
        return res.json({ success: true, events: cachedGithubEvents.events, source: "fallback_cache" });
      }
      res.status(500).json({ success: false, error: error.message || "Failed to fetch GitHub events" });
    }
  });

  app.get("/api/leetcode-stats", async (req, res) => {
    try {
      const username = (req.query.username as string) || "__moinn_";
      const LEETCODE_USERNAME_PATTERN = /^[a-z0-9_-]{3,30}$/i;
      
      if (!LEETCODE_USERNAME_PATTERN.test(username)) {
        return res.status(400).json({ success: false, error: "Invalid LeetCode username" });
      }

      const response = await fetch("https://leetcode.com/graphql", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "referer": "https://leetcode.com"
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
          variables: { username }
        })
      });

      if (!response.ok) {
        return res.status(response.status).json({ success: false, error: `LeetCode API returned status ${response.status}` });
      }

      const result = await response.json();

      if (result.errors && result.errors.length > 0) {
        return res.status(400).json({ success: false, error: result.errors[0].message || "Error querying LeetCode API" });
      }

      const data = result.data;
      if (!data || !data.matchedUser) {
        return res.status(404).json({ success: false, error: "LeetCode profile not found" });
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
        calendar = JSON.parse(data.matchedUser.submissionCalendar || "{}");
      } catch (e) {
        console.error("Failed to parse LeetCode submissionCalendar:", e);
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
        const mm = String(currentDate.getUTCMonth() + 1).padStart(2, "0");
        const dd = String(currentDate.getUTCDate()).padStart(2, "0");
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

      res.json({
        success: true,
        username,
        ranking: data.matchedUser.profile?.ranking || 0,
        reputation: data.matchedUser.profile?.reputation || 0,
        totalQuestions: getQuestionCount("All"),
        easyQuestions: getQuestionCount("Easy"),
        mediumQuestions: getQuestionCount("Medium"),
        hardQuestions: getQuestionCount("Hard"),
        totalSolved: getSolvedCount("All"),
        easySolved: getSolvedCount("Easy"),
        mediumSolved: getSolvedCount("Medium"),
        hardSolved: getSolvedCount("Hard"),
        totalSubmissions: getSubmissionsCount("All"),
        days
      });
    } catch (error: any) {
      console.error("Error in /api/leetcode-stats:", error);
      res.status(500).json({ success: false, error: error.message || "Failed to fetch LeetCode statistics" });
    }
  });

  // API route for live X / Twitter dispatches
  app.get("/api/x-dispatches", async (req, res) => {
    try {
      const handle = (req.query.handle as string) || "Moincrafted";
      const bearerToken = process.env.X_BEARER_TOKEN || process.env.TWITTER_BEARER_TOKEN;

      // 1. If official Twitter Bearer Token is configured in environment, fetch live user timeline
      if (bearerToken) {
        try {
          const userRes = await fetch(`https://api.twitter.com/2/users/by/username/${encodeURIComponent(handle)}`, {
            headers: { Authorization: `Bearer ${bearerToken}` }
          });
          if (userRes.ok) {
            const userData = await userRes.json();
            const userId = userData.data?.id;
            if (userId) {
              const tweetsRes = await fetch(`https://api.twitter.com/2/users/${userId}/tweets?max_results=10&tweet.fields=created_at`, {
                headers: { Authorization: `Bearer ${bearerToken}` }
              });
              if (tweetsRes.ok) {
                const tweetsData = await tweetsRes.json();
                if (Array.isArray(tweetsData.data)) {
                  const liveTweets = tweetsData.data.map((t: any) => ({
                    id: t.id,
                    author: userData.data?.name || "Md Moin Akhtar",
                    handle: `@${handle}`,
                    url: `https://x.com/${handle}/status/${t.id}`,
                    text: t.text,
                    dateStr: t.created_at,
                    timestamp: new Date(t.created_at).getTime(),
                  }));
                  return res.json({ success: true, source: "twitter_api_v2", tweets: liveTweets });
                }
              }
            }
          }
        } catch (apiErr) {
          console.warn("Twitter API v2 fetch error, falling back to official oEmbed:", apiErr);
        }
      }

      // 2. Query official X oEmbed API to fetch live real tweet data, timestamps and text
      const tweetIds = [
        "2097019500835311787",
        "2076235594209042859",
        "2038219385077375293",
        "2034662071808508329"
      ];

      const tweetPromises = tweetIds.map(async (id) => {
        try {
          const oembedRes = await fetch(`https://publish.twitter.com/oembed?url=https://x.com/${handle}/status/${id}`);
          if (!oembedRes.ok) return null;
          const data = await oembedRes.json();

          const textMatch = data.html?.match(/<p[^>]*>([\s\S]*?)<\/p>/);
          const rawText = textMatch ? textMatch[1].replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, "").trim() : "";
          const cleanText = rawText
            .replace(/&#39;/g, "'")
            .replace(/&quot;/g, '"')
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">");

          const dateMatch = data.html?.match(/>([^<]+)<\/a><\/blockquote>/);
          const dateStr = dateMatch ? dateMatch[1] : "";

          return {
            id,
            author: data.author_name || "Md Moin Akhtar",
            handle: "@Moincrafted",
            url: data.url || `https://x.com/${handle}/status/${id}`,
            text: cleanText,
            dateStr,
            timestamp: dateStr ? new Date(dateStr).getTime() : Date.now(),
          };
        } catch {
          return null;
        }
      });

      const fetchedTweets = (await Promise.all(tweetPromises)).filter(Boolean);
      res.json({ success: true, source: "x_official_oembed", tweets: fetchedTweets });
    } catch (error: any) {
      console.error("Error in /api/x-dispatches:", error);
      res.status(500).json({ success: false, error: error.message || "Failed to fetch X dispatches" });
    }
  });

  // API route for Telegram message
  app.post("/api/contact", async (req, res) => {
    try {
      const { name, message } = req.body;
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      const chatId = process.env.TELEGRAM_CHAT_ID;

      if (!botToken || !chatId) {
         return res.status(500).json({ success: false, error: "Telegram credentials not configured in environment variables." });
      }

      if (!name || !message) {
         return res.status(400).json({ success: false, error: "Name and message are required." });
      }

      function escapeHTML(str: string): string {
        return str
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
      }

      const escapedName = escapeHTML(name);
      const escapedMessage = escapeHTML(message);

      const now = new Date();
      const formattedDate = now.toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
      });
      const sentAt = `${formattedDate} GMT+5:30`;

      const text = `🚀 <b>New Message Received</b> 📩\n\n` +
                   `👤 <b>From:</b> ${escapedName}\n\n` +
                   `📝 <b>Message:</b>\n${escapedMessage}\n\n` +
                   `⏰ <b>Sent at:</b> ${sentAt}\n\n` +
                   `💡 <b>Tip:</b> You can quickly copy the message by clicking the text box below 👇\n\n` +
                   `<pre>${escapedMessage}</pre>`;

      const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

      const tgRes = await fetch(telegramUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: "HTML"
        })
      });

      const tgData = await tgRes.json();
      if (!tgRes.ok) {
        console.error("Telegram error:", tgData);
        return res.status(500).json({ success: false, error: "Failed to transmit message." });
      }

      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, error: "Internal server error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { maxAge: '7d', etag: true }));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

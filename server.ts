import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

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
  const PORT = 3000;

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

  app.get("/api/github-contributions", async (req, res) => {
    try {
      const username = (req.query.username as string) || "MDMOINAKHTARR";
      const url = `https://github.com/users/${username}/contributions`;
      
      const response = await fetch(url);
      if (!response.ok) {
        return res.status(response.status).json({ success: false, error: `GitHub returned status ${response.status}` });
      }
      const html = await response.text();
      
      // Find all ContributionCalendar-day td tags
      const tdRegex = /<td[^>]+class="[^"]*ContributionCalendar-day[^"]*"[^>]*>/g;
      const matches = html.match(tdRegex) || [];
      const days: any[] = [];
      
      for (const tag of matches) {
        const idMatch = tag.match(/id="([^"]+)"/);
        const dateMatch = tag.match(/data-date="([^"]+)"/);
        const levelMatch = tag.match(/data-level="([^"]+)"/);
        
        if (idMatch && dateMatch && levelMatch) {
          days.push({
            id: idMatch[1],
            date: dateMatch[1],
            level: parseInt(levelMatch[1], 10),
            count: 0
          });
        }
      }
      
      // Parse tool-tips
      const tooltipRegex = /<tool-tip[^>]*for="([^"]+)"[^>]*>([\s\S]*?)<\/tool-tip>/gi;
      const tooltipMap = new Map<string, string>();
      let tMatch;
      while ((tMatch = tooltipRegex.exec(html)) !== null) {
        tooltipMap.set(tMatch[1], tMatch[2].trim());
      }

      // Enhance days with counts
      for (const d of days) {
        const text = tooltipMap.get(d.id);
        if (text) {
          if (text.startsWith("No ")) {
            d.count = 0;
          } else {
            const numMatch = text.match(/^([\d,]+)/);
            if (numMatch) {
              d.count = parseInt(numMatch[1].replace(/,/g, ''), 10);
            }
          }
        }
      }

      // Sort chronologically
      days.sort((a, b) => a.date.localeCompare(b.date));

      res.json({ success: true, username, days });
    } catch (error: any) {
      console.error("Error in /api/github-contributions:", error);
      res.status(500).json({ success: false, error: error.message || "Failed to fetch GitHub contributions" });
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
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

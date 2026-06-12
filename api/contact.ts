import type { VercelRequest, VercelResponse } from '@vercel/node';

function escapeHTML(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { name, message } = req.body;
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return res.status(500).json({ success: false, error: 'Telegram credentials not configured.' });
  }

  if (!name || !message) {
    return res.status(400).json({ success: false, error: 'Name and message are required.' });
  }

  const sentAt = new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
  });

  const text =
    `🚀 <b>New Message Received</b> 📩\n\n` +
    `👤 <b>From:</b> ${escapeHTML(name)}\n\n` +
    `📝 <b>Message:</b>\n${escapeHTML(message)}\n\n` +
    `⏰ <b>Sent at:</b> ${sentAt} GMT+5:30\n\n` +
    `<pre>${escapeHTML(message)}</pre>`;

  try {
    const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
    });

    const tgData = await tgRes.json();
    if (!tgRes.ok) {
      return res.status(500).json({ success: false, error: 'Failed to transmit message.' });
    }

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

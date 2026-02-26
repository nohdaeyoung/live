# daeyoung-dyno-bots

Telegram multi-bot router (Next.js API) — template scaffold created by Alfred.

Structure
- pages/api/webhook/[topic].js  — webhook receiver for topic
- lib/multiBot.js — token manager + send helper (reads from env)
- package.json
- .github/workflows/deploy.yml — deploy to Vercel (or use next build only)

Deployment
- Add bot tokens to GitHub Secrets (Actions):
  BOT_DYNO_ECONOMY_TOKEN, BOT_DYNO_PHILOSOPHY_TOKEN, BOT_DYNO_WRITING_TOKEN, BOT_DYNO_PHOTO_TOKEN, BOT_DYNO_NOTIFICATIONS_TOKEN, BOT_DYNO_DEV_TOKEN
- Deploy to Vercel and set environment variables if needed.

Usage
- POST updates from Telegram to /api/webhook/<topic>
- The handler will log to Firestore (if configured) and can reply using the topic's bot token.

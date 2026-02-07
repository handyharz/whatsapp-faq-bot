❯ npm run dev

> whatsapp-faq-bot@1.0.0 dev
> START_API_SERVER=true tsx watch src/bot.ts

[dotenv@17.2.3] injecting env (20) from .env -- tip: 🔐 encrypt with Dotenvx: https://dotenvx.com
[dotenv@17.2.3] injecting env (0) from .env -- tip: ⚙️  suppress all logs with { quiet: true }
🚀 Starting WhatsApp FAQ Bot...

✅ Connected to MongoDB
✅ MongoDB indexes created
[dotenv@17.2.3] injecting env (0) from .env -- tip: 🗂️ backup and recover secrets: https://dotenvx.com/ops

🌐 Starting API Server...

✅ API Server running on port 3001
   Health Check: http://localhost:3001/health
   Client API: http://localhost:3001/api/client/*
   Admin API: http://localhost:3001/api/admin/*
   Press Ctrl+C to stop


✅ Bot is running! Waiting for messages...

Press Ctrl+C to stop

Connection closed. Logged out.

📊 Resource Metrics:
   Database Size: 15.35 KB
   Clients: 2
   Messages (30d): 0
   Cache Size: 0 clients
   Cache Hit Rate: 0.0%


📊 Cache Statistics:
   Hits: 0
   Misses: 0
   Hit Rate: 0%
   Cache Size: 0 clients

📝 Update settings request: {
  clientId: 'client_1770419377346_ft3oj53q8',
  updates: [ 'config', 'address', 'socialMedia' ]
}
📝 Updating settings for client: Abuja Ram Syua Update data: {
  config: {
    businessHours: { start: 7, end: 20 },
    timezone: 'Africa/Lagos',
    afterHoursMessage: "Thanks for your message! We're currently closed (9am-5pm WAT). We'll reply first thing tomorrow. 😊",
    adminNumbers: [ '+2348107060168' ]
  },
  address: 'Aminu Kano Wuse 2 Abuja',
  socialMedia: {
    instagram: '@primetaker10',
    facebook: 'primetaker10',
    twitter: '@primetaker10',
    website: 'http://primetaker.com',
    tiktok: '@primetaker10'
  }
}
🔄 Updating client: client_1770419377346_ft3oj53q8 Updates: [ 'config', 'address', 'socialMedia' ]
✅ Client updated successfully: client_1770419377346_ft3oj53q8
✅ Settings updated successfully





❯ npm run dev

> whatsapp-faq-bot-web@1.0.0 dev
> next dev

 ⚠ Invalid next.config.js options detected: 
 ⚠     Unrecognized key(s) in object: 'swcMinify'
 ⚠ See more info here: https://nextjs.org/docs/messages/invalid-next-config
 ⚠ Warning: Next.js inferred your workspace root, but it may not be correct.
 We detected multiple lockfiles and selected the directory of /Users/harz/openclaw/pnpm-lock.yaml as the root directory.
 To silence this warning, set `outputFileTracingRoot` in your Next.js config, or consider removing one of the lockfiles if it's not needed.
   See https://nextjs.org/docs/app/api-reference/config/next-config-js/output#caveats for more information.
 Detected additional lockfiles: 
   * /Users/harz/openclaw/whatsapp-faq/whatsapp-faq-bot-web/package-lock.json

   ▲ Next.js 15.5.12
   - Local:        http://localhost:3000
   - Network:      http://172.20.10.2:3000
   - Environments: .env.local

 ✓ Starting...
 ✓ Ready in 4s
 ○ Compiling /dashboard/settings ...
 ✓ Compiled /dashboard/settings in 1095ms (614 modules)
 GET /dashboard/settings 200 in 1594ms
 ✓ Compiled /api/auth/me in 381ms (635 modules)
🔄 Attempt 1/3: Fetching http://localhost:3001/api/auth/me
📡 Response status: 200
 GET /api/auth/me 200 in 587ms
 ✓ Compiled /api/client/settings in 192ms (637 modules)
🔄 Attempt 1/3: Fetching http://localhost:3001/api/client/settings
📡 Response status: 200
 GET /api/client/settings 200 in 294ms
🔄 Attempt 1/3: Fetching http://localhost:3001/api/client/settings
📡 Response status: 200
 PUT /api/client/settings 200 in 50ms

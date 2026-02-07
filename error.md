Email: admin@exonec.com
ADMIN_PASSWORD=secure-password-change-in-production




{
  "_id": {
    "$oid": "698651e89b11c6f66a5c91ad"
  },
  "email": "admin@exonec.com",
  "password": "$2b$12$y18MzgYCmrEEyHr6lYoqCONGYojuTr.na5Sdg44oEPTlOnnt3NIQe",
  "role": "admin",
  "createdAt": {
    "$date": "2026-02-06T20:41:12.525Z"
  },
  "updatedAt": {
    "$date": "2026-02-06T20:41:12.525Z"
  }
}



❯ npm run dev

> whatsapp-faq-bot@1.0.0 dev
> START_API_SERVER=true tsx watch src/bot.ts

[dotenv@17.2.3] injecting env (20) from .env -- tip: ⚙️  write to custom object with { processEnv: myObject }
[dotenv@17.2.3] injecting env (0) from .env -- tip: ⚙️  suppress all logs with { quiet: true }
🚀 Starting WhatsApp FAQ Bot...

✅ Connected to MongoDB
✅ MongoDB indexes created
[dotenv@17.2.3] injecting env (0) from .env -- tip: 👥 sync secrets across teammates & machines: https://dotenvx.com/ops

🌐 Starting API Server...

✅ API Server running on port 3001
   Health Check: http://localhost:3001/health
   Client API: http://localhost:3001/api/client/*
   Admin API: http://localhost:3001/api/admin/*
   Press Ctrl+C to stop


✅ Bot is running! Waiting for messages...

Press Ctrl+C to stop


📊 Resource Metrics:
   Database Size: 1.78 KB
   Clients: 1
   Messages (30d): 0
   Cache Size: 0 clients
   Cache Hit Rate: 0.0%


📊 Cache Statistics:
   Hits: 0
   Misses: 0
   Hit Rate: 0%
   Cache Size: 0 clients

Connection closed. Logged out.
📥 Admin login request received
🔍 Verifying credentials for: admin@exonec.com
🔍 Admin found, verifying password...
❌ Password verification failed
❌ Invalid credentials



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
 ✓ Ready in 3.8s
 ○ Compiling /api/auth/admin/login ...
 ✓ Compiled /api/auth/admin/login in 742ms (297 modules)
🔗 Calling backend: http://localhost:3001/api/auth/admin/login
🔄 Attempt 1/3: Fetching http://localhost:3001/api/auth/admin/login
📡 Response status: 401
 POST /api/auth/admin/login 401 in 1252ms

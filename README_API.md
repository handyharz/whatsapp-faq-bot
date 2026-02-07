# API Server Setup

## Overview

The API server provides HTTP endpoints for the dashboard and external integrations. It can run alongside the bot or separately.

---

## Running the API Server

### Option 1: Run with Bot (Recommended for Development)

```bash
npm run dev
# Or
npm run start:all
```

This starts both the bot and API server together.

### Option 2: Run Separately

**Terminal 1 - Bot:**
```bash
npm run dev:bot-only
# Or
npm start
```

**Terminal 2 - API Server:**
```bash
npm run dev:api
# Or
npm run start:api
```

---

**Updated scripts**
- npm run dev - Starts bot + API server (default)
- npm run dev:bot-only - Bot only
- npm run dev:api - API server only

---

## API Server Details

**Port:** 3001 (or `API_PORT` env var)

**Endpoints:**
- `GET /health` - Health check
- `GET /api/client/profile?token=...` - Get client profile
- `GET /api/client/faqs?token=...` - Get FAQs
- `PUT /api/client/faqs?token=...` - Update FAQs
- `GET /api/client/stats?token=...` - Get statistics
- `GET /api/client/settings?token=...` - Get settings
- `PUT /api/client/settings?token=...` - Update settings

---

## Environment Variables

```bash
# Enable API server when starting bot
START_API_SERVER=true

# Or set API port (default: 3001)
API_PORT=3001
```

---

## Console Output

When running with `npm run dev`, you should see:

```
🚀 Starting WhatsApp FAQ Bot...

✅ Connected to MongoDB
✅ MongoDB indexes created

🌐 Starting API Server...

✅ API Server running on port 3001
   Health Check: http://localhost:3001/health
   Client API: http://localhost:3001/api/client/*
   Press Ctrl+C to stop

✅ Bot is running! Waiting for messages...

Press Ctrl+C to stop
```

---

## Testing

**Health Check:**
```bash
curl http://localhost:3001/health
```

**Client Profile:**
```bash
curl "http://localhost:3001/api/client/profile?token=client_test_001"
```

---

**Status:** ✅ API Server integrated with bot startup!

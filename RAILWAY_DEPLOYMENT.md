# Railway Deployment Guide for WhatsApp FAQ Bot

## Overview
This guide will help you deploy the WhatsApp FAQ bot to Railway for testing while waiting for Oracle Cloud capacity.

## Prerequisites

1. **Railway Account**: Sign up at [railway.com](https://railway.com) (free trial available)
2. **GitHub Account**: Your bot code should be in a GitHub repository
3. **WhatsApp Number**: A phone number for the bot

## Step 1: Prepare Your Repository

### 1.1 Ensure Your Bot is Ready
Make sure your bot code is in a GitHub repository with:
- `package.json` with proper scripts
- `.env.example` or documentation for required environment variables
- All dependencies listed

### 1.2 Required Files Check
Your repository should have:
```
whatsapp-faq-bot/
├── package.json
├── tsconfig.json
├── src/
│   ├── bot.ts
│   ├── config.ts
│   ├── faq-matcher.ts
│   └── whatsapp/
│       └── simple-client.ts
├── data/
│   └── faqs.json
└── README.md
```

## Step 2: Deploy to Railway

### 2.1 Create New Project on Railway

1. Go to [railway.com](https://railway.com)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your repository (`whatsapp-faq-bot`)
5. Railway will automatically detect it's a Node.js project

### 2.2 Configure Build Settings

Railway should auto-detect Node.js, but we need to ensure Node 20+ is used:

**Important**: The bot requires Node 20+ (Baileys dependency). Railway will use the `nixpacks.toml` file to configure this.

**Build Command**: (auto-detected from `nixpacks.toml`)
```bash
npm install --legacy-peer-deps
```

**Start Command**: (auto-detected from `package.json`)
```bash
npm start
```

**Node Version**: Railway will use Node 20 (configured in `nixpacks.toml`)

### 2.3 Set Environment Variables

In Railway dashboard, go to your service → **Variables** tab and add:

```env
# Auth Directory (where WhatsApp session is stored)
AUTH_DIR=./auth

# FAQ Configuration
FAQS_PATH=./data/faqs.json

# Business Hours
BUSINESS_HOURS_START=9
BUSINESS_HOURS_END=17

# Timezone
TIMEZONE=Africa/Lagos

# Admin Phone Number (for admin commands)
ADMIN_NUMBERS=+2348107060160

# After Hours Message
AFTER_HOURS_MESSAGE=Thanks for your message! We're currently closed (9am-5pm WAT). We'll reply first thing tomorrow. 😊

# Optional: Logging
NODE_ENV=production
```

**Important Notes**:
- `AUTH_DIR=./auth` - WhatsApp session will be stored here (ephemeral on Railway free tier)
- `ADMIN_NUMBERS` - Use your phone number with country code (e.g., `+2348107060160`)
- If Railway restarts, you may need to re-scan QR code (auth data is ephemeral on free tier)
- For persistent auth storage, consider Railway Hobby plan with volumes

## Step 3: First Deployment

### 3.1 Deploy
1. Railway will automatically build and deploy
2. Check the **Deployments** tab for build logs
3. Watch the **Logs** tab for runtime output

### 3.2 Connect WhatsApp
1. Check the logs for the QR code
2. Scan with WhatsApp (Settings → Linked Devices → Link a Device)
3. The bot should connect and be ready

## Step 4: Monitor and Test

### 4.1 Check Logs
- Go to **Logs** tab in Railway dashboard
- You should see:
  - Bot starting up
  - QR code (if not connected)
  - "Bot is ready!" message (when connected)

### 4.2 Test the Bot
1. Send a test message to your WhatsApp number
2. Check logs to see if it's processing
3. Verify FAQ responses are working

### 4.3 Monitor Resources
- Check **Metrics** tab for CPU/RAM usage
- Railway Free Trial: 0.5 GB RAM should be enough for testing
- If you hit limits, consider Railway Hobby plan ($5/month)

## Step 5: Configure for Production (Optional)

### 5.1 Add Custom Domain (if needed)
- Railway provides a free `.railway.app` domain
- For custom domain: Go to **Settings** → **Networking**

### 5.2 Set Up Health Checks
Railway automatically monitors your service, but you can add a health endpoint:

```typescript
// Add to your bot.ts or create a simple HTTP server
import http from 'http';

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200);
    res.end('OK');
  }
});

server.listen(process.env.PORT || 3000);
```

### 5.3 Persistent Storage
- WhatsApp session data is stored in memory by default
- For persistence, Railway provides volumes (0.5 GB on Free, 5 GB on Hobby)
- Update your code to save session to a volume path if needed

## Step 6: Cost Management

### Free Trial
- **$5 credits** for 30 days
- **0.5 GB RAM** limit
- Perfect for testing

### Estimated Usage
- **Memory**: ~300-500 MB (well within 0.5 GB limit)
- **CPU**: Very low (mostly idle)
- **Cost**: Should stay within $5 credits for testing

### Monitor Usage
- Check **Usage** tab in Railway dashboard
- Set up alerts if you want notifications

## Troubleshooting

### Bot Not Starting
1. Check **Logs** for errors
2. Verify `package.json` has correct `start` script
3. Ensure all dependencies are in `dependencies` (not `devDependencies`)

### QR Code Not Showing
1. Check logs for connection status
2. Ensure WhatsApp client is initializing
3. Verify no firewall blocking WebSocket connections

### High Memory Usage
1. Check logs for memory leaks
2. Consider reducing FAQ file size
3. Restart the service if needed

### Connection Drops
1. WhatsApp Web can disconnect
2. Railway will auto-restart your service
3. You may need to re-scan QR code

## Migration to Oracle Cloud

When Oracle Cloud capacity is available:

1. **Export Session Data** (if using persistent storage)
2. **Note Environment Variables** from Railway
3. **Follow Oracle Cloud Deployment Guide**
4. **Test on Oracle Cloud**
5. **Update DNS/Configurations** if needed
6. **Shut down Railway service** to avoid costs

## Quick Reference

### Railway Dashboard URLs
- **Projects**: https://railway.app/dashboard
- **Service Logs**: Service → Logs tab
- **Metrics**: Service → Metrics tab
- **Variables**: Service → Variables tab

### Useful Commands (via Railway CLI)
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to project
railway link

# View logs
railway logs

# Open shell
railway shell
```

## Next Steps

1. ✅ Deploy to Railway
2. ✅ Test bot functionality
3. ✅ Verify FAQ responses
4. ✅ Monitor resource usage
5. ⏳ Wait for Oracle Cloud capacity
6. 🔄 Migrate to Oracle Cloud when ready

## Support

- **Railway Docs**: https://docs.railway.app
- **Railway Discord**: Community support
- **Railway Status**: https://status.railway.app

---

**Remember**: This is temporary for testing. Oracle Cloud Free Tier remains the primary deployment target for cost optimization.

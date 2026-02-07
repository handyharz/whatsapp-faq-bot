# Next Steps - Bot is Connected! 🎉

Congratulations! Your WhatsApp FAQ bot is now connected and running on Railway.

## ✅ What's Done

- Bot deployed to Railway
- WhatsApp connected (QR code scanned)
- Bot is running and waiting for messages

## 🧪 Step 1: Test the Bot

### Test Basic Functionality

1. **Send a test message** to your WhatsApp number from another phone
2. **Try these commands**:
   - `hello` or `hi` - Should get a greeting
   - `help` - Should show available commands
   - `price` - Should match a pricing FAQ
   - `hours` - Should show business hours
   - `location` - Should show address

### Check Railway Logs

In Railway dashboard → **Logs** tab, you should see:
```
📨 Message from +234XXXXXXXXXX: hello
   → Sent: FAQ match (greeting)
```

### Verify FAQ Responses

- The bot should respond with answers from `data/faqs.json`
- If no match, it sends a default response
- Business hours are checked (9am-5pm WAT, weekdays only)

## ⚙️ Step 2: Configure Environment Variables (If Not Done)

Go to Railway dashboard → Your Service → **Variables** tab and add:

```env
AUTH_DIR=./auth
FAQS_PATH=./data/faqs.json
BUSINESS_HOURS_START=9
BUSINESS_HOURS_END=17
TIMEZONE=Africa/Lagos
ADMIN_NUMBERS=+2348107060160
AFTER_HOURS_MESSAGE=Thanks for your message! We're currently closed (9am-5pm WAT). We'll reply first thing tomorrow. 😊
```

**Note**: If you already added these, you're good! The bot will use them on the next restart.

## 🔧 Step 3: Test Admin Commands

If you set `ADMIN_NUMBERS`, send these from your admin phone:

- `/STATUS` - Check bot status (connected, FAQ count, business hours)
- `/RELOAD` - Reload FAQs from file (useful after updating `faqs.json`)

## 📝 Step 4: Customize FAQs

### Update FAQ File

1. Edit `data/faqs.json` in your repository
2. Add/remove/modify FAQs as needed
3. Commit and push to GitHub
4. Railway will auto-deploy the changes
5. Send `/RELOAD` from admin phone to reload FAQs (or restart service)

### Example FAQ Structure

```json
{
  "keywords": ["price", "cost", "how much", "pricing"],
  "answer": "Our prices start from ₦5,000. Contact us for detailed pricing!",
  "category": "pricing"
}
```

## 🎯 Step 5: Test Business Hours

### Test After-Hours Response

1. Wait until after 5pm WAT (or temporarily change `BUSINESS_HOURS_END` to current hour - 1)
2. Send a message to the bot
3. Should receive the after-hours message

### Test Weekend Response

1. Send a message on Saturday or Sunday
2. Should receive the after-hours message (bot is closed on weekends)

## 📊 Step 6: Monitor Performance

### Check Railway Metrics

- **CPU Usage**: Should be very low (mostly idle)
- **Memory Usage**: Should be ~300-500 MB
- **Logs**: Monitor for errors or issues

### Watch for Issues

- Connection drops (will auto-reconnect)
- High memory usage (check FAQ file size)
- Error messages in logs

## 🚀 Step 7: Production Readiness

### Before Going Live

1. ✅ **Test all FAQs** - Ensure responses are correct
2. ✅ **Set business hours** - Match your actual hours
3. ✅ **Customize messages** - Update after-hours message
4. ✅ **Add admin number** - For `/STATUS` and `/RELOAD` commands
5. ✅ **Monitor logs** - Watch for first few days
6. ✅ **Test edge cases** - Try various message formats

### Optional Enhancements

- Add more FAQs based on common questions
- Customize default responses
- Add support for images/media (future enhancement)
- Add support for multiple languages (future enhancement)

## 🔄 Step 8: Migration to Oracle Cloud (When Ready)

When Oracle Cloud capacity is available:

1. **Export Session Data** (if using persistent storage on Railway)
2. **Note Environment Variables** from Railway
3. **Follow Oracle Cloud Deployment Guide** (`ORACLE_CLOUD_DEPLOYMENT.md`)
4. **Test on Oracle Cloud**
5. **Shut down Railway service** to avoid costs

**Note**: Railway is perfect for testing. Oracle Cloud Free Tier is better for long-term (no costs).

## 📱 Quick Test Checklist

- [ ] Bot responds to "hello"
- [ ] Bot responds to "help"
- [ ] Bot matches FAQ keywords
- [ ] Bot sends default response for unmatched messages
- [ ] After-hours message works (after 5pm or weekends)
- [ ] Admin commands work (`/STATUS`, `/RELOAD`)
- [ ] Logs show message processing

## 🐛 Troubleshooting

### Bot Not Responding

1. Check Railway logs for errors
2. Verify bot is connected: Look for "✅ Connected to WhatsApp!"
3. Check if message is being received: Look for "📨 Message from..."
4. Verify FAQ file exists and is valid JSON

### Wrong Responses

1. Check FAQ keywords match your message
2. Verify FAQ file is loaded: Check logs for "✅ Loaded X FAQs"
3. Try `/RELOAD` command to reload FAQs

### Connection Issues

1. Check Railway logs for "Connection closed"
2. Bot will auto-reconnect (may need new QR code)
3. Verify Railway service is running

## 📚 Documentation

- **Railway Deployment**: `RAILWAY_DEPLOYMENT.md`
- **Oracle Cloud Deployment**: `ORACLE_CLOUD_DEPLOYMENT.md`
- **QR Code Tips**: `QR_CODE_TIPS.md`
- **Quick Start**: `RAILWAY_QUICK_START.md`

## 🎉 You're Ready!

Your bot is now live and ready to handle customer inquiries! 

**Next**: Start testing with real messages, customize FAQs, and monitor performance.

---

**Tip**: Keep Railway logs open while testing to see real-time message processing!

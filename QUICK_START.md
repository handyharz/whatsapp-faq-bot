# Quick Start Guide

## Step 1: Install Dependencies

```bash
cd /Users/harz/openclaw/whatsapp-faq-bot
npm install
```

## Step 2: Set Up Environment

Create `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

Edit `.env` and set your admin phone number:
```
ADMIN_NUMBERS=+2348012345678
```
(Replace with your actual phone number)

## Step 3: Customize FAQs

Edit `data/faqs.json` with your business information:
- Update business address
- Update contact information
- Add your own FAQs
- Customize answers

## Step 4: Run the Bot

```bash
npm run dev
```

## Step 5: Connect WhatsApp

1. Terminal will show a QR code
2. Open WhatsApp on your phone
3. Go to: **Settings > Linked Devices > Link a Device**
4. Scan the QR code
5. Wait for "✅ Connected to WhatsApp!" message

## Step 6: Test

Send a message to your WhatsApp number:
- "hello" → Should get greeting
- "price" → Should get pricing info
- "help" → Should get help menu
- "/status" → Should get bot status (if you're admin)

## Next Steps

1. **Customize FAQs** - Edit `data/faqs.json` with your business info
2. **Test thoroughly** - Send various messages to test matching
3. **Deploy** - When ready, deploy to VPS (see README.md)
4. **Start charging** - ₦2,000/month per business!

## Troubleshooting

### QR Code Not Showing
- Make sure you're in a terminal that supports QR codes
- Try a different terminal (iTerm2, Terminal.app)

### Can't Connect
- Make sure your phone has internet
- Try unlinking and re-linking WhatsApp Web

### FAQs Not Working
- Check `data/faqs.json` format (must be valid JSON)
- Restart bot after editing FAQs
- Use `/reload` command (if admin) to reload without restart

## Ready to Deploy?

See `README.md` for deployment instructions (VPS, Railway, Render).

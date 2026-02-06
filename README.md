# WhatsApp FAQ Bot

Simple WhatsApp auto-reply bot for Nigerian businesses. Built using OpenClaw's WhatsApp integration.

## Features

- ✅ Auto-replies to customer messages
- ✅ Keyword matching (e.g., "price" → pricing info)
- ✅ Business hours handling
- ✅ Simple FAQ management
- ✅ STOP/START commands
- ✅ Admin commands (/status, /reload)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure

Copy `.env.example` to `.env` and update:

```bash
cp .env.example .env
```

Edit `.env`:
- Set `ADMIN_NUMBERS` to your phone number
- Adjust `BUSINESS_HOURS_START` and `BUSINESS_HOURS_END` if needed
- Customize `AFTER_HOURS_MESSAGE`

### 3. Customize FAQs

Edit `data/faqs.json` with your business FAQs.

### 4. Run

```bash
npm run dev
```

### 5. Scan QR Code

- Open WhatsApp on your phone
- Go to Settings > Linked Devices
- Tap "Link a Device"
- Scan the QR code shown in terminal

### 6. Test

Send a message to the WhatsApp number:
- "hello" → Should get greeting
- "price" → Should get pricing info
- "help" → Should get help menu

## Project Structure

```
whatsapp-faq-bot/
├── src/
│   ├── whatsapp/
│   │   └── simple-client.ts    # WhatsApp connection
│   ├── faq-matcher.ts          # Keyword matching
│   ├── config.ts               # Configuration
│   └── bot.ts                  # Main bot logic
├── data/
│   └── faqs.json               # FAQ database
├── auth/                       # WhatsApp auth (auto-generated)
├── .env                        # Environment variables
└── package.json
```

## Configuration

### Environment Variables

- `AUTH_DIR` - Where to store WhatsApp auth (default: `./auth`)
- `FAQS_PATH` - Path to FAQ JSON file (default: `./data/faqs.json`)
- `BUSINESS_HOURS_START` - Business hours start (24-hour format, default: 9)
- `BUSINESS_HOURS_END` - Business hours end (24-hour format, default: 17)
- `TIMEZONE` - Timezone (default: `Africa/Lagos`)
- `ADMIN_NUMBERS` - Comma-separated admin phone numbers
- `AFTER_HOURS_MESSAGE` - Message to send outside business hours

### FAQ Format

Edit `data/faqs.json`:

```json
[
  {
    "keywords": ["hello", "hi"],
    "answer": "Hello! How can I help?",
    "category": "greeting"
  }
]
```

## Admin Commands

If your number is in `ADMIN_NUMBERS`, you can use:

- `/status` - Check bot status
- `/reload` - Reload FAQs from file

## Deployment

### Option 1: VPS (Digital Ocean, AWS Lightsail)

```bash
# On VPS
sudo apt update
sudo apt install nodejs npm -y
sudo npm install -g pm2

# Clone and setup
git clone <your-repo>
cd whatsapp-faq-bot
npm install

# Run with PM2
pm2 start npm --name "faq-bot" -- start
pm2 save
pm2 startup
```

### Option 2: Railway / Render

- Push to GitHub
- Connect to Railway/Render
- Set environment variables
- Deploy!

## Troubleshooting

### QR Code Not Showing

- Make sure terminal supports QR codes
- Try running in a different terminal
- Check that `qrcode-terminal` is installed

### Not Receiving Messages

- Check WhatsApp connection status
- Make sure phone is connected to internet
- Verify WhatsApp Web is linked

### FAQs Not Matching

- Check `data/faqs.json` format
- Keywords are case-insensitive
- Try more specific keywords

## License

MIT

## Acknowledgments

- **OpenClaw** - WhatsApp integration code
- **Baileys** - WhatsApp Web library

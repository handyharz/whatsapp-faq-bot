# Setup Instructions

## Step 1: Install Dependencies

Run this command in your terminal:

```bash
cd /Users/harz/openclaw/whatsapp-faq-bot
npm install
```

**Note**: If you get permission errors, try:
```bash
npm install --legacy-peer-deps
```

Or use pnpm (if installed):
```bash
pnpm install
```

## Step 2: Create .env File

Create a `.env` file in the project root:

```bash
cd /Users/harz/openclaw/whatsapp-faq-bot
cat > .env << 'EOF'
# WhatsApp Auth Directory
AUTH_DIR=./auth

# FAQ Database Path
FAQS_PATH=./data/faqs.json

# Business Hours (24-hour format)
BUSINESS_HOURS_START=9
BUSINESS_HOURS_END=17

# Timezone
TIMEZONE=Africa/Lagos

# Admin Phone Numbers (comma-separated)
# ⚠️ IMPORTANT: Replace with YOUR phone number!
ADMIN_NUMBERS=+2348012345678

# After Hours Message
AFTER_HOURS_MESSAGE=Thanks for your message! We're currently closed (9am-5pm WAT). We'll reply first thing tomorrow. 😊
EOF
```

**⚠️ IMPORTANT**: Edit `.env` and replace `ADMIN_NUMBERS` with your actual phone number (with country code, e.g., `+2348012345678`).

## Step 3: Customize FAQs

Edit `data/faqs.json` with your business information:

1. Open `data/faqs.json`
2. Update:
   - Business address in "location" FAQ
   - Contact phone/email in "contact" FAQ
   - Pricing information
   - Add your own FAQs

## Step 4: Test Locally

Run the bot:

```bash
npm run dev
```

You should see:
1. QR code in terminal
2. Instructions to scan with WhatsApp

**To connect**:
1. Open WhatsApp on your phone
2. Go to: **Settings > Linked Devices**
3. Tap **"Link a Device"**
4. Scan the QR code from terminal
5. Wait for "✅ Connected to WhatsApp!" message

## Step 5: Test Messages

Send test messages to your WhatsApp number:

- `hello` → Should get greeting
- `price` → Should get pricing info
- `help` → Should get help menu
- `/status` → Should get bot status (if you're admin)

## Troubleshooting

### npm install fails
- Try: `npm install --legacy-peer-deps`
- Or use: `pnpm install`
- Or use: `yarn install`

### QR code not showing
- Make sure you're in a terminal that supports QR codes
- Try iTerm2 or Terminal.app (not VS Code terminal)

### Can't connect to WhatsApp
- Make sure phone has internet
- Try unlinking all WhatsApp Web devices first
- Make sure you're using the correct phone number

### FAQs not matching
- Check `data/faqs.json` is valid JSON
- Keywords are case-insensitive
- Try more specific keywords

## Next: Deploy

Once tested locally, see `README.md` for deployment instructions.

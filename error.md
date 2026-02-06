# Error Fix: Missing Dependencies

## Problem

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'pino' imported from ...
```

**Cause**: The project is being treated as part of the pnpm workspace, so dependencies aren't installed locally in `whatsapp-faq-bot/node_modules`.

## ✅ Solution

### Quick Fix (Recommended)

Run this in your terminal:

```bash
cd /Users/harz/openclaw/whatsapp-faq-bot

# Remove workspace files
rm -rf node_modules
rm -f pnpm-lock.yaml

# Install with npm (standalone)
npm install --legacy-peer-deps

# Run the bot
npm run dev
```

### Alternative: Use Install Script

```bash
cd /Users/harz/openclaw/whatsapp-faq-bot
./install.sh
```

### Alternative: Force pnpm Standalone

```bash
cd /Users/harz/openclaw/whatsapp-faq-bot
pnpm install --no-workspace
npm run dev
```

## Why This Happened

When you ran `pnpm install` from the `whatsapp-faq-bot` directory, pnpm detected the parent workspace (`/Users/harz/openclaw`) and installed dependencies there instead of locally.

## Verification

After installing, check that `node_modules` exists:

```bash
ls -la node_modules | head -5
```

You should see the `pino` directory and other dependencies.

## Next Steps

1. ✅ Dependencies installed
2. ✅ Create `.env` file (if not exists)
3. ✅ Edit `.env` and set `ADMIN_NUMBERS` to your phone number
4. ✅ Run `npm run dev`
5. ✅ Scan QR code with WhatsApp

---

**Fixed!** The bot should now run correctly.

# Fix: Missing Dependencies

## Problem

The project is being treated as part of the pnpm workspace, so dependencies aren't installed locally.

## Solution

### Option 1: Use npm (Recommended)

```bash
cd /Users/harz/openclaw/whatsapp-faq-bot

# Remove pnpm workspace link
rm -rf node_modules
rm -f pnpm-lock.yaml

# Install with npm
npm install
```

### Option 2: Install dependencies directly with pnpm

```bash
cd /Users/harz/openclaw/whatsapp-faq-bot

# Install dependencies in this directory only
pnpm install --no-workspace
```

### Option 3: Use npm with legacy peer deps

```bash
cd /Users/harz/openclaw/whatsapp-faq-bot
npm install --legacy-peer-deps
```

## After Installing

Run the bot:

```bash
npm run dev
```

## If Still Having Issues

Make sure you're in the correct directory:

```bash
cd /Users/harz/openclaw/whatsapp-faq-bot
pwd  # Should show: /Users/harz/openclaw/whatsapp-faq-bot
npm install
npm run dev
```

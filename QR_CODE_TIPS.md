# QR Code Display Tips for Railway

## Problem
Railway's web log viewer may fragment the QR code across multiple lines, making it hard to scan.

## Solutions

### Option 1: Use Railway CLI (Recommended)
The terminal displays QR codes better than the web interface:

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to your project
railway link

# View logs in terminal (better formatting)
railway logs
```

The QR code will display properly in your terminal.

### Option 2: Copy and Paste to Text Editor
1. In Railway dashboard, go to **Logs** tab
2. Find the QR code section (look for `📱 Scan this QR code with WhatsApp:`)
3. Select and copy ALL the QR code lines (from the top border `▄▄▄▄▄▄▄` to the bottom border)
4. Paste into a text editor (VS Code, Notepad, TextEdit, etc.)
5. The QR code will appear complete and scannable

### Option 3: Use Railway's Log Export
1. In Railway dashboard → **Logs** tab
2. Click the download/export button (if available)
3. Open the exported log file in a text editor
4. Find and view the QR code

## Identifying the QR Code in Logs

Look for these patterns:
- Starts with: `📱 Scan this QR code with WhatsApp:`
- Contains: Multiple lines with `▄`, `█`, `▀` characters
- Ends with: `Waiting for connection...`

## Quick Test
After deployment, wait 20-30 seconds, then check logs. The QR code should appear within the first minute.

## After Scanning
Once you scan the QR code, you should see:
```
✅ Connected to WhatsApp!
```

If you see "Connection closed. Reconnecting..." followed by a new QR code, the previous one expired. Just scan the new one.

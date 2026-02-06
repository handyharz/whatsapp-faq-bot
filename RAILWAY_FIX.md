# Railway Deployment Fix

## Issues Found

1. **Node Version**: Railway was using Node 18.20.5, but Baileys requires Node >= 20.0.0
2. **Package Lock File**: Out of sync - missing dependencies (sharp and related packages)

## Fixes Applied

### 1. Node Version Fix
Created `nixpacks.toml` to force Railway to use Node 20:
```toml
[phases.setup]
nixPkgs = ["nodejs_20"]
```

### 2. Install Command Fix
Updated `nixpacks.toml` to use `npm install --legacy-peer-deps` instead of `npm ci`:
```toml
[phases.install]
cmds = ["npm install --legacy-peer-deps"]
```

## Next Steps

### Option 1: Regenerate package-lock.json (Recommended)
Run this locally with Node 20+:

```bash
cd whatsapp-faq-bot
# Ensure you're using Node 20+
node --version  # Should show v20.x.x or higher

# Delete old lock file
rm package-lock.json

# Regenerate with Node 20
npm install

# Commit and push
git add package-lock.json
git commit -m "Regenerate package-lock.json with Node 20"
git push
```

### Option 2: Deploy as-is (Current Fix)
The `nixpacks.toml` file will:
- Use Node 20 automatically
- Use `npm install --legacy-peer-deps` which is more forgiving than `npm ci`

**Note**: Option 2 should work, but Option 1 is cleaner and recommended for production.

## Verify Fix

After deploying, check Railway logs for:
- ✅ Node version should be 20.x.x
- ✅ No "Unsupported engine" warnings
- ✅ No "Missing: sharp" errors
- ✅ Successful npm install

## Files Changed

1. ✅ `nixpacks.toml` - Created to force Node 20
2. ✅ `.nvmrc` - Created to specify Node 20 (for local development)
3. ✅ `RAILWAY_DEPLOYMENT.md` - Updated with troubleshooting steps

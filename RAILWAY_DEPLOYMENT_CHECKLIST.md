# Railway Deployment Checklist

## Issue: 500 Errors on Admin Login and Client Registration

### Root Causes Identified

1. **Database Connection Failure** - Most likely cause
2. **CORS Configuration** - Frontend/API domain mismatch
3. **Cookie Settings** - Cross-domain cookie issues
4. **Environment Variables** - Missing or incorrect values

---

## ✅ Required Environment Variables in Railway

Set these in **Railway → Your Service → Variables**:

### Database (CRITICAL)
```bash
MONGODB_URI=mongodb+srv://botfaq_db_user:7787@botfaq.0a35nj4.mongodb.net/whatsapp_faq_bot?retryWrites=true&w=majority&appName=Cluster0
MONGODB_DB_NAME=whatsapp_faq_bot
```

### Frontend URL (for CORS)
```bash
FRONTEND_URL=https://www.exonec.com
```

### Node Environment
```bash
NODE_ENV=production
```

### API Port (if different from default)
```bash
API_PORT=3001
```

### JWT Secrets (if using custom secrets)
```bash
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-here
```

### Email Service (Resend)
```bash
RESEND_API_KEY=your-resend-api-key
```

---

## 🔍 Verification Steps

### 1. Check Database Connection

Visit your Railway API health endpoint:
```
https://your-railway-domain.railway.app/health
```

**Expected Response (Success):**
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2026-02-08T..."
}
```

**Expected Response (Failure):**
```json
{
  "status": "error",
  "database": "disconnected",
  "error": "Database connection failed",
  "timestamp": "2026-02-08T..."
}
```

### 2. Check Railway Logs

In Railway dashboard:
1. Go to **Your Service → Deployments → Latest Deployment → Logs**
2. Look for:
   - ✅ `✅ Connected to MongoDB` - Database connected
   - ❌ `❌ Failed to connect to MongoDB` - Database connection failed
   - ✅ `✅ API Server running on port 3001` - Server started

### 3. Test Admin Login

**From Browser Console (on https://www.exonec.com):**
```javascript
fetch('https://your-railway-api.railway.app/api/auth/admin/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    email: 'admin@exonec.com',
    password: 'secure-password'
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

**Check for:**
- CORS errors → `FRONTEND_URL` not set correctly
- 503 errors → Database connection issue
- 500 errors → Check Railway logs for detailed error

---

## 🛠️ Common Fixes

### Fix 1: Database Connection

**Problem:** `MONGODB_URI` not set or incorrect

**Solution:**
1. Verify `MONGODB_URI` in Railway Variables
2. Check MongoDB Atlas IP whitelist (allow Railway IPs or `0.0.0.0/0`)
3. Verify database user credentials in connection string

### Fix 2: CORS Issues

**Problem:** Frontend can't call API due to CORS

**Solution:**
1. Set `FRONTEND_URL=https://www.exonec.com` in Railway
2. Ensure API domain is different from frontend domain
3. Check browser console for CORS errors

### Fix 3: Cookie Issues

**Problem:** Cookies not being set in production

**Solution:**
- Code already updated to use `sameSite: 'none'` and `secure: true` for production
- Ensure both frontend and API are on HTTPS
- Check browser console for cookie warnings

### Fix 4: Environment Variable Not Loading

**Problem:** Variables set but not accessible

**Solution:**
1. Redeploy after setting variables (Railway auto-redeploys)
2. Check variable names match exactly (case-sensitive)
3. Remove any quotes around values in Railway UI

---

## 📋 Pre-Deployment Checklist

- [ ] `MONGODB_URI` set correctly
- [ ] `MONGODB_DB_NAME` set correctly
- [ ] `FRONTEND_URL` set to `https://www.exonec.com`
- [ ] `NODE_ENV=production` set
- [ ] MongoDB Atlas IP whitelist allows Railway IPs
- [ ] Railway service has public domain configured
- [ ] Health check endpoint returns `database: "connected"`

---

## 🐛 Debugging Commands

### Check Railway Logs
```bash
# In Railway dashboard, view real-time logs
# Look for database connection errors
```

### Test Database Connection Locally
```bash
# Use the same MONGODB_URI from Railway
MONGODB_URI="mongodb+srv://..." node -e "
const { MongoClient } = require('mongodb');
(async () => {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  console.log('✅ Connected');
  await client.close();
})();
"
```

### Test API Endpoint
```bash
curl https://your-railway-api.railway.app/health
```

---

## 📝 Notes

- **Database Connection:** The server now gracefully handles database connection failures and provides clear error messages
- **Error Logging:** Enhanced error logging in production (doesn't expose internal details)
- **Health Check:** `/health` endpoint now verifies database connectivity
- **Cookie Security:** Production cookies use `sameSite: 'none'` and `secure: true` for cross-domain support

---

## 🚀 After Fixing

1. Redeploy on Railway (or wait for auto-redeploy)
2. Check health endpoint: `https://your-api.railway.app/health`
3. Test admin login from frontend
4. Check Railway logs for any remaining errors

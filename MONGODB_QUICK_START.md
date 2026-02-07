# MongoDB Integration - Quick Start

## ✅ Code Created

All MongoDB integration code has been created:

1. **`src/models/client.ts`** - Client data types
2. **`src/db/mongodb.ts`** - MongoDB connection module
3. **`src/services/client-service.ts`** - Client CRUD operations
4. **`src/bot.ts`** - Updated to use MongoDB (multi-tenant)
5. **`src/scripts/test-mongodb.ts`** - Test connection script
6. **`src/scripts/seed-client.ts`** - Seed sample client script

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
cd whatsapp-faq-bot
npm install
```

### Step 2: Set Up Environment Variables

Create `.env` file (or update existing):

```env
MONGODB_URI=mongodb://localhost:27017/whatsapp_faq_bot
MONGODB_DB_NAME=whatsapp_faq_bot
```

### Step 3: Start Local MongoDB

Make sure MongoDB is running locally:

```bash
# Check if MongoDB is running
mongosh --eval "db.version()"

# Or start MongoDB (if installed via Homebrew on Mac)
brew services start mongodb-community

# Or start MongoDB (if installed via apt on Linux)
sudo systemctl start mongod
```

### Step 4: Test Connection

```bash
npm run test:mongodb
```

Expected output:
```
✅ Connected to MongoDB
✅ MongoDB indexes created
📊 Collection: clients
📊 Current documents: 0
📊 Active clients: 0
```

### Step 5: Seed Sample Client

```bash
npm run seed:client
```

This creates a test client with:
- WhatsApp: `+2348107060160`
- Business: "Test Restaurant"
- 5 sample FAQs
- Trial subscription (7 days)

### Step 6: Start Bot

```bash
npm start
```

The bot will:
1. Connect to MongoDB
2. Connect to WhatsApp
3. Load client from database when messages arrive
4. Use client-specific FAQs and config

## 📝 Testing

### Test with Your WhatsApp Number

1. Make sure you seeded a client with your WhatsApp number
2. Start the bot: `npm start`
3. Scan QR code
4. Send a message from your phone
5. Bot should respond using FAQs from MongoDB

### Test Commands

- `hello` - Should match greeting FAQ
- `price` - Should match pricing FAQ
- `hours` - Should match hours FAQ
- `/STATUS` - Admin command (if your number is in adminNumbers)
- `/RELOAD` - Reload FAQs from database

## 🔄 Migration from File-Based to MongoDB

The bot now uses MongoDB instead of `data/faqs.json`. 

**Old way (file-based):**
- FAQs in `data/faqs.json`
- Single bot per file

**New way (MongoDB):**
- FAQs in MongoDB
- Multi-tenant: One bot handles multiple clients
- Each client has their own FAQs and config

## 📊 Database Structure

### Clients Collection

Each client document contains:
- Business info (name, WhatsApp, email, etc.)
- FAQs array (nested)
- Config (business hours, timezone, etc.)
- Subscription (status, tier, dates)

### Example Query

```typescript
// Get client by WhatsApp number
const client = await clientService.getClientByWhatsAppNumber('+2348107060160');
// client.faqs - array of FAQs
// client.config - business hours, timezone
// client.subscription - status, tier
```

## 🐛 Troubleshooting

### MongoDB Connection Error

**Error:** `MongoServerError: connect ECONNREFUSED`

**Solution:**
- Make sure MongoDB is running: `mongosh --eval "db.version()"`
- Check connection string in `.env`
- Verify MongoDB is listening on port 27017

### No Client Found

**Error:** `⚠️ No client found for +2348107060160`

**Solution:**
- Run seed script: `npm run seed:client`
- Verify WhatsApp number matches exactly (with country code)
- Check database: `mongosh whatsapp_faq_bot` then `db.clients.find()`

### Index Creation Warnings

**Warning:** `Index creation warning`

**Solution:**
- This is normal if indexes already exist
- Safe to ignore

## 📚 Next Steps

1. ✅ MongoDB integration complete
2. ⏳ Add more clients (via admin dashboard - future)
3. ⏳ Implement payment integration
4. ⏳ Add rate limiting
5. ⏳ Build admin dashboard

---

**Ready to test?** Run `npm run test:mongodb` then `npm run seed:client` then `npm start`! 🚀

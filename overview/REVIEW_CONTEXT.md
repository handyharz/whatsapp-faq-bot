# Context for Architecture Review

## 🎯 Quick Summary

**WhatsApp FAQ Bot** is a **multi-tenant SaaS platform** for Nigerian SMEs that provides 24/7 automated customer support via WhatsApp.

**Current Stage:** MVP (85% complete, ~50-100 businesses target)

**Architecture:** Single WhatsApp connection, sender-based routing, multi-tenant bot

---

## 📋 What You Need to Know

### 1. Business Model

**Target Customers:** Nigerian small businesses (restaurants, retail, logistics)
- Can't afford customer service staff (₦80,000-₦150,000/month)
- Need 24/7 support but can't staff around the clock
- Already using WhatsApp for customer communication

**Revenue:** Subscription tiers (₦5,000-₦20,000/month per business)
**Current Stage:** MVP - targeting 50-100 businesses initially

### 2. Current Architecture

**Single WhatsApp Connection:**
- One phone number connects to WhatsApp Web (via Baileys)
- This number receives messages from ALL customers of ALL businesses
- Routing is done by **sender identification** (which business's customer is messaging)

**How It Works:**
1. Business signs up → Registers their WhatsApp number in database
2. Customer messages business → Bot receives message
3. Bot identifies business → Looks up sender's number in database
4. Bot responds → Uses that business's FAQs and settings

**Why This Design:**
- Lower costs (one phone number vs. multiple)
- Simpler infrastructure for MVP
- Works for 50-100 businesses
- Can evolve as we scale

### 3. The Routing Question

**Current Implementation:**
```typescript
// Route by SENDER (customer's number)
const client = await getClient(from); // from = customer number
if (!client) {
  // Platform bot (unknown sender)
} else {
  // Client bot (known sender = business's customer)
}
```

**Your Suggestion:**
```typescript
// Route by RECIPIENT (TO number)
const workspace = await getWorkspaceByPhone(to);
await workspace.bot.handleMessage(message);
```

**Why Current Works (For Now):**
- Each business has a unique WhatsApp number
- Customers message that business's number
- Bot identifies business by sender's number
- Bot uses that business's FAQs

**Limitation:**
- Requires businesses to use platform's WhatsApp number
- OR: Businesses forward messages (not ideal)
- Future: Support multiple WhatsApp connections

### 4. The Workspace Model

**Your Insight:** Create workspace abstraction, route by recipient

**Our Current Reality:**
- Single WhatsApp connection (one phone number)
- Messages come with `from` (sender) clearly identified
- `to` (recipient) is implicitly the bot's connected number
- We identify business by sender's WhatsApp number

**Why We Can't Do It Yet:**
- Baileys requires one phone number per connection
- Multiple connections = multiple phone numbers = higher costs
- Single connection = one phone number = lower costs (MVP stage)

**When We Can:**
- When we scale (200+ businesses)
- When we can afford multiple phone numbers
- When we need dedicated numbers per business

### 5. The Platform Bot

**Current Implementation:**
- Handles messages from unknown senders (not registered businesses)
- Provides support/sales for the platform itself
- Answers questions about pricing, signup, features

**Why It Works:**
- Unknown sender → Platform bot (support/sales)
- Known sender → Client bot (business FAQs)

**Your Concern:** Tying platform to admin number

**Our Reality:**
- Platform bot handles ALL unknown senders
- Not tied to admin number (that was old logic we fixed)
- Works for MVP stage

---

## 🎯 Key Points for Review

### What We Agree On

✅ **Workspace model is the right direction** - We'll add it as we scale
✅ **Route by recipient (TO) is better** - We'll implement when we have multiple connections
✅ **Phone numbers as mailboxes** - We understand this principle
✅ **Data-driven routing** - We're moving away from hardcoded logic

### What's Different

**Current Stage:** MVP (50-100 businesses)
- Single WhatsApp connection (pragmatic for costs)
- Sender-based routing (works with single connection)
- Can evolve to ideal architecture incrementally

**Future Stage:** Scale (200+ businesses)
- Multiple WhatsApp connections
- Recipient-based routing
- Workspace model (as you suggested)

### The Migration Path

**Phase 1 (Current):** MVP architecture
- Single connection, sender-based routing
- Works for 50-100 businesses
- Lower costs, simpler infrastructure

**Phase 2 (6-12 months):** Add workspace model
- Keep single connection for now
- Add workspace abstraction layer
- Prepare for multi-connection support

**Phase 3 (12+ months):** Multi-connection support
- Multiple WhatsApp connections
- Route by recipient (TO number)
- Each workspace = one connection

---

## 💡 What We'd Like From Your Review

**Given This Context:**

1. **Is our current architecture acceptable for MVP stage?**
   - Single connection, sender-based routing
   - Works for 50-100 businesses
   - Can evolve incrementally

2. **What's the best migration path?**
   - How to add workspace model without rewrite?
   - How to transition from sender → recipient routing?
   - When to add multiple connections?

3. **What are the risks of current approach?**
   - What breaks at what scale?
   - What technical debt should we avoid?
   - What patterns should we establish now?

4. **What should we prioritize?**
   - Workspace model now or later?
   - Multi-connection support when?
   - What's the critical path?

---

## 📊 Platform Stats

**Current:**
- **Status:** MVP (85% complete)
- **Target:** 50-100 businesses (Year 1)
- **Revenue:** ₦400,000-₦800,000/month (Year 1)
- **Infrastructure:** 
  - **Temporary:** Railway → ₦15,000-₦30,000/month
  - **Target:** Oracle Cloud → **₦0/month** (waiting for AD capacity)

**Future:**
- **Scale:** 200-500 businesses (Year 2)
- **Revenue:** ₦1.6M-₦4M/month (Year 2)
- **Infrastructure:** 
  - **Target:** Oracle Cloud → **₦0/month** (free tier sufficient for 200-500 businesses)
  - **If needed:** Oracle Cloud paid tier → ₦20,000-₦50,000/month

---

## 🎓 Bottom Line

**We understand your architectural insights are correct for a scalable platform.**

**But we're at MVP stage:**
- Need to validate product-market fit
- Need to keep costs low
- Need to ship quickly
- Can evolve architecture as we scale

**We'd love your review on:**
- Is current architecture acceptable for MVP?
- What's the best migration path?
- What should we prioritize?

**Thank you for the thoughtful review!** 🙏

---

**Full Platform Overview:** See `PLATFORM_OVERVIEW.md` for complete details.

# WhatsApp FAQ Bot Platform - Complete Overview

## 🎯 What This Platform Is

**WhatsApp FAQ Bot** is a **multi-tenant SaaS platform** that enables Nigerian small and medium businesses (SMEs) to provide **24/7 automated customer support** via WhatsApp without hiring customer service staff.

### Core Value Proposition

**For Businesses:**
- ✅ 24/7 automated customer support via WhatsApp
- ✅ Instant responses to common questions (pricing, hours, location, etc.)
- ✅ No need to hire customer service staff
- ✅ Affordable subscription pricing (₦5,000-₦20,000/month)
- ✅ Self-service dashboard to manage FAQs

**For the Platform:**
- ✅ Multi-tenant architecture (one bot instance serves hundreds of businesses)
- ✅ Subscription-based revenue model
- ✅ Scalable infrastructure (MongoDB Atlas free tier → paid as needed)
- ✅ Low operational costs

---

## 👥 Who This Platform Is For

### Primary Customers: Nigerian SMEs

**Target Businesses:**
- 🏪 **Retail stores** (fashion, electronics, groceries)
- 🍽️ **Restaurants & cafes** (menu, hours, delivery)
- 🚚 **Logistics companies** (tracking, rates, pickup)
- 💼 **Service businesses** (consulting, repairs, cleaning)
- 🏢 **Any business using WhatsApp for customer communication**

**Business Profile:**
- Small to medium size (1-50 employees)
- Already using WhatsApp for customer communication
- Struggling with high volume of repetitive questions
- Can't afford dedicated customer service staff (₦80,000-₦150,000/month)
- Need 24/7 availability but can't staff around the clock

**Pain Points We Solve:**
1. **Customer service overload** - Too many repetitive questions
2. **Slow response times** - 2-4 hours average (we provide instant)
3. **Missed sales** - 30-40% of inquiries go unanswered
4. **High labor costs** - ₦80,000-₦150,000/month per agent
5. **Limited hours** - Can't respond 24/7

---

## 🏗️ How The Platform Works

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Single WhatsApp Connection                │
│              (One phone number: e.g., 09059764843)           │
│              Receives messages from ALL customers            │
└─────────────────────────────────────────────────────────────┘
                            │
                            │
        ┌───────────────────┴───────────────────┐
        │                                         │
        ▼                                         ▼
┌──────────────────────┐              ┌──────────────────────┐
│  Message Routing    │              │  Message Routing       │
│  (Unknown Sender)   │              │  (Known Sender)        │
│                     │              │                       │
│  → Platform Bot      │              │  → Client FAQ Bot     │
│  (Support/Sales)     │              │  (Business FAQs)      │
└──────────────────────┘              └──────────────────────┘
```

### Multi-Tenant Model

**Key Concept:** One bot instance serves multiple businesses simultaneously.

**How It Works:**
1. **Business signs up** → Gets assigned a unique `clientId`
2. **Business registers their WhatsApp number** → Stored in database
3. **Business creates FAQs** → Stored in MongoDB per client
4. **Customer messages business** → Bot receives message
5. **Bot identifies business** → Looks up sender's number in database
6. **Bot responds** → Uses that business's FAQs and settings

**Example Flow:**
```
Customer A messages "08107060160" (Kaalis Store)
    ↓
Bot receives message from "08107060160"
    ↓
Bot looks up: "Which client owns number 08107060160?"
    ↓
Finds: Kaalis Store (clientId: "kaalis_123")
    ↓
Loads Kaalis Store's FAQs from database
    ↓
Matches customer question to FAQ
    ↓
Responds with Kaalis Store's answer
```

### Current Implementation

**Single WhatsApp Connection:**
- One phone number connects to WhatsApp Web (via Baileys)
- This number receives messages from ALL customers of ALL businesses
- Routing is done by **sender identification** (which business's customer is messaging)

**Why This Works:**
- Each business registers their WhatsApp number in the database
- When a customer messages that number, the bot identifies which business it belongs to
- The bot then uses that business's FAQs and settings to respond

**Limitation:**
- Currently requires businesses to use the platform's WhatsApp number
- OR: Businesses forward messages (not ideal)
- Future: Support multiple WhatsApp connections (one per business)

---

## 💰 Business Model

### Revenue Streams

**Primary: Subscription Tiers**

| Tier | Price/Month | FAQs | Messages/Month | Target |
|------|-------------|------|----------------|--------|
| **Trial** | ₦0 (7 days) | 20 | Unlimited | New signups |
| **Starter** | ₦5,000 | 50 | 1,000 | Small businesses (60%) |
| **Professional** | ₦10,000 | 200 | 5,000 | Medium businesses (30%) |
| **Enterprise** | ₦20,000 | Unlimited | Unlimited | Large businesses (10%) |

**Revenue Projections:**
- **Month 6:** 50 businesses × ₦8,000 avg = **₦400,000/month**
- **Month 12:** 200 businesses × ₦8,000 avg = **₦1.6M/month**
- **Year 2:** 1,000 businesses × ₦8,000 avg = **₦8M/month**

### Cost Structure

**Infrastructure:**
- **Primary:** Oracle Cloud Free Tier → **₦0/month** (target infrastructure)
- **Temporary:** Railway (Backend) → ₦15,000-₦30,000/month (while waiting for Oracle AD)
- **Database:** MongoDB Atlas (Free tier) → Oracle AD (when available) → ₦0/month
- **Frontend:** Vercel (Free tier) → ₦0/month
- **WhatsApp:** ₦0 (uses WhatsApp Web, no API costs)

**Total Monthly Costs:**
- **Early stage (0-100 clients):** 
  - Oracle Cloud: **₦0/month** (target)
  - Railway (temporary): ₦15,000-₦30,000/month
- **Growth stage (100-500 clients):** 
  - Oracle Cloud: **₦0/month** (still within free tier)
  - Railway (if still using): ₦30,000-₦60,000/month
- **Scale stage (500+ clients):** 
  - Oracle Cloud: ₦0-₦20,000/month (may need paid tier)
  - Railway: Not recommended (too expensive)

**Break-Even:** ~3-5 businesses (₦15,000-₦25,000 revenue)

---

## 🏛️ Platform Architecture

### Current Architecture (MVP)

**Single Bot Instance:**
```
┌─────────────────────────────────────────┐
│         FAQBot (Single Instance)        │
│                                          │
│  ┌──────────────────────────────────┐  │
│  │  WhatsApp Connection (Baileys)    │  │
│  │  Phone: 09059764843               │  │
│  └──────────────────────────────────┘  │
│                                          │
│  ┌──────────────────────────────────┐  │
│  │  Message Router                   │  │
│  │  - Identify sender                │  │
│  │  - Route to client or platform    │  │
│  └──────────────────────────────────┘  │
│                                          │
│  ┌──────────────────────────────────┐  │
│  │  Client Service                   │  │
│  │  - Load client from DB            │  │
│  │  - Get FAQs & settings            │  │
│  └──────────────────────────────────┘  │
│                                          │
│  ┌──────────────────────────────────┐  │
│  │  Platform Bot                     │  │
│  │  - Handle unknown senders         │  │
│  │  - Support/sales responses        │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

**Database:**
```
MongoDB Atlas
├── clients (collection)
│   ├── Client A (whatsappNumber: "08107060160")
│   ├── Client B (whatsappNumber: "08123456789")
│   └── Client C (whatsappNumber: "08111111111")
│
└── messages (collection)
    ├── Message logs for analytics
    └── Rate limiting tracking
```

**Services:**
- **ClientService** - CRUD operations for clients
- **SubscriptionService** - Manage subscriptions, trials
- **RateLimiter** - Enforce message limits per tier
- **PaymentService** - Paystack integration
- **CacheService** - In-memory caching (reduces DB load)
- **MonitoringService** - Track resource usage

### Routing Logic (Current)

**Message Flow:**
```typescript
1. Message received from WhatsApp
   ↓
2. Extract sender number (from)
   ↓
3. Look up sender in database
   ├─→ Found? → Client FAQ Bot
   │   └─→ Load client's FAQs
   │   └─→ Match question to FAQ
   │   └─→ Respond with client's answer
   │
   └─→ Not found? → Platform Bot
       └─→ Handle as support/sales inquiry
       └─→ Answer platform questions
       └─→ Guide to signup
```

**Why This Works:**
- Businesses register their WhatsApp numbers
- Customers message those numbers
- Bot identifies which business by sender number
- Bot uses that business's FAQs

**Current Limitation:**
- Requires businesses to use platform's WhatsApp number
- OR: Businesses need to forward messages (not ideal)
- Future: Support multiple WhatsApp connections

---

## 🎯 Target Market & Use Cases

### Primary Use Cases

**1. Restaurant/Cafe**
- Customer: "What are your prices?"
- Bot: "Our menu prices start from ₦500..."
- Customer: "Do you deliver?"
- Bot: "Yes! We deliver within Lagos. Delivery fee: ₦500..."

**2. Fashion Store**
- Customer: "What sizes do you have?"
- Bot: "We have sizes XS to XXL in stock..."
- Customer: "Where are you located?"
- Bot: "We're at 123 Main St, Lagos. Open 9am-6pm..."

**3. Logistics Company**
- Customer: "How much to deliver to Abuja?"
- Bot: "Delivery to Abuja: ₦2,000 for packages under 5kg..."
- Customer: "How long does delivery take?"
- Bot: "Standard delivery: 2-3 business days..."

### Market Size

**Nigerian SME Market:**
- **Total SMEs:** 41.5 million (NBS 2021)
- **Digital SMEs:** ~5 million (using WhatsApp)
- **Target Segment:** 500,000-1,000,000 (active WhatsApp, payment-ready)

**Serviceable Market:**
- **Year 1-2:** Lagos, Abuja, Port Harcourt
- **Target:** 100,000 businesses
- **Realistic Capture:** 5,000 businesses (5%)

---

## 🔄 Business Lifecycle

### Customer Journey

**1. Discovery**
- Business finds platform via website, social media, or referral
- Visits landing page: `www.exonec.com`

**2. Onboarding**
- Fills out onboarding form:
  - Business name, niche, WhatsApp number, email
  - Address, social media links
- Receives email confirmation
- Admin receives notification email

**3. Setup (Admin-Assisted)**
- Admin reviews onboarding request
- Admin creates client account
- Admin sets up initial FAQs (from templates)
- Admin activates trial (7 days free)

**4. Trial Period**
- Business receives login credentials
- Business can edit FAQs via dashboard
- Bot goes live (responds to customer messages)
- Business tests with real customers

**5. Conversion**
- Trial ends (7 days)
- Business receives payment link
- Business subscribes (Starter/Professional/Enterprise)
- Bot continues operating

**6. Ongoing Usage**
- Business manages FAQs via dashboard
- Bot handles customer inquiries 24/7
- Business views analytics (messages, FAQs, etc.)
- Business can upgrade/downgrade anytime

**7. Support**
- Platform bot handles support questions
- Email support: support@exonec.com
- Admin dashboard for account management

---

## 🛠️ Technical Stack

### Backend
- **Runtime:** Node.js 22+ (TypeScript)
- **Framework:** Express.js (API server)
- **Database:** MongoDB Atlas (Free tier → Paid) → **Oracle Autonomous Database (Future)**
- **WhatsApp:** Baileys (WhatsApp Web protocol)
- **Payment:** Paystack (Nigerian payment gateway)
- **Deployment:** 
  - **Primary:** Oracle Cloud Infrastructure (OCI) - Free Tier
  - **Temporary:** Railway (while waiting for Oracle Cloud AD capacity)

### Frontend
- **Framework:** Next.js 15 (React)
- **Styling:** Custom CSS (Resend-inspired design)
- **Deployment:** Vercel (Frontend hosting)

### Infrastructure Strategy

**Primary Infrastructure: Oracle Cloud Free Tier**
- **Compute:** VM.Standard.A1.Flex (1 OCPU, 8 GB RAM per VM)
- **Database:** Oracle Autonomous Database (AD) - **Target when capacity available**
- **Cost:** $0/month (Always Free Tier)
- **Capacity:** 4 OCPU, 24 GB RAM total (can run 20-30 bots)
- **Status:** ⏳ Waiting for Availability Domain (AD) capacity

**Temporary Infrastructure: Railway**
- **Purpose:** Testing and deployment while waiting for Oracle Cloud AD
- **Cost:** $15-30/month (Hobby plan)
- **Status:** ✅ Currently deployed and running
- **Migration:** Will migrate to Oracle Cloud when AD capacity is available

**Other Infrastructure:**
- **Database:** MongoDB Atlas (Free tier: 512MB) → Will migrate to Oracle AD
- **Frontend:** Vercel (Free tier)
- **Email:** Resend (Email notifications)

### Why Oracle Cloud?

**Cost Optimization:**
- ✅ **$0/month** (Always Free Tier) vs Railway $15-30/month
- ✅ **More resources:** 4 OCPU, 24 GB RAM vs Railway's 1 vCPU, 1 GB RAM
- ✅ **Better for scaling:** Can run 20-30 bots on free tier vs Railway's per-bot costs

**Resource Capacity:**
- ✅ **4 OCPU total** (can create 4 VMs × 1 OCPU each)
- ✅ **24 GB RAM total** (8 GB per VM × 3 VMs optimal)
- ✅ **200 GB storage** (vs Railway's 5 GB)
- ✅ **10 TB bandwidth/month** (vs Railway's usage-based)

**Scalability:**
- ✅ Can run **20-30 bots** on free tier (vs Railway's per-bot pricing)
- ✅ Each bot costs **$0** (vs Railway's $15-30 per bot)
- ✅ Better for multi-tenant platform

**Current Challenge:**
- ⚠️ **Availability Domain (AD) capacity** - Oracle Cloud free tier is popular
- ⚠️ Need to try different ADs (AD-1, AD-2, AD-3) or regions
- ⚠️ Railway is temporary solution until Oracle AD is available

---

## 📊 Current Status

### ✅ Completed (85%)

**Core Platform:**
- ✅ Multi-tenant bot architecture
- ✅ MongoDB integration
- ✅ Subscription management (trial, active, expired)
- ✅ Rate limiting (per tier)
- ✅ Payment integration (Paystack)
- ✅ Caching layer (in-memory)
- ✅ Resource monitoring

**User Experience:**
- ✅ Landing page
- ✅ Onboarding form
- ✅ Client dashboard (FAQs, settings, stats)
- ✅ Admin dashboard (client management)
- ✅ JWT authentication
- ✅ Self-service FAQ editing

**Platform Features:**
- ✅ Platform bot (handles unknown senders)
- ✅ Business hours handling
- ✅ After-hours messages
- ✅ Admin commands (/RELOAD, /STATUS)

### ⏳ Remaining (15%)

**Enhancements:**
- [ ] FAQ templates (pre-built for niches)
- [ ] Advanced analytics
- [ ] Email notifications (trial expiry, payment reminders)
- [ ] SMS notifications (optional)
- [ ] White-label options (enterprise)
- [ ] API access (enterprise)

---

## 🎯 Key Design Decisions

### Why Single WhatsApp Connection?

**Current Reality:**
- WhatsApp Web (Baileys) requires one phone number per connection
- Multiple connections = multiple phone numbers = higher costs
- Single connection = one phone number = lower costs

**How It Works:**
- Businesses register their WhatsApp numbers in database
- Bot identifies which business by sender number
- Bot uses that business's FAQs and settings

**Future Evolution:**
- When we scale, we can add multiple WhatsApp connections
- Each connection = one workspace (as reviewer suggested)
- Route by recipient (TO number) instead of sender

### Why Sender-Based Routing?

**Current Implementation:**
- Messages come with `from` (sender) clearly identified
- `to` (recipient) is implicitly the bot's connected number
- We identify business by sender's WhatsApp number

**Why This Works:**
- Each business has a unique WhatsApp number
- Customers message that business's number
- Bot looks up which business owns that number
- Bot responds with that business's FAQs

**Limitation:**
- Requires businesses to use platform's WhatsApp number
- OR: Businesses forward messages (not ideal)

**Future:**
- Support multiple WhatsApp connections
- Each business gets their own connection
- Route by recipient (TO number)

---

## 🚀 Growth Path

### Phase 1: MVP (Current)
- Single WhatsApp connection
- Sender-based routing
- Multi-tenant bot
- Self-service dashboard
- **Target:** 50-100 businesses

### Phase 2: Scale (6-12 months)
- Multiple WhatsApp connections
- Recipient-based routing
- Workspace model (as reviewer suggested)
- Advanced analytics
- **Target:** 200-500 businesses

### Phase 3: Enterprise (12-24 months)
- White-label options
- API access
- Custom integrations
- Dedicated support
- **Target:** 1,000+ businesses

---

## 💡 Why This Architecture (For Now)

### Pragmatic Choices

**1. Single WhatsApp Connection**
- ✅ Lower costs (one phone number)
- ✅ Simpler infrastructure
- ✅ Works for MVP
- ⚠️ Limitation: Requires sender-based routing

**2. Sender-Based Routing**
- ✅ Works with single connection
- ✅ Simple to implement
- ✅ Identifies business correctly
- ⚠️ Limitation: Not ideal for multi-number setup

**3. Multi-Tenant Bot**
- ✅ One instance serves all businesses
- ✅ Lower infrastructure costs
- ✅ Easier to maintain
- ✅ Scales horizontally

### Future Evolution

**When We Scale:**
- Add workspace model (as reviewer suggested)
- Support multiple WhatsApp connections
- Route by recipient (TO number)
- Each workspace = one WhatsApp number

**Migration Path:**
- Current architecture works for MVP
- Can evolve to ideal architecture incrementally
- No rewrite needed

---

## 📝 Summary for Reviewer

**What This Platform Is:**
- Multi-tenant SaaS for Nigerian SMEs
- Provides 24/7 WhatsApp customer support
- Subscription-based revenue model
- Currently in MVP stage (85% complete)

**Current Architecture:**
- Single WhatsApp connection (one phone number)
- Sender-based routing (identify business by customer's number)
- Multi-tenant bot (one instance serves all businesses)
- MongoDB for data storage

**Why Current Design:**
- Pragmatic for MVP (lower costs, simpler)
- Works for 50-100 businesses
- Can evolve to ideal architecture as we scale

**Future Evolution:**
- Add workspace model (as you suggested)
- Support multiple WhatsApp connections
- Route by recipient (TO number)
- Each workspace = one WhatsApp number

**The Reviewer's Insights Are Correct:**
- ✅ Workspace model is the right direction
- ✅ Route by recipient (TO) is better
- ✅ Phone numbers as mailboxes, not identities
- ✅ Data-driven routing, not hardcoded

**But Current Implementation:**
- ✅ Works for MVP stage
- ✅ Pragmatic for single-number setup
- ✅ Can evolve incrementally
- ✅ No rewrite needed

---

**This platform is designed to grow from MVP → Scale → Enterprise, with architecture that can evolve as we scale.**

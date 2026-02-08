# AI Brief: Multi-Connection Architecture

**Date:** February 8, 2026  
**Status:** Clean build - no existing clients  
**Timeline:** 2 weeks  
**Priority:** CRITICAL foundation

---

## 🎯 The Situation

### Current Architecture (MVP)
Our code implements **single WhatsApp connection** with sender-based routing:
- One QR code scan → One connection for entire platform
- Messages routed by WHO is sending (sender's number)
- If sender registered → their FAQ bot
- If sender not registered → Platform Bot

**Problem:** This doesn't work for Nigerian market. Customers won't tolerate "which business are you asking about?" friction.

### Target Architecture (What We Need)
**Multi-connection** architecture:
- Each workspace gets their OWN WhatsApp connection
- Each workspace scans their OWN QR code
- Customer messages workspace's actual WhatsApp number
- That workspace's FAQ bot responds instantly
- Zero friction, natural WhatsApp experience

---

## 📋 What's Already Built

### ✅ WhatsAppConnectionManager Service
**File:** `whatsapp-connection-manager.ts`

I've created a complete multi-connection manager with:
- `createConnection(workspaceId)` - Creates dedicated connection per workspace
- `getQRCode(workspaceId)` - Gets QR for scanning  
- `getConnectionStatus(workspaceId)` - Gets connection status
- `sendMessage(workspaceId, to, message)` - Sends via workspace's connection
- `disconnectWorkspace(workspaceId)` - Disconnects workspace
- `reconnectAllWorkspaces()` - Reconnects all on startup
- Message handler callback for processing messages per workspace

**Key features:**
- Each workspace gets separate auth directory: `./auth/{workspaceId}/`
- Auto-reconnection on disconnect
- Connection status tracking
- Isolated message handling per workspace

---

## 📋 What Needs to Be Done

### 1. Update Database Schema
**File:** `src/models/workspace.ts`

Add WhatsApp connection fields to Workspace model:
- `whatsappConnected` (boolean)
- `whatsappConnectionStatus` (enum: connecting/connected/disconnected/reconnecting)
- `lastConnectedAt` (Date)
- `lastDisconnectedAt` (Date)
- `lastConnectionUpdate` (Date)
- `disconnectReason` (string)

### 2. Update WorkspaceService
**File:** `src/services/workspace-service.ts`

Add methods:
- `updateConnectionStatus(workspaceId, status, reason?)` - Update connection status in DB
- `getActiveWorkspaces()` - Get all workspaces with active/trial subscriptions

### 3. Refactor Bot
**File:** `src/bot.ts`

**Key changes:**
- Replace `SimpleWhatsAppClient` with `WhatsAppConnectionManager`
- Remove single connection logic
- Add message handler that routes by workspaceId (not sender)
- Update `start()` to call `reconnectAllWorkspaces()`
- Update `stop()` to handle multiple connections
- Make `connectionManager` accessible to API server

**Core concept change:**
```
OLD: whatsapp.onMessage() → Check sender → Route
NEW: connectionManager.setMessageHandler() → WorkspaceId known → Process
```

### 4. Create API Endpoints
**File:** `src/api/routes/whatsapp.ts`

Create routes:
- `POST /api/whatsapp/connect` - Generate QR for workspace
- `GET /api/whatsapp/status` - Get connection status
- `GET /api/whatsapp/qr` - Get current QR code
- `POST /api/whatsapp/disconnect` - Disconnect workspace

All routes use JWT auth to get `workspaceId` from token.

### 5. Create Frontend Component
**File:** `frontend/components/WhatsAppConnection.tsx`

Create component that:
- Shows connection status (connected/connecting/disconnected)
- "Connect WhatsApp" button → calls API → shows QR code
- Polls status every 3 seconds while connecting
- Shows "Connected ✅" when ready
- "Disconnect" button for manual disconnect

Add to:
- Dashboard (so clients can connect/check status)
- Onboarding flow (Step 2: Connect WhatsApp)

---

## 🎯 Client Onboarding Flow

**Current (what happens now):**
1. Client signs up → Creates workspace
2. Client adds FAQs → Bot ready
3. ❌ Problem: No WhatsApp connected!

**Target (what we're building):**
1. Client signs up → Creates workspace
2. **Client connects WhatsApp → Scans QR code → Connected!**
3. Client adds FAQs → Bot LIVE on their actual WhatsApp! ✅

---

## 💡 Architecture Comparison

### Single Connection (Current MVP)
```
Platform: One QR scan → One connection
Customer messages ANY number → Bot checks sender
If sender = registered workspace → Use their FAQs
If sender = unknown → Platform Bot

❌ Customers can't reach business's FAQ bot (they're unknown)
❌ Only workspace owner themselves triggers their FAQ bot
```

### Multi-Connection (What We're Building)
```
Workspace 1: Scans QR → Connection 1 (09059764843)
Workspace 2: Scans QR → Connection 2 (08107060160)
Workspace 3: Scans QR → Connection 3 (08123456789)

Customer messages 09059764843 → Workspace 1's FAQ bot responds
Customer messages 08107060160 → Workspace 2's FAQ bot responds
Customer messages 08123456789 → Workspace 3's FAQ bot responds

✅ Each workspace isolated and independent
✅ Natural WhatsApp experience for customers
✅ Zero friction
```

---

## 🚨 Critical Requirements

### For Nigerian Market
- ✅ **Zero friction** - No "which business?" questions
- ✅ **Instant response** - Customer messages, bot replies immediately  
- ✅ **Natural experience** - Feels like chatting with a real person
- ✅ **Professional** - Workspace's actual WhatsApp number, not platform number

### Technical
- ✅ **Isolated connections** - Each workspace completely independent
- ✅ **Auto-reconnect** - Handle disconnects gracefully
- ✅ **Status tracking** - Dashboard shows real-time connection status
- ✅ **Scalable** - Works for 1 workspace or 1000 workspaces

---

## ✅ Definition of Done

This implementation is complete when:
- [ ] Workspace can scan QR code in dashboard
- [ ] Customer messages workspace's actual WhatsApp → FAQ bot responds
- [ ] Dashboard shows connection status (connected/disconnected/connecting)
- [ ] Auto-reconnect works after disconnect
- [ ] Multiple workspaces can connect simultaneously
- [ ] Admin commands work per workspace
- [ ] Rate limiting works per workspace
- [ ] Subscription checks work per workspace

---

## 🎯 Success Metrics

**Customer Experience:**
- Message sent → Response received: < 2 seconds ✅
- "Which business?" questions: 0 ✅
- Customer confusion: 0% ✅

**Business Metrics:**
- Connection success rate: > 95%
- Reconnection time: < 30 seconds
- Message delivery rate: > 99%

---

## 📊 Why This Matters

**Nigerian customers are:**
- Very impatient (expect instant responses)
- Quick to move on (if confused, they'll go to competitors)
- WhatsApp-native (live on WhatsApp all day)
- Won't tolerate friction

**Single connection with "which business?" = Dead on arrival** ❌

**Multi-connection with instant response = Market domination** ✅

---

## 🚀 Implementation Approach

**Week 1: Backend**
1. Update database schema
2. Update WorkspaceService  
3. Refactor bot.ts
4. Test with 1-2 workspaces

**Week 2: Frontend**
5. Create API endpoints
6. Create WhatsAppConnection component
7. Add to dashboard & onboarding
8. End-to-end testing

**Total: 2 weeks to production-ready**

---

## 💪 Your Advantages

**No existing clients = Clean build:**
- ✅ No migration scripts
- ✅ No dual-system maintenance  
- ✅ No backwards compatibility
- ✅ Build it RIGHT from Day 1

**Market timing:**
- ✅ Launch with proper architecture
- ✅ Beat competitors still using single-connection
- ✅ Professional from the start
- ✅ Zero technical debt

---

## 📝 Next Steps

Tell your AI:

> "We need to implement multi-connection architecture. I've created `WhatsAppConnectionManager` - it's ready to use.
> 
> Please help me:
> 1. Update Workspace schema (add connection fields)
> 2. Update WorkspaceService (add connection methods)  
> 3. Refactor bot.ts to use WhatsAppConnectionManager
> 4. Create API endpoints for QR generation
> 5. Create frontend component for WhatsApp connection
> 
> Let's start with #1 - show me the updated Workspace schema."

---

**Timeline:** 2 weeks  
**Impact:** Foundation for entire platform  
**Priority:** CRITICAL  

Let's build this! 🚀
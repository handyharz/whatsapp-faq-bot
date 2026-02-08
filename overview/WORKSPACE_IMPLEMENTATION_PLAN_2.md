# Workspace Implementation Plan

## 🎯 Goal

Add logical workspace abstraction at database level (not infrastructure yet).

**Why:** 2-3 day refactor now vs 3-month rewrite later.

**Timeline:** 1-2 weeks (including testing)

---

## 📋 Implementation Steps

### Step 1: Create Workspace Model

**File:** `src/models/workspace.ts`

```typescript
export interface Workspace {
  _id?: string;
  workspaceId: string; // Unique: "workspace_abc123"
  businessName: string;
  phoneNumbers: string[]; // Can have multiple numbers
  botConfig: {
    type: 'faq' | 'ai' | 'hybrid';
    // Future: AI config, automation rules, etc.
  };
  subscription: {
    tier: 'trial' | 'starter' | 'professional' | 'enterprise';
    status: 'trial' | 'active' | 'expired' | 'cancelled';
    // ... existing subscription fields
  };
  settings: {
    businessHours: { start: number; end: number };
    timezone: string;
    afterHoursMessage: string;
    adminNumbers: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}
```

---

### Step 2: Update Client Model

**File:** `src/models/client.ts`

```typescript
export interface Client {
  // ... existing fields
  workspaceId: string; // NEW - belongs to workspace
  
  // Keep existing fields for backward compatibility
  // But workspaceId is the source of truth
}
```

---

### Step 3: Create Workspace Service

**File:** `src/services/workspace-service.ts`

```typescript
import { getWorkspacesCollection } from '../db/mongodb.js';
import { Workspace } from '../models/workspace.js';

export class WorkspaceService {
  async getWorkspaceById(workspaceId: string): Promise<Workspace | null> {
    const collection = getWorkspacesCollection();
    return await collection.findOne({ workspaceId });
  }
  
  async getWorkspaceByPhoneNumber(phoneNumber: string): Promise<Workspace | null> {
    const collection = getWorkspacesCollection();
    return await collection.findOne({ phoneNumbers: phoneNumber });
  }
  
  async createWorkspace(workspaceData: Omit<Workspace, '_id' | 'createdAt' | 'updatedAt'>): Promise<Workspace> {
    // Create workspace
  }
  
  async updateWorkspace(workspaceId: string, updates: Partial<Workspace>): Promise<Workspace | null> {
    // Update workspace
  }
}
```

---

### Step 4: Migration Script

**File:** `src/scripts/migrate-to-workspaces.ts`

```typescript
// Migrate existing clients to workspaces
// 1. For each client, create a workspace
// 2. Set workspaceId on client
// 3. Move client data to workspace
// 4. Update all queries
```

---

### Step 5: Update Database Schema

**File:** `src/db/mongodb.ts`

- Add `getWorkspacesCollection()` function
- Add workspace indexes
- Update existing indexes to include `workspaceId`

---

### Step 6: Update Routing Logic

**File:** `src/bot.ts`

```typescript
// Old:
const client = await this.getClient(from);

// New:
const workspace = await this.workspaceService.getWorkspaceByPhoneNumber(from);
if (!workspace) {
  // Platform bot
} else {
  // Client bot (load client from workspace)
}
```

---

### Step 7: Update All Queries

Add `workspaceId` to all database queries:
- Messages
- FAQs
- Settings
- Analytics
- Rate limiting

---

## 🔄 Migration Strategy

### Phase 1: Add Workspace (Non-Breaking)
1. Create workspace model
2. Create workspace service
3. Add `workspaceId` field to Client (optional initially)
4. Create migration script

### Phase 2: Migrate Data
1. Run migration script
2. Create workspace for each existing client
3. Set `workspaceId` on all clients
4. Verify data integrity

### Phase 3: Update Logic
1. Update routing to use workspace
2. Update all queries to include workspace
3. Test thoroughly
4. Deploy

### Phase 4: Cleanup (Optional)
1. Remove direct client lookups
2. Ensure all queries use workspace
3. Add workspace validation

---

## ⚠️ Important Notes

1. **Backward Compatibility:** Keep existing Client model working during migration
2. **Gradual Migration:** Can run both old and new logic during transition
3. **Testing:** Test thoroughly before full migration
4. **Rollback Plan:** Keep old code until new code is proven

---

## 📊 Expected Impact

**Benefits:**
- ✅ Foundation for multi-number support
- ✅ Foundation for WhatsApp Cloud API
- ✅ Foundation for Instagram/Telegram
- ✅ Proper tenant isolation
- ✅ Easier to add features per workspace

**Risks:**
- ⚠️ Migration complexity (mitigated by gradual approach)
- ⚠️ Potential bugs during transition (mitigated by testing)

**Timeline:** 1-2 weeks (including testing and deployment)

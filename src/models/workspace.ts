import { FAQ } from './client.js';

export type SubscriptionStatus = 'trial' | 'active' | 'expired' | 'cancelled';
export type SubscriptionTier = 'trial' | 'starter' | 'professional' | 'enterprise';
export type BotType = 'faq' | 'ai' | 'hybrid';

export interface BusinessHours {
  start: number;  // 9 (9am)
  end: number;    // 17 (5pm)
}

export interface WorkspaceSettings {
  businessHours: BusinessHours;
  timezone: string;
  afterHoursMessage: string;
  adminNumbers: string[];
}

export interface WorkspaceSubscription {
  status: SubscriptionStatus;
  tier: SubscriptionTier;
  trialStartDate?: Date;
  trialEndDate?: Date;
  subscriptionStartDate?: Date;
  subscriptionEndDate?: Date;
  lastPaymentDate?: Date;
  paymentMethod?: 'card' | 'bank_transfer';
}

export interface BotConfig {
  type: BotType;
  // Future: AI config, automation rules, etc.
  // aiProvider?: string;
  // aiModel?: string;
  // automationRules?: any[];
}

/**
 * Workspace - Logical tenant boundary
 * 
 * A workspace represents a business's WhatsApp operations.
 * It can have multiple phone numbers, but typically starts with one.
 * 
 * This abstraction enables:
 * - Multiple phone numbers per business
 * - Future: WhatsApp Cloud API, Instagram, Telegram
 * - Proper tenant isolation
 * - Easy feature additions per workspace
 */
export interface Workspace {
  _id?: string;
  workspaceId: string; // Unique: "workspace_abc123"
  businessName: string;
  phoneNumbers: string[]; // Can have multiple numbers
  email: string;
  emailVerified?: boolean; // Email verification status
  emailVerificationToken?: string; // Token for email verification
  emailVerificationExpires?: Date; // Expiration for verification token
  botConfig: BotConfig;
  subscription: WorkspaceSubscription;
  settings: WorkspaceSettings;
  
  // Workspace-level data
  faqs: FAQ[]; // Moved from Client to Workspace
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  
  // Optional: Client reference (for backward compatibility during migration)
  clientId?: string; // Link to original client record
  
  // WhatsApp Connection Status (for multi-connection architecture)
  whatsappConnected?: boolean; // Whether WhatsApp is connected
  whatsappConnectionStatus?: 'connecting' | 'connected' | 'disconnected' | 'reconnecting'; // Current connection status
  lastConnectedAt?: Date; // When connection was last established
  lastDisconnectedAt?: Date; // When connection was last lost
  lastConnectionUpdate?: Date; // Last time connection status was updated
  disconnectReason?: string; // Reason for disconnection (if any)
}

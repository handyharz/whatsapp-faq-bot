export interface FAQ {
  keywords: string[];
  answer: string;
  category?: string;
  priority?: number;
}

export interface BusinessHours {
  start: number;  // 9 (9am)
  end: number;    // 17 (5pm)
}

export interface ClientConfig {
  businessHours: BusinessHours;
  timezone: string;
  afterHoursMessage: string;
  adminNumbers: string[];
}

export type SubscriptionStatus = 'trial' | 'active' | 'expired' | 'cancelled';
export type SubscriptionTier = 'trial' | 'starter' | 'professional' | 'enterprise';
export type Niche = 'fashion' | 'restaurant' | 'logistics' | 'other';

export interface Subscription {
  status: SubscriptionStatus;
  tier: SubscriptionTier;
  trialStartDate?: Date;
  trialEndDate?: Date;
  subscriptionStartDate?: Date;
  subscriptionEndDate?: Date;
  lastPaymentDate?: Date;
  paymentMethod?: 'card' | 'bank_transfer';
}

export interface SocialMedia {
  instagram?: string;
  facebook?: string;
  twitter?: string;
  website?: string;
  tiktok?: string;
}

export interface Client {
  _id?: string;
  clientId: string;
  businessName: string;
  slug: string;
  niche: Niche;
  whatsappNumber: string;
  email: string;
  password?: string; // Hashed password (optional for existing clients)
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  emailVerified?: boolean; // Email verification status
  emailVerificationToken?: string; // Token for email verification
  emailVerificationExpires?: Date; // Expiration for verification token
  address?: string;
  socialMedia?: SocialMedia;
  // Legacy field - kept for backward compatibility
  instagram?: string;
  faqs: FAQ[];
  config: ClientConfig;
  subscription: Subscription;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  // Track WhatsApp number changes for security
  whatsappNumberChanges?: Array<{
    from: string;
    to: string;
    changedAt: Date;
  }>;
  originalWhatsappNumber?: string; // Track original number for trial abuse prevention
  // Pending WhatsApp number change request (for admin approval)
  pendingWhatsappNumberChange?: {
    requestedNumber: string;
    requestedAt: Date;
    reason?: string;
  };
  // NEW: Workspace reference (for migration and backward compatibility)
  workspaceId?: string; // Link to workspace (optional during migration)
}

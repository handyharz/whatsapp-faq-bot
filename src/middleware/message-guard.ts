/**
 * Message Guard Middleware
 * 
 * CRITICAL: Guards handle rate limits, subscription validity, abuse detection, spam
 * Bots should focus on conversation only - separation keeps systems sane
 * 
 * This layer sits between message receipt and bot processing
 */

import { Client } from '../models/client.js';
import { Workspace } from '../models/workspace.js';
import { RateLimiter, RateLimitResult } from '../services/rate-limiter.js';

export interface GuardResult {
  allowed: boolean;
  reason?: string;
  rateLimit?: RateLimitResult;
}

export class MessageGuard {
  private rateLimiter: RateLimiter;

  constructor(rateLimiter: RateLimiter) {
    this.rateLimiter = rateLimiter;
  }

  /**
   * Guard layer - checks all guards before allowing message processing
   * 
   * Flow:
   * message received
   *   ↓
   * guard layer (this)
   *   ↓
   * bot (conversation only)
   */
  async checkGuards(
    tenant: Client | Workspace,
    from: string,
    message: string
  ): Promise<GuardResult> {
    // Guard 1: Subscription validity
    const subscriptionCheck = this.checkSubscription(tenant);
    if (!subscriptionCheck.allowed) {
      return subscriptionCheck;
    }

    // Guard 2: Rate limiting
    const rateLimitCheck = await this.checkRateLimit(tenant, from);
    if (!rateLimitCheck.allowed) {
      return {
        allowed: false,
        reason: rateLimitCheck.reason,
        rateLimit: rateLimitCheck,
      };
    }

    // Guard 3: Abuse detection (future)
    // const abuseCheck = await this.checkAbuse(tenant, from, message);
    // if (!abuseCheck.allowed) {
    //   return abuseCheck;
    // }

    // Guard 4: Spam detection (future)
    // const spamCheck = await this.checkSpam(tenant, from, message);
    // if (!spamCheck.allowed) {
    //   return spamCheck;
    // }

    // All guards passed
    return {
      allowed: true,
      rateLimit: rateLimitCheck,
    };
  }

  /**
   * Guard 1: Check subscription validity
   */
  private checkSubscription(tenant: Client | Workspace): GuardResult {
    // Both Client and Workspace have subscription field
    const subscription = (tenant as Client | Workspace).subscription;
    
    if (subscription.status === 'expired' || subscription.status === 'cancelled') {
      return {
        allowed: false,
        reason: 'subscription_expired',
      };
    }

    // Check if trial expired
    if (subscription.status === 'trial' && subscription.trialEndDate) {
      if (new Date() > new Date(subscription.trialEndDate)) {
        return {
          allowed: false,
          reason: 'trial_expired',
        };
      }
    }

    return { allowed: true };
  }

  /**
   * Guard 2: Check rate limits
   */
  private async checkRateLimit(
    tenant: Client | Workspace,
    from: string
  ): Promise<RateLimitResult> {
    // Convert workspace to client format for rate limiter (backward compatibility)
    const client = this.workspaceToClient(tenant);
    return await this.rateLimiter.checkRateLimit(client, from);
  }

  /**
   * Convert workspace to client format (for rate limiter compatibility)
   */
  private workspaceToClient(tenant: Client | Workspace): Client {
    if ('config' in tenant) {
      // Already a Client
      return tenant;
    }

    // Convert Workspace to Client format
    const workspace = tenant as Workspace;
    return {
      _id: workspace._id,
      clientId: workspace.clientId || workspace.workspaceId,
      businessName: workspace.businessName,
      slug: workspace.workspaceId,
      niche: 'other',
      whatsappNumber: workspace.phoneNumbers[0] || '',
      email: workspace.email,
      faqs: workspace.faqs,
      config: {
        businessHours: workspace.settings.businessHours,
        timezone: workspace.settings.timezone,
        afterHoursMessage: workspace.settings.afterHoursMessage,
        adminNumbers: workspace.settings.adminNumbers,
      },
      subscription: workspace.subscription,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
      lastLoginAt: workspace.lastLoginAt,
      workspaceId: workspace.workspaceId,
    };
  }
}

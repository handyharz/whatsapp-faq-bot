import { getDatabase } from '../db/mongodb.js';
import { Client } from '../models/client.js';
import chalk from 'chalk';

interface RateLimitConfig {
  messagesPerHour: number;
  messagesPerDay: number;
  messagesPerMonth: number;
}

const RATE_LIMITS: Record<Client['subscription']['tier'], RateLimitConfig> = {
  trial: {
    messagesPerHour: 100,
    messagesPerDay: 1000,
    messagesPerMonth: 5000,
  },
  starter: {
    messagesPerHour: 200,
    messagesPerDay: 2000,
    messagesPerMonth: 10000,
  },
  professional: {
    messagesPerHour: 500,
    messagesPerDay: 10000,
    messagesPerMonth: 50000,
  },
  enterprise: {
    messagesPerHour: -1, // Unlimited
    messagesPerDay: -1,
    messagesPerMonth: -1,
  },
};

export interface RateLimitResult {
  allowed: boolean;
  reason?: string;
  remaining?: {
    hourly: number;
    daily: number;
    monthly: number;
  };
}

export class RateLimiter {
  /**
   * Check if message is allowed based on rate limits
   */
  async checkRateLimit(client: Client, from: string): Promise<RateLimitResult> {
    // Use tier, but if status is 'trial', use trial limits
    const tier = client.subscription.status === 'trial' 
      ? 'trial' 
      : client.subscription.tier;
    const limits = RATE_LIMITS[tier];
    const now = new Date();

    // Enterprise tier has unlimited messages
    if (limits.messagesPerHour === -1) {
      return { allowed: true };
    }

    // Get time boundaries
    const hourStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      now.getHours(),
      0,
      0,
      0
    );
    const dayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0
    );
    const monthStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
      0,
      0,
      0,
      0
    );

    const db = getDatabase();
    const messagesCollection = db.collection('messages');

    // Count messages in each period
    const [hourCount, dayCount, monthCount] = await Promise.all([
      messagesCollection.countDocuments({
        clientId: client.clientId,
        from,
        timestamp: { $gte: hourStart },
      }),
      messagesCollection.countDocuments({
        clientId: client.clientId,
        from,
        timestamp: { $gte: dayStart },
      }),
      messagesCollection.countDocuments({
        clientId: client.clientId,
        from,
        timestamp: { $gte: monthStart },
      }),
    ]);

    // Check limits
    if (limits.messagesPerHour > 0 && hourCount >= limits.messagesPerHour) {
      return {
        allowed: false,
        reason: `Rate limit exceeded: Too many messages this hour (${hourCount}/${limits.messagesPerHour})`,
        remaining: {
          hourly: 0,
          daily: Math.max(0, limits.messagesPerDay - dayCount),
          monthly: Math.max(0, limits.messagesPerMonth - monthCount),
        },
      };
    }

    if (limits.messagesPerDay > 0 && dayCount >= limits.messagesPerDay) {
      return {
        allowed: false,
        reason: `Rate limit exceeded: Too many messages today (${dayCount}/${limits.messagesPerDay})`,
        remaining: {
          hourly: Math.max(0, limits.messagesPerHour - hourCount),
          daily: 0,
          monthly: Math.max(0, limits.messagesPerMonth - monthCount),
        },
      };
    }

    if (limits.messagesPerMonth > 0 && monthCount >= limits.messagesPerMonth) {
      return {
        allowed: false,
        reason: `Rate limit exceeded: Monthly limit reached (${monthCount}/${limits.messagesPerMonth})`,
        remaining: {
          hourly: Math.max(0, limits.messagesPerHour - hourCount),
          daily: Math.max(0, limits.messagesPerDay - dayCount),
          monthly: 0,
        },
      };
    }

    return {
      allowed: true,
      remaining: {
        hourly: limits.messagesPerHour - hourCount,
        daily: limits.messagesPerDay - dayCount,
        monthly: limits.messagesPerMonth - monthCount,
      },
    };
  }

  /**
   * Record a message for rate limiting
   */
  async recordMessage(
    clientId: string,
    from: string,
    message: string,
    response: string,
    matchedFAQ?: string
  ): Promise<void> {
    const db = getDatabase();
    const messagesCollection = db.collection('messages');

    await messagesCollection.insertOne({
      clientId,
      from,
      message,
      response,
      matchedFAQ,
      timestamp: new Date(),
      hour: new Date().toISOString().slice(0, 13), // "2026-02-06T14"
      day: new Date().toISOString().slice(0, 10),   // "2026-02-06"
      month: new Date().toISOString().slice(0, 7),  // "2026-02"
    });
  }

  /**
   * Get rate limit info for a client
   */
  getRateLimitInfo(client: Client): RateLimitConfig {
    // Use tier, but if status is 'trial', use trial limits
    const tier = client.subscription.status === 'trial' 
      ? 'trial' 
      : client.subscription.tier;
    return RATE_LIMITS[tier];
  }
}

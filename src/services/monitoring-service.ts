import { getDatabase } from '../db/mongodb.js';
import { CacheService } from './cache-service.js';
import chalk from 'chalk';

export interface ResourceMetrics {
  databaseSize: number; // in bytes
  clientCount: number;
  messageCount: number;
  cacheStats: {
    size: number;
    hitRate: number;
  };
  timestamp: Date;
}

export interface ResourceLimits {
  maxDatabaseSize: number; // 400 MB for free tier
  maxClients: number; // Estimated safe limit
  maxMessages: number; // Per month
}

/**
 * Monitoring service for tracking resource usage
 * Helps stay within free tier limits
 */
export class MonitoringService {
  private cacheService: CacheService;
  private readonly FREE_TIER_LIMITS: ResourceLimits = {
    maxDatabaseSize: 400 * 1024 * 1024, // 400 MB
    maxClients: 5000, // Conservative estimate
    maxMessages: 1000000, // 1M messages/month
  };

  constructor(cacheService: CacheService) {
    this.cacheService = cacheService;
  }

  /**
   * Get current resource metrics
   */
  async getMetrics(): Promise<ResourceMetrics> {
    const db = getDatabase();
    
    // Get database stats
    const dbStats = await db.stats();
    const databaseSize = dbStats.dataSize || 0;

    // Get client count
    const clientsCollection = db.collection('clients');
    const clientCount = await clientsCollection.countDocuments();

    // Get message count (last 30 days)
    const messagesCollection = db.collection('messages');
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const messageCount = await messagesCollection.countDocuments({
      timestamp: { $gte: thirtyDaysAgo },
    });

    // Get cache stats
    const cacheStats = this.cacheService.getStats();

    return {
      databaseSize,
      clientCount,
      messageCount,
      cacheStats: {
        size: cacheStats.size,
        hitRate: cacheStats.hitRate,
      },
      timestamp: new Date(),
    };
  }

  /**
   * Check if resources are within limits
   */
  async checkLimits(): Promise<{
    withinLimits: boolean;
    warnings: string[];
    errors: string[];
  }> {
    const metrics = await this.getMetrics();
    const warnings: string[] = [];
    const errors: string[] = [];

    // Check database size
    const dbUsagePercent = (metrics.databaseSize / this.FREE_TIER_LIMITS.maxDatabaseSize) * 100;
    if (dbUsagePercent >= 90) {
      errors.push(`Database size critical: ${this.formatBytes(metrics.databaseSize)} (${dbUsagePercent.toFixed(1)}% of limit)`);
    } else if (dbUsagePercent >= 75) {
      warnings.push(`Database size high: ${this.formatBytes(metrics.databaseSize)} (${dbUsagePercent.toFixed(1)}% of limit)`);
    }

    // Check client count
    const clientUsagePercent = (metrics.clientCount / this.FREE_TIER_LIMITS.maxClients) * 100;
    if (clientUsagePercent >= 90) {
      errors.push(`Client count critical: ${metrics.clientCount} (${clientUsagePercent.toFixed(1)}% of limit)`);
    } else if (clientUsagePercent >= 75) {
      warnings.push(`Client count high: ${metrics.clientCount} (${clientUsagePercent.toFixed(1)}% of limit)`);
    }

    // Check message volume
    const messageUsagePercent = (metrics.messageCount / this.FREE_TIER_LIMITS.maxMessages) * 100;
    if (messageUsagePercent >= 90) {
      errors.push(`Message volume critical: ${metrics.messageCount} messages (${messageUsagePercent.toFixed(1)}% of limit)`);
    } else if (messageUsagePercent >= 75) {
      warnings.push(`Message volume high: ${metrics.messageCount} messages (${messageUsagePercent.toFixed(1)}% of limit)`);
    }

    // Check cache hit rate
    if (metrics.cacheStats.hitRate < 50 && metrics.cacheStats.size > 10) {
      warnings.push(`Cache hit rate low: ${metrics.cacheStats.hitRate.toFixed(1)}%`);
    }

    return {
      withinLimits: errors.length === 0,
      warnings,
      errors,
    };
  }

  /**
   * Print resource metrics
   */
  async printMetrics(): Promise<void> {
    const metrics = await this.getMetrics();
    const limits = await this.checkLimits();

    console.log(chalk.cyan('\n📊 Resource Metrics:'));
    console.log(chalk.gray(`   Database Size: ${this.formatBytes(metrics.databaseSize)}`));
    console.log(chalk.gray(`   Clients: ${metrics.clientCount}`));
    console.log(chalk.gray(`   Messages (30d): ${metrics.messageCount.toLocaleString()}`));
    console.log(chalk.gray(`   Cache Size: ${metrics.cacheStats.size} clients`));
    console.log(chalk.gray(`   Cache Hit Rate: ${metrics.cacheStats.hitRate.toFixed(1)}%`));

    if (limits.warnings.length > 0) {
      console.log(chalk.yellow('\n⚠️  Warnings:'));
      limits.warnings.forEach(warning => {
        console.log(chalk.yellow(`   - ${warning}`));
      });
    }

    if (limits.errors.length > 0) {
      console.log(chalk.red('\n❌ Errors:'));
      limits.errors.forEach(error => {
        console.log(chalk.red(`   - ${error}`));
      });
    }

    console.log('');
  }

  /**
   * Format bytes to human-readable format
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Get resource usage percentage
   */
  async getUsagePercentages(): Promise<{
    database: number;
    clients: number;
    messages: number;
  }> {
    const metrics = await this.getMetrics();
    
    return {
      database: (metrics.databaseSize / this.FREE_TIER_LIMITS.maxDatabaseSize) * 100,
      clients: (metrics.clientCount / this.FREE_TIER_LIMITS.maxClients) * 100,
      messages: (metrics.messageCount / this.FREE_TIER_LIMITS.maxMessages) * 100,
    };
  }
}

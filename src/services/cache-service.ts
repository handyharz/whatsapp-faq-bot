import { Client, FAQ } from '../models/client.js';
import chalk from 'chalk';

interface CachedClient {
  client: Client;
  faqs: FAQ[];
  timestamp: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
}

/**
 * Cache service for client data, FAQs, and configurations
 * Reduces database queries by caching frequently accessed data
 */
export class CacheService {
  private clientCache: Map<string, CachedClient> = new Map();
  private faqCache: Map<string, FAQ[]> = new Map();
  private configCache: Map<string, Client['config']> = new Map();
  private subscriptionCache: Map<string, Client['subscription']> = new Map();
  
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_CACHE_SIZE = 1000; // Max cached clients
  
  // Statistics
  private stats = {
    hits: 0,
    misses: 0,
  };

  /**
   * Get client with caching
   */
  getClient(whatsappNumber: string, ttl: number = this.DEFAULT_TTL): Client | null {
    const cached = this.clientCache.get(whatsappNumber);
    
    if (cached && (Date.now() - cached.timestamp < ttl)) {
      this.stats.hits++;
      return cached.client;
    }
    
    this.stats.misses++;
    return null;
  }

  /**
   * Set client in cache
   */
  setClient(whatsappNumber: string, client: Client, ttl: number = this.DEFAULT_TTL): void {
    // Evict oldest entries if cache is full
    if (this.clientCache.size >= this.MAX_CACHE_SIZE) {
      this.evictOldest();
    }

    this.clientCache.set(whatsappNumber, {
      client,
      faqs: client.faqs,
      timestamp: Date.now(),
    });

    // Also cache FAQs and config separately for faster access
    this.faqCache.set(whatsappNumber, client.faqs);
    this.configCache.set(whatsappNumber, client.config);
    this.subscriptionCache.set(whatsappNumber, client.subscription);
  }

  /**
   * Get FAQs for a client
   */
  getFAQs(whatsappNumber: string): FAQ[] | null {
    const cached = this.faqCache.get(whatsappNumber);
    if (cached) {
      this.stats.hits++;
      return cached;
    }
    this.stats.misses++;
    return null;
  }

  /**
   * Get config for a client
   */
  getConfig(whatsappNumber: string): Client['config'] | null {
    const cached = this.configCache.get(whatsappNumber);
    if (cached) {
      this.stats.hits++;
      return cached;
    }
    this.stats.misses++;
    return null;
  }

  /**
   * Get subscription for a client
   */
  getSubscription(whatsappNumber: string): Client['subscription'] | null {
    const cached = this.subscriptionCache.get(whatsappNumber);
    if (cached) {
      this.stats.hits++;
      return cached;
    }
    this.stats.misses++;
    return null;
  }

  /**
   * Invalidate cache for a client
   */
  invalidateClient(whatsappNumber: string): void {
    this.clientCache.delete(whatsappNumber);
    this.faqCache.delete(whatsappNumber);
    this.configCache.delete(whatsappNumber);
    this.subscriptionCache.delete(whatsappNumber);
  }

  /**
   * Invalidate cache by clientId
   */
  invalidateByClientId(clientId: string): void {
    // Find WhatsApp number by clientId
    for (const [whatsappNumber, cached] of this.clientCache.entries()) {
      if (cached.client.clientId === clientId) {
        this.invalidateClient(whatsappNumber);
        break;
      }
    }
  }

  /**
   * Clear all caches
   */
  clear(): void {
    this.clientCache.clear();
    this.faqCache.clear();
    this.configCache.clear();
    this.subscriptionCache.clear();
    this.stats = { hits: 0, misses: 0 };
  }

  /**
   * Evict oldest cache entries (LRU-like)
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, cached] of this.clientCache.entries()) {
      if (cached.timestamp < oldestTime) {
        oldestTime = cached.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.invalidateClient(oldestKey);
    }
  }

  /**
   * Clean expired entries
   */
  cleanExpired(ttl: number = this.DEFAULT_TTL): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, cached] of this.clientCache.entries()) {
      if (now - cached.timestamp > ttl) {
        this.invalidateClient(key);
        cleaned++;
      }
    }

    return cleaned;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      size: this.clientCache.size,
      hitRate: Math.round(hitRate * 100) / 100,
    };
  }

  /**
   * Print cache statistics
   */
  printStats(): void {
    const stats = this.getStats();
    console.log(chalk.cyan('\n📊 Cache Statistics:'));
    console.log(chalk.gray(`   Hits: ${stats.hits}`));
    console.log(chalk.gray(`   Misses: ${stats.misses}`));
    console.log(chalk.gray(`   Hit Rate: ${stats.hitRate}%`));
    console.log(chalk.gray(`   Cache Size: ${stats.size} clients\n`));
  }

  /**
   * Get cache size in memory (approximate)
   */
  getCacheSize(): number {
    return this.clientCache.size;
  }
}

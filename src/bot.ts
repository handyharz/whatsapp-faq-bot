import { SimpleWhatsAppClient } from './whatsapp/simple-client.js';
import { FAQMatcher } from './faq-matcher.js';
import { connectToMongoDB, disconnectFromMongoDB } from './db/mongodb.js';
import { ClientService, setCacheInvalidationCallback } from './services/client-service.js';
import { RateLimiter } from './services/rate-limiter.js';
import { SubscriptionService } from './services/subscription-service.js';
import { CacheService } from './services/cache-service.js';
import { MonitoringService } from './services/monitoring-service.js';
import { PlatformBot } from './platform-bot.js';
import { Client } from './models/client.js';
import { config } from './config.js';
import chalk from 'chalk';

export class FAQBot {
  private whatsapp: SimpleWhatsAppClient;
  private clientService: ClientService;
  private rateLimiter: RateLimiter;
  private subscriptionService: SubscriptionService;
  private cacheService: CacheService;
  private monitoringService: MonitoringService;
  private platformBot: PlatformBot;
  private platformBotNumber: string | null = null;
  private expiryCheckInterval: NodeJS.Timeout | null = null;
  private cacheCleanInterval: NodeJS.Timeout | null = null;
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.whatsapp = new SimpleWhatsAppClient();
    this.clientService = new ClientService();
    this.rateLimiter = new RateLimiter();
    this.subscriptionService = new SubscriptionService();
    this.cacheService = new CacheService();
    this.monitoringService = new MonitoringService(this.cacheService);
    this.platformBot = new PlatformBot();
    
    // Get platform bot number from config (first admin number)
    this.platformBotNumber = config.adminNumbers.length > 0 ? config.adminNumbers[0] : null;

    // Set up cache invalidation callback
    setCacheInvalidationCallback((whatsappNumber: string) => {
      this.cacheService.invalidateClient(whatsappNumber);
    });
  }

  /**
   * Get client with caching
   */
  private async getClient(whatsappNumber: string): Promise<Client | null> {
    // Check cache first
    const cached = this.cacheService.getClient(whatsappNumber);
    if (cached) {
      return cached;
    }

    // Load from database
    const client = await this.clientService.getClientByWhatsAppNumber(whatsappNumber);
    
    if (client) {
      // Cache it
      this.cacheService.setClient(whatsappNumber, client);
    }

    return client;
  }

  private isBusinessHours(client: Client): boolean {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay(); // 0 = Sunday, 6 = Saturday

    // Closed on weekends
    if (day === 0 || day === 6) {
      return false;
    }

    // Check hours from client config
    const { start, end } = client.config.businessHours;
    return hour >= start && hour < end;
  }

  private formatPhoneNumber(phone: string): string {
    // Remove @s.whatsapp.net or @g.us suffix
    return phone.split('@')[0];
  }

  private isAdmin(phone: string, client: Client): boolean {
    const formatted = this.formatPhoneNumber(phone);
    return client.config.adminNumbers.some(admin => 
      formatted.includes(admin) || admin.includes(formatted)
    );
  }

  async start(): Promise<void> {
    console.log(chalk.blue('🚀 Starting WhatsApp FAQ Bot...\n'));

    // Connect to MongoDB
    await connectToMongoDB();
    
    // Start API server if enabled
    const startAPI = process.env.START_API_SERVER === 'true' || process.env.START_API_SERVER === '1';
    if (startAPI) {
      const { startAPIServer } = await import('./api/server.js');
      await startAPIServer();
    }

    // Connect to WhatsApp
    await this.whatsapp.connect();

    // Handle messages
    this.whatsapp.onMessage(async (data) => {
      const { from, message, isGroup } = data;

      // Skip group messages
      if (isGroup) {
        return;
      }

      const phone = this.formatPhoneNumber(from);

      // Check if this is a platform bot message (sent to admin number)
      if (this.platformBotNumber && phone.includes(this.platformBotNumber.replace('+', ''))) {
        // Handle platform bot message
        const response = await this.platformBot.handleMessage(from, message);
        await this.whatsapp.sendMessage(from, response);
        console.log(chalk.magenta(`🤖 Platform Bot: ${phone} → ${message.substring(0, 50)}...`));
        return;
      }

      // Get client from database
      const client = await this.getClient(from);
      
      if (!client) {
        console.log(chalk.yellow(`⚠️  No client found for ${from}`));
        return;
      }

      const upperMessage = message.toUpperCase().trim();

      console.log(chalk.cyan(`📨 Message from ${phone} (${client.businessName}): ${message}`));

      // Handle special commands
      if (upperMessage === 'STOP') {
        await this.whatsapp.sendMessage(
          from,
          "You've unsubscribed from automated messages. Send 'START' to subscribe again."
        );
        console.log(chalk.yellow(`   → Sent: Unsubscribe confirmation`));
        return;
      }

      if (upperMessage === 'START') {
        await this.whatsapp.sendMessage(
          from,
          'Welcome back! 👋 Send "HELP" to see what I can help you with.'
        );
        console.log(chalk.yellow(`   → Sent: Welcome message`));
        return;
      }

      // Check subscription status
      if (client.subscription.status === 'expired' || 
          client.subscription.status === 'cancelled') {
        await this.whatsapp.sendMessage(
          from,
          "⚠️ Your subscription has expired. Please renew to continue using the service."
        );
        console.log(chalk.yellow(`   → Sent: Subscription expired message`));
        return;
      }

      // Check if trial expired
      if (client.subscription.status === 'trial' && 
          client.subscription.trialEndDate && 
          new Date() > new Date(client.subscription.trialEndDate)) {
        // Update status
        await this.clientService.updateSubscriptionStatus(client.clientId, 'expired');
        // Clear cache
        this.cacheService.invalidateClient(from);
        
        await this.whatsapp.sendMessage(
          from,
          "⏰ Your free trial has ended. Subscribe now to continue."
        );
        console.log(chalk.yellow(`   → Sent: Trial expired message`));
        return;
      }

      // Admin commands
      if (this.isAdmin(phone, client)) {
        if (upperMessage.startsWith('/RELOAD')) {
          // Reload client from database (clears cache)
          this.cacheService.invalidateClient(from);
          const reloadedClient = await this.getClient(from);
          if (reloadedClient) {
            await this.whatsapp.sendMessage(from, '✅ FAQs reloaded!');
            console.log(chalk.green(`   → Admin: Reloaded FAQs`));
          }
          return;
        }

        if (upperMessage.startsWith('/STATUS')) {
          const status = {
            connected: this.whatsapp.isConnected(),
            faqsCount: client.faqs.length,
            businessHours: this.isBusinessHours(client),
            subscriptionStatus: client.subscription.status,
            subscriptionTier: client.subscription.tier,
            currentTime: new Date().toLocaleString('en-NG', { 
              timeZone: client.config.timezone 
            }),
          };
          await this.whatsapp.sendMessage(
            from,
            `📊 Bot Status:\n` +
            `Connected: ${status.connected ? '✅' : '❌'}\n` +
            `FAQs: ${status.faqsCount}\n` +
            `Subscription: ${status.subscriptionStatus} (${status.subscriptionTier})\n` +
            `Business Hours: ${status.businessHours ? 'Open' : 'Closed'}\n` +
            `Time: ${status.currentTime}`
          );
          console.log(chalk.green(`   → Admin: Status requested`));
          return;
        }
      }

      // Check rate limits (before processing - counts all messages)
      const rateLimit = await this.rateLimiter.checkRateLimit(client, from);
      if (!rateLimit.allowed) {
        await this.whatsapp.sendMessage(
          from,
          `⚠️ Rate limit exceeded. ${rateLimit.reason}\n\n` +
          `Your plan: ${client.subscription.tier}\n` +
          `Please upgrade or wait before sending more messages.`
        );
        console.log(chalk.yellow(`   → Rate limit exceeded for ${phone}`));
        // Still record the message for tracking
        await this.rateLimiter.recordMessage(
          client.clientId,
          from,
          message,
          'Rate limit exceeded',
          undefined
        );
        return;
      }

      // Check business hours
      if (!this.isBusinessHours(client)) {
        const afterHoursResponse = client.config.afterHoursMessage;
        await this.whatsapp.sendMessage(from, afterHoursResponse);
        console.log(chalk.yellow(`   → Sent: After-hours message`));
        // Record message for rate limiting
        await this.rateLimiter.recordMessage(
          client.clientId,
          from,
          message,
          afterHoursResponse,
          undefined
        );
        return;
      }

      // Process message with client's FAQs
      const response = await this.processMessage(client, from, message);
      
      // Record message for rate limiting (after successful processing)
      if (response) {
        await this.rateLimiter.recordMessage(
          client.clientId,
          from,
          message,
          response.answer || response.defaultAnswer || '',
          response.matchedFAQ
        );
      }
    });

    // Start subscription expiry checker (runs every hour)
    this.startExpiryChecker();

    // Start cache cleanup (runs every 10 minutes)
    this.startCacheCleanup();

    // Start resource monitoring (runs every 30 minutes)
    this.startMonitoring();

    console.log(chalk.green('\n✅ Bot is running! Waiting for messages...\n'));
    console.log(chalk.gray('Press Ctrl+C to stop\n'));
  }

  private startExpiryChecker(): void {
    // Check for expired subscriptions every hour
    this.expiryCheckInterval = setInterval(async () => {
      try {
        const count = await this.subscriptionService.checkExpiredSubscriptions();
        if (count > 0) {
          // Invalidate cache for expired clients
          this.cacheService.clear();
        }
      } catch (error) {
        console.error(chalk.red('❌ Error checking expired subscriptions:'), error);
      }
    }, 60 * 60 * 1000); // 1 hour

    // Also check immediately on startup
    this.subscriptionService.checkExpiredSubscriptions().catch((error) => {
      console.error(chalk.red('❌ Error checking expired subscriptions on startup:'), error);
    });
  }

  private startCacheCleanup(): void {
    // Clean expired cache entries every 10 minutes
    this.cacheCleanInterval = setInterval(() => {
      try {
        const cleaned = this.cacheService.cleanExpired();
        if (cleaned > 0) {
          console.log(chalk.gray(`🧹 Cleaned ${cleaned} expired cache entries`));
        }
      } catch (error) {
        console.error(chalk.red('❌ Error cleaning cache:'), error);
      }
    }, 10 * 60 * 1000); // 10 minutes
  }

  private startMonitoring(): void {
    // Monitor resources every 30 minutes
    this.monitoringInterval = setInterval(async () => {
      try {
        await this.monitoringService.printMetrics();
      } catch (error) {
        console.error(chalk.red('❌ Error monitoring resources:'), error);
      }
    }, 30 * 60 * 1000); // 30 minutes

    // Also check immediately on startup (after a delay)
    setTimeout(async () => {
      try {
        await this.monitoringService.printMetrics();
        this.cacheService.printStats();
      } catch (error) {
        console.error(chalk.red('❌ Error monitoring resources on startup:'), error);
      }
    }, 5000); // 5 seconds after startup
  }

  private async processMessage(
    client: Client,
    from: string,
    message: string
  ): Promise<{ answer?: string; defaultAnswer?: string; matchedFAQ?: string } | null> {
    // Use client's FAQs
    const matcher = new FAQMatcher(client.faqs);
    const faq = matcher.match(message);

    if (faq) {
      await this.whatsapp.sendMessage(from, faq.answer);
      console.log(chalk.green(`   → Sent: FAQ match (${faq.category || 'unknown'})`));
      return { answer: faq.answer, matchedFAQ: faq.category };
    } else {
      // Default response
      const defaultAnswer = matcher.getDefaultAnswer();
      await this.whatsapp.sendMessage(from, defaultAnswer);
      console.log(chalk.yellow(`   → Sent: Default response`));
      return { defaultAnswer };
    }
  }

  async stop(): Promise<void> {
    console.log(chalk.yellow('\n🛑 Stopping bot...'));
    
    // Stop all intervals
    if (this.expiryCheckInterval) {
      clearInterval(this.expiryCheckInterval);
      this.expiryCheckInterval = null;
    }
    if (this.cacheCleanInterval) {
      clearInterval(this.cacheCleanInterval);
      this.cacheCleanInterval = null;
    }
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    // Print final stats
    this.cacheService.printStats();
    
    await this.whatsapp.disconnect();
    await disconnectFromMongoDB();
    console.log(chalk.green('✅ Bot stopped'));
  }
}

// Start bot if run directly
if (import.meta.url === `file://${process.argv[1]}` || require.main === module) {
  const bot = new FAQBot();

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    await bot.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await bot.stop();
    process.exit(0);
  });

  bot.start().catch((error) => {
    console.error(chalk.red('❌ Fatal error:'), error);
    process.exit(1);
  });
}

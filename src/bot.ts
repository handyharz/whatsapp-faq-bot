import { WhatsAppConnectionManager, MessageHandler } from './services/whatsapp-connection-manager.js';
import { FAQMatcher } from './faq-matcher.js';
import { connectToMongoDB, disconnectFromMongoDB } from './db/mongodb.js';
import { ClientService, setCacheInvalidationCallback } from './services/client-service.js';
import { WorkspaceService } from './services/workspace-service.js';
import { RateLimiter } from './services/rate-limiter.js';
import { SubscriptionService } from './services/subscription-service.js';
import { CacheService } from './services/cache-service.js';
import { MonitoringService } from './services/monitoring-service.js';
import { PlatformBot } from './platform-bot.js';
import { MessageGuard } from './middleware/message-guard.js';
import { ConnectionMonitorService } from './services/connection-monitor.js';
import { sendDisconnectAlert, sendBulkDisconnectAlert } from './utils/email-alerts.js';
import { Client } from './models/client.js';
import { Workspace } from './models/workspace.js';
import { extractPhoneFromJid, phoneNumbersMatch } from './utils/phone-normalizer.js';
import { config } from './config.js';
import chalk from 'chalk';

export class FAQBot {
  private connectionManager: WhatsAppConnectionManager;
  private clientService: ClientService;
  private workspaceService: WorkspaceService;
  private rateLimiter: RateLimiter;
  private subscriptionService: SubscriptionService;
  private cacheService: CacheService;
  private monitoringService: MonitoringService;
  private connectionMonitor: ConnectionMonitorService;
  private platformBot: PlatformBot;
  private messageGuard: MessageGuard;
  private platformBotNumber: string | null = null;
  private expiryCheckInterval: NodeJS.Timeout | null = null;
  private cacheCleanInterval: NodeJS.Timeout | null = null;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private platformWorkspaceId: string | null = null; // Platform bot workspace ID
  // Track recently sent messages to prevent echo loops (messages we sent that come back as incoming)
  private recentlySentMessages: Map<string, { message: string; timestamp: number }> = new Map();
  private readonly SENT_MESSAGE_TTL = 10000; // 10 seconds - messages older than this are considered stale

  constructor() {
    this.workspaceService = new WorkspaceService();
    this.connectionManager = new WhatsAppConnectionManager(this.workspaceService);
    this.clientService = new ClientService();
    this.rateLimiter = new RateLimiter();
    this.subscriptionService = new SubscriptionService();
    this.cacheService = new CacheService();
    this.monitoringService = new MonitoringService(this.cacheService);
    this.connectionMonitor = new ConnectionMonitorService();
    this.platformBot = new PlatformBot();
    
    // CRITICAL: Guard layer (handles rate limits, subscription, abuse, spam)
    this.messageGuard = new MessageGuard(this.rateLimiter);
    
    // Get platform bot number from config (first admin number)
    this.platformBotNumber = config.adminNumbers.length > 0 ? config.adminNumbers[0] : null;

    // Set up cache invalidation callback
    setCacheInvalidationCallback((whatsappNumber: string) => {
      this.cacheService.invalidateClient(whatsappNumber);
    });
  }

  /**
   * Get current QR code for a workspace (for API access)
   */
  getCurrentQR(workspaceId?: string): string | null {
    if (workspaceId) {
      return this.connectionManager.getQRCode(workspaceId);
    }
    // If no workspaceId provided, return QR for first connecting workspace (for backward compatibility)
    const allConnections = this.connectionManager.getAllConnections();
    const connecting = allConnections.find(c => c.status === 'connecting');
    return connecting?.qrCode || null;
  }

  /**
   * Send a message and track it to prevent echo loops
   * This method wraps connectionManager.sendMessage and tracks sent messages
   * so we can ignore them if they come back as incoming messages
   */
  private async sendMessageAndTrack(
    workspaceId: string,
    to: string,
    message: string
  ): Promise<void> {
    // Send the message
    await this.connectionManager.sendMessage(workspaceId, to, message);
    
    // Track it to prevent echo loops (messages we sent that come back as incoming)
    const normalizedTo = this.formatPhoneNumber(to);
    const messageKey = `${normalizedTo}:${message.trim()}`;
    this.recentlySentMessages.set(messageKey, {
      message: message.trim(),
      timestamp: Date.now(),
    });
    
    // Clean up old entries (older than TTL)
    const now = Date.now();
    for (const [key, value] of this.recentlySentMessages.entries()) {
      if (now - value.timestamp > this.SENT_MESSAGE_TTL) {
        this.recentlySentMessages.delete(key);
      }
    }
  }

  /**
   * Get workspace by phone number (with caching)
   * This is the primary lookup method - workspaces are the new tenant boundary
   * CRITICAL: Uses in-memory cache for O(1) lookup (prevents DB roundtrip on every message)
   */
  private async getWorkspace(phoneNumber: string): Promise<Workspace | null> {
    try {
      // Normalize phone number
      const normalized = extractPhoneFromJid(phoneNumber);
      
      // CRITICAL: Check in-memory workspace lookup cache first (O(1))
      const cachedWorkspaceId = this.cacheService.getWorkspaceIdByPhone(normalized);
      if (cachedWorkspaceId) {
        // Fast path: Get workspace by ID (also cached)
        const workspace = await this.workspaceService.getWorkspaceById(cachedWorkspaceId);
        if (workspace) return workspace;
      }

      // Fallback: Load workspace from database (cache miss)
      const workspace = await this.workspaceService.getWorkspaceByPhoneNumber(normalized);
      
      if (workspace) {
        // CRITICAL: Cache the phone → workspaceId mapping for future O(1) lookups
        for (const phone of workspace.phoneNumbers) {
          this.cacheService.setWorkspacePhoneMapping(phone, workspace.workspaceId);
        }
        // Also cache the full workspace (backward compatibility)
        this.cacheService.setClient(normalized, workspace as any);
      }

      return workspace;
    } catch (error) {
      // Handle invalid JID format gracefully
      console.error(chalk.red(`⚠️  Failed to extract phone from JID "${phoneNumber}":`), (error as Error).message);
      return null; // Return null instead of crashing
    }
  }

  /**
   * Get client with caching (backward compatibility)
   * Falls back to client lookup if workspace not found
   */
  private async getClient(whatsappNumber: string): Promise<Client | null> {
    try {
      // First try workspace
      const workspace = await this.getWorkspace(whatsappNumber);
      if (workspace) {
        // Convert workspace to client format for backward compatibility
        return this.workspaceToClient(workspace);
      }

      // Fall back to client lookup (for unmigrated clients)
      const normalized = extractPhoneFromJid(whatsappNumber);
      const cached = this.cacheService.getClient(normalized);
      if (cached && !(cached as any).workspaceId) {
        return cached as Client;
      }

      const client = await this.clientService.getClientByWhatsAppNumber(normalized);
      
      if (client) {
        this.cacheService.setClient(normalized, client);
      }

      return client;
    } catch (error) {
      // Handle invalid JID format gracefully
      console.error(chalk.red(`⚠️  Failed to extract phone from JID "${whatsappNumber}":`), (error as Error).message);
      return null; // Return null instead of crashing
    }
  }

  /**
   * Convert workspace to client format (for backward compatibility)
   */
  private workspaceToClient(workspace: Workspace): Client {
    return {
      _id: workspace._id,
      clientId: workspace.clientId || workspace.workspaceId,
      businessName: workspace.businessName,
      slug: workspace.workspaceId, // Use workspaceId as slug
      niche: 'other', // Default niche (valid values: 'fashion' | 'restaurant' | 'logistics' | 'other')
      whatsappNumber: workspace.phoneNumbers[0] || '',
      email: workspace.email,
      faqs: workspace.faqs,
      config: {
        businessHours: workspace.settings.businessHours,
        timezone: workspace.settings.timezone,
        afterHoursMessage: workspace.settings.afterHoursMessage,
        adminNumbers: workspace.settings.adminNumbers,
      },
      subscription: {
        status: workspace.subscription.status,
        tier: workspace.subscription.tier,
        trialStartDate: workspace.subscription.trialStartDate,
        trialEndDate: workspace.subscription.trialEndDate,
        subscriptionStartDate: workspace.subscription.subscriptionStartDate,
        subscriptionEndDate: workspace.subscription.subscriptionEndDate,
        lastPaymentDate: workspace.subscription.lastPaymentDate,
        paymentMethod: workspace.subscription.paymentMethod,
      },
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
      lastLoginAt: workspace.lastLoginAt,
      workspaceId: workspace.workspaceId,
    };
  }

  private isBusinessHours(clientOrWorkspace: Client | Workspace): boolean {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay(); // 0 = Sunday, 6 = Saturday

    // Closed on weekends
    if (day === 0 || day === 6) {
      return false;
    }

    // Check hours from config/settings
    let start: number, end: number;
    if ('config' in clientOrWorkspace) {
      // Client format
      ({ start, end } = clientOrWorkspace.config.businessHours);
    } else {
      // Workspace format
      ({ start, end } = clientOrWorkspace.settings.businessHours);
    }
    
    return hour >= start && hour < end;
  }

  private formatPhoneNumber(phone: string): string {
    // CRITICAL: Use centralized phone normalizer for consistency
    // This ensures all phone numbers are normalized the same way across the platform
    return extractPhoneFromJid(phone);
  }

  /**
   * Handle message from a workspace connection
   * CRITICAL: This is called by WhatsAppConnectionManager when a message arrives
   * The workspaceId is known because the message came through that workspace's connection
   */
  private async handleWorkspaceMessage(
    workspaceId: string,
    from: string,
    message: string,
    isGroup: boolean
  ): Promise<void> {
    // Skip group messages
      if (isGroup) {
        return;
      }

    // Validate JID format before processing
    if (!from || typeof from !== 'string' || from.trim().length === 0) {
      console.error(chalk.red(`⚠️  Invalid JID received: ${JSON.stringify(from)}`));
      return;
    }

      const phone = this.formatPhoneNumber(from);

    // Get workspace (we already know workspaceId, but fetch for data)
    const workspace = await this.workspaceService.getWorkspaceById(workspaceId);
    if (!workspace) {
      console.error(chalk.red(`⚠️  Workspace ${workspaceId} not found`));
      return;
    }

    // CRITICAL: Prevent infinite loop - ignore messages from workspace's own phone number
    // This happens when the bot sends a message to itself (e.g., during testing or misconfiguration)
    // Check if the sender's number matches any of the workspace's phone numbers
    const isOwnNumber = workspace.phoneNumbers.some(workspacePhone => {
      try {
        return phoneNumbersMatch(phone, workspacePhone);
      } catch {
        // If normalization fails, do a simple string comparison as fallback
        return phone === workspacePhone || phone.includes(workspacePhone) || workspacePhone.includes(phone);
      }
    });
    
    if (isOwnNumber) {
      console.log(chalk.gray(`⏭️  Ignoring message from workspace's own number: ${phone} (workspace: ${workspace.phoneNumbers.join(', ')})`));
      return;
    }

    // CRITICAL: Prevent echo loop - ignore incoming messages that match recently sent messages
    // This happens when WhatsApp delivers our outbound messages back as inbound messages
    const messageKey = `${phone}:${message.trim()}`;
    const recentSent = this.recentlySentMessages.get(messageKey);
    if (recentSent && (Date.now() - recentSent.timestamp) < this.SENT_MESSAGE_TTL) {
      console.log(chalk.gray(`⏭️  Ignoring echo message (recently sent): ${phone} → "${message.substring(0, 50)}..."`));
      return;
    }

    // Convert to client format for backward compatibility with existing logic
    const client = this.workspaceToClient(workspace);
    const businessName = workspace.businessName;
    console.log(chalk.cyan(`📨 Message from ${phone} (${businessName}): ${message}`));

      const upperMessage = message.toUpperCase().trim();

      // Handle special commands
      if (upperMessage === 'STOP') {
      await this.sendMessageAndTrack(
        workspaceId,
          from,
          "You've unsubscribed from automated messages. Send 'START' to subscribe again."
        );
        console.log(chalk.yellow(`   → Sent: Unsubscribe confirmation`));
        return;
      }

      if (upperMessage === 'START') {
      await this.sendMessageAndTrack(
        workspaceId,
          from,
          'Welcome back! 👋 Send "HELP" to see what I can help you with.'
        );
        console.log(chalk.yellow(`   → Sent: Welcome message`));
        return;
      }

    // CRITICAL: Guard layer - checks subscription, rate limits, abuse, spam
    const guardResult = await this.messageGuard.checkGuards(workspace, from, message);
    
    if (!guardResult.allowed) {
      // Handle subscription expired
      if (guardResult.reason === 'subscription_expired' || guardResult.reason === 'trial_expired') {
        // Update status if trial expired
        if (guardResult.reason === 'trial_expired') {
          await this.workspaceService.updateSubscriptionStatus(workspaceId, 'expired');
          this.cacheService.invalidateClient(from);
        }
        
        const message = guardResult.reason === 'trial_expired'
          ? "⏰ Your free trial has ended. Subscribe now to continue."
          : "⚠️ Your subscription has expired. Please renew to continue using the service.";
        
        await this.sendMessageAndTrack(workspaceId, from, message);
        console.log(chalk.yellow(`   → Guard: ${guardResult.reason}`));
        
        // Record message
        await this.rateLimiter.recordMessage(
          workspaceId,
          from,
          message,
          message,
          undefined,
          workspaceId,
          undefined // connectionId - will be added when connection model is implemented
        );
        return;
      }
      
      // Handle rate limit exceeded
      if (guardResult.rateLimit && !guardResult.rateLimit.allowed) {
        await this.sendMessageAndTrack(
          workspaceId,
          from,
          `⚠️ Rate limit exceeded. ${guardResult.rateLimit.reason}\n\n` +
          `Your plan: ${workspace.subscription.tier}\n` +
          `Please upgrade or wait before sending more messages.`
        );
        console.log(chalk.yellow(`   → Guard: Rate limit exceeded for ${phone}`));
        
        // Record message
        await this.rateLimiter.recordMessage(
          workspaceId,
          from,
          message,
          'Rate limit exceeded',
          undefined,
          workspaceId,
          undefined // connectionId
        );
        return;
      }
      
      return; // Other guard failures
    }

      // Admin commands
    if (this.isAdmin(phone, workspace)) {
        if (upperMessage.startsWith('/RELOAD')) {
        // Reload workspace from database (clears cache)
        this.cacheService.invalidateClient(from);
        const reloadedWorkspace = await this.workspaceService.getWorkspaceById(workspaceId);
        if (reloadedWorkspace) {
          await this.sendMessageAndTrack(workspaceId, from, '✅ FAQs reloaded!');
          console.log(chalk.green(`   → Admin: Reloaded FAQs`));
        }
        return;
        }

        if (upperMessage.startsWith('/STATUS')) {
          const status = {
          connected: this.connectionManager.getConnectionStatus(workspaceId)?.status === 'connected',
          faqsCount: workspace.faqs.length,
          businessHours: this.isBusinessHours(workspace),
          subscriptionStatus: workspace.subscription.status,
          subscriptionTier: workspace.subscription.tier,
          currentTime: new Date().toLocaleString('en-NG', { 
            timeZone: workspace.settings.timezone 
          }),
        };
        await this.connectionManager.sendMessage(
          workspaceId,
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

      // Check business hours
    if (!this.isBusinessHours(workspace)) {
      const afterHoursResponse = workspace.settings.afterHoursMessage;
      await this.sendMessageAndTrack(workspaceId, from, afterHoursResponse);
        console.log(chalk.yellow(`   → Sent: After-hours message`));
      // Record message for rate limiting
      await this.rateLimiter.recordMessage(
        workspaceId,
        from,
        message,
        afterHoursResponse,
        undefined,
        workspaceId,
        undefined // connectionId
      );
        return;
      }

    // Process message with workspace's FAQs
    const response = await this.processMessage(workspace.faqs, workspaceId, from, message);
    
    // Record message for rate limiting (after successful processing)
    if (response) {
      await this.rateLimiter.recordMessage(
        workspaceId,
        from,
        message,
        response.answer || response.defaultAnswer || '',
        response.matchedFAQ,
        workspaceId,
        undefined // connectionId
      );
    }
  }

  private isAdmin(phone: string, clientOrWorkspace: Client | Workspace): boolean {
    const formatted = this.formatPhoneNumber(phone);
    const adminNumbers = 'config' in clientOrWorkspace 
      ? clientOrWorkspace.config.adminNumbers 
      : clientOrWorkspace.settings.adminNumbers;
    
    return adminNumbers.some(admin => 
      formatted.includes(admin) || admin.includes(formatted)
    );
  }

  async start(): Promise<void> {
    console.log(chalk.blue('🚀 Starting WhatsApp FAQ Bot...\n'));

    // Connect to MongoDB
    await connectToMongoDB();
    
    // Initialize bot instance for API server access (must be before API server starts)
    botInstance = this;
    
    // Start API server if enabled
    const startAPI = process.env.START_API_SERVER === 'true' || process.env.START_API_SERVER === '1';
    if (startAPI) {
      const { startAPIServer } = await import('./api/server.js');
      await startAPIServer();
    }

    // Set up message handler (called when any workspace connection receives a message)
    this.connectionManager.setMessageHandler(
      async (workspaceId: string, from: string, message: string, isGroup: boolean) => {
        await this.handleWorkspaceMessage(workspaceId, from, message, isGroup);
      }
    );

    // Reconnect all active workspaces (multi-connection architecture)
    await this.connectionManager.reconnectAllWorkspaces();

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
    faqs: Client['faqs'],
    workspaceId: string,
    from: string,
    message: string
  ): Promise<{ answer?: string; defaultAnswer?: string; matchedFAQ?: string } | null> {
    // Use workspace's FAQs
    const matcher = new FAQMatcher(faqs);
    const faq = matcher.match(message);

    if (faq) {
      await this.sendMessageAndTrack(workspaceId, from, faq.answer);
      console.log(chalk.green(`   → Sent: FAQ match (${faq.category || 'unknown'})`));
      return { answer: faq.answer, matchedFAQ: faq.category };
    } else {
      // Default response
      const defaultAnswer = matcher.getDefaultAnswer();
      await this.sendMessageAndTrack(workspaceId, from, defaultAnswer);
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
    this.connectionManager.printStats();
    
    // Disconnect all workspace connections
    const allConnections = this.connectionManager.getAllConnections();
    for (const connection of allConnections) {
      try {
        await this.connectionManager.disconnectWorkspace(connection.workspaceId);
      } catch (error) {
        console.error(chalk.red(`❌ Error disconnecting ${connection.workspaceId}:`), error);
      }
    }
    
    await disconnectFromMongoDB();
    console.log(chalk.green('✅ Bot stopped'));
  }

  /**
   * Get connection manager (for API server access)
   */
  getConnectionManager(): WhatsAppConnectionManager {
    return this.connectionManager;
  }
}

// Export bot instance for API server access
let botInstance: FAQBot | null = null;

// Start bot if run directly
if (import.meta.url === `file://${process.argv[1]}` || require.main === module) {
  botInstance = new FAQBot();

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    if (botInstance) {
      await botInstance.stop();
    }
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    if (botInstance) {
      await botInstance.stop();
    }
    process.exit(0);
  });

  botInstance.start().catch((error) => {
    console.error(chalk.red('❌ Fatal error:'), error);
    process.exit(1);
  });
}

// Export function to get bot instance (for API server)
export function getBotInstance(): FAQBot | null {
  return botInstance;
}

// Initialize bot instance if not already created (for API server)
export function initializeBotInstance(): FAQBot {
  if (!botInstance) {
    botInstance = new FAQBot();
  }
  return botInstance;
}

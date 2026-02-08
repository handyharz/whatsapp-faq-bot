import makeWASocket, {
  WASocket,
  DisconnectReason,
  useMultiFileAuthState,
  ConnectionState,
  Browsers,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import chalk from 'chalk';
import { WorkspaceService } from './workspace-service.js';
import { Workspace } from '../models/workspace.js';
import { extractPhoneFromJid } from '../utils/phone-normalizer.js';
import fs from 'fs';
import path from 'path';

export interface ConnectionInfo {
  clientId: string;
  workspaceId: string;
  socket: WASocket;
  status: 'connecting' | 'connected' | 'disconnected' | 'reconnecting';
  qrCode: string | null;
  phoneNumber: string;
  connectedAt?: Date;
  lastDisconnectedAt?: Date;
  disconnectReason?: string;
  // Message tracking for expectation management
  lastSuccessfulOutbound?: Date; // Last time we successfully sent a message
  lastInboundMessage?: Date; // Last time we received a message
  lastHealthCheck?: Date; // Last time health check ran
  lastHealthCheckResult?: 'operational' | 'degraded' | 'unknown'; // Softer than "healthy/unhealthy"
}

export type MessageHandler = (
  workspaceId: string,
  from: string,
  message: string,
  isGroup: boolean
) => Promise<void>;

/**
 * Manages multiple WhatsApp connections (one per workspace)
 * CRITICAL: Each workspace gets their own dedicated WhatsApp connection
 */
export class WhatsAppConnectionManager {
  private connections = new Map<string, ConnectionInfo>();
  private workspaceService: WorkspaceService;
  private messageHandler: MessageHandler | null = null;
  private logger = pino({ level: 'info' });

  constructor(workspaceService: WorkspaceService) {
    this.workspaceService = workspaceService;
  }

  /**
   * Set message handler (called when any connection receives a message)
   */
  setMessageHandler(handler: MessageHandler): void {
    this.messageHandler = handler;
  }

  /**
   * Parse Baileys error and return user-friendly message
   */
  private parseConnectionError(error: any): string {
    const errorMessage = error?.message || String(error || 'Unknown error');
    const statusCode = (error as Boom)?.output?.statusCode;
    const payload = (error as Boom)?.output?.payload;

    // Check for specific DisconnectReason codes
    if (statusCode === DisconnectReason.loggedOut) {
      return 'Your WhatsApp session was logged out. Please scan the QR code again to reconnect.';
    }

    if (statusCode === DisconnectReason.badSession) {
      return 'Invalid WhatsApp session. Please scan the QR code again to create a new session.';
    }

    if (statusCode === DisconnectReason.connectionClosed) {
      return 'Connection closed. Please try connecting again.';
    }

    if (statusCode === DisconnectReason.connectionLost) {
      return 'Connection lost. We will automatically try to reconnect.';
    }

    if (statusCode === DisconnectReason.timedOut) {
      return 'Connection timeout. Please check your internet connection and try again.';
    }

    // Check error messages for common issues
    const lowerMessage = errorMessage.toLowerCase();

    if (lowerMessage.includes('already linked') || lowerMessage.includes('device already') || lowerMessage.includes('phone already')) {
      return 'This phone number is already linked to another device. Please unlink it from WhatsApp Settings → Linked Devices first, then try again.';
    }

    if (lowerMessage.includes('rate limit') || lowerMessage.includes('too many') || lowerMessage.includes('429')) {
      return 'Too many connection attempts. Please wait 5 minutes and try again.';
    }

    if (lowerMessage.includes('device limit') || lowerMessage.includes('max devices') || lowerMessage.includes('4 devices')) {
      return 'You have reached the maximum number of linked devices (4). Please unlink a device from WhatsApp Settings → Linked Devices, then try again.';
    }

    if (lowerMessage.includes('timeout') || lowerMessage.includes('timed out')) {
      return 'Connection timeout. Please check your internet connection and try again.';
    }

    if (lowerMessage.includes('network') || lowerMessage.includes('connection refused')) {
      return 'Network error. Please check your internet connection and try again.';
    }

    // Return original error if no specific match
    return errorMessage;
  }

  /**
   * Create WhatsApp connection for a specific workspace
   * Returns QR code for scanning
   */
  async createConnection(workspaceId: string): Promise<string> {
    console.log(chalk.blue(`📱 Creating WhatsApp connection for workspace: ${workspaceId}`));

    // Get workspace details
    const workspace = await this.workspaceService.getWorkspaceById(workspaceId);
    if (!workspace) {
      throw new Error(`Workspace ${workspaceId} not found`);
    }

    const clientId = workspace.clientId || workspaceId;
    const phoneNumber = workspace.phoneNumbers[0] || '';

    // Check if already connected
    const existing = this.connections.get(workspaceId);
    if (existing && existing.status === 'connected') {
      throw new Error(`Workspace ${workspaceId} is already connected`);
    }

    // Create auth directory for this workspace
    const authDir = `./auth/${workspaceId}`;
    
    // Check if auth directory exists and if we should clear it
    // If previous connection failed with logged out, clear the auth state
    if (existing && existing.disconnectReason?.includes('logged out')) {
      console.log(chalk.yellow(`🧹 Clearing auth state for workspace ${workspaceId} (previous session was logged out)`));
      try {
        if (fs.existsSync(authDir)) {
          fs.rmSync(authDir, { recursive: true, force: true });
          console.log(chalk.green(`✅ Cleared auth directory: ${authDir}`));
        }
      } catch (error) {
        console.error(chalk.red(`⚠️  Failed to clear auth directory: ${error}`));
      }
    }
    
    const { state, saveCreds } = await useMultiFileAuthState(authDir);

    // Create WhatsApp socket
    const sock = makeWASocket({
      auth: state,
      logger: this.logger,
      printQRInTerminal: false,
      browser: Browsers.ubuntu('Chrome'),
      defaultQueryTimeoutMs: 60000, // 60 seconds - allow more time for sync operations and large history downloads
    });

    // Initialize connection info
    const connectionInfo: ConnectionInfo = {
      clientId,
      workspaceId,
      socket: sock,
      status: 'connecting',
      qrCode: null,
      phoneNumber,
    };

    this.connections.set(workspaceId, connectionInfo);

    // Return promise that resolves with QR code
    return new Promise((resolve, reject) => {
      // Set timeout for QR code generation (30 seconds)
      const qrTimeout = setTimeout(() => {
        if (!connectionInfo.qrCode) {
          reject(new Error('QR code generation timeout. Please try again.'));
          this.connections.delete(workspaceId);
        }
      }, 30000);

      // Save credentials when updated
      sock.ev.on('creds.update', saveCreds);

      // Handle connection updates
      sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr, isNewLogin, isOnline } = update;
        
        // Check for sync errors in the update payload
        const errorMessage = (lastDisconnect?.error as any)?.message || 
                            (lastDisconnect?.error as any)?.output?.payload?.message || '';
        const isSyncError = /sync|history|couldn't finish|failed to sync/i.test(errorMessage);

        // QR code generated
        if (qr) {
          clearTimeout(qrTimeout); // Clear timeout once QR is generated
          connectionInfo.qrCode = qr;
          connectionInfo.status = 'connecting';
          console.log(chalk.yellow(`📱 QR code generated for workspace: ${workspaceId}`));
          
          // Update workspace status in database
          await this.workspaceService.updateConnectionStatus(workspaceId, 'connecting');
          
          resolve(qr); // Resolve with QR code
        }

        // Connection opened
        if (connection === 'open') {
          clearTimeout(qrTimeout); // Clear timeout on successful connection
          connectionInfo.status = 'connected';
          connectionInfo.qrCode = null;
          connectionInfo.connectedAt = new Date();
          connectionInfo.disconnectReason = undefined; // Clear disconnect reason
          console.log(chalk.green(`✅ WhatsApp connected for workspace: ${workspaceId}`));
          console.log(chalk.blue(`📥 Syncing message history... This may take a few moments.`));
          
          // Update workspace status in database
          await this.workspaceService.updateConnectionStatus(workspaceId, 'connected');
          
          // Note: Sync happens automatically in Baileys after connection opens
          // We don't have direct control over sync, but we can track if messages start arriving
          // If sync fails, the connection will close and we'll handle it in the 'close' event
        }

        // Connection closed (can happen before QR code is generated)
        if (connection === 'close') {
          const disconnectError = lastDisconnect?.error as Boom;
          const statusCode = disconnectError?.output?.statusCode;
          const isLoggedOut = statusCode === DisconnectReason.loggedOut || statusCode === DisconnectReason.badSession;
          
          // Check for sync errors specifically
          const technicalReason = disconnectError?.output?.payload?.message || errorMessage || 'Unknown';
          const isSyncFailure = isSyncError || /sync|history|couldn't finish|failed to sync/i.test(technicalReason);
          
          // Parse error for user-friendly message
          const userFriendlyReason = isSyncFailure
            ? 'Could not finish syncing message history. Please try reconnecting.'
            : this.parseConnectionError(disconnectError);
          
          connectionInfo.status = 'disconnected';
          connectionInfo.lastDisconnectedAt = new Date();
          connectionInfo.disconnectReason = userFriendlyReason; // Store user-friendly message
          
          console.log(chalk.red(`❌ WhatsApp disconnected for workspace: ${workspaceId}`));
          console.log(chalk.red(`   Reason: ${userFriendlyReason}`));
          if (technicalReason !== userFriendlyReason) {
            console.log(chalk.gray(`   Technical: ${technicalReason}`));
          }
          
          // If logged out or bad session, clear auth state for next attempt
          if (isLoggedOut) {
            console.log(chalk.yellow(`🧹 Clearing auth state for workspace ${workspaceId} (logged out or bad session)`));
            try {
              if (fs.existsSync(authDir)) {
                fs.rmSync(authDir, { recursive: true, force: true });
                console.log(chalk.green(`✅ Cleared auth directory: ${authDir}`));
              }
            } catch (error) {
              console.error(chalk.red(`⚠️  Failed to clear auth directory: ${error}`));
            }
          }
          
          // Update workspace status in database
          await this.workspaceService.updateConnectionStatus(workspaceId, 'disconnected', userFriendlyReason);

          // If connection closed before QR code was generated, reject the promise
          if (!connectionInfo.qrCode) {
            clearTimeout(qrTimeout);
            const errorMessage = isLoggedOut 
              ? 'Session was logged out. Please try connecting again to generate a new QR code.'
              : `Connection failed: ${userFriendlyReason}. Please try again.`;
            reject(new Error(errorMessage));
            this.connections.delete(workspaceId);
            return;
          }

          // If connection was established and then closed, handle reconnection
          const shouldReconnect = !isLoggedOut;
          if (shouldReconnect) {
            console.log(chalk.yellow(`🔄 Reconnecting workspace: ${workspaceId}...`));
            connectionInfo.status = 'reconnecting';
            
            // Update workspace status to reconnecting
            await this.workspaceService.updateConnectionStatus(workspaceId, 'reconnecting');
            
            // Reconnect after delay (longer delay for sync failures to avoid rapid retries)
            const reconnectDelay = isSyncFailure ? 10000 : 5000; // 10s for sync failures, 5s for other issues
            setTimeout(async () => {
              try {
                console.log(chalk.blue(`🔄 Attempting reconnection for workspace: ${workspaceId}...`));
                await this.createConnection(workspaceId);
              } catch (error) {
                const friendlyError = this.parseConnectionError(error);
                console.error(chalk.red(`❌ Failed to reconnect workspace ${workspaceId}: ${friendlyError}`));
                // Update status to disconnected on reconnect failure
                await this.workspaceService.updateConnectionStatus(workspaceId, 'disconnected', friendlyError);
              }
            }, reconnectDelay);
          } else {
            // Logged out - remove connection
            this.connections.delete(workspaceId);
          }
        }
      });

      // Handle connection errors via connection.update event (errors are included there)
      // Baileys doesn't have a separate 'error' event, errors come through connection.update
      // All errors (including sync failures) are handled in the connection.update handler above

      // Handle incoming messages
      sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message) return;

        const from = msg.key.remoteJid || '';
        const isGroup = from.endsWith('@g.us');
        const messageText = msg.message.conversation || 
                           msg.message.extendedTextMessage?.text || '';

        if (!messageText) return;

        // Track inbound message (indicates sync is working)
        if (!connectionInfo.lastInboundMessage) {
          // First message after connection - sync likely completed
          console.log(chalk.green(`✅ Sync completed for workspace: ${workspaceId} (first message received)`));
        }
        connectionInfo.lastInboundMessage = new Date();

        // Call message handler
        if (this.messageHandler) {
          try {
            await this.messageHandler(workspaceId, from, messageText, isGroup);
          } catch (error) {
            console.error(chalk.red(`❌ Error handling message for workspace ${workspaceId}:`), error);
          }
        }
      });

      // Reject if QR not generated within 30 seconds
      setTimeout(() => {
        if (!connectionInfo.qrCode) {
          reject(new Error('QR code generation timeout. Please try again.'));
        }
      }, 30000);
    });
  }

  /**
   * Get QR code for a workspace (if connecting)
   */
  getQRCode(workspaceId: string): string | null {
    const connection = this.connections.get(workspaceId);
    return connection?.qrCode || null;
  }

  /**
   * Get connection status for a workspace
   */
  getConnectionStatus(workspaceId: string): ConnectionInfo | null {
    return this.connections.get(workspaceId) || null;
  }

  /**
   * Get all active connections
   */
  getAllConnections(): ConnectionInfo[] {
    return Array.from(this.connections.values());
  }

  /**
   * Send message using workspace's connection
   */
  async sendMessage(workspaceId: string, to: string, message: string): Promise<void> {
    const connection = this.connections.get(workspaceId);
    
    if (!connection) {
      throw new Error(`Workspace ${workspaceId} has no connection`);
    }

    if (connection.status !== 'connected') {
      throw new Error(`Workspace ${workspaceId} is not connected (status: ${connection.status})`);
    }

    try {
      await connection.socket.sendMessage(to, { text: message });
      // Track successful outbound message
      connection.lastSuccessfulOutbound = new Date();
      console.log(chalk.green(`✅ Message sent via workspace ${workspaceId} to ${extractPhoneFromJid(to)}`));
    } catch (error) {
      const friendlyError = this.parseConnectionError(error);
      console.error(chalk.red(`❌ Failed to send message via workspace ${workspaceId}: ${friendlyError}`));
      throw new Error(friendlyError);
    }
  }

  /**
   * Health check: Verify connection can actually send messages
   * Sends a test message to the workspace's own number (won't be delivered, but tests connection)
   * Returns operational status with metadata for expectation management
   */
  async healthCheck(workspaceId: string): Promise<{ 
    operational: boolean; 
    status: 'operational' | 'degraded' | 'unknown';
    error?: string;
    lastSuccessfulOutbound?: Date;
    lastInboundMessage?: Date;
    lastChecked: Date;
  }> {
    const connection = this.connections.get(workspaceId);
    const now = new Date();
    
    if (!connection) {
      return { 
        operational: false, 
        status: 'unknown',
        error: 'No connection found',
        lastChecked: now,
      };
    }

    if (connection.status !== 'connected') {
      return { 
        operational: false, 
        status: 'unknown',
        error: `Connection status: ${connection.status}`,
        lastChecked: now,
      };
    }

    try {
      // Try to send a test message to the workspace's own number
      // This won't actually deliver (can't message yourself), but tests if the socket can send
      const testJid = `${connection.phoneNumber.replace(/[^0-9]/g, '')}@s.whatsapp.net`;
      
      // Use a very short timeout for health check (2 seconds)
      const sendPromise = connection.socket.sendMessage(testJid, { text: 'HEALTH_CHECK' });
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Health check timeout')), 2000)
      );
      
      await Promise.race([sendPromise, timeoutPromise]);
      
      // If we get here, the send succeeded (even though message won't deliver)
      // Update connection metadata
      connection.lastHealthCheck = now;
      const previousStatus = connection.lastHealthCheckResult;
      connection.lastHealthCheckResult = 'operational';
      
      // Log status transitions for observability (first 100 real failures)
      if (previousStatus && previousStatus !== 'operational') {
        console.log(chalk.cyan(`📊 [OBSERVABILITY] Workspace ${workspaceId}: ${previousStatus} → operational`));
      }
      
      return { 
        operational: true,
        status: 'operational',
        lastSuccessfulOutbound: connection.lastSuccessfulOutbound,
        lastInboundMessage: connection.lastInboundMessage,
        lastChecked: now,
      };
    } catch (error: any) {
      const friendlyError = this.parseConnectionError(error);
      const errorCode = (error as Boom)?.output?.statusCode || 'unknown';
      
      // Update connection metadata
      connection.lastHealthCheck = now;
      const previousStatus = connection.lastHealthCheckResult;
      connection.lastHealthCheckResult = 'degraded';
      
      // Check if we've had recent activity - if so, mark as degraded (not completely broken)
      const hasRecentActivity = connection.lastSuccessfulOutbound && 
        (now.getTime() - connection.lastSuccessfulOutbound.getTime()) < 300000; // 5 minutes
      
      const newStatus = hasRecentActivity ? 'degraded' : 'unknown';
      
      // Log status transitions and error codes for observability (first 100 real failures)
      if (previousStatus && previousStatus !== newStatus) {
        console.log(chalk.yellow(`📊 [OBSERVABILITY] Workspace ${workspaceId}: ${previousStatus} → ${newStatus} (error: ${errorCode})`));
      }
      
      // Log "connected but no activity" scenario
      const timeSinceLastActivity = connection.lastSuccessfulOutbound 
        ? Math.floor((now.getTime() - connection.lastSuccessfulOutbound.getTime()) / 1000 / 60) // minutes
        : null;
      
      if (timeSinceLastActivity && timeSinceLastActivity > 10) {
        console.log(chalk.yellow(`📊 [OBSERVABILITY] Workspace ${workspaceId}: Connected but no activity for ${timeSinceLastActivity} minutes`));
      }
      
      return { 
        operational: false,
        status: newStatus,
        error: friendlyError,
        lastSuccessfulOutbound: connection.lastSuccessfulOutbound,
        lastInboundMessage: connection.lastInboundMessage,
        lastChecked: now,
      };
    }
  }

  /**
   * Disconnect workspace's WhatsApp connection
   */
  async disconnectWorkspace(workspaceId: string): Promise<void> {
    const connection = this.connections.get(workspaceId);
    
    if (!connection) {
      throw new Error(`Workspace ${workspaceId} has no connection`);
    }

    console.log(chalk.yellow(`🔌 Disconnecting workspace: ${workspaceId}`));
    
    try {
      await connection.socket.logout();
      this.connections.delete(workspaceId);
      
      // Update workspace status in database
      await this.workspaceService.updateConnectionStatus(workspaceId, 'disconnected', 'Manual disconnect');
      
      console.log(chalk.green(`✅ Workspace ${workspaceId} disconnected`));
    } catch (error) {
      console.error(chalk.red(`❌ Error disconnecting workspace ${workspaceId}:`), error);
      throw error;
    }
  }

  /**
   * Reconnect all active workspaces on startup
   * CRITICAL: Call this when bot starts to restore all connections
   */
  async reconnectAllWorkspaces(): Promise<void> {
    console.log(chalk.blue('🔄 Reconnecting all active workspaces...'));
    
    // Get all active workspaces (trial or active subscription)
    const activeWorkspaces = await this.workspaceService.getActiveWorkspaces();
    
    console.log(chalk.cyan(`📊 Found ${activeWorkspaces.length} active workspace(s)`));
    
    for (const workspace of activeWorkspaces) {
      try {
        // Only reconnect if they've connected before
        // (Check if auth directory exists)
        const fs = await import('fs');
        const authDir = `./auth/${workspace.workspaceId}`;
        
        if (fs.existsSync(authDir)) {
          console.log(chalk.yellow(`🔄 Reconnecting workspace: ${workspace.businessName}`));
          await this.createConnection(workspace.workspaceId);
        } else {
          console.log(chalk.gray(`⏭️  Skipping ${workspace.businessName} (never connected)`));
        }
      } catch (error) {
        console.error(chalk.red(`❌ Failed to reconnect ${workspace.businessName}:`), error);
      }
    }
    
    console.log(chalk.green(`✅ Reconnection complete. ${this.connections.size} workspace(s) connected.`));
  }

  /**
   * Get total number of active connections
   */
  getActiveConnectionCount(): number {
    return Array.from(this.connections.values())
      .filter(c => c.status === 'connected')
      .length;
  }

  /**
   * Print connection stats
   */
  printStats(): void {
    const total = this.connections.size;
    const connected = Array.from(this.connections.values()).filter(c => c.status === 'connected').length;
    const connecting = Array.from(this.connections.values()).filter(c => c.status === 'connecting').length;
    const disconnected = Array.from(this.connections.values()).filter(c => c.status === 'disconnected').length;
    
    console.log(chalk.cyan('\n📊 WhatsApp Connection Stats:'));
    console.log(chalk.gray(`   Total: ${total}`));
    console.log(chalk.green(`   Connected: ${connected}`));
    console.log(chalk.yellow(`   Connecting: ${connecting}`));
    console.log(chalk.red(`   Disconnected: ${disconnected}\n`));
  }
}

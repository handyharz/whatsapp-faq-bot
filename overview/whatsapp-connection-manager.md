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
}

export type MessageHandler = (
  workspaceId: string,
  from: string,
  message: string,
  isGroup: boolean
) => Promise<void>;

/**
 * Manages multiple WhatsApp connections (one per client/workspace)
 * CRITICAL: Each client gets their own dedicated WhatsApp connection
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
    const { state, saveCreds } = await useMultiFileAuthState(authDir);

    // Create WhatsApp socket
    const sock = makeWASocket({
      auth: state,
      logger: this.logger,
      printQRInTerminal: false,
      browser: Browsers.ubuntu('Chrome'),
      defaultQueryTimeoutMs: undefined,
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
      // Save credentials when updated
      sock.ev.on('creds.update', saveCreds);

      // Handle connection updates
      sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        // QR code generated
        if (qr) {
          connectionInfo.qrCode = qr;
          connectionInfo.status = 'connecting';
          console.log(chalk.yellow(`📱 QR code generated for workspace: ${workspaceId}`));
          
          // Update workspace status in database
          await this.workspaceService.updateConnectionStatus(workspaceId, 'connecting');
          
          resolve(qr); // Resolve with QR code
        }

        // Connection opened
        if (connection === 'open') {
          connectionInfo.status = 'connected';
          connectionInfo.qrCode = null;
          connectionInfo.connectedAt = new Date();
          console.log(chalk.green(`✅ WhatsApp connected for workspace: ${workspaceId}`));
          
          // Update workspace status in database
          await this.workspaceService.updateConnectionStatus(workspaceId, 'connected');
        }

        // Connection closed
        if (connection === 'close') {
          const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
          const reason = (lastDisconnect?.error as Boom)?.output?.payload?.message || 'Unknown';
          
          connectionInfo.status = 'disconnected';
          connectionInfo.lastDisconnectedAt = new Date();
          connectionInfo.disconnectReason = reason;
          
          console.log(chalk.red(`❌ WhatsApp disconnected for workspace: ${workspaceId} (${reason})`));
          
          // Update workspace status in database
          await this.workspaceService.updateConnectionStatus(workspaceId, 'disconnected', reason);

          if (shouldReconnect) {
            console.log(chalk.yellow(`🔄 Reconnecting workspace: ${workspaceId}...`));
            connectionInfo.status = 'reconnecting';
            
            // Reconnect after delay
            setTimeout(async () => {
              try {
                await this.createConnection(workspaceId);
              } catch (error) {
                console.error(chalk.red(`❌ Failed to reconnect workspace ${workspaceId}:`), error);
              }
            }, 5000);
          } else {
            // Logged out - remove connection
            this.connections.delete(workspaceId);
          }
        }
      });

      // Handle incoming messages
      sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message) return;

        const from = msg.key.remoteJid || '';
        const isGroup = from.endsWith('@g.us');
        const messageText = msg.message.conversation || 
                           msg.message.extendedTextMessage?.text || '';

        if (!messageText) return;

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
          reject(new Error('QR code generation timeout'));
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
      console.log(chalk.green(`✅ Message sent via workspace ${workspaceId} to ${extractPhoneFromJid(to)}`));
    } catch (error) {
      console.error(chalk.red(`❌ Failed to send message via workspace ${workspaceId}:`), error);
      throw error;
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
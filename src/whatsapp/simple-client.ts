import makeWASocket, {
  ConnectionState as BaileysConnectionState,
  DisconnectReason,
  useMultiFileAuthState,
  WASocket,
  proto,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import qrcode from 'qrcode-terminal';
import * as path from 'path';
import * as fs from 'fs';
import { config } from '../config.js';

export interface MessageData {
  from: string;
  message: string;
  msg: proto.IWebMessageInfo;
  isGroup: boolean;
}

export type BotConnectionState = 'connecting' | 'open' | 'close';

export interface ConnectionStatusCallback {
  (state: BotConnectionState, reason?: string): void | Promise<void>;
}

export class SimpleWhatsAppClient {
  private socket: WASocket | null = null;
  private authDir: string;
  private messageHandlers: Array<(data: MessageData) => void> = [];
  private connectionCallbacks: Array<ConnectionStatusCallback> = [];
  private qrCount: number = 0; // Track QR code generation count
  private qrTimer: NodeJS.Timeout | null = null; // Timer for QR expiration warning
  private currentQR: string | null = null; // Store current QR code for API access

  constructor(authDir?: string) {
    this.authDir = authDir || config.authDir;
  }

  /**
   * Register a callback for connection status changes
   */
  onConnectionStatusChange(callback: ConnectionStatusCallback): void {
    this.connectionCallbacks.push(callback);
  }

  /**
   * Clear auth session (delete auth files)
   */
  private async clearAuthSession(): Promise<void> {
    try {
      if (fs.existsSync(this.authDir)) {
        const files = fs.readdirSync(this.authDir);
        for (const file of files) {
          fs.unlinkSync(path.join(this.authDir, file));
        }
        console.log('🗑️  Cleared invalid auth session');
      }
    } catch (error) {
      console.error('Error clearing auth session:', error);
    }
  }

  async connect(): Promise<void> {
    const { state, saveCreds } = await useMultiFileAuthState(this.authDir);

    this.socket = makeWASocket({
      auth: state,
      logger: pino({ level: 'silent' }),
      printQRInTerminal: false, // We'll handle QR display ourselves
    });

    // Save credentials when updated
    this.socket.ev.on('creds.update', saveCreds);

    // Handle connection updates
    this.socket.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      // Log connection state for debugging
      if (connection) {
        console.log(`🔌 Connection state: ${connection}`);
      }

      if (qr) {
        this.qrCount++;
        this.currentQR = qr; // Store QR code for API access
        
        // Clear any existing expiration timer
        if (this.qrTimer) {
          clearTimeout(this.qrTimer);
          this.qrTimer = null;
        }

        if (this.qrCount === 1) {
          console.log('\n📱 Scan this QR code with WhatsApp:');
          console.log('(Open WhatsApp > Linked Devices > Link a Device)\n');
          console.log('⏱️  You have ~20-30 seconds to scan. Don\'t worry if you miss it -');
          console.log('   a new QR code will appear automatically!\n');
        } else {
          console.log(`\n🔄 QR code expired. New QR code #${this.qrCount}:`);
          console.log('(QR codes expire every ~20-30 seconds, but new ones appear automatically)\n');
        }
        
        qrcode.generate(qr, { small: true });
        console.log('\n');
        console.log('💡 Tip: If the QR code looks fragmented, copy all the lines above');
        console.log('   and paste them into a text editor to see the full QR code.\n');
        
        // Set timer to warn about expiration (15 seconds - gives 5-15 seconds buffer)
        this.qrTimer = setTimeout(() => {
          console.log('⏰ QR code expiring soon (~5-15 seconds left).');
          console.log('   If you miss it, a new one will appear automatically - no need to restart!\n');
        }, 15000);
        
        console.log('Waiting for connection...\n');
      }

      if (connection === 'close') {
        const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
        const isLoggedOut = statusCode === DisconnectReason.loggedOut;
        const shouldReconnect = !isLoggedOut;
        const disconnectReason = (lastDisconnect?.error as Boom)?.output?.payload?.message || 
                                 (lastDisconnect?.error as Boom)?.message || 
                                 `Status code: ${statusCode}`;

        // Notify connection callbacks
        for (const callback of this.connectionCallbacks) {
          try {
            await callback('close', disconnectReason);
          } catch (error) {
            console.error('Error in connection callback:', error);
          }
        }

        if (isLoggedOut) {
          console.log('⚠️  Session logged out. Clearing auth and reconnecting...');
          // Clear the invalid session
          await this.clearAuthSession();
          // Close current socket
          if (this.socket) {
            await this.socket.end(undefined);
            this.socket = null;
          }
          // Reconnect with fresh session (will generate QR code)
          // Reduced delay: 1 second is enough for cleanup, faster QR code generation
          console.log('🔄 Reconnecting with fresh session...');
          console.log('⏳ QR code will appear in ~2-3 seconds...\n');
          setTimeout(() => this.connect(), 1000);
        } else {
          console.log(
            `Connection closed. ${shouldReconnect ? 'Reconnecting...' : 'Stopped.'}`
          );
          if (shouldReconnect) {
            setTimeout(() => this.connect(), 3000);
          }
        }
      } else if (connection === 'open') {
        // Clear QR timer on successful connection
        if (this.qrTimer) {
          clearTimeout(this.qrTimer);
          this.qrTimer = null;
        }
        this.qrCount = 0; // Reset QR count
        this.currentQR = null; // Clear QR code on successful connection
        console.log('✅ Connected to WhatsApp!');
        
        // Notify connection callbacks
        for (const callback of this.connectionCallbacks) {
          try {
            await callback('open');
          } catch (error) {
            console.error('Error in connection callback:', error);
          }
        }
      } else if (connection === 'connecting') {
        console.log('🔄 Connecting to WhatsApp...');
        
        // Notify connection callbacks
        for (const callback of this.connectionCallbacks) {
          try {
            await callback('connecting');
          } catch (error) {
            console.error('Error in connection callback:', error);
          }
        }
      }
    });

    // Handle incoming messages
    this.socket.ev.on('messages.upsert', async (m) => {
      const messages = m.messages;
      for (const msg of messages) {
        // Skip messages from ourselves
        if (msg.key.fromMe) {
          continue;
        }

        // Extract message text
        let messageText = '';
        if (msg.message?.conversation) {
          messageText = msg.message.conversation;
        } else if (msg.message?.extendedTextMessage?.text) {
          messageText = msg.message.extendedTextMessage.text;
        }

        // Skip if no text
        if (!messageText) {
          continue;
        }

        const from = msg.key.remoteJid || '';
        const isGroup = from.includes('@g.us');

        // Emit to handlers
        const messageData: MessageData = {
          from,
          message: messageText,
          msg,
          isGroup,
        };

        for (const handler of this.messageHandlers) {
          try {
            await handler(messageData);
          } catch (error) {
            console.error('Error in message handler:', error);
          }
        }
      }
    });
  }

  async sendMessage(to: string, text: string): Promise<void> {
    if (!this.socket) {
      throw new Error('Not connected to WhatsApp');
    }

    try {
      await this.socket.sendMessage(to, { text });
    } catch (error) {
      console.error(`Failed to send message to ${to}:`, error);
      throw error;
    }
  }

  onMessage(callback: (data: MessageData) => void | Promise<void>): void {
    this.messageHandlers.push(callback);
  }

  isConnected(): boolean {
    return this.socket !== null;
  }

  async disconnect(): Promise<void> {
    // Clear QR timer
    if (this.qrTimer) {
      clearTimeout(this.qrTimer);
      this.qrTimer = null;
    }
    this.qrCount = 0; // Reset QR count
    this.currentQR = null; // Clear QR code
    
    if (this.socket) {
      await this.socket.end(undefined);
      this.socket = null;
    }
  }

  /**
   * Get current QR code (for API access)
   */
  getCurrentQR(): string | null {
    return this.currentQR;
  }
}

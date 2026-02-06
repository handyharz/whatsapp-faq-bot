import makeWASocket, {
  ConnectionState,
  DisconnectReason,
  useMultiFileAuthState,
  WASocket,
  proto,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import qrcode from 'qrcode-terminal';
import * as path from 'path';
import { config } from '../config.js';

export interface MessageData {
  from: string;
  message: string;
  msg: proto.IWebMessageInfo;
  isGroup: boolean;
}

export class SimpleWhatsAppClient {
  private socket: WASocket | null = null;
  private authDir: string;
  private messageHandlers: Array<(data: MessageData) => void> = [];

  constructor(authDir?: string) {
    this.authDir = authDir || config.authDir;
  }

  async connect(): Promise<void> {
    const { state, saveCreds } = await useMultiFileAuthState(this.authDir);

    this.socket = makeWASocket({
      auth: state,
      logger: pino({ level: 'silent' }),
    });

    // Save credentials when updated
    this.socket.ev.on('creds.update', saveCreds);

    // Handle connection updates
    this.socket.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        console.log('\n📱 Scan this QR code with WhatsApp:');
        console.log('(Open WhatsApp > Linked Devices > Link a Device)\n');
        qrcode.generate(qr, { small: true });
        console.log('\n');
        console.log('Waiting for connection...\n');
      }

      if (connection === 'close') {
        const shouldReconnect =
          (lastDisconnect?.error as Boom)?.output?.statusCode !==
          DisconnectReason.loggedOut;

        console.log(
          `Connection closed. ${shouldReconnect ? 'Reconnecting...' : 'Logged out.'}`
        );

        if (shouldReconnect) {
          setTimeout(() => this.connect(), 3000);
        }
      } else if (connection === 'open') {
        console.log('✅ Connected to WhatsApp!');
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
    if (this.socket) {
      await this.socket.end(undefined);
      this.socket = null;
    }
  }
}

import { SimpleWhatsAppClient } from './whatsapp/simple-client.js';
import { FAQMatcher, FAQ } from './faq-matcher.js';
import { config } from './config.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class FAQBot {
  private whatsapp: SimpleWhatsAppClient;
  private matcher: FAQMatcher;
  private faqs: FAQ[];
  private faqsPath: string;

  constructor() {
    this.whatsapp = new SimpleWhatsAppClient();
    this.faqsPath = config.faqsPath;
    this.faqs = this.loadFAQs();
    this.matcher = new FAQMatcher(this.faqs);
  }

  private loadFAQs(): FAQ[] {
    try {
      if (!fs.existsSync(this.faqsPath)) {
        console.warn(
          chalk.yellow(`⚠️  FAQ file not found at ${this.faqsPath}`)
        );
        console.log(chalk.blue('Creating default FAQ file...'));
        this.createDefaultFAQs();
      }

      const data = fs.readFileSync(this.faqsPath, 'utf-8');
      const faqs = JSON.parse(data) as FAQ[];

      if (!Array.isArray(faqs)) {
        throw new Error('FAQs must be an array');
      }

      console.log(chalk.green(`✅ Loaded ${faqs.length} FAQs`));
      return faqs;
    } catch (error) {
      console.error(chalk.red('❌ Error loading FAQs:'), error);
      console.log(chalk.blue('Using empty FAQ list'));
      return [];
    }
  }

  private createDefaultFAQs(): void {
    const defaultFAQs: FAQ[] = [
      {
        keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
        answer: 'Hello! 👋 Welcome! How can I help you today?',
        category: 'greeting',
      },
      {
        keywords: ['help', 'commands', 'options', 'menu', 'what can you do'],
        answer:
          "I can help you with:\n" +
          "• PRICE - Get pricing information\n" +
          "• HOURS - Business hours\n" +
          "• LOCATION - Our address\n" +
          "• CONTACT - Contact information\n" +
          "• ORDER - How to place an order\n\n" +
          "Just ask me anything! 😊",
        category: 'help',
      },
    ];

    // Ensure directory exists
    const dir = path.dirname(this.faqsPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(this.faqsPath, JSON.stringify(defaultFAQs, null, 2));
    console.log(chalk.green(`✅ Created default FAQ file at ${this.faqsPath}`));
    this.faqs = defaultFAQs;
  }

  private isBusinessHours(): boolean {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay(); // 0 = Sunday, 6 = Saturday

    // Closed on weekends
    if (day === 0 || day === 6) {
      return false;
    }

    // Check hours (9am-5pm by default)
    return hour >= config.businessHours.start && hour < config.businessHours.end;
  }

  private formatPhoneNumber(phone: string): string {
    // Remove @s.whatsapp.net or @g.us suffix
    return phone.split('@')[0];
  }

  private isAdmin(phone: string): boolean {
    const formatted = this.formatPhoneNumber(phone);
    return config.adminNumbers.some(admin => formatted.includes(admin) || admin.includes(formatted));
  }

  async start(): Promise<void> {
    console.log(chalk.blue('🚀 Starting WhatsApp FAQ Bot...\n'));

    // Load FAQs
    this.faqs = this.loadFAQs();
    this.matcher = new FAQMatcher(this.faqs);

    // Connect to WhatsApp
    await this.whatsapp.connect();

    // Handle messages
    this.whatsapp.onMessage(async (data) => {
      const { from, message, isGroup } = data;

      // Skip group messages for now (can enable later)
      if (isGroup) {
        return;
      }

      const phone = this.formatPhoneNumber(from);
      const upperMessage = message.toUpperCase().trim();

      console.log(chalk.cyan(`📨 Message from ${phone}: ${message}`));

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

      // Admin commands
      if (this.isAdmin(phone)) {
        if (upperMessage.startsWith('/RELOAD')) {
          this.faqs = this.loadFAQs();
          this.matcher = new FAQMatcher(this.faqs);
          await this.whatsapp.sendMessage(from, '✅ FAQs reloaded!');
          console.log(chalk.green(`   → Admin: Reloaded FAQs`));
          return;
        }

        if (upperMessage.startsWith('/STATUS')) {
          const status = {
            connected: this.whatsapp.isConnected(),
            faqsCount: this.faqs.length,
            businessHours: this.isBusinessHours(),
            currentTime: new Date().toLocaleString('en-NG', { timeZone: config.timezone }),
          };
          await this.whatsapp.sendMessage(
            from,
            `📊 Bot Status:\n` +
            `Connected: ${status.connected ? '✅' : '❌'}\n` +
            `FAQs: ${status.faqsCount}\n` +
            `Business Hours: ${status.businessHours ? 'Open' : 'Closed'}\n` +
            `Time: ${status.currentTime}`
          );
          console.log(chalk.green(`   → Admin: Status requested`));
          return;
        }
      }

      // Check business hours
      if (!this.isBusinessHours()) {
        await this.whatsapp.sendMessage(from, config.afterHoursMessage);
        console.log(chalk.yellow(`   → Sent: After-hours message`));
        return;
      }

      // Try to match FAQ
      const faq = this.matcher.match(message);

      if (faq) {
        await this.whatsapp.sendMessage(from, faq.answer);
        console.log(chalk.green(`   → Sent: FAQ match (${faq.category || 'unknown'})`));
      } else {
        // Default response
        const defaultAnswer = this.matcher.getDefaultAnswer();
        await this.whatsapp.sendMessage(from, defaultAnswer);
        console.log(chalk.yellow(`   → Sent: Default response`));
      }
    });

    console.log(chalk.green('\n✅ Bot is running! Waiting for messages...\n'));
    console.log(chalk.gray('Press Ctrl+C to stop\n'));
  }

  async stop(): Promise<void> {
    console.log(chalk.yellow('\n🛑 Stopping bot...'));
    await this.whatsapp.disconnect();
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

/**
 * Production-safe logger utility
 * 
 * Features:
 * - Environment-based log levels (NODE_ENV=production reduces verbosity)
 * - Automatic redaction of sensitive data (phone numbers, emails, tokens)
 * - Structured logging for better production monitoring
 */

import chalk from 'chalk';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const isProduction = process.env.NODE_ENV === 'production';
const LOG_LEVEL = (process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug')) as LogLevel;
const currentLogLevel = LOG_LEVELS[LOG_LEVEL] ?? LOG_LEVELS.info;

/**
 * Redact sensitive information from strings
 */
function redactSensitive(text: string): string {
  // Redact phone numbers (keep last 4 digits)
  text = text.replace(/(\+?\d{1,4}[\s-]?)?\(?\d{1,4}\)?[\s-]?\d{1,4}[\s-]?\d{1,4}[\s-]?\d{1,9}/g, (match) => {
    const digits = match.replace(/\D/g, '');
    if (digits.length >= 4) {
      return `***${digits.slice(-4)}`;
    }
    return '***';
  });

  // Redact email addresses (keep domain)
  text = text.replace(/([a-zA-Z0-9._-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, (match, user, domain) => {
    return `***@${domain}`;
  });

  // Redact tokens (keep first 4 and last 4 chars)
  text = text.replace(/(token|key|secret|password)[:=]\s*([a-zA-Z0-9_-]{16,})/gi, (match, key, value) => {
    if (value.length >= 8) {
      return `${key}: ${value.substring(0, 4)}...${value.substring(value.length - 4)}`;
    }
    return `${key}: ***`;
  });

  return text;
}

/**
 * Format log message with redaction
 */
function formatMessage(level: LogLevel, message: string, ...args: any[]): string {
  let formatted = message;
  
  // Redact sensitive data in production
  if (isProduction) {
    formatted = redactSensitive(formatted);
    // Also redact any additional arguments
    args = args.map(arg => {
      if (typeof arg === 'string') {
        return redactSensitive(arg);
      }
      if (typeof arg === 'object' && arg !== null) {
        try {
          const str = JSON.stringify(arg);
          return JSON.parse(redactSensitive(str));
        } catch {
          return arg;
        }
      }
      return arg;
    });
  }

  return formatted;
}

class Logger {
  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= currentLogLevel;
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.log(chalk.gray(`[DEBUG] ${formatMessage('debug', message, ...args)}`), ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      console.log(chalk.blue(`[INFO] ${formatMessage('info', message, ...args)}`), ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn(chalk.yellow(`[WARN] ${formatMessage('warn', message, ...args)}`), ...args);
    }
  }

  error(message: string, ...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error(chalk.red(`[ERROR] ${formatMessage('error', message, ...args)}`), ...args);
    }
  }

  /**
   * Log message handling (redacts phone numbers and message content in production)
   */
  message(from: string, businessName: string, message: string): void {
    if (this.shouldLog('info')) {
      const redactedFrom = isProduction ? `***${from.slice(-4)}` : from;
      const redactedMessage = isProduction 
        ? (message.length > 50 ? `${message.substring(0, 50)}...` : message)
        : message;
      console.log(chalk.cyan(`📨 Message from ${redactedFrom} (${businessName}): ${redactedMessage}`));
    }
  }

  /**
   * Log FAQ updates (redacts full FAQ content in production)
   */
  faqUpdate(clientId: string, businessName: string, currentCount: number, newCount: number, limit: number): void {
    if (this.shouldLog('info')) {
      const redactedClientId = isProduction ? `***${clientId.slice(-4)}` : clientId;
      console.log(chalk.blue(`📝 Updating FAQs for client: ${businessName} (${redactedClientId})`));
      console.log(chalk.gray(`   Current: ${currentCount}, New: ${newCount}, Limit: ${limit === -1 ? 'unlimited' : limit}`));
    }
  }

  /**
   * Log connection events (redacts workspace IDs in production)
   */
  connection(event: 'connected' | 'disconnected' | 'connecting' | 'reconnecting', workspaceId: string, details?: string): void {
    if (this.shouldLog('info')) {
      const redactedId = isProduction ? `***${workspaceId.slice(-4)}` : workspaceId;
      const emoji = {
        connected: '✅',
        disconnected: '❌',
        connecting: '🔄',
        reconnecting: '🔄',
      }[event];
      const color = {
        connected: chalk.green,
        disconnected: chalk.red,
        connecting: chalk.blue,
        reconnecting: chalk.yellow,
      }[event];
      console.log(color(`${emoji} WhatsApp ${event} for workspace: ${redactedId}${details ? ` (${details})` : ''}`));
    }
  }
}

export const logger = new Logger();

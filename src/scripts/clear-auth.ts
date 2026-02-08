/**
 * Clear WhatsApp Auth Session
 * 
 * This script clears the WhatsApp auth session, forcing a fresh QR code
 * on the next connection attempt.
 * 
 * Usage: tsx src/scripts/clear-auth.ts
 */

import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const authDir = process.env.AUTH_DIR || path.join(__dirname, '../../auth');

async function clearAuth(): Promise<void> {
  console.log(chalk.blue('🗑️  Clearing WhatsApp auth session...\n'));

  try {
    if (!fs.existsSync(authDir)) {
      console.log(chalk.yellow(`⚠️  Auth directory doesn't exist: ${authDir}`));
      console.log(chalk.gray('   (This is OK if you haven\'t connected before)\n'));
      return;
    }

    const files = fs.readdirSync(authDir);
    
    if (files.length === 0) {
      console.log(chalk.yellow('⚠️  Auth directory is already empty\n'));
      return;
    }

    console.log(chalk.cyan(`📁 Found ${files.length} auth file(s) in ${authDir}\n`));

    for (const file of files) {
      const filePath = path.join(authDir, file);
      fs.unlinkSync(filePath);
      console.log(chalk.gray(`   Deleted: ${file}`));
    }

    console.log(chalk.green('\n✅ Auth session cleared successfully!'));
    console.log(chalk.cyan('\n💡 Next steps:'));
    console.log(chalk.gray('   1. Restart the bot: npm run dev'));
    console.log(chalk.gray('   2. A new QR code will be generated'));
    console.log(chalk.gray('   3. Scan it with WhatsApp to connect\n'));

  } catch (error) {
    console.error(chalk.red('❌ Error clearing auth session:'), error);
    process.exit(1);
  }
}

clearAuth();

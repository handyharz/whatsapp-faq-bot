#!/usr/bin/env node
/**
 * Clear auth session for a specific workspace
 * Usage: tsx src/scripts/clear-workspace-auth.ts <workspaceId>
 */

import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';

const workspaceId = process.argv[2];

if (!workspaceId) {
  console.error(chalk.red('❌ Error: Workspace ID is required'));
  console.log(chalk.yellow('Usage: tsx src/scripts/clear-workspace-auth.ts <workspaceId>'));
  process.exit(1);
}

const authDir = path.join(process.cwd(), 'auth', workspaceId);

if (!fs.existsSync(authDir)) {
  console.log(chalk.yellow(`⚠️  Auth directory doesn't exist: ${authDir}`));
  console.log(chalk.blue('   This workspace may not have connected yet.'));
  process.exit(0);
}

try {
  console.log(chalk.blue(`🧹 Clearing auth session for workspace: ${workspaceId}`));
  console.log(chalk.gray(`   Directory: ${authDir}\n`));

  const files = fs.readdirSync(authDir);
  console.log(chalk.cyan(`📁 Found ${files.length} auth file(s)\n`));

  for (const file of files) {
    const filePath = path.join(authDir, file);
    fs.unlinkSync(filePath);
    console.log(chalk.green(`   ✅ Deleted: ${file}`));
  }

  fs.rmdirSync(authDir);
  console.log(chalk.green(`\n✅ Cleared auth directory: ${authDir}`));
  console.log(chalk.blue('\n💡 Next steps:'));
  console.log(chalk.blue('   1. Restart the server'));
  console.log(chalk.blue('   2. Go to your dashboard and click "Connect WhatsApp"'));
  console.log(chalk.blue('   3. Scan the new QR code'));
} catch (error) {
  console.error(chalk.red(`❌ Error clearing auth directory: ${error}`));
  process.exit(1);
}

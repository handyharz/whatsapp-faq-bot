import { startAPIServer } from './api/server.js';
import chalk from 'chalk';

// Start API server if run directly
if (import.meta.url === `file://${process.argv[1]}` || require.main === module) {
  startAPIServer().catch((error) => {
    console.error(chalk.red('❌ API Server failed to start:'), error);
    process.exit(1);
  });
}

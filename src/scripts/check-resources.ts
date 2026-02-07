import { connectToMongoDB, disconnectFromMongoDB } from '../db/mongodb.js';
import { CacheService } from '../services/cache-service.js';
import { MonitoringService } from '../services/monitoring-service.js';
import chalk from 'chalk';

async function checkResources() {
  try {
    console.log(chalk.blue('📊 Checking resource usage...\n'));

    await connectToMongoDB();

    const cacheService = new CacheService();
    const monitoringService = new MonitoringService(cacheService);

    // Get metrics
    await monitoringService.printMetrics();

    // Check limits
    const limits = await monitoringService.checkLimits();

    if (limits.withinLimits) {
      console.log(chalk.green('✅ All resources within limits\n'));
    } else {
      if (limits.warnings.length > 0) {
        console.log(chalk.yellow('⚠️  Some warnings detected\n'));
      }
      if (limits.errors.length > 0) {
        console.log(chalk.red('❌ Critical issues detected\n'));
      }
    }

    // Print cache stats
    cacheService.printStats();

  } catch (error) {
    console.error(chalk.red('❌ Error checking resources:'), error);
    process.exit(1);
  } finally {
    await disconnectFromMongoDB();
  }
}

checkResources();

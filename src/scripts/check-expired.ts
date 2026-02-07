import { connectToMongoDB, disconnectFromMongoDB } from '../db/mongodb.js';
import { SubscriptionService } from '../services/subscription-service.js';
import chalk from 'chalk';

async function checkExpired() {
  try {
    console.log(chalk.blue('Checking for expired subscriptions...\n'));
    
    await connectToMongoDB();
    
    const subscriptionService = new SubscriptionService();
    
    // Check expired subscriptions
    const expiredCount = await subscriptionService.checkExpiredSubscriptions();
    
    if (expiredCount === 0) {
      console.log(chalk.green('✅ No expired subscriptions found'));
    } else {
      console.log(chalk.yellow(`⚠️  Found ${expiredCount} expired subscription(s)`));
    }
    
    // Check expiring soon (for reminders)
    const expiringSoon = await subscriptionService.getClientsExpiringSoon(3);
    if (expiringSoon.length > 0) {
      console.log(chalk.cyan(`\n📅 ${expiringSoon.length} subscription(s) expiring in next 3 days:`));
      expiringSoon.forEach(client => {
        const endDate = client.subscription.subscriptionEndDate || client.subscription.trialEndDate;
        console.log(chalk.gray(`   - ${client.businessName} (${client.clientId}): ${endDate?.toLocaleDateString()}`));
      });
    }
    
  } catch (error) {
    console.error(chalk.red('❌ Check failed:'), error);
    process.exit(1);
  } finally {
    await disconnectFromMongoDB();
  }
}

checkExpired();

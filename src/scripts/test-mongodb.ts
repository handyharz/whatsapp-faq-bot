import { connectToMongoDB, disconnectFromMongoDB, getClientsCollection } from '../db/mongodb.js';
import { ClientService } from '../services/client-service.js';
import chalk from 'chalk';

async function testConnection() {
  try {
    console.log(chalk.blue('Testing MongoDB connection...\n'));
    
    // Connect
    await connectToMongoDB();
    console.log(chalk.green('✅ Connected successfully\n'));
    
    // Test collection
    const collection = getClientsCollection();
    const count = await collection.countDocuments();
    console.log(chalk.cyan(`📊 Collection: clients`));
    console.log(chalk.cyan(`📊 Current documents: ${count}\n`));
    
    // Test service
    const clientService = new ClientService();
    const activeClients = await clientService.getActiveClients();
    console.log(chalk.cyan(`📊 Active clients: ${activeClients.length}`));
    
    if (activeClients.length > 0) {
      console.log(chalk.green('\n✅ Active clients found:'));
      activeClients.forEach(client => {
        console.log(chalk.gray(`   - ${client.businessName} (${client.whatsappNumber})`));
      });
    } else {
      console.log(chalk.yellow('\n⚠️  No active clients found. Run seed script to create sample client.'));
    }
    
    console.log(chalk.green('\n✅ All tests passed!'));
    
  } catch (error) {
    console.error(chalk.red('❌ Test failed:'), error);
    process.exit(1);
  } finally {
    await disconnectFromMongoDB();
  }
}

testConnection();

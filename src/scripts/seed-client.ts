import { connectToMongoDB, disconnectFromMongoDB } from '../db/mongodb.js';
import { ClientService } from '../services/client-service.js';
import { Client } from '../models/client.js';
import chalk from 'chalk';

async function seedClient() {
  try {
    console.log(chalk.blue('Seeding sample client...\n'));
    
    await connectToMongoDB();
    
    const clientService = new ClientService();
    
    // Check if client already exists
    const existing = await clientService.clientExists('+2348107060160');
    if (existing) {
      console.log(chalk.yellow('⚠️  Client already exists with this WhatsApp number.'));
      console.log(chalk.yellow('   Delete existing client first or use a different number.\n'));
      await disconnectFromMongoDB();
      return;
    }
    
    const sampleClient: Omit<Client, '_id' | 'createdAt' | 'updatedAt'> = {
      clientId: 'client_test_001',
      businessName: 'Test Restaurant',
      slug: 'test-restaurant-001',
      niche: 'restaurant',
      whatsappNumber: '+2348107060160', // Your test number
      email: 'test@restaurant.com',
      address: '123 Test St, Lagos',
      socialMedia: {
        instagram: '@testrestaurant',
        facebook: 'testrestaurant',
        website: 'https://testrestaurant.com',
      },
      faqs: [
        {
          keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
          answer: 'Hello! 👋 Welcome to Test Restaurant. How can I help you today?',
          category: 'greeting'
        },
        {
          keywords: ['price', 'cost', 'how much', 'pricing'],
          answer: 'Our prices start from ₦5,000. Contact us for detailed pricing!',
          category: 'pricing'
        },
        {
          keywords: ['hours', 'open', 'closed', 'time', 'when'],
          answer: 'We\'re open Monday-Friday, 9am-5pm WAT.',
          category: 'hours'
        },
        {
          keywords: ['location', 'address', 'where'],
          answer: 'We\'re located at 123 Test St, Lagos. Come visit us!',
          category: 'location'
        },
        {
          keywords: ['help', 'commands', 'options', 'menu', 'what can you do'],
          answer:
            "I can help you with:\n" +
            "• PRICE - Get pricing information\n" +
            "• HOURS - Business hours\n" +
            "• LOCATION - Our address\n" +
            "• CONTACT - Contact information\n\n" +
            "Just ask me anything! 😊",
          category: 'help',
        },
      ],
      config: {
        businessHours: {
          start: 9,
          end: 17
        },
        timezone: 'Africa/Lagos',
        afterHoursMessage: 'Thanks for your message! We\'re currently closed (9am-5pm WAT). We\'ll reply first thing tomorrow. 😊',
        adminNumbers: ['+2348107060160']
      },
      subscription: {
        status: 'trial',
        tier: 'starter',
        trialStartDate: new Date(),
        trialEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      }
    };

    const client = await clientService.createClient(sampleClient);
    console.log(chalk.green('✅ Sample client created successfully!\n'));
    console.log(chalk.cyan('Client Details:'));
    console.log(chalk.gray(`   ID: ${client.clientId}`));
    console.log(chalk.gray(`   Business: ${client.businessName}`));
    console.log(chalk.gray(`   WhatsApp: ${client.whatsappNumber}`));
    console.log(chalk.gray(`   FAQs: ${client.faqs.length}`));
    console.log(chalk.gray(`   Subscription: ${client.subscription.status} (${client.subscription.tier})`));
    console.log(chalk.gray(`   Trial ends: ${client.subscription.trialEndDate?.toLocaleString()}\n`));
    
  } catch (error) {
    console.error(chalk.red('❌ Seed failed:'), error);
    process.exit(1);
  } finally {
    await disconnectFromMongoDB();
  }
}

seedClient();

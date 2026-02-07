import { MongoClient, Db, Collection } from 'mongodb';
import * as dotenv from 'dotenv';
import chalk from 'chalk';
import { Client } from '../models/client.js';
import { Transaction } from '../models/transaction.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/whatsapp_faq_bot';
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'whatsapp_faq_bot';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectToMongoDB(): Promise<Db> {
  if (db) {
    return db;
  }

  try {
    client = new MongoClient(MONGODB_URI, {
      maxPoolSize: 10, // Maximum connections in pool
      minPoolSize: 2,  // Minimum connections to maintain
      maxIdleTimeMS: 30000, // Close idle connections after 30s
      serverSelectionTimeoutMS: 5000, // Timeout for server selection
      socketTimeoutMS: 45000, // Socket timeout
    });

    await client.connect();
    db = client.db(MONGODB_DB_NAME);
    
    console.log(chalk.green('✅ Connected to MongoDB'));
    
    // Create indexes
    await createIndexes(db);
    
    return db;
  } catch (error) {
    console.error(chalk.red('❌ MongoDB connection error:'), error);
    throw error;
  }
}

async function createIndexes(db: Db): Promise<void> {
  try {
    const clientsCollection = db.collection('clients');
    const messagesCollection = db.collection('messages');
    const adminsCollection = db.collection('admins');
    const transactionsCollection = db.collection('transactions');
    
    // Client indexes
    await clientsCollection.createIndex({ whatsappNumber: 1 }, { unique: true });
    await clientsCollection.createIndex({ clientId: 1 }, { unique: true });
    await clientsCollection.createIndex({ slug: 1 }, { unique: true });
    await clientsCollection.createIndex({ email: 1 }, { unique: true, sparse: true }); // Sparse: only for clients with email
    await clientsCollection.createIndex({ 'subscription.status': 1 });
    await clientsCollection.createIndex({ 'subscription.trialEndDate': 1 });
    await clientsCollection.createIndex({ 'subscription.subscriptionEndDate': 1 });
    
    // Message indexes (for rate limiting)
    await messagesCollection.createIndex({ clientId: 1, from: 1, timestamp: -1 });
    await messagesCollection.createIndex({ clientId: 1, hour: 1 });
    await messagesCollection.createIndex({ clientId: 1, day: 1 });
    await messagesCollection.createIndex({ clientId: 1, month: 1 });
    await messagesCollection.createIndex({ timestamp: -1 }); // For cleanup queries
    
    // Admin indexes
    await adminsCollection.createIndex({ email: 1 }, { unique: true });
    
    // Transaction indexes
    await transactionsCollection.createIndex({ reference: 1 }, { unique: true });
    await transactionsCollection.createIndex({ clientId: 1, createdAt: -1 });
    await transactionsCollection.createIndex({ status: 1 });
    await transactionsCollection.createIndex({ createdAt: -1 });
    
    console.log(chalk.green('✅ MongoDB indexes created'));
  } catch (error) {
    // Indexes might already exist, that's OK
    if ((error as any).code !== 85 && (error as any).code !== 11000) {
      console.error(chalk.yellow('⚠️  Index creation warning:'), error);
    }
  }
}

export async function disconnectFromMongoDB(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log(chalk.green('✅ Disconnected from MongoDB'));
  }
}

export function getDatabase(): Db {
  if (!db) {
    throw new Error('Database not connected. Call connectToMongoDB() first.');
  }
  return db;
}

export function getClientsCollection(): Collection<Client> {
  const db = getDatabase();
  return db.collection<Client>('clients');
}

export function getTransactionsCollection(): Collection<Transaction> {
  const db = getDatabase();
  return db.collection<Transaction>('transactions');
}

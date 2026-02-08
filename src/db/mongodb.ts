import { MongoClient, Db, Collection } from 'mongodb';
import * as dotenv from 'dotenv';
import chalk from 'chalk';
import { Client } from '../models/client.js';
import { Transaction } from '../models/transaction.js';
import { Workspace } from '../models/workspace.js';

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
    const workspacesCollection = db.collection('workspaces');
    const messagesCollection = db.collection('messages');
    const adminsCollection = db.collection('admins');
    const transactionsCollection = db.collection('transactions');
    const connectionAlertsCollection = db.collection('connectionAlerts');
    
    // Workspace indexes (NEW - Critical for routing)
    await workspacesCollection.createIndex({ workspaceId: 1 }, { unique: true });
    await workspacesCollection.createIndex({ phoneNumbers: 1 }); // Array index for phone lookup
    await workspacesCollection.createIndex({ clientId: 1 }, { sparse: true }); // For migration compatibility
    await workspacesCollection.createIndex({ email: 1 }, { unique: true, sparse: true });
    await workspacesCollection.createIndex({ 'subscription.status': 1 });
    await workspacesCollection.createIndex({ 'subscription.trialEndDate': 1 });
    await workspacesCollection.createIndex({ 'subscription.subscriptionEndDate': 1 });
    // CRITICAL: Composite index for workspace queries ordered by date
    await workspacesCollection.createIndex({ workspaceId: 1, createdAt: -1 });
    
    // Client indexes (keep for backward compatibility during migration)
    await clientsCollection.createIndex({ whatsappNumber: 1 }, { unique: true });
    await clientsCollection.createIndex({ clientId: 1 }, { unique: true });
    await clientsCollection.createIndex({ workspaceId: 1 }, { sparse: true }); // NEW - link to workspace
    await clientsCollection.createIndex({ slug: 1 }, { unique: true });
    await clientsCollection.createIndex({ email: 1 }, { unique: true, sparse: true });
    await clientsCollection.createIndex({ 'subscription.status': 1 });
    await clientsCollection.createIndex({ 'subscription.trialEndDate': 1 });
    await clientsCollection.createIndex({ 'subscription.subscriptionEndDate': 1 });
    
    // Message indexes (add workspaceId for future)
    await messagesCollection.createIndex({ clientId: 1, from: 1, timestamp: -1 });
    await messagesCollection.createIndex({ workspaceId: 1 }, { sparse: true }); // NEW - for workspace queries
    // CRITICAL: Composite index for workspace messages ordered by date (prevents slow scans at scale)
    await messagesCollection.createIndex({ workspaceId: 1, timestamp: -1 }, { sparse: true });
    await messagesCollection.createIndex({ clientId: 1, hour: 1 });
    await messagesCollection.createIndex({ clientId: 1, day: 1 });
    await messagesCollection.createIndex({ clientId: 1, month: 1 });
    await messagesCollection.createIndex({ timestamp: -1 }); // For cleanup queries
    
    // Admin indexes
    await adminsCollection.createIndex({ email: 1 }, { unique: true });
    
    // Transaction indexes (add workspaceId for future)
    await transactionsCollection.createIndex({ reference: 1 }, { unique: true });
    await transactionsCollection.createIndex({ clientId: 1, createdAt: -1 });
    await transactionsCollection.createIndex({ workspaceId: 1 }, { sparse: true }); // NEW
    // CRITICAL: Composite index for workspace transactions ordered by date
    await transactionsCollection.createIndex({ workspaceId: 1, createdAt: -1 }, { sparse: true });
    await transactionsCollection.createIndex({ status: 1 });
    await transactionsCollection.createIndex({ createdAt: -1 });
    
    // Connection alerts indexes (NEW - for failure alerts)
    await connectionAlertsCollection.createIndex({ workspaceId: 1 }, { unique: true });
    await connectionAlertsCollection.createIndex({ status: 1 });
    await connectionAlertsCollection.createIndex({ notified: 1 });
    await connectionAlertsCollection.createIndex({ lastDisconnectedAt: -1 });
    await connectionAlertsCollection.createIndex({ status: 1, notified: 1 }); // For finding un-notified disconnections
    
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

export function getWorkspacesCollection(): Collection<Workspace> {
  const db = getDatabase();
  return db.collection<Workspace>('workspaces');
}

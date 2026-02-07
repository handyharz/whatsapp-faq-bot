import { ObjectId } from 'mongodb';
import { getClientsCollection } from '../db/mongodb.js';
import { Client, FAQ } from '../models/client.js';

// Cache invalidation callback (set by bot)
let cacheInvalidationCallback: ((whatsappNumber: string) => void) | null = null;

export function setCacheInvalidationCallback(callback: (whatsappNumber: string) => void): void {
  cacheInvalidationCallback = callback;
}

export class ClientService {
  /**
   * Get client by WhatsApp number
   */
  async getClientByWhatsAppNumber(whatsappNumber: string): Promise<Client | null> {
    const collection = getClientsCollection();
    const client = await collection.findOne({ whatsappNumber });
    return client;
  }

  /**
   * Get client by clientId
   */
  async getClientById(clientId: string): Promise<Client | null> {
    const collection = getClientsCollection();
    const client = await collection.findOne({ clientId });
    return client;
  }

  /**
   * Create new client
   */
  async createClient(clientData: Omit<Client, '_id' | 'createdAt' | 'updatedAt'>): Promise<Client> {
    const collection = getClientsCollection();
    
    const now = new Date();
    const client: Client = {
      ...clientData,
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(client as any);
    return { ...client, _id: result.insertedId.toString() };
  }

  /**
   * Update client
   */
  async updateClient(clientId: string, updates: Partial<Client>): Promise<Client | null> {
    const collection = getClientsCollection();
    
    console.log('🔄 Updating client:', clientId, 'Updates:', Object.keys(updates));
    
    const result = await collection.findOneAndUpdate(
      { clientId },
      { 
        $set: { 
          ...updates,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      console.error('❌ findOneAndUpdate returned null - client not found or update failed');
      return null;
    }

    console.log('✅ Client updated successfully:', result.clientId);
    return result;
  }

  /**
   * Update client FAQs
   */
  async updateFAQs(clientId: string, faqs: FAQ[]): Promise<Client | null> {
    return this.updateClient(clientId, { faqs });
  }

  /**
   * Update subscription status
   */
  async updateSubscriptionStatus(
    clientId: string, 
    status: Client['subscription']['status']
  ): Promise<Client | null> {
    const existingClient = await this.getClientById(clientId);
    if (!existingClient) {
      return null;
    }

    return this.updateClient(clientId, {
      subscription: {
        ...existingClient.subscription,
        status,
      }
    });
  }

  /**
   * Get all active clients
   */
  async getActiveClients(): Promise<Client[]> {
    const collection = getClientsCollection();
    const clients = await collection.find({
      'subscription.status': { $in: ['trial', 'active'] }
    }).toArray();
    return clients;
  }

  /**
   * Get expired clients
   */
  async getExpiredClients(): Promise<Client[]> {
    const collection = getClientsCollection();
    const clients = await collection.find({
      'subscription.status': 'expired'
    }).toArray();
    return clients;
  }

  /**
   * Check if client exists by WhatsApp number
   */
  async clientExists(whatsappNumber: string): Promise<boolean> {
    const collection = getClientsCollection();
    const count = await collection.countDocuments({ whatsappNumber });
    return count > 0;
  }
}

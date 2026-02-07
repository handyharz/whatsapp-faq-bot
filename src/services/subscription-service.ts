import { getDatabase } from '../db/mongodb.js';
import { ClientService } from './client-service.js';
import { Client } from '../models/client.js';
import { PaymentService } from './payment-service.js';
import chalk from 'chalk';

export class SubscriptionService {
  private clientService: ClientService;
  private paymentService: PaymentService;

  constructor() {
    this.clientService = new ClientService();
    this.paymentService = new PaymentService();
  }

  /**
   * Check and update expired subscriptions
   */
  async checkExpiredSubscriptions(): Promise<number> {
    const db = getDatabase();
    const clientsCollection = db.collection<Client>('clients');
    const now = new Date();

    // Find clients with expired trials
    const expiredTrials = await clientsCollection.find({
      'subscription.status': 'trial',
      'subscription.trialEndDate': { $lt: now },
    }).toArray();

    // Find clients with expired subscriptions
    const expiredSubscriptions = await clientsCollection.find({
      'subscription.status': 'active',
      'subscription.subscriptionEndDate': { $lt: now },
    }).toArray();

    let updatedCount = 0;

    // Update expired trials
    for (const client of expiredTrials) {
      await this.clientService.updateSubscriptionStatus(client.clientId, 'expired');
      updatedCount++;
      console.log(
        chalk.yellow(`⚠️  Trial expired for ${client.businessName} (${client.clientId})`)
      );
    }

    // Update expired subscriptions
    for (const client of expiredSubscriptions) {
      await this.clientService.updateSubscriptionStatus(client.clientId, 'expired');
      updatedCount++;
      console.log(
        chalk.yellow(`⚠️  Subscription expired for ${client.businessName} (${client.clientId})`)
      );
    }

    if (updatedCount > 0) {
      console.log(chalk.cyan(`📊 Updated ${updatedCount} expired subscription(s)`));
    }

    return updatedCount;
  }

  /**
   * Get clients expiring soon (for reminders)
   */
  async getClientsExpiringSoon(days: number = 3): Promise<Client[]> {
    const db = getDatabase();
    const clientsCollection = db.collection<Client>('clients');
    const now = new Date();
    const expiryDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    // Find active subscriptions expiring soon
    const expiring = await clientsCollection.find({
      'subscription.status': 'active',
      'subscription.subscriptionEndDate': {
        $gte: now,
        $lte: expiryDate,
      },
    }).toArray();

    // Find trials expiring soon
    const expiringTrials = await clientsCollection.find({
      'subscription.status': 'trial',
      'subscription.trialEndDate': {
        $gte: now,
        $lte: expiryDate,
      },
    }).toArray();

    return [...expiring, ...expiringTrials];
  }

  /**
   * Extend subscription (for payments)
   */
  async extendSubscription(
    clientId: string,
    months: number = 1
  ): Promise<Client | null> {
    const client = await this.clientService.getClientById(clientId);
    if (!client) {
      return null;
    }

    const now = new Date();
    const newEndDate = new Date(now);
    newEndDate.setMonth(newEndDate.getMonth() + months);

    return this.clientService.updateClient(clientId, {
      subscription: {
        ...client.subscription,
        status: 'active',
        subscriptionStartDate: client.subscription.subscriptionStartDate || now,
        subscriptionEndDate: newEndDate,
        lastPaymentDate: now,
      },
    });
  }

  /**
   * Start trial for a client
   */
  async startTrial(clientId: string, days: number = 7): Promise<Client | null> {
    const client = await this.clientService.getClientById(clientId);
    if (!client) {
      return null;
    }

    const now = new Date();
    const trialEndDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    return this.clientService.updateClient(clientId, {
      subscription: {
        ...client.subscription,
        status: 'trial',
        trialStartDate: now,
        trialEndDate,
      },
    });
  }

  /**
   * Generate payment link for subscription upgrade/renewal
   */
  async generatePaymentLink(clientId: string, tier: Client['subscription']['tier']): Promise<string> {
    const client = await this.clientService.getClientById(clientId);
    if (!client) {
      throw new Error('Client not found');
    }

    return this.paymentService.generateSubscriptionLink(client, tier);
  }

  /**
   * Activate subscription after successful payment
   */
  async activateSubscription(
    clientId: string,
    tier: Client['subscription']['tier'],
    paymentReference: string
  ): Promise<Client | null> {
    const client = await this.clientService.getClientById(clientId);
    if (!client) {
      return null;
    }

    const now = new Date();
    const subscriptionEndDate = new Date(now);
    subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1); // 1 month

    return this.clientService.updateClient(clientId, {
      subscription: {
        ...client.subscription,
        status: 'active',
        tier,
        subscriptionStartDate: now,
        subscriptionEndDate,
        lastPaymentDate: now,
        paymentMethod: 'card',
      },
    });
  }
}

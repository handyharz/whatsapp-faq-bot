import { ClientService } from './client-service.js';
import { Client, SubscriptionTier } from '../models/client.js';
import { Transaction } from '../models/transaction.js';
import { getTransactionsCollection } from '../db/mongodb.js';
import chalk from 'chalk';

export interface PaymentLinkOptions {
  clientId: string;
  tier: SubscriptionTier;
  email: string;
  businessName: string;
  amount: number; // in kobo (₦1 = 100 kobo)
  callbackUrl?: string;
}

export interface PaymentVerificationResult {
  success: boolean;
  reference: string;
  amount: number;
  status: 'success' | 'failed' | 'pending';
  message?: string;
}

export interface PaystackWebhookEvent {
  event: string;
  data: {
    reference: string;
    amount: number;
    customer: {
      email: string;
    };
    status: string;
    metadata?: {
      clientId?: string;
      tier?: string;
    };
  };
}

export class PaymentService {
  private clientService: ClientService;
  private paystackSecretKey: string;
  private paystackPublicKey: string;
  private baseUrl: string;

  constructor() {
    this.clientService = new ClientService();
    this.paystackSecretKey = process.env.PAYSTACK_SECRET_KEY || '';
    this.paystackPublicKey = process.env.PAYSTACK_PUBLIC_KEY || '';
    this.baseUrl = process.env.BASE_URL || 'https://www.exonec.com';

    if (!this.paystackSecretKey) {
      console.warn(chalk.yellow('⚠️  PAYSTACK_SECRET_KEY not set. Payment features will not work.'));
    }
  }

  /**
   * Get pricing for subscription tiers
   */
  getTierPricing(tier: SubscriptionTier): number {
    const pricing: Record<SubscriptionTier, number> = {
      trial: 0,
      starter: 500000,      // ₦5,000 in kobo
      professional: 1000000, // ₦10,000 in kobo
      enterprise: 2000000,    // ₦20,000 in kobo
    };

    return pricing[tier] || 0;
  }

  /**
   * Generate payment link for subscription
   */
  async createPaymentLink(options: PaymentLinkOptions): Promise<string> {
    if (!this.paystackSecretKey) {
      throw new Error('Paystack secret key not configured');
    }

    const { clientId, tier, email, businessName, amount, callbackUrl } = options;

    try {
      const response = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          amount,
          reference: `SUB_${clientId}_${Date.now()}`,
          callback_url: callbackUrl || `${this.baseUrl}/payment/callback`,
          metadata: {
            clientId,
            tier,
            businessName,
            type: 'subscription',
          },
        }),
      });

      const data = await response.json() as {
        status: boolean;
        message?: string;
        data?: {
          authorization_url: string;
        };
      };

      if (!response.ok || !data.status) {
        throw new Error(data.message || 'Failed to create payment link');
      }

      if (!data.data?.authorization_url) {
        throw new Error('Payment link not found in response');
      }

      return data.data.authorization_url;
    } catch (error) {
      console.error(chalk.red('❌ Payment link creation failed:'), error);
      throw error;
    }
  }

  /**
   * Verify payment transaction
   */
  async verifyPayment(reference: string): Promise<PaymentVerificationResult> {
    if (!this.paystackSecretKey) {
      throw new Error('Paystack secret key not configured');
    }

    try {
      const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.paystackSecretKey}`,
        },
      });

      const data = await response.json() as {
        status: boolean;
        message?: string;
        data?: {
          status: string;
          reference: string;
          amount: number;
          gateway_response?: string;
        };
      };

      if (!response.ok || !data.status) {
        return {
          success: false,
          reference,
          amount: 0,
          status: 'failed',
          message: data.message || 'Payment verification failed',
        };
      }

      if (!data.data) {
        return {
          success: false,
          reference,
          amount: 0,
          status: 'failed',
          message: 'Transaction data not found',
        };
      }

      const transaction = data.data;

      return {
        success: transaction.status === 'success',
        reference: transaction.reference,
        amount: transaction.amount,
        status: transaction.status === 'success' ? 'success' : 'failed',
        message: transaction.gateway_response || 'Payment verified',
      };
    } catch (error) {
      console.error(chalk.red('❌ Payment verification failed:'), error);
      return {
        success: false,
        reference,
        amount: 0,
        status: 'failed',
        message: error instanceof Error ? error.message : 'Payment verification error',
      };
    }
  }

  /**
   * Handle Paystack webhook event
   */
  async handleWebhook(event: PaystackWebhookEvent): Promise<{ success: boolean; message: string }> {
    if (event.event !== 'charge.success') {
      return { success: false, message: 'Event not handled' };
    }

    const { reference, amount, customer, metadata } = event.data;

    if (!metadata?.clientId || !metadata?.tier) {
      console.warn(chalk.yellow('⚠️  Webhook missing clientId or tier'));
      return { success: false, message: 'Missing metadata' };
    }

    const clientId = metadata.clientId;
    const tier = metadata.tier as SubscriptionTier;

    try {
      // Verify payment
      const verification = await this.verifyPayment(reference);
      
      if (!verification.success) {
        return { success: false, message: 'Payment verification failed' };
      }

      // Get client
      const client = await this.clientService.getClientById(clientId);
      if (!client) {
        return { success: false, message: 'Client not found' };
      }

      // Update subscription
      const now = new Date();
      const subscriptionEndDate = new Date(now);
      subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1); // 1 month subscription

      await this.clientService.updateClient(clientId, {
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

      // Record transaction
      const transactionsCollection = getTransactionsCollection();
      const transaction: Omit<Transaction, '_id'> = {
        transactionId: `TXN_${clientId}_${Date.now()}`,
        clientId,
        reference,
        amount: verification.amount || amount,
        currency: 'NGN',
        status: 'success',
        tier,
        paymentMethod: 'card',
        paystackData: {
          customer: customer ? {
            email: customer.email,
            name: customer.name,
          } : undefined,
          gateway_response: verification.message,
        },
        createdAt: now,
        updatedAt: now,
        processedAt: now,
      };
      
      await transactionsCollection.insertOne(transaction as Transaction);

      console.log(chalk.green(`✅ Subscription activated for client: ${client.businessName} (${clientId})`));
      console.log(chalk.blue(`💰 Transaction recorded: ${reference} - ₦${(transaction.amount / 100).toLocaleString()}`));
      
      // TODO: Send confirmation email to client
      // TODO: Send notification to admin

      return { success: true, message: 'Subscription activated successfully' };
    } catch (error) {
      console.error(chalk.red('❌ Webhook processing failed:'), error);
      return { success: false, message: error instanceof Error ? error.message : 'Webhook processing error' };
    }
  }

  /**
   * Generate subscription payment link for client
   */
  async generateSubscriptionLink(client: Client, tier: SubscriptionTier): Promise<string> {
    const amount = this.getTierPricing(tier);

    if (amount === 0) {
      throw new Error('Invalid tier selected');
    }

    return this.createPaymentLink({
      clientId: client.clientId,
      tier,
      email: client.email,
      businessName: client.businessName,
      amount,
    });
  }

  /**
   * Verify webhook signature (security)
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!this.paystackSecretKey) {
      return false;
    }

    const crypto = require('node:crypto');
    const hash = crypto
      .createHmac('sha512', this.paystackSecretKey)
      .update(payload)
      .digest('hex');

    return hash === signature;
  }
}

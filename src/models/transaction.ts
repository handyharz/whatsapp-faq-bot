export interface Transaction {
  _id?: string;
  transactionId: string; // Unique transaction ID
  clientId: string;
  reference: string; // Paystack reference
  amount: number; // Amount in kobo (₦1 = 100 kobo)
  currency: string; // e.g., 'NGN'
  status: 'pending' | 'success' | 'failed' | 'cancelled';
  tier: 'starter' | 'professional' | 'enterprise';
  paymentMethod: 'card' | 'bank_transfer' | 'other';
  paystackData?: {
    customer?: {
      email?: string;
      name?: string;
    };
    gateway_response?: string;
    channel?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  processedAt?: Date; // When subscription was activated
}

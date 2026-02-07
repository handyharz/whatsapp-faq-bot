import { PaymentService, PaystackWebhookEvent } from '../services/payment-service.js';
import chalk from 'chalk';

/**
 * Handle Paystack webhook requests
 * This should be used in an HTTP server (Express, Next.js API route, etc.)
 */
export async function handlePaystackWebhook(
  body: string,
  signature: string
): Promise<{ status: number; message: string }> {
  const paymentService = new PaymentService();

  // Verify webhook signature
  if (!paymentService.verifyWebhookSignature(body, signature)) {
    console.warn(chalk.yellow('⚠️  Invalid webhook signature'));
    return { status: 401, message: 'Unauthorized' };
  }

  try {
    const event: PaystackWebhookEvent = JSON.parse(body);
    const result = await paymentService.handleWebhook(event);

    if (result.success) {
      return { status: 200, message: 'OK' };
    } else {
      return { status: 400, message: result.message };
    }
  } catch (error) {
    console.error(chalk.red('❌ Webhook processing error:'), error);
    return { status: 500, message: 'Internal server error' };
  }
}

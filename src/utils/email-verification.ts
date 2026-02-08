/**
 * Email Verification Utility
 * 
 * Generates and sends email verification tokens
 */

import { randomBytes } from 'crypto';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM = process.env.RESEND_FROM || 'WhatsApp FAQ Bot <support@exonec.com>';
const FRONTEND_URL = process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * Generate email verification token
 */
export function generateVerificationToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Format email verification email
 */
function formatVerificationEmail(data: {
  businessName: string;
  verificationUrl: string;
}): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - WhatsApp FAQ Bot</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
        <div style="background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h1 style="color: #0a0a0a; margin-top: 0; font-size: 24px;">📧 Verify Your Email Address</h1>
          
          <p style="color: #333; font-size: 16px;">
            Hi ${data.businessName},
          </p>
          
          <p style="color: #333; font-size: 16px;">
            Thank you for signing up! Please verify your email address to complete your account setup.
          </p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${data.verificationUrl}" style="display: inline-block; background: #3b82f6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 24px;">
            Or copy and paste this link into your browser:
          </p>
          <p style="color: #3b82f6; font-size: 12px; word-break: break-all; background: #f9f9f9; padding: 12px; border-radius: 4px;">
            ${data.verificationUrl}
          </p>
          
          <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 16px; margin: 24px 0; border-radius: 4px;">
            <p style="color: #856404; font-size: 14px; margin: 0;">
              <strong>⏰ This link expires in 24 hours</strong><br>
              If you didn't create an account, you can safely ignore this email.
            </p>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 32px;">
            Best regards,<br>
            <strong>The WhatsApp FAQ Bot Team</strong>
          </p>
        </div>
      </body>
    </html>
  `;
}

/**
 * Send email verification email
 */
export async function sendVerificationEmail(
  email: string,
  businessName: string,
  token: string
): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.warn('⚠️ RESEND_API_KEY not set, skipping verification email');
    return false;
  }

  try {
    const verificationUrl = `${FRONTEND_URL}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: email,
        subject: `📧 Verify Your Email - WhatsApp FAQ Bot`,
        html: formatVerificationEmail({
          businessName,
          verificationUrl,
        }),
      }),
    });

    if (!response.ok) {
      const error = await response.json() as { error?: string; message?: string };
      console.error('❌ Resend error:', error);
      return false;
    }

    const data = await response.json() as { id: string };
    console.log(`✅ Verification email sent: ${data.id}`);
    return true;
  } catch (error: any) {
    console.error('❌ Error sending verification email:', error.message);
    return false;
  }
}

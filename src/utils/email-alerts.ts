/**
 * Email Alert Utility
 * 
 * Sends email alerts via Resend when WhatsApp disconnects
 * CRITICAL: Know before the client does
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM = process.env.RESEND_FROM || 'WhatsApp FAQ Bot <support@exonec.com>';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.YOUR_EMAIL || 'harzkane@gmail.com';

interface DisconnectAlert {
  workspaceId: string;
  businessName: string;
  email: string;
  disconnectReason?: string;
  lastConnectedAt: Date;
  lastDisconnectedAt: Date;
}

/**
 * Send disconnect alert email to admin
 */
export async function sendDisconnectAlert(alert: DisconnectAlert): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.warn('⚠️ RESEND_API_KEY not set, skipping disconnect alert email');
    return false;
  }

  try {
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>⚠️ WhatsApp Disconnect Alert</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
          <div style="background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="color: #ef4444; margin-top: 0; font-size: 24px;">⚠️ WhatsApp Disconnect Alert</h1>
            
            <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #991b1b; font-weight: 500;">
                A WhatsApp bot has disconnected and is no longer responding to messages.
              </p>
            </div>
            
            <div style="background: #f9f9f9; border-radius: 6px; padding: 20px; margin: 20px 0;">
              <h2 style="color: #0a0a0a; font-size: 18px; margin-top: 0;">Workspace Details</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: 500;">Workspace ID:</td>
                  <td style="padding: 8px 0; color: #0a0a0a;"><strong>${alert.workspaceId}</strong></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: 500;">Business Name:</td>
                  <td style="padding: 8px 0; color: #0a0a0a;"><strong>${alert.businessName}</strong></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: 500;">Client Email:</td>
                  <td style="padding: 8px 0; color: #0a0a0a;">${alert.email}</td>
                </tr>
                ${alert.disconnectReason ? `
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: 500;">Disconnect Reason:</td>
                  <td style="padding: 8px 0; color: #0a0a0a;">${alert.disconnectReason}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: 500;">Last Connected:</td>
                  <td style="padding: 8px 0; color: #0a0a0a;">${new Date(alert.lastConnectedAt).toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: 500;">Disconnected At:</td>
                  <td style="padding: 8px 0; color: #0a0a0a;">${new Date(alert.lastDisconnectedAt).toLocaleString()}</td>
                </tr>
              </table>
            </div>
            
            <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #1e40af;">
                <strong>Action Required:</strong> Check the bot connection status and restart if necessary. 
                The bot should automatically reconnect, but manual intervention may be needed.
              </p>
            </div>
            
            <p style="color: #666; margin: 20px 0 0 0; font-size: 14px;">
              View connection status in the admin dashboard or check the bot logs.
            </p>
          </div>
        </body>
      </html>
    `;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: ADMIN_EMAIL,
        subject: `⚠️ WhatsApp Disconnect: ${alert.businessName}`,
        html: emailHtml,
      }),
    });

    if (!response.ok) {
      const error = await response.json() as { error?: string; message?: string };
      console.error('❌ Resend error:', error);
      return false;
    }

    const data = await response.json() as { id: string };
    console.log(`✅ Disconnect alert email sent: ${data.id}`);
    return true;
  } catch (error: any) {
    console.error('❌ Error sending disconnect alert email:', error.message);
    return false;
  }
}

/**
 * Send multiple disconnect alerts (when multiple workspaces are affected)
 */
export async function sendBulkDisconnectAlert(workspaces: DisconnectAlert[]): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.warn('⚠️ RESEND_API_KEY not set, skipping bulk disconnect alert email');
    return false;
  }

  if (workspaces.length === 0) {
    return true;
  }

  try {
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>⚠️ Multiple WhatsApp Disconnects</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
          <div style="background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="color: #ef4444; margin-top: 0; font-size: 24px;">⚠️ Multiple WhatsApp Disconnects</h1>
            
            <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #991b1b; font-weight: 500;">
                ${workspaces.length} workspace(s) have disconnected and are no longer responding to messages.
              </p>
            </div>
            
            <div style="background: #f9f9f9; border-radius: 6px; padding: 20px; margin: 20px 0;">
              <h2 style="color: #0a0a0a; font-size: 18px; margin-top: 0;">Affected Workspaces</h2>
              <ul style="list-style: none; padding: 0; margin: 0;">
                ${workspaces.map(ws => `
                  <li style="padding: 12px 0; border-bottom: 1px solid #e5e5e5;">
                    <strong>${ws.businessName}</strong> (${ws.workspaceId})<br>
                    <span style="color: #666; font-size: 14px;">${ws.email}</span>
                  </li>
                `).join('')}
              </ul>
            </div>
            
            <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #1e40af;">
                <strong>Action Required:</strong> This appears to be a platform-wide issue. 
                Check the bot connection status and restart if necessary.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: ADMIN_EMAIL,
        subject: `⚠️ ${workspaces.length} WhatsApp Bot(s) Disconnected`,
        html: emailHtml,
      }),
    });

    if (!response.ok) {
      const error = await response.json() as { error?: string; message?: string };
      console.error('❌ Resend error:', error);
      return false;
    }

    const data = await response.json() as { id: string };
    console.log(`✅ Bulk disconnect alert email sent: ${data.id}`);
    return true;
  } catch (error: any) {
    console.error('❌ Error sending bulk disconnect alert email:', error.message);
    return false;
  }
}

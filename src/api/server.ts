import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectToMongoDB, getDatabase, getClientsCollection, getTransactionsCollection } from '../db/mongodb.js';
import { Transaction } from '../models/transaction.js';
import { ClientService } from '../services/client-service.js';
import { AdminService } from '../services/admin-service.js';
import { RateLimiter } from '../services/rate-limiter.js';
import { SubscriptionService } from '../services/subscription-service.js';
import { PaymentService } from '../services/payment-service.js';
import { CacheService } from '../services/cache-service.js';
import { MonitoringService } from '../services/monitoring-service.js';
import { generateTokenPair, verifyRefreshToken } from '../utils/jwt.js';
import { verifyPassword, hashPassword } from '../utils/password.js';
import { authenticateToken, requireAdmin, requireClient } from '../middleware/auth.js';
import chalk from 'chalk';

const app = express();
const PORT = process.env.API_PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true, // Allow cookies
}));
app.use(cookieParser());
app.use(express.json());

// Services
const clientService = new ClientService();
const adminService = new AdminService();
const rateLimiter = new RateLimiter();
const subscriptionService = new SubscriptionService();
const paymentService = new PaymentService();
const cacheService = new CacheService();
const monitoringService = new MonitoringService(cacheService);

// Helper function to safely get string from query params
function getStringParam(value: any): string | null {
  if (!value) return null;
  if (Array.isArray(value)) return null;
  if (typeof value !== 'string') return null;
  return value;
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- Authentication Endpoints ---

// Client login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find client by email
    const client = await getClientsCollection().findOne({ email: email.toLowerCase() });
    
    if (!client) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if client has password set
    if (!client.password) {
      // For existing clients without password, allow login with clientId as password (temporary)
      // Or return error asking to set password
      return res.status(401).json({ 
        error: 'Password not set. Please contact support to set your password.',
        needsPasswordSetup: true 
      });
    }

    // Verify password
    const isValid = await verifyPassword(password, client.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate tokens
    const tokens = generateTokenPair({
      userId: client.clientId,
      email: client.email,
      role: 'client',
    });

    // Update last login
    await getClientsCollection().updateOne(
      { clientId: client.clientId },
      { $set: { lastLoginAt: new Date() } }
    );

    // Set httpOnly cookies
    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/', // Make cookie available across all paths
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/', // Make cookie available across all paths
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        clientId: client.clientId,
        businessName: client.businessName,
        email: client.email,
        role: 'client',
      },
      // Also return tokens for clients that can't use cookies (mobile apps, etc.)
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin login
app.post('/api/auth/admin/login', async (req, res) => {
  try {
    console.log('📥 Admin login request received');
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    console.log('🔍 Verifying credentials for:', email);
    // Verify admin credentials
    const admin = await adminService.verifyCredentials(email, password);
    
    if (!admin) {
      console.log('❌ Invalid credentials');
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!admin._id) {
      console.error('❌ Admin missing _id:', admin);
      return res.status(500).json({ error: 'Internal server error' });
    }

    console.log('✅ Credentials verified, generating tokens for admin:', admin._id);
    // Generate tokens
    const tokens = generateTokenPair({
      userId: admin._id.toString(),
      email: admin.email,
      role: 'admin',
    });

    // Set httpOnly cookies
    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/', // Make cookie available across all paths
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/', // Make cookie available across all paths
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        adminId: admin._id?.toString(),
        email: admin.email,
        role: admin.role,
      },
      // Also return tokens for clients that can't use cookies
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
    console.log('✅ Admin login successful');
  } catch (error: any) {
    console.error('❌ Admin login error:', error);
    console.error('Error stack:', error?.stack);
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

// Refresh token
app.post('/api/auth/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    // Generate new access token
    const newAccessToken = generateTokenPair({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    }).accessToken;

    // Set new access token cookie
    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/', // Make cookie available across all paths
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('accessToken', { path: '/' });
  res.clearCookie('refreshToken', { path: '/' });
  res.json({ success: true, message: 'Logged out successfully' });
});

// Request password reset
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const client = await getClientsCollection().findOne({ email: email.toLowerCase() });
    
    // Don't reveal if email exists or not (security best practice)
    if (!client) {
      return res.json({ 
        success: true, 
        message: 'If an account exists with this email, a password reset link has been sent.' 
      });
    }

    // Generate reset token
    const crypto = await import('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save reset token to database
    await getClientsCollection().updateOne(
      { clientId: client.clientId },
      { 
        $set: { 
          passwordResetToken: resetToken,
          passwordResetExpires: resetExpires,
        }
      }
    );

    // Generate reset URL - frontend will send the email
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    res.json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.',
      // Return resetUrl so frontend can send email
      resetUrl: resetUrl,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset password with token
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, email, password } = req.body;

    if (!token || !email || !password) {
      return res.status(400).json({ error: 'Token, email, and password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    const client = await getClientsCollection().findOne({ 
      email: email.toLowerCase(),
      passwordResetToken: token,
    });

    if (!client) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Check if token is expired
    if (!client.passwordResetExpires || new Date() > new Date(client.passwordResetExpires)) {
      return res.status(400).json({ error: 'Reset token has expired. Please request a new one.' });
    }

    // Hash new password
    const hashedPassword = await hashPassword(password);

    // Update password and clear reset token
    await getClientsCollection().updateOne(
      { clientId: client.clientId },
      { 
        $set: { 
          password: hashedPassword,
          updatedAt: new Date(),
        },
        $unset: {
          passwordResetToken: '',
          passwordResetExpires: '',
        }
      }
    );

    res.json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user (for checking auth status)
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = req.user!;

    if (user.role === 'client') {
      const client = await clientService.getClientById(user.userId);
      if (!client) {
        return res.status(404).json({ error: 'Client not found' });
      }
      return res.json({
        success: true,
        user: {
          clientId: client.clientId,
          businessName: client.businessName,
          email: client.email,
          role: 'client',
        },
      });
    } else if (user.role === 'admin') {
      const admin = await adminService.getAdminById(user.userId);
      if (!admin) {
        return res.status(404).json({ error: 'Admin not found' });
      }
      return res.json({
        success: true,
        user: {
          adminId: admin._id?.toString(),
          email: admin.email,
          role: admin.role,
        },
      });
    }

    res.status(400).json({ error: 'Invalid user role' });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Client API Routes (protected with JWT)
app.get('/api/client/profile', requireClient, async (req, res) => {
  try {
    const clientId = req.user!.userId; // From JWT token
    const client = await clientService.getClientById(clientId);

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json({
      success: true,
      client: {
        clientId: client.clientId,
        businessName: client.businessName,
        niche: client.niche,
        email: client.email,
        address: client.address,
        socialMedia: client.socialMedia,
        config: client.config,
        subscription: client.subscription,
        faqs: client.faqs,
        createdAt: client.createdAt,
        updatedAt: client.updatedAt,
      },
    });
  } catch (error) {
    console.error('Client profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/client/faqs', requireClient, async (req, res) => {
  try {
    const clientId = req.user!.userId; // From JWT token
    const client = await clientService.getClientById(clientId);

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Get FAQ limit for the client's tier
    const tier = client.subscription.status === 'trial' ? 'trial' : client.subscription.tier;
    const limit = FAQ_LIMITS[tier] || FAQ_LIMITS.starter;

    res.json({
      success: true,
      faqs: client.faqs,
      limit: limit === -1 ? null : limit,
      currentCount: client.faqs?.length || 0,
      tier: tier,
    });
  } catch (error) {
    console.error('Get FAQs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// FAQ limits per subscription tier
const FAQ_LIMITS: Record<string, number> = {
  trial: 20, // Basic limit for trial
  starter: 50,
  professional: 200,
  enterprise: -1, // -1 means unlimited
};

app.put('/api/client/faqs', requireClient, async (req, res) => {
  try {
    const clientId = req.user!.userId; // From JWT token
    const { faqs } = req.body;

    console.log('📝 Update FAQs request:', { clientId, faqsCount: Array.isArray(faqs) ? faqs.length : 0 });

    if (!Array.isArray(faqs)) {
      return res.status(400).json({ error: 'Invalid FAQs format' });
    }

    const client = await clientService.getClientById(clientId);

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Check FAQ limit based on subscription tier
    const tier = client.subscription.status === 'trial' ? 'trial' : client.subscription.tier;
    const limit = FAQ_LIMITS[tier] || FAQ_LIMITS.starter;
    
    if (limit !== -1 && faqs.length > limit) {
      return res.status(403).json({
        error: `FAQ limit exceeded`,
        message: `Your ${tier} plan allows up to ${limit} FAQs. You're trying to add ${faqs.length} FAQs. Please upgrade your plan or reduce the number of FAQs.`,
        currentLimit: limit,
        requestedCount: faqs.length,
        tier: tier,
      });
    }

    console.log('📝 Updating FAQs for client:', client.businessName, 'Current FAQs:', client.faqs.length, 'New FAQs:', faqs.length, `Limit: ${limit === -1 ? 'unlimited' : limit}`);

    const updated = await clientService.updateFAQs(clientId, faqs);

    if (!updated) {
      console.error('❌ Failed to update FAQs - updateClient returned null');
      return res.status(500).json({ error: 'Failed to update FAQs' });
    }

    console.log('✅ FAQs updated successfully. New count:', updated.faqs?.length || 0);

    // Invalidate cache
    cacheService.invalidateByClientId(clientId);
    cacheService.invalidateClient(client.whatsappNumber);

    res.json({
      success: true,
      message: 'FAQs updated successfully',
      faqs: updated.faqs,
      limit: limit === -1 ? null : limit,
      currentCount: updated.faqs?.length || 0,
    });
  } catch (error) {
    console.error('❌ Update FAQs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/client/stats', requireClient, async (req, res) => {
  try {
    const clientId = req.user!.userId; // From JWT token
    const client = await clientService.getClientById(clientId);

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const { getDatabase } = await import('../db/mongodb.js');
    const db = getDatabase();
    const messagesCollection = db.collection('messages');

    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [messages24h, messages7d, messages30d, totalMessages] = await Promise.all([
      messagesCollection.countDocuments({
        clientId,
        timestamp: { $gte: last24Hours },
      }),
      messagesCollection.countDocuments({
        clientId,
        timestamp: { $gte: last7Days },
      }),
      messagesCollection.countDocuments({
        clientId,
        timestamp: { $gte: last30Days },
      }),
      messagesCollection.countDocuments({ clientId }),
    ]);

    const topFAQs = await messagesCollection.aggregate([
      { $match: { clientId, matchedFAQ: { $exists: true, $ne: null } } },
      { $group: { _id: '$matchedFAQ', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]).toArray();

    res.json({
      success: true,
      stats: {
        messages: {
          last24Hours: messages24h,
          last7Days: messages7d,
          last30Days: messages30d,
          total: totalMessages,
        },
        topFAQs: topFAQs.map(faq => ({
          category: faq._id,
          count: faq.count,
        })),
        subscription: {
          status: client.subscription.status,
          tier: client.subscription.tier,
          trialEndDate: client.subscription.trialEndDate,
          subscriptionEndDate: client.subscription.subscriptionEndDate,
        },
        faqs: {
          total: client.faqs.length,
        },
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/client/settings', requireClient, async (req, res) => {
  try {
    const clientId = req.user!.userId; // From JWT token
    const client = await clientService.getClientById(clientId);

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json({
      success: true,
      settings: {
        whatsappNumber: client.whatsappNumber,
        config: client.config,
        address: client.address,
        socialMedia: client.socialMedia,
      },
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/client/settings', requireClient, async (req, res) => {
  try {
    const clientId = req.user!.userId; // From JWT token
    const updates = req.body;
    
    console.log('📝 Update settings request:', { clientId, updates: Object.keys(updates) });

    const client = await clientService.getClientById(clientId);

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const updateData: any = {};
    
    if (updates.config) {
      updateData.config = {
        ...client.config,
        ...updates.config,
      };
    }

    // Update WhatsApp number (format it and validate)
    if (updates.whatsappNumber) {
      let formattedWhatsApp = updates.whatsappNumber.trim();
      if (!formattedWhatsApp.startsWith('+')) {
        if (formattedWhatsApp.startsWith('0')) {
          formattedWhatsApp = '+234' + formattedWhatsApp.substring(1);
        } else if (formattedWhatsApp.startsWith('234')) {
          formattedWhatsApp = '+' + formattedWhatsApp;
        } else {
          formattedWhatsApp = '+234' + formattedWhatsApp;
        }
      }
      
      // Security check: Don't allow change if number is the same
      if (formattedWhatsApp === client.whatsappNumber) {
        // No change needed, skip WhatsApp number update
        console.log('ℹ️ WhatsApp number unchanged, skipping update');
      } else {
        // Security check 1: Check if new number is already in use by another client
        const existingClient = await clientService.getClientByWhatsAppNumber(formattedWhatsApp);
        if (existingClient && existingClient.clientId !== clientId) {
          console.warn('⚠️ WhatsApp number already in use:', formattedWhatsApp);
          return res.status(400).json({ 
            error: 'This WhatsApp number is already registered to another account. Please contact support if you need to change your number.' 
          });
        }
        
        // Security check 2: Prevent abuse during trial period
        // Track original number if not set (first time)
        const originalNumber = client.originalWhatsappNumber || client.whatsappNumber;
        if (!client.originalWhatsappNumber) {
          updateData.originalWhatsappNumber = originalNumber;
        }
        
        // During trial: Allow only 1 change total (for legitimate corrections)
        if (client.subscription.status === 'trial') {
          const changeHistory = client.whatsappNumberChanges || [];
          // If they've already changed from original number, create pending request
          if (changeHistory.length > 0 || client.whatsappNumber !== originalNumber) {
            console.warn('🚫 Trial client attempting to change WhatsApp number again:', client.businessName);
            // Create pending request instead of denying
            await clientService.updateClient(clientId, {
              pendingWhatsappNumberChange: {
                requestedNumber: formattedWhatsApp,
                requestedAt: new Date(),
                reason: updates.reason || 'Trial period - additional change requested',
              },
            });
            return res.status(403).json({ 
              error: 'WhatsApp number changes are limited during trial period. You can change your number once. Your request has been submitted for admin approval. Please contact support if you need immediate assistance.' 
            });
          }
          console.log('⚠️ Trial client changing WhatsApp number (1st change allowed):', client.businessName, 'from', client.whatsappNumber, 'to', formattedWhatsApp);
        } else {
          // For active subscriptions: Allow changes but limit to 1 per month
          const changeHistory = client.whatsappNumberChanges || [];
          const now = new Date();
          const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          
          // Check if they changed in the last month
          const recentChanges = changeHistory.filter(change => new Date(change.changedAt) > oneMonthAgo);
          if (recentChanges.length > 0) {
            console.warn('🚫 Client attempting to change WhatsApp number too frequently:', client.businessName);
            // Create pending request instead of denying
            await clientService.updateClient(clientId, {
              pendingWhatsappNumberChange: {
                requestedNumber: formattedWhatsApp,
                requestedAt: new Date(),
                reason: updates.reason || 'Monthly limit reached - additional change requested',
              },
            });
            return res.status(403).json({ 
              error: 'You can only change your WhatsApp number once per month. Your request has been submitted for admin approval. Please contact support if you need immediate assistance.' 
            });
          }
          console.log('⚠️ Active client changing WhatsApp number:', client.businessName, 'from', client.whatsappNumber, 'to', formattedWhatsApp);
        }
        
        // Track the change
        const changeHistory = client.whatsappNumberChanges || [];
        changeHistory.push({
          from: client.whatsappNumber,
          to: formattedWhatsApp,
          changedAt: new Date(),
        });
        updateData.whatsappNumberChanges = changeHistory;
        updateData.whatsappNumber = formattedWhatsApp;
        
        // Invalidate old WhatsApp number cache
        if (client.whatsappNumber) {
          cacheService.invalidateClient(client.whatsappNumber);
        }
      }
    }

    if (updates.address !== undefined) {
      updateData.address = updates.address;
    }

    if (updates.socialMedia) {
      updateData.socialMedia = {
        ...client.socialMedia,
        ...updates.socialMedia,
      };
    }

    console.log('📝 Updating settings for client:', client.businessName, 'Update data:', updateData);

    const updated = await clientService.updateClient(clientId, updateData);

    if (!updated) {
      console.error('❌ Failed to update settings - updateClient returned null');
      return res.status(500).json({ error: 'Failed to update settings' });
    }

    console.log('✅ Settings updated successfully');

    // Invalidate cache
    cacheService.invalidateByClientId(clientId);
    if (updated.whatsappNumber) {
      cacheService.invalidateClient(updated.whatsappNumber);
    }

    res.json({
      success: true,
      message: 'Settings updated successfully',
      settings: {
        config: updated.config,
        address: updated.address,
        socialMedia: updated.socialMedia,
      },
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Admin API Endpoints ---

// Legacy admin auth (for backward compatibility - will be removed)
const legacyAdminAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const headerToken = req.headers['x-admin-token'];
  const queryToken = req.query.token;
  const adminToken = (typeof headerToken === 'string' ? headerToken : null) || 
                     (typeof queryToken === 'string' ? queryToken : null);
  const expectedToken = process.env.ADMIN_TOKEN || 'admin-secret-token-change-in-production';
  
  if (!adminToken || adminToken !== expectedToken) {
    return res.status(401).json({ error: 'Unauthorized: Invalid admin token' });
  }
  
  next();
};

// Get all clients (admin only) - supports both JWT and legacy token
app.get('/api/admin/clients', requireAdmin, async (req, res) => {
  try {
    const { status, tier, search } = req.query;
    
    const query: any = {};
    if (status) {
      query['subscription.status'] = status;
    }
    if (tier) {
      query['subscription.tier'] = tier;
    }
    if (search) {
      query.$or = [
        { businessName: { $regex: search as string, $options: 'i' } },
        { email: { $regex: search as string, $options: 'i' } },
        { whatsappNumber: { $regex: search as string, $options: 'i' } },
      ];
    }
    
    const clients = await getClientsCollection().find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();
    
    res.json({
      success: true,
      clients: clients.map(client => ({
        clientId: client.clientId,
        businessName: client.businessName,
        niche: client.niche,
        email: client.email,
        whatsappNumber: client.whatsappNumber,
        subscription: client.subscription,
        faqsCount: client.faqs?.length || 0,
        createdAt: client.createdAt,
        updatedAt: client.updatedAt,
      })),
      total: clients.length,
    });
  } catch (error) {
    console.error('Admin clients error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get client details (admin only)
app.get('/api/admin/client/:clientId', requireAdmin, async (req, res) => {
  try {
    const clientId = typeof req.params.clientId === 'string' ? req.params.clientId : req.params.clientId[0];
    const client = await clientService.getClientById(clientId);
    
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    res.json({
      success: true,
      client: {
        ...client,
        faqsCount: client.faqs?.length || 0,
      },
    });
  } catch (error) {
    console.error('Admin client details error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update client information (admin only)
app.put('/api/admin/client/:clientId', requireAdmin, async (req, res) => {
  try {
    const clientId = typeof req.params.clientId === 'string' ? req.params.clientId : req.params.clientId[0];
    const updates = req.body;
    
    const client = await clientService.getClientById(clientId);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const updateData: any = {};

    // Update business name
    if (updates.businessName) {
      updateData.businessName = updates.businessName;
      // Update slug if business name changes
      const slug = updates.businessName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') + `-${Date.now()}`;
      updateData.slug = slug;
    }

    // Update niche
    if (updates.niche) {
      updateData.niche = updates.niche;
    }

    // Update WhatsApp number (format it)
    if (updates.whatsappNumber) {
      let formattedWhatsApp = updates.whatsappNumber.trim();
      if (!formattedWhatsApp.startsWith('+')) {
        if (formattedWhatsApp.startsWith('0')) {
          formattedWhatsApp = '+234' + formattedWhatsApp.substring(1);
        } else if (formattedWhatsApp.startsWith('234')) {
          formattedWhatsApp = '+' + formattedWhatsApp;
        } else {
          formattedWhatsApp = '+234' + formattedWhatsApp;
        }
      }
      updateData.whatsappNumber = formattedWhatsApp;
    }

    // Update email
    if (updates.email) {
      updateData.email = updates.email.toLowerCase().trim();
    }

    // Update address
    if (updates.address !== undefined) {
      updateData.address = updates.address;
    }

    // Update social media
    if (updates.socialMedia) {
      updateData.socialMedia = {
        ...client.socialMedia,
        ...updates.socialMedia,
      };
    }

    // Update subscription tier
    if (updates.subscriptionTier) {
      updateData.subscription = {
        ...client.subscription,
        tier: updates.subscriptionTier,
      };
    }

    const updated = await clientService.updateClient(clientId, updateData);

    if (!updated) {
      return res.status(500).json({ error: 'Failed to update client' });
    }

    // Invalidate cache
    cacheService.invalidateByClientId(clientId);
    if (updateData.whatsappNumber) {
      cacheService.invalidateClient(updateData.whatsappNumber);
    }

    res.json({
      success: true,
      message: 'Client updated successfully',
      client: updated,
    });
  } catch (error: any) {
    console.error('Admin update client error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Update client subscription (admin only)
app.put('/api/admin/client/:clientId/subscription', requireAdmin, async (req, res) => {
  try {
    const clientId = typeof req.params.clientId === 'string' ? req.params.clientId : req.params.clientId[0];
    const { status, tier, months } = req.body;
    
    const client = await clientService.getClientById(clientId);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    if (status === 'active' && months) {
      // Extend subscription
      await subscriptionService.extendSubscription(clientId, months);
    } else if (status) {
      // Update status
      await clientService.updateSubscriptionStatus(clientId, status);
    }
    
    if (tier) {
      await clientService.updateClient(clientId, {
        subscription: {
          ...client.subscription,
          tier,
        },
      });
    }
    
    const updated = await clientService.getClientById(clientId);
    res.json({
      success: true,
      message: 'Subscription updated successfully',
      client: updated,
    });
  } catch (error) {
    console.error('Admin subscription update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get pending WhatsApp number change requests (admin only)
app.get('/api/admin/pending-number-changes', requireAdmin, async (req, res) => {
  try {
    const { getClientsCollection } = await import('../db/mongodb.js');
    const collection = getClientsCollection();
    
    // Find all clients with pending WhatsApp number change requests
    // Using a type assertion to handle MongoDB query types
    const clients = await collection.find({
      pendingWhatsappNumberChange: { $exists: true, $ne: null }
    } as any).toArray();
    
    const pendingRequests = clients.map(client => ({
      clientId: client.clientId,
      businessName: client.businessName,
      email: client.email,
      currentNumber: client.whatsappNumber,
      requestedNumber: client.pendingWhatsappNumberChange?.requestedNumber,
      requestedAt: client.pendingWhatsappNumberChange?.requestedAt,
      reason: client.pendingWhatsappNumberChange?.reason,
      subscription: {
        status: client.subscription?.status,
        tier: client.subscription?.tier,
      },
    }));
    
    res.json({
      success: true,
      requests: pendingRequests,
      count: pendingRequests.length,
    });
  } catch (error) {
    console.error('Get pending number changes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Approve WhatsApp number change request (admin only)
app.post('/api/admin/pending-number-changes/:clientId/approve', requireAdmin, async (req, res) => {
  try {
    const clientId = typeof req.params.clientId === 'string' ? req.params.clientId : req.params.clientId[0];
    const client = await clientService.getClientById(clientId);
    
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    if (!client.pendingWhatsappNumberChange) {
      return res.status(400).json({ error: 'No pending request found for this client' });
    }
    
    const newNumber = client.pendingWhatsappNumberChange.requestedNumber;
    const oldNumber = client.whatsappNumber;
    
    // Check if new number is already in use
    const existingClient = await clientService.getClientByWhatsAppNumber(newNumber);
    if (existingClient && existingClient.clientId !== clientId) {
      return res.status(400).json({ 
        error: 'This WhatsApp number is already registered to another account.' 
      });
    }
    
    // Track the change
    const changeHistory = client.whatsappNumberChanges || [];
    changeHistory.push({
      from: oldNumber,
      to: newNumber,
      changedAt: new Date(),
    });
    
    // Update client with new number and clear pending request
    const updated = await clientService.updateClient(clientId, {
      whatsappNumber: newNumber,
      whatsappNumberChanges: changeHistory,
      pendingWhatsappNumberChange: undefined, // Remove pending request
    });
    
    if (!updated) {
      return res.status(500).json({ error: 'Failed to update client' });
    }
    
    // Invalidate cache for both old and new numbers
    cacheService.invalidateClient(oldNumber);
    cacheService.invalidateClient(newNumber);
    cacheService.invalidateByClientId(clientId);
    
    console.log(`✅ Admin approved WhatsApp number change for ${client.businessName}: ${oldNumber} → ${newNumber}`);
    
    res.json({
      success: true,
      message: 'WhatsApp number change approved successfully',
      client: {
        clientId: updated.clientId,
        businessName: updated.businessName,
        whatsappNumber: updated.whatsappNumber,
      },
    });
  } catch (error) {
    console.error('Approve number change error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Decline WhatsApp number change request (admin only)
app.post('/api/admin/pending-number-changes/:clientId/decline', requireAdmin, async (req, res) => {
  try {
    const clientId = typeof req.params.clientId === 'string' ? req.params.clientId : req.params.clientId[0];
    const { reason } = req.body; // Optional decline reason
    
    const client = await clientService.getClientById(clientId);
    
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    if (!client.pendingWhatsappNumberChange) {
      return res.status(400).json({ error: 'No pending request found for this client' });
    }
    
    // Remove pending request
    const updated = await clientService.updateClient(clientId, {
      pendingWhatsappNumberChange: undefined,
    });
    
    if (!updated) {
      return res.status(500).json({ error: 'Failed to update client' });
    }
    
    console.log(`❌ Admin declined WhatsApp number change for ${client.businessName}. Reason: ${reason || 'Not specified'}`);
    
    res.json({
      success: true,
      message: 'WhatsApp number change request declined',
      client: {
        clientId: updated.clientId,
        businessName: updated.businessName,
        whatsappNumber: updated.whatsappNumber,
      },
    });
  } catch (error) {
    console.error('Decline number change error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new client (admin only)
app.post('/api/admin/clients', requireAdmin, async (req, res) => {
  try {
    const {
      businessName,
      niche,
      whatsappNumber,
      email,
      address,
      socialMedia,
      subscriptionTier = 'trial',
    } = req.body;

    // Validate required fields
    if (!businessName || !niche || !whatsappNumber || !email) {
      return res.status(400).json({
        error: 'Missing required fields: businessName, niche, whatsappNumber, email',
      });
    }

    // Format WhatsApp number
    let formattedWhatsApp = whatsappNumber.trim();
    if (!formattedWhatsApp.startsWith('+')) {
      // Assume Nigerian number, add +234
      if (formattedWhatsApp.startsWith('0')) {
        formattedWhatsApp = '+234' + formattedWhatsApp.substring(1);
      } else if (formattedWhatsApp.startsWith('234')) {
        formattedWhatsApp = '+' + formattedWhatsApp;
      } else {
        formattedWhatsApp = '+234' + formattedWhatsApp;
      }
    }

    // Check if client already exists
    const existing = await clientService.getClientByWhatsAppNumber(formattedWhatsApp);
    if (existing) {
      return res.status(409).json({
        error: 'Client with this WhatsApp number already exists',
      });
    }

    // Generate clientId and slug
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 11);
    const clientId = `client_${timestamp}_${random}`;
    const slug = businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') + `-${timestamp}`;

    // Generate password reset token for initial password setup
    const crypto = await import('crypto');
    const passwordResetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Load FAQ template based on niche
    const { loadFAQTemplate, customizeFAQs } = await import('../utils/faq-templates.js');
    const templateFAQs = loadFAQTemplate(niche as any);
    const customizedFAQs = customizeFAQs(templateFAQs, businessName, address, socialMedia);

    // Create client
    const clientData: Omit<import('../models/client.js').Client, '_id' | 'createdAt' | 'updatedAt'> = {
      clientId,
      businessName,
      slug,
      niche: niche as any,
      whatsappNumber: formattedWhatsApp,
      email: email.toLowerCase().trim(),
      address,
      socialMedia: socialMedia || {},
      faqs: customizedFAQs,
      config: {
        businessHours: {
          start: 9,
          end: 17,
        },
        timezone: 'Africa/Lagos',
        afterHoursMessage: 'Thanks for your message! We\'re currently closed (9am-5pm WAT). We\'ll reply first thing tomorrow. 😊',
        adminNumbers: [formattedWhatsApp], // Client's own number as admin
      },
      subscription: {
        status: 'trial',
        tier: subscriptionTier || 'trial',
        trialStartDate: new Date(),
        trialEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
      passwordResetToken,
      passwordResetExpires,
    };

    const client = await clientService.createClient(clientData);

    // Invalidate cache
    cacheService.invalidateClient(formattedWhatsApp);

    res.status(201).json({
      success: true,
      message: 'Client created successfully',
      client: {
        clientId: client.clientId,
        businessName: client.businessName,
        email: client.email,
        whatsappNumber: client.whatsappNumber,
        niche: client.niche,
        subscription: client.subscription,
        faqsCount: client.faqs.length,
      },
    });
  } catch (error: any) {
    console.error('Admin create client error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Generate payment link for subscription upgrade (client only)
app.post('/api/client/payment-link', requireClient, async (req, res) => {
  try {
    const clientId = req.user!.userId;
    const { tier } = req.body;

    if (!tier || !['starter', 'professional', 'enterprise'].includes(tier)) {
      return res.status(400).json({ error: 'Invalid tier. Must be starter, professional, or enterprise' });
    }

    const client = await clientService.getClientById(clientId);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Generate payment link
    const paymentLink = await subscriptionService.generatePaymentLink(clientId, tier as any);

    res.json({
      success: true,
      paymentLink,
      tier,
      amount: paymentService.getTierPricing(tier as any),
    });
  } catch (error: any) {
    console.error('Payment link generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate payment link' });
  }
});

// Verify payment from callback (client only)
app.post('/api/payment/verify', requireClient, async (req, res) => {
  try {
    const clientId = req.user!.userId;
    const { reference } = req.body;

    if (!reference) {
      return res.status(400).json({ error: 'Missing payment reference' });
    }

    const client = await clientService.getClientById(clientId);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Verify payment with Paystack
    const verification = await paymentService.verifyPayment(reference);

    if (!verification.success) {
      return res.status(400).json({
        success: false,
        error: verification.message || 'Payment verification failed',
      });
    }

    // Check if payment was already processed (to avoid duplicate processing)
    // The webhook should have already processed it, but we verify here for the callback
    const paymentAlreadyProcessed = client.subscription?.lastPaymentDate && 
      new Date(client.subscription.lastPaymentDate).getTime() > Date.now() - 60000; // Within last minute

    if (paymentAlreadyProcessed) {
      // Payment already processed, just return success
      return res.json({
        success: true,
        message: 'Payment already processed. Your subscription is active.',
        tier: client.subscription.tier,
      });
    }

    // Get tier from Paystack transaction metadata
    // The payment link includes tier in metadata, so we need to fetch it from Paystack
    let tier: string | undefined;
    
    try {
      // Fetch transaction details from Paystack to get metadata
      const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY || ''}`,
        },
      });
      
      const paystackData = await paystackResponse.json() as {
        status: boolean;
        data?: {
          metadata?: {
            tier?: string;
            clientId?: string;
          };
        };
      };
      
      if (paystackData.status && paystackData.data?.metadata?.tier) {
        tier = paystackData.data.metadata.tier;
      } else {
        // Fallback: if webhook already processed it, use current tier
        // Otherwise, we can't determine the tier from callback alone
        console.warn(chalk.yellow(`⚠️  Could not extract tier from payment metadata for reference: ${reference}`));
        tier = client.subscription.tier; // Keep current tier as fallback
      }
    } catch (err) {
      console.error('Error fetching Paystack transaction metadata:', err);
      tier = client.subscription.tier; // Fallback to current tier
    }

    // If payment is successful and not already processed, activate subscription
    // Note: The webhook should handle this, but we do it here as a backup
    if (verification.status === 'success' && tier && tier !== client.subscription.tier) {
      const now = new Date();
      const subscriptionEndDate = new Date(now);
      subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);

      await clientService.updateClient(clientId, {
        subscription: {
          ...client.subscription,
          status: 'active',
          tier: tier as any,
          subscriptionStartDate: now,
          subscriptionEndDate,
          lastPaymentDate: now,
          paymentMethod: 'card',
        },
      });

      // Record transaction if not already recorded by webhook
      const transactionsCollection = getTransactionsCollection();
      const existingTransaction = await transactionsCollection.findOne({ reference });
      
      if (!existingTransaction) {
        const transaction: Omit<Transaction, '_id'> = {
          transactionId: `TXN_${clientId}_${Date.now()}`,
          clientId,
          reference,
          amount: verification.amount || 0,
          currency: 'NGN',
          status: 'success',
          tier: tier as any,
          paymentMethod: 'card',
          createdAt: now,
          updatedAt: now,
          processedAt: now,
        };
        
        await transactionsCollection.insertOne(transaction as Transaction);
        console.log(chalk.blue(`💰 Transaction recorded: ${reference} - ₦${(transaction.amount / 100).toLocaleString()}`));
      }

      // Invalidate cache
      cacheService.invalidateByClientId(clientId);
      cacheService.invalidateClient(client.whatsappNumber);

      console.log(chalk.green(`✅ Payment verified and subscription activated for client: ${client.businessName} (${clientId}) - Tier: ${tier}`));
    } else if (verification.status === 'success') {
      // Payment successful but tier already matches or couldn't be determined
      console.log(chalk.blue(`ℹ️  Payment verified for client: ${client.businessName} (${clientId}) - Subscription already active or tier unchanged`));
    }

    // Get updated client to return latest subscription info
    const updatedClient = await clientService.getClientById(clientId);
    
    res.json({
      success: true,
      message: 'Payment verified successfully. Your subscription has been activated.',
      tier: updatedClient?.subscription?.tier || tier || client.subscription.tier,
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: error.message || 'Failed to verify payment' });
  }
});

// Get transactions (admin only)
app.get('/api/admin/transactions', requireAdmin, async (req, res) => {
  try {
    const { clientId, status, limit = '50', page = '1' } = req.query;
    const transactionsCollection = getTransactionsCollection();
    
    const query: any = {};
    if (clientId) {
      query.clientId = clientId;
    }
    if (status) {
      query.status = status;
    }
    
    const limitNum = parseInt(limit as string, 10);
    const pageNum = parseInt(page as string, 10);
    const skip = (pageNum - 1) * limitNum;
    
    const [transactions, total] = await Promise.all([
      transactionsCollection
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .toArray(),
      transactionsCollection.countDocuments(query),
    ]);
    
    // Get client names for display
    const clientIds = [...new Set(transactions.map(t => t.clientId))];
    const clients = await Promise.all(
      clientIds.map(id => clientService.getClientById(id))
    );
    const clientMap = new Map(clients.filter(c => c).map(c => [c!.clientId, c!]));
    
    res.json({
      success: true,
      transactions: transactions.map(t => ({
        ...t,
        clientName: clientMap.get(t.clientId)?.businessName || 'Unknown',
      })),
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Admin transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get transaction statistics (admin only)
app.get('/api/admin/transactions/stats', requireAdmin, async (req, res) => {
  try {
    const transactionsCollection = getTransactionsCollection();
    
    const [
      totalTransactions,
      successfulTransactions,
      revenueByTier,
    ] = await Promise.all([
      transactionsCollection.countDocuments(),
      transactionsCollection.countDocuments({ status: 'success' }),
      transactionsCollection.aggregate([
        { $match: { status: 'success' } },
        { $group: { _id: '$tier', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]).toArray(),
    ]);
    
    const totalRevenue = revenueByTier.reduce((sum, item) => sum + item.total, 0);
    
    res.json({
      success: true,
      stats: {
        total: totalTransactions,
        successful: successfulTransactions,
        failed: totalTransactions - successfulTransactions,
        totalRevenue,
        totalRevenueNaira: (totalRevenue / 100).toFixed(2),
        revenueByTier: revenueByTier.reduce((acc: any, item: any) => {
          acc[item._id] = {
            amount: item.total,
            count: item.count,
            naira: (item.total / 100).toFixed(2),
          };
          return acc;
        }, {}),
      },
    });
  } catch (error) {
    console.error('Admin transaction stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get transactions (admin only)
app.get('/api/admin/transactions', requireAdmin, async (req, res) => {
  try {
    const { clientId, status, limit = '50', page = '1' } = req.query;
    const transactionsCollection = getTransactionsCollection();
    
    const query: any = {};
    if (clientId) {
      query.clientId = clientId;
    }
    if (status) {
      query.status = status;
    }
    
    const limitNum = parseInt(limit as string, 10);
    const pageNum = parseInt(page as string, 10);
    const skip = (pageNum - 1) * limitNum;
    
    const [transactions, total] = await Promise.all([
      transactionsCollection
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .toArray(),
      transactionsCollection.countDocuments(query),
    ]);
    
    // Get client names for display
    const clientIds = [...new Set(transactions.map(t => t.clientId))];
    const clients = await Promise.all(
      clientIds.map(id => clientService.getClientById(id))
    );
    const clientMap = new Map(clients.filter(c => c).map(c => [c!.clientId, c!]));
    
    res.json({
      success: true,
      transactions: transactions.map(t => ({
        ...t,
        clientName: clientMap.get(t.clientId)?.businessName || 'Unknown',
      })),
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Admin transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get transaction statistics (admin only)
app.get('/api/admin/transactions/stats', requireAdmin, async (req, res) => {
  try {
    const transactionsCollection = getTransactionsCollection();
    
    const [
      totalTransactions,
      successfulTransactions,
      revenueByTier,
    ] = await Promise.all([
      transactionsCollection.countDocuments(),
      transactionsCollection.countDocuments({ status: 'success' }),
      transactionsCollection.aggregate([
        { $match: { status: 'success' } },
        { $group: { _id: '$tier', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]).toArray(),
    ]);
    
    const totalRevenue = revenueByTier.reduce((sum, item) => sum + item.total, 0);
    
    res.json({
      success: true,
      stats: {
        total: totalTransactions,
        successful: successfulTransactions,
        failed: totalTransactions - successfulTransactions,
        totalRevenue,
        totalRevenueNaira: (totalRevenue / 100).toFixed(2),
        revenueByTier: revenueByTier.reduce((acc: any, item: any) => {
          acc[item._id] = {
            amount: item.total,
            count: item.count,
            naira: (item.total / 100).toFixed(2),
          };
          return acc;
        }, {}),
      },
    });
  } catch (error) {
    console.error('Admin transaction stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get platform stats (admin only)
app.get('/api/admin/stats', requireAdmin, async (req, res) => {
  try {
    const db = getDatabase();
    const clientsCollection = getClientsCollection();
    const messagesCollection = db.collection('messages');
    
    const [
      totalClients,
      activeClients,
      trialClients,
      expiredClients,
      totalMessages,
      messagesLast24h,
      clientsByTier,
    ] = await Promise.all([
      clientsCollection.countDocuments(),
      clientsCollection.countDocuments({ 'subscription.status': 'active' }),
      clientsCollection.countDocuments({ 'subscription.status': 'trial' }),
      clientsCollection.countDocuments({ 'subscription.status': 'expired' }),
      messagesCollection.countDocuments(),
      messagesCollection.countDocuments({
        timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      }),
      clientsCollection.aggregate([
        { $group: { _id: '$subscription.tier', count: { $sum: 1 } } },
      ]).toArray(),
    ]);
    
    res.json({
      success: true,
      stats: {
        clients: {
          total: totalClients,
          active: activeClients,
          trial: trialClients,
          expired: expiredClients,
        },
        messages: {
          total: totalMessages,
          last24h: messagesLast24h,
        },
        tiers: clientsByTier.reduce((acc: any, item: any) => {
          acc[item._id || 'unknown'] = item.count;
          return acc;
        }, {}),
      },
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export async function startAPIServer(): Promise<void> {
  await connectToMongoDB();
  
  app.listen(PORT, () => {
    console.log(chalk.blue('\n🌐 Starting API Server...\n'));
    console.log(chalk.green(`✅ API Server running on port ${PORT}`));
    console.log(chalk.cyan(`   Health Check: http://localhost:${PORT}/health`));
    console.log(chalk.cyan(`   Client API: http://localhost:${PORT}/api/client/*`));
    console.log(chalk.cyan(`   Admin API: http://localhost:${PORT}/api/admin/*`));
    console.log(chalk.gray(`   Press Ctrl+C to stop\n`));
  });
}

// Export app for testing
export { app };

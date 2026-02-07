/**
 * Authentication middleware for Express routes
 */

import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt.js';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * Middleware to verify JWT token from cookie or Authorization header
 */
export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  // Try to get token from cookie first
  let token = req.cookies?.accessToken;

  // Fallback to Authorization header
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  // Fallback to query parameter (for backward compatibility)
  if (!token) {
    token = typeof req.query.token === 'string' ? req.query.token : undefined;
  }

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const payload = verifyAccessToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  // Attach user to request
  req.user = payload;
  next();
}

/**
 * Middleware to verify admin role
 * Supports both JWT tokens and legacy admin token (for backward compatibility)
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  // Try JWT authentication first
  const token = req.cookies?.accessToken || 
                (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.substring(7) : null) ||
                (typeof req.query.token === 'string' ? req.query.token : null);

  if (token) {
    const payload = verifyAccessToken(token);
    if (payload && payload.role === 'admin') {
      req.user = payload;
      return next();
    }
  }

  // Fallback to legacy admin token (for backward compatibility)
  const headerToken = req.headers['x-admin-token'];
  const queryToken = req.query.token;
  const adminToken = (typeof headerToken === 'string' ? headerToken : null) || 
                     (typeof queryToken === 'string' ? queryToken : null);
  const expectedToken = process.env.ADMIN_TOKEN || 'admin-secret-token-change-in-production';
  
  if (adminToken && adminToken === expectedToken) {
    // Create a temporary user object for legacy token
    req.user = {
      userId: 'legacy-admin',
      email: 'legacy@admin.com',
      role: 'admin',
      type: 'access',
    };
    return next();
  }

  return res.status(401).json({ error: 'Admin access required' });
}

/**
 * Middleware to verify client role
 */
export function requireClient(req: Request, res: Response, next: NextFunction) {
  authenticateToken(req, res, () => {
    if (req.user?.role !== 'client') {
      return res.status(403).json({ error: 'Client access required' });
    }
    next();
  });
}

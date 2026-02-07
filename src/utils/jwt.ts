/**
 * JWT token utilities
 * Handles token generation, verification, and refresh
 */

import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-in-production';
const JWT_ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || '15m'; // 15 minutes
const JWT_REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES || '7d'; // 7 days

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'client' | 'admin';
  type: 'access' | 'refresh';
}

/**
 * Generate access token (short-lived)
 */
export function generateAccessToken(payload: Omit<TokenPayload, 'type'>): string {
  return jwt.sign(
    { ...payload, type: 'access' },
    JWT_SECRET,
    { expiresIn: JWT_ACCESS_EXPIRES }
  );
}

/**
 * Generate refresh token (long-lived)
 */
export function generateRefreshToken(payload: Omit<TokenPayload, 'type'>): string {
  return jwt.sign(
    { ...payload, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRES }
  );
}

/**
 * Verify and decode a token
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Verify access token specifically
 */
export function verifyAccessToken(token: string): TokenPayload | null {
  const payload = verifyToken(token);
  if (payload && payload.type === 'access') {
    return payload;
  }
  return null;
}

/**
 * Verify refresh token specifically
 */
export function verifyRefreshToken(token: string): TokenPayload | null {
  const payload = verifyToken(token);
  if (payload && payload.type === 'refresh') {
    return payload;
  }
  return null;
}

/**
 * Generate both access and refresh tokens
 */
export function generateTokenPair(payload: Omit<TokenPayload, 'type'>): {
  accessToken: string;
  refreshToken: string;
} {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
}

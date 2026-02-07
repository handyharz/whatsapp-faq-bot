/**
 * Admin model for authentication
 */

export type AdminRole = 'admin' | 'super_admin';

export interface Admin {
  _id?: string;
  email: string; // Unique
  password: string; // Hashed
  role: AdminRole;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

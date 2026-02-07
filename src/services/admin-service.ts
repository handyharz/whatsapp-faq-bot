/**
 * Admin service for managing admin accounts
 */

import { ObjectId } from 'mongodb';
import { getDatabase } from '../db/mongodb.js';
import { Admin } from '../models/admin.js';
import { hashPassword, verifyPassword } from '../utils/password.js';

export class AdminService {
  private getAdminsCollection() {
    return getDatabase().collection<Admin>('admins');
  }

  /**
   * Get admin by email
   */
  async getAdminByEmail(email: string): Promise<Admin | null> {
    const collection = this.getAdminsCollection();
    const result = await collection.findOne({ email: email.toLowerCase() });
    if (!result) return null;
    return {
      ...result,
      _id: result._id.toString(),
    };
  }

  /**
   * Get admin by ID
   */
  async getAdminById(id: string): Promise<Admin | null> {
    const collection = this.getAdminsCollection();
    try {
      const objectId = new ObjectId(id);
      const result = await collection.findOne({ _id: objectId } as any);
      if (!result) return null;
      return {
        ...result,
        _id: result._id.toString(),
      };
    } catch {
      return null;
    }
  }

  /**
   * Create new admin
   */
  async createAdmin(
    email: string,
    password: string,
    role: Admin['role'] = 'admin'
  ): Promise<Admin> {
    const collection = this.getAdminsCollection();
    
    // Check if admin already exists
    const existing = await this.getAdminByEmail(email);
    if (existing) {
      throw new Error('Admin with this email already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    const now = new Date();
    const admin: Admin = {
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(admin as any);
    return { ...admin, _id: result.insertedId.toString() };
  }

  /**
   * Verify admin credentials
   */
  async verifyCredentials(email: string, password: string): Promise<Admin | null> {
    try {
      const admin = await this.getAdminByEmail(email);
      if (!admin) {
        console.log('❌ Admin not found:', email);
        return null;
      }

      console.log('🔍 Admin found, verifying password...');
      const isValid = await verifyPassword(password, admin.password);
      if (!isValid) {
        console.log('❌ Password verification failed');
        return null;
      }

      console.log('✅ Password verified');
      // Update last login
      if (admin._id) {
        await this.updateLastLogin(admin._id);
      }

      return admin;
    } catch (error: any) {
      console.error('❌ Error verifying credentials:', error);
      throw error;
    }
  }

  /**
   * Update admin password
   */
  async updatePassword(adminId: string, newPassword: string): Promise<Admin | null> {
    const collection = this.getAdminsCollection();
    const hashedPassword = await hashPassword(newPassword);

    try {
      const objectId = new ObjectId(adminId);
      const result = await collection.findOneAndUpdate(
        { _id: objectId } as any,
        {
          $set: {
            password: hashedPassword,
            updatedAt: new Date(),
          },
        },
        { returnDocument: 'after' }
      );

      if (!result) return null;
      return {
        ...result,
        _id: result._id.toString(),
      };
    } catch {
      return null;
    }
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(adminId: string): Promise<void> {
    const collection = this.getAdminsCollection();
    try {
      const objectId = new ObjectId(adminId);
      await collection.updateOne(
        { _id: objectId } as any,
        {
          $set: {
            lastLoginAt: new Date(),
          },
        }
      );
    } catch (error) {
      console.error('Error updating last login:', error);
      // Don't throw - this is not critical
    }
  }

  /**
   * List all admins
   */
  async listAdmins(): Promise<Admin[]> {
    const collection = this.getAdminsCollection();
    const results = await collection.find({}).toArray();
    return results.map(admin => ({
      ...admin,
      _id: admin._id.toString(),
    }));
  }
}

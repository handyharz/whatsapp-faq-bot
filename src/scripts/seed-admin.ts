/**
 * Seed initial admin account
 * Run: tsx src/scripts/seed-admin.ts
 */

import * as dotenv from 'dotenv';
import { connectToMongoDB } from '../db/mongodb.js';
import { AdminService } from '../services/admin-service.js';

dotenv.config();

async function seedAdmin() {
  try {
    const email = process.env.ADMIN_EMAIL || 'admin@exonec.com';
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    const role = (process.env.ADMIN_ROLE || 'admin') as 'admin' | 'super_admin';

    console.log('🌱 Seeding admin account...');
    console.log(`Email: ${email}`);
    console.log(`Role: ${role}`);
    console.log(`Password: ${password ? '***' : 'NOT SET'}`);

    if (!password || password === 'admin123') {
      console.warn('⚠️  WARNING: Using default password "admin123". Please set ADMIN_PASSWORD in .env');
    }

    // Connect to MongoDB
    await connectToMongoDB();

    const adminService = new AdminService();

    // Check if admin already exists
    const existing = await adminService.getAdminByEmail(email);
    if (existing) {
      console.log('⚠️  Admin already exists. Updating password...');
      const updated = await adminService.updatePassword(existing._id!, password);
      if (updated) {
        console.log('✅ Admin password updated successfully!');
        console.log(`Admin ID: ${updated._id}`);
        console.log(`Email: ${updated.email}`);
        
        // Verify the password was set correctly
        console.log('🔍 Verifying password...');
        const verified = await adminService.verifyCredentials(email, password);
        if (verified) {
          console.log('✅ Password verification successful!');
        } else {
          console.error('❌ Password verification failed after update!');
          process.exit(1);
        }
      } else {
        console.error('❌ Failed to update password');
        process.exit(1);
      }
      process.exit(0);
    }

    // Create admin
    const admin = await adminService.createAdmin(email, password, role);
    console.log('✅ Admin created successfully!');
    console.log(`Admin ID: ${admin._id}`);
    console.log(`Email: ${admin.email}`);
    console.log(`Role: ${admin.role}`);
    
    // Verify the password was set correctly
    console.log('🔍 Verifying password...');
    const verified = await adminService.verifyCredentials(email, password);
    if (verified) {
      console.log('✅ Password verification successful!');
    } else {
      console.error('❌ Password verification failed after creation!');
      process.exit(1);
    }
    
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error seeding admin:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

seedAdmin();

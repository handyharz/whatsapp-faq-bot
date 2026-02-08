import { ObjectId } from 'mongodb';
import { getWorkspacesCollection } from '../db/mongodb.js';
import { Workspace } from '../models/workspace.js';
import { normalizePhoneNumber } from '../utils/phone-normalizer.js';
import chalk from 'chalk';

export class WorkspaceService {
  /**
   * Get workspace by workspaceId
   */
  async getWorkspaceById(workspaceId: string): Promise<Workspace | null> {
    const collection = getWorkspacesCollection();
    const workspace = await collection.findOne({ workspaceId });
    return workspace;
  }

  /**
   * Get workspace by phone number
   * Checks all phoneNumbers in the array
   */
  async getWorkspaceByPhoneNumber(phoneNumber: string): Promise<Workspace | null> {
    const collection = getWorkspacesCollection();
    
    // Normalize the phone number for matching
    const normalized = normalizePhoneNumber(phoneNumber);
    
    // Find workspace that has this phone number in its phoneNumbers array
    const workspace = await collection.findOne({
      phoneNumbers: normalized
    });
    
    return workspace;
  }

  /**
   * Get workspace by clientId (for backward compatibility during migration)
   */
  async getWorkspaceByClientId(clientId: string): Promise<Workspace | null> {
    const collection = getWorkspacesCollection();
    const workspace = await collection.findOne({ clientId });
    return workspace;
  }

  /**
   * Get workspace by email
   */
  async getWorkspaceByEmail(email: string): Promise<Workspace | null> {
    const collection = getWorkspacesCollection();
    const workspace = await collection.findOne({ email: email.toLowerCase() });
    return workspace;
  }

  /**
   * Check if phone number is globally unique (not used by any workspace)
   * CRITICAL: Prevents conversation ownership disputes and legal issues
   */
  async isPhoneNumberGloballyUnique(phoneNumber: string, excludeWorkspaceId?: string): Promise<boolean> {
    const normalized = normalizePhoneNumber(phoneNumber);
    const collection = getWorkspacesCollection();
    
    // Check if any workspace (except the one we're updating) has this number
    const query: any = { phoneNumbers: normalized };
    if (excludeWorkspaceId) {
      query.workspaceId = { $ne: excludeWorkspaceId };
    }
    
    const count = await collection.countDocuments(query);
    return count === 0;
  }

  /**
   * Create new workspace
   */
  async createWorkspace(
    workspaceData: Omit<Workspace, '_id' | 'createdAt' | 'updatedAt'>
  ): Promise<Workspace> {
    const collection = getWorkspacesCollection();
    
    const now = new Date();
    
    // Normalize all phone numbers
    const normalizedPhones = workspaceData.phoneNumbers.map(phone => 
      normalizePhoneNumber(phone)
    );
    
    // CRITICAL: Check global uniqueness of all phone numbers
    for (const phone of normalizedPhones) {
      const isUnique = await this.isPhoneNumberGloballyUnique(phone);
      if (!isUnique) {
        throw new Error(`Phone number ${phone} is already registered to another workspace. Phone numbers must be globally unique.`);
      }
    }
    
    const workspace: Workspace = {
      ...workspaceData,
      phoneNumbers: normalizedPhones,
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(workspace as any);
    return { ...workspace, _id: result.insertedId.toString() };
  }

  /**
   * Update workspace
   * CRITICAL: Validates global uniqueness when updating phone numbers
   */
  async updateWorkspace(
    workspaceId: string,
    updates: Partial<Workspace>
  ): Promise<Workspace | null> {
    const collection = getWorkspacesCollection();
    
    console.log(chalk.blue(`🔄 Updating workspace: ${workspaceId}`));
    console.log(chalk.gray(`   Updates: ${Object.keys(updates).join(', ')}`));
    
    // Normalize phone numbers if updating them
    if (updates.phoneNumbers) {
      const normalizedPhones = updates.phoneNumbers.map(phone => 
        normalizePhoneNumber(phone)
      );
      
      // CRITICAL: Check global uniqueness of all new phone numbers
      for (const phone of normalizedPhones) {
        const isUnique = await this.isPhoneNumberGloballyUnique(phone, workspaceId);
        if (!isUnique) {
          throw new Error(`Phone number ${phone} is already registered to another workspace. Phone numbers must be globally unique.`);
        }
      }
      
      updates.phoneNumbers = normalizedPhones;
    }
    
    // Log FAQs update specifically
    if (updates.faqs) {
      console.log(chalk.cyan(`   📝 Updating FAQs: ${Array.isArray(updates.faqs) ? updates.faqs.length : 0} FAQ(s)`));
    }
    
    const result = await collection.findOneAndUpdate(
      { workspaceId },
      {
        $set: {
          ...updates,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      console.error(chalk.red(`❌ findOneAndUpdate returned null - workspace not found or update failed`));
      console.error(chalk.red(`   Workspace ID: ${workspaceId}`));
      return null;
    }

    console.log(chalk.green(`✅ Workspace updated successfully: ${workspaceId}`));
    if (updates.faqs) {
      console.log(chalk.green(`   📝 FAQs count after update: ${result.faqs?.length || 0}`));
    }

    return result;
  }

  /**
   * Update workspace FAQs
   */
  async updateFAQs(workspaceId: string, faqs: Workspace['faqs']): Promise<Workspace | null> {
    return this.updateWorkspace(workspaceId, { faqs });
  }

  /**
   * Update subscription status
   */
  async updateSubscriptionStatus(
    workspaceId: string,
    status: Workspace['subscription']['status']
  ): Promise<Workspace | null> {
    const existingWorkspace = await this.getWorkspaceById(workspaceId);
    if (!existingWorkspace) {
      return null;
    }

    return this.updateWorkspace(workspaceId, {
      subscription: {
        ...existingWorkspace.subscription,
        status,
      }
    });
  }

  /**
   * Get all active workspaces
   */
  async getActiveWorkspaces(): Promise<Workspace[]> {
    const collection = getWorkspacesCollection();
    const workspaces = await collection.find({
      'subscription.status': { $in: ['trial', 'active'] }
    }).toArray();
    return workspaces;
  }

  /**
   * Check if workspace exists by phone number
   */
  async workspaceExists(phoneNumber: string): Promise<boolean> {
    const normalized = normalizePhoneNumber(phoneNumber);
    const collection = getWorkspacesCollection();
    const count = await collection.countDocuments({ phoneNumbers: normalized });
    return count > 0;
  }

  /**
   * Add phone number to workspace
   * CRITICAL: Validates global uniqueness before adding
   */
  async addPhoneNumber(workspaceId: string, phoneNumber: string): Promise<Workspace | null> {
    const normalized = normalizePhoneNumber(phoneNumber);
    const workspace = await this.getWorkspaceById(workspaceId);
    
    if (!workspace) {
      return null;
    }

    // Check if number already exists in this workspace
    if (workspace.phoneNumbers.includes(normalized)) {
      return workspace; // Already exists in this workspace
    }

    // CRITICAL: Check global uniqueness (prevent conflicts across all workspaces)
    const isUnique = await this.isPhoneNumberGloballyUnique(normalized, workspaceId);
    if (!isUnique) {
      throw new Error(`Phone number ${normalized} is already registered to another workspace. Phone numbers must be globally unique.`);
    }

    // Add to array
    return this.updateWorkspace(workspaceId, {
      phoneNumbers: [...workspace.phoneNumbers, normalized]
    });
  }

  /**
   * Remove phone number from workspace
   */
  async removePhoneNumber(workspaceId: string, phoneNumber: string): Promise<Workspace | null> {
    const normalized = normalizePhoneNumber(phoneNumber);
    const workspace = await this.getWorkspaceById(workspaceId);
    
    if (!workspace) {
      return null;
    }

    // Remove from array
    const updatedPhones = workspace.phoneNumbers.filter(phone => phone !== normalized);
    
    if (updatedPhones.length === 0) {
      throw new Error('Cannot remove last phone number from workspace');
    }

    return this.updateWorkspace(workspaceId, {
      phoneNumbers: updatedPhones
    });
  }

  /**
   * Update WhatsApp connection status for a workspace
   * Used by WhatsAppConnectionManager to track connection state
   */
  async updateConnectionStatus(
    workspaceId: string,
    status: 'connecting' | 'connected' | 'disconnected' | 'reconnecting',
    reason?: string
  ): Promise<Workspace | null> {
    const now = new Date();
    const updates: Partial<Workspace> = {
      whatsappConnectionStatus: status,
      whatsappConnected: status === 'connected',
      lastConnectionUpdate: now,
    };

    if (status === 'connected') {
      updates.lastConnectedAt = now;
    } else if (status === 'disconnected') {
      updates.lastDisconnectedAt = now;
      if (reason) {
        updates.disconnectReason = reason;
      }
    }

    return this.updateWorkspace(workspaceId, updates);
  }
}

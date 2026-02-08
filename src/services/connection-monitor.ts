import { ObjectId, Collection } from 'mongodb';
import { getDatabase } from '../db/mongodb.js';
import { ConnectionAlert, ConnectionStatus } from '../models/connection-alert.js';
import chalk from 'chalk';

/**
 * Connection Monitor Service
 * 
 * Tracks WhatsApp connection status per workspace
 * Sends alerts when disconnections occur
 * 
 * CRITICAL: Know before the client does
 */
export class ConnectionMonitorService {
  private alertsCollection: Collection<ConnectionAlert> | null = null;

  /**
   * Get the alerts collection (lazy-loaded to avoid database connection issues)
   */
  private getCollection() {
    if (!this.alertsCollection) {
      const db = getDatabase();
      this.alertsCollection = db.collection<ConnectionAlert>('connectionAlerts');
    }
    return this.alertsCollection;
  }

  /**
   * Update connection status for a workspace
   */
  async updateConnectionStatus(
    workspaceId: string,
    status: ConnectionStatus,
    disconnectReason?: string
  ): Promise<ConnectionAlert> {
    const now = new Date();
    const collection = this.getCollection();
    
    // Find existing alert or create new one
    let alert = await collection.findOne({ workspaceId });
    
    if (!alert) {
      // Create new alert
      const newAlert: ConnectionAlert = {
        workspaceId,
        status,
        lastConnectedAt: status === 'connected' ? now : new Date(0),
        lastDisconnectedAt: status === 'disconnected' ? now : undefined,
        disconnectReason,
        notified: false,
        createdAt: now,
        updatedAt: now,
      };
      
      const result = await collection.insertOne(newAlert as any);
      return { ...newAlert, _id: result.insertedId };
    }
    
    // Update existing alert
    const updates: Partial<ConnectionAlert> = {
      status,
      updatedAt: now,
    };
    
    if (status === 'connected') {
      updates.lastConnectedAt = now;
      updates.notified = false; // Reset notification flag on reconnect
    } else if (status === 'disconnected') {
      updates.lastDisconnectedAt = now;
      if (disconnectReason) {
        updates.disconnectReason = disconnectReason;
      }
    }
    
    const result = await collection.findOneAndUpdate(
      { workspaceId },
      { $set: updates },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      throw new Error(`Failed to update connection status for workspace ${workspaceId}`);
    }
    
    return result;
  }

  /**
   * Get connection status for a workspace
   */
  async getConnectionStatus(workspaceId: string): Promise<ConnectionAlert | null> {
    return await this.getCollection().findOne({ workspaceId });
  }

  /**
   * Get all connection statuses
   */
  async getAllConnectionStatuses(): Promise<ConnectionAlert[]> {
    return await this.getCollection().find({}).sort({ updatedAt: -1 }).toArray();
  }

  /**
   * Get disconnected workspaces (for alerts)
   */
  async getDisconnectedWorkspaces(): Promise<ConnectionAlert[]> {
    return await this.getCollection()
      .find({ 
        status: 'disconnected',
        notified: false // Only get un-notified disconnections
      })
      .sort({ lastDisconnectedAt: -1 })
      .toArray();
  }

  /**
   * Mark alert as notified (after sending email)
   */
  async markAsNotified(workspaceId: string): Promise<void> {
    await this.getCollection().updateOne(
      { workspaceId },
      { 
        $set: { 
          notified: true,
          notificationSentAt: new Date(),
          updatedAt: new Date()
        } 
      }
    );
  }

  /**
   * Get connection statistics
   */
  async getConnectionStats(): Promise<{
    total: number;
    connected: number;
    disconnected: number;
    reconnecting: number;
    connecting: number;
  }> {
    const collection = this.getCollection();
    const total = await collection.countDocuments();
    const connected = await collection.countDocuments({ status: 'connected' });
    const disconnected = await collection.countDocuments({ status: 'disconnected' });
    const reconnecting = await collection.countDocuments({ status: 'reconnecting' });
    const connecting = await collection.countDocuments({ status: 'connecting' });
    
    return {
      total,
      connected,
      disconnected,
      reconnecting,
      connecting,
    };
  }
}

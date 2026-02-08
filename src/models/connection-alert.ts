import { ObjectId } from 'mongodb';

export type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting' | 'connecting';

export interface ConnectionAlert {
  _id?: ObjectId;
  workspaceId: string;
  status: ConnectionStatus;
  lastConnectedAt: Date;
  lastDisconnectedAt?: Date;
  disconnectReason?: string; // DisconnectReason from Baileys
  notified: boolean; // Whether admin was notified
  notificationSentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

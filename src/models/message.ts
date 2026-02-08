/**
 * Message Model
 * 
 * CRITICAL: Future-proof schema for inbound/outbound messaging
 * Every message must belong to:
 * - workspaceId (tenant isolation)
 * - direction (inbound/outbound)
 * - connectionId (immutable identity, not phone number)
 * 
 * This prevents message migrations later (which are nightmares)
 */

export type MessageDirection = 'inbound' | 'outbound';

export interface Message {
  _id?: string;
  
  // CRITICAL: Tenant isolation
  workspaceId?: string; // Primary (for workspaces)
  clientId?: string; // Legacy (for backward compatibility during migration)
  
  // CRITICAL: Message direction (future-proof for outbound)
  direction: MessageDirection;
  
  // CRITICAL: Connection ID (immutable identity, not phone number)
  // Phone numbers can change, but connectionId is permanent
  connectionId?: string; // Will be added when connection model is implemented
  
  // Message content
  from: string; // Sender phone number
  to: string; // Recipient phone number
  message: string; // Original message text
  response?: string; // Bot response (if any)
  matchedFAQ?: string; // FAQ category that matched (if any)
  
  // Metadata
  timestamp: Date;
  hour: string; // "2026-02-06T14" for rate limiting
  day: string; // "2026-02-06" for rate limiting
  month: string; // "2026-02" for rate limiting
  
  // Additional metadata (optional)
  isGroup?: boolean;
  messageType?: 'text' | 'image' | 'video' | 'audio' | 'document';
}

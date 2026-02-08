/**
 * Phone Number Normalization Utility
 * 
 * Normalizes phone numbers to E.164 format (+234...)
 * Critical for proper routing and matching
 */

/**
 * Normalize phone number to E.164 format
 * 
 * Examples:
 * - "08107060160" → "+2348107060160"
 * - "2348107060160" → "+2348107060160"
 * - "+2348107060160" → "+2348107060160"
 * - "8107060160" → "+2348107060160"
 * - "+1234567890123456" → "+1234567890123456" (international, already normalized)
 */
export function normalizePhoneNumber(phone: string): string {
  if (!phone || typeof phone !== 'string') {
    throw new Error('Invalid phone number: must be a non-empty string');
  }
  
  // If already in E.164 format (starts with +), validate and return
  if (phone.startsWith('+')) {
    const digits = phone.substring(1).replace(/\D/g, '');
    // E.164 standard allows 1-15 digits after the +
    // But WhatsApp can send slightly longer numbers, so we allow up to 18 for compatibility
    if (digits.length < 1 || digits.length > 18) {
      throw new Error(`Invalid phone number length: ${digits.length} digits (expected 1-18)`);
    }
    return '+' + digits;
  }
  
  // Remove all non-digits
  let cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 0) {
    throw new Error('Invalid phone number: no digits found');
  }
  
  // Handle Nigerian numbers (default country code)
  if (cleaned.startsWith('0')) {
    // Local format: "08107060160" → "2348107060160"
    cleaned = '234' + cleaned.substring(1);
  } else if (!cleaned.startsWith('234')) {
    // Assume Nigerian if no country code: "8107060160" → "2348107060160"
    cleaned = '234' + cleaned;
  }
  
  // Validate length (E.164 allows 1-15 digits after country code)
  // Nigerian numbers are typically 13 digits with country code (234 + 10 digits)
  // But allow up to 18 digits for WhatsApp compatibility (some international numbers can be longer)
  if (cleaned.length < 10 || cleaned.length > 18) {
    throw new Error(`Invalid phone number length: ${cleaned.length} digits (expected 10-18)`);
  }
  
  return '+' + cleaned;
}

/**
 * Normalize phone number array
 */
export function normalizePhoneNumbers(phones: string[]): string[] {
  return phones.map(phone => normalizePhoneNumber(phone));
}

/**
 * Check if two phone numbers are the same (after normalization)
 */
export function phoneNumbersMatch(phone1: string, phone2: string): boolean {
  try {
    const normalized1 = normalizePhoneNumber(phone1);
    const normalized2 = normalizePhoneNumber(phone2);
    return normalized1 === normalized2;
  } catch {
    return false;
  }
}

/**
 * Extract phone number from WhatsApp JID
 * Example: "2348107060160@s.whatsapp.net" → "+2348107060160"
 * Example: "2348107060160@lid" → "+2348107060160"
 * 
 * Note: WhatsApp JIDs can contain phone numbers in various formats:
 * - @s.whatsapp.net (standard)
 * - @lid (sometimes, context-dependent)
 * - @g.us (groups)
 * 
 * This function extracts the number and normalizes it to E.164 format.
 * 
 * CRITICAL: Handles edge cases (empty JID, invalid format, group messages)
 * CRITICAL: This is the ONLY place JID extraction should happen (enforce brutally)
 */
export function extractPhoneFromJid(jid: string): string {
  if (!jid || typeof jid !== 'string') {
    throw new Error(`Invalid JID: must be a non-empty string, got: ${typeof jid}`);
  }
  
  // Remove @s.whatsapp.net, @lid, @g.us, or any other suffix
  // WhatsApp sometimes returns different JID formats depending on context
  const phone = jid.split('@')[0];
  
  // Check if phone part is empty or invalid
  if (!phone || phone.trim().length === 0) {
    throw new Error(`Invalid JID format: no phone number found in "${jid}"`);
  }
  
  // Try to normalize - if it fails, provide better error message
  try {
    return normalizePhoneNumber(phone);
  } catch (error) {
    // Provide context about the JID that failed
    throw new Error(`Failed to normalize phone from JID "${jid}": ${(error as Error).message}`);
  }
}

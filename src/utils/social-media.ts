import { Client } from '../models/client.js';

/**
 * Get social media link for a platform
 * Handles both new socialMedia object and legacy instagram field
 */
export function getSocialMediaLink(client: Client, platform: 'instagram' | 'facebook' | 'twitter' | 'website' | 'tiktok'): string | undefined {
  // Check new socialMedia object first
  if (client.socialMedia) {
    return client.socialMedia[platform];
  }
  
  // Fallback to legacy instagram field
  if (platform === 'instagram' && client.instagram) {
    return client.instagram;
  }
  
  return undefined;
}

/**
 * Get all social media links
 */
export function getAllSocialMedia(client: Client): {
  instagram?: string;
  facebook?: string;
  twitter?: string;
  website?: string;
  tiktok?: string;
} {
  const result: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    website?: string;
    tiktok?: string;
  } = {};
  
  // Use new socialMedia object if available
  if (client.socialMedia) {
    return { ...client.socialMedia };
  }
  
  // Fallback to legacy instagram field
  if (client.instagram) {
    result.instagram = client.instagram;
  }
  
  return result;
}

/**
 * Format social media for display in FAQs
 */
export function formatSocialMediaForFAQ(client: Client): string {
  const social = getAllSocialMedia(client);
  const links: string[] = [];
  
  if (social.instagram) {
    links.push(`Instagram: ${social.instagram}`);
  }
  if (social.facebook) {
    links.push(`Facebook: ${social.facebook}`);
  }
  if (social.twitter) {
    links.push(`Twitter: ${social.twitter}`);
  }
  if (social.website) {
    links.push(`Website: ${social.website}`);
  }
  if (social.tiktok) {
    links.push(`TikTok: ${social.tiktok}`);
  }
  
  if (links.length === 0) {
    return '';
  }
  
  return '\n\n' + links.join('\n');
}

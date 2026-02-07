import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { FAQ, Niche } from '../models/client.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Load FAQ template based on niche
 */
export function loadFAQTemplate(niche: Niche): FAQ[] {
  try {
    const templateFile = niche === 'other' ? 'faqs.json' : `faqs.${niche}.json`;
    // Path from src/utils/faq-templates.ts to data/faqs.*.json
    const templatePath = join(__dirname, '..', '..', 'data', templateFile);
    
    const fileContent = readFileSync(templatePath, 'utf-8');
    const faqs: FAQ[] = JSON.parse(fileContent);
    
    return faqs;
  } catch (error) {
    console.error(`Failed to load FAQ template for niche: ${niche}`, error);
    // Return default template
    return loadDefaultTemplate();
  }
}

/**
 * Load default FAQ template
 */
function loadDefaultTemplate(): FAQ[] {
  try {
    const templatePath = join(__dirname, '..', '..', 'data', 'faqs.json');
    const fileContent = readFileSync(templatePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Failed to load default FAQ template', error);
    // Return minimal template as fallback
    return [
      {
        keywords: ['hello', 'hi', 'hey'],
        answer: 'Hello! 👋 Welcome! How can I help you today?',
        category: 'greeting',
      },
      {
        keywords: ['help', 'commands'],
        answer: 'I can help you with information about our business. Just ask me anything!',
        category: 'help',
      },
    ];
  }
}

/**
 * Customize FAQ template with business-specific information
 */
export function customizeFAQs(faqs: FAQ[], businessName: string, address?: string, socialMedia?: {
  instagram?: string;
  facebook?: string;
  twitter?: string;
  website?: string;
  tiktok?: string;
}): FAQ[] {
  return faqs.map(faq => {
    let answer = faq.answer;
    
    // Replace placeholders
    answer = answer.replace(/\[Business Name\]/g, businessName);
    answer = answer.replace(/\[Your Business Name\]/g, businessName);
    
    if (address) {
      answer = answer.replace(/\[Your Address\]/g, address);
      answer = answer.replace(/\[Address\]/g, address);
    }
    
    if (socialMedia) {
      if (socialMedia.instagram) {
        answer = answer.replace(/@\[yourbusiness\]/g, socialMedia.instagram);
        answer = answer.replace(/\[yourbusiness\]/g, socialMedia.instagram.replace('@', ''));
      }
      if (socialMedia.website) {
        answer = answer.replace(/\[Your Website\]/g, socialMedia.website);
      }
    }
    
    return {
      ...faq,
      answer,
    };
  });
}

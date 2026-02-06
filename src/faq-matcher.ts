export interface FAQ {
  keywords: string[];
  answer: string;
  category?: string;
}

export class FAQMatcher {
  private faqs: FAQ[];

  constructor(faqs: FAQ[]) {
    this.faqs = faqs;
  }

  match(message: string): FAQ | null {
    if (!message || typeof message !== 'string') {
      return null;
    }

    const lower = message.toLowerCase().trim();

    // Remove common punctuation and normalize
    const cleaned = lower
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (cleaned.length === 0) {
      return null;
    }

    // Try exact match first
    for (const faq of this.faqs) {
      for (const keyword of faq.keywords) {
        const keywordLower = keyword.toLowerCase().trim();

        // Exact match
        if (cleaned === keywordLower) {
          return faq;
        }

        // Contains match (both directions)
        if (cleaned.includes(keywordLower) || keywordLower.includes(cleaned)) {
          return faq;
        }

        // Word boundary match (more precise)
        const wordRegex = new RegExp(`\\b${keywordLower}\\b`, 'i');
        if (wordRegex.test(cleaned)) {
          return faq;
        }
      }
    }

    return null;
  }

  getDefaultAnswer(): string {
    return (
      "Sorry, I didn't understand that. 😊\n\n" +
      "Send 'HELP' to see available commands, or ask me about:\n" +
      "• Prices\n" +
      "• Business hours\n" +
      "• Location\n" +
      "• Orders\n" +
      "• Contact information"
    );
  }

  getAllCategories(): string[] {
    const categories = new Set<string>();
    for (const faq of this.faqs) {
      if (faq.category) {
        categories.add(faq.category);
      }
    }
    return Array.from(categories);
  }
}

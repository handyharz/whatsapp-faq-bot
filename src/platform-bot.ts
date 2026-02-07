/**
 * Platform Bot - Handles support/sales for the platform itself
 * This bot answers questions about the WhatsApp FAQ Bot service
 */

import { FAQMatcher } from './faq-matcher.js';
import { FAQ } from './models/client.js';

// Platform bot FAQs
const PLATFORM_FAQS: FAQ[] = [
  {
    keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
    answer: `Hello! 👋 Welcome to WhatsApp FAQ Bot support.

I'm here to help you with:
• 📋 Service information
• 💰 Pricing and plans
• 🚀 Getting started
• 🛠️ Technical support
• 💳 Payment questions

Just ask me anything! 😊`,
    category: 'greeting',
  },
  {
    keywords: ['price', 'pricing', 'cost', 'how much', 'fee', 'subscription'],
    answer: `💰 **Pricing Plans:**

**Free Trial** - ₦0 (7 days)
• Full features
• Unlimited messages
• Perfect for testing

**Starter** - ₦5,000/month
• Up to 50 FAQs
• 1,000 messages/month
• Email support

**Professional** - ₦10,000/month
• Up to 200 FAQs
• 5,000 messages/month
• Priority support
• Advanced analytics

**Enterprise** - ₦20,000/month
• Unlimited FAQs
• Unlimited messages
• Dedicated support
• Custom integrations

Ready to get started? Reply "SIGNUP" or visit www.exonec.com 🚀`,
    category: 'pricing',
  },
  {
    keywords: ['signup', 'sign up', 'register', 'get started', 'onboard', 'create account'],
    answer: `🚀 **Get Started in 3 Steps:**

1. **Visit our website:** www.exonec.com
2. **Fill out the form** with your business details
3. **We'll set up your bot** and send you onboarding instructions

**What you'll need:**
• Business name
• WhatsApp number
• Email address
• Business niche (restaurant, fashion, etc.)

**Free 7-day trial** - No credit card required! 🎉

Questions? Just ask! 😊`,
    category: 'signup',
  },
  {
    keywords: ['feature', 'features', 'what can', 'capabilities', 'what does'],
    answer: `✨ **WhatsApp FAQ Bot Features:**

🤖 **Automated Responses**
• Answer customer questions 24/7
• Custom FAQs per business
• Smart keyword matching

⏰ **Business Hours**
• Auto-reply outside business hours
• Customizable messages

📊 **Analytics**
• Message statistics
• FAQ performance
• Customer insights

💳 **Payment Integration**
• Paystack integration
• Automated subscriptions
• Multiple tiers

📱 **Dashboard**
• Manage FAQs
• Update settings
• View analytics

**Ready to try?** Reply "SIGNUP" to get started! 🚀`,
    category: 'features',
  },
  {
    keywords: ['support', 'help', 'problem', 'issue', 'error', 'not working'],
    answer: `🛠️ **Support Options:**

**Email Support:**
📧 support@exonec.com

**For Technical Issues:**
• Check your bot connection
• Verify your subscription status
• Review your FAQs

**Common Solutions:**
• Bot not responding? Check if subscription is active
• FAQs not working? Verify keywords are set correctly
• Payment issues? Contact support@exonec.com

**Need immediate help?** Email us at support@exonec.com and we'll respond within 24 hours! 📧`,
    category: 'support',
  },
  {
    keywords: ['payment', 'pay', 'paystack', 'subscribe', 'subscription', 'billing'],
    answer: `💳 **Payment & Subscription:**

**Payment Methods:**
• Paystack (Card, Bank Transfer)
• Secure and encrypted

**Subscription Management:**
• Manage from your dashboard
• Auto-renewal available
• Cancel anytime

**Payment Issues?**
• Check your email for payment link
• Verify Paystack account
• Contact support@exonec.com

**Upgrade/Downgrade:**
• Visit your dashboard
• Change plan anytime
• Prorated billing

Questions? Email support@exonec.com 📧`,
    category: 'payment',
  },
  {
    keywords: ['trial', 'free trial', 'trial period', 'trial end'],
    answer: `🎁 **Free Trial:**

**What's Included:**
• 7 days free
• Full features
• Unlimited messages
• All FAQs

**After Trial:**
• Choose a plan to continue
• No automatic charges
• Your data is safe

**Extend Trial?**
• Contact support@exonec.com
• We can extend for special cases

**Ready to subscribe?** Reply "PRICING" to see plans! 💰`,
    category: 'trial',
  },
  {
    keywords: ['dashboard', 'login', 'access', 'account', 'manage'],
    answer: `📊 **Client Dashboard:**

**Access Your Dashboard:**
• Visit www.exonec.com/dashboard
• Use your client ID as token
• Manage FAQs, settings, and more

**Dashboard Features:**
• Edit FAQs
• Update business hours
• View analytics
• Manage subscription

**Lost Your Token?**
• Check your email
• Contact support@exonec.com

**Need Help?** Email support@exonec.com 📧`,
    category: 'dashboard',
  },
  {
    keywords: ['faq', 'questions', 'how to add', 'create faq', 'edit faq'],
    answer: `📝 **Managing FAQs:**

**Add FAQs:**
1. Go to your dashboard
2. Click "Manage FAQs"
3. Add keywords and answers

**Tips:**
• Use multiple keywords per FAQ
• Keep answers concise
• Test with common questions

**Example:**
Keywords: "price", "cost", "how much"
Answer: "Our prices start from ₦5,000..."

**Need Help?** Email support@exonec.com 📧`,
    category: 'faq',
  },
  {
    keywords: ['contact', 'email', 'reach', 'get in touch'],
    answer: `📧 **Contact Us:**

**Email:** support@exonec.com
**Website:** www.exonec.com

**Response Time:**
• Email: Within 24 hours
• Business hours: 9am-5pm WAT

**For:**
• Technical support
• Billing questions
• Feature requests
• General inquiries

We're here to help! 😊`,
    category: 'contact',
  },
  {
    keywords: ['cancel', 'cancel subscription', 'refund', 'stop'],
    answer: `🛑 **Cancellation:**

**Cancel Subscription:**
• Email support@exonec.com
• Include your business name
• We'll process within 24 hours

**Refund Policy:**
• No refunds for partial months
• Service continues until period ends
• Data retained for 30 days

**After Cancellation:**
• Bot stops responding
• Dashboard access limited
• Data export available

**Questions?** Email support@exonec.com 📧`,
    category: 'cancellation',
  },
];

const DEFAULT_ANSWER = `I'm the WhatsApp FAQ Bot support assistant! 🤖

I can help you with:
• 💰 Pricing and plans
• 🚀 Getting started
• 🛠️ Technical support
• 💳 Payment questions

**Quick Commands:**
• "PRICING" - See pricing plans
• "SIGNUP" - Get started
• "SUPPORT" - Get help
• "CONTACT" - Contact information

Or just ask me anything! 😊`;

export class PlatformBot {
  private matcher: FAQMatcher;

  constructor() {
    this.matcher = new FAQMatcher(PLATFORM_FAQS);
  }

  /**
   * Handle incoming message for platform bot
   */
  async handleMessage(from: string, message: string): Promise<string> {
    const upperMessage = message.toUpperCase().trim();

    // Handle special commands
    if (upperMessage === 'PRICING' || upperMessage === 'PRICE') {
      const faq = this.matcher.match('price');
      return faq?.answer || DEFAULT_ANSWER;
    }

    if (upperMessage === 'SIGNUP' || upperMessage === 'SIGN UP' || upperMessage === 'GET STARTED') {
      const faq = this.matcher.match('signup');
      return faq?.answer || DEFAULT_ANSWER;
    }

    if (upperMessage === 'SUPPORT' || upperMessage === 'HELP') {
      const faq = this.matcher.match('support');
      return faq?.answer || DEFAULT_ANSWER;
    }

    if (upperMessage === 'CONTACT') {
      const faq = this.matcher.match('contact');
      return faq?.answer || DEFAULT_ANSWER;
    }

    // Try to match FAQ
    const faq = this.matcher.match(message);
    if (faq) {
      return faq.answer;
    }

    // Default response
    return DEFAULT_ANSWER;
  }
}

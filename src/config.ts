import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

export const config = {
  authDir: process.env.AUTH_DIR || path.join(__dirname, '../auth'),
  businessHours: {
    start: parseInt(process.env.BUSINESS_HOURS_START || '9', 10),
    end: parseInt(process.env.BUSINESS_HOURS_END || '17', 10),
  },
  timezone: process.env.TIMEZONE || 'Africa/Lagos',
  adminNumbers: (process.env.ADMIN_NUMBERS || '')
    .split(',')
    .map(n => n.trim())
    .filter(n => n.length > 0),
  afterHoursMessage:
    process.env.AFTER_HOURS_MESSAGE ||
    "Thanks for your message! We're currently closed (9am-5pm WAT). We'll reply first thing tomorrow. 😊",
};

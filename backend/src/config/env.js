import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root or backend folder
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: process.env.PORT || 5000,
  geminiApiKey: (process.env.GEMINI_API_KEY || '').trim(),
  qdrantUrl: (process.env.QDRANT_URL || 'http://localhost:6333').trim(),
  qdrantApiKey: (process.env.QDRANT_API_KEY || '').trim(),
  qdrantCollection: (process.env.QDRANT_COLLECTION || 'university_documents').trim(),
  mongodbUri: (process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campusai').trim(),
};

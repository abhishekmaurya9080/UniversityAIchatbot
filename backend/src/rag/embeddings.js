import { GoogleGenAI } from '@google/genai';
import { config } from '../config/env.js';

let aiInstance = null;

function getAiClient() {
  if (!config.geminiApiKey) {
    return null;
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey: config.geminiApiKey });
  }
  return aiInstance;
}

/**
 * Fallback feature vector generator for offline/keyless testing
 */
function generateFallbackVector(text) {
  const dim = 768;
  const vector = new Array(dim).fill(0);
  const words = text.toLowerCase().match(/\w+/g) || [];

  words.forEach((word, idx) => {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = (hash << 5) - hash + word.charCodeAt(i);
      hash |= 0;
    }
    const pos = Math.abs(hash) % dim;
    vector[pos] += 1 / (idx + 1);
  });

  // Normalize vector
  const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (norm > 0) {
    for (let i = 0; i < dim; i++) {
      vector[i] = vector[i] / norm;
    }
  } else {
    vector[0] = 1;
  }

  return vector;
}

/**
 * Generate vector embedding for a text chunk or question using Gemini
 * @param {string} text 
 * @param {string} taskType - "DOCUMENT" or "QUERY"
 * @returns {Promise<number[]>}
 */
export async function generateEmbedding(text, taskType = "DOCUMENT") {
  if (!text || typeof text !== 'string' || !text.trim()) {
    return new Array(768).fill(0);
  }

  const ai = getAiClient();
  const cleanedText = text.replace(/\s+/g, ' ').trim();

  // If Gemini API Key is missing, use deterministic fallback vector
  if (!ai) {
    return generateFallbackVector(cleanedText);
  }

  try {
    const response = await ai.models.embedContent({
      model: 'gemini-embedding-001',
      contents: cleanedText,
    });

    if (response?.embedding?.values) {
      return response.embedding.values;
    }
  } catch (err) {
    try {
      const fbResponse = await ai.models.embedContent({
        model: 'text-embedding-004',
        contents: cleanedText,
      });
      if (fbResponse?.embedding?.values) {
        return fbResponse.embedding.values;
      }
    } catch (fbErr) {
      console.warn(`[Gemini Embedding Warning] API call failed: ${err.message}. Using fallback vector.`);
    }
  }

  return generateFallbackVector(cleanedText);
}

/**
 * Generate embeddings for multiple text chunks
 * @param {string[]} texts 
 * @returns {Promise<number[][]>}
 */
export async function generateBatchEmbeddings(texts) {
  const embeddings = [];
  for (const text of texts) {
    const vector = await generateEmbedding(text, "DOCUMENT");
    embeddings.push(vector);
  }
  return embeddings;
}

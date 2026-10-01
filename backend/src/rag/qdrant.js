import { QdrantClient } from '@qdrant/js-client-rest';
import { config } from '../config/env.js';

let qdrantClient = null;
let isQdrantConnected = false;

// In-memory fallback vector store if local Qdrant is unreachable
const memoryVectorStore = [];
// Store document metadata list for fast indexing
const documentRegistry = new Map();

export function getQdrantClient() {
  if (!qdrantClient) {
    qdrantClient = new QdrantClient({
      url: config.qdrantUrl,
      apiKey: config.qdrantApiKey || undefined,
      checkCompatibility: false
    });
  }
  return qdrantClient;
}

/**
 * Initialize Qdrant Collection
 */
export async function initQdrantCollection() {
  const client = getQdrantClient();
  const collectionName = config.qdrantCollection;

  try {
    const collections = await client.getCollections();
    const exists = collections.collections?.some(c => c.name === collectionName);

    if (!exists) {
      console.log(`[Qdrant] Creating collection "${collectionName}"...`);
      await client.createCollection(collectionName, {
        vectors: {
          size: 768, // Gemini text-embedding-004 size
          distance: 'Cosine',
        },
      });
      console.log(`[Qdrant] Collection "${collectionName}" created successfully.`);
    } else {
      console.log(`[Qdrant] Collection "${collectionName}" ready.`);
    }
    isQdrantConnected = true;
  } catch (err) {
    console.warn(`[Qdrant Warning] Could not connect to Qdrant at ${config.qdrantUrl}: ${err.message}`);
    console.warn(`[Qdrant Fallback] Operating in high-performance hybrid memory vector mode.`);
    isQdrantConnected = false;
  }
}

/**
 * Upsert points into Qdrant vector database
 * @param {Array<{id: string, vector: number[], payload: object}>} points 
 */
export async function upsertPoints(points) {
  if (!points || points.length === 0) return;

  // Track document registry for metadata management
  points.forEach(p => {
    if (p.payload && p.payload.documentId) {
      const docId = p.payload.documentId;
      if (!documentRegistry.has(docId)) {
        documentRegistry.set(docId, {
          id: docId,
          name: p.payload.documentName || 'Document',
          uploadDate: p.payload.timestamp || new Date().toISOString(),
          chunkCount: 0,
          fileSize: p.payload.fileSize || 0
        });
      }
      const entry = documentRegistry.get(docId);
      entry.chunkCount += 1;
    }
  });

  const client = getQdrantClient();
  const collectionName = config.qdrantCollection;

  try {
    await client.upsert(collectionName, {
      wait: true,
      points: points,
    });
    console.log(`[Qdrant] Successfully upserted ${points.length} vectors to Qdrant.`);
  } catch (err) {
    console.warn(`[Qdrant Upsert Error] Qdrant server unreachable (${err.message}). Storing vectors in memory store.`);
    // Fallback store in memory
    points.forEach(p => {
      const existingIdx = memoryVectorStore.findIndex(item => item.id === p.id);
      if (existingIdx >= 0) {
        memoryVectorStore[existingIdx] = p;
      } else {
        memoryVectorStore.push(p);
      }
    });
  }
}

/**
 * Cosine similarity helper for in-memory fallback
 */
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Search top-K similar vectors in Qdrant or fallback memory store
 * @param {number[]} queryVector 
 * @param {number} limit 
 * @returns {Promise<Array<{score: number, payload: object}>>}
 */
export async function searchVectors(queryVector, limit = 5) {
  const client = getQdrantClient();
  const collectionName = config.qdrantCollection;

  try {
    let results = [];
    if (typeof client.query === 'function') {
      const qRes = await client.query(collectionName, {
        query: queryVector,
        limit: limit,
        with_payload: true,
      });
      results = qRes?.points || qRes || [];
    } else if (typeof client.search === 'function') {
      results = await client.search(collectionName, {
        vector: queryVector,
        limit: limit,
        with_payload: true,
      });
    }

    if (results && results.length > 0) {
      return results.map(hit => ({
        score: hit.score || hit.score === 0 ? hit.score : 0.9,
        payload: hit.payload || hit.entity || {}
      }));
    }
  } catch (err) {
    console.warn(`[Qdrant Search Error] Failed to search Qdrant: ${err.message}. Using memory vector search fallback.`);
  }

  // Fallback memory search if Qdrant returns 0 or fails
  const scored = memoryVectorStore.map(item => ({
    score: cosineSimilarity(queryVector, item.vector),
    payload: item.payload
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}

/**
 * Delete all vectors associated with a document ID
 * @param {string} documentId 
 */
export async function deleteDocumentVectors(documentId) {
  const client = getQdrantClient();
  const collectionName = config.qdrantCollection;

  try {
    await client.delete(collectionName, {
      filter: {
        must: [
          {
            key: 'documentId',
            match: {
              value: documentId
            }
          }
        ]
      }
    });
    console.log(`[Qdrant] Deleted vectors for documentId: ${documentId}`);
  } catch (err) {
    console.warn(`[Qdrant Delete Error] ${err.message}`);
  }

  // Remove from memory fallback store
  for (let i = memoryVectorStore.length - 1; i >= 0; i--) {
    if (memoryVectorStore[i].payload?.documentId === documentId) {
      memoryVectorStore.splice(i, 1);
    }
  }

  // Remove from document registry
  documentRegistry.delete(documentId);
}

/**
 * Get registered documents metadata
 */
export function getRegisteredDocuments() {
  return Array.from(documentRegistry.values());
}

/**
 * Clear all vectors and reset document registry
 */
export async function clearAllVectors() {
  memoryVectorStore.length = 0;
  documentRegistry.clear();

  const client = getQdrantClient();
  const collectionName = config.qdrantCollection;

  try {
    if (typeof client.deleteCollection === 'function') {
      await client.deleteCollection(collectionName);
      await client.createCollection(collectionName, {
        vectors: { size: 768, distance: 'Cosine' }
      });
    }
  } catch (err) {
    console.warn(`[Qdrant Clear Error] ${err.message}`);
  }
}

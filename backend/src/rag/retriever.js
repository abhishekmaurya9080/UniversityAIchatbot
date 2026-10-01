import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateEmbedding } from './embeddings.js';
import { searchVectors } from './qdrant.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Format raw PDF filenames into clean human-readable source titles
 */
export function formatDocumentTitle(docName = '') {
  if (!docName) return 'Official University Resource';
  const nameWithoutNumber = docName.replace(/^\d+[\_\-\s]*/, '').replace(/\.pdf$/i, '').replace(/[\_\-]/g, ' ').trim();
  
  if (!nameWithoutNumber || nameWithoutNumber.toLowerCase() === 'frequently asked questions' || nameWithoutNumber.toLowerCase() === 'faqs') {
    return 'University Handbook & Guidelines';
  }

  return nameWithoutNumber;
}

// Pre-load all canonical QA pairs from knowledge datasets
let indexedDataset = [];

function loadDatasetFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      // 1. Format: all_questions.json
      if (raw.categories) {
        Object.entries(raw.categories).forEach(([categoryName, qaList]) => {
          if (Array.isArray(qaList)) {
            qaList.forEach((qa) => {
              const cleanTitle = formatDocumentTitle(qa.sourceDocument);
              indexedDataset.push({
                category: categoryName,
                question: (qa.question || '').trim(),
                variants: [],
                answer: (qa.answer || '').trim(),
                sourceDocument: cleanTitle,
              });
            });
          }
        });
      }

      // 2. Format: academic_calendar.json & academic_events.json
      if (Array.isArray(raw.records)) {
        raw.records.forEach((rec) => {
          const defaultSource = raw.dataset_type === 'academic_events' ? 'Academic Events' : 'Academic Calendar 2026-27';
          const cleanTitle = rec.source || (rec.category === 'Exam Timetable' ? 'Exam Timetable' : defaultSource);
          const answerText = rec.rag_text || rec.description || `${rec.event_name || rec.title}: ${rec.answer}`;
          indexedDataset.push({
            category: rec.category || rec.event_type || 'Academic Events',
            question: (rec.canonical_question || rec.event_name || rec.title || '').trim(),
            variants: Array.isArray(rec.query_variants) ? rec.query_variants.map(v => v.trim()) : [],
            answer: (rec.answer || rec.description || answerText).trim(),
            details: rec.dates || rec.exam_details || rec.holidays || rec.activities || null,
            sourceDocument: cleanTitle,
          });
        });
      }
    }
  } catch (e) {
    console.warn(`[Retriever] Could not load dataset file ${filePath}:`, e.message);
  }
}

// Load dataset files
loadDatasetFile(path.resolve(__dirname, '../data/all_questions.json'));
loadDatasetFile(path.resolve(__dirname, '../data/academic_calendar.json'));
loadDatasetFile(path.resolve(__dirname, '../data/academic_events.json'));

function normalizeText(txt = '') {
  return txt.toLowerCase().replace(/[\-\_\?\.\,\:\;\(\)]/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Retrieve relevant document context using Hybrid Search (Dataset QA Matching + Qdrant Vector Search)
 * @param {string} question 
 * @param {number} topK 
 */
export async function retrieveRelevantContext(question, topK = 5) {
  if (!question || !question.trim()) {
    return { context: '', sources: [] };
  }

  const cleanQ = normalizeText(question);
  const sources = [];
  const contextParts = [];
  const seenSources = new Set();

  const stopWords = new Set(['what', 'how', 'when', 'where', 'which', 'who', 'why', 'the', 'is', 'are', 'was', 'were', 'can', 'could', 'does', 'did', 'for', 'in', 'on', 'at', 'to', 'from', 'with', 'by', 'about', 'and', 'or', 'of', 'a', 'an']);

  // 1. Direct Keyword & Intent Dataset Search (100% precision for university knowledge & academic calendar)
  if (indexedDataset.length > 0) {
    const keywords = cleanQ.split(' ').filter(w => w.length >= 3 && !stopWords.has(w));

    indexedDataset.forEach((qa) => {
      const qaQ = normalizeText(qa.question);
      const variantMatches = qa.variants ? qa.variants.some(v => {
        const normV = normalizeText(v);
        return normV.includes(cleanQ) || cleanQ.includes(normV);
      }) : false;
      
      let isMatch = qaQ.includes(cleanQ) || cleanQ.includes(qaQ) || variantMatches;
      
      if (!isMatch && keywords.length > 0) {
        const matchingKeywords = keywords.filter((kw) => qaQ.includes(kw));
        if (matchingKeywords.length >= 2 || (keywords.length === 1 && matchingKeywords.length === 1 && qaQ.includes(cleanQ))) {
          isMatch = true;
        }
      }

      if (isMatch) {
        const sourceTitle = qa.sourceDocument;
        const sourceKey = `${sourceTitle}_${qa.question}`;
        if (!seenSources.has(sourceKey)) {
          seenSources.add(sourceKey);
          
          let fullText = `Question: ${qa.question}\nOfficial Answer: ${qa.answer}`;
          if (qa.details) {
            fullText += `\nDetails: ${JSON.stringify(qa.details)}`;
          }

          sources.push({
            documentId: sourceTitle,
            documentName: sourceTitle,
            pageNumber: 1,
            chunkIndex: 1,
            text: fullText,
            score: 0.98,
          });

          contextParts.push(
            `[Official Resource: ${sourceTitle}]\n${fullText}`
          );
        }
      }
    });
  }

  // 2. Perform Qdrant Vector Search
  try {
    const queryVector = await generateEmbedding(question, "QUERY");
    const searchResults = await searchVectors(queryVector, topK);

    if (searchResults && searchResults.length > 0) {
      searchResults.forEach((item, index) => {
        const payload = item.payload || {};
        const score = parseFloat((item.score || 0).toFixed(4));
        const rawName = payload.documentName || 'University Document';
        const cleanTitle = formatDocumentTitle(rawName);
        const sourceKey = `${cleanTitle}_p${payload.pageNumber || 1}_c${payload.chunkIndex || 1}`;

        if (!seenSources.has(sourceKey) && (score >= 0.2 || index === 0)) {
          seenSources.add(sourceKey);
          sources.push({
            documentId: payload.documentId || cleanTitle,
            documentName: cleanTitle,
            pageNumber: payload.pageNumber || 1,
            chunkIndex: payload.chunkIndex || 1,
            text: payload.text || '',
            score: score,
          });

          contextParts.push(
            `[Official Resource: ${cleanTitle} (Page ${payload.pageNumber || 1})]\n${payload.text}`
          );
        }
      });
    }
  } catch (err) {
    console.warn(`[Retriever] Qdrant search fallback: ${err.message}`);
  }

  const context = contextParts.join('\n\n---\n\n');

  // Deduplicate and cap top sources to max 3 unique document titles
  const uniqueDocSources = [];
  const seenDocNames = new Set();

  for (const src of sources) {
    if (!seenDocNames.has(src.documentName)) {
      seenDocNames.add(src.documentName);
      uniqueDocSources.push(src);
    }
    if (uniqueDocSources.length >= 3) break;
  }

  return {
    context,
    sources: uniqueDocSources,
  };
}

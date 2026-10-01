import { processDocument } from '../rag/documentProcessor.js';
import { deleteDocumentVectors, getRegisteredDocuments, clearAllVectors } from '../rag/qdrant.js';

/**
 * Handle document upload (PDF or TXT)
 */
export async function uploadDocument(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded. Please attach a PDF or TXT file." });
    }

    const { originalname, buffer, size } = req.file;

    console.log(`[Upload] Processing uploaded file: ${originalname} (${size} bytes)`);

    const result = await processDocument(buffer, originalname, size);

    res.status(200).json({
      message: "Document uploaded and indexed successfully in Qdrant.",
      document: result,
    });
  } catch (err) {
    console.error("[Upload Error]", err);
    res.status(500).json({ error: err.message || "Failed to process uploaded document." });
  }
}

/**
 * Get list of uploaded/indexed documents
 */
export async function getDocuments(req, res) {
  try {
    const docs = getRegisteredDocuments();
    res.status(200).json({ documents: docs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Delete a document by ID
 */
export async function deleteDocument(req, res) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Document ID parameter is required." });
    }

    await deleteDocumentVectors(id);

    res.status(200).json({
      message: `Document ${id} and all associated vectors removed successfully.`,
      documentId: id,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Purge All Indexed Documents and Vector Sources
 */
export async function purgeAllDocuments(req, res) {
  try {
    await clearAllVectors();
    res.status(200).json({
      message: "All document sources and vector embeddings have been deleted successfully.",
      documents: []
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Seed Sample University Documents (All predefined sample files purged)
 */
export async function seedSampleDocuments(req, res) {
  try {
    await clearAllVectors();
    res.status(200).json({
      message: "All previous document sources have been cleared. Ready for custom university PDF uploads!",
      documents: []
    });
  } catch (err) {
    console.error("Clear error:", err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * Get all extracted Q&A pairs from documents
 */
export async function getExtractedQa(req, res) {
  try {
    const fs = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    const { extractAllQaFromFolder } = await import('../rag/qaExtractor.js');

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const candidates = [
      path.resolve(__dirname, '../../../documents'),
      path.resolve(__dirname, '../../../Q&A'),
      path.resolve(__dirname, '../../documents'),
      path.resolve(__dirname, '../../Q&A')
    ];

    const docsDir = candidates.find(d => fs.existsSync(d) && fs.readdirSync(d).some(f => f.endsWith('.pdf')));
    if (!docsDir) {
      return res.status(404).json({ error: "No PDF directory found." });
    }

    const qaList = extractAllQaFromFolder(docsDir);

    let structuredQa = [];
    const structPath = path.join(docsDir, 'structured_qa.json');
    if (fs.existsSync(structPath)) {
      structuredQa = JSON.parse(fs.readFileSync(structPath, 'utf-8'));
    }

    res.status(200).json({
      count: qaList.length,
      qa: qaList,
      structuredQaCount: structuredQa.length,
      structuredQa: structuredQa
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Get categorized list of questions extracted from Q&A PDF documents
 */
export async function getExtractedQuestions(req, res) {
  try {
    const fs = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const candidates = [
      path.resolve(__dirname, '../../../Q&A/all_questions.json'),
      path.resolve(__dirname, '../../../documents/all_questions.json'),
      path.resolve(__dirname, '../data/all_questions.json')
    ];

    const targetFile = candidates.find(f => fs.existsSync(f));
    if (!targetFile) {
      return res.status(404).json({ error: "Questions dataset not generated yet." });
    }

    const data = JSON.parse(fs.readFileSync(targetFile, 'utf-8'));
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}


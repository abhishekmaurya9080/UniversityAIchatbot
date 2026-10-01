import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { v4 as uuidv4 } from 'uuid';
import zlib from 'zlib';
import { generateEmbedding } from './embeddings.js';
import { upsertPoints } from './qdrant.js';

function decodeAscii85(str) {
  let ascii = str.replace(/\s+/g, '');
  let bytes = [];
  let i = 0;
  while (i < ascii.length) {
    if (ascii[i] === '~' && ascii[i + 1] === '>') break;
    if (ascii[i] === 'z') {
      bytes.push(0, 0, 0, 0);
      i++;
      continue;
    }
    let chunk = ascii.substring(i, i + 5);
    let len = chunk.length;
    if (len < 5) chunk = chunk.padEnd(5, 'u');
    let val = 0;
    for (let j = 0; j < 5; j++) {
      val = val * 85 + (chunk.charCodeAt(j) - 33);
    }
    let b = [(val >> 24) & 0xff, (val >> 16) & 0xff, (val >> 8) & 0xff, val & 0xff];
    for (let j = 0; j < Math.min(4, len - 1); j++) {
      bytes.push(b[j]);
    }
    i += 5;
  }
  return Buffer.from(bytes);
}

function parseReportLabPdfStreams(fileBuffer) {
  const content = fileBuffer.toString('binary');
  const streamMatches = [...content.matchAll(/stream[\r\n]+([\s\S]*?)~>[\r\n]*endstream/g)];
  let extractedText = '';

  for (const match of streamMatches) {
    try {
      const raw = decodeAscii85(match[1]);
      const decompressed = zlib.inflateSync(raw).toString('utf-8');

      const tjMatches = [...decompressed.matchAll(/\((.*?)\)\s*Tj/g)];
      for (const tm of tjMatches) {
        const text = tm[1]
          .replace(/\\([0-7]{1,3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)))
          .replace(/\\(.)/g, '$1');
        extractedText += text + '\n';
      }
    } catch (err) {}
  }
  return extractedText.trim();
}

/**
 * Process uploaded PDF buffer or plain text document
 * @param {Buffer} fileBuffer 
 * @param {string} fileName 
 * @param {number} fileSize 
 * @returns {Promise<object>} Processing details
 */
export async function processDocument(fileBuffer, fileName, fileSize = 0) {
  const documentId = uuidv4();
  const timestamp = new Date().toISOString();
  let extractedText = "";
  let totalPages = 1;

  // 1. Extract text from PDF buffer or plain text file
  if (fileName.toLowerCase().endsWith('.pdf')) {
    try {
      const pdfData = await pdfParse(fileBuffer);
      extractedText = pdfData.text || "";
      totalPages = pdfData.numpages || 1;
    } catch (pdfErr) {
      // Custom ASCII85/Flate fallback for ReportLab generated PDFs
      const reportLabText = parseReportLabPdfStreams(fileBuffer);
      if (reportLabText) {
        extractedText = reportLabText;
      } else {
        extractedText = fileBuffer.toString('utf-8');
      }
    }
  } else {
    // TXT or MD document
    extractedText = fileBuffer.toString('utf-8');
  }

  // Clean text
  const cleanedText = extractedText
    .replace(/\r\n/g, '\n')
    .replace(/\0/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (!cleanedText) {
    throw new Error("No readable text could be extracted from the document.");
  }

  // 2. Chunk text using RecursiveCharacterTextSplitter
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 800,
    chunkOverlap: 150,
    separators: ["\n\n", "\n", " ", ""],
  });

  const rawChunks = await textSplitter.splitText(cleanedText);

  // 3. Generate embeddings & construct Qdrant points
  const points = [];
  const totalChunks = rawChunks.length;

  for (let i = 0; i < totalChunks; i++) {
    const chunkText = rawChunks[i];
    const estimatedPage = Math.min(
      totalPages,
      Math.max(1, Math.ceil(((i + 1) / totalChunks) * totalPages))
    );

    const pointId = uuidv4();
    const vector = await generateEmbedding(chunkText, "DOCUMENT");

    points.push({
      id: pointId,
      vector: vector,
      payload: {
        documentId: documentId,
        documentName: fileName,
        chunkIndex: i + 1,
        totalChunks: totalChunks,
        pageNumber: estimatedPage,
        text: chunkText,
        fileSize: fileSize,
        timestamp: timestamp,
      },
    });
  }

  // 4. Upsert into Qdrant
  await upsertPoints(points);

  return {
    documentId,
    documentName: fileName,
    totalChunks,
    totalPages,
    fileSize,
    timestamp,
  };
}

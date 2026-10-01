import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { processDocument } from './src/rag/documentProcessor.js';
import { initQdrantCollection, getRegisteredDocuments } from './src/rag/qdrant.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runIngestion() {
  console.log("=======================================================");
  console.log("📚 Starting University Chatbot PDF Document Ingestion");
  console.log("=======================================================\n");

  // Initialize Qdrant collection or in-memory vector store
  await initQdrantCollection();

  // Search potential document directories
  const candidateDirs = [
    path.resolve(__dirname, '../documents'),
    path.resolve(__dirname, '../Q&A'),
    path.resolve(__dirname, './documents'),
    path.resolve(__dirname, './Q&A')
  ];

  let docsDir = null;
  for (const dir of candidateDirs) {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir).filter(f => f.toLowerCase().endsWith('.pdf'));
      if (files.length > 0) {
        docsDir = dir;
        break;
      }
    }
  }

  if (!docsDir) {
    console.error("❌ Error: No directory with PDF files found. Looked in 'documents' and 'Q&A'.");
    process.exit(1);
  }

  console.log(`📁 Found PDF directory: ${docsDir}\n`);

  const files = fs.readdirSync(docsDir).filter(f => f.toLowerCase().endsWith('.pdf'));
  files.sort();

  console.log(`📄 Found ${files.length} PDF files to ingest:\n`);

  let totalDocsProcessed = 0;
  let totalChunksIngested = 0;
  const startTime = Date.now();

  for (let i = 0; i < files.length; i++) {
    const fileName = files[i];
    const filePath = path.join(docsDir, fileName);
    const stats = fs.statSync(filePath);
    const fileBuffer = fs.readFileSync(filePath);

    process.stdout.write(`[${i + 1}/${files.length}] Processing "${fileName}" (${(stats.size / 1024).toFixed(1)} KB)... `);

    try {
      const result = await processDocument(fileBuffer, fileName, stats.size);
      totalDocsProcessed++;
      totalChunksIngested += result.totalChunks;
      console.log(`✅ Success! (${result.totalPages} pages, ${result.totalChunks} chunks)`);
    } catch (err) {
      console.log(`❌ Failed: ${err.message}`);
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  const indexedDocs = getRegisteredDocuments();

  console.log("\n=======================================================");
  console.log("🎉 Document Ingestion Completed!");
  console.log(`⏱️ Time taken: ${duration} seconds`);
  console.log(`📄 Documents Processed: ${totalDocsProcessed}/${files.length}`);
  console.log(`🧩 Total Text Chunks Ingested: ${totalChunksIngested}`);
  console.log(`📊 Total Registered Documents in Vector Store: ${indexedDocs.length}`);
  console.log("=======================================================");
}

runIngestion().catch(err => {
  console.error("Fatal Ingestion Error:", err);
  process.exit(1);
});

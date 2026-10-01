import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { extractAllQaFromFolder } from './src/rag/qaExtractor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runExtraction() {
  console.log("=======================================================");
  console.log("🔍 Extracting Q&A Pairs from PDF Documents");
  console.log("=======================================================\n");

  const candidates = [
    path.resolve(__dirname, '../documents'),
    path.resolve(__dirname, '../Q&A'),
    path.resolve(__dirname, './documents'),
    path.resolve(__dirname, './Q&A')
  ];

  let docsDir = candidates.find(d => fs.existsSync(d) && fs.readdirSync(d).some(f => f.endsWith('.pdf')));

  if (!docsDir) {
    console.error("❌ No PDF directory found.");
    process.exit(1);
  }

  console.log(`📁 Scanning PDFs in: ${docsDir}`);
  const qaPairs = extractAllQaFromFolder(docsDir);

  console.log(`✅ Extracted ${qaPairs.length} Q&A pairs from 20 PDF documents.\n`);

  // Write output files
  const outputDirs = [
    path.resolve(__dirname, '../Q&A'),
    path.resolve(__dirname, '../documents'),
    path.resolve(__dirname, './Q&A')
  ].filter(d => fs.existsSync(d));

  const jsonContent = JSON.stringify(qaPairs, null, 2);

  for (const outDir of outputDirs) {
    const jsonPath = path.join(outDir, 'extracted_qa.json');
    fs.writeFileSync(jsonPath, jsonContent, 'utf-8');
    console.log(`💾 Saved structured Q&A JSON to: ${jsonPath}`);
  }

  console.log("\n=======================================================");
  console.log("🎉 Q&A Extraction Successfully Completed!");
  console.log(`📊 Total Q&A Entries: ${qaPairs.length}`);
  console.log("=======================================================");
}

runExtraction().catch(err => {
  console.error("Extraction error:", err);
  process.exit(1);
});

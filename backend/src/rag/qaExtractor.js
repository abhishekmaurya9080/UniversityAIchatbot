import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    for (let j = 0; j < 5; j++) val = val * 85 + (chunk.charCodeAt(j) - 33);
    let b = [(val >> 24) & 0xff, (val >> 16) & 0xff, (val >> 8) & 0xff, val & 0xff];
    for (let j = 0; j < Math.min(4, len - 1); j++) bytes.push(b[j]);
    i += 5;
  }
  return Buffer.from(bytes);
}

function parsePdfLines(fileBuf) {
  const content = fileBuf.toString('binary');
  const streamMatches = [...content.matchAll(/stream[\r\n]+([\s\S]*?)~>[\r\n]*endstream/g)];
  let lines = [];
  for (const match of streamMatches) {
    try {
      const raw = decodeAscii85(match[1]);
      const decompressed = zlib.inflateSync(raw).toString('utf-8');
      const tjMatches = [...decompressed.matchAll(/\((.*?)\)\s*Tj/g)];
      for (const tm of tjMatches) {
        const text = tm[1]
          .replace(/\\([0-7]{1,3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)))
          .replace(/\\(.)/g, '$1')
          .trim();
        if (text) lines.push(text);
      }
    } catch (err) {}
  }
  return lines;
}

export function extractQaFromPdfBuffer(fileBuf, fileName) {
  const lines = parsePdfLines(fileBuf);
  const category = fileName.replace(/^\d+_/, '').replace(/\.pdf$/, '').replace(/_/g, ' ');
  const qas = [];

  let currentQ = null;
  let currentA = '';

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];
    if (line.includes('?')) {
      if (currentQ) {
        qas.push({ category, sourceDocument: fileName, question: currentQ, answer: currentA.trim() });
      }
      const parts = line.split('?');
      currentQ = parts[0].replace(/^[•\-\*\d\.\s]+/, '').trim() + '?';
      currentA = parts.slice(1).join('?').trim();
    } else if (currentQ) {
      if (line === 'INDUS STATE UNIVERSITY' || line.includes('Common Questions') || line.includes('Fictional university')) {
        qas.push({ category, sourceDocument: fileName, question: currentQ, answer: currentA.trim() });
        currentQ = null;
        currentA = '';
      } else {
        currentA += (currentA ? ' ' : '') + line;
      }
    }
  }
  if (currentQ) {
    qas.push({ category, sourceDocument: fileName, question: currentQ, answer: currentA.trim() });
  }

  return qas;
}

export function extractAllQaFromFolder(folderPath) {
  if (!fs.existsSync(folderPath)) return [];
  const files = fs.readdirSync(folderPath).filter(f => f.toLowerCase().endsWith('.pdf'));
  files.sort();

  const allQa = [];
  for (const fileName of files) {
    const filePath = path.join(folderPath, fileName);
    const buf = fs.readFileSync(filePath);
    const qas = extractQaFromPdfBuffer(buf, fileName);
    allQa.push(...qas);
  }
  return allQa;
}

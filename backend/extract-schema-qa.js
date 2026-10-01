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

function buildStructuredSchema(fileName, fileBuf) {
  const lines = parsePdfLines(fileBuf);
  const rawTitle = fileName.replace(/^\d+_/, '').replace(/\.pdf$/, '').replace(/_/g, ' ');
  const intentName = fileName.replace(/^\d+_/, '').replace(/\.pdf$/, '').toLowerCase();

  // Extract explicit questions from PDF text
  const explicitQuestions = [];
  lines.forEach(l => {
    if (l.includes('?')) {
      const parts = l.split('?');
      const q = parts[0].replace(/^[•\-\*\d\.\s]+/, '').trim() + '?';
      if (q.length > 5) explicitQuestions.push(q);
    }
  });

  // Category mapping
  const categoryMap = {
    "01_Admission_and_Registration.pdf": "Admissions",
    "02_Courses_and_Syllabus.pdf": "Academics",
    "03_Examination_Schedules_and_Rules.pdf": "Examinations",
    "04_Results_and_Grading.pdf": "Grading & Results",
    "05_Attendance_Rules.pdf": "Academic Policies",
    "06_Fees_and_Scholarships.pdf": "Finance & Scholarships",
    "07_Academic_Regulations.pdf": "Academic Governance",
    "08_Departments_and_Faculty.pdf": "Departments & Faculty",
    "09_Hostel_Information.pdf": "Hostel & Accommodation",
    "10_Library_Facilities.pdf": "Library & Resources",
    "11_Placement_Information.pdf": "Placements & Careers",
    "12_University_Notices.pdf": "University Notices",
    "13_Important_Dates.pdf": "Academic Calendar",
    "14_Student_Services.pdf": "Student Support",
    "15_Frequently_Asked_Questions.pdf": "General FAQs",
    "16_Transfer_and_Migration.pdf": "Transfer & Migration",
    "17_Certificates_and_Documents.pdf": "Certificates & Verification",
    "18_Campus_and_Facilities.pdf": "Campus Infrastructure",
    "19_Grievance_and_Support.pdf": "Grievance & Redressal",
    "20_Career_and_Internships.pdf": "Career & Internships"
  };

  const category = categoryMap[fileName] || rawTitle;

  // Build question variations
  const questions = explicitQuestions.length > 0 ? explicitQuestions : [
    `How do I get information about ${rawTitle.toLowerCase()}?`,
    `What are the rules and guidelines for ${rawTitle.toLowerCase()}?`,
    `Where can I find details regarding ${rawTitle.toLowerCase()}?`
  ];

  // Extract steps / bullet points
  const steps = [];
  const documents = [];
  const importantNotes = [];
  let summary = "";
  let eligibility = "N/A";
  let fees = "N/A";
  let deadline = "N/A";
  let office = "Academic & Student Affairs Office";

  lines.forEach(line => {
    const clean = line.replace(/^[•\-\*\d\.\s]+/, '').trim();
    const lower = clean.toLowerCase();

    if (!summary && clean.length > 20 && !clean.includes('INDUS STATE') && !clean.includes('Fictional')) {
      summary = clean;
    }

    if (lower.includes('eligib') || lower.includes('criteria') || lower.includes('requirement')) {
      if (eligibility === "N/A") eligibility = clean;
    }

    if (lower.includes('fee') || lower.includes('tuition') || lower.includes('cost') || lower.includes('rs.') || lower.includes('$')) {
      if (fees === "N/A") fees = clean;
    }

    if (lower.includes('date') || lower.includes('deadline') || lower.includes('schedule') || lower.includes('period') || lower.includes('semester')) {
      if (deadline === "N/A") deadline = clean;
    }

    if (lower.includes('office') || lower.includes('portal') || lower.includes('department') || lower.includes('cell')) {
      office = clean;
    }

    if (lower.includes('certificate') || lower.includes('proof') || lower.includes('photo') || lower.includes('marksheets') || lower.includes('passport')) {
      documents.push(clean);
    } else if (lower.includes('rule') || lower.includes('note') || lower.includes('must') || lower.includes('mandatory') || lower.includes('policy')) {
      importantNotes.push(clean);
    } else if (clean.length > 15 && !lower.includes('indus state') && !lower.includes('common questions')) {
      steps.push(clean);
    }
  });

  return {
    category,
    intent: intentName,
    questions,
    answer: {
      summary: summary || `Official guidelines and policy information for ${rawTitle}.`,
      eligibility: eligibility !== "N/A" ? eligibility : "Subject to university regulations and eligibility criteria published for the program.",
      steps: steps.length > 0 ? steps.slice(0, 6) : [`Consult the ${rawTitle} guidelines on the official portal.`],
      documents: documents.length > 0 ? Array.from(new Set(documents)).slice(0, 5) : ["Government ID proof", "Academic marksheets"],
      fees: fees !== "N/A" ? fees : "Refer to the fee schedule on the student account portal.",
      deadline: deadline !== "N/A" ? deadline : "As per the official university academic calendar.",
      office: office || "Academic Affairs Office",
      important_notes: importantNotes.length > 0 ? Array.from(new Set(importantNotes)).slice(0, 5) : ["Students must verify details on the official student portal."]
    }
  };
}

async function runSchemaExtraction() {
  console.log("=======================================================");
  console.log("📊 Extracting Full Intent Schema Q&A for 20 Documents");
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

  const files = fs.readdirSync(docsDir).filter(f => f.endsWith('.pdf'));
  files.sort();

  const dataset = [];
  for (let i = 0; i < files.length; i++) {
    const fileName = files[i];
    const fileBuf = fs.readFileSync(path.join(docsDir, fileName));
    const record = buildStructuredSchema(fileName, fileBuf);
    dataset.push(record);
    console.log(`[${i + 1}/${files.length}] Extracted "${record.category}" -> intent: "${record.intent}" (${record.questions.length} question variations)`);
  }

  const jsonFormatted = JSON.stringify(dataset, null, 2);

  const targetPaths = [
    path.resolve(__dirname, '../Q&A/structured_qa.json'),
    path.resolve(__dirname, '../documents/structured_qa.json'),
    path.resolve(__dirname, './src/data/structured_qa.json')
  ];

  for (const t of targetPaths) {
    fs.mkdirSync(path.dirname(t), { recursive: true });
    fs.writeFileSync(t, jsonFormatted, 'utf-8');
    console.log(`💾 Saved dataset to: ${t}`);
  }

  console.log("\n=======================================================");
  console.log(`🎉 Extracted ${dataset.length} structured intent records successfully!`);
  console.log("=======================================================");
}

runSchemaExtraction().catch(console.error);

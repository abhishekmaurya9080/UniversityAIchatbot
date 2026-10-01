# 🎓 AI-Powered University Support Chatbot

A production-ready **AI University Support Chatbot** built using **Node.js, LangGraph, Google Gemini LLM, Qdrant Vector Database, and Retrieval-Augmented Generation (RAG)**.

---

## 🌟 Key Features

* **Grounded RAG Answers**: Answers student inquiries strictly using official uploaded university documents (policies, attendance, syllabus, exam guide, fee structure, hostel rules, library services).
* **LangGraph State Workflow**: Uses `@langchain/langgraph` state graphs to orchestrate multi-step AI reasoning:
  `START ➔ Understand Question ➔ Route Search ➔ Qdrant Retrieval ➔ Context Evaluation ➔ Gemini Generation ➔ Answer Validation ➔ END`
* **Source-Aware Citations**: Every response highlights official source document names, page numbers, relevance match scores, and expandable context snippets.
* **Multi-Format Document Processing**: Upload PDFs, TXT, or MD documents with automated text extraction, chunking (`RecursiveCharacterTextSplitter`), and embedding generation (`text-embedding-004`).
* **Qdrant Vector Database**: Full integration with Qdrant Vector DB via `@qdrant/js-client-rest` with hybrid in-memory fallback for instant keyless out-of-the-box testing.
* **Sleek React Frontend**: Dark Sapphire Glassmorphic interface with real-time chat streaming, sample question chips, drag & drop PDF upload zone, 1-click sample document seeder, and system status inspector.

---

## 🏗 System Architecture

```text
                    ┌─────────────────┐
                    │   React Client  │
                    │  Chat + Upload  │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Node.js/Express │
                    │     Backend     │
                    └────────┬────────┘
                             │
                 ┌───────────┴───────────┐
                 │                       │
                 ▼                       ▼
        ┌────────────────┐       ┌────────────────┐
        │ PDF Processing │       │   LangGraph    │
        │ Extract/Chunk  │       │ AI Workflow    │
        └───────┬────────┘       └───────┬────────┘
                │                        │
                ▼                        ▼
        ┌────────────────┐       ┌────────────────┐
        │   Embeddings   │       │ Gemini LLM     │
        └───────┬────────┘       └───────┬────────┘
                │                        │
                ▼                        │
        ┌────────────────┐               │
        │     Qdrant     │◄──────────────┘
        │ Vector Database│
        └────────────────┘
```

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js**: v18 or higher installed
* **Google Gemini API Key**: Get a free API key from [Google AI Studio](https://aistudio.google.com)
* **Qdrant Vector DB** *(Optional)*: Local Docker instance (`docker run -p 6333:6333 qdrant/qdrant`) or Qdrant Cloud cluster.

---

### 1. Environment Configuration

Create a `.env` file in the root directory (or in `backend/.env`):

```env
# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Qdrant Vector Database URL
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=
QDRANT_COLLECTION=university_documents

# Server Port
PORT=5000
```

---

### 2. Start Backend Server

```bash
cd backend
npm start
```
*Backend will run on `http://localhost:5000`.*

---

### 3. Start Frontend Client

```bash
cd frontend
npm run dev
```
*Frontend will run on `http://localhost:5173`.*

---

## 📡 API Reference

### 1. Send Question to RAG Chatbot
`POST /api/chat`

**Request Body:**
```json
{
  "question": "What is the minimum attendance required for the semester?",
  "conversationHistory": [
    { "role": "student", "content": "Hello" }
  ]
}
```

**Response:**
```json
{
  "answer": "According to the university attendance policy, the minimum required attendance for all undergraduate and postgraduate students is 75% per semester per course module.",
  "sources": [
    {
      "documentName": "University_Attendance_Policy.pdf",
      "pageNumber": 1,
      "score": 0.92,
      "text": "1. ATTENDANCE REQUIREMENTS: Minimum required attendance for all undergraduate and postgraduate students is 75%..."
    }
  ],
  "category": "General",
  "confidenceScore": 0.95
}
```

---

### 2. Upload University Document
`POST /api/documents/upload`

**Form Data:**
* `file`: Attach `.pdf`, `.txt`, or `.md` file.

---

### 3. Seed Sample University Documents
`POST /api/documents/seed-sample`

Indexes 4 official sample university policy PDFs (Attendance, Examinations & Grading, Fees & Scholarships, Hostel & Campus Facilities) in 1 click.

---

### 4. Get List of Uploaded Documents
`GET /api/documents`

---

### 5. Delete Document & Purge Vectors
`DELETE /api/documents/:id`

Deletes the document entry and purges all vector embeddings from Qdrant.

---

## 🛠 Tech Stack

* **Backend**: Node.js, Express.js, `@google/genai`, `@langchain/langgraph`, `@langchain/core`, `@langchain/textsplitters`, `@qdrant/js-client-rest`, `pdf-parse`, `multer`
* **Frontend**: React.js, Vite, `lucide-react`, `axios`, Vanilla CSS Design System
* **Vector DB**: Qdrant
* **AI Model**: Google Gemini (`gemini-2.5-flash` / `text-embedding-004`)

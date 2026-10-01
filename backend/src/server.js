import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { connectDB } from './config/db.js';
import { initQdrantCollection } from './rag/qdrant.js';
import chatHistoryRoutes from './routes/chatHistory.routes.js';
import documentRoutes from './routes/documents.js';
import authRoutes from './routes/auth.routes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// API Routes
app.use('/api/chat', chatHistoryRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/auth', authRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'CampusAI Support Chatbot Backend',
    geminiConfigured: !!config.geminiApiKey,
    qdrantUrl: config.qdrantUrl,
    mongodbUri: config.mongodbUri,
    timestamp: new Date().toISOString(),
  });
});

// Start Server
const PORT = config.port;

app.listen(PORT, '0.0.0.0', async () => {
  console.log(`=======================================================`);
  console.log(`🎓 CampusAI Support Chatbot Backend running on port ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);

  // Connect to MongoDB Database for Chat History
  await connectDB();

  // Initialize Qdrant Collection for RAG Knowledge
  await initQdrantCollection();
});

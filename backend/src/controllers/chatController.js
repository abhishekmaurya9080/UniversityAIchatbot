import { runUniversityChatGraph } from '../ai/graph.js';

/**
 * Chat Controller - Handles student questions using LangGraph & Qdrant RAG
 */
export async function handleChat(req, res) {
  try {
    const { question, conversationHistory } = req.body;

    if (!question || typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({ error: "Student question is required." });
    }

    console.log(`[Chat Controller] New question received: "${question.trim()}"`);

    const result = await runUniversityChatGraph(
      question.trim(),
      Array.isArray(conversationHistory) ? conversationHistory : []
    );

    res.status(200).json({
      answer: result.answer,
      sources: result.sources,
      category: result.category,
      confidenceScore: result.confidenceScore,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[Chat Controller Error]", err);
    res.status(500).json({
      error: err.message || "An error occurred while processing your question.",
    });
  }
}

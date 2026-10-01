import { runCampusAIGraph } from '../graph/chatbot.graph.js';
import {
  saveChat,
  getChatHistory,
  deleteConversation,
} from '../services/chatHistory.service.js';

/**
 * Handle AI Chat processing with LangGraph + Qdrant RAG + automatic MongoDB persistence
 */
export async function handleChatMessage(req, res) {
  try {
    const { conversationId, userId, question, messages, conversationHistory } = req.body;

    if (!question || typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Student question is required.',
      });
    }

    // Default userId to 'student001' if omitted
    const effectiveUserId = userId || 'student001';

    const convId = conversationId || `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const userQuestionText = question.trim();

    // 1. Save user question to MongoDB chat history
    await saveChat({
      conversationId: convId,
      userId: effectiveUserId,
      role: 'user',
      content: userQuestionText,
    });

    // Support both `messages` and `conversationHistory` payload formats
    const historyArray = Array.isArray(messages) ? messages : (Array.isArray(conversationHistory) ? conversationHistory : []);

    // 2. Execute LangGraph RAG workflow with Gemini & Qdrant
    const aiResult = await runCampusAIGraph({
      conversationId: convId,
      userId: effectiveUserId,
      question: userQuestionText,
      messages: historyArray,
    });

    // 3. Save assistant response to MongoDB chat history
    const savedChat = await saveChat({
      conversationId: convId,
      userId: effectiveUserId,
      role: 'assistant',
      content: aiResult.answer,
    });

    return res.status(200).json({
      success: true,
      answer: aiResult.answer,
      sources: aiResult.sources || [],
      conversationId: convId,
      userId: effectiveUserId,
      timestamp: new Date().toISOString(),
      data: {
        conversationId: convId,
        userId: effectiveUserId,
        answer: aiResult.answer,
        sources: aiResult.sources || [],
        title: savedChat.title,
        updatedAt: savedChat.updatedAt,
      },
    });
  } catch (err) {
    console.error('[Chat Controller Error]', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'An error occurred while processing the chat inquiry.',
    });
  }
}

/**
 * Get user chat history (summaries only, no full message history)
 * GET /api/chat/history/:userId
 */
export async function fetchUserHistory(req, res) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId parameter is required.',
      });
    }

    const history = await getChatHistory(userId);

    return res.status(200).json({
      success: true,
      data: history,
    });
  } catch (err) {
    console.error('[Fetch History Error]', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to retrieve chat history.',
    });
  }
}

/**
 * Save a single chat message directly
 * POST /api/chat/:conversationId/message
 */
export async function saveSingleMessage(req, res) {
  try {
    const { conversationId } = req.params;
    const { userId, role, content, title } = req.body;

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: 'Missing conversationId in route path.',
      });
    }

    if (!userId || !role || !content) {
      return res.status(400).json({
        success: false,
        message: 'userId, role, and content are required in the request body.',
      });
    }

    const conversation = await saveChat({
      conversationId,
      userId,
      role,
      content,
      title,
    });

    return res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (err) {
    console.error('[Save Message Error]', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to save message.',
    });
  }
}

/**
 * Delete a user conversation
 * DELETE /api/chat/:conversationId/:userId
 */
export async function removeUserConversation(req, res) {
  try {
    const { conversationId, userId } = req.params;

    if (!conversationId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Both conversationId and userId parameters are required.',
      });
    }

    const deleted = await deleteConversation(conversationId, userId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found or unauthorized access.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Conversation deleted successfully.',
    });
  } catch (err) {
    console.error('[Delete Conversation Error]', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to delete conversation.',
    });
  }
}

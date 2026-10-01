import express from 'express';
import {
  handleChatMessage,
  fetchUserHistory,
  saveSingleMessage,
  removeUserConversation,
} from '../controllers/chat.controller.js';

const router = express.Router();

/**
 * GET /api/chat/history/:userId
 * Retrieves history summaries for a specific user
 */
router.get('/history/:userId', fetchUserHistory);

/**
 * POST /api/chat/:conversationId/message
 * Saves a single message to a conversation
 */
router.post('/:conversationId/message', saveSingleMessage);

/**
 * DELETE /api/chat/:conversationId/:userId
 * Deletes a conversation belonging to a specific user
 */
router.delete('/:conversationId/:userId', removeUserConversation);

/**
 * POST /api/chat/message or POST /api/chat/
 * Main endpoint for user questions - executes LangGraph + RAG + automatic history save
 */
router.post('/message', handleChatMessage);
router.post('/', handleChatMessage);

export default router;

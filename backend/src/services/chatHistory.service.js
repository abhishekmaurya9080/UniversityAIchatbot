import Chat from '../models/Chat.js';

/**
 * Save a message into a conversation (creates new conversation if non-existent, or appends message if exists)
 * @param {Object} params
 * @param {string} params.conversationId - Unique conversation identifier
 * @param {string} params.userId - User identifier
 * @param {"user" | "assistant"} params.role - Message role
 * @param {string} params.content - Message text content
 * @param {string} [params.title] - Conversation title
 */
export async function saveChat({ conversationId, userId, role, content, title }) {
  if (!conversationId || !userId || !role || !content) {
    throw new Error("Missing required parameters: conversationId, userId, role, and content are required.");
  }

  const newMessage = {
    role,
    content,
    timestamp: new Date(),
  };

  try {
    // Find existing conversation
    let chat = await Chat.findOne({ conversationId });

    if (!chat) {
      // Determine title if not explicitly provided
      const conversationTitle = title || (content.length > 35 ? content.substring(0, 35) + '...' : content);

      // Create a new conversation
      chat = new Chat({
        conversationId,
        userId,
        title: conversationTitle,
        messages: [newMessage],
      });

      await chat.save();
    } else {
      // Append message and update timestamp
      chat.messages.push(newMessage);
      if (title && (chat.title === 'New Conversation' || !chat.title)) {
        chat.title = title;
      }
      chat.updatedAt = new Date();
      await chat.save();
    }

    return chat;
  } catch (dbErr) {
    console.warn(`[saveChat Warning] Could not persist to MongoDB (${dbErr.message}). Continuing in-memory.`);
    return {
      conversationId,
      userId,
      title: title || content.substring(0, 35),
      messages: [newMessage],
      updatedAt: new Date(),
    };
  }
}

/**
 * Retrieve all conversations for a specific user without full messages payload
 * @param {string} userId - User identifier
 * @returns {Promise<Array<{conversationId: string, title: string, createdAt: Date, updatedAt: Date, lastMessage: string}>>}
 */
export async function getChatHistory(userId) {
  if (!userId) {
    throw new Error("userId is required to fetch chat history.");
  }

  // Find conversations for user, sorted by updatedAt descending
  const conversations = await Chat.find({ userId })
    .select('conversationId title createdAt updatedAt messages')
    .sort({ updatedAt: -1 })
    .lean();

  // Return formatted array without complete messages array
  return conversations.map((conv) => {
    const lastMsgObj = conv.messages && conv.messages.length > 0
      ? conv.messages[conv.messages.length - 1]
      : null;

    return {
      conversationId: conv.conversationId,
      title: conv.title || 'Untitled Chat',
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
      lastMessage: lastMsgObj ? lastMsgObj.content : '',
    };
  });
}

/**
 * Delete a specific conversation belonging to a user
 * @param {string} conversationId - Unique conversation identifier
 * @param {string} userId - User identifier
 * @returns {Promise<boolean>} True if deleted successfully, false otherwise
 */
export async function deleteConversation(conversationId, userId) {
  if (!conversationId || !userId) {
    throw new Error("Both conversationId and userId are required to delete a conversation.");
  }

  // Ensure deletion ONLY targets the matching conversationId AND userId
  const result = await Chat.deleteOne({ conversationId, userId });

  return result.deletedCount > 0;
}

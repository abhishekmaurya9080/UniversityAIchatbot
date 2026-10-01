import { StateGraph, Annotation, START, END } from "@langchain/langgraph";
import { GoogleGenAI } from "@google/genai";
import { config } from "../config/env.js";
import { retrieveRelevantContext } from "../rag/retriever.js";
import { RAG_ANSWER_PROMPT } from "../ai/prompts.js";

// Define LangGraph State Schema for CampusAI
export const CampusAIStateAnnotation = Annotation.Root({
  conversationId: Annotation({ reducer: (x, y) => (y !== undefined ? y : x) }),
  userId: Annotation({ reducer: (x, y) => (y !== undefined ? y : x) }),
  messages: Annotation({ reducer: (x, y) => (y !== undefined ? y : x), default: () => [] }),
  question: Annotation({ reducer: (x, y) => (y !== undefined ? y : x) }),
  context: Annotation({ reducer: (x, y) => (y !== undefined ? y : x), default: () => '' }),
  sources: Annotation({ reducer: (x, y) => (y !== undefined ? y : x), default: () => [] }),
  answer: Annotation({ reducer: (x, y) => (y !== undefined ? y : x), default: () => '' }),
  category: Annotation({ reducer: (x, y) => (y !== undefined ? y : x), default: () => 'General' }),
});

let aiInstance = null;
function getAiClient() {
  if (!config.geminiApiKey) return null;
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey: config.geminiApiKey });
  }
  return aiInstance;
}

/**
 * Node 1: Retrieve context from Qdrant Vector DB
 */
async function retrieveContextNode(state) {
  const query = state.question;
  console.log(`[CampusAI LangGraph] Searching Qdrant Vector DB for query: "${query}"`);

  try {
    const { context, sources } = await retrieveRelevantContext(query, 5);
    return {
      ...state,
      context,
      sources,
    };
  } catch (err) {
    console.error(`[CampusAI Qdrant Error] ${err.message}`);
    return {
      ...state,
      context: '',
      sources: [],
    };
  }
}

/**
 * Node 2: Generate Answer using Gemini with limited past messages context
 */
async function generateAnswerNode(state) {
  console.log(`[CampusAI LangGraph] Generating answer with Gemini LLM...`);
  const ai = getAiClient();

  if (!ai) {
    if (state.sources && state.sources.length > 0) {
      const topSource = state.sources[0];
      return {
        ...state,
        answer: `According to **${topSource.documentName}**:\n\n${topSource.text}\n\n*(Note: Set GEMINI_API_KEY for full AI response).*`,
      };
    }
    return {
      ...state,
      answer: "⚠️ Gemini API key is missing. Please set GEMINI_API_KEY in your .env file.",
    };
  }

  // Limit past messages passed to Gemini to latest 10 messages for efficiency
  const recentMessages = Array.isArray(state.messages) ? state.messages.slice(-10) : [];
  
  const prompt = RAG_ANSWER_PROMPT(
    state.question,
    state.context || '',
    recentMessages
  );

  const modelsToTry = ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-flash-latest'];
  let lastErr = null;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        signal: AbortSignal.timeout(4000),
      });

      if (response && response.text) {
        return {
          ...state,
          answer: response.text,
        };
      }
    } catch (err) {
      lastErr = err;
      console.warn(`[CampusAI Model Warning] ${model} failed (${err.message}). Trying fallback...`);
    }
  }

  if (state.sources && state.sources.length > 0) {
    const topSource = state.sources[0];
    return {
      ...state,
      answer: `According to official university document (**${topSource.documentName}**):\n\n${topSource.text}`,
    };
  }

  return {
    ...state,
    answer: `The system is currently experiencing high server traffic from the AI provider. Please try your question again in a moment.`,
  };
}

// Build StateGraph Workflow
const workflow = new StateGraph(CampusAIStateAnnotation)
  .addNode("retrieveContext", retrieveContextNode)
  .addNode("generateAnswer", generateAnswerNode)
  .addEdge(START, "retrieveContext")
  .addEdge("retrieveContext", "generateAnswer")
  .addEdge("generateAnswer", END);

export const campusAIGraph = workflow.compile();

/**
 * Execute the LangGraph workflow for CampusAI
 * @param {Object} params
 * @param {string} params.conversationId
 * @param {string} params.userId
 * @param {string} params.question
 * @param {Array<{role: string, content: string}>} [params.messages]
 */
export async function runCampusAIGraph({ conversationId, userId, question, messages = [] }) {
  const initialState = {
    conversationId,
    userId,
    question,
    messages,
    context: '',
    sources: [],
    answer: '',
  };

  const finalState = await campusAIGraph.invoke(initialState);

  return {
    answer: finalState.answer,
    sources: finalState.sources || [],
    context: finalState.context || '',
  };
}

import { GoogleGenAI } from '@google/genai';
import { config } from '../config/env.js';
import { retrieveRelevantContext } from '../rag/retriever.js';
import {
  UNDERSTAND_QUESTION_PROMPT,
  RAG_ANSWER_PROMPT,
  VALIDATE_ANSWER_PROMPT,
} from './prompts.js';

let aiInstance = null;

function getAiClient() {
  if (!config.geminiApiKey) {
    return null;
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey: config.geminiApiKey });
  }
  return aiInstance;
}

/**
 * Call Gemini LLM with automatic model fallback
 */
async function callGemini(prompt, isJson = false) {
  const ai = getAiClient();
  if (!ai) {
    throw new Error("GEMINI_API_KEY is missing. Please set your Gemini API key in the environment or backend configuration.");
  }

  const modelsToTry = ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-flash-latest'];
  let lastErr = null;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: isJson ? { responseMimeType: 'application/json' } : undefined,
        signal: AbortSignal.timeout(4000),
      });

      if (response && response.text) {
        return response.text;
      }
    } catch (err) {
      lastErr = err;
      console.warn(`[Gemini Model Warning] Model ${model} failed (${err.message}). Trying next fallback model...`);
    }
  }

  throw lastErr || new Error("Failed to generate response from Gemini API.");
}

/**
 * Node 1: Understand Question
 */
export async function understandQuestionNode(state) {
  console.log(`[LangGraph Node] Understand Question: "${state.userQuestion}"`);
  
  if (!config.geminiApiKey) {
    return {
      ...state,
      searchQuery: state.userQuestion,
      needSearch: true,
    };
  }

  try {
    const prompt = UNDERSTAND_QUESTION_PROMPT(state.userQuestion, state.conversationHistory || []);
    const rawResult = await callGemini(prompt, true);
    
    let parsed = { requiresSearch: true, rewrittenQuery: state.userQuestion };
    try {
      parsed = JSON.parse(rawResult);
    } catch (e) {
      console.warn("[Node Understand] JSON parse fallback");
    }

    return {
      ...state,
      searchQuery: parsed.rewrittenQuery || state.userQuestion,
      needSearch: parsed.requiresSearch !== false,
      category: parsed.category || 'General',
    };
  } catch (err) {
    console.error(`[Node Understand Error] ${err.message}`);
    return {
      ...state,
      searchQuery: state.userQuestion,
      needSearch: true,
    };
  }
}

/**
 * Node 2: Retrieve from Qdrant Vector DB
 */
export async function retrieveDocumentsNode(state) {
  const query = state.searchQuery || state.userQuestion;
  console.log(`[LangGraph Node] Retrieve Documents from Qdrant for query: "${query}"`);

  try {
    const { context, sources } = await retrieveRelevantContext(query, 5);
    return {
      ...state,
      context: context,
      sources: sources,
    };
  } catch (err) {
    console.error(`[Node Retrieve Error] ${err.message}`);
    return {
      ...state,
      context: '',
      sources: [],
    };
  }
}

/**
 * Node 3: Evaluate Retrieved Context
 */
export async function evaluateContextNode(state) {
  const hasContext = !!(state.context && state.context.trim().length > 0);
  console.log(`[LangGraph Node] Evaluate Context - Found context: ${hasContext}, Sources count: ${state.sources?.length || 0}`);

  return {
    ...state,
    hasContext: hasContext,
  };
}

/**
 * Node 4: Generate Answer using Gemini
 */
export async function generateAnswerNode(state) {
  console.log(`[LangGraph Node] Generate Answer using Gemini`);

  if (!config.geminiApiKey) {
    if (state.sources && state.sources.length > 0) {
      const topSource = state.sources[0];
      return {
        ...state,
        generatedAnswer: `According to **${topSource.documentName}** (Page ${topSource.pageNumber}):\n\n${topSource.text}\n\n*(Note: Configure \`GEMINI_API_KEY\` in your \`.env\` file for full LLM natural language synthesis and multi-document reasoning).*`,
      };
    }
    return {
      ...state,
      generatedAnswer: "⚠️ Gemini API key is missing. Please add `GEMINI_API_KEY` to `.env` file to enable AI answers.",
    };
  }

  try {
    const prompt = RAG_ANSWER_PROMPT(
      state.userQuestion,
      state.context,
      state.conversationHistory || []
    );

    const answer = await callGemini(prompt, false);

    return {
      ...state,
      generatedAnswer: answer,
    };
  } catch (err) {
    console.error(`[Node Generate Error] ${err.message}`);
    return {
      ...state,
      generatedAnswer: `I encountered an error processing your query with Gemini LLM: ${err.message}`,
    };
  }
}

/**
 * Node 5: Validate Answer
 */
export async function validateAnswerNode(state) {
  console.log(`[LangGraph Node] Validate Answer`);

  if (!config.geminiApiKey || !state.generatedAnswer) {
    return {
      ...state,
      finalAnswer: state.generatedAnswer || "No answer generated.",
      isValidated: true,
    };
  }

  try {
    const prompt = VALIDATE_ANSWER_PROMPT(
      state.userQuestion,
      state.context || '',
      state.generatedAnswer
    );

    const rawResult = await callGemini(prompt, true);
    let parsed = { isValid: true, refinedAnswer: state.generatedAnswer, confidenceScore: 0.95 };
    try {
      parsed = JSON.parse(rawResult);
    } catch (e) {
      // JSON parsing fallback
    }

    return {
      ...state,
      finalAnswer: parsed.refinedAnswer || state.generatedAnswer,
      confidenceScore: parsed.confidenceScore || 0.9,
      isValidated: true,
    };
  } catch (err) {
    console.warn(`[Node Validate Warning] ${err.message}`);
    return {
      ...state,
      finalAnswer: state.generatedAnswer,
      isValidated: false,
    };
  }
}

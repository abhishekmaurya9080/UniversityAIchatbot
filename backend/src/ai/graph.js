import { StateGraph, Annotation, START, END } from "@langchain/langgraph";
import {
  understandQuestionNode,
  retrieveDocumentsNode,
  evaluateContextNode,
  generateAnswerNode,
  validateAnswerNode,
} from "./nodes.js";

// Define the State Schema for University Chatbot LangGraph
const ChatbotStateAnnotation = Annotation.Root({
  userQuestion: Annotation({ reducer: (x, y) => (y !== undefined ? y : x) }),
  conversationHistory: Annotation({ reducer: (x, y) => (y !== undefined ? y : x), default: () => [] }),
  searchQuery: Annotation({ reducer: (x, y) => (y !== undefined ? y : x) }),
  needSearch: Annotation({ reducer: (x, y) => (y !== undefined ? y : x), default: () => true }),
  context: Annotation({ reducer: (x, y) => (y !== undefined ? y : x), default: () => '' }),
  sources: Annotation({ reducer: (x, y) => (y !== undefined ? y : x), default: () => [] }),
  hasContext: Annotation({ reducer: (x, y) => (y !== undefined ? y : x), default: () => false }),
  generatedAnswer: Annotation({ reducer: (x, y) => (y !== undefined ? y : x), default: () => '' }),
  finalAnswer: Annotation({ reducer: (x, y) => (y !== undefined ? y : x), default: () => '' }),
  confidenceScore: Annotation({ reducer: (x, y) => (y !== undefined ? y : x), default: () => 0 }),
  isValidated: Annotation({ reducer: (x, y) => (y !== undefined ? y : x), default: () => false }),
  category: Annotation({ reducer: (x, y) => (y !== undefined ? y : x), default: () => 'General' }),
});

// Create StateGraph instance
const workflow = new StateGraph(ChatbotStateAnnotation)
  .addNode("understandQuestion", understandQuestionNode)
  .addNode("retrieveDocuments", retrieveDocumentsNode)
  .addNode("evaluateContext", evaluateContextNode)
  .addNode("generateAnswer", generateAnswerNode)
  .addNode("validateAnswer", validateAnswerNode)

  // Edge from START to understandQuestion
  .addEdge(START, "understandQuestion")

  // Conditional Routing after understanding question
  .addConditionalEdges("understandQuestion", (state) => {
    return state.needSearch ? "retrieveDocuments" : "generateAnswer";
  })

  // Flow: retrieve -> evaluate -> generate -> validate -> END
  .addEdge("retrieveDocuments", "evaluateContext")
  .addEdge("evaluateContext", "generateAnswer")
  .addEdge("generateAnswer", "validateAnswer")
  .addEdge("validateAnswer", END);

// Compile Graph
export const universityGraph = workflow.compile();

/**
 * Execute the LangGraph workflow for a user inquiry
 * @param {string} question 
 * @param {Array<{role: string, content: string}>} history 
 */
export async function runUniversityChatGraph(question, history = []) {
  const initialState = {
    userQuestion: question,
    conversationHistory: history,
    needSearch: true,
    context: '',
    sources: [],
    hasContext: false,
    generatedAnswer: '',
    finalAnswer: '',
    confidenceScore: 0,
    isValidated: false,
    category: 'General',
  };

  const finalState = await universityGraph.invoke(initialState);

  return {
    answer: finalState.finalAnswer || finalState.generatedAnswer || "I'm sorry, I couldn't generate an answer.",
    sources: finalState.sources || [],
    context: finalState.context || '',
    category: finalState.category || 'General',
    confidenceScore: finalState.confidenceScore || 0.9,
  };
}

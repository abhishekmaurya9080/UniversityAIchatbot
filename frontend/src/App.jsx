import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './components/Header';
import AcademicStatusBar from './components/AcademicStatusBar';
import StudentSidebar from './components/StudentSidebar';
import ChatWindow from './components/ChatWindow';
import HelpfulResources from './components/HelpfulResources';
import MobileNavigation from './components/MobileNavigation';
import DocumentManager from './components/DocumentManager';
import AuthModal from './components/AuthModal';

const API_BASE_URL = window.location.origin.includes('5173') ? '/api' : 'http://127.0.0.1:5000/api';

export default function App() {
  const [activeNav, setActiveNav] = useState('chat'); // 'chat' | 'services' | 'requests'
  const [activeTopic, setActiveTopic] = useState('courses');
  const [mobileTab, setMobileTab] = useState('chat'); // 'chat' | 'topics' | 'resources'
  const [messages, setMessages] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('campusai_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const effectiveUserId = currentUser ? (currentUser.id || currentUser.studentId) : 'student001';
  const studentName = currentUser ? currentUser.name : 'Abhishek';

  useEffect(() => {
    fetchDocuments();
    fetchChatHistory();
  }, [effectiveUserId]);

  const fetchDocuments = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/documents`);
      if (res.data && Array.isArray(res.data.documents)) {
        setDocuments(res.data.documents);
      }
    } catch (err) {
      console.warn("Backend server not reachable yet:", err.message);
    }
  };

  const fetchChatHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/chat/history/${effectiveUserId}`);
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        setChatHistory(res.data.data);
      }
    } catch (err) {
      console.warn("Could not fetch chat history from MongoDB:", err.message);
    }
  };

  const handleSendMessage = async (questionText) => {
    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: questionText,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const conversationHistory = messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      const res = await axios.post(`${API_BASE_URL}/chat`, {
        userId: effectiveUserId,
        conversationId: activeConversationId || undefined,
        question: questionText,
        conversationHistory: conversationHistory
      });

      const data = res.data;

      if (data.conversationId) {
        setActiveConversationId(data.conversationId);
      }

      const botMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: data.answer || (data.data?.answer) || "I'm sorry, I couldn't find relevant information in the university documents.",
        sources: data.sources || (data.data?.sources) || [],
        timestamp: data.timestamp || new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMessage]);

      // Refresh chat history list from MongoDB
      await fetchChatHistory();
    } catch (err) {
      console.error("Chat API Error:", err);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: err.response?.data?.message || err.message || "Failed to reach backend server. Please ensure the backend server is running on port 5000.",
        sources: [],
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteHistory = async (conversationId) => {
    try {
      await axios.delete(`${API_BASE_URL}/chat/${conversationId}/${effectiveUserId}`);
      await fetchChatHistory();
      if (activeConversationId === conversationId) {
        setMessages([]);
        setActiveConversationId(null);
      }
    } catch (err) {
      console.error("Failed to delete conversation:", err);
      alert("Could not delete conversation from MongoDB: " + (err.response?.data?.message || err.message));
    }
  };

  const handleSelectTopic = (topicId, promptText) => {
    setActiveTopic(topicId);
    if (promptText) {
      handleSendMessage(promptText);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setActiveConversationId(null);
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  const handleUploadDocument = async (file) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await axios.post(`${API_BASE_URL}/documents/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await fetchDocuments();
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || err.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/documents/${id}`);
      await fetchDocuments();
    } catch (err) {
      alert("Failed to delete document: " + (err.response?.data?.error || err.message));
    }
  };

  const handleSeedSampleDocuments = async () => {
    setIsUploading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/documents/seed-sample`);
      await fetchDocuments();
      alert(`🎉 ${res.data.message || 'Sample university documents seeded successfully!'}`);
    } catch (err) {
      alert("Failed to seed sample documents: " + (err.response?.data?.error || err.message));
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpenAuth = (mode = 'login') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const handleAuthSuccess = (userData) => {
    setCurrentUser(userData);
    setIsAuthOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('campusai_user');
    localStorage.removeItem('campusai_token');
    setCurrentUser(null);
    setMessages([]);
    setActiveConversationId(null);
  };

  return (
    <div className="container-layout">
      {/* 1. TOP HEADER */}
      <Header
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        onToggleAdmin={() => setIsAdminOpen(true)}
      />

      {/* 2. ACADEMIC STATUS BAR */}
      <AcademicStatusBar currentUser={currentUser} />

      {/* 3. MAIN CONTENT GRID */}
      <div className="main-grid">
        {/* Left Sidebar with MongoDB Chat History Search & Delete */}
        <StudentSidebar
          activeTopic={activeTopic}
          onSelectTopic={handleSelectTopic}
          history={chatHistory}
          activeConversationId={activeConversationId}
          onSelectConversation={(id) => setActiveConversationId(id)}
          onDeleteConversation={handleDeleteHistory}
          onNewChat={handleNewChat}
        />

        {/* Center Main Chat Panel */}
        <main style={{ minWidth: 0 }}>
          <ChatWindow
            messages={messages}
            onSendMessage={handleSendMessage}
            onNewChat={handleNewChat}
            onClearChat={handleClearChat}
            isLoading={isLoading}
            studentName={studentName}
          />
        </main>

        {/* Right Resource Panel */}
        <HelpfulResources
          onSelectResourcePrompt={handleSendMessage}
        />
      </div>

      {/* 4. MOBILE BOTTOM NAVIGATION */}
      <MobileNavigation
        activeTab={mobileTab}
        setActiveTab={setMobileTab}
        onToggleAdmin={() => setIsAdminOpen(true)}
      />

      {/* 5. KNOWLEDGE BASE & DOCUMENT MANAGER MODAL */}
      <DocumentManager
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        documents={documents}
        onUpload={handleUploadDocument}
        onDelete={handleDeleteDocument}
        onSeedSample={handleSeedSampleDocuments}
        isUploading={isUploading}
      />

      {/* 6. STUDENT LOGIN / SIGNUP AUTH MODAL */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        initialMode={authMode}
        apiBaseUrl={API_BASE_URL}
      />
    </div>
  );
}

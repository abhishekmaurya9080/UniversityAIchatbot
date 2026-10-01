import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, BookOpen, Sparkles, AlertCircle, FileText, ChevronDown, ChevronUp, Trash2, ArrowRight } from 'lucide-react';

const DEFAULT_QUESTIONS = [
  "How do I apply for admission?",
  "What is the minimum attendance required for semester exams?",
  "What is the B.Tech tuition fee structure?",
  "Where can I find the course syllabus?",
  "When are examination timetables released?",
  "How do I apply for hostel accommodation?",
  "What are the library borrowing limits and open hours?",
  "How do I obtain a Bonafide Certificate?"
];

export default function ChatInterface({ messages, onSendMessage, onClearHistory, isLoading }) {
  const [input, setInput] = useState('');
  const [expandedSources, setExpandedSources] = useState({});
  const [suggestedQuestions, setSuggestedQuestions] = useState(DEFAULT_QUESTIONS);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const apiQuestionsUrl = window.location.origin.includes('5173') ? '/api/documents/questions' : 'http://127.0.0.1:5000/api/documents/questions';
    fetch(apiQuestionsUrl)
      .then(res => res.json())
      .then(data => {
        if (data && data.featuredQuestions && data.featuredQuestions.length > 0) {
          const cleaned = data.featuredQuestions.map(q => q.replace(/^[^\w\s\?]+/, '').trim());
          setSuggestedQuestions(cleaned.slice(0, 8));
        }
      })
      .catch(() => {});
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const toggleSourceExpand = (msgId, sourceIdx) => {
    const key = `${msgId}-${sourceIdx}`;
    setExpandedSources(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 90px)', maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '1rem' }}>
      
      {/* Top Banner / Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', padding: '0 0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BookOpen style={{ width: '18px', height: '18px', color: 'var(--accent-cyan)' }} />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Official University Knowledge Base
          </span>
        </div>
        
        {messages.length > 0 && (
          <button
            onClick={onClearHistory}
            style={{
              background: 'rgba(244, 63, 94, 0.1)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: '#f43f5e',
              padding: '0.35rem 0.75rem',
              borderRadius: '8px',
              fontSize: '0.78rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s ease'
            }}
          >
            <Trash2 style={{ width: '14px', height: '14px' }} />
            Clear Chat
          </button>
        )}
      </div>

      {/* Main Chat Scroll Container */}
      <div className="glass-panel" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', borderRadius: '16px' }}>
        
        {/* Welcome Empty State */}
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', margin: 'auto 0', padding: '2rem 1rem' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto'
            }}>
              <GraduationCap style={{ width: '34px', height: '34px', color: '#818cf8' }} />
            </div>
            
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Indus University Student Help Desk 👋
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '540px', margin: '0 auto 1.75rem auto', lineHeight: 1.5 }}>
              Ask any question about university attendance rules, grading system, fee structures, courses, hostel rules, or exam schedules. Answers are grounded in official university documents.
            </p>

            {/* Quick Sample Questions Grid */}
            <div style={{ maxWidth: '750px', margin: '0 auto', textAlign: 'left' }}>
              <p style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-dim)', fontWeight: 600, marginBottom: '0.75rem' }}>
                Try asking a sample question:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
                {suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSendMessage(q)}
                    className="glass-panel-interactive"
                    style={{
                      padding: '0.75rem 1rem',
                      textAlign: 'left',
                      background: 'rgba(18, 24, 38, 0.6)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '12px',
                      color: 'var(--text-main)',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.5rem'
                    }}
                  >
                    <span>{q}</span>
                    <ArrowRight style={{ width: '14px', height: '14px', color: '#818cf8', flexShrink: 0 }} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Message List */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="animate-fade-in"
            style={{
              display: 'flex',
              gap: '0.875rem',
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: msg.sender === 'user' ? '80%' : '90%',
            }}
          >
            {/* Avatar */}
            {msg.sender === 'bot' && (
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '0.2rem'
              }}>
                <Bot style={{ width: '20px', height: '20px', color: '#ffffff' }} />
              </div>
            )}

            {/* Message Bubble Container */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{
                background: msg.sender === 'user'
                  ? 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)'
                  : 'rgba(18, 24, 38, 0.95)',
                border: msg.sender === 'user' ? 'none' : '1px solid var(--border-subtle)',
                color: '#ffffff',
                padding: '1rem 1.25rem',
                borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                lineHeight: 1.6,
                fontSize: '0.92rem',
                whiteSpace: 'pre-wrap'
              }}>
                {msg.text}
              </div>

              {/* Source Citations Box for Bot Answers */}
              {msg.sender === 'bot' && msg.sources && msg.sources.length > 0 && (
                <div style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  borderRadius: '12px',
                  padding: '0.75rem 1rem',
                  marginTop: '0.25rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', color: '#818cf8', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <BookOpen style={{ width: '14px', height: '14px' }} />
                    Verified Official Sources ({msg.sources.length})
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {msg.sources.map((src, idx) => {
                      const key = `${msg.id}-${idx}`;
                      const isExpanded = !!expandedSources[key];
                      return (
                        <div
                          key={idx}
                          style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.06)',
                            borderRadius: '8px',
                            padding: '0.5rem 0.75rem',
                            fontSize: '0.8rem'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                              <FileText style={{ width: '14px', height: '14px', color: 'var(--accent-cyan)', flexShrink: 0 }} />
                              <span style={{ fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {src.documentName}
                              </span>
                              <span style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#38bdf8', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.72rem' }}>
                                Page {src.pageNumber}
                              </span>
                              {src.score && (
                                <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.72rem' }}>
                                  {(src.score * 100).toFixed(0)}% match
                                </span>
                              )}
                            </div>

                            <button
                              onClick={() => toggleSourceExpand(msg.id, idx)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                padding: '0.2rem',
                                display: 'flex',
                                alignItems: 'center'
                              }}
                              title="Toggle Context Preview"
                            >
                              {isExpanded ? <ChevronUp style={{ width: '14px', height: '14px' }} /> : <ChevronDown style={{ width: '14px', height: '14px' }} />}
                            </button>
                          </div>

                          {isExpanded && (
                            <div style={{
                              marginTop: '0.5rem',
                              padding: '0.5rem',
                              background: 'rgba(0, 0, 0, 0.3)',
                              borderRadius: '6px',
                              fontFamily: 'monospace',
                              fontSize: '0.75rem',
                              color: 'var(--text-muted)',
                              lineHeight: 1.4,
                              borderLeft: '3px solid var(--accent-cyan)'
                            }}>
                              "{src.text}"
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Timestamp */}
              <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', padding: '0 0.2rem' }}>
                {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
              </span>
            </div>

            {/* User Avatar */}
            {msg.sender === 'user' && (
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '0.2rem'
              }}>
                <User style={{ width: '20px', height: '20px', color: '#ffffff' }} />
              </div>
            )}
          </div>
        ))}

        {/* Thinking Loader */}
        {isLoading && (
          <div className="animate-fade-in" style={{ display: 'flex', gap: '0.875rem', alignItems: 'center' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Bot style={{ width: '20px', height: '20px', color: '#ffffff' }} />
            </div>

            <div style={{
              background: 'rgba(18, 24, 38, 0.85)',
              border: '1px solid var(--border-subtle)',
              padding: '0.75rem 1.25rem',
              borderRadius: '18px 18px 18px 4px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <span className="pulse-animation" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#818cf8' }} />
                <span className="pulse-animation" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8', animationDelay: '0.2s' }} />
                <span className="pulse-animation" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399', animationDelay: '0.4s' }} />
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                LangGraph searching Qdrant & consulting Gemini...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} style={{ marginTop: '0.875rem', display: 'flex', gap: '0.75rem' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about attendance, exams, fees, courses, hostel..."
          disabled={isLoading}
          style={{
            flex: 1,
            background: 'rgba(18, 24, 38, 0.85)',
            border: '1px solid var(--border-subtle)',
            color: '#ffffff',
            padding: '0.875rem 1.25rem',
            borderRadius: '14px',
            fontSize: '0.92rem',
            outline: 'none',
            backdropFilter: 'blur(10px)',
            transition: 'border-color 0.2s ease'
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
        />

        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          style={{
            background: input.trim() && !isLoading ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'rgba(255, 255, 255, 0.05)',
            border: 'none',
            color: '#ffffff',
            padding: '0 1.5rem',
            borderRadius: '14px',
            fontWeight: 600,
            cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: input.trim() && !isLoading ? '0 4px 15px rgba(99, 102, 241, 0.4)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <span>Send</span>
          <Send style={{ width: '16px', height: '16px' }} />
        </button>
      </form>

    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  RotateCcw,
  Trash2,
  Paperclip,
  Mic,
  BookOpen,
  ChevronDown,
  ChevronUp,
  FileText,
  GraduationCap,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

const DEFAULT_DOC_QUESTIONS = [
  "How do I apply for admission?",
  "What documents are required for admission?",
  "How do I register for a semester?",
  "Can I transfer to the university?",
  "Where can I find the syllabus?",
  "How many semesters are in B.Tech?",
  "Can I change an elective?",
  "Who handles course-related questions?",
  "When is the exam timetable released?",
  "Where can I get my admit card?"
];

export default function ChatWindow({
  messages,
  onSendMessage,
  onNewChat,
  onClearChat,
  isLoading,
  studentName = "Abhishek"
}) {
  const [input, setInput] = useState('');
  const [expandedSources, setExpandedSources] = useState({});
  const [availableQuestions, setAvailableQuestions] = useState(DEFAULT_DOC_QUESTIONS);
  const messagesEndRef = useRef(null);
  useEffect(() => {
    const apiQuestionsUrl = window.location.origin.includes('5173') ? '/api/documents/questions' : 'http://127.0.0.1:5000/api/documents/questions';
    fetch(apiQuestionsUrl)
      .then(res => res.json())
      .then(data => {
        if (data && data.featuredQuestions && data.featuredQuestions.length > 0) {
          const cleaned = data.featuredQuestions.map(q => q.replace(/^[^\w\s\?]+/, '').trim());
          setAvailableQuestions(cleaned.slice(0, 10));
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

  const handleQuestionClick = (qText) => {
    if (isLoading) return;
    onSendMessage(qText);
  };

  const toggleSourceExpand = (msgId, idx) => {
    const key = `${msgId}-${idx}`;
    setExpandedSources(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="ui-card" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 150px)', overflow: 'hidden' }}>
      
      {/* 1. CHAT HEADER */}
      <div style={{
        padding: '0.875rem 1.25rem',
        borderBottom: '1px solid var(--border-color)',
        background: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'var(--blue-light)',
            border: '1px solid var(--blue-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--blue-accent)'
          }}>
            <GraduationCap style={{ width: '20px', height: '20px', color: 'var(--navy-primary)' }} />
          </div>

          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--navy-dark)' }}>
              Indus Student Help Desk
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--status-green)' }} />
              Online • Verified Academic Guidelines 2026–27
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={onNewChat}
            style={{
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-body)',
              padding: '0.4rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <RotateCcw style={{ width: '13px', height: '13px' }} />
            <span>New Chat</span>
          </button>

          <button
            onClick={onClearChat}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-color)',
              color: 'var(--text-muted)',
              padding: '0.4rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.78rem',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <Trash2 style={{ width: '13px', height: '13px' }} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN CHAT SCROLL AREA */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', background: '#fafbfc' }}>
        
        {/* CHAT WELCOME STATE */}
        {messages.length === 0 && (
          <div style={{ margin: 'auto 0', padding: '1rem 0.5rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--navy-dark)', marginBottom: '0.35rem' }}>
                Welcome to Indus Student Help Desk 👋
              </h2>
              <p style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--navy-primary)', marginBottom: '0.25rem' }}>
                How can we assist you today, {studentName.split(' ')[0]}?
              </p>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', maxWidth: '600px' }}>
                Search official university regulations, exam timetables, fee guidelines, 75% attendance rules, academic calendars, and student services.
              </p>
            </div>

            {/* SUGGESTED QUESTIONS GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.65rem', maxWidth: '720px' }}>
              {availableQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuestionClick(q)}
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem 0.875rem',
                    textAlign: 'left',
                    color: 'var(--text-body)',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--blue-accent)';
                    e.currentTarget.style.background = 'var(--blue-light)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.background = '#ffffff';
                  }}
                >
                  <span>{q}</span>
                  <ArrowRight style={{ width: '14px', height: '14px', color: 'var(--blue-accent)', flexShrink: 0 }} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* MESSAGES LIST */}
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignSelf: isUser ? 'flex-end' : 'flex-start',
                maxWidth: isUser ? '80%' : '88%',
              }}
            >
              {/* Bubble */}
              <div
                style={{
                  background: isUser ? 'var(--navy-primary)' : '#ffffff',
                  color: isUser ? '#ffffff' : 'var(--text-main)',
                  border: isUser ? 'none' : '1px solid var(--border-color)',
                  borderRadius: isUser ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  padding: '0.875rem 1.15rem',
                  fontSize: '0.9rem',
                  lineHeight: 1.6,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {msg.text}
              </div>

              {/* Source Citations Block for Assistant Messages */}
              {!isUser && msg.sources && msg.sources.length > 0 && (
                <div style={{
                  marginTop: '0.5rem',
                  padding: '0.65rem 0.85rem',
                  background: '#ffffff',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.78rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--navy-primary)', fontWeight: 600, marginBottom: '0.4rem' }}>
                    <BookOpen style={{ width: '13px', height: '13px' }} />
                    <span>Official University Sources</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {msg.sources.map((src, idx) => {
                      const key = `${msg.id}-${idx}`;
                      const isExpanded = !!expandedSources[key];
                      return (
                        <div
                          key={idx}
                          style={{
                            background: 'var(--bg-subtle)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '6px',
                            padding: '0.4rem 0.6rem'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', overflow: 'hidden' }}>
                              <FileText style={{ width: '13px', height: '13px', color: 'var(--blue-accent)', flexShrink: 0 }} />
                              <span style={{ fontWeight: 600, color: 'var(--navy-dark)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                Source: {src.documentName}
                              </span>
                              {src.pageNumber && (
                                <span style={{ background: '#e0e7ff', color: '#3730a3', padding: '0.05rem 0.35rem', borderRadius: '4px', fontSize: '0.7rem' }}>
                                  Page {src.pageNumber}
                                </span>
                              )}
                            </div>

                            <button
                              onClick={() => toggleSourceExpand(msg.id, idx)}
                              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.1rem' }}
                            >
                              {isExpanded ? <ChevronUp style={{ width: '13px', height: '13px' }} /> : <ChevronDown style={{ width: '13px', height: '13px' }} />}
                            </button>
                          </div>

                          {isExpanded && (
                            <div style={{
                              marginTop: '0.35rem',
                              padding: '0.4rem',
                              background: '#ffffff',
                              borderRadius: '4px',
                              fontSize: '0.74rem',
                              color: 'var(--text-body)',
                              borderLeft: '2px solid var(--blue-accent)',
                              lineHeight: 1.4
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
              <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.2rem', alignSelf: isUser ? 'flex-end' : 'flex-start' }}>
                {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
              </span>
            </div>
          );
        })}

        {/* LOADING TYPING INDICATOR */}
        {isLoading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ffffff', border: '1px solid var(--border-color)', padding: '0.6rem 1rem', borderRadius: '12px', alignSelf: 'flex-start' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              CampusAI searching catalog & university knowledge base...
            </span>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <span className="typing-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--blue-accent)' }} />
              <span className="typing-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--blue-accent)', animationDelay: '0.2s' }} />
              <span className="typing-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--blue-accent)', animationDelay: '0.4s' }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. CHAT INPUT BAR */}
      <div style={{ padding: '0.875rem 1.25rem', borderTop: '1px solid var(--border-color)', background: '#ffffff' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          
          <button
            type="button"
            style={{
              background: 'transparent',
              border: '1px solid var(--border-color)',
              color: 'var(--text-muted)',
              padding: '0.6rem',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            title="Attach file"
          >
            <Paperclip style={{ width: '16px', height: '16px' }} />
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about courses, admissions, fees, housing..."
            disabled={isLoading}
            style={{
              flex: 1,
              background: 'var(--bg-main)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '0.7rem 1rem',
              fontSize: '0.88rem',
              color: 'var(--text-main)',
              outline: 'none',
              transition: 'border-color 0.15s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--blue-accent)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
          />

          <button
            type="button"
            style={{
              background: 'transparent',
              border: '1px solid var(--border-color)',
              color: 'var(--text-muted)',
              padding: '0.6rem',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            title="Voice input"
          >
            <Mic style={{ width: '16px', height: '16px' }} />
          </button>

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            style={{
              background: input.trim() && !isLoading ? 'var(--navy-primary)' : 'var(--bg-subtle)',
              color: input.trim() && !isLoading ? '#ffffff' : 'var(--text-dim)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              padding: '0.7rem 1.25rem',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.15s ease'
            }}
          >
            <span>Send</span>
            <Send style={{ width: '14px', height: '14px' }} />
          </button>

        </form>

        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
          <ShieldCheck style={{ width: '12px', height: '12px', color: 'var(--status-green)' }} />
          CampusAI uses official Indus State University documents & catalog to answer your questions.
        </p>
      </div>

    </div>
  );
}

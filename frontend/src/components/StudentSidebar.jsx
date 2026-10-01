import React, { useState } from 'react';
import {
  BookOpen,
  CreditCard,
  Home,
  FileCheck,
  Laptop,
  LifeBuoy,
  UserCheck,
  ChevronRight,
  History,
  Search,
  Trash2,
  MessageSquare,
  X,
  Plus
} from 'lucide-react';

const QUICK_ACTIONS = [
  { id: 'admissions', label: 'Admissions Process', icon: UserCheck, prompt: 'How do I apply for admission?' },
  { id: 'documents', label: 'Admission Documents', icon: FileCheck, prompt: 'What documents are required for admission?' },
  { id: 'registration', label: 'Semester Registration', icon: BookOpen, prompt: 'How do I register for a semester?' },
  { id: 'transfer', label: 'University Transfer', icon: UserCheck, prompt: 'Can I transfer to the university?' },
  { id: 'syllabus', label: 'Course Syllabus', icon: BookOpen, prompt: 'Where can I find the syllabus?' },
  { id: 'btech', label: 'B.Tech Semesters', icon: BookOpen, prompt: 'How many semesters are in B.Tech?' },
  { id: 'electives', label: 'Change Elective', icon: CreditCard, prompt: 'Can I change an elective?' },
  { id: 'support', label: 'Course Support', icon: LifeBuoy, prompt: 'Who handles course-related questions?' },
  { id: 'timetable', label: 'Exam Timetable', icon: FileCheck, prompt: 'When is the exam timetable released?' },
  { id: 'admitcard', label: 'Admit Card', icon: Laptop, prompt: 'Where can I get my admit card?' },
];

export default function StudentSidebar({
  activeTopic,
  onSelectTopic,
  history = [],
  activeConversationId,
  onSelectConversation,
  onDeleteConversation,
  onNewChat
}) {
  const [activeTab, setActiveTab] = useState('history'); // 'history' | 'topics'
  const [searchQuery, setSearchQuery] = useState('');

  // Filter history based on search query
  const filteredHistory = history.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const titleMatch = item.title && item.title.toLowerCase().includes(q);
    const lastMsgMatch = item.lastMessage && item.lastMessage.toLowerCase().includes(q);
    return titleMatch || lastMsgMatch;
  });

  return (
    <aside className="student-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      
      {/* Student Profile Card */}
      <div className="ui-card" style={{ padding: '1rem', textAlign: 'center' }}>
        <div style={{
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
          color: '#ffffff',
          fontWeight: 700,
          fontSize: '1.1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 0.5rem auto',
          boxShadow: '0 2px 8px rgba(30, 58, 138, 0.25)'
        }}>
          AB
        </div>

        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--navy-dark)' }}>
          Abhishek
        </h3>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '0.1rem' }}>
          Computer Science • Junior
        </p>
        <span style={{
          display: 'inline-block',
          marginTop: '0.4rem',
          background: 'var(--bg-subtle)',
          color: 'var(--text-body)',
          border: '1px solid var(--border-color)',
          fontSize: '0.7rem',
          fontWeight: 600,
          padding: '0.15rem 0.5rem',
          borderRadius: 'var(--radius-sm)'
        }}>
          Student ID #8492041
        </span>
      </div>

      {/* Sidebar Navigation Tabs */}
      <div className="ui-card" style={{ padding: '0.85rem 0.75rem', flex: 1, display: 'flex', flexDirection: 'column', minHeight: '380px' }}>
        
        {/* Tab Switcher Header */}
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <button
            onClick={() => setActiveTab('history')}
            style={{
              flex: 1,
              padding: '0.45rem 0.5rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: activeTab === 'history' ? 'var(--blue-light)' : 'transparent',
              color: activeTab === 'history' ? 'var(--blue-accent)' : 'var(--text-muted)',
              fontWeight: activeTab === 'history' ? 700 : 500,
              fontSize: '0.78rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              transition: 'all 0.15s ease'
            }}
          >
            <History style={{ width: '14px', height: '14px' }} />
            <span>History ({history.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('topics')}
            style={{
              flex: 1,
              padding: '0.45rem 0.5rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: activeTab === 'topics' ? 'var(--blue-light)' : 'transparent',
              color: activeTab === 'topics' ? 'var(--blue-accent)' : 'var(--text-muted)',
              fontWeight: activeTab === 'topics' ? 700 : 500,
              fontSize: '0.78rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              transition: 'all 0.15s ease'
            }}
          >
            <BookOpen style={{ width: '14px', height: '14px' }} />
            <span>Topics</span>
          </button>
        </div>

        {/* TAB 1: CHAT HISTORY & SEARCH */}
        {activeTab === 'history' && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '0.6rem' }}>
            
            {/* New Chat Button */}
            {onNewChat && (
              <button
                onClick={onNewChat}
                style={{
                  width: '100%',
                  background: 'var(--navy-primary)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  boxShadow: '0 2px 4px rgba(30, 58, 138, 0.2)'
                }}
              >
                <Plus style={{ width: '14px', height: '14px' }} />
                <span>Start New Chat</span>
              </button>
            )}

            {/* Live Search Input */}
            <div style={{ position: 'relative' }}>
              <Search style={{
                position: 'absolute',
                left: '0.6rem',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '14px',
                height: '14px',
                color: 'var(--text-dim)'
              }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search MongoDB history..."
                style={{
                  width: '100%',
                  padding: '0.45rem 1.8rem 0.45rem 2rem',
                  background: 'var(--bg-main)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.78rem',
                  color: 'var(--text-main)',
                  outline: 'none'
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '0.4rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)'
                  }}
                >
                  <X style={{ width: '12px', height: '12px' }} />
                </button>
              )}
            </div>

            {/* MongoDB History List */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: '320px' }}>
              {filteredHistory.length === 0 ? (
                <div style={{ padding: '1.5rem 0.5rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.78rem' }}>
                  <MessageSquare style={{ width: '24px', height: '24px', margin: '0 auto 0.4rem auto', opacity: 0.5 }} />
                  {searchQuery ? 'No matching chat history found' : 'No saved MongoDB chats yet'}
                </div>
              ) : (
                filteredHistory.map((item) => {
                  const isActive = activeConversationId === item.conversationId;
                  return (
                    <div
                      key={item.conversationId}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.55rem 0.65rem',
                        borderRadius: 'var(--radius-md)',
                        background: isActive ? 'var(--blue-light)' : 'transparent',
                        border: isActive ? '1px solid var(--blue-border)' : '1px solid transparent',
                        transition: 'all 0.15s ease',
                        cursor: 'pointer'
                      }}
                      onClick={() => onSelectConversation && onSelectConversation(item.conversationId)}
                      onMouseEnter={(e) => {
                        if (!isActive) e.currentTarget.style.background = 'var(--bg-subtle)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden', flex: 1 }}>
                        <MessageSquare style={{ width: '14px', height: '14px', color: isActive ? 'var(--blue-accent)' : 'var(--text-muted)', flexShrink: 0 }} />
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <p style={{
                            fontSize: '0.8rem',
                            fontWeight: isActive ? 700 : 500,
                            color: isActive ? 'var(--blue-accent)' : 'var(--text-body)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {item.title || 'Untitled Conversation'}
                          </p>
                          <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.lastMessage ? item.lastMessage : (item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : '')}
                          </p>
                        </div>
                      </div>

                      {/* Delete Conversation Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onDeleteConversation) onDeleteConversation(item.conversationId);
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#f43f5e',
                          opacity: 0.6,
                          cursor: 'pointer',
                          padding: '0.2rem',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          marginLeft: '0.3rem'
                        }}
                        title="Delete conversation from MongoDB"
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
                      >
                        <Trash2 style={{ width: '13px', height: '13px' }} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        )}

        {/* TAB 2: QUICK TOPICS */}
        {activeTab === 'topics' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            {QUICK_ACTIONS.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeTopic === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTopic(item.id, item.prompt)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.55rem 0.65rem',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    background: isActive ? 'var(--blue-light)' : 'transparent',
                    color: isActive ? 'var(--blue-accent)' : 'var(--text-body)',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'var(--bg-subtle)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                    <IconComponent style={{ width: '15px', height: '15px', color: isActive ? 'var(--blue-accent)' : 'var(--text-muted)' }} />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight style={{ width: '13px', height: '13px', color: isActive ? 'var(--blue-accent)' : 'var(--text-dim)' }} />
                </button>
              );
            })}
          </div>
        )}

      </div>

    </aside>
  );
}

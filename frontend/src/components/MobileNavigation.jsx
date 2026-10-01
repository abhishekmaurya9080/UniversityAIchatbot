import React from 'react';
import { MessageSquare, Grid, BookOpen, Layers } from 'lucide-react';

export default function MobileNavigation({ activeTab, setActiveTab, onToggleAdmin }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '56px',
      background: '#ffffff',
      borderTop: '1px solid var(--border-color)',
      display: 'none',
      alignItems: 'center',
      justifyContent: 'space-around',
      zIndex: 100
    }} className="mobile-only-nav">
      <button
        onClick={() => setActiveTab('chat')}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.2rem',
          border: 'none',
          background: 'transparent',
          color: activeTab === 'chat' ? 'var(--blue-accent)' : 'var(--text-muted)',
          fontSize: '0.72rem',
          fontWeight: 600,
          cursor: 'pointer'
        }}
      >
        <MessageSquare style={{ width: '18px', height: '18px' }} />
        <span>Chat</span>
      </button>

      <button
        onClick={() => setActiveTab('topics')}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.2rem',
          border: 'none',
          background: 'transparent',
          color: activeTab === 'topics' ? 'var(--blue-accent)' : 'var(--text-muted)',
          fontSize: '0.72rem',
          fontWeight: 600,
          cursor: 'pointer'
        }}
      >
        <Grid style={{ width: '18px', height: '18px' }} />
        <span>Topics</span>
      </button>

      <button
        onClick={() => setActiveTab('resources')}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.2rem',
          border: 'none',
          background: 'transparent',
          color: activeTab === 'resources' ? 'var(--blue-accent)' : 'var(--text-muted)',
          fontSize: '0.72rem',
          fontWeight: 600,
          cursor: 'pointer'
        }}
      >
        <BookOpen style={{ width: '18px', height: '18px' }} />
        <span>Resources</span>
      </button>

      <button
        onClick={onToggleAdmin}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.2rem',
          border: 'none',
          background: 'transparent',
          color: 'var(--navy-primary)',
          fontSize: '0.72rem',
          fontWeight: 600,
          cursor: 'pointer'
        }}
      >
        <Layers style={{ width: '18px', height: '18px' }} />
        <span>Docs Admin</span>
      </button>
    </div>
  );
}

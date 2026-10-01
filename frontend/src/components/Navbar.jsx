import React from 'react';
import { GraduationCap, FileText, MessageSquare, ShieldCheck, Database, RefreshCw, Key } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, health, onRefreshHealth, onOpenApiKeyModal }) {
  return (
    <header className="glass-panel" style={{ borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, padding: '1rem 2rem', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)'
          }}>
            <GraduationCap style={{ width: '26px', height: '26px', color: '#ffffff' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 className="gradient-text" style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
                Excelsior AI
              </h1>
              <span style={{
                background: 'rgba(99, 102, 241, 0.15)',
                color: '#818cf8',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                fontSize: '0.7rem',
                fontWeight: 600,
                padding: '0.15rem 0.5rem',
                borderRadius: '999px',
                textTransform: 'uppercase'
              }}>
                RAG + LangGraph
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              Official University Support & Document Assistant
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav style={{ display: 'flex', gap: '0.5rem', background: 'rgba(15, 23, 42, 0.6)', padding: '0.35rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => setActiveTab('chat')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.55rem 1.2rem',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: activeTab === 'chat' ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === 'chat' ? '#ffffff' : 'var(--text-muted)',
              boxShadow: activeTab === 'chat' ? '0 4px 12px rgba(99, 102, 241, 0.35)' : 'none'
            }}
          >
            <MessageSquare style={{ width: '16px', height: '16px' }} />
            Student Chat
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.55rem 1.2rem',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: activeTab === 'documents' ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === 'documents' ? '#ffffff' : 'var(--text-muted)',
              boxShadow: activeTab === 'documents' ? '0 4px 12px rgba(99, 102, 241, 0.35)' : 'none'
            }}
          >
            <FileText style={{ width: '16px', height: '16px' }} />
            Document Manager
          </button>
        </nav>

        {/* System Health Indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Health Pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid var(--border-subtle)',
            padding: '0.4rem 0.8rem',
            borderRadius: '999px',
            fontSize: '0.78rem'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: health?.status === 'ok' ? '#10b981' : '#f59e0b',
              boxShadow: health?.status === 'ok' ? '0 0 8px #10b981' : '0 0 8px #f59e0b'
            }} />
            <span style={{ color: 'var(--text-muted)' }}>Backend:</span>
            <span style={{ color: health?.status === 'ok' ? '#10b981' : '#f59e0b', fontWeight: 600 }}>
              {health?.status === 'ok' ? 'Online' : 'Connecting...'}
            </span>
          </div>

          <button
            onClick={onOpenApiKeyModal}
            title="Configure API Key & Status"
            style={{
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              color: '#818cf8',
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <Key style={{ width: '16px', height: '16px' }} />
          </button>
        </div>

      </div>
    </header>
  );
}


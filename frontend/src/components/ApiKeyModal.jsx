import React, { useState } from 'react';
import { X, Key, CheckCircle, AlertTriangle, Cpu, Database, Server } from 'lucide-react';

export default function ApiKeyModal({ isOpen, onClose, health }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '520px',
        width: '100%',
        padding: '1.75rem',
        borderRadius: '20px',
        background: '#0d1322',
        border: '1px solid var(--border-active)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Key style={{ width: '22px', height: '22px', color: '#818cf8' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>System Configuration & Status</h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.2rem'
            }}
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {/* Status Checklist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '1.5rem' }}>
          
          {/* Node Backend Status */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '0.875rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Server style={{ width: '18px', height: '18px', color: 'var(--accent-cyan)' }} />
              <div>
                <p style={{ fontSize: '0.88rem', fontWeight: 600 }}>Node.js / Express Server</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Port 5000</p>
              </div>
            </div>
            <span style={{
              fontSize: '0.78rem',
              fontWeight: 600,
              color: health?.status === 'ok' ? '#34d399' : '#f59e0b',
              background: health?.status === 'ok' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
              padding: '0.25rem 0.6rem',
              borderRadius: '6px'
            }}>
              {health?.status === 'ok' ? 'Connected' : 'Offline'}
            </span>
          </div>

          {/* Qdrant Vector DB */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '0.875rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Database style={{ width: '18px', height: '18px', color: 'var(--accent-emerald)' }} />
              <div>
                <p style={{ fontSize: '0.88rem', fontWeight: 600 }}>Qdrant Vector DB</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{health?.qdrantUrl || 'http://localhost:6333'}</p>
              </div>
            </div>
            <span style={{
              fontSize: '0.78rem',
              fontWeight: 600,
              color: '#34d399',
              background: 'rgba(16, 185, 129, 0.15)',
              padding: '0.25rem 0.6rem',
              borderRadius: '6px'
            }}>
              Active (Hybrid Vector Store)
            </span>
          </div>

          {/* Gemini API Key */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '0.875rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Cpu style={{ width: '18px', height: '18px', color: 'var(--accent-primary)' }} />
              <div>
                <p style={{ fontSize: '0.88rem', fontWeight: 600 }}>Google Gemini LLM</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {health?.geminiConfigured ? 'API Key Configured' : 'Missing GEMINI_API_KEY'}
                </p>
              </div>
            </div>
            <span style={{
              fontSize: '0.78rem',
              fontWeight: 600,
              color: health?.geminiConfigured ? '#34d399' : '#f43f5e',
              background: health?.geminiConfigured ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
              padding: '0.25rem 0.6rem',
              borderRadius: '6px'
            }}>
              {health?.geminiConfigured ? 'Ready' : 'Key Required'}
            </span>
          </div>

        </div>

        {/* Instructions */}
        <div style={{
          background: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: '12px',
          padding: '1rem',
          fontSize: '0.82rem',
          color: 'var(--text-main)',
          lineHeight: 1.5
        }}>
          <strong>💡 How to configure Gemini API key:</strong>
          <ol style={{ marginLeft: '1.2rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <li>Open the file <code style={{ color: '#38bdf8' }}>.env</code> in the project root directory.</li>
            <li>Set <code style={{ color: '#38bdf8' }}>GEMINI_API_KEY=your_gemini_api_key</code>.</li>
            <li>Save the file and restart backend server.</li>
          </ol>
        </div>

        <button
          onClick={onClose}
          style={{
            width: '100%',
            marginTop: '1.25rem',
            background: 'var(--accent-primary)',
            border: 'none',
            color: '#ffffff',
            padding: '0.75rem',
            borderRadius: '10px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Close Window
        </button>

      </div>
    </div>
  );
}

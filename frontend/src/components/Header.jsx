import React, { useState } from 'react';
import { ChevronDown, Bell, User, Layers, MessageSquare, BookOpen, Clock, LogIn, UserPlus, LogOut, Shield } from 'lucide-react';

export default function Header({ activeNav, setActiveNav, currentUser, onOpenAuth, onLogout, onToggleAdmin }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const studentName = currentUser?.name || 'Guest Student';

  return (
    <header className="top-header">
      {/* Left: Brand Identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
        {/* Minimal Academic Crest Symbol */}
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
          border: '1px solid #1e40af',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 4px rgba(30, 58, 138, 0.2)'
        }}>
          {/* Custom Academic Shield / Book Crest */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L3 7V12C3 17.55 6.84 22.74 12 24C17.16 22.74 21 17.55 21 12V7L12 2Z" fill="#1e3a8a" stroke="#ffffff" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M12 6L7 9L12 12L17 9L12 6Z" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7 13V15.5" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--navy-dark)', letterSpacing: '-0.01em' }}>
              Indus State University
            </h1>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            CampusAI Student Support Portal
          </p>
        </div>
      </div>

      {/* Center Navigation Links */}
      <nav style={{ display: 'flex', gap: '0.5rem', height: '100%', alignItems: 'center' }}>
        <button
          onClick={() => setActiveNav('chat')}
          style={{
            height: '44px',
            padding: '0 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            fontSize: '0.88rem',
            fontWeight: 600,
            border: 'none',
            background: activeNav === 'chat' ? 'var(--blue-light)' : 'transparent',
            color: activeNav === 'chat' ? 'var(--blue-accent)' : 'var(--text-body)',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <MessageSquare style={{ width: '16px', height: '16px' }} />
          CampusAI Chat
        </button>

        <button
          onClick={() => setActiveNav('services')}
          style={{
            height: '44px',
            padding: '0 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            fontSize: '0.88rem',
            fontWeight: 500,
            border: 'none',
            background: activeNav === 'services' ? 'var(--blue-light)' : 'transparent',
            color: activeNav === 'services' ? 'var(--blue-accent)' : 'var(--text-muted)',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <BookOpen style={{ width: '16px', height: '16px' }} />
          Student Services
        </button>

        <button
          onClick={() => setActiveNav('requests')}
          style={{
            height: '44px',
            padding: '0 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            fontSize: '0.88rem',
            fontWeight: 500,
            border: 'none',
            background: activeNav === 'requests' ? 'var(--blue-light)' : 'transparent',
            color: activeNav === 'requests' ? 'var(--blue-accent)' : 'var(--text-muted)',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <Clock style={{ width: '16px', height: '16px' }} />
          My Requests
        </button>
      </nav>

      {/* Right Side Controls & Student Auth Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Knowledge Base / Admin toggle */}
        <button
          onClick={onToggleAdmin}
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
            gap: '0.4rem'
          }}
          title="Manage University Documents & Vector Index"
        >
          <Layers style={{ width: '14px', height: '14px', color: 'var(--navy-primary)' }} />
          <span>Knowledge Manager</span>
        </button>

        {currentUser ? (
          /* Logged In Profile Menu */
          <div style={{ position: 'relative' }}>
            <div
              onClick={() => setShowDropdown(!showDropdown)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.35rem 0.65rem',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-surface)',
                userSelect: 'none'
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {studentName ? studentName.substring(0, 2).toUpperCase() : 'ST'}
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--navy-dark)', margin: 0, lineHeight: 1.2 }}>
                  {studentName.split(' ')[0]}
                </p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>
                  {currentUser.studentId || 'Student'}
                </p>
              </div>
              <ChevronDown style={{ width: '14px', height: '14px', color: 'var(--text-muted)' }} />
            </div>

            {/* Dropdown menu */}
            {showDropdown && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 0.5rem)',
                right: 0,
                width: '220px',
                background: '#ffffff',
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                border: '1px solid var(--border-color)',
                padding: '0.5rem',
                zIndex: 100,
                animation: 'fadeIn 0.15s ease-out'
              }}>
                <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.35rem' }}>
                  <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--navy-dark)', margin: 0 }}>
                    {currentUser.name}
                  </p>
                  <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: 0 }}>
                    {currentUser.email}
                  </p>
                  <span style={{ display: 'inline-block', marginTop: '0.35rem', padding: '0.15rem 0.45rem', borderRadius: '4px', background: '#eff6ff', color: '#1e40af', fontSize: '0.68rem', fontWeight: 600 }}>
                    {currentUser.course || 'B.Tech CS'} • {currentUser.semester || '3rd Sem'}
                  </span>
                </div>

                <button
                  onClick={() => { setShowDropdown(false); onLogout(); }}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    border: 'none',
                    background: 'transparent',
                    color: '#ef4444',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <LogOut style={{ width: '14px', height: '14px' }} />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Logged Out Buttons */
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => onOpenAuth('login')}
              style={{
                background: 'transparent',
                border: '1px solid var(--border-color)',
                color: 'var(--navy-dark)',
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <LogIn style={{ width: '14px', height: '14px' }} />
              <span>Login</span>
            </button>

            <button
              onClick={() => onOpenAuth('register')}
              style={{
                background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                border: 'none',
                color: '#ffffff',
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                boxShadow: '0 2px 4px rgba(37, 99, 235, 0.25)'
              }}
            >
              <UserPlus style={{ width: '14px', height: '14px' }} />
              <span>Sign Up</span>
            </button>
          </div>
        )}

      </div>
    </header>
  );
}

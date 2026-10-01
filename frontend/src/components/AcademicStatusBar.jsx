import React from 'react';
import { Calendar, PhoneCall, HelpCircle, GraduationCap } from 'lucide-react';

export default function AcademicStatusBar({ currentUser }) {
  return (
    <div className="status-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-body)', fontWeight: 600 }}>
          <Calendar style={{ width: '14px', height: '14px', color: 'var(--navy-primary)' }} />
          <span>Fall 2026 • Academic Term</span>
        </div>

        {currentUser && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--navy-dark)', fontWeight: 600, fontSize: '0.78rem' }}>
            <GraduationCap style={{ width: '15px', height: '15px', color: 'var(--blue-accent)' }} />
            <span>{currentUser.course} ({currentUser.semester})</span>
          </div>
        )}

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          background: 'var(--status-green-bg)',
          border: '1px solid var(--status-green-border)',
          color: 'var(--status-green)',
          padding: '0.15rem 0.6rem',
          borderRadius: '999px',
          fontWeight: 600,
          fontSize: '0.75rem'
        }}>
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: 'var(--status-green)',
            display: 'inline-block'
          }} />
          <span>CampusAI Online</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.78rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <PhoneCall style={{ width: '13px', height: '13px', color: 'var(--text-muted)' }} />
          <span>Campus Safety: <strong>(555) 019-2831</strong></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <HelpCircle style={{ width: '13px', height: '13px', color: 'var(--text-muted)' }} />
          <span>IT Desk: <strong>Support #402</strong></span>
        </div>
      </div>
    </div>
  );
}

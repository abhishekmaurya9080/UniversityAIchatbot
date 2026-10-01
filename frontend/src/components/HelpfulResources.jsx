import React from 'react';
import { ExternalLink, Calendar, Book, Clock, Award, Info } from 'lucide-react';

const ACADEMIC_EVENTS = [
  { label: 'Odd Semester Calendar', prompt: 'What are the odd-semester dates?', icon: Calendar, desc: 'Aug 1 - Dec 20 key dates' },
  { label: 'Even Semester Calendar', prompt: 'What are the even-semester dates?', icon: Calendar, desc: 'Jan 5 - May 20 key dates' },
  { label: 'Academic event', prompt: 'What are the upcoming academic events?', icon: Book, desc: 'Registration & class schedule' },
  { label: 'Semester Examinations', prompt: 'When are semester examinations?', icon: Clock, desc: 'Dec 5-20 & May 5-20 exams' },
  { label: 'Exam Timetable', prompt: 'When is the exam timetable released?', icon: Award, desc: 'Timetables & admit cards' },
];

export default function HelpfulResources({ onSelectResourcePrompt }) {
  return (
    <aside className="resource-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      
      {/* Academic Calendar & Events Panel */}
      <div className="ui-card" style={{ padding: '1rem 0.75rem' }}>
        <div style={{
          fontSize: '0.72rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'var(--text-dim)',
          padding: '0 0.5rem 0.5rem 0.5rem',
          borderBottom: '1px solid var(--border-color)',
          marginBottom: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span>Academic Calendar & Events</span>
          <Calendar style={{ width: '14px', height: '14px', color: 'var(--blue-accent)' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {ACADEMIC_EVENTS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                onClick={() => onSelectResourcePrompt(item.prompt)}
                style={{
                  padding: '0.6rem 0.65rem',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-subtle)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '6px',
                    background: 'var(--blue-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Icon style={{ width: '14px', height: '14px', color: 'var(--blue-accent)' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--navy-dark)' }}>
                      {item.label}
                    </p>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
                <ExternalLink style={{ width: '12px', height: '12px', color: 'var(--text-dim)' }} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Academic Dates & Deadlines Widget */}
      <div className="ui-card" style={{ padding: '1rem', background: '#f8fafc', border: '1px solid var(--border-color)' }}>
        <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--navy-dark)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          📌 Academic Calendar Highlights
        </h4>
        <ul style={{ listStyle: 'none', fontSize: '0.78rem', color: 'var(--text-body)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border-color)', paddingBottom: '0.3rem' }}>
            <span>Odd Sem Reg:</span>
            <strong style={{ color: 'var(--navy-primary)' }}>Aug 1 – 10</strong>
          </li>
          <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border-color)', paddingBottom: '0.3rem' }}>
            <span>Odd Sem Exams:</span>
            <strong style={{ color: 'var(--navy-primary)' }}>Dec 5 – 20</strong>
          </li>
          <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border-color)', paddingBottom: '0.3rem' }}>
            <span>Even Sem Reg:</span>
            <strong style={{ color: 'var(--navy-primary)' }}>Jan 5 – 12</strong>
          </li>
          <li style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Even Sem Exams:</span>
            <strong style={{ color: 'var(--navy-primary)' }}>May 5 – 20</strong>
          </li>
        </ul>
      </div>

    </aside>
  );
}

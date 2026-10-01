import React, { useState } from 'react';
import { X, LogIn, UserPlus, GraduationCap, Lock, Mail, User, BookOpen, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, initialMode = 'login', apiBaseUrl = '/api' }) {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    course: 'B.Tech Computer Science',
    semester: '5th Semester',
    rollNumber: '',
  });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const endpoint = isLogin ? `${apiBaseUrl}/auth/login` : `${apiBaseUrl}/auth/register`;
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : formData;

      const res = await axios.post(endpoint, payload);
      const data = res.data;

      if (data.success && data.user) {
        setSuccessMsg(data.message || 'Authentication successful!');
        if (data.token) {
          localStorage.setItem('campusai_token', data.token);
        }
        localStorage.setItem('campusai_user', JSON.stringify(data.user));

        setTimeout(() => {
          onAuthSuccess(data.user);
          onClose();
        }, 800);
      } else {
        setError(data.message || 'Authentication failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Server connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '440px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        border: '1px solid var(--border-color)',
        overflow: 'hidden',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        
        {/* MODAL HEADER */}
        <div style={{
          padding: '1.25rem 1.5rem',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <GraduationCap style={{ width: '20px', height: '20px', color: '#fbbf24' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                {isLogin ? 'Student Login' : 'Student Registration'}
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
                Indus State University Support Portal
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '0.25rem',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {/* FORM CONTAINER */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* SUCCESS / ERROR ALERTS */}
          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.82rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle style={{ width: '16px', height: '16px', flexShrink: 0 }} />
                <span>{error}</span>
              </div>
              {isLogin && (
                <p style={{ fontSize: '0.78rem', color: '#7f1d1d', margin: 0 }}>
                  Need an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setIsLogin(false); setError(''); }}
                    style={{ background: 'transparent', border: 'none', color: '#2563eb', fontWeight: 700, textDecoration: 'underline', cursor: 'pointer', padding: 0 }}
                  >
                    Click here to Sign Up
                  </button>
                </p>
              )}
            </div>
          )}

          {successMsg && (
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#166534',
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <CheckCircle style={{ width: '16px', height: '16px', flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* SIGNUP FULL NAME */}
          {!isLogin && (
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--navy-dark)', marginBottom: '0.35rem' }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <User style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#94a3b8' }} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Abhishek Kumar"
                  required={!isLogin}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.75rem 0.65rem 2.25rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          )}

          {/* EMAIL */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--navy-dark)', marginBottom: '0.35rem' }}>
              Student Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#94a3b8' }} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="student@indus.edu"
                required
                style={{
                  width: '100%',
                  padding: '0.65rem 0.75rem 0.65rem 2.25rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.88rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--navy-dark)', marginBottom: '0.35rem' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#94a3b8' }} />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                minLength={6}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.75rem 0.65rem 2.25rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.88rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* SIGNUP EXTRA FIELDS */}
          {!isLogin && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--navy-dark)', marginBottom: '0.35rem' }}>
                    Degree & Program
                  </label>
                  <select
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.5rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.82rem',
                      outline: 'none',
                      background: '#ffffff'
                    }}
                  >
                    <option value="B.Tech Computer Science">B.Tech CS</option>
                    <option value="B.Tech Information Tech">B.Tech IT</option>
                    <option value="B.Tech Electronics (ECE)">B.Tech ECE</option>
                    <option value="B.Tech Mechanical">B.Tech ME</option>
                    <option value="B.Tech Civil">B.Tech Civil</option>
                    <option value="BCA">BCA</option>
                    <option value="MCA">MCA</option>
                    <option value="MBA">MBA</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--navy-dark)', marginBottom: '0.35rem' }}>
                    Current Semester
                  </label>
                  <select
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.5rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.82rem',
                      outline: 'none',
                      background: '#ffffff'
                    }}
                  >
                    <option value="1st Semester">1st Sem</option>
                    <option value="2nd Semester">2nd Sem</option>
                    <option value="3rd Semester">3rd Sem</option>
                    <option value="4th Semester">4th Sem</option>
                    <option value="5th Semester">5th Sem</option>
                    <option value="6th Semester">6th Sem</option>
                    <option value="7th Semester">7th Sem</option>
                    <option value="8th Semester">8th Sem</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--navy-dark)', marginBottom: '0.35rem' }}>
                  Roll Number (Optional)
                </label>
                <input
                  type="text"
                  name="rollNumber"
                  value={formData.rollNumber}
                  onChange={handleChange}
                  placeholder="e.g. 2100320100050"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                />
              </div>
            </>
          )}

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '0.5rem',
              padding: '0.75rem',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
              color: '#ffffff',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)',
              transition: 'opacity 0.15s ease'
            }}
          >
            {loading ? (
              <span>Processing...</span>
            ) : isLogin ? (
              <>
                <LogIn style={{ width: '16px', height: '16px' }} />
                <span>Sign In</span>
              </>
            ) : (
              <>
                <UserPlus style={{ width: '16px', height: '16px' }} />
                <span>Create Account</span>
              </>
            )}
          </button>

          {/* TOGGLE LOGIN / SIGNUP */}
          <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.82rem', color: '#64748b' }}>
            {isLogin ? (
              <span>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setIsLogin(false); setError(''); }}
                  style={{ background: 'transparent', border: 'none', color: '#2563eb', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                >
                  Sign Up
                </button>
              </span>
            ) : (
              <span>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => { setIsLogin(true); setError(''); }}
                  style={{ background: 'transparent', border: 'none', color: '#2563eb', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                >
                  Sign In
                </button>
              </span>
            )}
          </div>

        </form>
      </div>
    </div>
  );
}

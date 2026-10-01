import React, { useState, useRef } from 'react';
import { X, UploadCloud, FileText, Trash2, Database, Sparkles, CheckCircle2, AlertCircle, BookOpen } from 'lucide-react';

export default function DocumentManager({ isOpen, onClose, documents, onUpload, onDelete, onSeedSample, isUploading }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [statusMsg, setStatusMsg] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file) => {
    const name = file.name.toLowerCase();
    if (!name.endsWith('.pdf') && !name.endsWith('.txt') && !name.endsWith('.md')) {
      setStatusMsg({ type: 'error', text: 'Please select a valid PDF, TXT, or MD document.' });
      return;
    }
    setSelectedFile(file);
    setStatusMsg(null);
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) return;
    try {
      await onUpload(selectedFile);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setStatusMsg({ type: 'success', text: 'Document uploaded and indexed in Qdrant successfully!' });
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to upload document.' });
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div className="ui-card" style={{
        maxWidth: '840px',
        width: '100%',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-dropdown)'
      }}>
        
        {/* Header */}
        <div style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Database style={{ width: '20px', height: '20px', color: 'var(--navy-primary)' }} />
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--navy-dark)' }}>
                Indus Knowledge Base & Document Manager
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Upload official university PDFs to index them into Qdrant for RAG search
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.3rem' }}
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', background: '#fafbfc' }}>
          
          {/* Top Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--navy-dark)' }}>
              Uploaded University Documents ({documents.length})
            </span>

            <button
              onClick={onSeedSample}
              disabled={isUploading}
              style={{
                background: 'var(--blue-light)',
                border: '1px solid var(--blue-border)',
                color: 'var(--blue-accent)',
                padding: '0.45rem 0.875rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: isUploading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <Sparkles style={{ width: '14px', height: '14px' }} />
              <span>Seed Sample University PDFs</span>
            </button>
          </div>

          {/* Upload Dropzone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: dragActive ? '2px dashed var(--blue-accent)' : '2px dashed var(--border-strong)',
              background: dragActive ? 'var(--blue-light)' : '#ffffff',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <input ref={fileInputRef} type="file" accept=".pdf,.txt,.md" onChange={handleChange} style={{ display: 'none' }} />
            <UploadCloud style={{ width: '32px', height: '32px', color: 'var(--navy-primary)', margin: '0 auto 0.5rem auto' }} />
            <p style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--navy-dark)' }}>
              Click or Drag & Drop PDF / TXT Document
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Maximum size 25MB (PDF, TXT, MD)
            </p>
          </div>

          {/* Selected File Card */}
          {selectedFile && (
            <div style={{
              background: 'var(--blue-light)',
              border: '1px solid var(--blue-border)',
              borderRadius: 'var(--radius-md)',
              padding: '0.65rem 0.875rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText style={{ width: '16px', height: '16px', color: 'var(--blue-accent)' }} />
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--navy-dark)' }}>{selectedFile.name}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>({formatBytes(selectedFile.size)})</span>
              </div>
              <button
                onClick={handleUploadSubmit}
                disabled={isUploading}
                style={{
                  background: 'var(--navy-primary)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: isUploading ? 'not-allowed' : 'pointer'
                }}
              >
                {isUploading ? 'Processing...' : 'Upload & Index'}
              </button>
            </div>
          )}

          {/* Status Alert */}
          {statusMsg && (
            <div style={{
              background: statusMsg.type === 'error' ? '#fef2f2' : '#f0fdf4',
              border: statusMsg.type === 'error' ? '1px solid #fecaca' : '1px solid #bbf7d0',
              color: statusMsg.type === 'error' ? '#dc2626' : '#16a34a',
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}>
              {statusMsg.type === 'error' ? <AlertCircle style={{ width: '15px', height: '15px' }} /> : <CheckCircle2 style={{ width: '15px', height: '15px' }} />}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* Document Cards List */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.75rem' }}>
            {documents.map((doc) => (
              <div
                key={doc.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem 0.875rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.5rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                  <FileText style={{ width: '16px', height: '16px', color: 'var(--navy-primary)', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--navy-dark)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {doc.name}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  <span>{doc.chunkCount} vector chunks</span>
                  <button
                    onClick={() => onDelete(doc.id)}
                    style={{ background: 'transparent', border: 'none', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                  >
                    <Trash2 style={{ width: '12px', height: '12px' }} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Footer */}
        <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid var(--border-color)', background: '#ffffff', textAlign: 'right' }}>
          <button
            onClick={onClose}
            style={{
              background: 'var(--navy-primary)',
              color: '#ffffff',
              border: 'none',
              padding: '0.5rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}

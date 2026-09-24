import { X, ExternalLink } from 'lucide-react';

export default function ImagePreviewModal({ isOpen, onClose, src, title = 'Inspection Photo' }) {
  if (!isOpen || !src) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.82)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: 'relative',
          maxWidth: '90vw',
          maxHeight: '90vh',
          background: '#0f172a',
          borderRadius: '12px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.75rem 1.25rem',
            background: 'rgba(15, 23, 42, 0.95)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#ffffff',
          }}
        >
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{title}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <a
              href={src}
              target="_blank"
              rel="noreferrer"
              style={{
                color: '#94a3b8',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.8rem',
                textDecoration: 'none',
              }}
            >
              <span>Full Size</span>
              <ExternalLink size={14} />
            </a>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '0.25rem',
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Image body */}
        <div
          style={{
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'auto',
          }}
        >
          <img
            src={src}
            alt={title}
            style={{
              maxWidth: '85vw',
              maxHeight: '78vh',
              objectFit: 'contain',
              borderRadius: '6px',
            }}
          />
        </div>
      </div>
    </div>
  );
}

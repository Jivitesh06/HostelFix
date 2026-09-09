import { Inbox } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There is no data to display in this view.',
  actionLabel,
  onAction,
}) {
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px dashed #cbd5e1',
        borderRadius: '12px',
        padding: '3.5rem 1.5rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: '540px',
        margin: '1.5rem auto',
      }}
    >
      <div
        style={{
          width: '54px',
          height: '54px',
          borderRadius: '14px',
          background: '#f1f5f9',
          color: '#64748b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
        }}
      >
        <Icon size={26} strokeWidth={1.75} />
      </div>

      <h3
        style={{
          fontSize: '1.05rem',
          fontWeight: 600,
          color: '#0f172a',
          margin: '0 0 0.4rem',
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontSize: '0.875rem',
          color: '#64748b',
          maxWidth: '380px',
          margin: '0 0 1.25rem',
          lineHeight: 1.5,
        }}
      >
        {description}
      </p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          style={{
            background: '#4f46e5',
            color: '#ffffff',
            padding: '0.6rem 1.25rem',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#4338ca')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#4f46e5')}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

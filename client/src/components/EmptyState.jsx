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
        border: '1px dashed #e5e7eb',
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
          background: '#f4f4f5',
          color: '#6b7280',
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
          color: '#171717',
          margin: '0 0 0.4rem',
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontSize: '0.875rem',
          color: '#6b7280',
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
            background: '#c8102e',
            color: '#ffffff',
            padding: '0.6rem 1.25rem',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#a50d25')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#c8102e')}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

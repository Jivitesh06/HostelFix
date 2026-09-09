const STATUS_CONFIG = {
  PENDING: {
    label: 'Pending Review',
    bg: '#fef3c7',
    color: '#92400e',
    border: '#fde68a',
    dot: '#d97706',
  },
  APPROVED: {
    label: 'Approved',
    bg: '#eff6ff',
    color: '#1e40af',
    border: '#bfdbfe',
    dot: '#2563eb',
  },
  ASSIGNED: {
    label: 'Assigned',
    bg: '#f5f3ff',
    color: '#6d28d9',
    border: '#ddd6fe',
    dot: '#7c3aed',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    bg: '#f0f9ff',
    color: '#0369a1',
    border: '#bae6fd',
    dot: '#0284c7',
  },
  RESOLVED: {
    label: 'Resolved',
    bg: '#ecfdf5',
    color: '#065f46',
    border: '#a7f3d0',
    dot: '#059669',
  },
  CLOSED: {
    label: 'Closed',
    bg: '#f1f5f9',
    color: '#334155',
    border: '#cbd5e1',
    dot: '#64748b',
  },
  REJECTED: {
    label: 'Rejected',
    bg: '#fff1f2',
    color: '#9f1239',
    border: '#fecdd3',
    dot: '#e11d48',
  },
};

export default function StatusBadge({ status, size = 'md' }) {
  const config = STATUS_CONFIG[status] || {
    label: status,
    bg: '#f1f5f9',
    color: '#475569',
    border: '#e2e8f0',
    dot: '#94a3b8',
  };

  const isSmall = size === 'sm';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: isSmall ? '0.35rem' : '0.45rem',
        padding: isSmall ? '0.15rem 0.55rem' : '0.25rem 0.65rem',
        borderRadius: '9999px',
        fontSize: isSmall ? '0.7rem' : '0.75rem',
        fontWeight: 600,
        backgroundColor: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        letterSpacing: '0.02em',
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: isSmall ? '5px' : '6px',
          height: isSmall ? '5px' : '6px',
          borderRadius: '50%',
          backgroundColor: config.dot,
          display: 'inline-block',
          flexShrink: 0,
        }}
      />
      {config.label}
    </span>
  );
}

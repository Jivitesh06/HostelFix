const STATUS_CONFIG = {
  PENDING: {
    label: 'Pending Review',
    bg: '#fef3c7',
    color: '#92400e',
    border: '#fde68a',
  },
  APPROVED: {
    label: 'Approved',
    bg: '#dbeafe',
    color: '#1e40af',
    border: '#bfdbfe',
  },
  ASSIGNED: {
    label: 'Assigned to Staff',
    bg: '#f3e8ff',
    color: '#6b21a8',
    border: '#e9d5ff',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    bg: '#e0e7ff',
    color: '#3730a3',
    border: '#c7d2fe',
  },
  RESOLVED: {
    label: 'Resolved',
    bg: '#d1fae5',
    color: '#065f46',
    border: '#a7f3d0',
  },
  CLOSED: {
    label: 'Closed',
    bg: '#f1f5f9',
    color: '#475569',
    border: '#cbd5e1',
  },
  REJECTED: {
    label: 'Rejected',
    bg: '#fee2e2',
    color: '#991b1b',
    border: '#fca5a5',
  },
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || {
    label: status,
    bg: '#f1f5f9',
    color: '#475569',
    border: '#e2e8f0',
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.25rem 0.65rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 600,
        backgroundColor: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        letterSpacing: '0.025em',
        textTransform: 'uppercase',
      }}
    >
      {config.label}
    </span>
  );
}

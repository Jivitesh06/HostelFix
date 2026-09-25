import StatusBadge from './StatusBadge';
import {
  CheckCircle2,
  Clock,
  UserCheck,
  PlayCircle,
  CheckCheck,
  Archive,
  XCircle,
  FileText,
} from 'lucide-react';

const STATUS_ICONS = {
  PENDING: Clock,
  APPROVED: UserCheck,
  ASSIGNED: UserCheck,
  IN_PROGRESS: PlayCircle,
  RESOLVED: CheckCircle2,
  CLOSED: Archive,
  REJECTED: XCircle,
};

const STANDARD_STEPS = [
  { status: 'PENDING', label: 'Submitted' },
  { status: 'APPROVED', label: 'Approved' },
  { status: 'ASSIGNED', label: 'Assigned' },
  { status: 'IN_PROGRESS', label: 'In Progress' },
  { status: 'RESOLVED', label: 'Resolved' },
  { status: 'CLOSED', label: 'Closed' },
];

export default function StatusTimeline({ logs = [], currentStatus }) {
  if (!logs || logs.length === 0) {
    return (
      <div style={{ color: '#94a3b8', fontStyle: 'italic', padding: '1rem 0' }}>
        No status audit history recorded.
      </div>
    );
  }

  // Determine current active status (either passed or latest log)
  const activeStatus = currentStatus || logs[logs.length - 1]?.newStatus || 'PENDING';
  const isRejected = activeStatus === 'REJECTED';

  // Find index in standard flow
  const currentStepIndex = STANDARD_STEPS.findIndex((s) => s.status === activeStatus);

  return (
    <div style={{ marginTop: '2rem' }}>
      {/* ── 1. Visual Progress Flow Stepper ────────────────────────────── */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h4
            style={{
              fontSize: '0.875rem',
              fontWeight: 700,
              color: '#334155',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              margin: 0,
            }}
          >
            Lifecycle Progress
          </h4>
          <StatusBadge status={activeStatus} size="sm" />
        </div>

        {isRejected ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem 1.25rem',
              background: '#fff1f2',
              border: '1px solid #fecdd3',
              borderRadius: '8px',
              color: '#9f1239',
            }}
          >
            <XCircle size={22} color="#e11d48" />
            <div>
              <strong style={{ fontSize: '0.9rem', display: 'block' }}>
                Complaint Rejected (Terminal State)
              </strong>
              <span style={{ fontSize: '0.8rem', color: '#be123c' }}>
                This issue was reviewed and rejected by hostel administration.
              </span>
            </div>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'relative',
              overflowX: 'auto',
              padding: '0.5rem 0',
            }}
          >
            {/* Background connecting bar */}
            <div
              style={{
                position: 'absolute',
                top: '18px',
                left: '24px',
                right: '24px',
                height: '3px',
                backgroundColor: '#e2e8f0',
                zIndex: 1,
              }}
            />

            {/* Filled active bar */}
            {currentStepIndex >= 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '18px',
                  left: '24px',
                  width: `${(currentStepIndex / (STANDARD_STEPS.length - 1)) * 100}%`,
                  height: '3px',
                  backgroundColor: '#c8102e',
                  zIndex: 2,
                  transition: 'width 0.3s ease',
                }}
              />
            )}

            {STANDARD_STEPS.map((step, idx) => {
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              const isPending = idx > currentStepIndex;

              return (
                <div
                  key={step.status}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    zIndex: 3,
                    minWidth: '60px',
                  }}
                >
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isCurrent ? '#c8102e' : isPast ? '#ffffff' : '#ffffff',
                      border: isCurrent
                        ? '3px solid #fecdd3'
                        : isPast
                        ? '2.5px solid #c8102e'
                        : '2px solid #e5e7eb',
                      color: isCurrent ? '#ffffff' : isPast ? '#c8102e' : '#9ca3af',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      boxShadow: isCurrent ? '0 0 0 4px rgba(200, 16, 46, 0.15)' : 'none',
                    }}
                  >
                    {isPast ? <CheckCheck size={14} strokeWidth={2.5} /> : idx + 1}
                  </div>

                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: isCurrent ? 700 : isPast ? 600 : 500,
                      color: isCurrent ? '#c8102e' : isPast ? '#171717' : '#9ca3af',
                      marginTop: '0.5rem',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── 2. Detailed Audit Trail & Status History ───────────────────── */}
      <div>
        <h3
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: '#171717',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <FileText size={18} color="#c8102e" />
          Audit Trail & Status History
        </h3>

        <div style={{ position: 'relative', paddingLeft: '2rem' }}>
          {/* Vertical connecting line */}
          <div
            style={{
              position: 'absolute',
              top: '12px',
              bottom: '12px',
              left: '11px',
              width: '2px',
              backgroundColor: '#e5e7eb',
            }}
          />

          {logs.map((log, index) => {
            const isLatest = index === logs.length - 1;
            const Icon = STATUS_ICONS[log.newStatus] || Clock;
            const dateStr = new Date(log.timestamp).toLocaleString(undefined, {
              dateStyle: 'medium',
              timeStyle: 'short',
            });

            return (
              <div
                key={log.id || index}
                style={{
                  position: 'relative',
                  marginBottom: '1.5rem',
                }}
              >
                {/* Timeline node icon */}
                <div
                  style={{
                    position: 'absolute',
                    left: '-2rem',
                    top: '6px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: isLatest ? '#c8102e' : '#ffffff',
                    border: isLatest ? '2px solid #ffffff' : '2px solid #e5e7eb',
                    color: isLatest ? '#ffffff' : '#6b7280',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isLatest ? '0 0 0 3px rgba(200, 16, 46, 0.2)' : 'none',
                    zIndex: 2,
                  }}
                >
                  <Icon size={12} strokeWidth={2.5} />
                </div>

                {/* Audit log entry card */}
                <div
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '10px',
                    padding: '1rem 1.25rem',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                      marginBottom: '0.4rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <StatusBadge status={log.newStatus} size="sm" />
                      {log.oldStatus && (
                        <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                          transitioned from <strong>{log.oldStatus}</strong>
                        </span>
                      )}
                    </div>

                    <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontVariantNumeric: 'tabular-nums' }}>
                      {dateStr}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: '#374151' }}>
                    <span style={{ color: '#6b7280' }}>Updated by: </span>
                    <strong style={{ color: '#171717' }}>{log.changedBy?.name || 'System'}</strong>
                    {log.changedBy?.role && (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          background: '#f4f4f5',
                          color: '#374151',
                          padding: '0.1rem 0.4rem',
                          borderRadius: '4px',
                          marginLeft: '0.4rem',
                          fontWeight: 600,
                        }}
                      >
                        {log.changedBy.role}
                      </span>
                    )}
                  </div>

                  {log.note && (
                    <div
                      style={{
                        marginTop: '0.5rem',
                        fontSize: '0.85rem',
                        color: '#374151',
                        background: '#f8f8f8',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '6px',
                        border: '1px solid #e5e7eb',
                        fontStyle: 'italic',
                      }}
                    >
                      "{log.note}"
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

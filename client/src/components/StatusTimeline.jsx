import StatusBadge from './StatusBadge';

export default function StatusTimeline({ logs = [] }) {
  if (!logs || logs.length === 0) {
    return (
      <div style={{ color: '#94a3b8', fontStyle: 'italic', padding: '1rem 0' }}>
        No status history recorded.
      </div>
    );
  }

  return (
    <div style={{ marginTop: '1.5rem', position: 'relative' }}>
      <h3 style={{ fontSize: '1.1rem', color: '#1e293b', marginBottom: '1.25rem' }}>
        Audit Timeline & Status History
      </h3>

      <div style={{ position: 'relative', paddingLeft: '1.75rem' }}>
        {/* Continuous vertical line */}
        <div
          style={{
            position: 'absolute',
            top: '8px',
            bottom: '8px',
            left: '7px',
            width: '2px',
            backgroundColor: '#cbd5e1',
          }}
        />

        {logs.map((log, index) => {
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
              {/* Timeline circle node */}
              <div
                style={{
                  position: 'absolute',
                  left: '-1.75rem',
                  top: '4px',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: index === logs.length - 1 ? '#2563eb' : '#94a3b8',
                  border: '3px solid #ffffff',
                  boxShadow: '0 0 0 1px #cbd5e1',
                }}
              />

              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  padding: '0.85rem 1rem',
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
                    <StatusBadge status={log.newStatus} />
                    {log.oldStatus && (
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        (from {log.oldStatus})
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {dateStr}
                  </span>
                </div>

                <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                  <strong>Updated by:</strong>{' '}
                  {log.changedBy ? (
                    <span>
                      {log.changedBy.name}{' '}
                      <span style={{ color: '#64748b', fontSize: '0.8rem' }}>
                        ({log.changedBy.role})
                      </span>
                    </span>
                  ) : (
                    'System'
                  )}
                </div>

                {log.note && (
                  <div
                    style={{
                      marginTop: '0.4rem',
                      fontSize: '0.85rem',
                      color: '#475569',
                      background: '#ffffff',
                      padding: '0.4rem 0.6rem',
                      borderRadius: '4px',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <em>Note:</em> {log.note}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

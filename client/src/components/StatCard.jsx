export default function StatCard({
  icon: Icon,
  title,
  value,
  subtitle,
  accentColor = '#4f46e5',
  accentBg = '#eef2ff',
  loading = false,
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '1.25rem 1.5rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 12px -2px rgba(0, 0, 0, 0.08)';
          e.currentTarget.style.borderColor = accentColor;
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.05)';
          e.currentTarget.style.borderColor = '#e2e8f0';
        }
      }}
    >
      {/* Top accent pill/border */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          backgroundColor: accentColor,
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <span
          style={{
            fontSize: '0.85rem',
            fontWeight: 600,
            color: '#475569',
            letterSpacing: '0.01em',
          }}
        >
          {title}
        </span>
        {Icon && (
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: accentBg,
              color: accentColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon size={18} strokeWidth={2.2} />
          </div>
        )}
      </div>

      <div>
        <div
          style={{
            fontSize: '1.85rem',
            fontWeight: 700,
            color: '#0f172a',
            lineHeight: 1.1,
            marginBottom: '0.35rem',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {loading ? '—' : value}
        </div>
        {subtitle && (
          <p
            style={{
              fontSize: '0.8rem',
              color: '#64748b',
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

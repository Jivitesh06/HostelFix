import {
  Zap,
  Droplets,
  Sparkles,
  Armchair,
  Wifi,
  Wrench,
} from 'lucide-react';

const CATEGORY_MAP = {
  ELECTRICAL: {
    label: 'Electrical',
    Icon: Zap,
    color: '#b45309',
    bg: '#fef3c7',
    border: '#fde68a',
  },
  PLUMBING: {
    label: 'Plumbing',
    Icon: Droplets,
    color: '#0369a1',
    bg: '#e0f2fe',
    border: '#bae6fd',
  },
  CLEANING: {
    label: 'Cleaning',
    Icon: Sparkles,
    color: '#047857',
    bg: '#d1fae5',
    border: '#a7f3d0',
  },
  FURNITURE: {
    label: 'Furniture',
    Icon: Armchair,
    color: '#9333ea',
    bg: '#f3e8ff',
    border: '#e9d5ff',
  },
  INTERNET: {
    label: 'Internet & WiFi',
    Icon: Wifi,
    color: '#2563eb',
    bg: '#eff6ff',
    border: '#bfdbfe',
  },
  OTHER: {
    label: 'Other Maintenance',
    Icon: Wrench,
    color: '#475569',
    bg: '#f1f5f9',
    border: '#e2e8f0',
  },
};

export default function CategoryBadge({ category, showIcon = true, size = 'md' }) {
  const item = CATEGORY_MAP[category] || {
    label: category,
    Icon: Wrench,
    color: '#475569',
    bg: '#f1f5f9',
    border: '#e2e8f0',
  };

  const { label, Icon, color, bg, border } = item;
  const isSmall = size === 'sm';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: isSmall ? '0.3rem' : '0.4rem',
        padding: isSmall ? '0.15rem 0.5rem' : '0.2rem 0.6rem',
        borderRadius: '6px',
        fontSize: isSmall ? '0.7rem' : '0.75rem',
        fontWeight: 600,
        backgroundColor: bg,
        color: color,
        border: `1px solid ${border}`,
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
      }}
    >
      {showIcon && <Icon size={isSmall ? 11 : 13} strokeWidth={2.2} />}
      <span>{label}</span>
    </span>
  );
}

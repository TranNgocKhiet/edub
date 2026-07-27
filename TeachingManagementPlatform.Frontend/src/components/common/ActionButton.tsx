import CrudIcon from './CrudIcon';

interface ActionButtonProps {
  icon: string;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  color?: 'primary' | 'warning' | 'error' | 'success' | 'default';
}

const COLOR_MAP = {
  primary: { border: 'var(--btn-view)', text: 'var(--btn-view)' },
  warning: { border: 'var(--btn-update)', text: 'var(--btn-update)' },
  error: { border: 'var(--btn-delete)', text: 'var(--btn-delete)' },
  success: { border: 'var(--btn-add)', text: 'var(--btn-add)' },
  default: { border: 'var(--edub-action-neutral)', text: 'var(--edub-action-neutral)' },
};

export default function ActionButton({ icon, label, onClick, disabled, color = 'default' }: ActionButtonProps) {
  const colors = COLOR_MAP[color];
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '4px 10px',
        minHeight: 44,
        borderRadius: 12,
        border: `1px solid ${disabled ? '#d1d5db' : colors.border}`,
        background: 'transparent',
        color: disabled ? 'var(--edub-text-secondary)' : colors.text,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: 'nowrap',
        opacity: disabled ? 0.6 : 1,
        transition: 'background-color 150ms',
      }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.backgroundColor = 'var(--edub-hover)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
    >
      <CrudIcon name={icon} size={14} />
      {label}
    </button>
  );
}

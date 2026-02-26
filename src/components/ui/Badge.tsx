interface BadgeProps {
  variant?: 'success' | 'warning' | 'error' | 'neutral' | 'accent'
  pulse?: boolean
  children: React.ReactNode
  className?: string
}

const variantStyles = {
  success: {
    bg: 'bg-success/15',
    text: 'text-success',
    dot: 'bg-success',
  },
  warning: {
    bg: 'bg-warning/15',
    text: 'text-warning',
    dot: 'bg-warning',
  },
  error: {
    bg: 'bg-error/15',
    text: 'text-error',
    dot: 'bg-error',
  },
  neutral: {
    bg: 'bg-white/[0.06]',
    text: 'text-text-secondary',
    dot: 'bg-text-secondary',
  },
  accent: {
    bg: 'bg-accent-purple/15',
    text: 'text-accent-purple',
    dot: 'bg-accent-purple',
  },
}

export default function Badge({
  variant = 'neutral',
  pulse = false,
  children,
  className = '',
}: BadgeProps) {
  const styles = variantStyles[variant]

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
        text-[11px] font-medium uppercase tracking-wider
        ${styles.bg} ${styles.text}
        ${className}
      `}
    >
      <span className="relative flex h-1.5 w-1.5">
        {pulse && (
          <span
            className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${styles.dot}`}
          />
        )}
        <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${styles.dot}`} />
      </span>
      {children}
    </span>
  )
}

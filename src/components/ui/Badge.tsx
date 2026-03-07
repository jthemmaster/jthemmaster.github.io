interface BadgeProps {
  variant?: 'success' | 'warning' | 'error' | 'neutral' | 'accent'
  pulse?: boolean
  children: React.ReactNode
  className?: string
}

const variantStyles = {
  success: {
    bg: 'bg-success/12 border border-success/20',
    text: 'text-success',
    dot: 'bg-success',
  },
  warning: {
    bg: 'bg-warning/12 border border-warning/20',
    text: 'text-warning',
    dot: 'bg-warning',
  },
  error: {
    bg: 'bg-error/12 border border-error/20',
    text: 'text-error',
    dot: 'bg-error',
  },
  neutral: {
    bg: 'bg-white/[0.04] border border-white/[0.08]',
    text: 'text-text-secondary',
    dot: 'bg-text-secondary',
  },
  accent: {
    bg: 'bg-accent-blue/12 border border-accent-blue/20',
    text: 'text-accent-blue',
    dot: 'bg-accent-blue',
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
        text-[10px] font-medium uppercase tracking-[0.2em]
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

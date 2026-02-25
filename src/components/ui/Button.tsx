import { type ReactNode, type ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon'
  size?: 'sm' | 'md' | 'lg'
  glow?: boolean
  children: ReactNode
}

const variantStyles = {
  primary:
    'bg-gradient-to-r from-accent-purple to-accent-blue text-white shadow-lg shadow-accent-purple/20 hover:shadow-accent-purple/40 hover:brightness-110 active:brightness-90',
  secondary:
    'glass glass-hover text-text-primary hover:text-white',
  ghost:
    'bg-transparent text-text-secondary hover:text-text-primary hover:bg-white/[0.05] active:bg-white/[0.08]',
  icon:
    'glass glass-hover text-text-secondary hover:text-text-primary aspect-square flex items-center justify-center',
}

const sizeStyles = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-4 py-2 text-sm rounded-lg gap-2',
  lg: 'px-5 py-2.5 text-sm rounded-xl gap-2',
}

const iconSizeStyles = {
  sm: 'w-7 h-7 rounded-lg',
  md: 'w-9 h-9 rounded-lg',
  lg: 'w-11 h-11 rounded-xl',
}

export default function Button({
  variant = 'secondary',
  size = 'md',
  glow = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const sizeClass = variant === 'icon' ? iconSizeStyles[size] : sizeStyles[size]

  return (
    <button
      className={`
        inline-flex items-center justify-center font-medium
        transition-all duration-200 ease-out
        ${variantStyles[variant]}
        ${sizeClass}
        ${glow ? 'shadow-[0_0_20px_rgba(139,92,246,0.3)]' : ''}
        ${disabled ? 'opacity-40 pointer-events-none' : 'active:scale-[0.97]'}
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

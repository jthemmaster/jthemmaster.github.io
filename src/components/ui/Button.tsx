import { type ReactNode, type ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon'
  size?: 'sm' | 'md' | 'lg'
  glow?: boolean
  children: ReactNode
}

const variantStyles = {
  primary:
    'border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0.05))] text-white shadow-[0_14px_40px_rgba(0,0,0,0.22)] hover:border-white/18 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0.07))]',
  secondary:
    'panel-soft panel-soft-hover text-text-primary hover:text-white',
  ghost:
    'bg-transparent text-text-secondary hover:text-text-primary hover:bg-white/[0.04] active:bg-white/[0.06]',
  icon:
    'panel-soft panel-soft-hover text-text-secondary hover:text-text-primary aspect-square flex items-center justify-center',
}

const sizeStyles = {
  sm: 'px-3 py-1.5 text-xs rounded-xl gap-1.5',
  md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-5 py-3 text-sm rounded-2xl gap-2',
}

const iconSizeStyles = {
  sm: 'w-8 h-8 rounded-xl',
  md: 'w-10 h-10 rounded-xl',
  lg: 'w-12 h-12 rounded-2xl',
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
        ${glow ? 'shadow-[0_18px_50px_rgba(143,124,255,0.16)]' : ''}
        ${disabled ? 'opacity-40 pointer-events-none' : 'active:scale-[0.985]'}
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

import { type ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
  glow?: boolean
}

const paddingMap = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
}

export default function GlassCard({
  children,
  className = '',
  padding = 'md',
  hover = false,
  glow = false,
}: GlassCardProps) {
  return (
    <div
      className={`
        glass rounded-xl
        ${paddingMap[padding]}
        ${hover ? 'glass-hover transition-all duration-200 cursor-pointer' : ''}
        ${glow ? 'shadow-[0_0_20px_rgba(139,92,246,0.1)]' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}

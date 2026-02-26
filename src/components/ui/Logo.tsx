interface LogoProps {
  showText?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = {
  sm: { icon: 24, text: 'text-sm' },
  md: { icon: 32, text: 'text-base' },
  lg: { icon: 40, text: 'text-lg' },
}

export default function Logo({ showText = true, size = 'md' }: LogoProps) {
  const { icon, text } = sizeMap[size]

  return (
    <div className="flex items-center gap-2.5">
      <div className="relative">
        <svg
          width={icon}
          height={icon}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="animate-[spin_20s_linear_infinite]"
        >
          <ellipse
            cx="32"
            cy="32"
            rx="26"
            ry="10"
            stroke="url(#logoGrad)"
            strokeWidth="1.5"
            opacity="0.6"
            transform="rotate(0 32 32)"
          />
          <ellipse
            cx="32"
            cy="32"
            rx="26"
            ry="10"
            stroke="url(#logoGrad)"
            strokeWidth="1.5"
            opacity="0.6"
            transform="rotate(60 32 32)"
          />
          <ellipse
            cx="32"
            cy="32"
            rx="26"
            ry="10"
            stroke="url(#logoGrad)"
            strokeWidth="1.5"
            opacity="0.6"
            transform="rotate(-60 32 32)"
          />
          <defs>
            <linearGradient id="logoGrad" x1="6" y1="32" x2="58" y2="32">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
          </defs>
        </svg>
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ animation: 'none' }}
        >
          <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-accent-purple to-accent-blue shadow-[0_0_12px_rgba(139,92,246,0.6)]" />
        </div>
      </div>
      {showText && (
        <div className="flex items-baseline gap-0">
          <span className={`font-semibold ${text} gradient-text`}>Nano</span>
          <span className={`font-semibold ${text} text-text-primary`}>Reactor</span>
        </div>
      )}
    </div>
  )
}

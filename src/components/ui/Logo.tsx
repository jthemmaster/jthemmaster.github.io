interface LogoProps {
  showText?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = {
  sm: { icon: 'h-9 w-9 rounded-2xl', text: 'text-sm', dot: 'h-2.5 w-2.5', inset: 'inset-[8px]' },
  md: { icon: 'h-11 w-11 rounded-[18px]', text: 'text-base', dot: 'h-3 w-3', inset: 'inset-[9px]' },
  lg: { icon: 'h-14 w-14 rounded-[22px]', text: 'text-lg', dot: 'h-3.5 w-3.5', inset: 'inset-[11px]' },
}

export default function Logo({ showText = true, size = 'md' }: LogoProps) {
  const { icon, text, dot, inset } = sizeMap[size]

  return (
    <div className="flex items-center gap-3">
      <div
        className={`
          relative shrink-0 border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04))]
          shadow-[0_14px_36px_rgba(0,0,0,0.28)] ${icon}
        `}
      >
        <div className={`absolute ${inset} rounded-[14px] border border-white/10 bg-white/[0.02]`} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`${dot} rounded-full bg-[linear-gradient(135deg,#FFFFFF_0%,#C9DDFF_40%,#8F7CFF_100%)]`} />
        </div>
      </div>
      {showText && (
        <div className="flex items-baseline gap-1">
          <span className={`font-semibold tracking-[-0.02em] ${text} gradient-text`}>Nano</span>
          <span className={`font-semibold tracking-[-0.02em] ${text} text-text-primary`}>Reactor</span>
        </div>
      )}
    </div>
  )
}

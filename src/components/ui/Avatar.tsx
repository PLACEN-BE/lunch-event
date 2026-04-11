interface AvatarProps {
  src?: string | null
  nickname: string
  size?: number
  className?: string
}

export function Avatar({ src, nickname, size = 40, className = '' }: AvatarProps) {
  const initial = nickname.charAt(0).toUpperCase()

  if (src) {
    return (
      <img
        src={src}
        alt={nickname}
        width={size}
        height={size}
        className={`rounded-full object-cover shrink-0 ${className}`}
        style={{ width: size, height: size }}
      />
    )
  }

  // 이니셜 기반 fallback — 닉네임 해시로 색상 결정
  const colors = [
    'bg-rose-400', 'bg-orange-400', 'bg-amber-400', 'bg-emerald-400',
    'bg-teal-400', 'bg-cyan-400', 'bg-blue-400', 'bg-violet-400',
    'bg-purple-400', 'bg-pink-400',
  ]
  const colorIndex = nickname.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length
  const bgColor = colors[colorIndex]

  const fontSize = size * 0.4

  return (
    <div
      className={`rounded-full flex items-center justify-center text-white font-bold shrink-0 ${bgColor} ${className}`}
      style={{ width: size, height: size, fontSize }}
    >
      {initial}
    </div>
  )
}

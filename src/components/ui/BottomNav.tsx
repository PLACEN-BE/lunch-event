'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/', label: '홈', icon: '🏠' },
  { href: '/game', label: '게임', icon: '🎮' },
  { href: '/pick', label: '뽑기', icon: '🎯' },
  { href: '/vote', label: '투표', icon: '🍽️' },
  { href: '/fortune', label: '운세', icon: '🔮' },
  { href: '/ranking', label: '랭킹', icon: '🏆' },
  { href: '/my', label: 'MY', icon: '👤' },
]

export function BottomNav() {
  const pathname = usePathname()

  if (pathname === '/login') return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-foreground/5 z-50">
      <div className="max-w-md mx-auto flex justify-around items-center h-16">
        {navItems.map(({ href, label, icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-1 py-1 rounded-2xl transition-colors ${
                isActive ? 'text-primary' : 'text-foreground/35 hover:text-foreground/55'
              }`}
            >
              <span className="text-xl">{icon}</span>
              <span className="text-xs font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

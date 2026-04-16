'use client'

import { useState, type ReactNode } from 'react'

interface RankingModeToggleProps {
  treatContent: ReactNode
  menuContent: ReactNode
}

export function RankingModeToggle({ treatContent, menuContent }: RankingModeToggleProps) {
  const [mode, setMode] = useState<'treat' | 'menu'>('menu')

  return (
    <div className="space-y-4">
      <div className="flex gap-2 bg-foreground/5 p-1 rounded-full">
        <button
          onClick={() => setMode('menu')}
          className={`flex-1 py-2.5 rounded-full font-bold text-sm transition-colors ${
            mode === 'menu'
              ? 'bg-primary text-white shadow-sm'
              : 'text-foreground/40 hover:text-foreground/60'
          }`}
        >
          🍽️ 메뉴왕
        </button>
        <button
          onClick={() => setMode('treat')}
          className={`flex-1 py-2.5 rounded-full font-bold text-sm transition-colors ${
            mode === 'treat'
              ? 'bg-primary text-white shadow-sm'
              : 'text-foreground/40 hover:text-foreground/60'
          }`}
        >
          💸 한턱왕
        </button>
      </div>
      {mode === 'menu' ? menuContent : treatContent}
    </div>
  )
}

'use client'

import { useState, type ReactNode } from 'react'

interface RankingTabsProps {
  monthly: ReactNode
  allTime: ReactNode
}

export function RankingTabs({ monthly, allTime }: RankingTabsProps) {
  const [tab, setTab] = useState<'monthly' | 'alltime'>('monthly')

  return (
    <div className="space-y-4">
      <div className="flex gap-2 bg-foreground/5 p-1 rounded-full">
        <button
          onClick={() => setTab('monthly')}
          className={`flex-1 py-2.5 rounded-full font-bold text-sm transition-colors ${
            tab === 'monthly'
              ? 'bg-primary text-white shadow-sm'
              : 'text-foreground/40 hover:text-foreground/60'
          }`}
        >
          월간
        </button>
        <button
          onClick={() => setTab('alltime')}
          className={`flex-1 py-2.5 rounded-full font-bold text-sm transition-colors ${
            tab === 'alltime'
              ? 'bg-primary text-white shadow-sm'
              : 'text-foreground/40 hover:text-foreground/60'
          }`}
        >
          전체
        </button>
      </div>
      {tab === 'monthly' ? monthly : allTime}
    </div>
  )
}

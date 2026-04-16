'use client'

import { motion } from 'framer-motion'
import type { MenuVoteEntry } from '@/types'
import { MENU_CATEGORIES } from '@/types'

const emojiMap: Map<string, string> = new Map(MENU_CATEGORIES.map(m => [m.name, m.emoji]))

export function MenuRankingBoard({ rankings }: { rankings: MenuVoteEntry[] }) {
  if (rankings.length === 0) return null

  const maxCount = rankings[0].vote_count

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold">주간 메뉴 순위</h2>
      <div className="space-y-2">
        {rankings.map((entry, i) => {
          const emoji = emojiMap.get(entry.menu_category) ?? '🍽️'
          const barColor = i === 0 ? 'bg-gold' : i === 1 ? 'bg-blue-400' : i === 2 ? 'bg-primary' : 'bg-foreground/20'
          return (
            <motion.div
              key={entry.menu_category}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-2xl px-4 py-3 shadow-sm flex items-center gap-3"
            >
              <span className="text-2xl w-8 text-center">{i < 3 ? ['🥇', '🥈', '🥉'][i] : `${i + 1}`}</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm">{emoji} {entry.menu_category}</p>
                <div className="w-full h-1.5 bg-foreground/5 rounded-full mt-1.5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.round((entry.vote_count / maxCount) * 100)}%` }}
                    transition={{ delay: i * 0.1 + 0.3, duration: 0.6 }}
                    className={`h-full rounded-full ${barColor}`}
                  />
                </div>
              </div>
              <span className="text-lg font-black text-primary">{entry.vote_count}<span className="text-xs ml-0.5 text-foreground/40">표</span></span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

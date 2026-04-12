'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getDailyStats } from '@/lib/fortune-data'
import type { DailyStat } from '@/lib/fortune-data'

const BAR_COLORS = [
  'from-purple-500 to-violet-500',
  'from-blue-500 to-cyan-500',
  'from-emerald-500 to-green-500',
  'from-amber-500 to-yellow-500',
  'from-rose-500 to-pink-500',
  'from-indigo-500 to-blue-500',
]

export function DailyStats({ refreshKey }: { refreshKey: number }) {
  const [stats, setStats] = useState<DailyStat[]>([])

  useEffect(() => {
    setStats(getDailyStats())
  }, [refreshKey])

  if (stats.length === 0) return null

  const maxPct = Math.max(...stats.map((s) => s.pct))

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-foreground/60 uppercase tracking-wider">
          오늘의 메뉴 통계
        </h2>
        <span className="text-xs text-foreground/30">
          {stats.reduce((s, d) => s + d.count, 0)}명 참여
        </span>
      </div>

      <div className="space-y-2">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.menu.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex items-center gap-3"
          >
            <span className="text-lg w-7 text-center shrink-0">
              {stat.menu.emoji}
            </span>
            <span className="text-sm font-medium w-16 truncate shrink-0">
              {stat.menu.name}
            </span>
            <div className="flex-1 bg-foreground/5 rounded-full h-5 overflow-hidden">
              <motion.div
                className={`h-full rounded-full bg-gradient-to-r ${BAR_COLORS[i % BAR_COLORS.length]}`}
                initial={{ width: 0 }}
                animate={{ width: `${(stat.pct / maxPct) * 100}%` }}
                transition={{ delay: i * 0.08 + 0.2, duration: 0.6, ease: 'easeOut' }}
              />
            </div>
            <span className="text-xs font-bold text-foreground/50 w-10 text-right tabular-nums shrink-0">
              {stat.pct}%
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

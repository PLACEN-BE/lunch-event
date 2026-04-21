'use client'

import { useState, useTransition } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { MENU_CATEGORIES } from '@/types'
import { submitMenuVote } from '@/lib/actions/vote'

interface MenuGridProps {
  todayVote: string | null
}

export function MenuGrid({ todayVote }: MenuGridProps) {
  const [selected, setSelected] = useState<string | null>(todayVote)
  const [voted, setVoted] = useState(!!todayVote)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSelect = (name: string) => {
    if (voted) return
    setSelected(prev => prev === name ? null : name)
    setError(null)
  }

  const handleVote = () => {
    if (!selected || voted) return
    startTransition(async () => {
      const result = await submitMenuVote(selected)
      if (result.error) {
        setError(result.error)
      } else {
        setVoted(true)
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {MENU_CATEGORIES.map((menu) => {
          const isSelected = selected === menu.name
          return (
            <motion.button
              key={menu.name}
              whileTap={voted ? {} : { scale: 0.97 }}
              onClick={() => handleSelect(menu.name)}
              disabled={voted && selected !== menu.name}
              className={`relative rounded-2xl p-4 text-center shadow-sm transition-all border-2 ${
                isSelected
                  ? 'border-primary bg-primary/10 shadow-md'
                  : 'border-transparent bg-card hover:bg-card/80'
              } ${voted && selected !== menu.name ? 'opacity-40' : ''}`}
            >
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center"
                >
                  <span className="text-white text-xs font-bold">✓</span>
                </motion.div>
              )}
              <span className="text-3xl block mb-1">{menu.emoji}</span>
              <span className={`text-sm font-semibold ${isSelected ? 'text-primary' : 'text-foreground/60'}`}>
                {menu.name}
              </span>
            </motion.button>
          )
        })}
      </div>

      {error && (
        <p className="text-center text-red-500 text-sm font-semibold">{error}</p>
      )}

      <div className="fixed bottom-16 left-0 right-0 px-4 pb-safe">
        <div className="max-w-md mx-auto">
          {voted ? (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => router.push('/ranking')}
              className="w-full py-3.5 rounded-2xl font-extrabold text-white bg-gradient-to-r from-blue-500 to-primary shadow-lg shadow-primary/25"
            >
              명예의 전당 보기 🏆
            </motion.button>
          ) : (
            <button
              onClick={handleVote}
              disabled={!selected || isPending}
              className={`w-full py-3.5 rounded-2xl font-extrabold text-white shadow-lg transition-all ${
                selected
                  ? 'bg-gradient-to-r from-blue-500 to-primary shadow-primary/25'
                  : 'bg-foreground/20 shadow-none cursor-not-allowed'
              }`}
            >
              {isPending ? '먹픽 중...' : '먹픽! 🫵'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

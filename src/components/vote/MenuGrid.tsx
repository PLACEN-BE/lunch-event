'use client'

import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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

  const selectedMenu = selected ? MENU_CATEGORIES.find((m) => m.name === selected) : null

  const handleSelect = (name: string) => {
    if (voted) return
    setSelected((prev) => (prev === name ? null : name))
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

  const handleRevote = () => {
    setVoted(false)
    setSelected(null)
    setError(null)
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {voted && selectedMenu ? (
          <motion.div
            key="voted-summary"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border-2 border-primary bg-primary/10 shadow-md p-4 flex items-center gap-4"
          >
            <span className="text-3xl">{selectedMenu.emoji}</span>
            <div className="flex-1">
              <p className="text-xs text-foreground/50">오늘의 먹픽</p>
              <p className="text-base font-extrabold text-primary">{selectedMenu.name}</p>
            </div>
            <button
              type="button"
              onClick={handleRevote}
              className="text-xs font-bold text-primary border border-primary/40 bg-white rounded-full px-3 py-1.5 hover:bg-primary/5 active:scale-95 transition-all"
            >
              다시 🔄
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-3 gap-3"
          >
            {MENU_CATEGORIES.map((menu) => {
              const isSelected = selected === menu.name
              return (
                <motion.button
                  key={menu.name}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleSelect(menu.name)}
                  className={`relative rounded-2xl p-3 text-center shadow-sm transition-all border-2 ${
                    isSelected
                      ? 'border-primary bg-primary/10 shadow-md'
                      : 'border-transparent bg-card hover:bg-card/80'
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-1.5 right-1.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center"
                    >
                      <span className="text-white text-xs font-bold">✓</span>
                    </motion.div>
                  )}
                  <span className="text-2xl block mb-1">{menu.emoji}</span>
                  <span className={`text-xs font-semibold ${isSelected ? 'text-primary' : 'text-foreground/60'}`}>
                    {menu.name}
                  </span>
                </motion.button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="text-center text-red-500 text-sm font-semibold">{error}</p>}

      {!voted && (
        <button
          onClick={handleVote}
          disabled={!selected || isPending}
          className={`w-full py-3.5 rounded-2xl font-extrabold text-white shadow-lg transition-all ${
            selected
              ? 'bg-gradient-to-r from-blue-500 to-primary shadow-primary/25'
              : 'bg-foreground/20 shadow-none cursor-not-allowed'
          }`}
        >
          {isPending ? '기록 중...' : '기록하기'}
        </button>
      )}
    </div>
  )
}

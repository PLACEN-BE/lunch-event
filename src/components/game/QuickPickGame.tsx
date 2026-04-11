'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface QuickPickGameProps {
  participants: string[]
  winners: string[]
  onPick: () => void
}

export function QuickPickGame({ participants, winners, onPick }: QuickPickGameProps) {
  const [isRolling, setIsRolling] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null)

  useEffect(() => {
    if (!isRolling) return

    let speed = 50
    let elapsed = 0

    function tick() {
      const randomIdx = Math.floor(Math.random() * participants.length)
      setDisplayName(participants[randomIdx])
      elapsed += speed

      if (elapsed > 1200) speed = 200
      else if (elapsed > 800) speed = 150
      else if (elapsed > 400) speed = 100

      intervalRef.current = setTimeout(tick, speed)
    }

    tick()

    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current)
    }
  }, [isRolling, participants])

  useEffect(() => {
    if (winners.length > 0 && isRolling) {
      const timer = setTimeout(() => {
        setIsRolling(false)
        setDisplayName(winners[0])
        if (intervalRef.current) clearTimeout(intervalRef.current)
      }, 1800)
      return () => clearTimeout(timer)
    }
  }, [winners, isRolling])

  function handleStart() {
    setIsRolling(true)
    onPick()
  }

  return (
    <div className="flex flex-col items-center gap-8 pt-8">
      {/* 참여자 목록 */}
      <div className="flex flex-wrap justify-center gap-2">
        {participants.map((name) => (
          <span
            key={name}
            className="px-3 py-1.5 bg-secondary/10 text-secondary rounded-full text-sm font-medium"
          >
            {name}
          </span>
        ))}
      </div>

      {/* 드럼롤 디스플레이 */}
      <div className="w-full max-w-sm aspect-square flex items-center justify-center rounded-[2rem] bg-white border-2 border-foreground/5 shadow-lg">
        <AnimatePresence mode="wait">
          {isRolling ? (
            <motion.span
              key={displayName}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.05 }}
              className="text-5xl font-black text-foreground"
            >
              {displayName}
            </motion.span>
          ) : displayName ? (
            <motion.span
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="text-5xl font-black text-primary"
            >
              {displayName}
            </motion.span>
          ) : (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-6xl"
            >
              🎲
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* 진행 버튼 */}
      {!isRolling && winners.length === 0 && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleStart}
          className="w-full max-w-sm py-4 bg-gradient-to-r from-primary to-secondary rounded-full text-xl font-black text-white shadow-lg shadow-primary/30 active:shadow-primary/10 transition-shadow"
        >
          🎯 뽑기 시작!
        </motion.button>
      )}

      {isRolling && (
        <p className="text-foreground/30 text-sm animate-pulse">추첨 중...</p>
      )}
    </div>
  )
}

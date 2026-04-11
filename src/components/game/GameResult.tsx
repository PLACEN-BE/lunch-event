'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Button } from '@/components/ui/Button'

interface GameResultProps {
  winners: string[]
  participants: string[]
  onSave: () => void
  onReset: () => void
  saving: boolean
  saved: boolean
}

export function GameResult({ winners, participants, onSave, onReset, saving, saved }: GameResultProps) {
  useEffect(() => {
    const duration = 2000
    const end = Date.now() + duration
    const colors = ['#22c55e', '#3b82f6', '#fbbf24', '#60a5fa']

    function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      })
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      })
      if (Date.now() < end) requestAnimationFrame(frame)
    }
    frame()
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6"
    >
      <div className="text-5xl mb-2">🎉</div>

      <div>
        <p className="text-foreground/50 text-sm mb-3">오늘의 당첨자</p>
        <div className="flex flex-wrap justify-center gap-3">
          {winners.map((name, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              className="px-6 py-3 bg-gradient-to-r from-primary to-secondary rounded-full shadow-lg shadow-primary/20"
            >
              <span className="text-2xl font-black text-white">{name}</span>
            </motion.div>
          ))}
        </div>
      </div>

      <p className="text-foreground/30 text-sm">
        {participants.length}명 중 {winners.length}명 당첨
      </p>

      <div className="flex gap-3 justify-center pt-4">
        {!saved ? (
          <Button onClick={onSave} disabled={saving}>
            {saving ? '저장 중...' : '💾 결과 저장'}
          </Button>
        ) : (
          <p className="text-primary text-sm font-medium">✅ 저장 완료!</p>
        )}
        <Button variant="ghost" onClick={onReset}>
          🔄 다시하기
        </Button>
      </div>
    </motion.div>
  )
}

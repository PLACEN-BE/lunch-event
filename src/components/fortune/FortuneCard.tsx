'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { drawFortune, savePersonalPick } from '@/lib/fortune-data'
import { playWin } from '@/lib/sounds'
import type { FortuneResult } from '@/lib/fortune-data'

interface FortuneCardProps {
  onDraw: () => void
}

export function FortuneCard({ onDraw }: FortuneCardProps) {
  const [fortune, setFortune] = useState<FortuneResult | null>(null)
  const [isRevealed, setIsRevealed] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const reveal = useCallback(() => {
    if (isAnimating) return
    setIsAnimating(true)

    const result = drawFortune()
    setFortune(result)
    setIsRevealed(true)

    // 카드 플립 후 효과
    setTimeout(() => {
      savePersonalPick(result.menu.name)
      playWin()
      confetti({
        particleCount: 60,
        spread: 50,
        origin: { y: 0.4 },
        colors: ['#22c55e', '#3b82f6', '#fbbf24', '#8b5cf6'],
      })
      setIsAnimating(false)
      onDraw()
    }, 800)
  }, [isAnimating, onDraw])

  function handleRetry() {
    setIsRevealed(false)
    setFortune(null)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* 카드 */}
      <div
        className="w-full max-w-[320px] cursor-pointer"
        style={{ perspective: 800 }}
        onClick={!isRevealed ? reveal : undefined}
      >
        <motion.div
          className="relative w-full aspect-[3/4]"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ rotateY: isRevealed ? 180 : 0 }}
          transition={{ duration: 0.8, type: 'spring', stiffness: 80, damping: 15 }}
        >
          {/* 앞면 — 미공개 */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 flex flex-col items-center justify-center border-2 border-white/20 shadow-xl p-6" style={{ backfaceVisibility: 'hidden' }}>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-6xl mb-6"
            >
              🔮
            </motion.div>
            <p className="text-white font-black text-xl mb-2">오늘의 메뉴 운명</p>
            <p className="text-white/60 text-sm">탭하여 운명을 확인하세요</p>
            <div className="flex gap-2 mt-6">
              {['✨', '⭐', '✨'].map((s, i) => (
                <motion.span
                  key={i}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.3 }}
                  className="text-2xl"
                >
                  {s}
                </motion.span>
              ))}
            </div>
          </div>

          {/* 뒷면 — 운세 결과 */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white to-purple-50 border-2 border-purple-100 shadow-xl p-6 flex flex-col items-center justify-center" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
            {fortune && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-center space-y-4 w-full"
                >
                  {/* 행운 점수 */}
                  <div>
                    <p className="text-xs text-purple-400 font-bold uppercase tracking-widest mb-1">
                      행운점수
                    </p>
                    <p className="text-4xl font-black text-purple-600">
                      {fortune.score}<span className="text-lg">점</span>
                    </p>
                    <div className="mx-auto mt-2 w-48 bg-purple-100 rounded-full h-2.5 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-purple-400 to-violet-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${fortune.score}%` }}
                        transition={{ delay: 0.6, duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </div>

                  {/* 메뉴 */}
                  <div className="py-3">
                    <span className="text-5xl">{fortune.menu.emoji}</span>
                    <p className="text-2xl font-black mt-2 text-foreground">
                      {fortune.menu.name}
                    </p>
                    <span className="inline-block mt-1 px-3 py-0.5 bg-purple-100 text-purple-500 text-xs font-bold rounded-full">
                      {fortune.menu.category}
                    </span>
                  </div>

                  {/* 운세 문구 */}
                  <p className="text-sm text-foreground/60 leading-relaxed px-2">
                    &ldquo;{fortune.message}&rdquo;
                  </p>

                </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* 버튼 */}
      {isRevealed && !isAnimating && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRetry}
          className="px-8 py-3 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full text-white font-bold shadow-lg shadow-purple-500/25 active:shadow-sm transition-shadow"
        >
          🔮 다시 뽑기
        </motion.button>
      )}

      {!isRevealed && (
        <p className="text-foreground/30 text-xs animate-pulse">
          카드를 탭하세요
        </p>
      )}
    </div>
  )
}

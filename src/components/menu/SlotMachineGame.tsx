'use client'

import { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { startSpinSound, playReelStop, playWin } from '@/lib/sounds'
import type { MenuItem } from '@/types'

interface SlotMachineGameProps {
  menus: MenuItem[]
  onComplete: (winner: string) => void
}

const ITEM_HEIGHT = 72
const REPEATS = 20
const REEL_DURATIONS = [5, 7, 9]
const REEL_EASING = 'cubic-bezier(0.10, 0.80, 0.08, 1.00)'

export function SlotMachineGame({ menus, onComplete }: SlotMachineGameProps) {
  const [isSpinning, setIsSpinning] = useState(false)
  const [offsets, setOffsets] = useState([0, 0, 0])
  const stoppedRef = useRef(0)
  const winnerRef = useRef('')
  const doneRef = useRef(false)
  const stopSoundRef = useRef<(() => void) | null>(null)

  const reelItems = useMemo(
    () => Array.from({ length: REPEATS }, () => menus).flat(),
    [menus],
  )

  // 사운드 cleanup
  useEffect(() => {
    return () => { stopSoundRef.current?.() }
  }, [])

  const spin = useCallback(() => {
    if (isSpinning) return
    setIsSpinning(true)
    stoppedRef.current = 0
    doneRef.current = false

    // 스핀 사운드 시작
    stopSoundRef.current = startSpinSound()

    // 가중치 기반 랜덤 선택
    const totalWeight = menus.reduce((s, m) => s + m.weight, 0)
    let r = Math.random() * totalWeight
    let winner = menus[0]
    for (const m of menus) {
      r -= m.weight
      if (r <= 0) { winner = m; break }
    }
    winnerRef.current = winner.name

    const winnerIdx = menus.findIndex((m) => m.id === winner.id)

    // 각 릴이 다른 거리를 이동 (9초 동안 충분한 스크롤)
    const newOffsets = [
      (menus.length * 10 + winnerIdx) * ITEM_HEIGHT,
      (menus.length * 13 + winnerIdx) * ITEM_HEIGHT,
      (menus.length * 16 + winnerIdx) * ITEM_HEIGHT,
    ]

    setOffsets(newOffsets)
  }, [isSpinning, menus])

  function handleReelStop(e: React.TransitionEvent) {
    if (e.propertyName !== 'transform' || e.target !== e.currentTarget) return
    stoppedRef.current += 1

    // 릴 정지 사운드
    playReelStop()

    if (stoppedRef.current === 3 && !doneRef.current) {
      doneRef.current = true
      // 스핀 사운드 중단
      stopSoundRef.current?.()
      stopSoundRef.current = null

      setTimeout(() => {
        setIsSpinning(false)
        playWin()
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.5 },
          colors: ['#22c55e', '#3b82f6', '#fbbf24', '#ec4899'],
        })
        onComplete(winnerRef.current)
      }, 250)
    }
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* 슬롯 프레임 */}
      <div className="relative bg-gradient-to-b from-foreground/[0.04] to-foreground/[0.08] rounded-3xl p-5 shadow-inner">
        {/* 페이라인 */}
        <div className="absolute top-1/2 -translate-y-1/2 left-3 right-3 h-[2px] rounded-full bg-gradient-to-r from-transparent via-primary/35 to-transparent z-20 pointer-events-none" />

        <div className="flex gap-2">
          {[0, 1, 2].map((reelIdx) => (
            <div
              key={reelIdx}
              className="relative w-[88px] bg-white rounded-2xl shadow-sm overflow-hidden"
              style={{ height: ITEM_HEIGHT }}
            >
              <div className="absolute top-0 left-0 right-0 h-5 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 h-5 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none" />

              <div
                style={{
                  transform: `translateY(-${offsets[reelIdx]}px)`,
                  transition: isSpinning
                    ? `transform ${REEL_DURATIONS[reelIdx]}s ${REEL_EASING}`
                    : 'none',
                }}
                onTransitionEnd={handleReelStop}
              >
                {reelItems.map((menu, i) => (
                  <div
                    key={`${reelIdx}-${i}`}
                    className="flex items-center justify-center font-bold text-sm text-foreground truncate px-2"
                    style={{ height: ITEM_HEIGHT }}
                  >
                    {menu.name}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={spin}
        disabled={isSpinning}
        className="w-full py-4 bg-gradient-to-r from-primary to-secondary rounded-full text-white font-bold text-lg shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed active:shadow-sm transition-shadow"
      >
        {isSpinning ? '돌리는 중...' : '🎰 당겨!'}
      </motion.button>
    </div>
  )
}

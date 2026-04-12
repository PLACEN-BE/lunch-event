'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useMenuStore } from '@/stores/menu-store'
import { MenuInput } from '@/components/menu/MenuInput'
import { RouletteGame } from '@/components/menu/RouletteGame'
import { Button } from '@/components/ui/Button'

export default function PickPage() {
  const { menus, result, setResult, reset } = useMenuStore()
  const [phase, setPhase] = useState<'setup' | 'playing' | 'result'>('setup')
  const [playCount, setPlayCount] = useState(0)

  const canStart = menus.length >= 2

  function handleStart() {
    if (!canStart) return
    setResult(null)
    setPhase('playing')
    setPlayCount((c) => c + 1)
  }

  function handleComplete(winner: string) {
    setResult(winner)
    setPhase('result')
  }

  function handleRetry() {
    setResult(null)
    setPhase('playing')
    setPlayCount((c) => c + 1)
  }

  function handleBackToSetup() {
    reset()
    setPhase('setup')
  }

  /* ── 설정 화면 ────────────────────────────────── */
  if (phase === 'setup') {
    return (
      <div className="px-4 pt-6 space-y-8">
        <div>
          <h1 className="text-2xl font-black">🍽️ 뭐 먹을까?</h1>
          <p className="text-foreground/40 text-sm mt-1">
            메뉴를 추가하고 운명의 룰렛을 돌려보세요
          </p>
        </div>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-foreground/60 uppercase tracking-wider">
            메뉴 목록
          </h2>
          <MenuInput />
        </section>

        <Button
          onClick={handleStart}
          disabled={!canStart}
          size="lg"
          className="w-full"
        >
          {canStart
            ? `🎡 ${menus.length}개 메뉴 중 뽑기!`
            : '2개 이상 메뉴를 추가해주세요'}
        </Button>
      </div>
    )
  }

  /* ── 게임 진행 화면 ───────────────────────────── */
  if (phase === 'playing') {
    return (
      <div className="px-4 pt-6">
        <h1 className="text-2xl font-black mb-6 text-center">🎡 룰렛</h1>
        <RouletteGame
          key={playCount}
          menus={menus}
          onComplete={handleComplete}
        />
      </div>
    )
  }

  /* ── 결과 화면 ────────────────────────────────── */
  return (
    <div className="px-4 pt-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6 pt-8"
      >
        <div className="text-6xl">🎉</div>

        <div>
          <p className="text-foreground/50 text-sm mb-3">오늘의 메뉴는</p>
          <motion.p
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="text-4xl font-black"
          >
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {result}
            </span>
          </motion.p>
        </div>

        <p className="text-foreground/30 text-sm">
          {menus.length}개 메뉴 중 선택됨
        </p>

        <div className="flex gap-3 justify-center pt-4">
          <Button onClick={handleRetry}>🔄 다시 돌리기</Button>
          <Button variant="ghost" onClick={handleBackToSetup}>
            📝 메뉴 바꾸기
          </Button>
        </div>
      </motion.div>
    </div>
  )
}

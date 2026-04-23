'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { RankingEntry } from '@/types'
import { Avatar } from '@/components/ui/Avatar'

interface HallOfFameProps {
  rankings: RankingEntry[]
}

// === 💸 MVP: 텅장 게이지 + 수배자 최종 심판 ===
function WalletMvpSection({ entry }: { entry: RankingEntry }) {
  const [phase, setPhase] = useState<'countdown' | 'reveal'>('countdown')
  const [count, setCount] = useState(3)
  const walletHp = Math.max(0, 100 - entry.treat_count * 15)

  useEffect(() => {
    if (phase !== 'countdown') return
    if (count <= 0) { setPhase('reveal'); return }
    const t = setTimeout(() => setCount(c => c - 1), 500)
    return () => clearTimeout(t)
  }, [count, phase])

  const [typedText, setTypedText] = useState('')
  const fullText = '지갑의 희생 위에 세워진 전설… 이 분이 진정한 GOAT 🐐'

  useEffect(() => {
    if (phase !== 'reveal') return
    let i = 0
    const iv = setInterval(() => {
      setTypedText(fullText.slice(0, i + 1))
      i++
      if (i >= fullText.length) clearInterval(iv)
    }, 50)
    return () => clearInterval(iv)
  }, [phase, fullText])

  const fireConfetti = useCallback(async () => {
    const confetti = (await import('canvas-confetti')).default
    const money = confetti.shapeFromText({ text: '💸', scalar: 2 })
    const boom = confetti.shapeFromText({ text: '💥', scalar: 2 })
    const bag = confetti.shapeFromText({ text: '💰', scalar: 2 })
    const bill = confetti.shapeFromText({ text: '💵', scalar: 2 })
    const coin = confetti.shapeFromText({ text: '🪙', scalar: 2 })
    const colors = ['#dc2626', '#f59e0b', '#fbbf24', '#fde047', '#b91c1c', '#ea580c']

    // 🔫 1단 — 초기 대폭발 (지갑 터지는 순간)
    confetti({
      particleCount: 80, spread: 140, startVelocity: 65, origin: { y: 0.45 },
      shapes: [money, boom, bag, bill, coin], colors, scalar: 1.8, ticks: 300,
    })

    // 🔫 2단 — 좌·우 하단에서 대각선 크로스 스매시 (180ms 후)
    setTimeout(() => {
      confetti({ particleCount: 100, angle: 60, spread: 80, startVelocity: 70,
        origin: { x: 0, y: 0.8 }, shapes: [money, bill, coin], colors, scalar: 1.3 })
      confetti({ particleCount: 100, angle: 120, spread: 80, startVelocity: 70,
        origin: { x: 1, y: 0.8 }, shapes: [money, bill, coin], colors, scalar: 1.3 })
    }, 180)

    // 🔫 3단 — 따발총 난사 (2.2초 동안 60ms 간격으로 무작위 지점 연속 발사)
    const barrageEnd = Date.now() + 2200
    const barrage = setInterval(() => {
      if (Date.now() > barrageEnd) { clearInterval(barrage); return }
      // 좌측 발사
      confetti({
        particleCount: 12, angle: 60 + Math.random() * 40, spread: 55,
        startVelocity: 55 + Math.random() * 20,
        origin: { x: Math.random() * 0.25, y: 0.6 + Math.random() * 0.2 },
        shapes: [money, bill, boom], colors, scalar: 1.2, ticks: 200,
      })
      // 우측 발사
      confetti({
        particleCount: 12, angle: 80 + Math.random() * 40, spread: 55,
        startVelocity: 55 + Math.random() * 20,
        origin: { x: 0.75 + Math.random() * 0.25, y: 0.6 + Math.random() * 0.2 },
        shapes: [money, bill, boom], colors, scalar: 1.2, ticks: 200,
      })
      // 중앙 난사
      confetti({
        particleCount: 8, spread: 360, startVelocity: 35,
        origin: { x: 0.5, y: 0.5 },
        shapes: [money, coin, bag], colors, scalar: 1.1, ticks: 180,
      })
    }, 60)

    // 🔫 4단 — 지폐 비처럼 떨어지는 여운 (2.4초, 난사와 동시 진행)
    const rainEnd = Date.now() + 2400
    ;(function rain() {
      confetti({
        particleCount: 6, angle: 60, spread: 70, startVelocity: 40,
        origin: { x: Math.random() * 0.35, y: 0.45 },
        shapes: [money, bill], colors, gravity: 1.4, scalar: 1.1,
      })
      confetti({
        particleCount: 6, angle: 120, spread: 70, startVelocity: 40,
        origin: { x: 0.65 + Math.random() * 0.35, y: 0.45 },
        shapes: [money, bill], colors, gravity: 1.4, scalar: 1.1,
      })
      if (Date.now() < rainEnd) requestAnimationFrame(rain)
    })()

    // 🔫 5단 — 피날레 폭발 (2.4초 후 한 번 더 크게)
    setTimeout(() => {
      confetti({
        particleCount: 150, spread: 360, startVelocity: 70,
        origin: { y: 0.5 },
        shapes: [money, boom, bag, bill, coin], colors, scalar: 1.7, ticks: 280,
      })
    }, 2400)
  }, [])

  useEffect(() => {
    if (phase === 'reveal') fireConfetti()
  }, [phase, fireConfetti])

  if (phase === 'countdown') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-20 space-y-3">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-red-500 text-sm font-bold tracking-widest">🚨 긴급 속보 🚨</motion.p>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="text-2xl font-black">이번 달 최고 한턱왕</motion.p>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="text-foreground/40">지갑 피해 규모 집계 중...</motion.p>
        <AnimatePresence mode="wait">
          <motion.div key={count} initial={{ scale: 3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.3, opacity: 0 }}
            className="text-6xl font-black text-red-500 mt-4">
            {count > 0 ? count : ''}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="bg-gradient-to-b from-red-50 to-amber-50 rounded-3xl p-6 shadow-lg text-center relative overflow-hidden border-2 border-red-200">
        {/* 사이렌 효과 */}
        <motion.div animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }}
          className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-blue-500/5 pointer-events-none" />

        <motion.p initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="text-red-500 font-black text-sm tracking-widest relative z-10">
          🚨 지갑 테러 최종 보고서 🚨
        </motion.p>

        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring' }}
          className="mt-4 relative z-10">
          <div className="w-28 h-28 mx-auto rounded-full border-4 border-red-400 overflow-hidden shadow-lg shadow-red-200 relative">
            <Avatar src={entry.avatar_url} nickname={entry.nickname} size={104} />
            <div className="absolute -top-2 left-1/2 -translate-x-1/2">
              <span className="text-3xl">👑</span>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}
          className="mt-3 relative z-10">
          <p className="text-2xl font-black">{entry.nickname}</p>
          <p className="text-xs text-foreground/40">@{entry.login_id}</p>
        </motion.div>

        {/* 텅장 게이지 */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          className="mt-4 bg-white/60 rounded-2xl p-4 relative z-10">
          <p className="text-xs font-bold text-foreground/50 mb-2">💸 지갑 잔존 체력</p>
          <div className="w-full h-4 bg-foreground/10 rounded-full overflow-hidden relative">
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: `${walletHp}%` }}
              transition={{ delay: 1, duration: 1.5, ease: 'easeOut' }}
              className={`h-full rounded-full ${
                walletHp > 50 ? 'bg-gradient-to-r from-emerald-400 to-emerald-300'
                  : walletHp > 20 ? 'bg-gradient-to-r from-yellow-400 to-orange-400'
                  : 'bg-gradient-to-r from-red-500 to-red-400'
              }`}
            />
            {walletHp <= 10 && (
              <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}
                className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-black text-red-600">⚠️ CRITICAL</span>
              </motion.div>
            )}
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-foreground/30">텅장</span>
            <span className={`text-[10px] font-bold ${walletHp <= 20 ? 'text-red-500' : 'text-foreground/40'}`}>{walletHp}%</span>
            <span className="text-[10px] text-foreground/30">만수르</span>
          </div>
        </motion.div>

        {/* 피해 규모 */}
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1.3, type: 'spring' }}
          className="mt-3 relative z-10">
          <p className="text-foreground/40 text-xs">총 피해 규모</p>
          <p className="text-4xl font-black text-red-500">{entry.treat_count}<span className="text-lg ml-1">회</span></p>
          <p className="text-xs text-foreground/30">(지갑 사망 {entry.treat_count}건, 생존자 0명)</p>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}
          className="mt-3 text-sm text-foreground/40 italic relative z-10 min-h-[2.5rem]">
          &quot;{typedText}&quot;
        </motion.p>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
        className="flex justify-center gap-3">
        <motion.button whileTap={{ scale: 0.9 }} onClick={fireConfetti}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-red-500 to-amber-500 text-white font-bold shadow-md shadow-red-200">
          💸 지갑 폭발 재현!
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

export function HallOfFame({ rankings }: HallOfFameProps) {
  if (rankings.length === 0) {
    return (
      <div className="text-center py-16 text-foreground/40">
        <div className="text-5xl mb-3">💸</div>
        <p className="font-bold">아직 기록이 없습니다</p>
        <p className="text-sm mt-1">게임을 플레이하면 명예의 전당에 등록돼요!</p>
      </div>
    )
  }

  return <WalletMvpSection entry={rankings[0]} />
}

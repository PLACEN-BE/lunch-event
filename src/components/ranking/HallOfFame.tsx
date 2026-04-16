'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { RankingEntry } from '@/types'
import { Avatar } from '@/components/ui/Avatar'

interface HallOfFameProps {
  rankings: RankingEntry[]
}

// === 🚨 Best: WANTED 수배 전단 스타일 ===
function WantedSection({ entry, rank2, rank3, maxCount }: { entry: RankingEntry; rank2?: RankingEntry; rank3?: RankingEntry; maxCount: number }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <span className="inline-block bg-red-500/15 text-red-600 px-3 py-1 rounded-full text-xs font-extrabold tracking-wider">
        🚨 WANTED — 지갑 테러범
      </span>

      <motion.div
        initial={{ rotate: -2, scale: 0.9 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 120 }}
        className="bg-amber-50 rounded-3xl p-6 shadow-lg text-center relative overflow-hidden border-4 border-amber-800/30"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(139,69,19,0.03) 20px, rgba(139,69,19,0.03) 21px)' }}
      >
        {/* 빈티지 테두리 */}
        <div className="absolute inset-2 border-2 border-amber-800/20 rounded-2xl pointer-events-none" />

        <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: 'spring' }}
          className="text-red-600 font-black text-2xl tracking-[0.3em] relative z-10">
          WANTED
        </motion.p>
        <p className="text-amber-800/60 text-xs font-bold mt-0.5 relative z-10">DEAD OR ALIVE (지갑은 이미 사망)</p>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
          className="my-4 relative z-10">
          <div className="w-28 h-28 mx-auto rounded-xl border-4 border-amber-800/30 overflow-hidden shadow-inner bg-white">
            <div className="w-full h-full flex items-center justify-center">
              <Avatar src={entry.avatar_url} nickname={entry.nickname} size={96} />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="relative z-10 space-y-1">
          <p className="text-xl font-black text-amber-900">{entry.nickname}</p>
          <p className="text-xs text-amber-800/50">@{entry.login_id}</p>
          <p className="text-xs text-red-600 font-bold mt-2">혐의: 무차별 한턱 테러</p>
        </motion.div>

        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.7, type: 'spring' }}
          className="mt-4 relative z-10">
          <p className="text-amber-800/50 text-xs font-bold">현 상 금</p>
          <p className="text-4xl font-black text-red-600">
            {entry.treat_count}<span className="text-lg ml-1">회</span>
          </p>
          <p className="text-xs text-amber-800/40 mt-1">한턱 왕중왕 — 체포 즉시 연행</p>
        </motion.div>

        {/* STAMP */}
        <motion.div
          initial={{ rotate: -30, scale: 0, opacity: 0 }}
          animate={{ rotate: -15, scale: 1, opacity: 0.7 }}
          transition={{ delay: 1, type: 'spring', stiffness: 200 }}
          className="absolute top-6 right-4 z-20"
        >
          <div className="border-4 border-red-600 rounded-lg px-3 py-1 rotate-[-15deg]">
            <p className="text-red-600 font-black text-sm tracking-wider">체포완료</p>
          </div>
        </motion.div>
      </motion.div>

      {/* 2위 3위: 공범 카드 */}
      <div className="grid grid-cols-2 gap-3">
        {rank2 && (
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.8 }}
            className="bg-amber-50/70 rounded-2xl p-4 shadow-sm text-center border border-amber-800/15">
            <p className="text-xs text-red-500 font-bold">🚔 공범 #2</p>
            <Avatar src={rank2.avatar_url} nickname={rank2.nickname} size={40} />
            <p className="mt-1 font-bold text-sm truncate">{rank2.nickname}</p>
            <p className="text-lg font-black text-red-500">{rank2.treat_count}<span className="text-xs ml-0.5 text-foreground/40">회</span></p>
            {/* 지갑 HP 바 */}
            <div className="mt-1.5">
              <div className="flex justify-between text-[9px] text-foreground/40">
                <span>💰 지갑 HP</span>
                <span>{Math.max(0, 100 - rank2.treat_count * 15)}%</span>
              </div>
              <div className="w-full h-2 bg-foreground/5 rounded-full mt-0.5 overflow-hidden">
                <motion.div initial={{ width: '100%' }} animate={{ width: `${Math.max(5, 100 - rank2.treat_count * 15)}%` }}
                  transition={{ delay: 1.2, duration: 0.8 }}
                  className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-red-400" />
              </div>
            </div>
          </motion.div>
        )}
        {rank3 && (
          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 1 }}
            className="bg-amber-50/70 rounded-2xl p-4 shadow-sm text-center border border-amber-800/15">
            <p className="text-xs text-red-500 font-bold">🚔 공범 #3</p>
            <Avatar src={rank3.avatar_url} nickname={rank3.nickname} size={40} />
            <p className="mt-1 font-bold text-sm truncate">{rank3.nickname}</p>
            <p className="text-lg font-black text-red-500">{rank3.treat_count}<span className="text-xs ml-0.5 text-foreground/40">회</span></p>
            <div className="mt-1.5">
              <div className="flex justify-between text-[9px] text-foreground/40">
                <span>💰 지갑 HP</span>
                <span>{Math.max(0, 100 - rank3.treat_count * 15)}%</span>
              </div>
              <div className="w-full h-2 bg-foreground/5 rounded-full mt-0.5 overflow-hidden">
                <motion.div initial={{ width: '100%' }} animate={{ width: `${Math.max(5, 100 - rank3.treat_count * 15)}%` }}
                  transition={{ delay: 1.4, duration: 0.8 }}
                  className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-red-400" />
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

// === 📈 Worst: 주식 차트 + 지갑 HP 만빵 ===
function StockSection({ entry, maxCount }: { entry: RankingEntry; maxCount: number }) {
  const [showRecovery, setShowRecovery] = useState(false)
  const walletHp = Math.max(5, 100 - entry.treat_count * 10)
  const changePercent = maxCount > 0 ? -Math.round(((maxCount - entry.treat_count) / maxCount) * 100) : 0

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <span className="inline-block bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-xs font-extrabold">
        📈 한턱 주식 리포트
      </span>

      <div className={`bg-card rounded-3xl p-6 shadow-lg relative overflow-hidden transition-colors duration-700 ${showRecovery ? 'bg-emerald-50' : ''}`}>
        {/* 주식 차트 배경 그리드 */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,1) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

        <div className="relative z-10 space-y-4">
          {/* 종목 헤더 */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-foreground/40">종목코드: HT-{entry.login_id?.toUpperCase().slice(0, 4)}</p>
              <p className="text-xl font-black">{entry.nickname} 주식회사</p>
            </div>
            <div className="text-right">
              <p className={`text-2xl font-black ${entry.treat_count === 0 ? 'text-blue-500' : 'text-red-500'}`}>
                {entry.treat_count}회
              </p>
              <p className="text-xs text-red-500 font-bold">▼ {changePercent}%</p>
            </div>
          </div>

          {/* 미니 차트 (하락 곡선) */}
          <div className="h-16 flex items-end gap-0.5">
            {[80, 65, 50, 40, 35, 25, 15, entry.treat_count > 0 ? 10 : 5].map((h, i) => (
              <motion.div key={i}
                initial={{ height: 0 }}
                animate={{ height: `${showRecovery && i === 7 ? 90 : h}%` }}
                transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
                className={`flex-1 rounded-t ${
                  showRecovery && i === 7
                    ? 'bg-gradient-to-t from-emerald-500 to-emerald-300'
                    : i <= 4 ? 'bg-gradient-to-t from-red-400 to-red-200' : 'bg-gradient-to-t from-red-500 to-red-300'
                }`} />
            ))}
          </div>

          {/* 지갑 HP 바 */}
          <div className="bg-foreground/5 rounded-2xl p-3">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-bold">💰 지갑 체력</span>
              <span className="text-xs font-black text-emerald-500">{walletHp}% — 건강함!</span>
            </div>
            <div className="w-full h-3 bg-foreground/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${walletHp}%` }}
                transition={{ delay: 0.8, duration: 1 }}
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-300"
              />
            </div>
            <p className="text-[10px] text-foreground/30 mt-1 text-right">
              {entry.treat_count === 0 ? '매수 타이밍… 실화냐 이왜진' : '아직 지갑에 여유가…'}
            </p>
          </div>

          {/* 리서치 노트 */}
          <div className="text-center">
            <Avatar src={entry.avatar_url} nickname={entry.nickname} size={56} />
            <p className="text-sm text-foreground/40 italic mt-2">
              &quot;{showRecovery ? '급등 시그널 포착! 스트롱 바이 📈🚀' : '상장폐지 위기… 손절 각?'}&quot;
            </p>
          </div>
        </div>
      </div>

      <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowRecovery(true)}
        className={`w-full py-3 rounded-2xl font-bold text-white shadow-md transition-all ${
          showRecovery ? 'bg-gradient-to-r from-emerald-500 to-primary' : 'bg-gradient-to-r from-blue-500 to-blue-400'
        }`}>
        {showRecovery ? '급등 완료! TO THE MOON 🚀🌙' : '응원 매수하기 📈'}
      </motion.button>
    </motion.div>
  )
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
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.4 }, colors: ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#f472b6'] })
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
          경례! 🫡
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

// === Main HallOfFame ===
export function HallOfFame({ rankings }: HallOfFameProps) {
  const [tab, setTab] = useState<'wanted' | 'stock' | 'mvp'>('wanted')

  if (rankings.length === 0) {
    return (
      <div className="text-center py-16 text-foreground/40">
        <div className="text-5xl mb-3">💸</div>
        <p className="font-bold">아직 기록이 없습니다</p>
        <p className="text-sm mt-1">게임을 플레이하면 명예의 전당에 등록돼요!</p>
      </div>
    )
  }

  const best = rankings[0]
  const worst = rankings[rankings.length - 1]
  const rank2 = rankings[1]
  const rank3 = rankings[2]

  const tabs = [
    { key: 'wanted' as const, label: '🚨 수배' },
    { key: 'stock' as const, label: '📈 주식' },
    { key: 'mvp' as const, label: '💸 MVP' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-foreground/5 p-1 rounded-full">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 py-2.5 rounded-full font-bold text-sm transition-colors ${
              tab === t.key ? 'bg-card text-foreground shadow-sm' : 'text-foreground/40 hover:text-foreground/60'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
          {tab === 'wanted' && <WantedSection entry={best} rank2={rank2} rank3={rank3} maxCount={best.treat_count} />}
          {tab === 'stock' && <StockSection entry={worst} maxCount={best.treat_count} />}
          {tab === 'mvp' && <WalletMvpSection entry={best} />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

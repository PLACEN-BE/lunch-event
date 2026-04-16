'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import type { MenuVoteEntry, MenuMvpEntry } from '@/types'
import { MENU_CATEGORIES } from '@/types'
import { Avatar } from '@/components/ui/Avatar'

const emojiMap: Map<string, string> = new Map(MENU_CATEGORIES.map(m => [m.name, m.emoji]))

const memes = {
  best: [
    '이번 주 압도적 1위! GOAT 등극 🐐',
    '알잘딱깔쎈 메뉴 선택의 정석 👑',
    '이 구역의 국민 메뉴… 이왜진 ㅋㅋ',
  ],
  worst: [
    '장항준적 사고 필요… 스트롱 스트롱 💪',
    '중꺽마… 꺾이지 않는 메뉴의 위엄 😭',
    '다음 주엔 반드시 역전이다! 🔥',
  ],
  mvp: [
    '매일 이 메뉴만 고르는 그 분… GOAT 인정 🐐🫡',
    '취향이 확고한 그 분… 홀리몰리 레전드 🫡',
    '메뉴 충성도 끝판왕, 장항준적 마인드셋 🫡',
  ],
}

function getMeme(category: keyof typeof memes, seed: number) {
  return memes[category][Math.abs(seed) % memes[category].length]
}

// === Best Section ===
function BestSection({ best, rankings }: { best: MenuVoteEntry; rankings: MenuVoteEntry[] }) {
  const emoji = emojiMap.get(best.menu_category) ?? '🍽️'
  const rank2 = rankings[1]
  const rank3 = rankings[2]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <span className="inline-block bg-gold/15 text-gold px-3 py-1 rounded-full text-xs font-extrabold">
        🏆 이번 주 BEST 메뉴
      </span>

      <div className="bg-card rounded-3xl p-6 shadow-lg text-center relative overflow-hidden">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
        <motion.div initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-4xl relative z-10">
          👑
        </motion.div>
        <motion.img src="/event/lucky.png" alt="럭키 1등" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3 }}
          className="w-48 h-48 object-cover rounded-2xl mx-auto my-3 relative z-10 shadow-md" />
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.4, type: 'spring' }} className="relative z-10">
          <p className="text-4xl mb-1">{emoji}</p>
          <p className="text-xl font-black">🥇 {best.menu_category}</p>
          <p className="mt-2 text-3xl font-black text-primary">{best.vote_count}<span className="text-sm ml-1 text-foreground/40">표</span></p>
        </motion.div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-3 text-sm text-foreground/40 italic relative z-10">
          &quot;{getMeme('best', best.vote_count)}&quot;
        </motion.p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {rank2 && (
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.6 }}
            className="bg-card rounded-2xl p-4 shadow-sm text-center border border-foreground/10">
            <div className="text-2xl">🥈</div>
            <p className="text-2xl">{emojiMap.get(rank2.menu_category) ?? '🍽️'}</p>
            <p className="mt-1 font-bold text-sm">{rank2.menu_category}</p>
            <p className="text-lg font-black text-primary">{rank2.vote_count}<span className="text-xs ml-0.5 text-foreground/40">표</span></p>
          </motion.div>
        )}
        {rank3 && (
          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.8 }}
            className="bg-card rounded-2xl p-4 shadow-sm text-center border border-foreground/10">
            <div className="text-2xl">🥉</div>
            <p className="text-2xl">{emojiMap.get(rank3.menu_category) ?? '🍽️'}</p>
            <p className="mt-1 font-bold text-sm">{rank3.menu_category}</p>
            <p className="text-lg font-black text-primary">{rank3.vote_count}<span className="text-xs ml-0.5 text-foreground/40">표</span></p>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

// === Worst Section ===
function WorstSection({ worst }: { worst: MenuVoteEntry }) {
  const [comforted, setComforted] = useState(false)
  const emoji = emojiMap.get(worst.menu_category) ?? '🍽️'

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <span className="inline-block bg-red-100 text-red-500 px-3 py-1 rounded-full text-xs font-extrabold">
        😢 이번 주 WORST 메뉴
      </span>

      <div className={`bg-card rounded-3xl p-6 shadow-lg text-center relative overflow-hidden transition-colors duration-700 ${comforted ? 'bg-emerald-50' : ''}`}>
        {!comforted && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="absolute w-0.5 bg-gradient-to-b from-transparent to-blue-300/30"
                style={{ left: `${Math.random() * 100}%`, top: '-20px', height: '16px',
                  animation: `fall ${0.8 + Math.random() * 0.8}s linear ${Math.random()}s infinite` }} />
            ))}
          </div>
        )}

        <motion.img src="/event/sad.gif" alt="슬픈 짤" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="w-48 h-48 object-cover rounded-2xl mx-auto my-3 relative z-10 shadow-md" />

        <p className="text-4xl relative z-10">{emoji}</p>
        <p className="text-lg font-black relative z-10">📉 {worst.menu_category}</p>
        <p className="mt-2 text-2xl font-black text-red-400 relative z-10">{worst.vote_count}<span className="text-sm ml-1 text-foreground/40">표</span></p>

        <p className="mt-2 text-sm text-foreground/40 italic relative z-10">
          &quot;{comforted ? '스트롱 스트롱💪 다음 주 GOAT 간다!' : getMeme('worst', worst.vote_count)}&quot;
        </p>

        {comforted && (
          <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} className="text-3xl mt-2 relative z-10">
            🌈✨💖
          </motion.div>
        )}
      </div>

      <motion.button whileTap={{ scale: 0.95 }} onClick={() => setComforted(true)}
        className={`w-full py-3 rounded-2xl font-bold text-white shadow-md transition-all ${
          comforted ? 'bg-gradient-to-r from-primary to-emerald-400' : 'bg-gradient-to-r from-red-400 to-blue-400'
        }`}>
        {comforted ? '간바레! 힘내!! 💪🥹' : '간바레! 힘내 💌'}
      </motion.button>
    </motion.div>
  )
}

// === MVP Section ===
function MvpSection({ mvp, bestMenu }: { mvp: MenuMvpEntry; bestMenu: string }) {
  const [phase, setPhase] = useState<'countdown' | 'reveal'>('countdown')
  const [count, setCount] = useState(3)

  useEffect(() => {
    if (phase !== 'countdown') return
    if (count <= 0) { setPhase('reveal'); return }
    const t = setTimeout(() => setCount(c => c - 1), 500)
    return () => clearTimeout(t)
  }, [count, phase])

  const [typedText, setTypedText] = useState('')
  const fullText = getMeme('mvp', mvp.pick_count)

  useEffect(() => {
    if (phase !== 'reveal') return
    let i = 0
    const iv = setInterval(() => {
      setTypedText(fullText.slice(0, i + 1))
      i++
      if (i >= fullText.length) clearInterval(iv)
    }, 60)
    return () => clearInterval(iv)
  }, [phase, fullText])

  const fireConfetti = useCallback(async () => {
    const confetti = (await import('canvas-confetti')).default
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 }, colors: ['#22c55e', '#3b82f6', '#fbbf24', '#f472b6'] })
  }, [])

  useEffect(() => {
    if (phase === 'reveal') fireConfetti()
  }, [phase, fireConfetti])

  const menuEmoji = emojiMap.get(mvp.menu_category) ?? '🍽️'

  if (phase === 'countdown') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-24 space-y-4">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-foreground/40 text-lg">이번 주의</motion.p>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="text-3xl font-black text-primary tracking-widest">M V P</motion.p>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="text-foreground/40 text-lg">발표합니다!</motion.p>
        <AnimatePresence mode="wait">
          <motion.div key={count} initial={{ scale: 2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}
            className="text-6xl font-black text-secondary mt-4">
            {count > 0 ? count : ''}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 text-center">
      <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
        className="text-lg font-bold text-primary">
        🎉 홀리몰리!! 이왜진!!
      </motion.p>

      <div className="flex justify-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring' }}
          className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-100 to-green-100 border-[3px] border-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Avatar src={mvp.avatar_url} nickname={mvp.nickname} size={80} />
          </div>
          <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-3xl">👑</span>
        </motion.div>
      </div>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
        <p className="text-sm text-primary font-bold">🎖️ 이번 주 MVP</p>
      </motion.div>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }}
        className="bg-card rounded-2xl p-5 shadow-lg border-2 border-emerald-100 mx-4">
        <p className="text-2xl font-black">{mvp.nickname} <span className="text-lg">님!!</span></p>
        <p className="text-xs text-foreground/40">@{mvp.login_id}</p>
        <p className="mt-3 text-xl font-black text-primary">
          {menuEmoji} {bestMenu} {mvp.pick_count}회 선택 <span className="text-sm text-foreground/40">(압도적)</span>
        </p>
      </motion.div>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
        className="text-sm text-foreground/40 italic px-6 min-h-[2rem]">
        &quot;{typedText}&quot;
      </motion.p>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
        className="flex justify-center gap-3 pt-2">
        <motion.button whileTap={{ scale: 0.9 }} onClick={fireConfetti}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-primary to-emerald-400 text-white font-bold shadow-md shadow-primary/20">
          GOAT 인정 🐐
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

// === Main MenuHallOfFame ===
interface MenuHallOfFameProps {
  rankings: MenuVoteEntry[]
  mvp: MenuMvpEntry | null
}

export function MenuHallOfFame({ rankings, mvp }: MenuHallOfFameProps) {
  const [tab, setTab] = useState<'best' | 'worst' | 'mvp'>('best')

  if (rankings.length === 0) {
    return (
      <div className="text-center py-16 text-foreground/40">
        <div className="text-5xl mb-3">🍽️</div>
        <p className="font-bold">아직 이번 주 투표가 없습니다</p>
        <p className="text-sm mt-1">먼저 오늘의 메뉴를 투표해보세요!</p>
        <Link href="/vote" className="inline-block mt-4 px-5 py-2.5 rounded-2xl bg-primary text-white font-bold shadow-md">
          투표하러 가기 🗳️
        </Link>
      </div>
    )
  }

  const best = rankings[0]
  const worst = rankings[rankings.length - 1]

  const tabs = [
    { key: 'best' as const, label: '🏆 Best' },
    { key: 'worst' as const, label: '😢 Worst' },
    { key: 'mvp' as const, label: '🎖️ MVP' },
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
          {tab === 'best' && <BestSection best={best} rankings={rankings} />}
          {tab === 'worst' && <WorstSection worst={worst} />}
          {tab === 'mvp' && mvp && <MvpSection mvp={mvp} bestMenu={best.menu_category} />}
          {tab === 'mvp' && !mvp && (
            <div className="text-center py-16 text-foreground/40">
              <p className="text-5xl mb-3">🎖️</p>
              <p className="font-bold">MVP 데이터가 아직 없습니다</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

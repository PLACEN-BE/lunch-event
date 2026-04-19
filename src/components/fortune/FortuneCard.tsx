'use client'

import { useState, useCallback, useTransition } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { drawFortuneAction, type FortuneDrawRecord, type FortuneState } from '@/lib/actions/fortune'
import { playWin } from '@/lib/sounds'

const MAX_DRAWS = 3

interface FortuneCardProps {
  initialState: FortuneState
}

export function FortuneCard({ initialState }: FortuneCardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const lastDraw = initialState.draws[initialState.draws.length - 1] ?? null

  const [fortune, setFortune] = useState<FortuneDrawRecord | null>(lastDraw)
  const [remainingDraws, setRemainingDraws] = useState<number>(initialState.remainingDraws)
  const [isRevealed, setIsRevealed] = useState<boolean>(Boolean(lastDraw))
  const [isAnimating, setIsAnimating] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const isAuthenticated = initialState.isAuthenticated
  const hasRemaining = remainingDraws > 0
  const usedDraws = MAX_DRAWS - remainingDraws

  const performDraw = useCallback(() => {
    if (isAnimating || isPending) return
    if (!isAuthenticated) return
    if (!hasRemaining) return

    setIsAnimating(true)
    setErrorMessage(null)
    setIsRevealed(false)

    startTransition(async () => {
      const result = await drawFortuneAction()

      if (!result.ok) {
        setIsAnimating(false)
        setErrorMessage(result.message)
        if (result.reason === 'LIMIT_EXCEEDED') {
          setRemainingDraws(0)
          router.refresh()
        }
        return
      }

      setFortune(result.record)
      setRemainingDraws(result.remainingDraws)
      setIsRevealed(true)

      setTimeout(() => {
        playWin()
        confetti({
          particleCount: 60,
          spread: 50,
          origin: { y: 0.4 },
          colors: ['#22c55e', '#3b82f6', '#fbbf24', '#8b5cf6'],
        })
        setIsAnimating(false)
        router.refresh()
      }, 800)
    })
  }, [isAnimating, isPending, isAuthenticated, hasRemaining, router])

  const handleRetry = useCallback(() => {
    if (!hasRemaining) return
    setIsRevealed(false)
    setFortune(null)
    setErrorMessage(null)
  }, [hasRemaining])

  return (
    <div className="flex flex-col items-center gap-4">
      {/* 남은 횟수 뱃지 */}
      {isAuthenticated && (
        <div className="flex items-center gap-1.5 text-xs font-bold text-purple-500 bg-purple-50 px-3 py-1 rounded-full">
          <span>🔮</span>
          <span>
            오늘 <span className="text-purple-600">{usedDraws}</span>
            <span className="text-purple-300"> / {MAX_DRAWS}</span>
          </span>
        </div>
      )}

      {/* 카드 */}
      <div
        className="w-full max-w-[320px] cursor-pointer"
        style={{ perspective: 800 }}
        onClick={!isRevealed && hasRemaining && isAuthenticated ? performDraw : undefined}
      >
        <motion.div
          className="relative w-full aspect-[3/4]"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ rotateY: isRevealed ? 180 : 0 }}
          transition={{ duration: 0.8, type: 'spring', stiffness: 80, damping: 15 }}
        >
          {/* 앞면 — 미공개 */}
          <div
            className={`absolute inset-0 rounded-3xl flex flex-col items-center justify-center border-2 border-white/20 shadow-xl p-6 ${
              hasRemaining
                ? 'bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600'
                : 'bg-gradient-to-br from-slate-400 via-slate-500 to-slate-600'
            }`}
            style={{ backfaceVisibility: 'hidden' }}
          >
            {hasRemaining ? (
              <>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="text-6xl mb-6"
                >
                  🔮
                </motion.div>
                <p className="text-white font-black text-xl mb-2">오늘의 메뉴 운명</p>
                <p className="text-white/60 text-sm text-center">
                  {isAuthenticated ? '탭하여 운명을 확인하세요' : '로그인하고 운세를 뽑아보세요'}
                </p>
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
              </>
            ) : (
              <>
                <div className="text-5xl mb-4 opacity-60">🌙</div>
                <p className="text-white font-black text-lg mb-1">오늘의 운명은 결정됐어요</p>
                <p className="text-white/60 text-sm text-center">내일 다시 뽑아보세요</p>
              </>
            )}
          </div>

          {/* 뒷면 — 운세 결과 */}
          <div
            className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white to-purple-50 border-2 border-purple-100 shadow-xl p-6 flex flex-col items-center justify-center"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
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

      {/* 에러 메세지 */}
      {errorMessage && (
        <p className="text-xs text-rose-500 font-medium">{errorMessage}</p>
      )}

      {/* CTA */}
      {!isAuthenticated ? (
        <Link
          href="/login"
          className="px-8 py-3 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full text-white font-bold shadow-lg shadow-purple-500/25"
        >
          🔮 로그인하고 운세 뽑기 →
        </Link>
      ) : isRevealed && !isAnimating && hasRemaining ? (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRetry}
          disabled={isPending}
          className="px-8 py-3 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full text-white font-bold shadow-lg shadow-purple-500/25 active:shadow-sm transition-shadow disabled:opacity-50"
        >
          🔮 다시 뽑기 ({remainingDraws}회 남음)
        </motion.button>
      ) : !isRevealed && hasRemaining ? (
        <p className="text-foreground/30 text-xs animate-pulse">
          카드를 탭하세요
        </p>
      ) : null}
    </div>
  )
}

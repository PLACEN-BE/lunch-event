'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { generateBridges, traceLadderPath } from '@/lib/game-engine'
import type { Bridge, Point } from '@/lib/game-engine'

interface LadderGameProps {
  participants: string[]
  pickCount: number
  onComplete: (winners: string[]) => void
}

const ROWS = 8
const TOTAL_DURATION = 6000
const MARKER_RADIUS = 7
const TRAIL_WIDTH = 3

const MARKER_COLORS = [
  '#ef4444', '#3b82f6', '#22c55e', '#f59e0b',
  '#8b5cf6', '#ec4899', '#06b6d4', '#f97316',
]

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

export function LadderGame({ participants, pickCount, onComplete }: LadderGameProps) {
  const count = participants.length
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const startTimeRef = useRef<number>(0)

  const [phase, setPhase] = useState<'ready' | 'running' | 'done'>('ready')

  // 사다리 구조 + 경로 계산 (마운트 시 1회)
  const [{ bridges, paths, winners, winnerSlots }] = useState(() => {
    let b: Bridge[]
    let p: Point[][]
    let w: string[]
    let ws: Set<number>

    // 당첨자 수가 pickCount와 일치하도록 bridge 재생성 (최대 100회)
    let attempts = 0
    do {
      b = generateBridges(count, ROWS)
      p = participants.map((_, i) => traceLadderPath(i, b, ROWS))
      ws = new Set<number>()
      for (let i = 0; i < pickCount; i++) ws.add(i)
      w = []
      p.forEach((path, i) => {
        const destCol = path[path.length - 1].x
        if (ws.has(destCol)) w.push(participants[i])
      })
      attempts++
    } while (w.length !== pickCount && attempts < 100)

    return { bridges: b, paths: p, winners: w, winnerSlots: ws }
  })

  // Canvas 레이아웃 상수
  const COL_WIDTH = Math.min(80, 320 / count)
  const ROW_HEIGHT = 40
  const PADDING_X = 30
  const PADDING_TOP = 20
  const WIDTH = COL_WIDTH * (count - 1) + PADDING_X * 2
  const HEIGHT = ROW_HEIGHT * (ROWS + 1) + PADDING_TOP + 40

  // 논리 좌표 → 캔버스 픽셀 변환
  const toPixel = useCallback((pt: Point) => ({
    px: PADDING_X + pt.x * COL_WIDTH,
    py: PADDING_TOP + (pt.y + 1) * ROW_HEIGHT,
  }), [COL_WIDTH, PADDING_X, PADDING_TOP, ROW_HEIGHT])

  // 정적 사다리 그리기
  const drawLadder = useCallback((ctx: CanvasRenderingContext2D) => {
    // 세로줄
    for (let i = 0; i < count; i++) {
      const x = PADDING_X + i * COL_WIDTH
      ctx.strokeStyle = 'rgba(26,58,42,0.18)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(x, PADDING_TOP)
      ctx.lineTo(x, PADDING_TOP + (ROWS + 1) * ROW_HEIGHT)
      ctx.stroke()
    }
    // 가로줄 (bridge)
    bridges.forEach(({ col, row }) => {
      const x1 = PADDING_X + col * COL_WIDTH
      const x2 = x1 + COL_WIDTH
      const y = PADDING_TOP + (row + 1) * ROW_HEIGHT
      ctx.strokeStyle = 'rgba(26,58,42,0.22)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(x1, y)
      ctx.lineTo(x2, y)
      ctx.stroke()
    })
  }, [bridges, count, COL_WIDTH, PADDING_X, PADDING_TOP, ROW_HEIGHT, ROWS])

  // 초기 정적 렌더링
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = WIDTH * dpr
    canvas.height = HEIGHT * dpr
    ctx.scale(dpr, dpr)
    canvas.style.width = `${WIDTH}px`
    canvas.style.height = `${HEIGHT}px`

    ctx.clearRect(0, 0, WIDTH, HEIGHT)
    drawLadder(ctx)

    // 시작 마커 그리기
    participants.forEach((_, i) => {
      const { px, py } = toPixel({ x: i, y: -1 })
      ctx.fillStyle = MARKER_COLORS[i % MARKER_COLORS.length]
      ctx.beginPath()
      ctx.arc(px, py, MARKER_RADIUS, 0, Math.PI * 2)
      ctx.fill()
    })
  }, [WIDTH, HEIGHT, drawLadder, participants, toPixel])

  // 애니메이션 프레임 렌더
  const renderFrame = useCallback((progress: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, WIDTH, HEIGHT)
    drawLadder(ctx)

    // 각 참가자의 trail + 마커
    paths.forEach((path, i) => {
      const color = MARKER_COLORS[i % MARKER_COLORS.length]
      const totalSegments = path.length - 1
      const currentSegment = progress * totalSegments
      const segIdx = Math.min(Math.floor(currentSegment), totalSegments - 1)
      const segProgress = currentSegment - segIdx

      // Trail (지나간 경로)
      ctx.strokeStyle = color
      ctx.lineWidth = TRAIL_WIDTH
      ctx.globalAlpha = 0.6
      ctx.beginPath()
      const start = toPixel(path[0])
      ctx.moveTo(start.px, start.py)
      for (let s = 0; s <= segIdx; s++) {
        const pt = toPixel(path[s + 1])
        ctx.lineTo(pt.px, pt.py)
      }
      // 현재 세그먼트 진행 중 부분
      if (segIdx < totalSegments) {
        const from = toPixel(path[segIdx])
        const to = toPixel(path[segIdx + 1])
        ctx.lineTo(
          lerp(from.px, to.px, segProgress),
          lerp(from.py, to.py, segProgress),
        )
      }
      ctx.stroke()
      ctx.globalAlpha = 1

      // 마커 (현재 위치)
      let mx: number, my: number
      if (segIdx < totalSegments) {
        const from = toPixel(path[segIdx])
        const to = toPixel(path[segIdx + 1])
        mx = lerp(from.px, to.px, segProgress)
        my = lerp(from.py, to.py, segProgress)
      } else {
        const end = toPixel(path[path.length - 1])
        mx = end.px
        my = end.py
      }

      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(mx, my, MARKER_RADIUS, 0, Math.PI * 2)
      ctx.fill()

      // 마커 테두리 (가시성)
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(mx, my, MARKER_RADIUS, 0, Math.PI * 2)
      ctx.stroke()
    })
  }, [paths, WIDTH, HEIGHT, drawLadder, toPixel])

  // GO! 클릭 → 애니메이션 시작
  function startRun() {
    setPhase('running')
    startTimeRef.current = performance.now()

    function animate(now: number) {
      const elapsed = now - startTimeRef.current
      const progress = Math.min(elapsed / TOTAL_DURATION, 1)
      renderFrame(progress)

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        // 완료 → 500ms 후 결과 연출
        setTimeout(() => {
          setPhase('done')
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#22c55e', '#3b82f6', '#fbbf24', '#60a5fa'],
          })
          setTimeout(() => onComplete(winners), 800)
        }, 500)
      }
    }

    rafRef.current = requestAnimationFrame(animate)
  }

  // cleanup
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <div className="space-y-4">
      {/* 참가자 이름 */}
      <div className="flex justify-center">
        <div className="flex" style={{ width: WIDTH }}>
          {participants.map((name, i) => (
            <div
              key={name}
              className="text-center text-xs font-bold truncate"
              style={{ width: COL_WIDTH, paddingLeft: i === 0 ? PADDING_X : 0 }}
            >
              <span style={{ color: MARKER_COLORS[i % MARKER_COLORS.length] }}>
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div className="flex justify-center">
        <canvas ref={canvasRef} className="rounded-2xl" />
      </div>

      {/* 도착 slot */}
      <div className="flex justify-center">
        <div className="flex" style={{ width: WIDTH }}>
          {Array.from({ length: count }).map((_, i) => (
            <div
              key={i}
              className="text-center"
              style={{ width: COL_WIDTH, paddingLeft: i === 0 ? PADDING_X : 0 }}
            >
              <motion.div
                animate={{
                  scale: phase === 'done' && winnerSlots.has(i) ? 1.3 : 1,
                  opacity: phase === 'done' ? 1 : 0.4,
                }}
                transition={{ type: 'spring', stiffness: 300 }}
                className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                  winnerSlots.has(i)
                    ? 'bg-primary text-white'
                    : 'bg-foreground/5 text-foreground/40'
                }`}
              >
                {winnerSlots.has(i) ? '💰' : '✓'}
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      {/* 결과 표시 */}
      {phase === 'done' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <p className="text-foreground/50 text-sm">당첨자</p>
          <div className="flex justify-center gap-2 flex-wrap">
            {winners.map((w) => (
              <span key={w} className="px-4 py-2 bg-primary/10 border border-primary/30 rounded-full text-primary font-bold">
                💰 {w}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* GO! 버튼 */}
      {phase === 'ready' && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={startRun}
          className="w-full py-4 bg-gradient-to-r from-primary to-secondary rounded-full text-white font-bold text-lg shadow-lg shadow-primary/30 active:scale-95 transition-transform"
        >
          🎲 GO!
        </motion.button>
      )}
    </div>
  )
}

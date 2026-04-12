'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { scheduleRouletteTicks, playWin } from '@/lib/sounds'
import type { MenuItem } from '@/types'

interface RouletteGameProps {
  menus: MenuItem[]
  onComplete: (winner: string) => void
}

const SECTION_COLORS = [
  '#ef4444', '#3b82f6', '#22c55e', '#f59e0b',
  '#8b5cf6', '#ec4899', '#06b6d4', '#f97316',
  '#14b8a6', '#f43f5e', '#a855f7', '#d946ef',
]

const SIZE = 280
const CENTER = SIZE / 2
const RADIUS = SIZE / 2 - 8
const SPIN_DURATION_S = 9
const SPIN_DURATION_MS = SPIN_DURATION_S * 1000

export function RouletteGame({ menus, onComplete }: RouletteGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const winnerRef = useRef('')
  const tickCleanupRef = useRef<(() => void) | null>(null)
  const [rotation, setRotation] = useState(0)
  const [isSpinning, setIsSpinning] = useState(false)

  const totalWeight = menus.reduce((sum, m) => sum + m.weight, 0)

  /* ── Canvas 그리기 ─────────────────────────────── */
  const drawWheel = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = SIZE * dpr
    canvas.height = SIZE * dpr
    ctx.scale(dpr, dpr)
    canvas.style.width = `${SIZE}px`
    canvas.style.height = `${SIZE}px`

    ctx.clearRect(0, 0, SIZE, SIZE)

    let currentAngle = -Math.PI / 2

    menus.forEach((menu, i) => {
      const sliceAngle = (menu.weight / totalWeight) * Math.PI * 2

      ctx.beginPath()
      ctx.moveTo(CENTER, CENTER)
      ctx.arc(CENTER, CENTER, RADIUS, currentAngle, currentAngle + sliceAngle)
      ctx.closePath()
      ctx.fillStyle = SECTION_COLORS[i % SECTION_COLORS.length]
      ctx.fill()

      ctx.strokeStyle = 'rgba(255,255,255,0.55)'
      ctx.lineWidth = 2
      ctx.stroke()

      // 텍스트
      ctx.save()
      ctx.translate(CENTER, CENTER)
      ctx.rotate(currentAngle + sliceAngle / 2)
      ctx.textBaseline = 'middle'

      const maxWidth = RADIUS * 0.42
      const fontSize = Math.min(14, Math.max(9, sliceAngle * RADIUS * 0.12))
      ctx.font = `bold ${fontSize}px 'Pretendard Variable', -apple-system, sans-serif`
      ctx.fillStyle = '#fff'
      ctx.shadowColor = 'rgba(0,0,0,0.35)'
      ctx.shadowBlur = 2

      let text = menu.name
      while (ctx.measureText(text).width > maxWidth && text.length > 1) {
        text = text.slice(0, -1)
      }
      if (text !== menu.name) text += '..'

      ctx.textAlign = 'center'
      ctx.fillText(text, RADIUS * 0.55, 0)
      ctx.restore()

      currentAngle += sliceAngle
    })

    // 바깥 링
    ctx.beginPath()
    ctx.arc(CENTER, CENTER, RADIUS + 1, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'
    ctx.lineWidth = 3
    ctx.stroke()

    // 중앙 원
    ctx.save()
    ctx.shadowColor = 'rgba(0,0,0,0.12)'
    ctx.shadowBlur = 10
    ctx.beginPath()
    ctx.arc(CENTER, CENTER, 22, 0, Math.PI * 2)
    ctx.fillStyle = '#fff'
    ctx.fill()
    ctx.restore()

    const g = ctx.createRadialGradient(CENTER - 2, CENTER - 2, 1, CENTER, CENTER, 10)
    g.addColorStop(0, '#34d399')
    g.addColorStop(1, '#16a34a')
    ctx.beginPath()
    ctx.arc(CENTER, CENTER, 10, 0, Math.PI * 2)
    ctx.fillStyle = g
    ctx.fill()
  }, [menus, totalWeight])

  useEffect(() => {
    drawWheel()
  }, [drawWheel])

  // 사운드 cleanup
  useEffect(() => {
    return () => { tickCleanupRef.current?.() }
  }, [])

  /* ── 스핀 ──────────────────────────────────────── */
  function spin() {
    if (isSpinning) return
    setIsSpinning(true)

    // 틱 사운드 스케줄링
    tickCleanupRef.current = scheduleRouletteTicks(SPIN_DURATION_MS)

    // 가중치 기반 랜덤 선택
    let r = Math.random() * totalWeight
    let winner = menus[0]
    for (const m of menus) {
      r -= m.weight
      if (r <= 0) { winner = m; break }
    }
    winnerRef.current = winner.name

    let winnerCenter = 0
    for (const m of menus) {
      const sliceDeg = (m.weight / totalWeight) * 360
      if (m.id === winner.id) {
        winnerCenter += sliceDeg / 2
        break
      }
      winnerCenter += sliceDeg
    }

    const sectionDeg = (winner.weight / totalWeight) * 360
    const jitter = (Math.random() - 0.5) * sectionDeg * 0.55

    // 12~14바퀴 + 착지 각도 (9초 동안)
    const spins = 12 + Math.floor(Math.random() * 3)
    const target = rotation + spins * 360 + (360 - winnerCenter) + jitter

    setRotation(target)
  }

  function handleTransitionEnd(e: React.TransitionEvent) {
    if (e.propertyName !== 'transform') return
    tickCleanupRef.current?.()
    setIsSpinning(false)
    playWin()
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.5 },
      colors: ['#22c55e', '#3b82f6', '#fbbf24', '#ec4899'],
    })
    onComplete(winnerRef.current)
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* 포인터 */}
      <div className="relative">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 drop-shadow-md">
          <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[18px] border-l-transparent border-r-transparent border-t-primary" />
        </div>

        <div
          className="rounded-full shadow-xl"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: isSpinning
              ? `transform ${SPIN_DURATION_S}s cubic-bezier(0.12, 0.72, 0.08, 1.00)`
              : 'none',
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          <canvas ref={canvasRef} />
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={spin}
        disabled={isSpinning}
        className="w-full py-4 bg-gradient-to-r from-primary to-secondary rounded-full text-white font-bold text-lg shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed active:shadow-sm transition-shadow"
      >
        {isSpinning ? '돌리는 중...' : '🎡 돌려!'}
      </motion.button>
    </div>
  )
}

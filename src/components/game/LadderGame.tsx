'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { generateLadderPaths } from '@/lib/game-engine'

interface LadderGameProps {
  participants: string[]
  winners: string[]
  pickCount: number
  onComplete: () => void
}

interface Bridge {
  col: number
  row: number
}

export function LadderGame({ participants, winners, pickCount, onComplete }: LadderGameProps) {
  const count = participants.length
  const [paths] = useState(() => generateLadderPaths(count))
  const [running, setRunning] = useState(false)
  const [activeCol, setActiveCol] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [bridges] = useState<Bridge[]>(() => {
    const result: Bridge[] = []
    const rows = 8
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < count - 1; col++) {
        if (Math.random() > 0.45) {
          result.push({ col, row })
        }
      }
    }
    return result
  })
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const ROWS = 8
  const COL_WIDTH = Math.min(80, 320 / count)
  const ROW_HEIGHT = 40
  const PADDING = 30
  const WIDTH = COL_WIDTH * (count - 1) + PADDING * 2
  const HEIGHT = ROW_HEIGHT * (ROWS + 1) + 100

  const winnerSlots = new Set<number>()
  for (let i = 0; i < pickCount; i++) {
    winnerSlots.add(i)
  }

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

    for (let i = 0; i < count; i++) {
      const x = PADDING + i * COL_WIDTH
      ctx.strokeStyle = 'rgba(26,58,42,0.12)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(x, 50)
      ctx.lineTo(x, 50 + ROW_HEIGHT * ROWS)
      ctx.stroke()
    }

    bridges.forEach(({ col, row }) => {
      const x1 = PADDING + col * COL_WIDTH
      const x2 = x1 + COL_WIDTH
      const y = 50 + (row + 0.5) * ROW_HEIGHT
      ctx.strokeStyle = 'rgba(26,58,42,0.15)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(x1, y)
      ctx.lineTo(x2, y)
      ctx.stroke()
    })
  }, [bridges, count, WIDTH, HEIGHT, COL_WIDTH, ROW_HEIGHT, ROWS, PADDING])

  function revealAll() {
    setRevealed(true)
    setTimeout(onComplete, 600)
  }

  function startRun() {
    setRunning(true)
    setActiveCol(0)

    let col = 0
    let step = 0
    const interval = setInterval(() => {
      step++
      if (step > count) {
        clearInterval(interval)
        setRunning(false)
        revealAll()
        return
      }
      setActiveCol(step < count ? step : null)
    }, 400)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <div className="flex" style={{ width: WIDTH }}>
          {participants.map((name, i) => (
            <div
              key={name}
              className="text-center text-xs font-bold truncate"
              style={{ width: COL_WIDTH, paddingLeft: i === 0 ? PADDING : 0 }}
            >
              <motion.div
                animate={{
                  scale: activeCol === i ? 1.2 : 1,
                  color: activeCol === i ? '#22c55e' : '#1a3a2a60',
                }}
              >
                {name}
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        <canvas ref={canvasRef} className="rounded-2xl" />
      </div>

      <div className="flex justify-center">
        <div className="flex" style={{ width: WIDTH }}>
          {Array.from({ length: count }).map((_, i) => (
            <div
              key={i}
              className="text-center"
              style={{ width: COL_WIDTH, paddingLeft: i === 0 ? PADDING : 0 }}
            >
              <motion.div
                animate={{
                  scale: revealed ? 1.1 : 1,
                  opacity: revealed ? 1 : 0.4,
                }}
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

      {revealed && (
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

      {!running && !revealed && (
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

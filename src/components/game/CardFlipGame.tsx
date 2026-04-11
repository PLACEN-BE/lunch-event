'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface CardFlipGameProps {
  participants: string[]
  winners: string[]
  onComplete: () => void
}

export function CardFlipGame({ participants, winners, onComplete }: CardFlipGameProps) {
  const [flipped, setFlipped] = useState<Set<number>>(new Set())
  const allFlipped = flipped.size === participants.length

  function flipCard(index: number) {
    if (flipped.has(index)) return
    setFlipped((prev) => new Set(prev).add(index))
  }

  function flipAll() {
    setFlipped(new Set(participants.map((_, i) => i)))
    setTimeout(onComplete, 800)
  }

  const isWinner = (name: string) => winners.includes(name)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {participants.map((name, i) => (
          <motion.div
            key={name}
            className="perspective-[800px] cursor-pointer"
            onClick={() => flipCard(i)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <motion.div
              className="relative w-full aspect-[3/4] preserve-3d"
              animate={{ rotateY: flipped.has(i) ? 180 : 0 }}
              transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
            >
              {/* Back (face down) */}
              <div className="absolute inset-0 backface-hidden rounded-3xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center border-2 border-white/20 shadow-md">
                <span className="text-4xl">❓</span>
              </div>
              {/* Front (face up) */}
              <div
                className={`absolute inset-0 backface-hidden rounded-3xl flex flex-col items-center justify-center border-2 rotate-y-180 shadow-md ${
                  isWinner(name)
                    ? 'bg-gradient-to-br from-primary to-secondary border-primary/30'
                    : 'bg-white border-foreground/10'
                }`}
              >
                <span className="text-3xl mb-2">{isWinner(name) ? '💰' : '✨'}</span>
                <span className={`font-bold text-lg ${isWinner(name) ? 'text-white' : 'text-foreground/60'}`}>
                  {name}
                </span>
                {isWinner(name) && (
                  <span className="text-xs mt-1 text-white/80">당첨!</span>
                )}
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {!allFlipped && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={flipAll}
          className="w-full py-3 bg-foreground/5 rounded-full text-foreground/60 hover:bg-foreground/10 transition-colors font-medium"
        >
          전체 공개
        </motion.button>
      )}
    </div>
  )
}

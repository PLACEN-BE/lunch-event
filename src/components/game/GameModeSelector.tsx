'use client'

import { motion } from 'framer-motion'
import { useGameStore } from '@/stores/game-store'
import type { GameMode } from '@/types'

const modes: { value: GameMode; label: string; icon: string; desc: string }[] = [
  { value: 'card_flip', label: '카드 플립', icon: '🃏', desc: '카드를 뒤집어 당첨자 확인' },
  { value: 'ladder', label: '사다리타기', icon: '🪜', desc: '사다리를 타고 결과 확인' },
]

export function GameModeSelector() {
  const { gameMode, setGameMode } = useGameStore()

  return (
    <div className="grid grid-cols-2 gap-3">
      {modes.map(({ value, label, icon, desc }) => (
        <motion.button
          key={value}
          whileTap={{ scale: 0.97 }}
          onClick={() => setGameMode(value)}
          className={`relative p-4 rounded-3xl border-2 transition-all text-left ${
            gameMode === value
              ? 'border-primary bg-primary/10'
              : 'border-foreground/10 bg-white hover:border-foreground/20'
          }`}
        >
          <div className="text-3xl mb-2">{icon}</div>
          <div className="font-bold text-sm">{label}</div>
          <div className="text-xs text-foreground/40 mt-0.5">{desc}</div>
          {gameMode === value && (
            <motion.div
              layoutId="mode-indicator"
              className="absolute top-2 right-2 w-3 h-3 bg-primary rounded-full"
            />
          )}
        </motion.button>
      ))}
    </div>
  )
}

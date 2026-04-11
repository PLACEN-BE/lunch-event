'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/stores/game-store'
import { Input } from '@/components/ui/Input'

export function ParticipantInput() {
  const [name, setName] = useState('')
  const isComposing = useRef(false)
  const { participants, setParticipants } = useGameStore()

  function addParticipant() {
    const trimmed = name.trim()
    if (!trimmed || participants.includes(trimmed)) return
    setParticipants([...participants, trimmed])
    setName('')
  }

  function removeParticipant(target: string) {
    setParticipants(participants.filter((p) => p !== target))
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onCompositionStart={() => (isComposing.current = true)}
          onCompositionEnd={() => (isComposing.current = false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !isComposing.current) {
              e.preventDefault()
              addParticipant()
            }
          }}
          placeholder="이름 입력"
          maxLength={10}
        />
        <button
          type="button"
          onClick={addParticipant}
          className="shrink-0 w-12 h-12 bg-primary rounded-2xl text-white text-2xl font-bold hover:bg-primary-hover transition-colors active:scale-95"
        >
          +
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <AnimatePresence>
          {participants.map((p) => (
            <motion.span
              key={p}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium"
            >
              {p}
              <button
                onClick={() => removeParticipant(p)}
                className="text-primary/40 hover:text-red-500 transition-colors"
              >
                ✕
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      {participants.length > 0 && (
        <p className="text-foreground/40 text-sm">{participants.length}명 참여</p>
      )}
    </div>
  )
}

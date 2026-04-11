'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/stores/game-store'
import { pickWinners } from '@/lib/game-engine'
import { saveGameResult } from '@/lib/actions/game'
import { LadderGame } from '@/components/game/LadderGame'
import { GameResult } from '@/components/game/GameResult'

export default function LadderPage() {
  const router = useRouter()
  const { participants, pickCount, winners, setWinners, isRevealed, setIsRevealed, reset } = useGameStore()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (participants.length < 2) {
      router.replace('/game')
      return
    }
    if (winners.length === 0) {
      setWinners(pickWinners(participants, pickCount))
    }
  }, [participants, pickCount, winners, setWinners, router])

  function handleComplete() {
    setIsRevealed(true)
  }

  async function handleSave() {
    setSaving(true)
    await saveGameResult('ladder', participants, winners)
    setSaving(false)
    setSaved(true)
  }

  function handleReset() {
    reset()
    router.push('/game')
  }

  if (participants.length < 2) return null

  return (
    <div className="px-4 pt-6 space-y-6">
      <h1 className="text-2xl font-black">🪜 사다리타기</h1>

      {!isRevealed ? (
        <LadderGame
          participants={participants}
          winners={winners}
          pickCount={pickCount}
          onComplete={handleComplete}
        />
      ) : (
        <GameResult
          winners={winners}
          participants={participants}
          onSave={handleSave}
          onReset={handleReset}
          saving={saving}
          saved={saved}
        />
      )}
    </div>
  )
}

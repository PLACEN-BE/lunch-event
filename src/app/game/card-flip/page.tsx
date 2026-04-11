'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/stores/game-store'
import { pickWinners } from '@/lib/game-engine'
import { saveGameResult } from '@/lib/actions/game'
import { QuickPickGame } from '@/components/game/QuickPickGame'
import { GameResult } from '@/components/game/GameResult'

export default function CardFlipPage() {
  const router = useRouter()
  const { participants, pickCount, winners, setWinners, isRevealed, setIsRevealed, reset } = useGameStore()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (participants.length < 2) {
      router.replace('/game')
    }
  }, [participants, router])

  function handlePick() {
    const picked = pickWinners(participants, pickCount)
    setWinners(picked)
    // 드럼롤 후 결과 표시
    setTimeout(() => setIsRevealed(true), 2000)
  }

  async function handleSave() {
    setSaving(true)
    await saveGameResult('card_flip', participants, winners)
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
      <h1 className="text-2xl font-black">🎲 누가 쏠까?</h1>

      {!isRevealed ? (
        <QuickPickGame
          participants={participants}
          winners={winners}
          onPick={handlePick}
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

'use client'

import { useRouter } from 'next/navigation'
import { useGameStore } from '@/stores/game-store'
import { ParticipantInput } from '@/components/game/ParticipantInput'
import { GameModeSelector } from '@/components/game/GameModeSelector'
import { PickCountSelector } from '@/components/game/PickCountSelector'
import { Button } from '@/components/ui/Button'

export default function GameSetupPage() {
  const router = useRouter()
  const { participants, gameMode, pickCount } = useGameStore()
  const canStart = participants.length >= 2

  function startGame() {
    if (!canStart) return
    const path = gameMode === 'card_flip' ? '/game/card-flip' : '/game/ladder'
    router.push(path)
  }

  return (
    <div className="px-4 pt-6 space-y-8">
      <div>
        <h1 className="text-2xl font-black">🎮 게임 설정</h1>
        <p className="text-foreground/40 text-sm mt-1">참여자를 추가하고 게임을 시작하세요</p>
      </div>

      <section className="space-y-2">
        <h2 className="text-sm font-bold text-foreground/60 uppercase tracking-wider">참여자</h2>
        <ParticipantInput />
      </section>

      {participants.length >= 2 && (
        <>
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-foreground/60 uppercase tracking-wider">뽑을 인원</h2>
            <PickCountSelector />
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-foreground/60 uppercase tracking-wider">게임 모드</h2>
            <GameModeSelector />
          </section>
        </>
      )}

      <Button
        onClick={startGame}
        disabled={!canStart}
        size="lg"
        className="w-full"
      >
        🎲 {canStart ? `${participants.length}명 중 ${pickCount}명 뽑기!` : '2명 이상 추가해주세요'}
      </Button>
    </div>
  )
}

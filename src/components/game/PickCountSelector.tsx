'use client'

import { useGameStore } from '@/stores/game-store'

export function PickCountSelector() {
  const { participants, pickCount, setPickCount } = useGameStore()
  const max = Math.max(1, participants.length - 1)

  return (
    <div className="space-y-2 bg-white rounded-3xl p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm text-foreground/60">뽑을 인원</span>
        <span className="text-2xl font-black text-primary">{pickCount}명</span>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setPickCount(Math.max(1, pickCount - 1))}
          className="w-10 h-10 rounded-full bg-foreground/5 text-lg font-bold hover:bg-foreground/10 transition-colors"
        >
          −
        </button>
        <input
          type="range"
          min={1}
          max={max}
          value={pickCount}
          onChange={(e) => setPickCount(Number(e.target.value))}
          className="flex-1 accent-primary"
        />
        <button
          onClick={() => setPickCount(Math.min(max, pickCount + 1))}
          className="w-10 h-10 rounded-full bg-foreground/5 text-lg font-bold hover:bg-foreground/10 transition-colors"
        >
          +
        </button>
      </div>
      <p className="text-xs text-foreground/30 text-center">
        {participants.length}명 중 {pickCount}명 선정
      </p>
    </div>
  )
}

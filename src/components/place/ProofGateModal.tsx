'use client'

import { useEffect } from 'react'

interface Props {
  open: boolean
  onPass: () => void
  onCancel: () => void
}

export default function ProofGateModal({ open, onPass, onCancel }: Props) {
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold text-foreground/40 tracking-wider">
            맛집 진위 확인
          </span>
          <span className="text-2xl leading-none">🤨</span>
        </div>

        <h2 className="text-xl font-black mb-2">잠깐만요</h2>

        <p className="text-sm leading-relaxed text-foreground/80">
          방금 등록하려는 그 집…{' '}
          <span className="font-black">진~~~~~~~~~~짜</span> 맛있어요? 어제 먹은
          거 미화한 거 아니죠?
        </p>
        <p className="text-xs leading-relaxed text-foreground/50 mt-2">
          사람 입맛 다 다른 거 아시죠. 동료가 가서 ‘이게?’ 하면 본인이 책임지는 겁니다.
        </p>

        <button
          type="button"
          onClick={onCancel}
          className="mt-5 w-full py-4 rounded-2xl bg-primary text-white text-base font-black active:scale-[0.99] transition-transform"
        >
          역시… 아닐지도? 다시 생각해볼게요
        </button>

        {/* 보험약관 깨알글씨 — 가독성 거의 0이 의도 */}
        <div className="mt-4 pt-3 border-t border-foreground/5">
          <button
            type="button"
            onClick={onPass}
            className="block w-full text-left text-[8px] leading-tight text-foreground/30 underline decoration-foreground/20 px-1 min-h-[20px]"
          >
            본인은 해당 식당이 사회 통념상 “맛있는 식당”임을 인지하며, 동료의 식권 1매에 준하는 책임을 부담함에 동의하고, 향후 등록 식당과 관련하여 발생할 수 있는 점심 평판 리스크의 1차 책임자가 됨에 서약합니다 ▸ 네 진짜요
          </button>
        </div>
      </div>
    </div>
  )
}

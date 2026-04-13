'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6">
      <div className="text-center">
        <div className="text-5xl mb-4">😵</div>
        <h2 className="text-xl font-bold mb-2">문제가 발생했습니다</h2>
        <p className="text-foreground/50 text-sm mb-1">
          {error.message || '알 수 없는 오류'}
        </p>
        {error.digest && (
          <p className="text-foreground/30 text-xs mb-6">digest: {error.digest}</p>
        )}
        <button
          onClick={reset}
          className="px-6 py-3 bg-primary text-white rounded-2xl font-bold"
        >
          다시 시도
        </button>
      </div>
    </div>
  )
}

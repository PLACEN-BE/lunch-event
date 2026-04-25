'use client'

interface StarRatingProps {
  value: number
  onChange?: (next: number) => void
  size?: number
  readonly?: boolean
}

export default function StarRating({
  value,
  onChange,
  size = 28,
  readonly = false,
}: StarRatingProps) {
  const isInteractive = !readonly && typeof onChange === 'function'

  return (
    <div className="flex items-center gap-0.5" role="radiogroup" aria-label="별점">
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= value
        return (
          <button
            key={n}
            type="button"
            disabled={!isInteractive}
            onClick={() => isInteractive && onChange?.(n)}
            aria-checked={filled}
            role="radio"
            aria-label={`${n}점`}
            className={`leading-none ${isInteractive ? 'cursor-pointer' : 'cursor-default'} ${
              filled ? 'text-gold' : 'text-foreground/15'
            }`}
            style={{ fontSize: size }}
          >
            ★
          </button>
        )
      })}
    </div>
  )
}

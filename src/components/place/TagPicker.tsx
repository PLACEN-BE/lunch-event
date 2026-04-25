'use client'

import { REVIEW_TAGS } from '@/types'

interface TagPickerProps {
  selected: string[]
  onChange: (next: string[]) => void
  max?: number
}

export default function TagPicker({ selected, onChange, max = 5 }: TagPickerProps) {
  function toggle(tag: string) {
    if (selected.includes(tag)) {
      onChange(selected.filter((t) => t !== tag))
      return
    }
    if (selected.length >= max) return
    onChange([...selected, tag])
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold text-foreground/50">태그</p>
        <span className="text-[11px] text-foreground/30">
          {selected.length}/{max}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {REVIEW_TAGS.map((tag) => {
          const active = selected.includes(tag)
          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggle(tag)}
              className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                active
                  ? 'bg-primary text-white'
                  : 'bg-background text-foreground/60'
              }`}
            >
              #{tag}
            </button>
          )
        })}
      </div>
    </div>
  )
}

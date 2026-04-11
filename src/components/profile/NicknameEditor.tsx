'use client'

import { useState, useRef } from 'react'
import { updateNickname } from '@/lib/actions/profile'
import { useRouter } from 'next/navigation'

interface NicknameEditorProps {
  userId: string
  currentNickname: string
}

export function NicknameEditor({ userId, currentNickname }: NicknameEditorProps) {
  const [editing, setEditing] = useState(false)
  const [nickname, setNickname] = useState(currentNickname)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleEdit = () => {
    setEditing(true)
    setError(null)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const handleCancel = () => {
    setNickname(currentNickname)
    setEditing(false)
    setError(null)
  }

  const handleSave = async () => {
    const trimmed = nickname.trim()
    if (trimmed.length < 2 || trimmed.length > 10) {
      setError('닉네임은 2~10자여야 합니다.')
      return
    }

    if (trimmed === currentNickname) {
      setEditing(false)
      return
    }

    setSaving(true)
    setError(null)

    const formData = new FormData()
    formData.set('userId', userId)
    formData.set('nickname', trimmed)

    const result = await updateNickname(formData)

    setSaving(false)

    if (result.error) {
      setError(result.error)
      return
    }

    setEditing(false)
    router.refresh()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') handleCancel()
  }

  return (
    <div className="space-y-1">
      <p className="text-xs text-foreground/40">닉네임</p>
      {editing ? (
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={10}
            className="flex-1 px-3 py-1.5 rounded-lg border border-foreground/15 bg-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="text-sm text-primary font-medium disabled:opacity-50"
          >
            {saving ? '...' : '저장'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="text-sm text-foreground/40"
          >
            취소
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleEdit}
          className="flex items-center gap-2 group"
        >
          <span className="text-lg font-bold">{currentNickname}</span>
          <span className="text-foreground/30 group-hover:text-foreground/60 transition-colors">✏️</span>
        </button>
      )}
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  )
}

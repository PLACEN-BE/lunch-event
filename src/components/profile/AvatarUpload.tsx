'use client'

import { useRef, useState, useCallback } from 'react'
import { Avatar } from '@/components/ui/Avatar'
import { getSignedUploadUrl, updateAvatarUrl } from '@/lib/actions/profile'
import { useRouter } from 'next/navigation'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB (리사이즈 전 원본 기준)
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const RESIZE_MAX = 400
const RESIZE_QUALITY = 0.8

interface AvatarUploadProps {
  userId: string
  currentAvatarUrl?: string | null
  nickname: string
}

function resizeImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let { width, height } = img

      if (width > RESIZE_MAX || height > RESIZE_MAX) {
        if (width > height) {
          height = Math.round((height * RESIZE_MAX) / width)
          width = RESIZE_MAX
        } else {
          width = Math.round((width * RESIZE_MAX) / height)
          height = RESIZE_MAX
        }
      }

      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('리사이즈에 실패했습니다.'))),
        file.type === 'image/png' ? 'image/png' : 'image/jpeg',
        RESIZE_QUALITY,
      )
    }
    img.onerror = () => reject(new Error('이미지를 읽을 수 없습니다.'))
    img.src = URL.createObjectURL(file)
  })
}

export function AvatarUpload({ userId, currentAvatarUrl, nickname }: AvatarUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const xhrRef = useRef<XMLHttpRequest | null>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl)
  const router = useRouter()

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // reset
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''

    // Client validation
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('이미지 파일만 업로드 가능합니다.')
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('파일 크기가 10MB를 초과합니다.')
      return
    }

    try {
      // 1. Auto-resize
      setProgress(0)
      const resized = await resizeImage(file)

      // 2. Get signed URL
      const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : file.type === 'image/gif' ? 'gif' : 'jpg'
      const result = await getSignedUploadUrl(userId, ext)

      if ('error' in result && result.error) {
        setError(result.error)
        setProgress(null)
        return
      }

      const { signedUrl, path } = result as { signedUrl: string; token: string; path: string }

      // 3. Upload via XHR
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhrRef.current = xhr

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            setProgress(Math.round((event.loaded / event.total) * 100))
          }
        }

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve()
          } else {
            reject(new Error('업로드에 실패했습니다.'))
          }
        }

        xhr.onerror = () => reject(new Error('업로드에 실패했습니다. 다시 시도해주세요.'))
        xhr.onabort = () => reject(new Error('cancelled'))

        xhr.open('PUT', signedUrl)
        xhr.setRequestHeader('Content-Type', file.type)
        xhr.send(resized)
      })

      // 4. Update avatar URL in DB
      const updateResult = await updateAvatarUrl(userId, path)
      if ('error' in updateResult && updateResult.error) {
        setError(updateResult.error)
        setProgress(null)
        return
      }

      setAvatarUrl((updateResult as { avatarUrl: string }).avatarUrl + '?t=' + Date.now())
      setProgress(null)
      router.refresh()
    } catch (err) {
      if ((err as Error).message === 'cancelled') {
        setProgress(null)
        return
      }
      setError((err as Error).message || '업로드에 실패했습니다.')
      setProgress(null)
    } finally {
      xhrRef.current = null
    }
  }, [userId, router])

  const handleCancel = useCallback(() => {
    xhrRef.current?.abort()
  }, [])

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="relative group"
        disabled={progress !== null}
      >
        <Avatar src={avatarUrl} nickname={nickname} size={120} />
        {progress === null && (
          <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <span className="text-white/0 group-hover:text-white/90 text-sm font-medium transition-colors">
              변경
            </span>
          </div>
        )}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
      />

      {progress === null && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-sm text-primary font-medium"
        >
          사진 변경
        </button>
      )}

      {progress !== null && (
        <div className="w-full max-w-[200px] space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-foreground/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-foreground/50 w-8 text-right">{progress}%</span>
            <button
              type="button"
              onClick={handleCancel}
              className="text-foreground/40 hover:text-foreground/70 text-sm"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-red-500 text-xs">{error}</p>
      )}
    </div>
  )
}

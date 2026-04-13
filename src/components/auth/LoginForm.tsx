'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, signUp } from '@/lib/actions/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function LoginForm() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError('')
    const result = mode === 'login' ? await signIn(formData) : await signUp(formData)
    if (result?.error) {
      setError(result.error)
      if (result.error.includes('가입하시겠습니까')) {
        setMode('signup')
      }
      setLoading(false)
      return
    }
    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 bg-gradient-to-b from-primary/5 to-secondary/5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">🍽️</div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">lunch event</h1>
          <p className="text-foreground/50 mt-2">오늘 누가 쏠까?</p>
        </div>

        <form action={handleSubmit} className="space-y-4 bg-white rounded-3xl p-6 shadow-lg shadow-foreground/5">
          <Input
            name="userId"
            label="ID"
            placeholder="아이디를 입력하세요"
            maxLength={20}
            autoComplete="username"
            required
          />

          {mode === 'signup' && (
            <Input
              name="nickname"
              label="닉네임"
              placeholder="2~10자"
              maxLength={10}
              required
            />
          )}

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? '...' : mode === 'login' ? '로그인' : '가입하기'}
          </Button>
        </form>

        <button
          onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}
          className="mt-6 text-sm text-foreground/40 hover:text-foreground/60 transition-colors w-full text-center"
        >
          {mode === 'login' ? '계정이 없으신가요? 가입하기 →' : '이미 계정이 있으신가요? 로그인 →'}
        </button>
      </div>
    </div>
  )
}

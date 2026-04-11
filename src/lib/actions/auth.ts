'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const SESSION_COOKIE = 'lunch_user_id'

export async function signUp(formData: FormData) {
  const supabase = await createClient()
  const userId = (formData.get('userId') as string)?.trim().toLowerCase()
  const nickname = (formData.get('nickname') as string)?.trim()

  if (!userId || userId.length < 2 || userId.length > 20) {
    return { error: 'ID는 2~20자여야 합니다.' }
  }
  if (!nickname || nickname.length < 2 || nickname.length > 10) {
    return { error: '닉네임은 2~10자여야 합니다.' }
  }

  // Check if user_id already exists
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (existing) {
    return { error: '이미 사용 중인 ID입니다.' }
  }

  // Insert user directly
  const { data: newUser, error } = await supabase
    .from('users')
    .insert({ user_id: userId, nickname })
    .select('id')
    .single()

  if (error) {
    console.error('signUp error:', error.message)
    return { error: '가입 중 오류가 발생했습니다.' }
  }

  // Set session cookie
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, newUser.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
  })

  redirect('/')
}

export async function signIn(formData: FormData) {
  const supabase = await createClient()
  const userId = (formData.get('userId') as string)?.trim().toLowerCase()

  if (!userId) {
    return { error: 'ID를 입력해주세요.' }
  }

  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (!user) {
    return { error: '등록되지 않은 ID입니다. 가입하시겠습니까?' }
  }

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
  })

  redirect('/')
}

export async function signOut() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
  redirect('/login')
}

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const uid = cookieStore.get(SESSION_COOKIE)?.value
  if (!uid) return null

  const supabase = await createClient()
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', uid)
    .single()

  return data
}

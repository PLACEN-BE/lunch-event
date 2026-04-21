'use server'

import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

const SESSION_COOKIE = 'lunch_user_id'
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif']

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(SESSION_COOKIE)?.value ?? null
}

export async function getSignedUploadUrl(userId: string, ext: string) {
  const sessionUserId = await getSessionUserId()
  if (!sessionUserId || sessionUserId !== userId) {
    return { error: '인증이 필요합니다.' }
  }

  if (!ALLOWED_EXTENSIONS.includes(ext.toLowerCase())) {
    return { error: '지원하지 않는 파일 형식입니다.' }
  }

  const admin = createAdminClient()

  // 기존 아바타 삭제
  const { data: existingFiles } = await admin.storage
    .from('avatars')
    .list(userId)

  if (existingFiles && existingFiles.length > 0) {
    const filesToDelete = existingFiles.map((f) => `${userId}/${f.name}`)
    await admin.storage.from('avatars').remove(filesToDelete)
  }

  // Signed URL 생성
  const path = `${userId}/avatar.${ext.toLowerCase()}`
  const { data, error } = await admin.storage
    .from('avatars')
    .createSignedUploadUrl(path)

  if (error) {
    return { error: '업로드 URL 생성에 실패했습니다.' }
  }

  return {
    signedUrl: data.signedUrl,
    token: data.token,
    path,
  }
}

export async function updateAvatarUrl(userId: string, path: string) {
  const sessionUserId = await getSessionUserId()
  if (!sessionUserId || sessionUserId !== userId) {
    return { error: '인증이 필요합니다.' }
  }

  const admin = createAdminClient()
  const { data: publicUrlData } = admin.storage
    .from('avatars')
    .getPublicUrl(path)

  const supabase = await createServerClient()
  const { error } = await supabase
    .from('users')
    .update({ avatar_url: publicUrlData.publicUrl })
    .eq('id', userId)

  if (error) {
    return { error: '프로필 업데이트에 실패했습니다.' }
  }

  revalidatePath('/my')
  revalidatePath('/ranking')
  return { success: true, avatarUrl: publicUrlData.publicUrl }
}

export async function updateNickname(formData: FormData) {
  const nickname = (formData.get('nickname') as string)?.trim()
  const userId = formData.get('userId') as string

  const sessionUserId = await getSessionUserId()
  if (!sessionUserId || sessionUserId !== userId) {
    return { error: '인증이 필요합니다.' }
  }

  if (!nickname || nickname.length < 2 || nickname.length > 10) {
    return { error: '닉네임은 2~10자여야 합니다.' }
  }

  const supabase = await createServerClient()
  const { error } = await supabase
    .from('users')
    .update({ nickname })
    .eq('id', userId)

  if (error) {
    return { error: '닉네임 변경에 실패했습니다.' }
  }

  revalidatePath('/my')
  revalidatePath('/ranking')
  return {}
}

export async function getMyStats(userId: string) {
  const supabase = await createServerClient()

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [monthlyResult, allTimeResult] = await Promise.all([
    supabase
      .from('event_participants')
      .select('id, events!inner(created_at)', { count: 'exact' })
      .eq('user_id', userId)
      .eq('is_payer', true)
      .gte('events.created_at', monthStart),
    supabase
      .from('event_participants')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .eq('is_payer', true),
  ])

  return {
    monthly: monthlyResult.count ?? 0,
    allTime: allTimeResult.count ?? 0,
  }
}

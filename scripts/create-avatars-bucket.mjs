import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const envFile = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8')
const env = Object.fromEntries(
  envFile
    .split('\n')
    .filter((line) => line.trim() && !line.startsWith('#'))
    .map((line) => {
      const idx = line.indexOf('=')
      return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()]
    }),
)

const url = env.NEXT_PUBLIC_SUPABASE_URL
const key = env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 누락')
  process.exit(1)
}

const admin = createClient(url, key)

const { data: buckets, error: listErr } = await admin.storage.listBuckets()
if (listErr) {
  console.error('버킷 목록 조회 실패:', listErr)
  process.exit(1)
}

const exists = buckets.find((b) => b.id === 'avatars')
if (exists) {
  console.log('avatars 버킷이 이미 존재합니다. 업데이트 시도...')
  const { error: updateErr } = await admin.storage.updateBucket('avatars', {
    public: true,
    fileSizeLimit: 5242880,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  })
  if (updateErr) {
    console.error('업데이트 실패:', updateErr)
    process.exit(1)
  }
  console.log('업데이트 완료')
} else {
  const { error: createErr } = await admin.storage.createBucket('avatars', {
    public: true,
    fileSizeLimit: 5242880,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  })
  if (createErr) {
    console.error('버킷 생성 실패:', createErr)
    process.exit(1)
  }
  console.log('avatars 버킷 생성 완료')
}

console.log('\n완료. 이제 프로필 이미지 업로드가 가능합니다.')
console.log('참고: service role은 RLS를 우회하므로 별도 정책이 없어도 동작합니다.')

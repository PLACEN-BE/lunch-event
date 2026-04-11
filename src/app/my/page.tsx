import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/actions/auth'
import { getMyStats } from '@/lib/actions/profile'
import { signOut } from '@/lib/actions/auth'
import { AvatarUpload } from '@/components/profile/AvatarUpload'
import { NicknameEditor } from '@/components/profile/NicknameEditor'

export default async function MyPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const stats = await getMyStats(user.id)

  return (
    <div className="px-4 pt-8 space-y-8">
      <h1 className="text-xl font-black text-center">마이페이지</h1>

      {/* 프로필 사진 */}
      <div className="flex justify-center">
        <AvatarUpload
          userId={user.id}
          currentAvatarUrl={user.avatar_url}
          nickname={user.nickname}
        />
      </div>

      {/* 닉네임 + ID */}
      <div className="space-y-2">
        <NicknameEditor userId={user.id} currentNickname={user.nickname} />
        <p className="text-sm text-foreground/35">@{user.user_id}</p>
      </div>

      {/* 내 기록 */}
      <div className="space-y-3">
        <p className="text-sm font-bold text-foreground/50">내 기록</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl border border-foreground/5 shadow-sm p-4 text-center">
            <p className="text-2xl font-black text-primary">{stats.monthly}</p>
            <p className="text-xs text-foreground/40 mt-1">이달의 한턱</p>
          </div>
          <div className="bg-white rounded-2xl border border-foreground/5 shadow-sm p-4 text-center">
            <p className="text-2xl font-black text-primary">{stats.allTime}</p>
            <p className="text-xs text-foreground/40 mt-1">전체 한턱</p>
          </div>
        </div>
      </div>

      {/* 로그아웃 */}
      <form action={signOut} className="pt-4">
        <button
          type="submit"
          className="w-full py-3 text-sm text-foreground/40 hover:text-foreground/60 transition-colors"
        >
          로그아웃
        </button>
      </form>
    </div>
  )
}

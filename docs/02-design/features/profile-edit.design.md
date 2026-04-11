# profile-edit Design Document

> **Summary**: 프로필 수정 마이페이지 — Option C (Pragmatic Balance) 설계
>
> **Project**: lunch-event
> **Version**: 1.0.0
> **Author**: joohui.lee
> **Date**: 2026-04-11
> **Status**: Draft
> **Planning Doc**: [profile-edit.plan.md](../../01-plan/features/profile-edit.plan.md)

---

## Context Anchor

| Key | Value |
|-----|-------|
| **WHY** | 프로필 수정 불가 + 아바타 부재로 사내 앱 정체성과 시각적 식별성 약함 |
| **WHO** | lunch-event 앱 기존 가입 직원 (주 2회+ 접속하는 활성 사용자) |
| **RISK** | 200MB 업로드 시 모바일 OOM/타임아웃 + Vercel 4.5MB body 제한으로 서버 직접 수신 불가 |
| **SUCCESS** | 프로필 사진 설정률 60%+, 닉네임 수정 정상 작동, 랭킹 화면 아바타 표시 |
| **SCOPE** | MY탭 + 사진업로드(자동압축+Presigned URL) + 닉네임수정 + 로그아웃 + 랭킹/게임 아바타통합 |

---

## 1. Overview

### 1.1 Design Goals

- Presigned URL 패턴으로 Vercel 4.5MB body 제한 우회
- 클라이언트 자동 리사이즈(400x400)로 실질적 업로드 크기 최소화
- 공통 `<Avatar>` 컴포넌트로 랭킹/게임/마이페이지 통합
- 기존 코드 패턴(Server Actions, Tailwind, 컴포넌트 구조) 유지

### 1.2 Design Principles

- 기존 패턴 일관성: Server Actions + `lib/actions/` 구조
- 복잡한 UI 로직만 분리: 업로드(프로그레스/취소), 닉네임 수정(폼 상태)
- YAGNI: Storage 헬퍼 모듈 분리 불필요 — actions에 통합

---

## 2. Architecture

### 2.0 Architecture Comparison

| Criteria | Option A: Minimal | Option B: Clean | **Option C: Pragmatic** |
|----------|:-:|:-:|:-:|
| **New Files** | 3 | 8 | **5** |
| **Modified Files** | 4 | 5 | **5** |
| **Complexity** | Low | High | **Medium** |
| **Maintainability** | Medium | High | **High** |
| **Effort** | Low | High | **Medium** |

**Selected**: Option C — **Rationale**: 핵심 복잡 로직(업로드, 닉네임)만 컴포넌트 분리하고, Avatar는 공유 컴포넌트로 추출. 이 규모에서 과도한 분리 없이 적절한 구조.

### 2.1 Component Diagram

```
┌─────────────────────────────────────────────────────────┐
│ src/app/my/page.tsx (Server Component)                  │
│   └─ getCurrentUser() → user data fetch                 │
│   └─ getMyStats() → 한턱 횟수 fetch                      │
│                                                         │
│   ┌─────────────────────────────────────┐               │
│   │ AvatarUpload (Client Component)     │               │
│   │   ├─ file select + MIME validation  │               │
│   │   ├─ Canvas auto-resize (400x400)   │               │
│   │   ├─ getSignedUploadUrl() call      │               │
│   │   ├─ XHR PUT + progress bar         │               │
│   │   └─ updateAvatarUrl() call         │               │
│   └─────────────────────────────────────┘               │
│                                                         │
│   ┌─────────────────────────────────────┐               │
│   │ NicknameEditor (Client Component)   │               │
│   │   ├─ inline edit mode toggle        │               │
│   │   ├─ 2-10자 validation              │               │
│   │   └─ updateNickname() call          │               │
│   └─────────────────────────────────────┘               │
│                                                         │
│   ┌─────────────────────────────────────┐               │
│   │ Avatar (Shared UI Component)        │               │
│   │   ├─ avatar_url → <img>            │               │
│   │   └─ fallback → 이니셜 원형 배지     │               │
│   └─────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ src/lib/actions/profile.ts (Server Actions)             │
│   ├─ getSignedUploadUrl(userId, ext)                    │
│   │     → Supabase admin client                         │
│   │     → storage.createSignedUploadUrl()               │
│   │     → 이전 아바타 삭제                                │
│   ├─ updateAvatarUrl(userId, path)                      │
│   │     → storage.getPublicUrl(path)                    │
│   │     → UPDATE users SET avatar_url                   │
│   │     → revalidatePath('/my')                         │
│   └─ updateNickname(userId, nickname)                   │
│         → validation (2-10자)                            │
│         → UPDATE users SET nickname                     │
│         → revalidatePath('/my')                         │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Upload Data Flow

```
[Client: AvatarUpload]
  │
  ├─ 1. <input type="file" accept="image/*"> → File selected
  ├─ 2. Client validation: MIME (jpeg/png/webp/gif) + size (≤200MB)
  ├─ 3. Canvas auto-resize: max 400x400, quality 0.8 → Blob
  │
  ├─ 4. Server Action: getSignedUploadUrl(userId, ext)
  │       ├─ createClient(serviceRoleKey)
  │       ├─ storage.from('avatars').list(userId/) → 기존 파일 삭제
  │       ├─ storage.from('avatars').createSignedUploadUrl(`${userId}/avatar.${ext}`)
  │       └─ return { signedUrl, token, path }
  │
  ├─ 5. XHR PUT to signedUrl
  │       ├─ xhr.upload.onprogress → 실시간 % 표시
  │       ├─ AbortController → 취소 지원
  │       └─ Content-Type: image/{ext}
  │
  ├─ 6. Server Action: updateAvatarUrl(userId, path)
  │       ├─ storage.from('avatars').getPublicUrl(path)
  │       ├─ UPDATE users SET avatar_url = publicUrl WHERE id = userId
  │       └─ revalidatePath('/my')
  │
  └─ 7. UI 갱신: 새 아바타 표시
```

### 2.3 Dependencies

| Component | Depends On | Purpose |
|-----------|-----------|---------|
| `AvatarUpload` | `profile.ts` actions | Signed URL 발급, avatar URL 업데이트 |
| `NicknameEditor` | `profile.ts` actions | 닉네임 업데이트 |
| `Avatar` | None (순수 UI) | 아바타 이미지 or 이니셜 fallback 렌더링 |
| `RankingCard` | `Avatar` | 랭킹에 아바타 표시 |
| `GameResult` | `Avatar` | 게임 결과에 아바타 표시 |
| `profile.ts` | Supabase admin client | Storage 접근 (service role key) |

---

## 3. Data Model

### 3.1 Type Changes

```typescript
// src/types/index.ts — User 수정
export interface User {
  id: string
  user_id: string
  nickname: string
  avatar_url?: string | null  // NEW
  created_at: string
}

// RankingEntry 수정
export interface RankingEntry {
  nickname: string
  login_id: string
  uid: string
  treat_count: number
  avatar_url?: string | null  // NEW
}
```

### 3.2 Database Schema Changes

```sql
-- 1. users 테이블에 avatar_url 컬럼 추가
ALTER TABLE users ADD COLUMN avatar_url TEXT;

-- 2. monthly_rankings 뷰에 avatar_url 추가
CREATE OR REPLACE VIEW monthly_rankings AS
SELECT
  u.nickname,
  u.user_id AS login_id,
  u.id AS uid,
  u.avatar_url,
  COUNT(ep.id) AS treat_count
FROM event_participants ep
JOIN events e ON ep.event_id = e.id
JOIN users u ON ep.user_id = u.id
WHERE ep.is_payer = TRUE
  AND e.created_at >= date_trunc('month', CURRENT_DATE)
GROUP BY u.id, u.nickname, u.user_id, u.avatar_url
ORDER BY treat_count DESC;

-- 3. alltime_rankings 뷰에 avatar_url 추가
CREATE OR REPLACE VIEW alltime_rankings AS
SELECT
  u.nickname,
  u.user_id AS login_id,
  u.id AS uid,
  u.avatar_url,
  COUNT(ep.id) AS treat_count
FROM event_participants ep
JOIN events e ON ep.event_id = e.id
JOIN users u ON ep.user_id = u.id
WHERE ep.is_payer = TRUE
GROUP BY u.id, u.nickname, u.user_id, u.avatar_url
ORDER BY treat_count DESC;

-- 4. Supabase Storage: avatars 버킷 (Supabase Dashboard에서 생성)
-- Public read, 서버사이드 upload (service role key)
```

---

## 4. API Specification

이 기능은 REST API가 아닌 **Server Actions** 패턴을 사용한다.

### 4.1 Server Actions

| Action | Parameters | Returns | Auth |
|--------|-----------|---------|------|
| `getSignedUploadUrl` | `(userId: string, ext: string)` | `{ signedUrl: string, token: string, path: string }` | Cookie session |
| `updateAvatarUrl` | `(userId: string, path: string)` | `{ success: boolean, avatarUrl: string }` | Cookie session |
| `updateNickname` | `(formData: FormData)` | `{ error?: string }` | Cookie session |
| `getMyStats` | `(userId: string)` | `{ monthly: number, allTime: number }` | Cookie session |

### 4.2 getSignedUploadUrl Detail

```typescript
// Input validation
ext: 'jpg' | 'jpeg' | 'png' | 'webp' | 'gif'

// Process
1. Verify userId matches session cookie
2. Create Supabase admin client (SUPABASE_SERVICE_ROLE_KEY)
3. List existing files in avatars/{userId}/ → delete all
4. createSignedUploadUrl(`avatars/${userId}/avatar.${ext}`)
5. Return signed URL (expires in 60 seconds)

// Error cases
- Invalid session → { error: '인증이 필요합니다.' }
- Invalid ext → { error: '지원하지 않는 파일 형식입니다.' }
- Storage error → { error: '업로드 URL 생성에 실패했습니다.' }
```

### 4.3 Supabase Admin Client

```typescript
// 기존 server.ts의 anon key 클라이언트와 별도로
// service role key를 사용하는 admin 클라이언트가 필요
// profile.ts 내부에서 직접 생성 (별도 파일 불필요)

import { createClient } from '@supabase/supabase-js'

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
```

---

## 5. UI/UX Design

### 5.1 마이페이지 레이아웃

```
┌─────────────────────────┐
│     < 마이페이지         │  ← 헤더
├─────────────────────────┤
│                         │
│    ┌───────────┐        │
│    │  Avatar   │        │  ← 120x120 원형
│    │  120x120  │        │     사진 or 이니셜
│    └───────────┘        │
│     📷 사진 변경         │  ← 탭하면 파일 선택기
│                         │
│  ┌─ Progress Bar ─────┐ │  ← 업로드 중에만 표시
│  │ ████████░░ 72%  ✕  │ │     취소 버튼 포함
│  └────────────────────┘ │
│                         │
│  닉네임                  │
│  ┌────────────────┐ ✏️  │  ← 연필 아이콘 탭 → 수정 모드
│  │ 김대리          │     │
│  └────────────────┘     │
│  ID: @kimdalri           │  ← 수정 불가 (표시만)
│                         │
│  ─── 내 기록 ───         │
│  🏆 이달의 한턱: 3회     │
│  📊 전체 한턱: 12회      │
│                         │
│  ┌────────────────────┐ │
│  │    로그아웃          │ │  ← 텍스트 버튼 (ghost)
│  └────────────────────┘ │
│                         │
└─────────────────────────┘
```

### 5.2 User Flow

```
BottomNav "MY" 탭 → /my 마이페이지
  ├─ 아바타 영역 탭 → 파일 선택기
  │   ├─ 파일 선택 → 자동 리사이즈 → 업로드(프로그레스) → 완료
  │   └─ 취소 → 기존 사진 유지
  ├─ 연필 아이콘 탭 → 닉네임 수정 모드
  │   ├─ 입력 + 저장 → 성공
  │   └─ 유효하지 않은 입력 → 에러 메시지
  └─ 로그아웃 → /login 리디렉트
```

### 5.3 Component List

| Component | File | Type | Responsibility |
|-----------|------|------|----------------|
| MyPage | `src/app/my/page.tsx` | Server | 유저 데이터 fetch + 레이아웃 |
| AvatarUpload | `src/components/profile/AvatarUpload.tsx` | Client | 파일 선택 + 리사이즈 + 업로드 + 프로그레스 + 취소 |
| NicknameEditor | `src/components/profile/NicknameEditor.tsx` | Client | 닉네임 인라인 수정 |
| Avatar | `src/components/ui/Avatar.tsx` | Shared | 아바타 이미지 or 이니셜 fallback |

---

## 6. Error Handling

| Scenario | Component | Handling |
|----------|-----------|---------|
| 200MB 초과 파일 | AvatarUpload | `파일 크기가 200MB를 초과합니다.` 토스트 |
| 비이미지 파일 | AvatarUpload | `이미지 파일만 업로드 가능합니다.` 토스트 |
| 업로드 네트워크 에러 | AvatarUpload | `업로드에 실패했습니다. 다시 시도해주세요.` + 기존 사진 유지 |
| 업로드 취소 | AvatarUpload | 기존 사진 유지, 프로그레스 바 숨김 |
| Signed URL 만료 | AvatarUpload | 자동 재발급 후 재시도 (1회) |
| 닉네임 2자 미만 | NicknameEditor | `닉네임은 2자 이상이어야 합니다.` |
| 닉네임 10자 초과 | NicknameEditor | maxLength=10으로 입력 차단 |
| 미로그인 /my 접근 | page.tsx | `/login` 리디렉트 |

---

## 7. Security Considerations

- [x] **MIME 검증**: 클라이언트 `file.type` 체크 + 서버 `ext` 화이트리스트
- [x] **파일 크기**: 클라이언트 200MB 체크 (리사이즈 후 실제 업로드는 수백KB)
- [x] **인증**: Server Action 내에서 세션 쿠키 검증 후 signed URL 발급
- [x] **Storage 접근**: service role key는 서버에서만 사용 (클라이언트 노출 없음)
- [x] **URL sanitize**: avatar_url을 렌더링할 때 `next/image` 또는 직접 img에서 Supabase 도메인만 허용
- [x] **1인 1파일**: 업로드 전 기존 파일 삭제로 무한 축적 방지

---

## 8. Test Plan

### 8.1 Test Cases (Key)

| ID | Scenario | Expected | Priority |
|----|---------|----------|:--------:|
| T-01 | 200MB JPEG 선택 → 자동 리사이즈 → 업로드 | 리사이즈 후 업로드 성공, 아바타 반영 | P0 |
| T-02 | 200MB 초과 파일 선택 | 에러 메시지, 업로드 차단 | P0 |
| T-03 | .exe 파일 업로드 시도 | 에러 메시지, 업로드 차단 | P0 |
| T-04 | 업로드 중 취소 | 기존 사진 유지 | P1 |
| T-05 | 닉네임 정상 수정 (3자) | 즉시 반영 | P0 |
| T-06 | 닉네임 1자 입력 | 에러 메시지 | P0 |
| T-07 | 미로그인 /my 접근 | /login 리디렉트 | P0 |
| T-08 | 기존 사진 → 새 사진 업로드 | 기존 삭제, 새 사진 반영 | P0 |
| T-09 | BottomNav MY 탭 활성 상태 | /my에서 하이라이트 | P0 |
| T-10 | 랭킹 화면 아바타 표시 | avatar_url 있으면 이미지, 없으면 이니셜 | P1 |
| T-11 | 로그아웃 버튼 | 세션 삭제, /login 이동 | P0 |

---

## 9. Clean Architecture

### 9.1 Layer Assignment

| Component | Layer | Location |
|-----------|-------|----------|
| MyPage (page.tsx) | Presentation | `src/app/my/page.tsx` |
| AvatarUpload | Presentation | `src/components/profile/AvatarUpload.tsx` |
| NicknameEditor | Presentation | `src/components/profile/NicknameEditor.tsx` |
| Avatar | Presentation | `src/components/ui/Avatar.tsx` |
| profile actions | Infrastructure | `src/lib/actions/profile.ts` |
| User, RankingEntry | Domain | `src/types/index.ts` |

---

## 10. Coding Convention Reference

### 10.1 This Feature's Conventions

| Item | Convention |
|------|-----------|
| Component naming | PascalCase (`AvatarUpload.tsx`) |
| Actions file | camelCase (`profile.ts`) — `lib/actions/` 패턴 |
| Server Component | `page.tsx` — `async function` + data fetch |
| Client Component | `'use client'` 선언 — 상태/이벤트 필요한 것만 |
| Styling | Tailwind CSS utility classes — 기존 패턴 유지 |
| State | `useState` 직접 사용 — Zustand 불필요 (서버 데이터 중심) |

---

## 11. Implementation Guide

### 11.1 File Structure

```
src/
├── app/
│   └── my/
│       └── page.tsx                    ← NEW: 마이페이지
├── components/
│   ├── profile/
│   │   ├── AvatarUpload.tsx            ← NEW: 사진 업로드
│   │   └── NicknameEditor.tsx          ← NEW: 닉네임 수정
│   ├── ui/
│   │   ├── Avatar.tsx                  ← NEW: 공통 아바타
│   │   ├── BottomNav.tsx               ← MODIFY: MY 탭 추가
│   │   ├── Button.tsx
│   │   └── Input.tsx
│   ├── ranking/
│   │   └── RankingCard.tsx             ← MODIFY: 아바타 추가
│   └── game/
│       └── GameResult.tsx              ← MODIFY: 아바타 추가
├── lib/
│   ├── actions/
│   │   ├── auth.ts
│   │   ├── game.ts
│   │   ├── ranking.ts
│   │   └── profile.ts                 ← NEW: 프로필 Server Actions
│   └── supabase/
│       ├── client.ts
│       └── server.ts
├── stores/
├── types/
│   └── index.ts                       ← MODIFY: avatar_url 추가
└── proxy.ts
```

### 11.2 Implementation Order

1. [ ] **Types + Schema**: `types/index.ts` avatar_url 추가 + `schema.sql` 업데이트
2. [ ] **Server Actions**: `lib/actions/profile.ts` 생성 (getSignedUploadUrl, updateAvatarUrl, updateNickname, getMyStats)
3. [ ] **Avatar 컴포넌트**: `components/ui/Avatar.tsx` 생성
4. [ ] **AvatarUpload 컴포넌트**: `components/profile/AvatarUpload.tsx` 생성
5. [ ] **NicknameEditor 컴포넌트**: `components/profile/NicknameEditor.tsx` 생성
6. [ ] **마이페이지**: `app/my/page.tsx` 생성
7. [ ] **BottomNav 수정**: MY 탭 추가
8. [ ] **RankingCard 수정**: Avatar 통합
9. [ ] **GameResult 수정**: Avatar 통합
10. [ ] **next.config.ts**: Supabase Storage 도메인 이미지 허용 (remotePatterns)

### 11.3 Session Guide

#### Module Map

| Module | Scope Key | Description | Files |
|--------|-----------|-------------|-------|
| Foundation | `module-1` | 타입, 스키마, Server Actions, Avatar 컴포넌트 | types/index.ts, schema.sql, profile.ts, Avatar.tsx |
| Profile UI | `module-2` | AvatarUpload, NicknameEditor, 마이페이지, BottomNav | AvatarUpload.tsx, NicknameEditor.tsx, page.tsx, BottomNav.tsx |
| Integration | `module-3` | 랭킹/게임 아바타 통합, next.config.ts | RankingCard.tsx, GameResult.tsx, next.config.ts |

#### Recommended Session Plan

| Session | Scope | Description |
|---------|-------|-------------|
| Session 1 | `--scope module-1` | 타입 + DB 스키마 + Server Actions + Avatar 컴포넌트 |
| Session 2 | `--scope module-2` | 업로드/닉네임 UI + 마이페이지 + BottomNav |
| Session 3 | `--scope module-3` | 랭킹/게임 아바타 통합 + 설정 |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-11 | Initial draft — Option C selected, Presigned URL 패턴 | joohui.lee |

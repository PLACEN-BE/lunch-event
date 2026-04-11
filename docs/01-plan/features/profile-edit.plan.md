# profile-edit Planning Document

> **Summary**: 프로필 수정 마이페이지 탭 — 사진 업로드(200MB, 자동 압축) + 닉네임 수정 + 랭킹 아바타 통합
>
> **Project**: lunch-event
> **Version**: 1.0.0
> **Author**: joohui.lee
> **Date**: 2026-04-11
> **Status**: Draft
> **PRD Reference**: `docs/00-pm/profile-edit.prd.md`

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 프로필 수정 기능이 없어 가입 시 입력한 닉네임이 고정되고, 아바타 없이 텍스트만 표시되어 사내 앱으로서 시각적 식별성이 약하다 |
| **Solution** | BottomNav 4번째 "MY" 탭 + 마이페이지(/my) + 프로필 사진 업로드(Presigned URL, 자동 압축) + 닉네임 수정 + 랭킹/게임 아바타 통합 |
| **Function/UX Effect** | 사진 선택 → 자동 리사이즈 → Presigned URL 업로드(프로그레스 바) → 저장 완료. 랭킹/게임 결과에 아바타 자동 반영 |
| **Core Value** | 사내 구성원 간 시각적 식별성 강화 + 랭킹/게임에 아바타 노출로 앱 활력 및 참여도 증대 |

---

## Context Anchor

| Key | Value |
|-----|-------|
| **WHY** | 프로필 수정 불가 + 아바타 부재로 사내 앱 정체성과 시각적 식별성 약함 |
| **WHO** | lunch-event 앱 기존 가입 직원 (주 2회+ 접속하는 활성 사용자) |
| **RISK** | 200MB 업로드 시 모바일 OOM/타임아웃 + Vercel 4.5MB body 제한으로 서버 직접 수신 불가 |
| **SUCCESS** | 프로필 사진 설정률 60%+, 닉네임 수정 정상 작동, 랭킹 화면 아바타 표시 |
| **SCOPE** | MVP: MY탭 + 사진업로드(자동압축+Presigned URL) + 닉네임수정 + 로그아웃 + 랭킹/게임 아바타통합 |

---

## 1. Overview

### 1.1 Purpose

사용자가 프로필 사진과 닉네임을 직접 수정할 수 있는 마이페이지를 제공하여, 랭킹/게임 결과에서 동료를 시각적으로 식별하고 앱 참여도를 높인다.

### 1.2 Background

- 현재 users 테이블에 `avatar_url` 컬럼 없음 — 프로필 사진 기능 자체가 불가
- 가입 시 입력한 닉네임 변경 경로 없음 (오타 수정 불가)
- 랭킹/게임 결과에 닉네임만 표시 → 소규모 조직에서도 "누가 누구?" 혼란
- BottomNav에 마이페이지 탭 부재 → 로그아웃조차 경로 없음

### 1.3 Related Documents

- PRD: `docs/00-pm/profile-edit.prd.md`
- 기존 Plan: `docs/01-plan/features/lunch-event.plan.md`

---

## 2. Scope

### 2.1 In Scope

- [ ] BottomNav 4번째 "MY" 탭 추가 (`/my` 경로)
- [ ] 마이페이지 화면 — 아바타, 닉네임, 아이디, 한턱 기록, 로그아웃
- [ ] 프로필 사진 업로드 (200MB, 자동 클라이언트 리사이즈 후 업로드)
- [ ] Supabase Storage `avatars` 버킷 + Presigned URL 패턴
- [ ] 업로드 프로그레스 바(%) + 취소 기능
- [ ] 닉네임 인라인 수정 (2-10자)
- [ ] 사진 미설정 시 이니셜 기반 기본 아바타 (fallback)
- [ ] 공통 `<Avatar>` 컴포넌트
- [ ] 랭킹 화면(RankingCard) 아바타 통합
- [ ] 게임 결과(GameResult) 아바타 통합
- [ ] `users` 테이블 `avatar_url` 컬럼 추가
- [ ] 로그아웃 버튼

### 2.2 Out of Scope

- 이미지 크롭 UI (원형 크롭 에디터)
- 프로필 배경 이미지
- 내 게임 이력 상세 목록
- 팀 기능 / 조직도 연동
- Supabase Auth 마이그레이션

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | BottomNav에 "MY" 4번째 탭 추가 (`/my` 경로, 사용자 아이콘) | High | Pending |
| FR-02 | 마이페이지: 아바타(120x120) + 닉네임 + ID + 한턱 기록(월간/전체) + 로그아웃 | High | Pending |
| FR-03 | 프로필 사진 업로드 — Presigned URL 패턴으로 최대 200MB 지원 | High | Pending |
| FR-04 | 클라이언트 사이드 자동 이미지 리사이즈 (max 400x400, quality 0.8) 후 업로드 | High | Pending |
| FR-05 | 업로드 프로그레스 바(XMLHttpRequest progress) + AbortController 취소 | High | Pending |
| FR-06 | 허용 MIME: image/jpeg, image/png, image/webp, image/gif + 서버 검증 | High | Pending |
| FR-07 | 닉네임 인라인 수정 (2-10자, 클라이언트+서버 검증) | High | Pending |
| FR-08 | `users.avatar_url` 컬럼 추가 (TEXT, nullable) | High | Pending |
| FR-09 | 공통 `<Avatar>` 컴포넌트 — 사진 있으면 표시, 없으면 이니셜 fallback | High | Pending |
| FR-10 | RankingCard에 아바타 표시 | Medium | Pending |
| FR-11 | GameResult에 아바타 표시 | Medium | Pending |
| FR-12 | 미로그인 시 `/my` 접근 → `/login` 리디렉트 | High | Pending |
| FR-13 | 기존 사진 있을 때 새 사진 업로드 시 이전 파일 삭제 (1인 1아바타) | Medium | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Performance | 리사이즈 후 업로드 완료 3초 이내 (WiFi 환경, 리사이즈된 파일 기준) | 브라우저 Performance API |
| Security | MIME type 서버 검증 + 확장자 화이트리스트 + URL sanitize (XSS 방지) | 수동 테스트 |
| Mobile UX | 터치 타겟 >= 44px, 프로필 사진 영역 탭으로 파일 선택기 호출 | 실기기 테스트 |
| Storage | 파일명 UUID 기반 충돌 방지, 이전 아바타 자동 삭제 | Supabase Dashboard |
| Compatibility | iOS Safari 16+, Android Chrome 90+, 카메라 직접 촬영 지원 | 크로스 브라우저 테스트 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] 모든 FR 구현 완료
- [ ] BottomNav MY 탭 정상 동작
- [ ] 200MB 이미지 선택 → 자동 리사이즈 → Presigned URL 업로드 → 아바타 반영
- [ ] 닉네임 수정 후 즉시 반영
- [ ] 랭킹/게임 결과에 아바타 표시
- [ ] 미로그인 시 /login 리디렉트
- [ ] 빌드 에러 없음

### 4.2 Quality Criteria

- [ ] Zero lint errors
- [ ] `next build` 성공
- [ ] 프로필 사진 설정률 목표: 1개월 내 60%+
- [ ] TS strict mode 에러 없음

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Vercel 4.5MB body 제한으로 서버 직접 수신 불가 | Critical | High | Presigned URL 패턴 — Server Action이 signed URL 발급, 클라이언트가 직접 Storage에 PUT |
| 200MB 이미지 모바일 OOM/타임아웃 | High | Medium | 클라이언트 자동 리사이즈(400x400)로 실제 업로드 용량 대폭 감소 |
| Supabase Storage 무료 티어 1GB 초과 | Medium | Low | 자동 리사이즈로 파일 크기 감소 + 1인 1아바타(이전 삭제) |
| 커스텀 세션에서 Storage RLS 사용 불가 | High | High | 서버에서 service role key로 signed URL 발급 (서버사이드 인증 검증 후) |
| 부적절한 이미지 업로드 | Medium | Low | MIME type + 확장자 화이트리스트 서버 검증 |

---

## 6. Impact Analysis

### 6.1 Changed Resources

| Resource | Type | Change Description |
|----------|------|--------------------|
| `users` 테이블 | DB Schema | `avatar_url TEXT` 컬럼 추가 |
| `BottomNav` 컴포넌트 | UI Component | 4번째 "MY" 탭 추가 |
| `User` 인터페이스 | TypeScript Type | `avatar_url?: string \| null` 필드 추가 |
| `RankingCard` 컴포넌트 | UI Component | 아바타 표시 추가 |
| `GameResult` 컴포넌트 | UI Component | 아바타 표시 추가 |
| Supabase Storage | Infrastructure | `avatars` 버킷 신규 생성 |

### 6.2 Current Consumers

| Resource | Operation | Code Path | Impact |
|----------|-----------|-----------|--------|
| `users` 테이블 | SELECT | `lib/actions/auth.ts → getCurrentUser()` | Needs verification — `select('*')`이므로 avatar_url 자동 포함 |
| `users` 테이블 | INSERT | `lib/actions/auth.ts → signUp()` | None — avatar_url nullable이므로 기존 INSERT 영향 없음 |
| `User` 타입 | READ | `components/ranking/RankingCard.tsx` | Needs verification — avatar_url 필드 사용하도록 수정 |
| `User` 타입 | READ | `components/game/GameResult.tsx` | Needs verification — avatar_url 필드 사용하도록 수정 |
| `BottomNav` | RENDER | `app/layout.tsx` | None — 탭 추가만으로 기존 3탭 영향 없음 |

### 6.3 Verification

- [ ] `getCurrentUser()` 가 `avatar_url` 포함하여 반환하는지 확인 (`select('*')` → OK)
- [ ] 기존 `signUp()` INSERT에 avatar_url 없어도 에러 안 나는지 확인 (nullable → OK)
- [ ] RankingCard, GameResult에 avatar_url 전달 경로 확인
- [ ] 기존 monthly_rankings/alltime_rankings 뷰에 avatar_url 추가 필요 여부 확인

---

## 7. Architecture Considerations

### 7.1 Project Level Selection

| Level | Characteristics | Recommended For | Selected |
|-------|-----------------|-----------------|:--------:|
| **Starter** | Simple structure (`components/`, `lib/`, `types/`) | Static sites, portfolios, landing pages | ☐ |
| **Dynamic** | Feature-based modules, BaaS integration | Web apps with backend, SaaS MVPs, fullstack apps | ☑ |
| **Enterprise** | Strict layer separation, DI, microservices | High-traffic systems, complex architectures | ☐ |

### 7.2 Key Architectural Decisions

| Decision | Options | Selected | Rationale |
|----------|---------|----------|-----------|
| Framework | Next.js 16 App Router | Next.js 16 | 기존 프로젝트 스택 유지 |
| Upload Pattern | Server Action / Route Handler / Presigned URL | **Presigned URL** | Vercel 4.5MB body 제한 회피 + progress event 지원 |
| Image Resize | Server-side / Client-side / None | **Client-side 자동** | 서버 비용 절감, Canvas API 활용 |
| Storage | Supabase Storage | Supabase Storage | 기존 인프라, 프로젝트 일관성 |
| Auth for Storage | Supabase Auth RLS / Service Role Key | **Service Role Key** | 현재 커스텀 쿠키 세션 환경 |
| State | Zustand / Context / None | None (Server Component + revalidate) | 프로필은 서버 데이터, 클라이언트 상태 불필요 |
| Styling | Tailwind CSS 4 | Tailwind CSS 4 | 기존 프로젝트 패턴 유지 |

### 7.3 Upload Flow Architecture

```
[Client: AvatarUpload]
  ↓ 1. File selected (max 200MB, MIME validated)
  ↓ 2. Client-side auto-resize (Canvas → 400x400, quality 0.8)
  ↓ 3. Server Action: getSignedUploadUrl(userId, fileExt)
  ↓    → Supabase Storage createSignedUploadUrl('avatars/{uid}/avatar.{ext}')
  ↓    → 이전 아바타 존재 시 삭제
  ↓    → Return: { signedUrl, path }
  ↓ 4. XMLHttpRequest PUT to signedUrl (upload.onprogress → 실시간 %)
  ↓ 5. 업로드 완료 → Server Action: updateAvatarUrl(userId, path)
  ↓    → UPDATE users SET avatar_url = publicUrl WHERE id = userId
  ↓    → revalidatePath('/my')
  ↓
[Done: 아바타 즉시 반영]
```

---

## 8. Convention Prerequisites

### 8.1 Existing Project Conventions

- [x] `tsconfig.json` — path alias `@/` 설정
- [x] Tailwind CSS 4 + PostCSS
- [x] Server Actions 패턴 (`'use server'` + `lib/actions/`)
- [x] Supabase client/server 분리 (`lib/supabase/client.ts`, `server.ts`)
- [x] 컴포넌트 구조: `components/{domain}/{Component}.tsx`
- [ ] ESLint / Prettier 설정 없음

### 8.2 Environment Variables Needed

| Variable | Purpose | Scope | To Be Created |
|----------|---------|-------|:-------------:|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL | Client | 기존 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key | Client | 기존 |
| `SUPABASE_SERVICE_ROLE_KEY` | Storage Presigned URL 발급용 | Server | ☑ 확인 필요 |

---

## 9. File Plan

### 9.1 New Files

| File | Purpose |
|------|---------|
| `src/app/my/page.tsx` | 마이페이지 (Server Component) |
| `src/components/profile/ProfileEditor.tsx` | 프로필 편집 클라이언트 컴포넌트 |
| `src/components/profile/AvatarUpload.tsx` | 사진 업로드 + 프로그레스 + 취소 |
| `src/components/profile/NicknameEditor.tsx` | 닉네임 인라인 수정 |
| `src/components/ui/Avatar.tsx` | 공통 아바타 (사진 or 이니셜 fallback) |
| `src/lib/actions/profile.ts` | Server Actions: getSignedUploadUrl, updateAvatarUrl, updateNickname |
| `src/lib/supabase/storage.ts` | Storage 헬퍼: createSignedUrl, deleteAvatar, getPublicUrl |

### 9.2 Modified Files

| File | Change |
|------|--------|
| `src/components/ui/BottomNav.tsx` | 4번째 "MY" 탭 추가 |
| `src/types/index.ts` | User 인터페이스에 `avatar_url?: string \| null` 추가 |
| `src/components/ranking/RankingCard.tsx` | `<Avatar>` 컴포넌트 통합 |
| `src/components/game/GameResult.tsx` | `<Avatar>` 컴포넌트 통합 |
| `supabase/schema.sql` | `avatar_url` 컬럼 + Storage 정책 추가 |

---

## 10. Next Steps

1. [ ] Design 문서 작성 (`/pdca design profile-edit`)
2. [ ] Supabase Storage `avatars` 버킷 생성 + `SUPABASE_SERVICE_ROLE_KEY` 확인
3. [ ] `users` 테이블 `avatar_url` 컬럼 ALTER TABLE 실행
4. [ ] monthly_rankings / alltime_rankings 뷰에 avatar_url 추가 여부 결정
5. [ ] 구현 시작

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-11 | Initial draft — PRD 기반, 자동압축+랭킹통합 범위 확정 | joohui.lee |

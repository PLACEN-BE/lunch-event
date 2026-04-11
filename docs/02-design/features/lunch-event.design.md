# lunch-event Design Document

> **Summary**: 사내 점심 복불복 게임 + 한턱 히스토리 명예의 전당 웹앱
>
> **Project**: lunch-event
> **Author**: joohui.lee
> **Date**: 2026-04-10
> **Status**: Draft
> **Planning Doc**: [lunch-event.plan.md](../../01-plan/features/lunch-event.plan.md)

---

## Context Anchor

| Key | Value |
|-----|-------|
| **WHY** | "누가 쏠까" 결정의 어색함 해소 + 한턱 이력 비가시성 문제 해결 |
| **WHO** | 같은 회사에서 함께 점심 먹는 3~15명 규모 팀/그룹 |
| **RISK** | 초기 사용자 확보 실패 (팀원들이 귀찮아서 안 씀) |
| **SUCCESS** | 자기 팀 5명+ 일주일 매일 사용, 게임 5회+/일, 히스토리 5건+/주 |
| **SCOPE** | MVP: 회원관리 + 카드플립 + 사다리타기 + 한턱 히스토리 (월간/누적 랭킹) |

---

## 1. Overview

### 1.1 Design Goals

- 인상적인 애니메이션(카드 플립 3D, 사다리 경로 하이라이트)으로 게임의 재미를 극대화
- 모바일 우선 반응형 설계 (점심 시간에 모바일로 사용)
- Supabase 기반 간편 인증 + RLS로 데이터 보안
- 서버 컴포넌트(랭킹 SSR) + 클라이언트 컴포넌트(게임 애니메이션) 명확 분리

### 1.2 Design Principles

- **모바일 퍼스트**: 엄지 영역 기반 터치 타겟, 큰 카드/버튼
- **재미 우선**: 결과 공개 시 confetti/파티클 이펙트, 왕관/메달 아이콘
- **간결한 UX**: 3초 가입, 3탭 이내 게임 시작
- **공정한 랜덤**: crypto.getRandomValues 기반, 결과 예측 불가

---

## 2. Architecture

### 2.0 Architecture Comparison

| Criteria | Option A: Flat | Option B: Clean | Option C: Pragmatic |
|----------|:-:|:-:|:-:|
| **New Files** | ~15 | ~40 | **~25** |
| **Complexity** | Low | High | **Medium** |
| **Maintainability** | Medium | High | **High** |
| **Effort** | Low | High | **Medium** |
| **사내 도구 적합성** | 중간 | 과도 | **최적** |

**Selected**: Option C (Pragmatic Balance) — 사내 도구에 적합한 실용적 구조. 확장 시 Feature 모듈로 리팩토링 가능.

### 2.1 System Architecture

```
┌──────────────────────────────────────────────┐
│           Client (Next.js App Router)         │
│  ┌────────────┬──────────────┬─────────────┐ │
│  │  Game UI   │  Ranking UI  │  Auth UI    │ │
│  │ (Client    │ (Server      │ (Server     │ │
│  │  Component)│  Component)  │  Actions)   │ │
│  └────────────┴──────────────┴─────────────┘ │
│         │              │              │       │
│  ┌──────┴──────────────┴──────────────┘       │
│  │         Supabase Client (lib/)             │
│  └────────────────────┬───────────────────────┘
│                       │
├───────────────────────┼──────────────────────┤
│              Supabase (BaaS)                  │
│  ┌────────────┬───────────────┬────────────┐ │
│  │   Auth     │  PostgreSQL   │    RLS     │ │
│  │  (Custom   │  (users,      │  (Row      │ │
│  │   ID-only) │   events,     │   Level    │ │
│  │            │   participants)│   Security)│ │
│  └────────────┴───────────────┴────────────┘ │
└──────────────────────────────────────────────┘
│               Vercel (Deploy)                 │
└──────────────────────────────────────────────┘
```

### 2.2 Data Flow

```
[게임 플로우]
참여자 입력 → 게임 모드 선택 → 랜덤 뽑기 (client) → 애니메이션 재생 → 결과 저장 (Server Action → Supabase)

[랭킹 플로우]
페이지 접속 → Server Component → Supabase 쿼리 → SSR 렌더링 → 클라이언트 표시

[인증 플로우]
ID 입력 → Supabase users 테이블 조회 → 존재하면 세션 생성 / 없으면 가입 → 닉네임 설정 (첫 로그인)
```

### 2.3 Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| next | 15.x | App Router, Server Components |
| react | 19.x | UI Library |
| typescript | 5.x | Type Safety |
| @supabase/supabase-js | 2.x | Supabase Client |
| @supabase/ssr | latest | SSR 지원 Supabase |
| framer-motion | 11.x | 카드 플립 3D, 사다리 애니메이션 |
| tailwindcss | 4.x | Utility-first CSS |
| zustand | 5.x | 게임 상태 관리 |
| canvas-confetti | 1.x | 결과 화면 confetti 이펙트 |

---

## 3. Data Model

### 3.1 Entity Definition

```typescript
// 사용자
interface User {
  id: string;              // UUID (Supabase auto)
  user_id: string;         // 로그인 ID (unique, 영문/숫자 4~20자)
  nickname: string;        // 닉네임 (2~10자)
  created_at: string;      // ISO timestamp
}

// 점심 이벤트 (게임 결과)
interface LunchEvent {
  id: string;              // UUID
  game_mode: 'card_flip' | 'ladder';
  created_by: string;      // User UUID (FK)
  created_at: string;
}

// 이벤트 참여자
interface EventParticipant {
  id: string;              // UUID
  event_id: string;        // LunchEvent UUID (FK)
  user_id: string;         // User UUID (FK)
  is_payer: boolean;       // 당첨(한턱 내는 사람) 여부
  created_at: string;
}

// 랭킹 (뷰 쿼리 결과)
interface RankingEntry {
  nickname: string;
  user_id: string;
  treat_count: number;
  period: 'monthly' | 'all_time';
}

// 게임 상태 (클라이언트 Zustand)
interface GameState {
  participants: string[];        // 참여자 닉네임 목록
  pickCount: number;             // 뽑을 인원 수
  gameMode: 'card_flip' | 'ladder';
  winners: string[];             // 당첨자
  isPlaying: boolean;
  isRevealed: boolean;
}
```

### 3.2 Entity Relationships

```
[User] 1 ──── N [LunchEvent]     (created_by)
  │
  └── 1 ──── N [EventParticipant] (user_id)
                       │
[LunchEvent] 1 ─── N [EventParticipant] (event_id)
```

### 3.3 Database Schema

```sql
-- 사용자
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(20) UNIQUE NOT NULL,
  nickname VARCHAR(10) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ID uniqueness index
CREATE UNIQUE INDEX idx_users_user_id ON users(user_id);

-- 점심 이벤트 (게임 결과)
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_mode VARCHAR(20) NOT NULL CHECK (game_mode IN ('card_flip', 'ladder')),
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 이벤트 참여자
CREATE TABLE event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  is_payer BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_events_created_at ON events(created_at DESC);
CREATE INDEX idx_participants_event ON event_participants(event_id);
CREATE INDEX idx_participants_payer ON event_participants(user_id, is_payer);

-- 월간 랭킹 뷰
CREATE OR REPLACE VIEW monthly_rankings AS
SELECT
  u.nickname,
  u.user_id AS login_id,
  u.id AS uid,
  COUNT(ep.id) AS treat_count
FROM event_participants ep
JOIN events e ON ep.event_id = e.id
JOIN users u ON ep.user_id = u.id
WHERE ep.is_payer = TRUE
  AND e.created_at >= date_trunc('month', CURRENT_DATE)
GROUP BY u.id, u.nickname, u.user_id
ORDER BY treat_count DESC;

-- 전체 누적 랭킹 뷰
CREATE OR REPLACE VIEW alltime_rankings AS
SELECT
  u.nickname,
  u.user_id AS login_id,
  u.id AS uid,
  COUNT(ep.id) AS treat_count
FROM event_participants ep
JOIN events e ON ep.event_id = e.id
JOIN users u ON ep.user_id = u.id
WHERE ep.is_payer = TRUE
GROUP BY u.id, u.nickname, u.user_id
ORDER BY treat_count DESC;

-- RLS 정책
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;

-- 읽기: 모든 인증된 사용자 허용
CREATE POLICY "Users are viewable by authenticated users" ON users
  FOR SELECT USING (true);

CREATE POLICY "Events are viewable by authenticated users" ON events
  FOR SELECT USING (true);

CREATE POLICY "Participants are viewable by authenticated users" ON event_participants
  FOR SELECT USING (true);

-- 쓰기: 본인만
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Authenticated users can create events" ON events
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Authenticated users can create participants" ON event_participants
  FOR INSERT WITH CHECK (true);
```

---

## 4. API Specification

> Supabase를 직접 호출하되, Server Actions로 래핑하여 보안 + 타입 안전성 확보.

### 4.1 Server Actions

| Action | File | Description | Auth |
|--------|------|-------------|:----:|
| `signUp` | `lib/actions.ts` | ID + 닉네임으로 가입 (users 테이블 INSERT) | No |
| `signIn` | `lib/actions.ts` | ID로 로그인 (users 테이블 조회 → 세션 생성) | No |
| `saveGameResult` | `lib/actions.ts` | 게임 결과 저장 (events + participants INSERT) | Yes |
| `getMonthlyRanking` | `lib/actions.ts` | 월간 랭킹 조회 (monthly_rankings 뷰) | Yes |
| `getAllTimeRanking` | `lib/actions.ts` | 전체 누적 랭킹 조회 (alltime_rankings 뷰) | Yes |
| `getRecentParticipants` | `lib/actions.ts` | 최근 함께한 멤버 목록 조회 | Yes |
| `updateNickname` | `lib/actions.ts` | 닉네임 변경 | Yes |

### 4.2 Auth Flow (ID-Only)

```
[가입]
1. Client: ID + 닉네임 입력
2. Server Action: users 테이블에 INSERT (user_id unique 체크)
3. Supabase Auth: signUp(email: `${userId}@lunch.internal`, password: userId)
4. 자동 로그인 → 세션 쿠키 설정

[로그인]
1. Client: ID 입력
2. Server Action: Supabase Auth signInWithPassword(email: `${userId}@lunch.internal`, password: userId)
3. 세션 쿠키 설정 → 리다이렉트

Note: Supabase Auth는 이메일 기반이므로, ID를 `${id}@lunch.internal` 형태로 매핑.
      비밀번호는 ID와 동일하게 설정 (사내 도구 특성상 보안 최소화).
      향후 비밀번호 추가 시 별도 마이그레이션 필요.
```

---

## 5. UI/UX Design

### 5.1 Screen Layout (모바일 우선)

```
[로그인/가입]                    [홈 (대시보드)]
┌─────────────────┐             ┌─────────────────┐
│                 │             │  lunch-event     │
│   🍽️ lunch      │             │  Hi, 김대리! 👋  │
│    event        │             ├─────────────────┤
│                 │             │                 │
│  ┌───────────┐  │             │  [🎮 게임 시작]  │
│  │  ID 입력  │  │             │                 │
│  └───────────┘  │             │  ── 최근 게임 ── │
│  ┌───────────┐  │             │  카드플립 5명→1명│
│  │ 닉네임    │  │             │  사다리 4명→2명 │
│  └───────────┘  │             │                 │
│                 │             │  [🏆 명예의전당] │
│  [ 시작하기 ]   │             │                 │
│                 │             ├─────────────────┤
│  이미 계정이    │             │ 🏠  🎮  🏆  👤  │
│  있다면 >       │             └─────────────────┘
└─────────────────┘

[게임 설정]                      [카드 플립]
┌─────────────────┐             ┌─────────────────┐
│  ← 게임 설정    │             │  ← 카드 플립     │
├─────────────────┤             ├─────────────────┤
│                 │             │                 │
│  참여자 추가:   │             │  ┌───┐ ┌───┐   │
│  ┌───────────┐  │             │  │ ? │ │ ? │   │
│  │ 이름 입력 │+ │             │  └───┘ └───┘   │
│  └───────────┘  │             │  ┌───┐ ┌───┐   │
│                 │             │  │ ? │ │ ? │   │
│  김대리 ✕       │             │  └───┘ └───┘   │
│  박과장 ✕       │             │  ┌───┐         │
│  이주임 ✕       │             │  │ ? │         │
│  최사원 ✕       │             │  └───┘         │
│                 │             │                 │
│  뽑을 인원: [1] │             │  탭하여 카드를  │
│  [▼카드플립]    │             │  뒤집으세요!    │
│                 │             │                 │
│  [ 🎲 시작! ]   │             │  [ 전체 공개 ]   │
└─────────────────┘             └─────────────────┘

[사다리타기]                     [명예의 전당]
┌─────────────────┐             ┌─────────────────┐
│  ← 사다리타기    │             │  🏆 명예의 전당   │
├─────────────────┤             ├─────────────────┤
│                 │             │ [월간] [전체]     │
│  김  박  이  최 │             │                 │
│  │──┤  │  │──┤ │             │  👑 1. 박과장 7회│
│  │  │──┤  │  │ │             │  🥈 2. 김대리 5회│
│  │──┤  │──┤  │ │             │  🥉 3. 이주임 3회│
│  │  │  │  │──┤ │             │     4. 최사원 2회│
│  │  │──┤  │  │ │             │     5. 정인턴 1회│
│  │──┤  │  │  │ │             │                 │
│  ▼  ▼  ▼  ▼   │             │                 │
│  💰 ✓  ✓  💰  │             │  내 순위: 2위    │
│                 │             │  이번 달: 5회    │
│  [ GO! ]        │             │                 │
│                 │             ├─────────────────┤
└─────────────────┘             │ 🏠  🎮  🏆  👤  │
                                └─────────────────┘
```

### 5.2 User Flow

```
[메인 플로우]
앱 접속 → (미로그인) → 로그인/가입 → 홈
          (로그인됨) → 홈

[게임 플로우]
홈 → 게임 시작 → 참여자 입력 → 인원 수 설정 → 모드 선택 → 게임 실행 → 결과 확인 → (히스토리 자동 저장)

[랭킹 플로우]
홈 → 명예의 전당 → 월간/전체 탭 전환 → 개인 상세 확인
```

### 5.3 Component List

| Component | Location | Type | Responsibility |
|-----------|----------|:----:|----------------|
| `LoginForm` | `components/auth/` | Client | ID/닉네임 입력 폼, 가입/로그인 처리 |
| `ParticipantInput` | `components/game/` | Client | 참여자 이름 입력, 추가/삭제 |
| `GameModeSelector` | `components/game/` | Client | 카드플립/사다리 모드 선택 |
| `PickCountSelector` | `components/game/` | Client | 뽑을 인원 수 설정 (슬라이더/숫자) |
| `CardFlipGame` | `components/game/` | Client | 카드 플립 3D 애니메이션 + 게임 로직 |
| `LadderGame` | `components/game/` | Client | 사다리타기 Canvas/SVG 애니메이션 |
| `GameResult` | `components/game/` | Client | 결과 화면 + confetti 이펙트 |
| `RankingBoard` | `components/ranking/` | Server | 월간/전체 랭킹 테이블 (SSR) |
| `RankingCard` | `components/ranking/` | Server | 개인 랭킹 카드 (왕관/메달) |
| `BottomNav` | `components/ui/` | Client | 하단 네비게이션 바 |

---

## 6. Error Handling

### 6.1 Error Scenarios

| Scenario | Cause | Handling |
|----------|-------|----------|
| 중복 ID 가입 시도 | user_id UNIQUE 위반 | "이미 사용 중인 ID입니다" 토스트 표시 |
| 존재하지 않는 ID 로그인 | users 테이블에 미존재 | "등록되지 않은 ID입니다. 가입하시겠습니까?" |
| 참여자 2명 미만으로 게임 시작 | 최소 인원 미충족 | 게임 시작 버튼 비활성화 |
| 뽑을 인원 >= 참여자 수 | 전원 당첨은 무의미 | 뽑을 인원 상한 자동 제한 (N-1) |
| 네트워크 오류로 결과 저장 실패 | Supabase 연결 끊김 | "저장 실패. 다시 시도하시겠습니까?" 재시도 버튼 |
| 세션 만료 | Supabase 세션 타임아웃 | 로그인 페이지로 리다이렉트 |

---

## 7. Security Considerations

- [x] **입력 검증**: ID (영문/숫자 4~20자), 닉네임 (2~10자) 서버사이드 검증
- [x] **XSS 방지**: Next.js 기본 이스케이핑 + Supabase parameterized queries
- [x] **RLS**: Row Level Security로 데이터 접근 제어
- [x] **HTTPS**: Vercel 자동 SSL
- [ ] **Rate Limiting**: 사내 도구 특성상 MVP에서는 미적용
- [x] **랜덤 공정성**: crypto.getRandomValues (CSPRNG) 사용

---

## 8. Test Plan

### 8.1 Test Scope

| Type | Target | Method |
|------|--------|--------|
| 수동 테스트 | 전체 User Flow | PRD TS-01 ~ TS-10 시나리오 |
| 빌드 검증 | TypeScript + ESLint | `next build` 성공 여부 |
| 반응형 검증 | 모바일/데스크탑 | Chrome DevTools 디바이스 모드 |
| 성능 검증 | 애니메이션 60fps | Chrome Performance 탭 |

### 8.2 Key Test Cases

- [ ] 5명 입력 → 1명 뽑기 → 카드 플립 → 결과 저장 확인
- [ ] 10명 입력 → 3명 뽑기 → 사다리 → 결과 저장 확인
- [ ] 중복 ID 가입 시 에러 메시지 표시
- [ ] 월간 랭킹 정확성 (이번 달 데이터만 집계)
- [ ] 전체 누적 랭킹 정확성
- [ ] 모바일(iPhone SE) 레이아웃 깨짐 없음
- [ ] 카드 플립 애니메이션 60fps
- [ ] 세션 만료 후 재로그인 정상 동작

---

## 9. Layer Structure (Option C — Pragmatic)

| Layer | Responsibility | Location |
|-------|---------------|----------|
| **Pages (Routes)** | 페이지 렌더링, 데이터 페칭 | `src/app/` |
| **Components** | UI 렌더링, 사용자 인터랙션 | `src/components/` |
| **Lib (Actions)** | Server Actions, Supabase 쿼리, 비즈니스 로직 | `src/lib/` |
| **Stores** | 클라이언트 상태 관리 (게임 상태) | `src/stores/` |
| **Types** | 타입 정의 | `src/types/` |

```
Dependency Direction:

  Pages ──→ Components ──→ Lib (Actions) ──→ Supabase
    │            │              │
    └────────────┴──→ Stores ──→ Types
                      (client only)
```

---

## 10. Coding Conventions

### 10.1 Naming

| Target | Rule | Example |
|--------|------|---------|
| Component | PascalCase | `CardFlipGame`, `RankingBoard` |
| Page file | lowercase | `page.tsx`, `layout.tsx` |
| Lib file | kebab-case | `game-engine.ts`, `actions.ts` |
| Variable | camelCase | `treatCount`, `gameMode` |
| Type/Interface | PascalCase | `LunchEvent`, `GameState` |
| Constant | UPPER_SNAKE_CASE | `MAX_PARTICIPANTS`, `GAME_MODES` |

### 10.2 Import Order

```typescript
// 1. React / Next.js
import { useState } from 'react'
import { redirect } from 'next/navigation'

// 2. External packages
import { motion } from 'framer-motion'
import { create } from 'zustand'

// 3. Internal (absolute @/)
import { Button } from '@/components/ui/Button'
import { saveGameResult } from '@/lib/actions'

// 4. Types
import type { GameState, LunchEvent } from '@/types'
```

### 10.3 Environment Variables

| Variable | Purpose | Scope |
|----------|---------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | Client |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anonymous Key | Client |

---

## 11. Implementation Guide

### 11.1 File Structure (Final)

```
src/
├── app/
│   ├── layout.tsx                  # Root layout (BottomNav, Supabase Provider)
│   ├── page.tsx                    # 홈 (대시보드)
│   ├── login/
│   │   └── page.tsx                # 로그인/가입
│   ├── game/
│   │   ├── page.tsx                # 게임 설정 (참여자/모드/인원)
│   │   ├── card-flip/
│   │   │   └── page.tsx            # 카드 플립 게임
│   │   └── ladder/
│   │       └── page.tsx            # 사다리타기 게임
│   └── ranking/
│       └── page.tsx                # 명예의 전당 (월간/누적)
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── BottomNav.tsx
│   ├── auth/
│   │   └── LoginForm.tsx
│   ├── game/
│   │   ├── ParticipantInput.tsx
│   │   ├── GameModeSelector.tsx
│   │   ├── PickCountSelector.tsx
│   │   ├── CardFlipGame.tsx
│   │   ├── LadderGame.tsx
│   │   └── GameResult.tsx
│   └── ranking/
│       ├── RankingBoard.tsx
│       └── RankingCard.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # createBrowserClient
│   │   ├── server.ts               # createServerClient
│   │   └── middleware.ts            # Auth middleware
│   ├── actions/
│   │   ├── auth.ts                  # signUp, signIn
│   │   ├── game.ts                  # saveGameResult
│   │   └── ranking.ts              # getMonthlyRanking, getAllTimeRanking
│   └── game-engine.ts              # 랜덤 뽑기 로직 (crypto.getRandomValues)
├── stores/
│   └── game-store.ts               # Zustand: participants, pickCount, gameMode, winners
├── types/
│   └── index.ts                    # User, LunchEvent, EventParticipant, RankingEntry, GameState
└── middleware.ts                    # Next.js middleware (auth redirect)
```

### 11.2 Implementation Order

1. [ ] **프로젝트 초기화**: Next.js + Tailwind + TypeScript + Supabase 설정
2. [ ] **타입 정의**: `types/index.ts` (User, LunchEvent, EventParticipant, GameState)
3. [ ] **Supabase 설정**: client.ts, server.ts, middleware.ts + DB 스키마 생성
4. [ ] **인증 구현**: LoginForm + auth actions + middleware
5. [ ] **게임 엔진**: game-engine.ts (crypto.getRandomValues 기반 뽑기)
6. [ ] **게임 UI - 설정**: ParticipantInput, GameModeSelector, PickCountSelector
7. [ ] **게임 UI - 카드 플립**: CardFlipGame (Framer Motion 3D)
8. [ ] **게임 UI - 사다리타기**: LadderGame (Canvas/SVG 애니메이션)
9. [ ] **결과 화면**: GameResult + confetti + 히스토리 자동 저장
10. [ ] **랭킹 시스템**: RankingBoard + RankingCard (월간/누적 SSR)
11. [ ] **홈 대시보드**: 최근 게임, 빠른 시작 CTA
12. [ ] **레이아웃 + 네비게이션**: Root layout, BottomNav, 반응형

### 11.3 Session Guide

#### Module Map

| Module | Scope Key | Description | Files | Estimated Effort |
|--------|-----------|-------------|:-----:|:----------------:|
| 프로젝트 초기화 + 인증 | `module-1` | Next.js 셋업, Supabase 연동, 로그인/가입 | 8 | Medium |
| 게임 엔진 + 카드 플립 | `module-2` | 랜덤 뽑기 로직, 카드 플립 3D 애니메이션 | 6 | High |
| 사다리타기 + 결과 저장 | `module-3` | 사다리 애니메이션, 결과 화면, 히스토리 저장 | 5 | High |
| 랭킹 + 홈 + 레이아웃 | `module-4` | 명예의 전당, 대시보드, 네비게이션, 반응형 | 6 | Medium |

#### Recommended Session Plan

| Session | Scope | Description |
|:-------:|-------|-------------|
| Session 1 | `--scope module-1` | 프로젝트 초기화 + Supabase + 인증 시스템 |
| Session 2 | `--scope module-2` | 게임 엔진 + 카드 플립 애니메이션 |
| Session 3 | `--scope module-3` | 사다리타기 + 결과 화면 + 히스토리 저장 |
| Session 4 | `--scope module-4` | 랭킹 시스템 + 홈 + 레이아웃 마무리 |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-10 | Initial draft (Option C selected, Checkpoint 3 반영) | joohui.lee |

# home-menu-vote Design Document

> **Project**: lunch-event
> **Version**: 1.0.0
> **Author**: joohui.lee
> **Date**: 2026-04-22
> **Status**: Draft
> **Plan Reference**: `docs/01-plan/features/home-menu-vote.plan.md`
> **PRD Reference**: `docs/00-pm/home-menu-vote.prd.md`

---

## Context Anchor

| Key | Value |
|-----|-------|
| **WHY** | 홈 중복 섹션 제거 + 핵심 행동(먹픽) 탭 이동 마찰 제거 |
| **WHO** | 매일 점심 후 먹픽을 남기는 사내 구성원 (인증된 사용자) |
| **RISK** | `/vote`·BottomNav 먹픽 탭 역할 중복, MenuGrid `fixed` 버튼 레이아웃 충돌 |
| **SUCCESS** | 홈 1탭 먹픽, 투표 완료 후 랭킹 CTA 1탭 이동, 홈 정보 밀도 유지 |
| **SCOPE** | 홈(src/app/page.tsx) 리팩터, MenuGrid 재사용, /vote → / 리다이렉트, BottomNav 먹픽 탭 제거 |

---

## 1. Overview

홈에서 오늘의 메뉴 투표(먹픽)를 바로 진행할 수 있도록 MenuGrid를 이식하고, 중복이 되어버린 "최근 게임", "이달의 한턱왕" 섹션과 `/vote` 경로·탭을 정리한다. 기존 서버 액션(`getTodayVote`, `submitMenuVote`)과 UI 컴포넌트(MenuGrid)를 최대한 재사용하여 변경 범위를 좁게 유지한다.

---

## 2. Architecture Options

동일한 기능을 구현하는 3가지 접근 방식을 비교한다.

### Option A — Minimal (별도 CTA 버튼 추가)

MenuGrid 원본은 건드리지 않고, 홈에서 MenuGrid 아래에 **별도의 "랭킹 보러가기" 링크 버튼**을 조건부로 렌더링한다. MenuGrid 내부의 "명예의 전당 보기 🏆" 버튼은 그대로 둠 → 중복 CTA 발생.

- 변경: `src/app/page.tsx`만 수정
- 문제: 투표 후 CTA가 2개 (명예의 전당 보기 + 랭킹 보러가기) → UX 혼선

### Option B — Clean (Props 기반 커스터마이징)

MenuGrid에 `postVoteCta: { label: string, href: string }` prop을 추가하여 문구/링크를 외부에서 주입 가능하게 만든다.

- 변경: `MenuGrid.tsx` (prop 추가 + default 유지), `page.tsx` (prop 전달)
- 장점: 향후 다른 사용처에서 재활용 가능
- 단점: 유일 사용처가 홈이 될 상황(/vote 제거)에서 **쓰지 않을 확장성**에 대한 과투자 (YAGNI 위반)

### Option C — Pragmatic (문구 직접 변경) ✅ 권장

`/vote`가 홈으로 리다이렉트되면 MenuGrid의 유일한 소비자가 홈이 된다. 이 맥락에서 MenuGrid 내부 CTA 문구를 **직접 "랭킹 보러가기 🏆"로 교체**하는 게 가장 솔직하다. Prop 추상화 없이 한 줄만 바뀐다.

- 변경: `MenuGrid.tsx` (문구 1곳), `page.tsx` (섹션 재구성), `vote/page.tsx` (redirect), `BottomNav.tsx` (탭 삭제)
- 장점: 최소 코드, 과잉 추상 없음, Plan의 방향과 정합
- 단점: 향후 MenuGrid를 다른 곳에 쓰려면 그때 prop 추출 필요 (하지만 그 시점에 추출하는 게 YAGNI에 부합)

### 비교 표

| 기준 | A. Minimal | B. Clean | C. Pragmatic |
|------|:---:|:---:|:---:|
| 코드 변경량 | 매우 작음 | 중간 | 작음 |
| 유지보수성 | 낮음 (중복 CTA) | 높음 | 높음 |
| 과잉 추상화 | - | 있음 (현재 불필요한 prop) | 없음 |
| 재사용성 | - | 높음 | 필요 시 점진 가능 |
| YAGNI 준수 | 중간 | 낮음 | 높음 |
| 구현 난이도 | 최저 | 중간 | 낮음 |
| **권장** | | | ✅ |

### Selected Option: **C — Pragmatic**

Plan 단계에서 이미 선정된 방향과 일치. 이하 설계는 C 기준.

---

## 3. System Architecture

### 3.1 Component & Data Flow

```
┌───────────────────────────────────────────────────────────────┐
│ src/app/page.tsx (Server Component)                           │
│                                                               │
│  1. getCurrentUser()                                          │
│  2. getTodayVote()        ← 새로 호출                         │
│  3. getTopFortuneMenus(3)                                     │
│                                                               │
│  <Header>                                                     │
│  <GameCTA />                                                  │
│  <TodayLunchBlock>        ← 새 JSX 블록                       │
│    <h2>오늘 점심 뭐 먹었어?</h2>                              │
│    <MenuGrid todayVote={todayVote} />  (client)               │
│  </TodayLunchBlock>                                           │
│  <PopularFortuneMenus />  (유지)                              │
└───────────────────────────────────────────────────────────────┘
           ↓ client hydration
┌───────────────────────────────────────────────────────────────┐
│ MenuGrid (src/components/vote/MenuGrid.tsx)                   │
│   - 그리드 렌더 / 선택 상태 / submitMenuVote 호출             │
│   - 투표 후: "랭킹 보러가기 🏆" → router.push('/ranking')     │
└───────────────────────────────────────────────────────────────┘
           ↑ 재사용 (변경: CTA 문구 1줄)
┌───────────────────────────────────────────────────────────────┐
│ src/app/vote/page.tsx                                         │
│   export default () => redirect('/')                          │
└───────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│ src/components/ui/BottomNav.tsx                               │
│   navItems에서 { href: '/vote', label: '먹픽' } 삭제          │
│   남는 6개 탭: 홈 / 게임 / 뽑기 / 운세 / 랭킹 / MY             │
└───────────────────────────────────────────────────────────────┘
```

### 3.2 Server Actions (변경 없음, 참고)

- `getTodayVote()` — 쿠키 세션 기반 오늘 투표 1건 조회, 있으면 menu_category 반환
- `submitMenuVote(menu_category)` — 오늘 투표 upsert, 쿠키 세션 검증

---

## 4. Layout Design

### 4.1 홈 섹션 순서 (After)

```
┌───────────────────────────────────┐
│ 🍽️ lunch event                    │
│ 안녕, {nickname}! 👋              │
├───────────────────────────────────┤
│ 🎲 오늘 누가 쏠까?                │  ← 기존 CTA 유지
│ 게임 시작하기 →                   │
├───────────────────────────────────┤
│ 🍽️ 오늘 점심                      │  ← NEW
│    뭐 먹었어?                     │
│ 4/22 화 · 탭해서 먹픽하세요        │
│ ┌───┐ ┌───┐                       │
│ │한식│ │일식│                      │
│ └───┘ └───┘  ... (2x N 그리드)    │
│ [먹픽! 🫵] or [랭킹 보러가기 🏆]  │  ← fixed bottom-16
├───────────────────────────────────┤
│ 🔮 인기 운세 메뉴   운세 보기 →   │  ← 기존 유지
│ 👑 🍚 한식         5회            │
│ 🥈 🍜 일식         3회            │
│ 🥉 🍕 양식         2회            │
└───────────────────────────────────┘
│ 홈 게임 뽑기 운세 랭킹 MY          │  ← BottomNav (먹픽 탭 제거)
└───────────────────────────────────┘
```

### 4.2 MenuGrid Fixed Button 공존성

MenuGrid의 하단 CTA는 `fixed bottom-16 left-0 right-0` 스타일. BottomNav는 `h-16`이므로 정확히 위에 얹힌다. `/vote` 페이지에서 이미 이 레이아웃으로 작동하므로 홈에서도 동일하게 작동한다. 추가 여백 조정 불필요.

- 홈 컨텐츠의 `pt-8`은 유지, 하단 `pb-*`는 MenuGrid 자체 fixed 요소가 스크롤에 영향을 주지 않으므로 현 상태 유지.
- 다만 운세 섹션이 fixed 버튼에 가려지지 않도록 홈 최하단 padding 필요 → `pb-40` 정도 추가 고려.

### 4.3 로그인 사용자 Guard

현재 홈은 비로그인 사용자도 렌더링 가능(`user`가 null일 수 있음). MenuGrid는 `submitMenuVote` 호출 시 쿠키 세션 검증으로 401을 반환하므로, 비로그인 상태에선 **MenuGrid 자체를 숨기고 로그인 유도** 처리가 깔끔하다.

```tsx
{user ? (
  <TodayLunchBlock todayVote={todayVote} />
) : (
  <LoginPromptBlock />  // 또는 기존 로그인 리다이렉트 흐름
)}
```

> 현재 홈은 `proxy.ts`에서 비로그인 사용자를 `/login`으로 이미 리다이렉트할 수 있음. 확인 필요 (구현 단계).

---

## 5. File Changes

| 파일 | 변경 유형 | 상세 |
|------|:---:|------|
| `src/app/page.tsx` | Modify | `getRecentEvents`/`getMonthlyRanking` 제거, `getTodayVote` 추가, "최근 게임"+"이달의 한턱왕" JSX 삭제, MenuGrid 블록 삽입 |
| `src/components/vote/MenuGrid.tsx` | Modify | 투표 후 버튼 문구 `명예의 전당 보기 🏆` → `랭킹 보러가기 🏆` (1줄) |
| `src/app/vote/page.tsx` | Rewrite | 본문을 `redirect('/')`로 대체 |
| `src/components/ui/BottomNav.tsx` | Modify | `navItems` 배열에서 `{ href: '/vote', ... }` 항목 제거 |

**신규 파일 없음**. 컴포넌트 추상화 없음 (YAGNI).

---

## 6. Edge Cases

| Case | Expected Behavior |
|------|-------------------|
| 비로그인 사용자 홈 진입 | 기존 `proxy.ts`/`getCurrentUser` 흐름에 따라 로그인으로 유도. MenuGrid는 user 존재 시에만 렌더 |
| 오늘 이미 투표한 사용자 | `getTodayVote()` 결과로 MenuGrid 초기화 → 선택 메뉴 하이라이트 + "랭킹 보러가기" 버튼 즉시 노출 |
| 투표 중 네트워크 실패 | MenuGrid의 기존 에러 처리 (setError) 재사용 — 추가 작업 없음 |
| `/vote` URL 직접 진입 | `redirect('/')` 서버 302 → 홈으로 |
| 외부 링크가 `/vote?query=...` 형태로 올 경우 | `redirect('/')`는 쿼리 무시하고 홈으로 — 허용 가능한 손실 |
| MenuGrid fixed 버튼이 홈 푸터 콘텐츠 가림 | 홈 래퍼에 `pb-40` 등 여백 추가 (구현 시 육안 확인) |

---

## 7. Testing Strategy

Zero Script QA 방식 — 실행 후 확인:

| # | Test | Method |
|---|------|--------|
| T-1 | 홈에 "최근 게임" 섹션이 없다 | 시각 확인 + DOM grep |
| T-2 | 홈에 "이달의 한턱왕" 섹션이 없다 | 시각 확인 + DOM grep |
| T-3 | 홈에 MenuGrid가 보이고 투표 가능 | 수동 탭 |
| T-4 | 투표 후 "랭킹 보러가기" 버튼 클릭 → /ranking 이동 | 수동 탭 |
| T-5 | 오늘 이미 투표한 계정으로 재진입 → 상태 복원 | 수동 확인 |
| T-6 | `/vote` 직접 접근 → `/`로 리다이렉트 | 주소창 입력 |
| T-7 | BottomNav에 먹픽 탭 없음, 6개 탭 표시 | 시각 확인 |
| T-8 | `/ranking` 페이지의 월간 Top·최근 게임 섹션 정상 | 수동 확인 (회귀) |

---

## 8. Dependencies

| Module | 역할 | 상태 |
|--------|------|:---:|
| `src/app/page.tsx` | 홈 페이지 | 수정 |
| `src/components/vote/MenuGrid.tsx` | 먹픽 UI | 수정 (1줄) |
| `src/app/vote/page.tsx` | 기존 먹픽 페이지 | 리다이렉트로 대체 |
| `src/components/ui/BottomNav.tsx` | 하단 네비 | 수정 |
| `src/lib/actions/vote.ts` | getTodayVote, submitMenuVote | 재사용 |
| `src/lib/actions/ranking.ts` | getMonthlyRanking 등 | 홈에서 호출만 제거 (함수는 /ranking에서 계속 사용) |

---

## 9. Migration & Rollout

- DB 스키마 변경 **없음**
- 기존 투표 데이터 **영향 없음**
- 배포 즉시 모든 사용자에게 일괄 적용. Feature flag 불필요 (변경 범위가 UI/네비 리팩터 수준)

---

## 10. Open Items for Implementation

- [ ] `proxy.ts`에서 비로그인 사용자의 홈 처리 확인 후 MenuGrid 조건부 렌더 여부 결정
- [ ] 홈 최하단 padding 값 결정 (`pb-40` 추정 — 실측 필요)
- [ ] BottomNav 먹픽 탭 제거 시 남은 탭 수 6개 — 아이콘 간격/폰트 크기 육안 점검

---

## 11. Implementation Guide

### 11.1 변경 순서 (권장)

1. `MenuGrid.tsx` CTA 문구 변경 → (영향 범위: /vote 기존 UX — 아직 /vote 페이지가 살아있을 때 먼저 변경해도 사용자에게는 "명예의 전당 → 랭킹" 문구 변경뿐이라 안전)
2. `page.tsx` 리팩터 (섹션 제거 + MenuGrid 삽입)
3. `vote/page.tsx` redirect 적용
4. `BottomNav.tsx` 먹픽 탭 제거
5. QA: T-1 ~ T-8 수행

### 11.2 핵심 코드 스니펫

**MenuGrid.tsx (수정)**
```tsx
// Before
명예의 전당 보기 🏆

// After
랭킹 보러가기 🏆
```

**page.tsx (신규 블록, 기존 2개 section 삭제 후)**
```tsx
import { MenuGrid } from '@/components/vote/MenuGrid'
import { getTodayVote } from '@/lib/actions/vote'

// Promise.all에 추가
const [user, topFortuneMenus, todayVote] = await Promise.all([
  getCurrentUser().catch(() => null),
  getTopFortuneMenus(3).catch(() => []),
  getTodayVote().catch(() => null),
])

// JSX: CTA와 운세 섹션 사이 삽입
{user && (
  <section>
    <div className="mb-3">
      <h2 className="text-lg font-bold">오늘 점심 뭐 먹었어? 🍽️</h2>
      <p className="text-xs text-foreground/40 mt-1">
        {todayVote ? '오늘의 먹픽 완료! 🎉' : '탭해서 먹픽하세요'}
      </p>
    </div>
    <MenuGrid todayVote={todayVote} />
  </section>
)}
```

**vote/page.tsx (전체 대체)**
```tsx
import { redirect } from 'next/navigation'

export default function VotePage() {
  redirect('/')
}
```

**BottomNav.tsx (navItems 수정)**
```tsx
// 삭제
{ href: '/vote', label: '먹픽', icon: '🍽️' },
```

### 11.3 Session Guide

Module Map (단일 세션 권장):

| Module | 파일 | 추정 시간 |
|--------|------|:--:|
| module-1 | MenuGrid.tsx CTA 변경 | 2분 |
| module-2 | page.tsx 리팩터 | 10분 |
| module-3 | vote/page.tsx redirect | 2분 |
| module-4 | BottomNav.tsx 탭 정리 | 2분 |
| module-5 | QA (T-1~T-8) | 10분 |

**전체 단일 세션 권장** — 총 변경량 ~100 라인, 강결합된 변경들이라 분할 시 중간 상태 UX 혼란.

필요 시 세션 분할:
- **Session A** (module-1,2): 홈에 먹픽 도입 — 이 시점에 /vote도 여전히 작동
- **Session B** (module-3,4,5): /vote 리다이렉트 + BottomNav 정리 + QA

---

## 12. Acceptance Criteria (Plan 반영)

| # | Criterion |
|---|-----------|
| AC-1 | 홈 렌더링 시 "최근 게임"/"이달의 한턱왕" 섹션 DOM에 존재하지 않음 |
| AC-2 | 로그인 사용자가 홈 진입 → 메뉴 선택 → 먹픽! 1회 탭으로 투표 저장, 즉시 "랭킹 보러가기" 버튼 표시 |
| AC-3 | 오늘 이미 투표한 사용자가 홈 재진입 → 투표한 메뉴 하이라이트 + "랭킹 보러가기" 버튼 즉시 표시 |
| AC-4 | "랭킹 보러가기" 버튼 탭 → `/ranking` 진입 |
| AC-5 | `/vote` URL 직접 접근 시 홈으로 리다이렉트 |
| AC-6 | BottomNav에 "먹픽" 탭이 보이지 않음 |
| AC-7 | `/ranking`, `/fortune`, `/my`, `/game`, `/pick` 동작 회귀 없음 |

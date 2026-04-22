# home-menu-vote Planning Document

> **Summary**: 홈 화면에 먹픽 통합 — "최근 게임"/"이달의 한턱왕" 섹션 제거 + MenuGrid 이식 + 투표 완료 시 "랭킹 보러가기" CTA
>
> **Project**: lunch-event
> **Version**: 1.0.0
> **Author**: joohui.lee
> **Date**: 2026-04-22
> **Status**: Draft
> **PRD Reference**: `docs/00-pm/home-menu-vote.prd.md`

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 홈의 "최근 게임"/"이달의 한턱왕" 섹션은 `/ranking`과 중복이고, 매일 반복하는 핵심 행동(먹픽)은 탭 이동을 강제해 마찰이 크다 |
| **Solution** | 홈에 MenuGrid를 이식해 1탭 먹픽을 가능케 하고, 중복 섹션 2개를 제거한다. 투표 완료 시 "랭킹 보러가기" CTA로 자연스러운 여정을 제공한다 |
| **Function/UX Effect** | 홈 진입 → (투표 전) 메뉴 선택 → 먹픽! / (투표 후) 선택된 메뉴 강조 + "랭킹 보러가기" 버튼 노출 → /ranking 이동 |
| **Core Value** | 홈이 "오늘의 점심 시작점"으로 단순화되고, 1탭 참여·투표 후 명예의 전당 확인 여정이 매끄럽게 연결된다 |

---

## Context Anchor

| Key | Value |
|-----|-------|
| **WHY** | 홈 중복 섹션 제거 + 핵심 행동(먹픽) 탭 이동 마찰 제거 |
| **WHO** | 매일 점심 후 먹픽을 남기는 사내 구성원 (인증된 사용자) |
| **RISK** | `/vote` 페이지·BottomNav 먹픽 탭과의 역할 중복, MenuGrid `fixed` 버튼과 홈 레이아웃 충돌 |
| **SUCCESS** | 홈 1탭 먹픽, 투표 완료 시 랭킹 CTA 1탭 이동, 홈 정보 밀도 유지 |
| **SCOPE** | 홈(src/app/page.tsx) 리팩터, MenuGrid 재사용, /vote → / 리다이렉트, BottomNav 먹픽 탭 제거 |

---

## 1. Overview

### 1.1 Purpose

홈을 "오늘 뭐 먹었어?" 1탭 진입점으로 재구성하여 매일 반복되는 먹픽 행동의 마찰을 제거하고, 투표 → 랭킹의 자연스러운 여정을 완성한다.

### 1.2 Background

- 현재 홈(`src/app/page.tsx`)은 4개 섹션 (오늘 누가 쏠까 CTA / 최근 게임 / 이달의 한턱왕 / 인기 운세 메뉴)
- 최근 게임 + 이달의 한턱왕은 `/ranking`에서 이미 더 완결된 형태로 제공됨
- 먹픽은 `/vote` 탭 이동 필수 → 매일 2탭 필요
- `src/components/vote/MenuGrid.tsx`는 이미 클라이언트 컴포넌트로 완성되어 있어 재사용 가능

### 1.3 Related Documents

- PRD: `docs/00-pm/home-menu-vote.prd.md`
- 기존 Plan: `docs/01-plan/features/lunch-event.plan.md`

---

## 2. Scope

### 2.1 In Scope

- [ ] 홈에서 "최근 게임" 섹션 제거 (`getRecentEvents` import·호출도 제거)
- [ ] 홈에서 "🏆 이달의 한턱왕" 섹션 제거 (`getMonthlyRanking` import·호출도 제거)
- [ ] 홈에 MenuGrid 이식 + 제목 "오늘 점심 뭐 먹었어?" 블록 추가
- [ ] `getTodayVote` 호출 + MenuGrid에 `todayVote` prop 전달
- [ ] MenuGrid의 투표 후 CTA 문구를 "랭킹 보러가기"로 변경 (또는 prop으로 커스터마이즈)
- [ ] `/vote` 경로를 `/`로 리다이렉트 (URL 호환 유지)
- [ ] BottomNav에서 `먹픽` 탭 항목 제거
- [ ] `src/app/vote/page.tsx` 는 `redirect('/')` 로 대체 (페이지 파일은 유지)

### 2.2 Out of Scope

- MenuGrid 내부 UX 변경 (카테고리·버튼·투표 로직)
- `submitMenuVote`/`getTodayVote` 서버 액션 수정
- 투표 후 메뉴 변경 허용 (정책 유지: 하루 1회)
- 로그인 유도 로직 변경 (기존 흐름 그대로)
- 🔮 인기 운세 메뉴 섹션 / 🎲 오늘 누가 쏠까 CTA 변경

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Source |
|----|-------------|--------|
| FR-01 | 홈 진입 시 로그인 사용자면 MenuGrid 노출, 오늘 투표 이력 반영 | PRD FR-03, FR-04, FR-05 |
| FR-02 | 투표 후 "랭킹 보러가기" 버튼 → `/ranking` 이동 | PRD FR-07 |
| FR-03 | 홈에서 "최근 게임"/"🏆 이달의 한턱왕" 섹션 완전 제거 | PRD FR-01, FR-02 |
| FR-04 | `/vote` → `/` 리다이렉트 | PRD FR-08, Open Q 3.1-A |
| FR-05 | BottomNav 먹픽 탭 제거 (남는 탭: 홈/게임/뽑기/운세/랭킹/MY) | PRD Open Q 3.1-A |

### 3.2 Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-01 | 기존 `submitMenuVote` / `getTodayVote` 서버 액션 재사용 (DB 스키마 변경 無) |
| NFR-02 | MenuGrid는 기존 `'use client'` 그대로 — 홈은 서버 컴포넌트라 단순 삽입 가능 |
| NFR-03 | MenuGrid `fixed bottom-16` 버튼이 BottomNav(`h-16`)와 겹치지 않도록 유지 |
| NFR-04 | 홈 `Promise.all` 호출 수 4개 → 2개 (user + fortuneMenus + todayVote = 3개)로 축소되어 로딩 성능 소폭 향상 |
| NFR-05 | `/vote` 페이지 파일은 유지하고 내부만 `redirect('/')` — 외부 즐겨찾기/링크 호환 |

### 3.3 Acceptance Criteria

| # | Criterion |
|---|-----------|
| AC-1 | 홈 렌더링 시 "최근 게임"/"이달의 한턱왕" 섹션 DOM에 존재하지 않음 |
| AC-2 | 로그인 사용자가 홈 진입 → 메뉴 선택 → 먹픽! 1회 탭으로 투표 저장, 즉시 "랭킹 보러가기" 버튼 표시 |
| AC-3 | 오늘 이미 투표한 사용자가 홈 재진입 → 투표한 메뉴 하이라이트 + "랭킹 보러가기" 버튼 즉시 표시 |
| AC-4 | "랭킹 보러가기" 버튼 탭 → `/ranking` 진입 |
| AC-5 | `/vote` URL 직접 접근 시 홈으로 리다이렉트 |
| AC-6 | BottomNav에 "먹픽" 탭이 보이지 않음 |
| AC-7 | `/ranking`, `/fortune`, `/my`, `/game`, `/pick` 동작 회귀 없음 |

---

## 4. Design Decisions

### 4.1 Open Question 결정 (PRD #3.1)

| Option | 선택 | 근거 |
|--------|:----:|------|
| A. `/vote` → `/` 리다이렉트 + BottomNav 먹픽 탭 제거 | ✅ | URL 호환성 유지, BottomNav 중복 제거, 구현 간단 |
| B. `/vote` 라우트 삭제 | — | 외부 링크/즐겨찾기 깨짐 리스크 |
| C. 둘 다 유지 | — | 중복 UX, 유지비용 |

> **변경 가능**: B/C를 원하시면 Design 단계에서 조정.

### 4.2 CTA 문구 통일

기존 MenuGrid는 투표 후 `명예의 전당 보기 🏆`를 표시한다. 사용자 요청 원문 "랭킹보러가기"를 반영해 **`랭킹 보러가기 🏆`**로 변경한다.

- 구현 방식: MenuGrid 컴포넌트의 하드코딩된 문구를 **직접 변경**한다 (prop으로 주입하는 건 over-engineering — 유일 사용처가 홈이 됨)

### 4.3 홈 섹션 순서

```
1. Header (로그인 인사)
2. 🎲 오늘 누가 쏠까? CTA
3. 🍽️ 오늘 점심 뭐 먹었어? (MenuGrid)  ← NEW
4. 🔮 인기 운세 메뉴 Top 3
```

"최근 게임", "이달의 한턱왕" 제거. MenuGrid를 3번째 위치에 배치.

---

## 5. Implementation Plan

### 5.1 작업 순서

1. **MenuGrid CTA 문구 변경** (`src/components/vote/MenuGrid.tsx`): `명예의 전당 보기 🏆` → `랭킹 보러가기 🏆`
2. **홈 리팩터링** (`src/app/page.tsx`):
   - `getRecentEvents`, `getMonthlyRanking` import + 호출 제거
   - `getTodayVote` import + 호출 추가
   - "최근 게임", "이달의 한턱왕" JSX 블록 제거
   - MenuGrid 삽입 (제목 + 그리드)
3. **`/vote` 리다이렉트** (`src/app/vote/page.tsx`): 본문을 `redirect('/')` 한 줄로 축소
4. **BottomNav 정리** (`src/components/ui/BottomNav.tsx`): `navItems`에서 `/vote` 항목 삭제
5. **QA**: AC-1~7 수동 확인

### 5.2 예상 변경 규모

| 파일 | 동작 | 라인 영향 |
|------|------|:--:|
| `src/app/page.tsx` | 수정 (섹션 2개 제거, MenuGrid 추가) | -60 ~ -80, +15 |
| `src/components/vote/MenuGrid.tsx` | 문구 1곳 수정 | ±1 |
| `src/app/vote/page.tsx` | 전체 대체 | -23, +5 |
| `src/components/ui/BottomNav.tsx` | 배열 1항목 삭제 | -1 |

총 예상 diff: ~100 라인 미만.

---

## 6. Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|------|:--:|:--:|------------|
| MenuGrid `fixed bottom-16` 버튼이 홈 기존 콘텐츠와 겹침 | Medium | Low | 구현 후 육안 확인, 필요 시 홈 하단 padding 조정 |
| 비로그인 상태에서 MenuGrid 노출 시 `submitMenuVote` 401 | High | Low | MenuGrid는 `user` 조건부 렌더 or `getTodayVote`의 기존 인증 처리 흐름 유지 |
| `/vote` 리다이렉트가 네비게이션 히스토리 이상 유발 | Low | Low | `redirect()`는 서버 측 302 — 정상 동작 확인 |
| BottomNav 먹픽 탭 제거 후 기존 사용자 혼란 | Low | Medium | 홈 상단에 바로 메뉴 그리드가 노출되므로 자연스럽게 유도 |

---

## 7. Success Criteria

| Metric | Target |
|--------|--------|
| 홈 → 먹픽 탭 수 | 현재 2탭 → **1탭** |
| 홈 컴포넌트 코드 | "최근 게임"+"이달의 한턱왕" 관련 라인 **0** (import 포함) |
| MenuGrid 재수정 | CTA 문구 1줄 외 **변경 없음** |
| 회귀 영향 | `/ranking` 월간 Top/최근 게임 섹션 정상 동작 유지 |
| 기능 QA | AC-1 ~ AC-7 모두 통과 |

---

## 8. Next Steps

1. **Design** (`/pdca design home-menu-vote`): 홈 레이아웃 상세 설계, 3가지 아키텍처 옵션 비교, Session Guide 생성
2. **Do**: Implementation Plan 5.1 순서 따라 구현
3. **Check**: AC 기준 Gap 분석
4. **Report**: 완료 보고서

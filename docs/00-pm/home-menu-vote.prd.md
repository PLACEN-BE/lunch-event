# PRD: home-menu-vote (홈 화면 먹픽 통합)

> PM Analysis | 2026-04-22
> Feature: 홈 화면에서 바로 오늘의 메뉴 투표(먹픽) 가능, 투표 완료 시 랭킹 보러가기 버튼 노출
> App: lunch-event ("오늘 누가 쏠까?" — 사내 점심 복불복 게임)

---

## Executive Summary

| 관점 | 요약 |
|------|------|
| **Problem** | 홈에서 메인 액션까지 탭 이동이 필요하고("먹픽" 탭 진입), 홈 정보 섹션("최근 게임", "이달의 한턱왕")은 /ranking에 이미 있어 중복·체류 가치가 낮다 |
| **Solution** | 홈 상단에 MenuGrid를 이식해 앱 열자마자 먹픽 가능하게 하고, 중복 정보 섹션 2개를 제거해 홈을 "오늘의 점심 시작점"으로 단순화한다 |
| **Functional UX** | 홈 진입 → 오늘 먹은 메뉴 탭 → 먹픽! → "랭킹 보러가기" 버튼 표출 → /ranking 이동 |
| **Core Value** | 홈 체류 목적 명확화, 1탭 먹픽으로 참여 마찰 감소, 투표 → 명예의 전당 확인의 자연스러운 여정 완성 |

---

## Context Anchor

| Key | Value |
|-----|-------|
| **WHY** | 홈의 "최근 게임"/"이달의 한턱왕"은 /ranking 중복이라 체류 가치가 낮고, 핵심 행동인 먹픽은 탭 이동을 강제해 마찰이 크다 |
| **WHO** | 매일 점심 후 먹픽을 남기는 사내 구성원 (인증된 사용자). 비로그인 사용자는 로그인 유도 |
| **RISK** | 기존 /vote 탭·페이지와의 역할 중복, 이미 먹픽한 사용자의 홈 노출 컨텐츠 공백, BottomNav 정합성 |
| **SUCCESS** | 홈 1탭 내 먹픽 가능, 투표 완료 시 명확한 다음 행동 제시(랭킹), 홈 정보 밀도 유지 또는 향상 |
| **SCOPE** | 홈(src/app/page.tsx) 재구성, MenuGrid 재사용, 투표 상태 기반 CTA 토글. /vote 페이지와 BottomNav 먹픽 탭의 처리 방향은 구현 시 확정 |

---

## 1. Problem & Background

### 1.1 현황

홈 화면(`src/app/page.tsx`)은 현재 4개 섹션으로 구성되어 있다:

1. `🎲 오늘 누가 쏠까?` CTA → /game
2. `최근 게임` 섹션 (최근 이벤트 리스트)
3. `🏆 이달의 한턱왕` 섹션 (월별 Top 3 + 전체보기 링크)
4. `🔮 인기 운세 메뉴` 섹션 (운세 Top 3)

### 1.2 문제

- **홈 핵심 행동 부재**: "오늘 뭐 먹었는지 먹픽하기"라는 매일 반복 행동이 홈에 없고 `/vote` 탭 이동이 필수
- **중복 정보**: "최근 게임", "이달의 한턱왕"은 `/ranking` 페이지에서 더 완결된 형태로 제공됨 → 홈 공간 낭비
- **투표 후 여정 단절 가능성**: 현재 `/vote`에서 먹픽 후 "명예의 전당 보기" 버튼이 있는데, 홈 이관 시 이 자연스러운 흐름을 유지해야 함

---

## 2. Requirements

### 2.1 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|:--------:|
| FR-01 | 홈에서 "최근 게임" 섹션 삭제 | P0 |
| FR-02 | 홈에서 "🏆 이달의 한턱왕" 섹션 삭제 | P0 |
| FR-03 | 홈에 MenuGrid 기반 먹픽 UI 추가 (카테고리 그리드 + 먹픽 버튼) | P0 |
| FR-04 | 오늘 투표 이력이 있으면 선택된 메뉴 표시 + "랭킹 보러가기" 버튼 노출 | P0 |
| FR-05 | 오늘 투표 이력이 없으면 메뉴 선택 → "먹픽!" 버튼 → 제출 → 상태 전환 | P0 |
| FR-06 | 비로그인 사용자 홈 진입 시 로그인 유도 (현재 정책 준수) | P0 |
| FR-07 | "랭킹 보러가기" 버튼 탭 시 `/ranking` 이동 | P0 |
| FR-08 | `/vote` 페이지와 BottomNav "먹픽" 탭의 처리 | P1 (하단 3.1 참조) |

### 2.2 Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-01 | 기존 `submitMenuVote` / `getTodayVote` 서버 액션 재사용 (DB 스키마 변경 없음) |
| NFR-02 | MenuGrid는 `client component`이므로 홈에서도 동일하게 동작해야 함 |
| NFR-03 | MenuGrid의 fixed 하단 버튼이 BottomNav와 겹치지 않게 여백 조정 (현재 `bottom-16`) |
| NFR-04 | 홈 로딩 성능 유지 (getTodayVote 단일 쿼리 추가만 허용) |

### 2.3 Out of Scope

- 먹픽 UX 자체 변경 (기존 MenuGrid 재사용)
- 운세 / 오늘 누가 쏠까 CTA 섹션 변경
- 랭킹/투표 도메인 데이터 모델 변경

---

## 3. Open Questions (Design 단계 결정)

### 3.1 `/vote` 페이지 처리 (Priority: P1)

홈에 먹픽이 있으면 `/vote`는 중복이 된다. 3가지 옵션:

| Option | 설명 | 장점 | 단점 |
|--------|------|------|------|
| A. `/vote` → `/` 리다이렉트 | BottomNav 탭은 유지, URL 입력/외부 링크는 홈으로 | 외부 공유 링크 호환 | BottomNav 탭이 홈과 동일 위치 |
| B. BottomNav "먹픽" 탭 제거 + `/vote` 라우트 삭제 | 가장 깔끔 | 외부 링크 404 | 기존 즐겨찾기/히스토리 깨짐 |
| C. 둘 다 유지 (홈/vote 모두 먹픽 가능) | 점진 전환 | 호환성 | 중복 UX, 두 곳 유지비용 |

**권장: A** (URL 호환 + 탭에서 중복 아이콘 제거 혹은 라벨만 "홈"처럼 변경)

### 3.2 홈 공백 처리

"최근 게임" + "이달의 한턱왕" 2개 섹션이 빠지면 홈이 비어 보일 수 있다. 먹픽 UI가 들어오지만, MenuGrid만으로 충분히 채워지는지 시각적 밀도 확인 필요 (디자인 단계에서 검토).

### 3.3 투표 완료 후 메뉴 변경 허용 여부

현재 `/vote`에선 하루 1회 투표 후 변경 불가. 홈에서도 동일 정책 유지. 단, 메뉴 오탭 시 수정 요구가 나올 수 있음 → MVP는 동일 정책, 추후 검토.

---

## 4. User Flow

### 4.1 첫 진입 (투표 전)
```
홈 진입
  ↓
오늘 뭐 먹었어? [메뉴 그리드]
  ↓ 메뉴 탭 (선택 표시)
  ↓ 먹픽! 버튼 탭
  ↓ submitMenuVote 호출
  ↓
선택된 메뉴 표시 + "랭킹 보러가기" 버튼
```

### 4.2 재진입 (오늘 이미 투표)
```
홈 진입
  ↓ getTodayVote 결과 있음
  ↓
선택된 메뉴 하이라이트 + "랭킹 보러가기" 버튼 바로 노출
  ↓ 탭
/ranking
```

---

## 5. Success Criteria

| Metric | Target |
|--------|--------|
| 홈에서 먹픽까지 탭 수 | 현재 2탭(하단 "먹픽" 탭 → 메뉴 선택) → **1탭(메뉴 선택 1회)** |
| "최근 게임" + "이달의 한턱왕" 코드 | 홈 컴포넌트에서 **완전 제거** |
| 재사용률 | MenuGrid 컴포넌트 **재수정 없이** 홈에 배치 |
| 기능 회귀 | `/ranking`, `/fortune`, `/my` 동작 **영향 없음** |
| 투표 → 랭킹 여정 | 투표 완료 후 **CTA 버튼 1회 탭**으로 `/ranking` 도달 |

---

## 6. Dependencies

| Module | 역할 | 상태 |
|--------|------|------|
| `src/app/page.tsx` | 홈 페이지 — 섹션 제거 + MenuGrid 이식 | 수정 대상 |
| `src/components/vote/MenuGrid.tsx` | 먹픽 UI — 그대로 재사용 | 재사용 |
| `src/lib/actions/vote.ts` | `getTodayVote`, `submitMenuVote` | 재사용 |
| `src/app/vote/page.tsx` | 기존 먹픽 페이지 | 3.1 결정 후 처리 |
| `src/components/ui/BottomNav.tsx` | 먹픽 탭 | 3.1 결정 후 처리 |
| `src/lib/actions/ranking.ts` | `getMonthlyRanking`, `getRecentEvents` | 홈에서 호출 제거 (함수 자체는 /ranking에서 계속 사용) |

---

## 7. Next Steps

1. **Plan** (`/pdca plan home-menu-vote`): 3.1 옵션 확정 + 구현 범위·순서 정의
2. **Design** (`/pdca design home-menu-vote`): 홈 레이아웃 구조, MenuGrid 위치, 버튼 여백 설계
3. **Do**: 홈 리팩터링 → /vote 처리 → BottomNav 조정 → QA

---

## 8. Assumptions Log

| # | Assumption | Validation |
|---|-----------|-----------|
| A1 | MenuGrid `fixed bottom-16` 위치가 홈에서도 BottomNav와 정상 공존 | 구현 시 반영 후 육안 확인 |
| A2 | 홈 한 화면에 (CTA + MenuGrid + 운세 Top 3) 동시 노출 가능 | 디자인 단계 검토 |
| A3 | 비로그인 사용자는 이미 로그인 페이지로 리다이렉트됨 (현 동작 유지) | `getCurrentUser()` 조건부 렌더로 처리 |
| A4 | "랭킹 보러가기" 문구는 기존 "명예의 전당 보기 🏆"와 동등 처리 | 유저 원문 표현 따라 "랭킹 보러가기"로 통일 제안 |

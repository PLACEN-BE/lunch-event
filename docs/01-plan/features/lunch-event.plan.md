# lunch-event Planning Document

> **Summary**: 사내 점심 복불복 게임 + 한턱 히스토리 명예의 전당 웹앱
>
> **Project**: lunch-event
> **Author**: joohui.lee
> **Date**: 2026-04-10
> **Status**: Draft
> **PRD Reference**: `docs/00-pm/lunch-event.prd.md`

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 점심 식사 시 "누가 쏠까" 결정이 매번 어색하고, 한턱 이력이 관리되지 않아 불공정 인식이 발생한다 |
| **Solution** | 카드 플립/사다리타기 복불복 게임 + 한턱 히스토리 랭킹을 결합한 사내 전용 웹앱 (Next.js + Supabase) |
| **Function/UX Effect** | 인상적인 애니메이션으로 게임의 재미를 극대화하고, 투명한 랭킹 시스템으로 공정성을 확보한다 |
| **Core Value** | 공정하고 재미있는 결정 과정 + 투명한 이력 관리로 팀 유대감 강화 |

---

## Context Anchor

| Key | Value |
|-----|-------|
| **WHY** | "누가 쏠까" 결정의 어색함 해소 + 한턱 이력 비가시성 문제 해결 |
| **WHO** | 같은 회사에서 함께 점심 먹는 3~15명 규모 팀/그룹 |
| **RISK** | 초기 사용자 확보 실패 (팀원들이 귀찮아서 안 씀) |
| **SUCCESS** | 자기 팀 5명 이상 일주일간 매일 사용, 게임 실행 5회+/일, 히스토리 기록 5건+/주 |
| **SCOPE** | MVP: 회원관리 + 카드플립 + 사다리타기 + 한턱 히스토리 (월간/누적 랭킹) |

---

## 1. Overview

### 1.1 Purpose

사내 점심 식사 시 "오늘 누가 쏠까"를 재미있고 공정하게 결정하는 복불복 게임 웹앱.
게임 결과를 자동 기록하여 한턱 히스토리 랭킹을 제공하고, 명예의 전당으로 팀 유대감을 강화한다.

### 1.2 Background

- 매일 반복되는 눈치 게임 / 가위바위보에 팀원들이 질려함
- "저번에 내가 쐈는데..." 분쟁 — 기억에 의존하는 불투명한 이력
- 기존 복불복 앱(행운 사다리타기, Random GO 등)은 히스토리/팀 관리 기능이 없음
- 시각적으로 임팩트 있는 UI + 히스토리 결합 제품이 시장에 부재

### 1.3 Related Documents

- PRD: `docs/00-pm/lunch-event.prd.md`
- User Stories: PRD Section 5.2 (18개 스토리, INVEST 검증 완료)
- Data Model: PRD Section 5.5

---

## 2. Scope

### 2.1 In Scope (MVP)

- [ ] **회원 관리**: ID(고유값) + 닉네임 기반 가입/로그인 (비밀번호 없음)
- [ ] **카드 플립 게임**: N명 중 M명 뽑기, 3D 카드 뒤집기 애니메이션
- [ ] **사다리타기 게임**: N명 중 M명 뽑기, 사다리 진행 애니메이션
- [ ] **게임 모드 선택**: 카드 플립 / 사다리타기 중 선택
- [ ] **한턱 히스토리**: 게임 결과 자동 저장
- [ ] **월간 랭킹**: 이번 달 가장 많이 쏜 사람 TOP 10
- [ ] **전체 누적 랭킹**: 가입 이후 전체 한턱 횟수 랭킹
- [ ] **명예의 전당**: 랭킹 보드 (왕관/메달 아이콘)
- [ ] **반응형 UI**: 모바일 우선 (360px~), 데스크탑 지원

### 2.2 Out of Scope

- 비밀번호 / 이메일 / 소셜 로그인
- 팀/그룹 관리 (v1.1 이후)
- 룰렛 등 추가 게임 모드
- 푸시 알림 / PWA
- 통계 대시보드 (월별 트렌드 차트)
- 관리자 기능

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|:--------:|--------|
| FR-01 | ID(영문/숫자 4~20자, 고유값)와 닉네임(2~10자)으로 가입 | High | Pending |
| FR-02 | ID만 입력하여 로그인 (비밀번호 없음) | High | Pending |
| FR-03 | 첫 로그인 시 닉네임 설정 필수 | High | Pending |
| FR-04 | 참여자 이름 입력 (2~20명) | High | Pending |
| FR-05 | 전체 인원 중 뽑을 인원 수 설정 (1~N-1명) | High | Pending |
| FR-06 | 카드 플립 애니메이션으로 당첨자 공개 | High | Pending |
| FR-07 | 사다리타기 애니메이션으로 당첨자 공개 | High | Pending |
| FR-08 | 게임 모드(카드/사다리) 선택 기능 | High | Pending |
| FR-09 | 게임 완료 후 결과 자동 히스토리 저장 | High | Pending |
| FR-10 | 월간 한턱 랭킹 (이번 달 TOP 10) | High | Pending |
| FR-11 | 전체 누적 한턱 랭킹 (가입 이후 전체) | High | Pending |
| FR-12 | 개인별 한턱 횟수 확인 | Medium | Pending |
| FR-13 | 이전에 함께한 멤버 목록 불러오기 | Medium | Pending |
| FR-14 | 결과 화면 축하/위로 이펙트 (confetti 등) | Medium | Pending |
| FR-15 | 닉네임 변경 기능 | Low | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Performance | 게임 애니메이션 60fps | Chrome DevTools Performance |
| Performance | 페이지 로드 < 2초 (LCP) | Lighthouse |
| Responsive | 모바일 우선 (360px~), 데스크탑 지원 | 브라우저 테스트 |
| Security | Supabase RLS 적용 | RLS 정책 검증 |
| Security | XSS 방지 (Next.js 기본 이스케이핑) | 코드 리뷰 |
| Browser | Chrome 90+, Safari 15+, Samsung Internet 18+ | 크로스 브라우저 테스트 |
| Randomness | crypto.getRandomValues 기반 공정한 랜덤 | 알고리즘 검증 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] 모든 High 우선순위 기능 요구사항 구현 완료
- [ ] 카드 플립/사다리타기 애니메이션 60fps 동작
- [ ] Supabase RLS 정책 적용 및 검증
- [ ] 모바일(iPhone SE ~ iPhone 16) 반응형 동작 확인
- [ ] 게임 결과 → 히스토리 자동 저장 정상 동작
- [ ] 월간/누적 랭킹 정확성 검증

### 4.2 Quality Criteria

- [ ] Lighthouse Performance 90+
- [ ] Zero TypeScript 컴파일 에러
- [ ] Zero ESLint 에러
- [ ] 빌드 성공 (next build)
- [ ] 주요 시나리오 수동 테스트 통과 (PRD TS-01 ~ TS-10)

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|:------:|:----------:|------------|
| 초기 사용자 확보 실패 (팀원이 안 씀) | High | Medium | 본인 팀에서 직접 시연, 3초 가입으로 진입 장벽 최소화 |
| 모바일 애니메이션 성능 이슈 (버벅임) | High | Medium | CSS 기반 GPU 가속 우선, 저사양 기기 테스트 |
| ID만 인증 시 남의 계정 도용 | Medium | Low | 사내 도구 특성상 리스크 낮음, 필요 시 비밀번호 추가 가능한 구조로 설계 |
| 지속 사용 동기 부족 (금방 질림) | Medium | Medium | 명예의 전당 경쟁 심리 자극, 다양한 게임 모드 추가 예정 |
| Supabase Free Tier 한도 초과 | Low | Low | 사내 규모(~200명)에서 여유, 모니터링 설정 |

---

## 6. Impact Analysis

> Greenfield 프로젝트이므로 기존 소비자/코드 경로 없음.

### 6.1 Changed Resources

| Resource | Type | Change Description |
|----------|------|--------------------|
| users 테이블 | DB Table | 새로 생성 (id, user_id, nickname, created_at) |
| events 테이블 | DB Table | 새로 생성 (id, game_mode, created_by, created_at) |
| event_participants 테이블 | DB Table | 새로 생성 (id, event_id, user_id, is_payer) |
| payer_rankings 뷰 | DB View | 새로 생성 (랭킹 조회용) |

### 6.2 Current Consumers

해당 없음 (greenfield)

### 6.3 Verification

- [ ] Supabase 마이그레이션 스크립트 검증
- [ ] RLS 정책 적용 확인
- [ ] payer_rankings 뷰 쿼리 정확성 확인

---

## 7. Architecture Considerations

### 7.1 Project Level Selection

| Level | Characteristics | Recommended For | Selected |
|-------|-----------------|-----------------|:--------:|
| **Starter** | Simple structure | Static sites, portfolios | ☐ |
| **Dynamic** | Feature-based modules, BaaS integration | Web apps with backend, fullstack apps | ☑ |
| **Enterprise** | Strict layer separation, microservices | High-traffic, complex architectures | ☐ |

### 7.2 Key Architectural Decisions

| Decision | Options | Selected | Rationale |
|----------|---------|----------|-----------|
| Framework | Next.js / React / Vue | **Next.js 15 (App Router)** | 서버 컴포넌트로 랭킹 SSR + 클라이언트 컴포넌트로 게임 애니메이션 |
| Styling | Tailwind / CSS Modules / styled-components | **Tailwind CSS** | 유틸리티 기반 빠른 UI 개발, 반응형 지원 우수 |
| Animation | Framer Motion / CSS / GSAP | **Framer Motion** | React 친화적, 카드 플립 3D + 사다리 애니메이션 구현에 최적 |
| State Management | Context / Zustand / Jotai | **Zustand** | 게임 상태 관리에 가볍고 직관적 |
| Backend | Supabase / bkend.ai / Custom | **Supabase** | Auth + DB + RLS 통합, 사용자 요구사항 |
| Deployment | Vercel / Netlify | **Vercel** | Next.js 최적화, Free Tier |

### 7.3 Folder Structure

```
Selected Level: Dynamic

src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home (대시보드)
│   ├── login/page.tsx            # 로그인/가입
│   ├── game/
│   │   ├── page.tsx              # 게임 설정 (참여자/모드 선택)
│   │   ├── card-flip/page.tsx    # 카드 플립 게임
│   │   └── ladder/page.tsx       # 사다리타기 게임
│   └── ranking/
│       └── page.tsx              # 명예의 전당 (월간/누적)
├── components/
│   ├── ui/                       # 공통 UI 컴포넌트
│   ├── game/                     # 게임 관련 컴포넌트
│   │   ├── CardFlip.tsx
│   │   ├── Ladder.tsx
│   │   ├── ParticipantInput.tsx
│   │   └── ResultScreen.tsx
│   └── ranking/                  # 랭킹 관련 컴포넌트
│       ├── RankingBoard.tsx
│       └── RankingCard.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Supabase 클라이언트
│   │   ├── server.ts             # Supabase 서버 클라이언트
│   │   └── middleware.ts         # Auth 미들웨어
│   ├── game/
│   │   ├── random.ts             # crypto.getRandomValues 기반 랜덤
│   │   └── engine.ts             # 게임 로직 (뽑기 알고리즘)
│   └── utils.ts                  # 공통 유틸
├── stores/
│   └── game-store.ts             # Zustand 게임 상태
└── types/
    └── index.ts                  # 타입 정의
```

---

## 8. Convention Prerequisites

### 8.1 Existing Project Conventions

- [ ] `CLAUDE.md` — 생성 필요
- [ ] ESLint configuration — Next.js 기본 설정 사용
- [ ] Prettier configuration — 생성 필요
- [ ] TypeScript configuration — Next.js 기본 `tsconfig.json`

### 8.2 Conventions to Define/Verify

| Category | To Define | Priority |
|----------|-----------|:--------:|
| **Naming** | 컴포넌트: PascalCase, 파일: kebab-case 또는 PascalCase, 변수: camelCase | High |
| **Folder structure** | 위 7.3절 구조 따름 | High |
| **Import order** | react → next → 외부 → 내부 → types → styles | Medium |
| **Environment variables** | 아래 8.3절 참조 | High |

### 8.3 Environment Variables Needed

| Variable | Purpose | Scope | To Be Created |
|----------|---------|-------|:-------------:|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | Client | ☐ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anonymous Key | Client | ☐ |

---

## 9. Next Steps

1. [ ] Design 문서 작성 (`/pdca design lunch-event`)
2. [ ] Supabase 프로젝트 생성 및 환경변수 설정
3. [ ] Next.js 프로젝트 초기화
4. [ ] 구현 시작 (`/pdca do lunch-event`)

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-10 | Initial draft (PRD 기반, Checkpoint 1-2 반영) | joohui.lee |

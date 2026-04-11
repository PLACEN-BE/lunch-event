# PRD: profile-edit (프로필 수정 탭)

> PM Agent Team Analysis | 2026-04-11
> Feature: 프로필 수정 탭 — 사진 업로드(200MB), 닉네임 수정, 마이페이지 BottomNav 통합
> App: lunch-event ("오늘 누가 쏠까?" — 사내 점심 복불복 게임)

---

## Executive Summary

| 관점 | 요약 |
|------|------|
| **Problem** | 현재 사용자 프로필 조회/수정 기능이 전무하며, 아바타 없이 닉네임만 표시되어 사내 앱으로서 정체성이 약하다 |
| **Solution** | BottomNav 4번째 탭(마이페이지)을 추가하고, 프로필 사진 업로드(200MB)와 닉네임 수정이 가능한 프로필 편집 화면을 구현한다 |
| **Functional UX** | 프로필 사진 탭 → 사진 선택/촬영 → 업로드 프로그레스 → 크롭/미리보기 → 저장 완료, 닉네임 인라인 수정 |
| **Core Value** | 사내 구성원 간 시각적 식별성 강화, 랭킹/게임 결과에서 아바타 노출로 앱 활력 증대 |

---

## Part 1: Discovery Analysis (pm-discovery)

### 1.1 Five-Step Discovery Chain

#### Step 1: Brainstorm — Opportunity Space

| # | Opportunity | Category |
|---|-------------|----------|
| O1 | 사용자들이 서로를 사진으로 식별하지 못한다 | Identity |
| O2 | 프로필 수정 경로가 없어 가입 시 입력한 닉네임을 영원히 쓴다 | Usability |
| O3 | 랭킹/게임 결과에 아바타가 없어 시각적 재미가 부족하다 | Engagement |
| O4 | 마이페이지가 없어 내 활동 이력을 확인할 수 없다 | Self-service |
| O5 | 사진 업로드 기능이 없어 이후 확장(팀 로고, 리액션 등)이 불가하다 | Platform Foundation |

#### Step 2: Assumptions

| # | Assumption | Type |
|---|-----------|------|
| A1 | 사내 직원들은 자신의 사진을 프로필로 설정하길 원한다 | Desirability |
| A2 | 200MB 이하 파일 업로드는 Supabase Storage로 처리 가능하다 | Feasibility |
| A3 | BottomNav에 4번째 탭을 추가해도 UX가 깨지지 않는다 | Usability |
| A4 | 프로필 사진이 게임/랭킹에 노출되면 참여도가 올라간다 | Viability |
| A5 | 사용자는 닉네임을 가끔 변경하고 싶어한다 | Desirability |
| A6 | 모바일 환경에서 대용량 사진 업로드 시 진행 표시가 필수다 | Usability |

#### Step 3: Prioritize (Impact x Risk Matrix)

| Assumption | Impact (1-5) | Risk (1-5) | Score | Priority |
|-----------|:---:|:---:|:---:|:---:|
| A2 (200MB Supabase Storage) | 5 | 4 | 20 | **P0 — 검증 필수** |
| A6 (업로드 프로그레스 UX) | 4 | 4 | 16 | **P0 — 검증 필수** |
| A1 (사진 설정 욕구) | 4 | 2 | 8 | P1 |
| A3 (BottomNav 4탭) | 3 | 3 | 9 | P1 |
| A4 (참여도 상승) | 4 | 2 | 8 | P2 |
| A5 (닉네임 변경) | 3 | 1 | 3 | P2 |

#### Step 4: Experiments

| Assumption | Experiment | Success Criteria |
|-----------|-----------|-----------------|
| A2 | Supabase Storage에 200MB 파일 업로드 POC | 90초 이내 업로드 완료, URL 정상 반환 |
| A6 | XMLHttpRequest/fetch + progress event 기반 프로그레스 바 프로토타입 | 실시간 % 표시, 취소 가능 |
| A3 | BottomNav 4탭 목업 테스트 | 아이콘/레이블 가독성 유지, 탭 터치 영역 >= 44px |

#### Step 5: Opportunity Solution Tree (OST)

```
[Outcome] 사용자 프로필 완성도를 높여 사내 앱 정체성과 참여도 강화
├── [Opportunity] O1: 사진으로 서로 식별
│   ├── [Solution] S1: 프로필 사진 업로드 (200MB, Supabase Storage)
│   │   ├── [Experiment] Supabase Storage 200MB POC
│   │   └── [Experiment] 모바일 업로드 프로그레스 프로토타입
│   └── [Solution] S2: 기본 아바타 (이니셜 기반 자동 생성)
├── [Opportunity] O2: 닉네임 수정 불가
│   └── [Solution] S3: 마이페이지 내 닉네임 인라인 수정
├── [Opportunity] O3: 랭킹에 아바타 미노출
│   └── [Solution] S4: RankingCard, GameResult에 아바타 표시
└── [Opportunity] O4: 내 활동 확인 불가
    └── [Solution] S5: 마이페이지 내 게임 이력 요약 (Phase 2 확장)
```

### 1.2 Top 3 Opportunities with Solutions

| Rank | Opportunity | Primary Solution | Impact |
|------|------------|-----------------|--------|
| 1 | O1: 사진 식별 | S1: 프로필 사진 업로드 (200MB) | 사내 구성원 시각적 식별, 앱 생동감 |
| 2 | O2: 닉네임 수정 불가 | S3: 닉네임 인라인 수정 | 사용자 자율성 확보 |
| 3 | O3: 랭킹 아바타 미노출 | S4: 기존 컴포넌트 아바타 통합 | 랭킹/결과 화면 재미 요소 |

---

## Part 2: Strategy Analysis (pm-strategy)

### 2.1 JTBD 6-Part Value Proposition

| Part | Content |
|------|---------|
| **1. When** | 사내 점심 게임 앱을 열어 내 프로필을 확인하거나 다른 사람의 랭킹을 볼 때 |
| **2. I want to** | 내 프로필 사진과 닉네임을 설정/수정하고 싶다 |
| **3. So I can** | 다른 동료들이 나를 쉽게 알아볼 수 있게 하고, 내 정체성을 표현할 수 있다 |
| **4. Functional Job** | 사진 업로드 (최대 200MB), 닉네임 수정, 프로필 미리보기 |
| **5. Emotional Job** | 내 프로필이 잘 꾸며져 있다는 만족감, 랭킹에 내 얼굴이 뜨는 재미 |
| **6. Social Job** | 동료들 사이에서 "아, 그 사람!" 하고 식별되는 소속감 |

### 2.2 Lean Canvas

| Section | Content |
|---------|---------|
| **Problem** | 1) 프로필 수정 불가 2) 아바타 없어 식별 어려움 3) 마이페이지 부재 |
| **Customer Segments** | 사내 점심 게임 앱 사용 직원 (전 직원 대상, 소규모 조직) |
| **Unique Value Proposition** | "한눈에 알아보는 점심 메이트" — 사진으로 동료 식별, 마이페이지로 내 한턱 이력 관리 |
| **Solution** | 프로필 사진 업로드(200MB), 닉네임 수정, BottomNav 마이페이지 탭 추가 |
| **Channels** | 기존 앱 내 BottomNav 4번째 탭으로 자연 진입 |
| **Revenue Streams** | N/A (사내 앱, 비수익 목적) |
| **Cost Structure** | Supabase Storage 비용 (Free tier: 1GB, Pro: 100GB), 개발 인력 시간 |
| **Key Metrics** | 프로필 사진 설정률, 닉네임 변경률, 마이페이지 방문 빈도 |
| **Unfair Advantage** | 사내 전용 앱으로 빠른 배포/피드백 사이클, 기존 사용자 기반 |

### 2.3 SWOT Analysis

| | Positive | Negative |
|---|---------|---------|
| **Internal** | **Strengths**: Supabase Storage 즉시 사용 가능, 기존 유저 DB 구조 간단, App Router + Server Actions 패턴 확립 | **Weaknesses**: 200MB 업로드는 모바일 네트워크에서 불안정, RLS 정책으로 Storage 접근 제어 추가 필요, 이미지 리사이즈 서버 부재 |
| **External** | **Opportunities**: 프로필 기반 팀 기능 확장 가능, 사진 기반 리액션/이모지 생성, 타 사내 앱 연동 | **Threats**: 개인정보(사진) 관리 부담, 스토리지 비용 급증 가능, 부적절한 이미지 업로드 리스크 |

**SO Strategy**: Supabase Storage + RLS로 안전한 개인 사진 관리 기반 구축 후, 팀 기능으로 확장
**WT Strategy**: 클라이언트 사이드 이미지 압축으로 스토리지 비용 절감 + 파일 타입 화이트리스트로 부적절 업로드 차단

### 2.4 Strategic Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|:---------:|:------:|-----------|
| 200MB 파일 업로드 타임아웃 | High | High | 클라이언트 압축 권장 + 청크 업로드 고려 + 진행 표시 |
| Supabase Storage 비용 초과 | Medium | Medium | 이미지 자동 리사이즈(max 2MB 권장), 원본 선택적 보관 |
| 부적절 이미지 업로드 | Low | High | MIME type 검증 + 확장자 화이트리스트 |
| 닉네임 중복/부적절 | Low | Low | 기존 유니크 제약 활용 + 길이 제한 유지 |

---

## Part 3: Research Analysis (pm-research)

### 3.1 User Personas

#### Persona 1: "활발한 점심러" 김대리 (Primary)

| Attribute | Detail |
|-----------|--------|
| **Demographics** | 28세, 마케팅팀 대리, 모바일 주 사용 |
| **Goals** | 점심 게임에 적극 참여, 자기 랭킹 자랑하고 싶음 |
| **Pain Points** | 닉네임만으론 누군지 잘 모름, 프로필 꾸미기 불가 |
| **Tech Savviness** | 중상 — 앱 사용 익숙, 사진 편집 가능 |
| **JTBD** | "내 프로필 사진을 올려서 랭킹에서 내 얼굴이 보이게 하고 싶다" |
| **Usage Frequency** | 주 3-5회 (매일 점심시간) |

#### Persona 2: "귀찮은 간편러" 박과장 (Secondary)

| Attribute | Detail |
|-----------|--------|
| **Demographics** | 35세, 개발팀 과장, 간편함 선호 |
| **Goals** | 최소 노력으로 참여, 복잡한 설정 싫음 |
| **Pain Points** | 닉네임 변경 기능이 없어서 오타 수정 불가 |
| **Tech Savviness** | 상 — 개발자이지만 불필요한 UX 싫어함 |
| **JTBD** | "가입할 때 닉네임 잘못 쓴 거 빨리 고치고 싶다" |
| **Usage Frequency** | 주 2-3회 |

#### Persona 3: "신입 탐색러" 이사원 (Tertiary)

| Attribute | Detail |
|-----------|--------|
| **Demographics** | 24세, 신입사원, 팀 적응 중 |
| **Goals** | 동료 이름과 얼굴을 빨리 익히고 싶음 |
| **Pain Points** | 랭킹에 닉네임만 있어 누가 누군지 모름 |
| **Tech Savviness** | 중 — 기본 앱 사용 가능 |
| **JTBD** | "랭킹 보면서 이 사람이 누구인지 얼굴로 확인하고 싶다" |
| **Usage Frequency** | 주 1-2회 (초기 적응 중) |

### 3.2 Competitor Analysis

사내 전용 앱이므로 직접 경쟁자보다 유사 기능 벤치마크에 집중한다.

| # | Product | Profile Edit | Photo Upload | Key Takeaway |
|---|---------|:---:|:---:|------------|
| 1 | **Slack** | Inline edit | 10MB, crop | 실시간 미리보기 + 자동 리사이즈 |
| 2 | **Notion** | Modal edit | 5MB | 심플한 원형 크롭, 드래그앤드롭 |
| 3 | **KakaoTalk** | Full page | 20MB, filter | 프로필 전용 화면, 배경 이미지 분리 |
| 4 | **LinkedIn** | Multi-step | 8MB, crop+filter | 단계별 편집, AI 배경 제거 |
| 5 | **Discord** | Modal | 8MB, GIF 지원 | 아바타 + 서버별 닉네임, 간결한 UX |

**Benchmark Insights**:
- 모든 서비스가 클라이언트 사이드 이미지 크롭 제공
- 대부분 5-20MB 제한 (200MB는 매우 관대한 제한)
- 프로그레스 바는 대용량 업로드 시 필수
- 원형 크롭이 아바타 표준

### 3.3 Market Sizing (TAM/SAM/SOM)

사내 앱이므로 전통적 TAM/SAM/SOM 대신 **사내 도달률** 기반 추정:

| Metric | Estimate | Basis |
|--------|---------|-------|
| **TAM** (Total Addressable) | 전 직원 수 (조직 규모) | 앱 설치 가능한 모든 직원 |
| **SAM** (Serviceable) | 앱 가입자 수 | 이미 가입한 활성 사용자 |
| **SOM** (Obtainable) | 프로필 사진 설정 예상률: SAM의 60-70% | Slack 벤치마크: 조직 내 프로필 사진 설정률 ~65% |

**Dual-Method Estimation**:
- Top-down: 사내 직원 중 앱 가입자의 65%가 프로필 사진 설정
- Bottom-up: 주간 활성 사용자 중 첫 주 30%, 1개월 내 60% 설정 예상

### 3.4 Customer Journey Map (Primary Persona: 김대리)

```
[인지] → [진입] → [탐색] → [행동] → [완료] → [공유]

인지: BottomNav에 새로운 "MY" 탭 발견
  감정: 😮 "오 마이페이지 생겼네?"
  Touchpoint: BottomNav 아이콘

진입: MY 탭 터치 → 마이페이지 진입
  감정: 😊 "내 정보가 이렇게 보이는구나"
  Touchpoint: 마이페이지 화면

탐색: 프로필 사진 영역 터치 → 편집 모드
  감정: 🤔 "사진 어떤 거 올릴까"
  Touchpoint: 프로필 사진 placeholder

행동: 갤러리에서 사진 선택 → 업로드 프로그레스 확인 → 저장
  감정: ⏳→✅ "올라가는 중... 됐다!"
  Touchpoint: 파일 선택기, 프로그레스 바, 저장 버튼
  Pain Point: 대용량 사진 시 업로드 시간, 네트워크 불안정

완료: 프로필 사진 반영 확인 → 랭킹에서 내 아바타 확인
  감정: 😄 "랭킹에 내 사진 뜬다!"
  Touchpoint: 마이페이지, 랭킹 화면

공유: 동료에게 "프로필 사진 올려봐" 권유
  감정: 😆 바이럴 효과
  Touchpoint: 구두/메신저 공유
```

---

## Part 4: PRD — Product Requirements Document (pm-prd)

### 4.1 ICP (Ideal Customer Profile)

| Attribute | Definition |
|-----------|-----------|
| **Who** | lunch-event 앱 기존 가입자 (사내 직원) |
| **Primary Need** | 프로필 사진 설정 및 닉네임 수정 |
| **Behavioral Signal** | 주 2회 이상 앱 접속, 게임 참여 이력 있음 |
| **Technical Requirement** | 모바일 브라우저(iOS Safari/Android Chrome), 카메라 또는 갤러리 접근 가능 |

### 4.2 Beachhead Segment (Geoffrey Moore's 4 Criteria)

| Criteria | Selection | Score (1-5) |
|----------|----------|:-----------:|
| **Compelling Reason to Buy** | 프로필 사진 없이는 랭킹/게임에서 식별 불가 | 4 |
| **Whole Product** | 사진 업로드 + 닉네임 수정 + BottomNav 통합으로 완성 | 4 |
| **Word of Mouth** | 사내 소규모 집단, 바이럴 빠름 | 5 |
| **Pragmatist Appeal** | "내 사진 올리면 랭킹에 뜬다" — 즉시 보상 | 4 |
| **Total** | | **17/20** |

**Beachhead**: lunch-event 앱의 주간 활성 사용자 (주 2회 이상 접속하는 직원)

### 4.3 GTM (Go-To-Market) Strategy

| Element | Detail |
|---------|--------|
| **Launch Channel** | 기존 앱 업데이트 (BottomNav 4번째 탭 자동 노출) |
| **Awareness** | 앱 접속 시 "마이페이지가 추가되었습니다" 토스트/배너 |
| **Activation** | 프로필 사진 미설정 시 마이페이지 진입 시 업로드 유도 CTA |
| **Retention** | 랭킹/게임 결과에 아바타 노출 → 설정 동기 부여 |
| **Metrics** | 프로필 사진 설정률 (목표: 1개월 내 60%), 마이페이지 DAU |

### 4.4 Battlecard

| Dimension | lunch-event Profile | Slack Profile | KakaoTalk Profile |
|-----------|:------------------:|:------------:|:----------------:|
| Upload Limit | **200MB** | 10MB | 20MB |
| Crop/Edit | Basic crop | Crop | Crop + Filter |
| Progress Indicator | Yes | No (fast) | Yes |
| Integration | 게임/랭킹 아바타 | 메시지 아바타 | 채팅 아바타 |
| Setup Friction | **Low** (1 step) | Low | Medium |

### 4.5 Growth Loops

```
[사진 설정] → [랭킹에 아바타 노출] → [동료가 "누구야?" 확인]
     ↑                                        ↓
[동료가 자기도 사진 설정]  ←  [앱 접속 → 마이페이지 발견]
```

---

## Part 5: Feature Requirements (8 Sections)

### Section 1: Overview

**Feature Name**: profile-edit (프로필 수정 탭)
**Priority**: P0 (핵심 기능)
**Target Release**: Sprint 1 (1-2주)
**Owner**: 프론트엔드 개발팀

프로필 사진 업로드(200MB)와 닉네임 수정이 가능한 마이페이지 탭을 BottomNav에 추가한다.

### Section 2: User Stories

| ID | Story | Priority | INVEST Check |
|----|-------|:--------:|:------------:|
| US-01 | 사용자로서, BottomNav에서 마이페이지 탭을 눌러 내 프로필을 확인할 수 있다 | P0 | I-N-V-E-S-T |
| US-02 | 사용자로서, 프로필 사진을 갤러리/카메라에서 선택하여 업로드할 수 있다 (최대 200MB) | P0 | I-N-V-E-S-T |
| US-03 | 사용자로서, 사진 업로드 중 진행률(%)을 확인할 수 있다 | P0 | I-N-V-E-S-T |
| US-04 | 사용자로서, 업로드 중 취소할 수 있다 | P1 | I-N-V-E-S-T |
| US-05 | 사용자로서, 닉네임을 마이페이지에서 수정할 수 있다 (2-10자) | P0 | I-N-V-E-S-T |
| US-06 | 사용자로서, 프로필 사진이 없으면 이니셜 기반 기본 아바타가 표시된다 | P1 | I-N-V-E-S-T |
| US-07 | 사용자로서, 내가 설정한 프로필 사진이 랭킹 화면에 표시된다 | P1 | I-N-V-E-S-T |
| US-08 | 사용자로서, 로그아웃 버튼을 마이페이지에서 사용할 수 있다 | P0 | I-N-V-E-S-T |
| US-09 | 사용자로서, 내 한턱 횟수(전체/월간)를 마이페이지에서 확인할 수 있다 | P2 | I-N-V-E-S-T |

**INVEST Verification (US-02 example)**:
- **I**ndependent: 다른 스토리와 독립 구현 가능
- **N**egotiable: 압축 옵션, 크롭 범위 등 조정 가능
- **V**aluable: 프로필 사진은 핵심 가치 기능
- **E**stimable: Supabase Storage + file input으로 ~3일
- **S**mall: 업로드 기능 단일 스토리
- **T**estable: 200MB 파일 업로드 성공/실패 검증 가능

### Section 3: Functional Requirements

#### FR-01: BottomNav 마이페이지 탭 추가

- 기존 3탭(홈/게임/랭킹)에 4번째 "MY" 탭 추가
- 경로: `/my`
- 아이콘: 사용자 아이콘 (기존 이모지 패턴 유지)
- 활성 상태 스타일: 기존 `text-primary` 패턴 동일 적용

#### FR-02: 마이페이지 화면 구성

```
┌─────────────────────┐
│  [Avatar 120x120]   │
│  📷 사진 변경        │
│                     │
│  닉네임: 김대리  ✏️  │
│  ID: @kimdalri       │
│                     │
│  ── 내 기록 ──       │
│  🏆 이달의 한턱: 3회  │
│  📊 전체 한턱: 12회   │
│                     │
│  [로그아웃]          │
└─────────────────────┘
```

#### FR-03: 프로필 사진 업로드

| Spec | Detail |
|------|--------|
| Max File Size | 200MB |
| Allowed Types | image/jpeg, image/png, image/webp, image/gif |
| Upload Method | Supabase Storage (`avatars` bucket) |
| File Path | `avatars/{user_uuid}/avatar.{ext}` |
| Progress | XMLHttpRequest `progress` event 기반 실시간 % 표시 |
| Cancel | AbortController를 통한 업로드 취소 |
| Thumbnail | 클라이언트 사이드 리사이즈 (display: 400x400, 원본 보존 옵션) |
| Fallback | 업로드 실패 시 기존 사진 유지 + 에러 토스트 |

#### FR-04: 닉네임 수정

| Spec | Detail |
|------|--------|
| Length | 2-10자 (기존 제약 동일) |
| Validation | 클라이언트 + 서버 양측 검증 |
| Update | Server Action으로 `users.nickname` UPDATE |
| Feedback | 성공 시 인라인 확인, 실패 시 에러 메시지 |

#### FR-05: DB Schema 변경

```sql
-- users 테이블에 avatar_url 컬럼 추가
ALTER TABLE users ADD COLUMN avatar_url TEXT;
```

#### FR-06: Supabase Storage 설정

```sql
-- avatars 버킷 생성 (Public read, Authenticated write)
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Storage RLS: 본인 폴더만 업로드/수정/삭제 가능
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');
```

> **Note**: 현재 프로젝트는 Supabase Auth를 사용하지 않고 커스텀 쿠키 기반 세션을 사용한다. 따라서 `auth.uid()`가 작동하지 않는 환경이다. Storage RLS는 서비스 롤키를 통한 서버사이드 업로드로 우회하거나, Supabase Auth 통합 시점에 맞춰 적용해야 한다. 서버사이드 업로드 방식(Server Action → Supabase Admin Client)이 현실적 선택이다.

### Section 4: Non-Functional Requirements

| Category | Requirement |
|----------|------------|
| **Performance** | 사진 업로드: 200MB 기준 LTE 환경에서 3분 이내 완료 |
| **Security** | MIME type 서버 검증, 파일 확장자 화이트리스트, XSS 방지 (URL sanitize) |
| **Accessibility** | 사진 업로드 버튼 aria-label, 프로그레스 바 aria-valuenow |
| **Mobile UX** | 터치 타겟 >= 44px, 프로필 사진 영역 탭으로 파일 선택기 호출 |
| **Storage** | 파일명 UUID 기반으로 충돌 방지, 이전 아바타 자동 삭제 (1인 1아바타) |
| **Compatibility** | iOS Safari 16+, Android Chrome 90+, 카메라 직접 촬영 지원 |

### Section 5: Technical Architecture

#### 5.1 New Files

| File | Purpose |
|------|---------|
| `src/app/my/page.tsx` | 마이페이지 (Server Component) |
| `src/components/profile/ProfileEditor.tsx` | 프로필 편집 클라이언트 컴포넌트 |
| `src/components/profile/AvatarUpload.tsx` | 사진 업로드 + 프로그레스 컴포넌트 |
| `src/components/profile/NicknameEditor.tsx` | 닉네임 인라인 수정 컴포넌트 |
| `src/components/ui/Avatar.tsx` | 공통 아바타 컴포넌트 (사진 or 이니셜 fallback) |
| `src/lib/actions/profile.ts` | Server Actions: updateNickname, updateAvatar |
| `src/lib/supabase/storage.ts` | Storage 헬퍼: uploadAvatar, deleteAvatar, getAvatarUrl |

#### 5.2 Modified Files

| File | Change |
|------|--------|
| `src/components/ui/BottomNav.tsx` | 4번째 "MY" 탭 추가 |
| `src/types/index.ts` | User 인터페이스에 `avatar_url?: string` 추가 |
| `src/components/ranking/RankingCard.tsx` | 아바타 컴포넌트 통합 (P1) |
| `supabase/schema.sql` | `avatar_url` 컬럼 + Storage 정책 추가 |

#### 5.3 Data Flow

```
[Client: AvatarUpload]
  ↓ File selected (max 200MB, type validated)
  ↓ Optional: client-side resize for preview
  ↓ FormData with file
  ↓
[Server Action: updateAvatar]
  ↓ Server-side MIME validation
  ↓ Supabase Storage upload (service role key)
  ↓ Get public URL
  ↓ UPDATE users SET avatar_url = publicUrl WHERE id = userId
  ↓
[Response: new avatar_url]
  ↓
[Client: revalidatePath('/my')]
```

#### 5.4 Upload Progress Strategy

200MB 파일의 업로드 프로그레스를 표시하기 위해 Server Actions(fetch 기반)만으로는 progress event를 받을 수 없다. 두 가지 접근이 가능하다:

**Option A (권장): Route Handler + XMLHttpRequest**
- `src/app/api/upload-avatar/route.ts` Route Handler 생성
- 클라이언트에서 XMLHttpRequest의 `upload.onprogress`로 실시간 % 표시
- Route Handler 내부에서 Supabase Storage 업로드 처리

**Option B: Direct Supabase Client Upload**
- 클라이언트에서 직접 Supabase Storage에 업로드 (anon key 사용)
- Storage RLS로 접근 제어 (Supabase Auth 필요)
- 현재 프로젝트의 커스텀 세션 구조와 호환 어려움

**Option A를 권장**한다. 현재 프로젝트가 커스텀 쿠키 세션을 사용하므로 서버사이드에서 service role key로 Storage 접근하는 것이 보안적으로 안전하다.

### Section 6: Test Scenarios

| ID | Scenario | Expected Result | Priority |
|----|---------|----------------|:--------:|
| TS-01 | 200MB JPEG 파일 업로드 | 업로드 성공, 프로그레스 100%, 아바타 반영 | P0 |
| TS-02 | 200MB 초과 파일 선택 | "200MB 이하만 업로드 가능합니다" 에러 표시 | P0 |
| TS-03 | .exe 파일 업로드 시도 | "이미지 파일만 업로드 가능합니다" 에러 | P0 |
| TS-04 | 업로드 중 취소 버튼 클릭 | 업로드 중단, 기존 사진 유지 | P1 |
| TS-05 | 네트워크 끊김 중 업로드 | 에러 표시 + 재시도 버튼 | P1 |
| TS-06 | 닉네임 1자 입력 후 저장 | "2자 이상 입력해주세요" 에러 | P0 |
| TS-07 | 닉네임 11자 입력 시도 | maxLength로 10자 초과 입력 불가 | P0 |
| TS-08 | 닉네임 정상 수정 | 성공 메시지, 홈 화면 닉네임 반영 | P0 |
| TS-09 | 미로그인 상태에서 /my 접근 | /login으로 리디렉트 | P0 |
| TS-10 | 프로필 사진 미설정 시 | 이니셜 기반 기본 아바타 표시 | P1 |
| TS-11 | 기존 사진 있는 상태에서 새 사진 업로드 | 기존 사진 삭제, 새 사진 반영 | P0 |
| TS-12 | BottomNav MY 탭 활성 상태 | /my 경로에서 MY 탭 하이라이트 | P0 |

### Section 7: Pre-mortem Analysis

| Rank | Risk | Probability | Impact | Mitigation |
|------|------|:---------:|:------:|-----------|
| 1 | **200MB 업로드 시 모바일 OOM/타임아웃** | High | Critical | 클라이언트 사이드 이미지 압축 권장 UI ("원본 업로드" vs "최적화 업로드" 선택지), Route Handler에 timeout 확장, 프로그레스 + 취소 버튼 필수 |
| 2 | **Supabase Storage 무료 티어 1GB 초과** | Medium | High | 사용자당 아바타 1개만 유지(이전 삭제), 권장 리사이즈(2MB 이하), 관리자 모니터링 대시보드 |
| 3 | **서버사이드 업로드 시 Vercel Serverless 함수 body size 제한** | High | Critical | Vercel Serverless는 기본 body size 4.5MB 제한. 200MB 업로드를 위해서는 Vercel Edge Function 또는 presigned URL 방식(Supabase `createSignedUploadUrl`) + 클라이언트 직접 업로드 패턴 필요. 이 경우 서버는 URL만 발급하고 업로드는 클라이언트가 직접 Storage에 수행 |

> **Critical Design Decision**: Vercel의 4.5MB body size 제한으로 인해, 200MB 파일을 Server Action이나 Route Handler로 직접 받을 수 없다. **Presigned URL 패턴**이 사실상 유일한 선택이다:
> 1. Server Action이 Supabase Storage `createSignedUploadUrl(path)` 호출
> 2. 클라이언트가 반환된 signed URL로 직접 PUT 요청 (XMLHttpRequest + progress)
> 3. 업로드 완료 후 Server Action으로 `avatar_url` DB 업데이트

### Section 8: Stakeholder Map

| Stakeholder | Interest | Influence | Engagement |
|------------|---------|----------|-----------|
| 앱 사용 직원 (전체) | High — 프로필 기능 직접 사용 | Low | Inform |
| 프론트엔드 개발자 | High — 구현 담당 | High | Collaborate |
| 백엔드/인프라 담당 | Medium — Storage 설정, 비용 | Medium | Consult |
| 팀 리더/관리자 | Low — 부적절 사진 관리 | Medium | Inform |

---

## Appendix A: Type Changes

```typescript
// src/types/index.ts — Updated User interface
export interface User {
  id: string
  user_id: string
  nickname: string
  avatar_url?: string | null  // NEW: 프로필 사진 URL
  created_at: string
}
```

## Appendix B: Implementation Priority

| Phase | Items | Effort |
|-------|-------|--------|
| **Phase 1 (MVP)** | BottomNav 4탭, /my 페이지, 사진 업로드(presigned URL), 닉네임 수정, 로그아웃 | 3-5일 |
| **Phase 2 (Enhancement)** | 랭킹/게임에 아바타 통합, 이니셜 fallback, 클라이언트 압축 옵션 | 2-3일 |
| **Phase 3 (Polish)** | 이미지 크롭 UI, 내 게임 이력 표시, 프로필 공유 | 3-5일 |

## Appendix C: Key Technical Decisions

| Decision | Choice | Rationale |
|---------|--------|----------|
| Upload Pattern | Presigned URL + Client Direct Upload | Vercel 4.5MB body limit 회피, 프로그레스 지원 |
| Storage | Supabase Storage (`avatars` bucket) | 기존 인프라 활용, Public read 지원 |
| Auth for Storage | Server-issued signed URL (service role) | 커스텀 쿠키 세션 환경에서 Storage RLS 대신 서버 검증 |
| Image Processing | Client-side resize (optional) | 서버 비용 절약, 사용자 선택권 부여 |
| Avatar Component | Shared `<Avatar>` with fallback | 랭킹/게임/마이페이지 통일 사용 |

---

> **Attribution**: PM Agent Team analysis integrates frameworks from [pm-skills](https://github.com/phuryn/pm-skills) by Pawel Huryn (MIT License).
> - Discovery: Opportunity Solution Tree (Teresa Torres)
> - Strategy: JTBD Value Proposition (Tony Ulwick), Lean Canvas (Ash Maurya)
> - Research: Persona Design, Customer Journey Map
> - GTM: Beachhead Market (Geoffrey Moore), Battlecards
> - PRD: 8-Section Structure with Pre-mortem and INVEST User Stories

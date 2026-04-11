-- lunch-event Database Schema
-- Run this in Supabase SQL Editor

-- 사용자
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(20) UNIQUE NOT NULL,
  nickname VARCHAR(10) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_users_user_id ON users(user_id);

-- 점심 이벤트 (게임 결과)
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_mode VARCHAR(20) NOT NULL CHECK (game_mode IN ('card_flip', 'ladder')),
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_created_at ON events(created_at DESC);

-- 이벤트 참여자
CREATE TABLE event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  is_payer BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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

-- 쓰기: 인증된 사용자
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Authenticated users can create events" ON events
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Authenticated users can create participants" ON event_participants
  FOR INSERT WITH CHECK (true);

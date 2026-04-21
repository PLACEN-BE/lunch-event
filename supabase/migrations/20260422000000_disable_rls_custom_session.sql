-- 커스텀 쿠키 세션(lunch_user_id) 사용으로 auth.uid() 기반 RLS가 무의미해짐.
-- 모든 DB 쓰기는 server action에서 세션 검증 후 service role로 수행하는 패턴으로 전환.
-- RLS는 모든 관련 테이블에서 비활성화한다.

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants DISABLE ROW LEVEL SECURITY;

-- 기존 정책 제거 (혼란 방지)
DROP POLICY IF EXISTS "Users are viewable by authenticated users" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Events are viewable by authenticated users" ON events;
DROP POLICY IF EXISTS "Authenticated users can create events" ON events;
DROP POLICY IF EXISTS "Participants are viewable by authenticated users" ON event_participants;
DROP POLICY IF EXISTS "Authenticated users can create participants" ON event_participants;

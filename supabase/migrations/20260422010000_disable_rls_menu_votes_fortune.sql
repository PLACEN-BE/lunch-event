-- 앞선 20260422000000_disable_rls_custom_session.sql 과 같은 맥락.
-- 커스텀 쿠키 세션이라 auth.uid() 기반 정책이 의미 없으며,
-- submitMenuVote 가 upsert 로 전환되면서 UPDATE 경로가 열려야 함.
-- menu_votes / fortune_draws 의 RLS 를 비활성화한다.

ALTER TABLE menu_votes DISABLE ROW LEVEL SECURITY;
ALTER TABLE fortune_draws DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Menu votes are viewable by all" ON menu_votes;
DROP POLICY IF EXISTS "Authenticated users can vote" ON menu_votes;
DROP POLICY IF EXISTS "Fortune draws are viewable by everyone" ON fortune_draws;
DROP POLICY IF EXISTS "Anyone can insert fortune draws" ON fortune_draws;

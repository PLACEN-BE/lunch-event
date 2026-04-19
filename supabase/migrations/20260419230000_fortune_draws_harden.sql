-- C1: 클라이언트 직접 INSERT 차단. 서버 액션은 service_role로 쓴다.
DROP POLICY IF EXISTS "Anyone can insert fortune draws" ON fortune_draws;

-- C2: 하루 3회 race-safe 강제 — UNIQUE (user_id, draw_date, draw_index)
ALTER TABLE fortune_draws ADD COLUMN draw_index SMALLINT;
CREATE UNIQUE INDEX uq_fortune_draws_slot
  ON fortune_draws(user_id, draw_date, draw_index);

-- 트리거 교체: draw_index 자동 배정 + 3 초과 차단 + SECURITY DEFINER
CREATE OR REPLACE FUNCTION enforce_fortune_daily_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_idx INT;
BEGIN
  SELECT COALESCE(MAX(draw_index), 0) + 1
    INTO next_idx
  FROM fortune_draws
  WHERE user_id = NEW.user_id
    AND draw_date = (NEW.created_at AT TIME ZONE 'Asia/Seoul')::date;

  IF next_idx > 3 THEN
    RAISE EXCEPTION 'FORTUNE_DAILY_LIMIT_EXCEEDED'
      USING ERRCODE = 'P0001';
  END IF;

  NEW.draw_index := next_idx;
  RETURN NEW;
END;
$$;

-- H1: 앱이 아닌 DB를 날짜 단일 진실원으로 사용
CREATE OR REPLACE FUNCTION kst_today()
RETURNS DATE
LANGUAGE sql
STABLE
AS $$ SELECT (NOW() AT TIME ZONE 'Asia/Seoul')::date $$;

-- M2: draw_index NOT NULL + 1-3 범위 CHECK — 트리거 유실 시 fallback 방어
ALTER TABLE fortune_draws
  ALTER COLUMN draw_index SET NOT NULL,
  ADD CONSTRAINT fortune_draws_draw_index_range
    CHECK (draw_index BETWEEN 1 AND 3);

-- L1: service_role만 INSERT 가능한 현 상태에서 DEFINER 불필요 → INVOKER로 최소권한
-- L2: 전용 SQLSTATE + 에러 매칭 견고화
CREATE OR REPLACE FUNCTION enforce_fortune_daily_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
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
      USING ERRCODE = '45001';
  END IF;

  NEW.draw_index := next_idx;
  RETURN NEW;
END;
$$;

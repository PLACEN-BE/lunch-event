-- 한 사용자가 한 식당에 여러 리뷰를 남길 수 있도록 UNIQUE 제약 해제.
-- 수정은 reviews.id로 직접 update.

ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_restaurant_id_user_id_key;

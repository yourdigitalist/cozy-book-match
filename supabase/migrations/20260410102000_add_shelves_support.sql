-- Add per-book shelf support and user custom shelves.

ALTER TABLE public.favorites
  DROP CONSTRAINT IF EXISTS favorites_user_id_book_isbn_key;

ALTER TABLE public.favorites
  ADD COLUMN IF NOT EXISTS shelf_name TEXT NOT NULL DEFAULT 'want_to_read';

ALTER TABLE public.favorites
  ADD CONSTRAINT favorites_user_book_shelf_unique UNIQUE (user_id, book_isbn, shelf_name);

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS custom_shelves TEXT[] NOT NULL DEFAULT '{}';


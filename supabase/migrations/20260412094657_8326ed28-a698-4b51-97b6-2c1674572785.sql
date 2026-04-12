
ALTER TABLE public.favorites ADD COLUMN IF NOT EXISTS shelf_name text DEFAULT 'want_to_read';

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS custom_shelves text[] DEFAULT '{}';

-- Drop the existing unique constraint and create a new one including shelf_name
DO $$
BEGIN
  -- Add unique constraint for user_id, book_isbn, shelf_name
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'favorites_user_book_shelf_unique'
  ) THEN
    ALTER TABLE public.favorites ADD CONSTRAINT favorites_user_book_shelf_unique UNIQUE (user_id, book_isbn, shelf_name);
  END IF;
END $$;

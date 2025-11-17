-- ========================================
-- COMPLETE E-LIBRARY SUPABASE SETUP
-- Run this in your NEW Supabase SQL Editor
-- ========================================

-- ========================================
-- PART 1: CREATE DATABASE TABLES
-- ========================================

-- Create books table
CREATE TABLE IF NOT EXISTS public.books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  cover_image TEXT,
  file_url TEXT,
  file_name TEXT,
  file_size BIGINT,
  file_type TEXT CHECK (file_type IN ('pdf', 'epub', 'mobi')),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  view_count INTEGER NOT NULL DEFAULT 0,
  download_count INTEGER NOT NULL DEFAULT 0,
  average_rating DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  total_reviews INTEGER NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'user' CHECK (source IN ('user', 'openlibrary')),
  publisher TEXT,
  publish_year INTEGER,
  isbn TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id TEXT NOT NULL,  -- TEXT type supports both UUIDs and Open Library IDs like "/works/OL138052W"
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_books_category ON public.books(category);
CREATE INDEX IF NOT EXISTS idx_books_source ON public.books(source);
CREATE INDEX IF NOT EXISTS idx_books_uploaded_at ON public.books(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_book_id ON public.reviews(book_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_books_updated_at ON public.books;
CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON public.books
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reviews_updated_at ON public.reviews;
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to update book ratings when reviews change
CREATE OR REPLACE FUNCTION update_book_ratings()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the book's average rating and total reviews
  UPDATE public.books
  SET
    average_rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM public.reviews
      WHERE book_id = NEW.book_id
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM public.reviews
      WHERE book_id = NEW.book_id
    )
  WHERE id::text = NEW.book_id OR id::text = NEW.book_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update ratings when review is added
DROP TRIGGER IF EXISTS update_ratings_on_review ON public.reviews;
CREATE TRIGGER update_ratings_on_review
  AFTER INSERT OR UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_book_ratings();

-- ========================================
-- PART 2: ENABLE ROW LEVEL SECURITY (RLS)
-- ========================================

-- Enable RLS on tables
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- ========================================
-- PART 3: CREATE RLS POLICIES FOR TABLES
-- ========================================

-- Books table policies
-- Allow anyone to read all books
CREATE POLICY "Anyone can read books"
ON public.books FOR SELECT
TO public
USING (true);

-- Allow anyone to insert books (for uploads)
CREATE POLICY "Anyone can insert books"
ON public.books FOR INSERT
TO public
WITH CHECK (true);

-- Allow anyone to update books (for view/download counts)
CREATE POLICY "Anyone can update books"
ON public.books FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- Reviews table policies
-- Allow anyone to read reviews
CREATE POLICY "Anyone can read reviews"
ON public.reviews FOR SELECT
TO public
USING (true);

-- Allow anyone to insert reviews
CREATE POLICY "Anyone can insert reviews"
ON public.reviews FOR INSERT
TO public
WITH CHECK (true);

-- ========================================
-- PART 4: CREATE STORAGE BUCKETS
-- ========================================

-- Create books bucket (for PDF, EPUB, MOBI files)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'books',
  'books',
  true,
  52428800, -- 50MB limit
  ARRAY['application/pdf', 'application/epub+zip', 'application/x-mobipocket-ebook']
)
ON CONFLICT (id) DO NOTHING;

-- Create covers bucket (for book cover images)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'covers',
  'covers',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- PART 5: CREATE STORAGE POLICIES
-- ========================================

-- Allow anyone to read files in books bucket
CREATE POLICY "Anyone can read books files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'books');

-- Allow anyone to upload files to books bucket
CREATE POLICY "Anyone can upload books files"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'books');

-- Allow anyone to read files in covers bucket
CREATE POLICY "Anyone can read cover images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'covers');

-- Allow anyone to upload files to covers bucket
CREATE POLICY "Anyone can upload cover images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'covers');

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Check tables were created
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('books', 'reviews');

-- Check storage buckets
SELECT id, name, public, file_size_limit
FROM storage.buckets
WHERE id IN ('books', 'covers');

-- Check RLS policies on tables
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('books', 'reviews');

-- Check storage policies
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'storage'
AND tablename = 'objects';

-- ========================================
-- SUCCESS MESSAGE
-- ========================================

DO $$
BEGIN
  RAISE NOTICE '✅ E-Library setup complete!';
  RAISE NOTICE '📚 Tables created: books, reviews';
  RAISE NOTICE '🗄️  Storage buckets created: books, covers';
  RAISE NOTICE '🔒 RLS policies configured';
  RAISE NOTICE '📦 All policies created';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Update your .env.local with new Supabase credentials';
  RAISE NOTICE '2. Restart your dev server';
  RAISE NOTICE '3. Test uploading a book at /upload';
END $$;

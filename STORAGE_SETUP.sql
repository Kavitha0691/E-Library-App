-- ========================================
-- E-Library Storage Setup
-- Run this in Supabase SQL Editor
-- ========================================

-- STEP 1: Create Storage Buckets
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
-- STEP 2: Add Storage Policies
-- ========================================

-- Allow anyone to read/view files in books bucket
CREATE POLICY "Anyone can read books"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'books');

-- Allow anyone to upload files to books bucket
CREATE POLICY "Anyone can upload books"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'books');

-- Allow anyone to read/view files in covers bucket
CREATE POLICY "Anyone can read covers"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'covers');

-- Allow anyone to upload files to covers bucket
CREATE POLICY "Anyone can upload covers"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'covers');

-- ========================================
-- VERIFICATION
-- ========================================

-- Check buckets were created
SELECT id, name, public, file_size_limit FROM storage.buckets WHERE id IN ('books', 'covers');

-- Check policies were created
SELECT schemaname, tablename, policyname FROM pg_policies
WHERE tablename = 'objects' AND schemaname = 'storage';

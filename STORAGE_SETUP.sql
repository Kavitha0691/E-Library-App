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
);

-- Create covers bucket (for book cover images)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'covers',
  'covers',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
);

-- ========================================
-- STEP 2: Add Storage Policies
-- ========================================

-- Allow anyone to read/view files in books bucket
INSERT INTO storage.policies (name, bucket_id, definition, operation)
VALUES (
  'Anyone can read books',
  'books',
  'true'::jsonb,
  'SELECT'
);

-- Allow anyone to upload files to books bucket
INSERT INTO storage.policies (name, bucket_id, definition, operation)
VALUES (
  'Anyone can upload books',
  'books',
  'true'::jsonb,
  'INSERT'
);

-- Allow anyone to read/view files in covers bucket
INSERT INTO storage.policies (name, bucket_id, definition, operation)
VALUES (
  'Anyone can read covers',
  'covers',
  'true'::jsonb,
  'SELECT'
);

-- Allow anyone to upload files to covers bucket
INSERT INTO storage.policies (name, bucket_id, definition, operation)
VALUES (
  'Anyone can upload covers',
  'covers',
  'true'::jsonb,
  'INSERT'
);

-- ========================================
-- VERIFICATION
-- ========================================

-- Check buckets were created
SELECT * FROM storage.buckets WHERE id IN ('books', 'covers');

-- Check policies were created
SELECT * FROM storage.policies WHERE bucket_id IN ('books', 'covers');

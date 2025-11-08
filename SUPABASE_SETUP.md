# Supabase Database Setup

Follow these steps to enable reviews and uploads in your E-Library app.

---

## 🔧 IMPORTANT: If You Already Created Tables

If you're seeing an error like `invalid input syntax for type uuid: "/works/OL138052W"`, you need to **recreate the reviews table** with the correct type.

**Run this SQL first** to fix the issue:

```sql
-- Drop and recreate reviews table with correct book_id type
DROP TABLE IF EXISTS reviews CASCADE;

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id TEXT NOT NULL,  -- TEXT to support both UUID and Open Library IDs
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Re-create index
CREATE INDEX idx_reviews_book_id ON reviews(book_id);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);

-- Re-create RLS policies
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to reviews"
  ON reviews FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to reviews"
  ON reviews FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access to reviews"
  ON reviews FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Allow public delete access to reviews"
  ON reviews FOR DELETE
  TO public
  USING (true);

-- Re-create trigger
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

After running this, **try submitting a review again** - it should work!

---

## Step 1: Create Database Tables

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project: `lgjzetyzbxuxzjcmrrij`

2. **Go to SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run This SQL Script** (copy and paste all of it):

```sql
-- ============================================
-- E-Library Database Schema
-- ============================================

-- Drop existing tables if they exist (be careful with this in production!)
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS books CASCADE;

-- ============================================
-- Books Table
-- ============================================
CREATE TABLE books (
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
  uploaded_by TEXT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  view_count INTEGER NOT NULL DEFAULT 0,
  download_count INTEGER NOT NULL DEFAULT 0,
  average_rating NUMERIC(3,2) NOT NULL DEFAULT 0.00,
  total_reviews INTEGER NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'user' CHECK (source IN ('user', 'openlibrary')),
  open_library_id TEXT,
  isbn TEXT,
  publish_year INTEGER,
  publisher TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Reviews Table
-- ============================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id TEXT NOT NULL,  -- TEXT to support both UUID and Open Library IDs
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Indexes for Better Performance
-- ============================================
CREATE INDEX idx_books_category ON books(category);
CREATE INDEX idx_books_source ON books(source);
CREATE INDEX idx_books_uploaded_at ON books(uploaded_at DESC);
CREATE INDEX idx_reviews_book_id ON reviews(book_id);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);

-- ============================================
-- Row Level Security (RLS) - Allow Public Access
-- ============================================

-- Enable RLS
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Books policies - allow all operations for everyone
CREATE POLICY "Allow public read access to books"
  ON books FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to books"
  ON books FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access to books"
  ON books FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Allow public delete access to books"
  ON books FOR DELETE
  TO public
  USING (true);

-- Reviews policies - allow all operations for everyone
CREATE POLICY "Allow public read access to reviews"
  ON reviews FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to reviews"
  ON reviews FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access to reviews"
  ON reviews FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Allow public delete access to reviews"
  ON reviews FOR DELETE
  TO public
  USING (true);

-- ============================================
-- Triggers for Updated At
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON books
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

4. **Click "Run"** to execute the SQL

5. **Verify Tables Were Created**
   - Click "Table Editor" in the left sidebar
   - You should see `books` and `reviews` tables

---

## Step 2: Create Storage Buckets

1. **Go to Storage**
   - Click "Storage" in the left sidebar

2. **Create "books" Bucket**
   - Click "New bucket"
   - Name: `books`
   - Public: ✅ **Check this box** (make it public)
   - Click "Create bucket"

3. **Create "covers" Bucket**
   - Click "New bucket" again
   - Name: `covers`
   - Public: ✅ **Check this box** (make it public)
   - Click "Create bucket"

4. **Set Storage Policies**
   For each bucket (books and covers), click the bucket name, then click "Policies":

   Click "New Policy" → "For full customization" and add these policies:

   **Policy 1: Allow public uploads**
   ```sql
   CREATE POLICY "Allow public uploads"
   ON storage.objects FOR INSERT
   TO public
   WITH CHECK (bucket_id = 'books');
   ```

   **Policy 2: Allow public reads**
   ```sql
   CREATE POLICY "Allow public reads"
   ON storage.objects FOR SELECT
   TO public
   USING (bucket_id = 'books');
   ```

   Repeat for the `covers` bucket (change 'books' to 'covers').

---

## Step 3: Verify Your Setup

Once you've completed the above steps, you should have:
- ✅ `books` table in your database
- ✅ `reviews` table in your database
- ✅ `books` storage bucket (public)
- ✅ `covers` storage bucket (public)
- ✅ RLS policies allowing public access

---

## Step 4: Test the Features

After setup is complete:

1. **Test Reviews:**
   - Go to any book detail page
   - You should see the review form
   - Submit a review - it should save successfully

2. **Test Upload:**
   - Go to `/upload` page
   - Upload a PDF file
   - It should upload successfully

---

## Troubleshooting

If you get errors:

1. **"relation does not exist"** → Tables weren't created. Re-run the SQL in Step 1.

2. **"new row violates row-level security policy"** → RLS policies aren't set. Re-run the policy SQL.

3. **"permission denied for bucket"** → Storage policies aren't set. Add the storage policies in Step 2.

4. **Upload fails** → Check that:
   - Storage buckets exist
   - Buckets are set to "public"
   - Storage policies are applied

---

## Need Help?

If you encounter any errors during setup, copy the exact error message and I'll help you fix it!

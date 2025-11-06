# E-Library - Digital Content Platform

A modern e-library application built with Next.js, TypeScript, Tailwind CSS, and Supabase. Users can upload, discover, and read e-books and PDF documents online.

## Features

- **File Upload & Storage**: Upload books (PDF, EPUB, MOBI) with cover images using Supabase Storage
- **Categorized Library**: Browse books by category with a clean, responsive interface
- **Search Functionality**:
  - Search your library books by title or author
  - Search millions of books using the Open Library API
- **Book Management**:
  - View book details with metadata
  - Download or view books online
  - Track views and downloads
- **Ratings & Reviews**: Rate and review books with a 5-star system
- **Responsive Design**: Beautiful UI built with Tailwind CSS that works on all devices

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Backend**: Next.js API Routes
- **Database & Storage**: Supabase
- **External API**: Open Library API
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier works fine)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Kavitha0691/E-Library-App.git
cd E-Library-App
```

2. Install dependencies:
```bash
npm install
```

3. Set up Supabase:

   a. Create a new project at [supabase.com](https://supabase.com)

   b. Go to Project Settings > API to get your credentials

   c. Create a `.env.local` file in the root directory:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. Set up the database:

   Run the following SQL in your Supabase SQL Editor:

```sql
-- Create books table
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
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  source TEXT CHECK (source IN ('user', 'openlibrary')) DEFAULT 'user',
  open_library_id TEXT,
  isbn TEXT,
  publish_year INTEGER,
  publisher TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_books_category ON books(category);
CREATE INDEX idx_books_title ON books(title);
CREATE INDEX idx_books_author ON books(author);
CREATE INDEX idx_books_uploaded_at ON books(uploaded_at DESC);
CREATE INDEX idx_reviews_book_id ON reviews(book_id);

-- Enable Row Level Security (RLS)
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Books are viewable by everyone" ON books
  FOR SELECT USING (true);

CREATE POLICY "Reviews are viewable by everyone" ON reviews
  FOR SELECT USING (true);

-- Create policies for insert (you can modify these based on your auth requirements)
CREATE POLICY "Anyone can insert books" ON books
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can insert reviews" ON reviews
  FOR INSERT WITH CHECK (true);

-- Create policies for update (books can be updated to increment counters)
CREATE POLICY "Anyone can update books" ON books
  FOR UPDATE USING (true);
```

5. Set up Storage Buckets:

   a. Go to Storage in your Supabase dashboard

   b. Create two new buckets:
      - Name: `books` (for book files)
      - Name: `covers` (for cover images)

   c. Make both buckets public:
      - Click on the bucket
      - Click on "Policies"
      - Create a new policy
      - Select "For full customization"
      - Policy name: "Public Access"
      - Policy definition: `SELECT` and `INSERT` operations
      - Use this for SELECT: `(bucket_id = 'books'::text)` or `(bucket_id = 'covers'::text)`
      - Check "Allow all operations"

   Or run this SQL:
   ```sql
   -- Create storage buckets
   INSERT INTO storage.buckets (id, name, public) VALUES ('books', 'books', true);
   INSERT INTO storage.buckets (id, name, public) VALUES ('covers', 'covers', true);

   -- Create storage policies
   CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'books');
   CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'covers');
   CREATE POLICY "Public Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'books');
   CREATE POLICY "Public Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'covers');
   ```

6. Run the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
E-Library-App/
├── app/
│   ├── api/              # API routes
│   │   ├── books/        # Books CRUD operations
│   │   ├── reviews/      # Reviews operations
│   │   ├── search/       # Open Library search
│   │   └── upload/       # File upload to Supabase
│   ├── book/[id]/        # Book detail page
│   ├── upload/           # Upload page
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── components/           # React components
│   ├── BookCard.tsx
│   ├── CategoryFilter.tsx
│   ├── FileUpload.tsx
│   ├── Navigation.tsx
│   ├── ReviewCard.tsx
│   ├── SearchBar.tsx
│   └── StarRating.tsx
├── lib/                  # Utility functions
│   ├── openLibraryApi.ts
│   ├── supabase.ts
│   └── utils.ts
├── types/                # TypeScript definitions
│   ├── book.ts
│   ├── category.ts
│   ├── openlibrary.ts
│   ├── review.ts
│   └── index.ts
└── public/               # Static assets
```

## Usage

### Uploading a Book

1. Click "Upload Book" in the navigation
2. Select your book file (PDF, EPUB, or MOBI)
3. Optionally upload a cover image
4. Fill in book details (title, author, category, etc.)
5. Click "Upload Book"

### Searching for Books

- **Library Search**: Type in the search bar to search your uploaded books by title or author
- **Open Library Search**: The app automatically searches the Open Library API when you search
- **Category Filter**: Click on category tags to filter books

### Viewing & Downloading Books

1. Click on any book card to view details
2. On the book detail page:
   - View book information and metadata
   - Download the book file
   - View the book online
   - Read and write reviews

### Rating & Reviewing

1. Navigate to a book's detail page
2. Scroll to the "Reviews" section
3. Enter your name, select a rating (1-5 stars)
4. Optionally add a comment
5. Click "Submit Review"

## Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Features in Detail

### File Upload
- Supports PDF, EPUB, and MOBI formats
- Maximum file size: 50MB (configurable)
- Cover images up to 5MB
- Files stored securely in Supabase Storage

### Search Integration
- Real-time search with debouncing
- Integration with Open Library API
- Search by title, author, or keywords

### Book Management
- Automatic view and download tracking
- Category-based organization
- Metadata including ISBN, publisher, publish year

### Ratings & Reviews
- 5-star rating system
- User comments and feedback
- Automatic average rating calculation

## Building for Production

```bash
npm run build
npm start
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- [Open Library API](https://openlibrary.org/developers/api) for book data
- [Supabase](https://supabase.com) for backend infrastructure
- [Tailwind CSS](https://tailwindcss.com) for styling
- [Lucide](https://lucide.dev) for icons

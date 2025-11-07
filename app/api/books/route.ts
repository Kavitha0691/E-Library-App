import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Book } from '@/types';
import { dbToBook } from '@/lib/dbTransform';

// Explicitly list the columns we want to select (using snake_case as in database)
const BOOK_COLUMNS = `
  id,
  title,
  author,
  description,
  category,
  cover_image,
  file_url,
  file_name,
  file_size,
  file_type,
  uploaded_by,
  uploaded_at,
  view_count,
  download_count,
  average_rating,
  total_reviews,
  source,
  open_library_id,
  isbn,
  publish_year,
  publisher
`.replace(/\s+/g, ' ').trim();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    console.log('=== Books API GET ===');
    console.log('Category:', category);
    console.log('Search:', search);

    let query = supabase
      .from('books')
      .select(BOOK_COLUMNS)
      .order('uploaded_at', { ascending: false });

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,author.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch books', details: error.message },
        { status: 500 }
      );
    }

    // Transform database snake_case to TypeScript camelCase
    const books = (data || []).map(dbToBook);

    console.log('Successfully fetched', books.length, 'books from database');

    return NextResponse.json({ books });
  } catch (error: any) {
    console.error('Books API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch books', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const bookData = {
      ...body,
      uploaded_at: new Date().toISOString(),
      view_count: 0,
      download_count: 0,
      average_rating: 0,
      total_reviews: 0,
      source: 'user',
    };

    const { data, error } = await supabase
      .from('books')
      .insert([bookData])
      .select(BOOK_COLUMNS)
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create book', details: error.message },
        { status: 500 }
      );
    }

    // Transform database snake_case to TypeScript camelCase
    const book = dbToBook(data);

    return NextResponse.json({ book });
  } catch (error: any) {
    console.error('Books API error:', error);
    return NextResponse.json(
      { error: 'Failed to create book', details: error.message },
      { status: 500 }
    );
  }
}

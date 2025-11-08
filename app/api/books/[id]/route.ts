import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { dbToBook, bookToDb } from '@/lib/dbTransform';

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data, error } = await supabase
      .from('books')
      .select(BOOK_COLUMNS)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await supabase
      .from('books')
      .update({ view_count: (data.view_count || 0) + 1 })
      .eq('id', id);

    // Transform database snake_case to TypeScript camelCase
    const book = dbToBook(data);

    return NextResponse.json({ book });
  } catch (error) {
    console.error('Book API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch book' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Transform camelCase to snake_case for database
    const dbData = bookToDb(body);

    const { data, error } = await supabase
      .from('books')
      .update(dbData)
      .eq('id', id)
      .select(BOOK_COLUMNS)
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update book' },
        { status: 500 }
      );
    }

    // Transform database snake_case to TypeScript camelCase
    const book = dbToBook(data);

    return NextResponse.json({ book });
  } catch (error) {
    console.error('Book API error:', error);
    return NextResponse.json(
      { error: 'Failed to update book' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to delete book' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Book API error:', error);
    return NextResponse.json(
      { error: 'Failed to delete book' },
      { status: 500 }
    );
  }
}

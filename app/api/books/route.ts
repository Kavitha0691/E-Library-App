import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Book } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let query = supabase
      .from('books')
      .select('*')
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
        { error: 'Failed to fetch books' },
        { status: 500 }
      );
    }

    return NextResponse.json({ books: data || [] });
  } catch (error) {
    console.error('Books API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch books' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const book = {
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
      .insert([book])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create book' },
        { status: 500 }
      );
    }

    return NextResponse.json({ book: data });
  } catch (error) {
    console.error('Books API error:', error);
    return NextResponse.json(
      { error: 'Failed to create book' },
      { status: 500 }
    );
  }
}

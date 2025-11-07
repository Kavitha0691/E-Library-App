import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { dbToReview } from '@/lib/dbTransform';

const REVIEW_COLUMNS = `
  id,
  book_id,
  user_id,
  user_name,
  rating,
  comment,
  created_at,
  updated_at
`.replace(/\s+/g, ' ').trim();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const bookId = searchParams.get('bookId');

    if (!bookId) {
      return NextResponse.json(
        { error: 'Book ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('reviews')
      .select(REVIEW_COLUMNS)
      .eq('book_id', bookId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch reviews' },
        { status: 500 }
      );
    }

    // Transform database snake_case to TypeScript camelCase
    const reviews = (data || []).map(dbToReview);

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('Reviews API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const review = {
      book_id: body.bookId,
      user_id: body.userId,
      user_name: body.userName,
      rating: body.rating,
      comment: body.comment,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('reviews')
      .insert([review])
      .select(REVIEW_COLUMNS)
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create review' },
        { status: 500 }
      );
    }

    // Update book rating
    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('book_id', body.bookId);

    if (reviews) {
      const totalReviews = reviews.length;
      const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

      await supabase
        .from('books')
        .update({
          average_rating: averageRating,
          total_reviews: totalReviews,
        })
        .eq('id', body.bookId);
    }

    // Transform database snake_case to TypeScript camelCase
    const reviewData = dbToReview(data);

    return NextResponse.json({ review: reviewData });
  } catch (error) {
    console.error('Reviews API error:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}

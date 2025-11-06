import { NextRequest, NextResponse } from 'next/server';
import { searchOpenLibrary, searchBySubject, OPEN_LIBRARY_SUBJECTS } from '@/lib/openLibraryApi';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '20');

    // If category is provided, search by subject
    if (category && category !== 'all') {
      const subject = OPEN_LIBRARY_SUBJECTS[category] || category.toLowerCase();
      const books = await searchBySubject(subject, limit);
      return NextResponse.json({ books });
    }

    // Otherwise search by query
    if (!query) {
      return NextResponse.json(
        { error: 'Query or category parameter is required' },
        { status: 400 }
      );
    }

    const books = await searchOpenLibrary(query);

    return NextResponse.json({ books });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Failed to search books' },
      { status: 500 }
    );
  }
}

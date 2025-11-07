import { NextRequest, NextResponse } from 'next/server';
import { searchOpenLibrary, searchBySubject, OPEN_LIBRARY_SUBJECTS } from '@/lib/openLibraryApi';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '24');

    console.log('Search API called with:', { query, category, limit });

    // If category is provided, search by subject
    if (category && category !== 'all') {
      console.log('Fetching by category:', category);
      const subject = OPEN_LIBRARY_SUBJECTS[category] || category.toLowerCase();
      console.log('Using subject:', subject);
      const books = await searchBySubject(subject, limit);
      console.log('Returning', books.length, 'books for category', category);
      return NextResponse.json({ books, count: books.length });
    }

    // Otherwise search by query
    if (!query) {
      console.log('No query or category provided');
      return NextResponse.json(
        { error: 'Query or category parameter is required' },
        { status: 400 }
      );
    }

    console.log('Searching by query:', query);
    const books = await searchOpenLibrary(query);
    console.log('Returning', books.length, 'books for query', query);

    return NextResponse.json({ books, count: books.length });
  } catch (error: any) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Failed to search books', message: error.message },
      { status: 500 }
    );
  }
}

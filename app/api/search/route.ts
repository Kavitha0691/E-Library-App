import { NextRequest, NextResponse } from 'next/server';
import { searchOpenLibrary, searchBySubject, OPEN_LIBRARY_SUBJECTS } from '@/lib/openLibraryApi';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '24');

    console.log('=== Search API Called ===');
    console.log('Query:', query);
    console.log('Category:', category);
    console.log('Limit:', limit);

    // If category is provided, search by subject
    if (category && category !== 'all') {
      console.log('Fetching books for category:', category);
      const subject = OPEN_LIBRARY_SUBJECTS[category] || category.toLowerCase();
      console.log('Mapped to subject:', subject);

      try {
        const books = await searchBySubject(subject, limit);
        console.log('Successfully fetched', books.length, 'books');
        console.log('Sample book:', books[0]);

        return NextResponse.json({
          success: true,
          books,
          count: books.length,
          category,
          subject
        });
      } catch (error: any) {
        console.error('Error in searchBySubject:', error);
        return NextResponse.json({
          success: false,
          error: 'Failed to fetch category books',
          message: error.message,
          books: []
        }, { status: 500 });
      }
    }

    // Otherwise search by query
    if (!query) {
      console.log('No query or category provided, defaulting to Fiction');
      // Default to Fiction if no query or category
      const books = await searchBySubject('fiction', limit);
      return NextResponse.json({
        success: true,
        books,
        count: books.length,
        default: true
      });
    }

    console.log('Searching by query:', query);
    const books = await searchOpenLibrary(query);
    console.log('Search returned', books.length, 'books');

    return NextResponse.json({
      success: true,
      books,
      count: books.length,
      query
    });
  } catch (error: any) {
    console.error('Search API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to search books',
        message: error.message,
        stack: error.stack,
        books: []
      },
      { status: 500 }
    );
  }
}

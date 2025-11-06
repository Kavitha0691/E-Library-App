import { OpenLibrarySearchResponse, OpenLibraryBookDetails, Book } from '@/types';
import { getOpenLibraryCoverUrl } from './utils';

export async function searchOpenLibrary(query: string): Promise<Book[]> {
  try {
    const res = await fetch(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=20`
    );

    if (!res.ok) {
      throw new Error('Failed to search Open Library');
    }

    const data: OpenLibrarySearchResponse = await res.json();

    return data.docs.map((doc) => ({
      id: doc.key,
      title: doc.title,
      author: doc.author_name?.[0] || 'Unknown Author',
      description: doc.subject?.slice(0, 3).join(', ') || '',
      category: doc.subject?.[0] || 'Other',
      coverImage: doc.cover_i ? getOpenLibraryCoverUrl(doc.cover_i) : undefined,
      uploadedAt: new Date().toISOString(),
      viewCount: 0,
      downloadCount: 0,
      averageRating: 0,
      totalReviews: 0,
      source: 'openlibrary' as const,
      openLibraryId: doc.key,
      isbn: doc.isbn?.[0],
      publishYear: doc.first_publish_year,
      publisher: doc.publisher?.[0],
    }));
  } catch (error) {
    console.error('Error searching Open Library:', error);
    return [];
  }
}

export async function getOpenLibraryBookDetails(workId: string): Promise<OpenLibraryBookDetails | null> {
  try {
    const res = await fetch(`https://openlibrary.org${workId}.json`);

    if (!res.ok) {
      throw new Error('Failed to fetch book details');
    }

    return await res.json();
  } catch (error) {
    console.error('Error fetching Open Library book details:', error);
    return null;
  }
}

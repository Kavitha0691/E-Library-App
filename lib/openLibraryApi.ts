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

    return mapOpenLibraryBooks(data.docs);
  } catch (error) {
    console.error('Error searching Open Library:', error);
    return [];
  }
}

export async function searchBySubject(subject: string, limit: number = 20): Promise<Book[]> {
  try {
    const res = await fetch(
      `https://openlibrary.org/subjects/${encodeURIComponent(subject.toLowerCase())}.json?limit=${limit}`
    );

    if (!res.ok) {
      throw new Error('Failed to fetch subject books');
    }

    const data = await res.json();
    return mapOpenLibraryBooks(data.works || []);
  } catch (error) {
    console.error('Error fetching subject books:', error);
    return [];
  }
}

function mapOpenLibraryBooks(docs: any[]): Book[] {
  return docs.map((doc) => ({
    id: doc.key,
    title: doc.title,
    author: doc.author_name?.[0] || doc.authors?.[0]?.name || 'Unknown Author',
    description: doc.subject?.slice(0, 3).join(', ') || doc.first_sentence || '',
    category: doc.subject?.[0] || 'Other',
    coverImage: doc.cover_i
      ? getOpenLibraryCoverUrl(doc.cover_i)
      : doc.cover_id
        ? getOpenLibraryCoverUrl(doc.cover_id)
        : undefined,
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
    fileUrl: `https://openlibrary.org${doc.key}`,
  }));
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

export function getOpenLibraryReadUrl(workId: string): string {
  return `https://openlibrary.org${workId}`;
}

export function getOpenLibraryBorrowUrl(workId: string): string {
  return `https://openlibrary.org${workId}/borrow`;
}

// Category mapping for Open Library subjects
export const OPEN_LIBRARY_SUBJECTS: Record<string, string> = {
  'Fiction': 'fiction',
  'Non-Fiction': 'nonfiction',
  'Science': 'science',
  'Technology': 'technology',
  'History': 'history',
  'Biography': 'biography',
  'Self-Help': 'self_help',
  'Business': 'business',
  'Romance': 'romance',
  'Mystery': 'mystery',
  'Fantasy': 'fantasy',
  'Science Fiction': 'science_fiction',
  'Poetry': 'poetry',
  'Children': 'children',
  'Young Adult': 'young_adult',
  'Comics': 'comics',
};

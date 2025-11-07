import { OpenLibrarySearchResponse, OpenLibraryBookDetails, Book } from '@/types';
import { getOpenLibraryCoverUrl } from './utils';

const BASE_URL = "https://openlibrary.org";

export async function searchOpenLibrary(query: string): Promise<Book[]> {
  try {
    console.log('Searching Open Library for:', query);
    const res = await fetch(
      `${BASE_URL}/search.json?q=${encodeURIComponent(query)}&limit=20`
    );

    if (!res.ok) {
      throw new Error(`Failed to search Open Library: ${res.status}`);
    }

    const data: OpenLibrarySearchResponse = await res.json();
    console.log('Search results:', data.numFound, 'books found');

    if (!data.docs || data.docs.length === 0) {
      console.log('No books found in search');
      return [];
    }

    return mapSearchBooks(data.docs);
  } catch (error) {
    console.error('Error searching Open Library:', error);
    return [];
  }
}

export async function searchBySubject(subject: string, limit: number = 24): Promise<Book[]> {
  try {
    console.log('Fetching books for subject:', subject);
    const url = `${BASE_URL}/subjects/${encodeURIComponent(subject.toLowerCase())}.json?limit=${limit}`;
    console.log('Subject URL:', url);

    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Failed to fetch subject books: ${res.status}`);
    }

    const data = await res.json();
    console.log('Subject results:', data.work_count, 'total books,', data.works?.length, 'returned');

    if (!data.works || data.works.length === 0) {
      console.log('No books found for subject:', subject);
      return [];
    }

    return mapSubjectBooks(data.works);
  } catch (error) {
    console.error('Error fetching subject books:', error);
    return [];
  }
}

// Map books from search API (/search.json)
function mapSearchBooks(docs: any[]): Book[] {
  console.log('Mapping', docs.length, 'search results');
  return docs
    .filter(doc => doc.key && doc.title)
    .map((doc) => ({
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
      fileUrl: `${BASE_URL}${doc.key}`,
    }));
}

// Map books from subject API (/subjects/{subject}.json)
function mapSubjectBooks(works: any[]): Book[] {
  console.log('Mapping', works.length, 'subject books');
  return works
    .filter(work => work.key && work.title)
    .map((work) => {
      const authorName = work.authors?.[0]?.name || 'Unknown Author';
      const coverId = work.cover_id || work.cover_edition_key;

      return {
        id: work.key,
        title: work.title,
        author: authorName,
        description: work.first_sentence || work.subject?.slice(0, 3).join(', ') || '',
        category: work.subject?.[0] || 'Other',
        coverImage: coverId ? getOpenLibraryCoverUrl(coverId) : undefined,
        uploadedAt: new Date().toISOString(),
        viewCount: 0,
        downloadCount: 0,
        averageRating: 0,
        totalReviews: 0,
        source: 'openlibrary' as const,
        openLibraryId: work.key,
        isbn: work.availability?.isbn,
        publishYear: work.first_publish_year,
        publisher: work.publishers?.[0],
        fileUrl: `${BASE_URL}${work.key}`,
      };
    });
}

export async function getOpenLibraryBookDetails(workId: string): Promise<OpenLibraryBookDetails | null> {
  try {
    const res = await fetch(`${BASE_URL}${workId}.json`);

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
  return `${BASE_URL}${workId}`;
}

export function getOpenLibraryBorrowUrl(workId: string): string {
  return `${BASE_URL}${workId}/borrow`;
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

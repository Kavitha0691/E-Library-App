export interface OpenLibraryDoc {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  isbn?: string[];
  cover_i?: number;
  subject?: string[];
  publisher?: string[];
  language?: string[];
  number_of_pages_median?: number;
}

export interface OpenLibrarySearchResponse {
  numFound: number;
  start: number;
  numFoundExact: boolean;
  docs: OpenLibraryDoc[];
}

export interface OpenLibraryBookDetails {
  title: string;
  authors?: Array<{ name: string }>;
  description?: string | { value: string };
  covers?: number[];
  subjects?: string[];
  publish_date?: string;
  publishers?: string[];
  isbn_10?: string[];
  isbn_13?: string[];
  number_of_pages?: number;
}

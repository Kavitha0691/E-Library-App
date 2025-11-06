export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  bookCount: number;
}

export const CATEGORIES = [
  'Fiction',
  'Non-Fiction',
  'Science',
  'Technology',
  'History',
  'Biography',
  'Self-Help',
  'Business',
  'Romance',
  'Mystery',
  'Fantasy',
  'Science Fiction',
  'Poetry',
  'Children',
  'Young Adult',
  'Comics',
  'Other',
] as const;

export type CategoryType = typeof CATEGORIES[number];

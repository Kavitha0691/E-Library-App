export interface Book {
  id: string;
  title: string;
  author: string;
  description?: string;
  category: string;
  coverImage?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: 'pdf' | 'epub' | 'mobi';
  uploadedBy?: string;
  uploadedAt: string;
  viewCount: number;
  downloadCount: number;
  averageRating: number;
  totalReviews: number;
  source: 'user' | 'openlibrary';
  openLibraryId?: string;
  isbn?: string;
  publishYear?: number;
  publisher?: string;
}

export interface BookFormData {
  title: string;
  author: string;
  description?: string;
  category: string;
  file?: File;
  coverImage?: File;
  isbn?: string;
  publishYear?: number;
  publisher?: string;
}

export interface BookFilters {
  category?: string;
  search?: string;
  sortBy?: 'title' | 'author' | 'uploadedAt' | 'rating' | 'popular';
  sortOrder?: 'asc' | 'desc';
}

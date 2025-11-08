// Utility functions to transform between database snake_case and TypeScript camelCase

export function dbToBook(dbBook: any) {
  if (!dbBook) return null;

  return {
    id: dbBook.id,
    title: dbBook.title,
    author: dbBook.author,
    description: dbBook.description,
    category: dbBook.category,
    coverImage: dbBook.cover_image || dbBook.coverImage,
    fileUrl: dbBook.file_url || dbBook.fileUrl,
    fileName: dbBook.file_name || dbBook.fileName,
    fileSize: dbBook.file_size || dbBook.fileSize,
    fileType: dbBook.file_type || dbBook.fileType,
    uploadedBy: dbBook.uploaded_by || dbBook.uploadedBy,
    uploadedAt: dbBook.uploaded_at || dbBook.uploadedAt,
    viewCount: dbBook.view_count || dbBook.viewCount || 0,
    downloadCount: dbBook.download_count || dbBook.downloadCount || 0,
    averageRating: dbBook.average_rating || dbBook.averageRating || 0,
    totalReviews: dbBook.total_reviews || dbBook.totalReviews || 0,
    source: dbBook.source || 'user',
    openLibraryId: dbBook.open_library_id || dbBook.openLibraryId,
    isbn: dbBook.isbn,
    publishYear: dbBook.publish_year || dbBook.publishYear,
    publisher: dbBook.publisher,
  };
}

export function bookToDb(book: any) {
  return {
    id: book.id,
    title: book.title,
    author: book.author,
    description: book.description,
    category: book.category,
    cover_image: book.coverImage,
    file_url: book.fileUrl,
    file_name: book.fileName,
    file_size: book.fileSize,
    file_type: book.fileType,
    uploaded_by: book.uploadedBy,
    uploaded_at: book.uploadedAt || new Date().toISOString(),
    view_count: book.viewCount || 0,
    download_count: book.downloadCount || 0,
    average_rating: book.averageRating || 0,
    total_reviews: book.totalReviews || 0,
    source: book.source || 'user',
    open_library_id: book.openLibraryId,
    isbn: book.isbn,
    publish_year: book.publishYear,
    publisher: book.publisher,
  };
}

export function dbToReview(dbReview: any) {
  if (!dbReview) return null;

  return {
    id: dbReview.id,
    bookId: dbReview.book_id || dbReview.bookId,
    userId: dbReview.user_id || dbReview.userId,
    userName: dbReview.user_name || dbReview.userName,
    rating: dbReview.rating,
    comment: dbReview.comment,
    createdAt: dbReview.created_at || dbReview.createdAt,
    updatedAt: dbReview.updated_at || dbReview.updatedAt,
  };
}

export function reviewToDb(review: any) {
  return {
    id: review.id,
    book_id: review.bookId,
    user_id: review.userId,
    user_name: review.userName,
    rating: review.rating,
    comment: review.comment,
    created_at: review.createdAt || new Date().toISOString(),
    updated_at: review.updatedAt || new Date().toISOString(),
  };
}

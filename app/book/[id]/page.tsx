'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Book, Review } from '@/types';
import StarRating from '@/components/StarRating';
import ReviewCard from '@/components/ReviewCard';
import {
  Download,
  Eye,
  BookOpen,
  Calendar,
  User,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function BookDetailPage() {
  const params = useParams();
  const bookId = decodeURIComponent(params.id as string);

  const [book, setBook] = useState<Book | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: '',
    userName: '',
  });

  useEffect(() => {
    fetchBookDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId]);

  const fetchBookDetails = async () => {
    try {
      setLoading(true);

      // For user-uploaded books
      if (!bookId.startsWith('/works/')) {
        const response = await fetch(`/api/books/${bookId}`);
        const data = await response.json();

        if (response.ok) {
          setBook(data.book);
          fetchReviews(bookId);
        }
      } else {
        // For Open Library books, create a temporary book object
        // In a real app, you might want to save these to your database when viewed
        setBook({
          id: bookId,
          title: 'Loading...',
          author: 'Unknown',
          description: 'Book from Open Library',
          category: 'Other',
          uploadedAt: new Date().toISOString(),
          viewCount: 0,
          downloadCount: 0,
          averageRating: 0,
          totalReviews: 0,
          source: 'openlibrary',
        });
      }
    } catch (error) {
      console.error('Error fetching book details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async (id: string) => {
    try {
      const response = await fetch(`/api/reviews?bookId=${id}`);
      const data = await response.json();

      if (response.ok) {
        setReviews(data.reviews || []);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleDownload = async () => {
    if (!book?.fileUrl) return;

    try {
      // Record download count
      if (book.source === 'user') {
        await fetch(`/api/books/${bookId}/download`, {
          method: 'POST',
        });
      }

      // Trigger download
      window.open(book.fileUrl, '_blank');
    } catch (error) {
      console.error('Error downloading book:', error);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newReview.userName.trim()) {
      alert('Please enter your name');
      return;
    }

    try {
      setReviewLoading(true);

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId,
          userId: 'anonymous',
          userName: newReview.userName,
          rating: newReview.rating,
          comment: newReview.comment,
        }),
      });

      if (response.ok) {
        setNewReview({ rating: 5, comment: '', userName: '' });
        fetchReviews(bookId);
        fetchBookDetails();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500">Book not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="md:flex">
          {/* Book Cover */}
          <div className="md:w-1/3 bg-gray-200 relative h-96 md:h-auto">
            {book.coverImage ? (
              <Image
                src={book.coverImage}
                alt={book.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-100 to-blue-200">
                <BookOpen className="h-32 w-32 text-blue-400" />
              </div>
            )}
          </div>

          {/* Book Info */}
          <div className="md:w-2/3 p-8">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {book.title}
                </h1>
                <p className="text-xl text-gray-600 mb-4">by {book.author}</p>
              </div>

              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {book.category}
              </span>
            </div>

            <div className="flex items-center space-x-6 mb-6">
              <div className="flex items-center space-x-2">
                <StarRating rating={Math.round(book.averageRating)} readonly />
                <span className="text-sm text-gray-600">
                  {book.averageRating.toFixed(1)} ({book.totalReviews} reviews)
                </span>
              </div>

              <div className="flex items-center space-x-1 text-gray-600">
                <Eye className="h-4 w-4" />
                <span className="text-sm">{book.viewCount} views</span>
              </div>

              {book.source === 'user' && (
                <div className="flex items-center space-x-1 text-gray-600">
                  <Download className="h-4 w-4" />
                  <span className="text-sm">{book.downloadCount} downloads</span>
                </div>
              )}
            </div>

            {book.description && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
                <p className="text-gray-700">{book.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              {book.publisher && (
                <div className="flex items-center space-x-2 text-gray-600">
                  <User className="h-4 w-4" />
                  <span>Publisher: {book.publisher}</span>
                </div>
              )}

              {book.publishYear && (
                <div className="flex items-center space-x-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Published: {book.publishYear}</span>
                </div>
              )}

              {book.isbn && (
                <div className="flex items-center space-x-2 text-gray-600">
                  <span className="font-medium">ISBN:</span>
                  <span>{book.isbn}</span>
                </div>
              )}

              <div className="flex items-center space-x-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Added: {formatDate(book.uploadedAt)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {book.source === 'user' && book.fileUrl && (
                <div className="flex space-x-4">
                  <button
                    onClick={handleDownload}
                    className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <Download className="h-5 w-5" />
                    <span>Download</span>
                  </button>

                  <a
                    href={book.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                  >
                    <BookOpen className="h-5 w-5" />
                    <span>Read Online</span>
                  </a>
                </div>
              )}

              {book.source === 'openlibrary' && (
                <>
                  <a
                    href={`https://openlibrary.org${book.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <BookOpen className="h-5 w-5" />
                    <span>Read on Open Library</span>
                  </a>

                  <a
                    href={`https://archive.org/search?query=${encodeURIComponent(book.title + ' ' + book.author)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    <Download className="h-5 w-5" />
                    <span>Search on Internet Archive</span>
                  </a>

                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(book.title + ' ' + book.author + ' pdf')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                  >
                    <ExternalLink className="h-5 w-5" />
                    <span>Find PDF Online</span>
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Reviews</h2>

        {/* Add Review Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Write a Review
          </h3>

          <form onSubmit={handleSubmitReview}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={newReview.userName}
                onChange={(e) =>
                  setNewReview({ ...newReview, userName: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <StarRating
                rating={newReview.rating}
                onChange={(rating) => setNewReview({ ...newReview, rating })}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comment (Optional)
              </label>
              <textarea
                value={newReview.comment}
                onChange={(e) =>
                  setNewReview({ ...newReview, comment: e.target.value })
                }
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={reviewLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {reviewLoading ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No reviews yet. Be the first to review this book!
            </p>
          ) : (
            reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

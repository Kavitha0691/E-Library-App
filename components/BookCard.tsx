'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Book } from '@/types';
import { Star, Download, Eye, BookOpen } from 'lucide-react';
import { truncateText } from '@/lib/utils';

interface BookCardProps {
  book: Book;
}

export default function BookCard({ book }: BookCardProps) {
  const [imageError, setImageError] = useState(false);

  const handleClick = () => {
    // Store book data in sessionStorage so the detail page can access it
    sessionStorage.setItem('currentBook', JSON.stringify(book));
  };

  return (
    <Link href={`/book/${encodeURIComponent(book.id)}`} onClick={handleClick}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
        <div className="relative h-64 bg-gray-200">
          {book.coverImage && !imageError ? (
            <Image
              src={book.coverImage}
              alt={book.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={() => {
                console.error('Cover image failed to load for book:', book.title);
                setImageError(true);
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-100 to-blue-200">
              <BookOpen className="h-16 w-16 text-blue-400" />
            </div>
          )}
        </div>

        <div className="p-4 flex-1 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
            {book.title}
          </h3>

          <p className="text-sm text-gray-600 mb-2">{book.author}</p>

          {book.description && (
            <p className="text-sm text-gray-500 mb-3 line-clamp-2">
              {truncateText(book.description, 100)}
            </p>
          )}

          <div className="mt-auto">
            <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {book.category}
              </span>

              {book.publishYear && (
                <span className="text-xs">{book.publishYear}</span>
              )}
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span>{book.averageRating.toFixed(1)}</span>
                <span className="text-gray-400">({book.totalReviews})</span>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>{book.viewCount}</span>
                </div>
                {book.source === 'user' && (
                  <div className="flex items-center space-x-1">
                    <Download className="h-4 w-4" />
                    <span>{book.downloadCount}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

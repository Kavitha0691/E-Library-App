'use client';

import { Review } from '@/types';
import { formatDate } from '@/lib/utils';
import StarRating from './StarRating';

interface ReviewCardProps {
  review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-medium text-gray-900">{review.userName}</p>
          <p className="text-xs text-gray-500">{formatDate(review.createdAt)}</p>
        </div>
        <StarRating rating={review.rating} readonly size="sm" />
      </div>

      {review.comment && (
        <p className="text-gray-700 text-sm mt-2">{review.comment}</p>
      )}
    </div>
  );
}

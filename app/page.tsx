'use client';

import { useState, useEffect } from 'react';
import { Book } from '@/types';
import BookCard from '@/components/BookCard';
import SearchBar from '@/components/SearchBar';
import CategoryFilter from '@/components/CategoryFilter';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Fiction');

  // Fetch Open Library books by category
  const fetchBooks = async (category: string) => {
    try {
      setLoading(true);
      setError('');

      const url = `/api/search?category=${encodeURIComponent(category)}&limit=24`;
      console.log('🔍 Fetching from:', url);

      const response = await fetch(url);
      const data = await response.json();

      console.log('📦 Response:', data);

      if (response.ok && data.books && data.books.length > 0) {
        console.log('✅ Successfully loaded', data.books.length, 'books');
        setBooks(data.books);
        setError('');
      } else {
        console.error('❌ Failed to load books:', data);
        setError('Unable to load books from Open Library. Please check your internet connection and try again.');
        setBooks([]);
      }
    } catch (error: any) {
      console.error('❌ Error:', error);
      setError(`Error loading books: ${error.message}. Please check your internet connection.`);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  // Search Open Library
  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      // No search query - show category books
      fetchBooks(selectedCategory);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const url = `/api/search?q=${encodeURIComponent(query)}`;
      console.log('🔍 Searching:', url);

      const response = await fetch(url);
      const data = await response.json();

      console.log('📦 Search results:', data);

      if (response.ok && data.books && data.books.length > 0) {
        console.log('✅ Found', data.books.length, 'books');
        setBooks(data.books);
        setError('');
      } else {
        setError(`No books found for "${query}". Try a different search term.`);
        setBooks([]);
      }
    } catch (error: any) {
      console.error('❌ Search error:', error);
      setError(`Search failed: ${error.message}`);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle category change
  const handleCategoryChange = (category: string) => {
    console.log('📚 Category changed to:', category);
    setSelectedCategory(category);
    setSearchQuery('');
    fetchBooks(category);
  };

  // Load Fiction books on mount
  useEffect(() => {
    console.log('🚀 Page loaded, fetching Fiction books...');
    fetchBooks('Fiction');
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          E-Library - Open Library Collection
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Discover and read millions of books from Open Library
        </p>

        {/* Search Bar */}
        <div className="flex justify-center mb-6">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search millions of books..."
          />
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
          />
        </div>

        {/* Info */}
        <div className="text-sm text-gray-500 mb-4">
          {searchQuery ? (
            <p>Showing search results for "<strong>{searchQuery}</strong>"</p>
          ) : (
            <p>Browsing <strong>{selectedCategory}</strong> books from Open Library</p>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
          <button
            onClick={() => fetchBooks(selectedCategory)}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading books...</span>
        </div>
      )}

      {/* Books Grid */}
      {!loading && books.length > 0 && (
        <div>
          <div className="mb-4 text-sm text-gray-600 text-center">
            ✅ Showing {books.length} books
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.map((book, index) => (
              <BookCard key={`${book.id}-${index}`} book={book} />
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && !error && books.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">
            No books found. Try a different category or search term.
          </p>
          <button
            onClick={() => fetchBooks('Fiction')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Browse Fiction Books
          </button>
        </div>
      )}
    </div>
  );
}

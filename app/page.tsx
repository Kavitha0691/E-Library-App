'use client';

import { useState, useEffect } from 'react';
import { Book } from '@/types';
import BookCard from '@/components/BookCard';
import SearchBar from '@/components/SearchBar';
import CategoryFilter from '@/components/CategoryFilter';
import { Loader2, BookOpen, Library } from 'lucide-react';

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Fiction');
  const [source, setSource] = useState<'library' | 'openlibrary'>('openlibrary');

  // Fetch user-uploaded books from database
  const fetchLibraryBooks = async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();

      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      console.log('Fetching library books...');
      const response = await fetch(`/api/books?${params.toString()}`);
      const data = await response.json();

      console.log('Library response:', data);

      if (response.ok) {
        setBooks(data.books || []);
      } else {
        setError(data.error || 'Failed to fetch books');
        setBooks([]);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
      setError('Network error while fetching books');
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Open Library books by category
  const fetchOpenLibraryBooks = async (category: string) => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();

      const categoryToFetch = category === 'all' ? 'Fiction' : category;
      params.append('category', categoryToFetch);
      params.append('limit', '24');

      const url = `/api/search?${params.toString()}`;
      console.log('Fetching Open Library books from:', url);

      const response = await fetch(url);
      const data = await response.json();

      console.log('Open Library API Response:', data);
      console.log('Number of books:', data.books?.length || 0);

      if (response.ok && data.books) {
        console.log('Setting books:', data.books.length);
        setBooks(data.books);
        setError('');
      } else {
        console.error('API error:', data);
        setError(data.message || data.error || 'Failed to fetch books');
        setBooks([]);
      }
    } catch (error: any) {
      console.error('Error fetching Open Library books:', error);
      setError(`Network error: ${error.message}`);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  // Search Open Library or local library
  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      // No search query - show category books
      if (source === 'openlibrary') {
        fetchOpenLibraryBooks(selectedCategory);
      } else {
        fetchLibraryBooks();
      }
      return;
    }

    try {
      setLoading(true);
      setError('');

      if (source === 'openlibrary') {
        // Search Open Library
        const url = `/api/search?q=${encodeURIComponent(query)}`;
        console.log('Searching Open Library:', url);

        const response = await fetch(url);
        const data = await response.json();

        console.log('Search response:', data);

        if (response.ok && data.books) {
          setBooks(data.books);
          setError('');
        } else {
          setError(data.message || 'Search failed');
          setBooks([]);
        }
      } else {
        // Search local library
        fetchLibraryBooks();
      }
    } catch (error: any) {
      console.error('Error searching:', error);
      setError(`Search error: ${error.message}`);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle category change
  const handleCategoryChange = (category: string) => {
    console.log('Category changed to:', category);
    setSelectedCategory(category);
    setSearchQuery('');
    setError('');
  };

  // Handle source toggle
  const handleSourceToggle = (newSource: 'library' | 'openlibrary') => {
    console.log('Source toggled to:', newSource);
    setSource(newSource);
    setSearchQuery('');
    setError('');
    setSelectedCategory(newSource === 'openlibrary' ? 'Fiction' : 'all');
  };

  // Load books on mount or when source/category changes
  useEffect(() => {
    console.log('Effect triggered - Source:', source, 'Category:', selectedCategory, 'Search:', searchQuery);

    if (searchQuery) {
      handleSearch(searchQuery);
    } else if (source === 'openlibrary') {
      fetchOpenLibraryBooks(selectedCategory);
    } else {
      fetchLibraryBooks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to E-Library
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Discover and read thousands of books from our collection and Open Library
        </p>

        {/* Source Toggle */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex rounded-lg border border-gray-300 p-1 bg-gray-50">
            <button
              onClick={() => handleSourceToggle('openlibrary')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition ${
                source === 'openlibrary'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Open Library</span>
            </button>
            <button
              onClick={() => handleSourceToggle('library')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition ${
                source === 'library'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Library className="h-4 w-4" />
              <span>My Library</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex justify-center mb-6">
          <SearchBar
            onSearch={handleSearch}
            placeholder={source === 'openlibrary' ? 'Search millions of books...' : 'Search your library...'}
          />
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
          />
        </div>

        {/* Source Indicator */}
        <div className="text-sm text-gray-500">
          {searchQuery ? (
            <p>Showing search results from {source === 'openlibrary' ? 'Open Library' : 'your library'}</p>
          ) : (
            <p>
              {source === 'openlibrary'
                ? `Browsing ${selectedCategory !== 'all' ? selectedCategory : 'Popular'} books from Open Library`
                : 'Showing books from your library'}
            </p>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Books Grid */}
      {loading ? (
        <div className="flex flex-col justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
          <p className="text-gray-600">Loading books...</p>
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">
            {searchQuery
              ? 'No books found matching your search.'
              : source === 'library'
                ? 'No books in your library yet. Upload your first book or browse Open Library!'
                : 'No books found in this category. Try another category or check your internet connection.'}
          </p>
          {!searchQuery && source === 'openlibrary' && (
            <button
              onClick={() => fetchOpenLibraryBooks(selectedCategory)}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Retry Loading Books
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="text-center text-gray-600 mb-4">
            Showing {books.length} books
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book, index) => (
              <BookCard key={`${book.id}-${index}`} book={book} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

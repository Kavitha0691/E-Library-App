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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Fiction');
  const [source, setSource] = useState<'library' | 'openlibrary'>('openlibrary');

  // Fetch user-uploaded books from database
  const fetchLibraryBooks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetch(`/api/books?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setBooks(data.books || []);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Open Library books by category
  const fetchOpenLibraryBooks = async (category: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (category !== 'all') {
        params.append('category', category);
      } else {
        params.append('category', 'Fiction');
      }

      params.append('limit', '24');

      const response = await fetch(`/api/search?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setBooks(data.books || []);
      }
    } catch (error) {
      console.error('Error fetching Open Library books:', error);
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

      if (source === 'openlibrary') {
        // Search Open Library
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        if (response.ok) {
          setBooks(data.books || []);
        }
      } else {
        // Search local library
        fetchLibraryBooks();
      }
    } catch (error) {
      console.error('Error searching:', error);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSearchQuery('');
  };

  // Handle source toggle
  const handleSourceToggle = (newSource: 'library' | 'openlibrary') => {
    setSource(newSource);
    setSearchQuery('');
    setSelectedCategory(newSource === 'openlibrary' ? 'Fiction' : 'all');
  };

  // Load books on mount or when source/category changes
  useEffect(() => {
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

      {/* Books Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">
            {searchQuery
              ? 'No books found matching your search.'
              : source === 'library'
                ? 'No books in your library yet. Upload your first book or browse Open Library!'
                : 'No books found in this category.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}

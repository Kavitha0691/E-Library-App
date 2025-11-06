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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchType, setSearchType] = useState<'library' | 'openlibrary'>('library');

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

  // Search Open Library API
  const searchOpenLibrary = async (query: string) => {
    if (!query.trim()) {
      fetchLibraryBooks();
      setSearchType('library');
      return;
    }

    try {
      setLoading(true);
      setSearchType('openlibrary');

      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (response.ok) {
        setBooks(data.books || []);
      }
    } catch (error) {
      console.error('Error searching Open Library:', error);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load and category changes
  useEffect(() => {
    if (searchQuery && searchType === 'openlibrary') {
      searchOpenLibrary(searchQuery);
    } else {
      fetchLibraryBooks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      searchOpenLibrary(query);
    } else {
      setSearchType('library');
      fetchLibraryBooks();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to E-Library
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Discover and read thousands of books from our collection and Open Library
        </p>

        <div className="flex justify-center mb-6">
          <SearchBar onSearch={handleSearch} />
        </div>

        {searchType === 'library' && (
          <div className="mb-6">
            <CategoryFilter
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>
        )}

        <div className="text-sm text-gray-500">
          {searchType === 'openlibrary' ? (
            <p>Showing results from Open Library API</p>
          ) : (
            <p>Showing books from our library</p>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">
            {searchQuery
              ? 'No books found matching your search.'
              : 'No books available yet. Upload your first book!'}
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

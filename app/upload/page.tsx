'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import FileUpload from '@/components/FileUpload';
import { CATEGORIES } from '@/types';
import { Loader2, Upload, CheckCircle } from 'lucide-react';

export default function UploadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string>('');
  const [warnings, setWarnings] = useState<string[]>([]);
  const [bookFile, setBookFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    category: 'Other',
    isbn: '',
    publishYear: '',
    publisher: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setWarnings([]);

    if (!bookFile) {
      setError('Please select a book file to upload');
      return;
    }

    try {
      setLoading(true);

      // Step 1: Upload files to Supabase Storage
      const uploadFormData = new FormData();
      uploadFormData.append('file', bookFile);
      if (coverFile) {
        uploadFormData.append('coverImage', coverFile);
      }

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        // Check if it's a storage configuration error
        if (uploadResponse.status === 503) {
          setError(
            `Storage Configuration Required:\n\n${uploadData.details}\n\nPlease follow the instructions in STORAGE_TROUBLESHOOTING.md to set up your storage buckets.`
          );
          return;
        }
        throw new Error(uploadData.error || 'Failed to upload files');
      }

      // Check for warnings about file accessibility
      if (uploadData.warnings && uploadData.warnings.length > 0) {
        setWarnings(uploadData.warnings);
      }

      // Step 2: Create book record in database
      const fileType = bookFile.name.split('.').pop()?.toLowerCase() as 'pdf' | 'epub' | 'mobi';

      // Use snake_case for database columns
      const bookData = {
        title: formData.title,
        author: formData.author,
        description: formData.description || undefined,
        category: formData.category,
        isbn: formData.isbn || undefined,
        publish_year: formData.publishYear ? parseInt(formData.publishYear) : undefined,
        publisher: formData.publisher || undefined,
        file_url: uploadData.fileUrl,
        file_name: uploadData.fileName,
        file_size: uploadData.fileSize,
        file_type: fileType,
        cover_image: uploadData.coverUrl,
      };

      const createResponse = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookData),
      });

      if (!createResponse.ok) {
        throw new Error('Failed to create book record');
      }

      const { book } = await createResponse.json();

      setSuccess(true);

      // Redirect to book detail page after 2 seconds
      setTimeout(() => {
        router.push(`/book/${book.id}`);
      }, 2000);
    } catch (error: any) {
      console.error('Error uploading book:', error);
      setError(`Failed to upload book: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Book Uploaded Successfully!
          </h2>
          <p className="text-gray-600">Redirecting to book details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center space-x-3 mb-6">
          <Upload className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Upload a Book</h1>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-semibold mb-1">Error:</p>
            <p className="whitespace-pre-line">{error}</p>
          </div>
        )}

        {/* Warning Messages */}
        {warnings.length > 0 && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
            <p className="font-semibold mb-1">Warning:</p>
            {warnings.map((warning, index) => (
              <p key={index} className="text-sm">{warning}</p>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Book File Upload */}
          <div className="mb-6">
            <FileUpload
              onFileSelect={setBookFile}
              onFileRemove={() => setBookFile(null)}
              selectedFile={bookFile}
              label="Book File (PDF, EPUB, MOBI)"
              accept=".pdf,.epub,.mobi"
            />
          </div>

          {/* Cover Image Upload */}
          <div className="mb-6">
            <FileUpload
              onFileSelect={setCoverFile}
              onFileRemove={() => setCoverFile(null)}
              selectedFile={coverFile}
              label="Cover Image (Optional)"
              accept=".jpg,.jpeg,.png,.webp"
              maxSize={5 * 1024 * 1024}
            />
          </div>

          {/* Title */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter book title"
            />
          </div>

          {/* Author */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Author *
            </label>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter author name"
            />
          </div>

          {/* Category */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter book description"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* ISBN */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ISBN
              </label>
              <input
                type="text"
                name="isbn"
                value={formData.isbn}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="ISBN"
              />
            </div>

            {/* Publish Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Publish Year
              </label>
              <input
                type="number"
                name="publishYear"
                value={formData.publishYear}
                onChange={handleInputChange}
                min="1000"
                max={new Date().getFullYear()}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="2024"
              />
            </div>

            {/* Publisher */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Publisher
              </label>
              <input
                type="text"
                name="publisher"
                value={formData.publisher}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Publisher name"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  <span>Upload Book</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => router.push('/')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

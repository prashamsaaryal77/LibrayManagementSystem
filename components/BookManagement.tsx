'use client';

import { useState, useEffect } from 'react';
import { bookAPI } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Plus, X, Package } from 'lucide-react';

interface Book {
  _id: string;
  bookId: string;
  title: string;
  author: string;
  isbn: string;
  totalCopies: number;
  availableCopies: number;
  maxBorrowDays: number;
}

export default function BookManagement() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingStockBookId, setEditingStockBookId] = useState<string | null>(null);
  const [addStockCount, setAddStockCount] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    totalCopies: 5,
    maxBorrowDays: 14,
  });

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const response = await bookAPI.getAll();
      setBooks(response.data.data || []);
    } catch (err) {
      setError('Failed to load books');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await bookAPI.create({
        ...formData,
        totalCopies: parseInt(formData.totalCopies as any),
        maxBorrowDays: parseInt(formData.maxBorrowDays as any),
      });
      setSuccess('Book added successfully! Book ID will be auto-generated.');
      setFormData({
        title: '',
        author: '',
        isbn: '',
        totalCopies: 5,
        maxBorrowDays: 14,
      });
      setShowForm(false);
      loadBooks();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add book');
    }
  };

  const handleAddStock = async (book: Book) => {
    setError('');
    setSuccess('');

    try {
      const newTotalCopies = book.totalCopies + addStockCount;
      await bookAPI.update(book.bookId, { totalCopies: newTotalCopies });
      setSuccess(`Added ${addStockCount} copies to "${book.title}". New total: ${newTotalCopies}`);
      setEditingStockBookId(null);
      setAddStockCount(1);
      loadBooks();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update stock');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading books...</div>;
  }

  const getAvailabilityColor = (available: number, total: number) => {
    const percentage = (available / total) * 100;
    if (percentage === 0) return 'text-red-600 font-medium';
    if (percentage < 30) return 'text-orange-600 font-medium';
    return 'text-green-600 font-medium';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Book Management</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add New Book'}
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded text-red-700">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded text-green-700">
          <CheckCircle2 className="w-4 h-4" />
          {success}
        </div>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Book</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-blue-50 p-3 rounded text-sm text-blue-700 mb-4">
                Book ID will be auto-generated in format: BK00001, BK00002, etc.
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full border rounded px-3 py-2"
                  placeholder="Book title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Author</label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  required
                  className="w-full border rounded px-3 py-2"
                  placeholder="Author name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">ISBN</label>
                <input
                  type="text"
                  value={formData.isbn}
                  onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                  required
                  className="w-full border rounded px-3 py-2"
                  placeholder="ISBN number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Total Copies</label>
                <input
                  type="number"
                  value={formData.totalCopies}
                  onChange={(e) => setFormData({ ...formData, totalCopies: parseInt(e.target.value) })}
                  min="1"
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Max Borrow Days</label>
                <input
                  type="number"
                  value={formData.maxBorrowDays}
                  onChange={(e) => setFormData({ ...formData, maxBorrowDays: parseInt(e.target.value) })}
                  min="1"
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <Button type="submit" className="w-full">
                Add Book
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Books Catalog</CardTitle>
          <CardDescription>Total books: {books.length}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-2 px-2">Book ID</th>
                  <th className="text-left py-2 px-2">Title</th>
                  <th className="text-left py-2 px-2">Author</th>
                  <th className="text-left py-2 px-2">Available</th>
                  <th className="text-left py-2 px-2">Total</th>
                  <th className="text-left py-2 px-2">Days</th>
                  <th className="text-left py-2 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book._id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-2 font-medium">{book.bookId}</td>
                    <td className="py-2 px-2">{book.title}</td>
                    <td className="py-2 px-2 text-gray-600">{book.author}</td>
                    <td className={`py-2 px-2 ${getAvailabilityColor(book.availableCopies, book.totalCopies)}`}>
                      {book.availableCopies}
                    </td>
                    <td className="py-2 px-2">{book.totalCopies}</td>
                    <td className="py-2 px-2">{book.maxBorrowDays}</td>
                    <td className="py-2 px-2">
                      {editingStockBookId === book.bookId ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            value={addStockCount}
                            onChange={(e) => setAddStockCount(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-16 border rounded px-2 py-1 text-sm"
                          />
                          <button
                            onClick={() => handleAddStock(book)}
                            className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => { setEditingStockBookId(null); setAddStockCount(1); }}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setEditingStockBookId(book.bookId)}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium transition-colors"
                          title="Add copies to stock"
                        >
                          <Package className="w-3.5 h-3.5" />
                          Add Stock
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

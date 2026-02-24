'use client';

import { useState, useEffect } from 'react';
import { transactionAPI, memberAPI, bookAPI } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface Member {
  memberId: string;
  name: string;
  status: string;
  maxBorrowLimit: number;
}

interface Book {
  bookId: string;
  title: string;
  author: string;
  availableCopies: number;
}

export default function IssueBookForm() {
  const [members, setMembers] = useState<Member[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [selectedBookId, setSelectedBookId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);

  useEffect(() => {
    loadMembersAndBooks();
  }, []);

  const loadMembersAndBooks = async () => {
    try {
      const [membersRes, booksRes] = await Promise.all([
        memberAPI.getAll(),
        bookAPI.getAll(),
      ]);
      setMembers(membersRes.data.data || []);
      setBooks(booksRes.data.data || []);
    } catch (err) {
      setError('Failed to load members and books');
      console.error(err);
    }
  };

  const handleIssueBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await transactionAPI.issue({
        memberId: selectedMemberId,
        bookId: selectedBookId,
        issueDate: new Date().toISOString(),
      });

      setSuccessData(response.data.data);
      setSuccess(true);
      setSelectedMemberId('');
      setSelectedBookId('');

      // Reload data
      setTimeout(() => loadMembersAndBooks(), 1000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to issue book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Issue Book to Member</CardTitle>
          <CardDescription>Follow the library algorithm to issue books</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleIssueBook} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select Member</label>
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                required
                className="w-full border rounded px-3 py-2"
              >
                <option value="">-- Choose a member --</option>
                {members.map((member) => (
                  <option key={member.memberId} value={member.memberId}>
                    {member.name} ({member.memberId}) - {member.status}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Select Book</label>
              <select
                value={selectedBookId}
                onChange={(e) => setSelectedBookId(e.target.value)}
                required
                className="w-full border rounded px-3 py-2"
              >
                <option value="">-- Choose a book --</option>
                {books.map((book) => (
                  <option key={book.bookId} value={book.bookId}>
                    {book.title} - {book.author} ({book.availableCopies} available)
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {success && successData && (
              <div className="space-y-2 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Book Issued Successfully!
                </div>
                <div className="text-xs space-y-1">
                  <p>
                    <strong>Transaction ID:</strong> {successData.transactionId}
                  </p>
                  <p>
                    <strong>Member:</strong> {successData.memberName}
                  </p>
                  <p>
                    <strong>Book:</strong> {successData.bookTitle}
                  </p>
                  <p>
                    <strong>Issue Date:</strong> {new Date(successData.issueDate).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Due Date:</strong> {new Date(successData.dueDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Processing...' : 'Issue Book'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

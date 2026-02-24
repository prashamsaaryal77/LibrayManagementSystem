'use client';

import { useState, useEffect } from 'react';
import { transactionAPI } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface IssuedTransaction {
  transactionId: string;
  memberId: string;
  bookId: string;
  issueDate: string;
  dueDate: string;
}

export default function ReturnBookForm() {
  const [transactions, setTransactions] = useState<IssuedTransaction[]>([]);
  const [selectedTransactionId, setSelectedTransactionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);

  useEffect(() => {
    loadIssuedBooks();
  }, []);

  const loadIssuedBooks = async () => {
    try {
      const response = await transactionAPI.getAll();
      const issued = response.data.data.filter(
        (txn: any) => txn.status === 'Issued' || txn.status === 'Overdue'
      );
      setTransactions(issued);
    } catch (err) {
      setError('Failed to load issued books');
      console.error(err);
    }
  };

  const handleReturnBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await transactionAPI.return({
        transactionId: selectedTransactionId,
        returnDate: new Date().toISOString(),
      });

      setSuccessData(response.data.data);
      setSuccess(true);
      setSelectedTransactionId('');

      // Reload data
      setTimeout(() => loadIssuedBooks(), 1000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to return book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Return Book</CardTitle>
          <CardDescription>Process book return and calculate fines if applicable</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleReturnBook} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select Book to Return</label>
              <select
                value={selectedTransactionId}
                onChange={(e) => setSelectedTransactionId(e.target.value)}
                required
                className="w-full border rounded px-3 py-2"
              >
                <option value="">-- Choose a transaction --</option>
                {transactions.map((txn) => {
                  const daysOverdue = Math.max(0, Math.floor((new Date().getTime() - new Date(txn.dueDate).getTime()) / (1000 * 60 * 60 * 24)));
                  const overdue = daysOverdue > 0 ? ` (${daysOverdue} days overdue)` : '';
                  return (
                    <option key={txn.transactionId} value={txn.transactionId}>
                      {txn.memberId} - Book: {txn.bookId}{overdue}
                    </option>
                  );
                })}
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
                  Book Returned Successfully!
                </div>
                <div className="text-xs space-y-1">
                  <p>
                    <strong>Transaction ID:</strong> {successData.transactionId}
                  </p>
                  <p>
                    <strong>Book:</strong> {successData.bookTitle}
                  </p>
                  <p>
                    <strong>Return Date:</strong> {new Date(successData.returnDate).toLocaleDateString()}
                  </p>
                  {successData.fineAmount > 0 && (
                    <p className="text-red-600">
                      <strong>Fine Amount:</strong> ₹{successData.fineAmount}
                    </p>
                  )}
                  <p className="text-xs">
                    <strong>Status:</strong> {successData.message}
                  </p>
                </div>
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Processing...' : 'Return Book'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

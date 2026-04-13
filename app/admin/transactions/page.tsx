'use client';

import { useState, useEffect } from 'react';
import { transactionAPI } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Transaction {
  _id: string;
  transactionId: string;
  memberId: string;
  bookId: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  status: string;
  fineAmount: number;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const response = await transactionAPI.getAll();
      const updatedTransactions = (response.data.data || []).map((t: any) => {
        if (t.status === 'Issued' && new Date(t.dueDate) < new Date()) {
          return { ...t, status: 'Overdue' };
        }
        return t;
      });
      setTransactions(updatedTransactions);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions =
    filterStatus === 'All' ? transactions : transactions.filter((t) => t.status === filterStatus);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Issued':
        return 'bg-pink-100 text-pink-800';
      case 'Overdue':
        return 'bg-red-100 text-red-800';
      case 'Returned':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading transactions...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Transaction History</h1>
        <p className="text-gray-600 mt-2">View all book issue and return transactions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {['All', 'Issued', 'Returned', 'Overdue'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded font-medium transition-colors ${
                  filterStatus === status
                    ? 'bg-pink-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>Total: {filteredTransactions.length}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-2 px-2">Transaction ID</th>
                  <th className="text-left py-2 px-2">Member ID</th>
                  <th className="text-left py-2 px-2">Book ID</th>
                  <th className="text-left py-2 px-2">Issue Date</th>
                  <th className="text-left py-2 px-2">Due Date</th>
                  <th className="text-left py-2 px-2">Return Date</th>
                  <th className="text-left py-2 px-2">Status</th>
                  <th className="text-left py-2 px-2">Fine</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((txn) => (
                  <tr key={txn._id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-2 font-mono text-xs">{txn.transactionId}</td>
                    <td className="py-2 px-2">{txn.memberId}</td>
                    <td className="py-2 px-2">{txn.bookId}</td>
                    <td className="py-2 px-2">{new Date(txn.issueDate).toLocaleDateString()}</td>
                    <td className="py-2 px-2">{new Date(txn.dueDate).toLocaleDateString()}</td>
                    <td className="py-2 px-2">
                      {txn.returnDate ? new Date(txn.returnDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="py-2 px-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(txn.status)}`}>
                        {txn.status}
                      </span>
                    </td>
                    <td className="py-2 px-2">
                      {txn.fineAmount > 0 ? <span className="text-red-600 font-medium">₹{txn.fineAmount}</span> : '-'}
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

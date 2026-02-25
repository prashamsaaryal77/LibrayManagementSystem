'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookOpen, Search, User, Calendar, AlertCircle, Library, Settings } from 'lucide-react';
import { memberAPI, transactionAPI, bookAPI } from '@/services/api';
import { format } from 'date-fns';

interface Member {
  _id: string;
  memberId: string;
  name: string;
  email: string;
  status: string;
  maxBorrowLimit: number;
}

interface Transaction {
  _id: string;
  transactionId: string;
  bookId: string;
  issueDate: string;
  dueDate: string;
  returnDate: string | null;
  status: string;
  fineAmount: number;
}

interface Book {
  _id: string;
  bookId: string;
  title: string;
  author: string;
}

export default function LibraryHomePage() {
  const [memberIdInput, setMemberIdInput] = useState('');
  const [member, setMember] = useState<Member | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [booksMap, setBooksMap] = useState<Record<string, Book>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberIdInput.trim()) return;

    setLoading(true);
    setError('');
    setMember(null);
    setTransactions([]);

    try {
      // Fetch member
      const memberRes = await memberAPI.getById(memberIdInput);
      const memberData = memberRes.data.data;
      setMember(memberData);

      // Fetch transactions
      const txRes = await transactionAPI.getMemberTransactions(memberData._id); 
      let txs = [];
      try {
        const txRes1 = await transactionAPI.getMemberTransactions(memberData.memberId);
        txs = txRes1.data.data || [];
        if (txs.length === 0) {
           const txRes2 = await transactionAPI.getMemberTransactions(memberData._id);
           if (txRes2.data.data && txRes2.data.data.length > 0) txs = txRes2.data.data;
        }
      } catch(e) { console.error('Error fetching tx', e); }

      setTransactions(txs);

      // Fetch books to map bookId to Title
      if (txs.length > 0) {
        const booksRes = await bookAPI.getAll();
        const allBooks = booksRes.data.data || [];
        const bMap: Record<string, Book> = {};
        allBooks.forEach((b: Book) => {
          bMap[b._id] = b;
          bMap[b.bookId] = b; // map both just in case
        });
        setBooksMap(bMap);
      }

    } catch (err: any) {
      setError(err.response?.data?.error || 'Student not found. Please check your account number.');
    } finally {
      setLoading(false);
    }
  };

  const activeTransactions = transactions.filter(t => t.status === 'Issued' || t.status === 'Overdue');
  const pastTransactions = transactions.filter(t => t.status === 'Returned');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Library className="w-8 h-8 text-blue-600" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900"> Library Mangement System</h1>
          </div>
          <Link href="/admin/dashboard" className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
            <Settings className="w-4 h-4" />
            Admin Access
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Hero Section */}
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl mb-4">
            Welcome to the Student Portal
          </h2>
          <p className="text-lg text-slate-600">
            Access your library records, track your issued books, and check due dates in real-time.
          </p>
        </div>

        {/* Search Section */}
        <div className="max-w-xl mx-auto mb-12">
          <Card className="border-0 shadow-xl shadow-slate-200/50 ring-1 ring-slate-200">
            <CardContent className="pt-6">
              <form onSubmit={handleSearch} className="flex gap-3">
                <div className="relative flex-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input 
                    type="text"
                    placeholder="Enter your Student Account Number (e.g. MEM001)"
                    className="pl-10 h-12 text-lg"
                    value={memberIdInput}
                    onChange={(e) => setMemberIdInput(e.target.value)}
                  />
                </div>
                <Button type="submit" size="lg" className="h-12 px-8" disabled={loading}>
                  {loading ? 'Searching...' : <><Search className="w-5 h-5 mr-2"/> Lookup</>}
                </Button>
              </form>
              {error && (
                <div className="mt-4 flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-md">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        {member && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Student Profile Card */}
            <div className="lg:col-span-1">
              <Card className="bg-blue-600 text-white border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <User className="w-6 h-6" />
                    Student Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-blue-100 text-sm">Name</p>
                    <p className="font-semibold text-lg">{member.name}</p>
                  </div>
                  <div>
                    <p className="text-blue-100 text-sm">Account Number</p>
                    <p className="font-medium">{member.memberId}</p>
                  </div>
                  <div>
                    <p className="text-blue-100 text-sm">Email Address</p>
                    <p className="font-medium">{member.email}</p>
                  </div>
                  <div className="pt-4 border-t border-blue-500/50 flex justify-between items-center">
                    <div>
                      <p className="text-blue-100 text-sm">Status</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${member.status === 'Active' ? 'bg-emerald-400/20 text-emerald-100' : 'bg-red-400/20 text-red-100'}`}>
                        {member.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-blue-100 text-sm">Books Allowed</p>
                      <p className="font-semibold text-right">{activeTransactions.length} / {member.maxBorrowLimit}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Books List Collection */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Currently Borrowed Books */}
              <Card className="shadow-md border-0 ring-1 ring-slate-200">
                <CardHeader className="border-b bg-slate-50/50">
                  <CardTitle className="flex items-center gap-2 text-slate-800">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    Currently Borrowed ({activeTransactions.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {activeTransactions.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                      You do not have any books currently issued.
                    </div>
                  ) : (
                    <ul className="divide-y divide-slate-100">
                      {activeTransactions.map(tx => {
                        const book = booksMap[tx.bookId];
                        const isOverdue = tx.status === 'Overdue' || new Date(tx.dueDate) < new Date();
                        
                        // Calculate fines
                        let fineAmount = 0;
                        if (isOverdue) {
                          const daysOverdue = Math.max(0, Math.floor((new Date().getTime() - new Date(tx.dueDate).getTime()) / (1000 * 60 * 60 * 24)));
                          fineAmount = daysOverdue * 10; // 10 Rupees per day
                        }
                        
                        return (
                          <li key={tx._id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                            <div>
                              <h4 className="font-semibold text-slate-900 text-lg">
                                {book?.title || 'Loading Book Title...'}
                              </h4>
                              <p className="text-slate-500 text-sm">
                                {book?.author && `by ${book.author} `} • ID: {tx.bookId}
                              </p>
                            </div>
                            <div className="flex flex-col sm:items-end gap-1">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${isOverdue ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'}`}>
                                {isOverdue ? 'Overdue' : 'Due Soon'}
                              </span>
                              <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
                                <Calendar className="w-4 h-4" />
                                {format(new Date(tx.dueDate), 'MMM dd, yyyy')}
                              </div>
                              {isOverdue && fineAmount > 0 && (
                                <div className="text-red-600 font-bold text-sm mt-1 border border-red-200 bg-red-50 px-2 py-0.5 rounded-md">
                                  Fine Due: ₹{fineAmount}
                                </div>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </CardContent>
              </Card>

              {/* Past Transactions */}
              {pastTransactions.length > 0 && (
                <Card className="shadow-sm border-0 ring-1 ring-slate-200">
                  <CardHeader className="border-b bg-slate-50/50 py-4">
                    <CardTitle className="text-base flex items-center gap-2 text-slate-700">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      Past Returns ({pastTransactions.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ul className="divide-y divide-slate-100">
                      {pastTransactions.slice(0, 5).map(tx => {
                        const book = booksMap[tx.bookId];
                        return (
                          <li key={tx._id} className="p-4 flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                            <div>
                              <h4 className="font-medium text-slate-800">
                                {book?.title || tx.bookId}
                              </h4>
                            </div>
                            <div className="text-sm text-slate-500 flex items-center gap-2">
                              <span>Returned on</span>
                              <span className="font-medium text-slate-700">
                                {tx.returnDate ? format(new Date(tx.returnDate), 'MMM dd, yyyy') : 'N/A'}
                              </span>
                            </div>
                          </li>
                        );
                      })}
                      {pastTransactions.length > 5 && (
                        <li className="p-4 text-center text-sm text-slate-500">
                          And {pastTransactions.length - 5} more previous records
                        </li>
                      )}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
            
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} Library Management System. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

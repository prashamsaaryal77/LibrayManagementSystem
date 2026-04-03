'use client';

import { useEffect, useMemo, useState } from 'react';
import { BookOpen, CreditCard, LogOut, RotateCcw, Search, Settings, ShieldCheck, Zap, Users, DollarSign, ArrowRight, Shield } from 'lucide-react';
import { authAPI, bookAPI, transactionAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const COLOR_PALETTE = {
  background: 'bg-slate-50',
  card: 'bg-white',
  border: 'border-slate-200',
  textPrimary: 'text-slate-800',
  textSecondary: 'text-slate-500',
  accent: 'text-blue-600',
};

interface AppUser {
  id: string;
  name: string;
  email: string;
  memberId?: string;
  role: 'Admin' | 'Member';
  borrowedBooks: Array<{
    bookId: string;
    title?: string;
    borrowedAt?: string;
    dueDate?: string;
  }>;
  fines: number;
}

interface Book {
  _id: string;
  bookId: string;
  title: string;
  author: string;
  isbn: string;
  status: 'Available' | 'Borrowed';
  availableCopies: number;
}

interface Transaction {
  _id: string;
  transactionId: string;
  bookId: string;
  borrowDate?: string;
  issueDate?: string;
  dueDate: string;
  returnDate?: string | null;
  fineAmount: number;
  finePaid: boolean;
  status: string;
}

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash Payment' },
  { value: 'card', label: 'Debit/Credit Card' },
  { value: 'online', label: 'Online Payment (UPI/Net Banking)' },
] as const;

const MEMBER_MODULES = [
  { key: 'search', label: 'Search Books', icon: Search },
  { key: 'borrow', label: 'Borrow Book', icon: BookOpen },
  { key: 'return', label: 'Return & Fine', icon: RotateCcw },
  { key: 'payment', label: 'Fine Payment', icon: CreditCard },
  { key: 'logout', label: 'Logout', icon: LogOut },
] as const;

const ADMIN_MODULES = [
  { key: 'adminDashboard', label: 'Admin Dashboard', icon: Settings },
  { key: 'logout', label: 'Logout', icon: LogOut },
] as const;

const STORAGE_KEY = 'library-user';
const TOKEN_KEY = 'library-token';

export default function MainMenu() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [token, setToken] = useState('');
  const [activeModule, setActiveModule] = useState<(typeof MODULES)[number]['key']>('search');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedBookId, setSelectedBookId] = useState('');
  const [selectedTransactionId, setSelectedTransactionId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('0');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'online'>('cash');
  const [receipt, setReceipt] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedUser = window.localStorage.getItem(STORAGE_KEY);
    const savedToken = window.localStorage.getItem(TOKEN_KEY);

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }

    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    loadBooks();
    setPaymentAmount(String(user.fines || 0));
  }, [user]);

  useEffect(() => {
    if (!user || !user.memberId) return;
    loadTransactions(user.memberId);
  }, [user]);

  const loadBooks = async (query = '') => {
    try {
      const response = query.trim() ? await bookAPI.search(query) : await bookAPI.getAll();
      setBooks(response.data.data || []);
    } catch (err) {
      console.error('Failed to load books', err);
    }
  };

  const loadTransactions = async (memberId: string) => {
    try {
      const response = await transactionAPI.getMemberTransactions(memberId);
      setTransactions(response.data.data || []);
    } catch (err) {
      console.error('Failed to load transactions', err);
    }
  };

  const persistSession = (nextUser: AppUser, nextToken: string) => {
    setUser(nextUser);
    setToken(nextToken);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
      window.localStorage.setItem(TOKEN_KEY, nextToken);
    }
  };

  const clearSession = () => {
    setUser(null);
    setToken('');
    setTransactions([]);
    setMessage('You have been logged out successfully.');
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem(TOKEN_KEY);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = authMode === 'register'
        ? await authAPI.register(formData)
        : await authAPI.login({ email: formData.email, password: formData.password });

      persistSession(response.data.user, response.data.token);
      setMessage(response.data.message || `${authMode === 'register' ? 'Registration' : 'Login'} successful.`);
      setFormData({ name: '', email: '', password: '' });
    } catch (err: any) {
      const details = err.response?.data?.details;
      setError(Array.isArray(details) ? details.join(', ') : err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBookSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await loadBooks(searchTerm);
  };

  const handleBorrowBook = async () => {
    if (!user || !selectedBookId) {
      setError('Please select a book to borrow.');
      return;
    }

    if (!user.memberId) {
      setError('Invalid user session. Please log in again.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await transactionAPI.borrow({ memberId: user.memberId, bookId: selectedBookId });
      persistSession(response.data.data.user, token);
      setMessage(response.data.message || 'Book borrowed successfully.');
      setSelectedBookId('');
      await Promise.all([loadBooks(searchTerm), loadTransactions(user.memberId)]);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Unable to borrow the selected book');
    } finally {
      setLoading(false);
    }
  };

  const handleReturnBook = async () => {
    if (!user || !selectedTransactionId) {
      setError('Please select a transaction to return.');
      return;
    }

    if (!user.memberId) {
      setError('Invalid user session. Please log in again.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await transactionAPI.returnById(selectedTransactionId, {
        returnDate: new Date().toISOString(),
      });
      persistSession(response.data.data.user, token);
      setMessage(response.data.message || 'Book returned successfully.');
      setSelectedTransactionId('');
      await Promise.all([loadBooks(searchTerm), loadTransactions(user.memberId)]);
      setPaymentAmount(String(response.data.data.user?.fines || 0));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Unable to return the selected book');
    } finally {
      setLoading(false);
    }
  };

  const handleFinePayment = async () => {
    if (!user) {
      setError('Please log in to make a payment.');
      return;
    }

    if (!user.memberId) {
      setError('Invalid user session. Please log in again.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await transactionAPI.payFine({
        memberId: user.memberId,
        transactionId: selectedTransactionId || undefined,
        amount: Number(paymentAmount || 0),
      });
      persistSession(response.data.data.user, token);
      
      // Generate receipt
      const receiptData = {
        receiptNumber: `RCP-${Date.now()}`,
        dateTime: new Date().toLocaleString(),
        userName: user.name,
        userEmail: user.email,
        amount: Number(paymentAmount || 0),
        paymentMethod: PAYMENT_METHODS.find(m => m.value === paymentMethod)?.label || paymentMethod,
        status: 'Success',
        transactionId: response.data.data?.transaction?.transactionId || 'N/A',
      };
      
      setReceipt(receiptData);
      setMessage(response.data.message || 'Fine payment processed successfully.');
      setSelectedTransactionId('');
      setPaymentAmount('0');
      await loadTransactions(user.memberId);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Unable to process fine payment');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (user && user.fines > 0) {
      setError('Logout is blocked until all outstanding fines are cleared.');
      return;
    }

    clearSession();
    setMessage('You have been logged out successfully.');
    setReceipt(null);
    setActiveModule('search');
  };

  const availableBooks = useMemo(
    () => books.filter((book) => book.availableCopies > 0 || book.status === 'Available'),
    [books]
  );

  const activeTransactions = useMemo(
    () => transactions.filter((txn) => txn.status !== 'Returned'),
    [transactions]
  );

  const unpaidTransactions = useMemo(
    () => transactions.filter((txn) => txn.fineAmount > 0 && !txn.finePaid),
    [transactions]
  );

  const effectiveModules = user?.role === 'Admin' ? ADMIN_MODULES : MEMBER_MODULES;

  return (
    <section className="mb-12 space-y-6">
      {/* Welcome Section */}
      <div className="rounded-xl p-8 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 shadow-lg text-white relative overflow-hidden group">
        <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-4xl font-bold mb-2">Welcome, {user?.name}! 👋</h2>
              <p className="text-blue-100 text-lg">{user?.role === 'Admin' ? 'Admin Dashboard' : 'Member Library Portal'}</p>
            </div>
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              {user?.role === 'Admin' ? <Shield className="w-8 h-8" /> : <BookOpen className="w-8 h-8" />}
            </div>
          </div>
          <p className="text-blue-50 mb-4">
            {user?.role === 'Admin'
              ? '📚 Manage books, members, and all library operations from your admin panel.'
              : '📖 Search, borrow, return books and manage your fines.  '}
          </p>
          {user?.role === 'Admin' && (
            <button
              type="button"
              onClick={() => window.location.href = '/admin/dashboard'}
              className="inline-flex items-center gap-2 rounded-lg bg-white text-blue-600 px-6 py-2.5 font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
            >
              <Settings className="w-5 h-5" /> 
              Go to Admin Panel
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl p-5 border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">Status</p>
              <p className="text-slate-900 font-bold text-xl mt-1">{user?.role || 'Member'}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl p-5 border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
              <BookOpen className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">Books Borrowed</p>
              <p className="text-slate-900 font-bold text-xl mt-1">{activeTransactions.length || 0} / 3</p>
            </div>
          </div>
        </div>
        <div className={`rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow group border ${
          user?.fines === 0
            ? 'bg-emerald-50 border-emerald-200'
            : 'bg-rose-50 border-rose-200'
        }`}>
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${
              user?.fines === 0
                ? 'bg-emerald-200'
                : 'bg-rose-200'
            }`}>
              <DollarSign className={`w-5 h-5 ${
                user?.fines === 0 ? 'text-emerald-700' : 'text-rose-700'
              }`} />
            </div>
            <div className="flex-1">
              <p className={`text-xs font-medium uppercase tracking-wide ${
                user?.fines === 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}>Outstanding Fine</p>
              <p className={`font-bold text-xl mt-1 ${
                user?.fines === 0 ? 'text-emerald-700' : 'text-rose-700'
              }`}>₹{user?.fines || 0}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl p-5 border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
              <Users className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">Borrow Limit</p>
              <p className="text-slate-900 font-bold text-xl mt-1">3 Books</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Modules Card */}
      <Card className="bg-white border border-slate-200 shadow-md overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-blue-600" />
            <div>
              <CardTitle className="text-slate-900">Main Services</CardTitle>
              <CardDescription className="text-slate-600">
                Access all library services from here
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {message && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
              <p className="text-sm text-green-700">{message}</p>
            </div>
          )}

          {/* Module Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {effectiveModules.map((module) => {
              const Icon = module.icon;
              return (
                <button
                  key={module.key}
                  onClick={() => setActiveModule(module.key as any)}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg font-medium transition-all duration-200 ${
                    activeModule === module.key
                      ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg scale-105'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs text-center">{module.label}</span>
                </button>
              );
            })}
          </div>

          {/* Module Content */}
          <div className="border-t border-slate-700/50 pt-6 mt-6">
            {!user ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="mb-4 flex gap-2">
                  <Button type="button" variant={authMode === 'login' ? 'default' : 'outline'} onClick={() => setAuthMode('login')}>
                    Login
                  </Button>
                  <Button type="button" variant={authMode === 'register' ? 'default' : 'outline'} onClick={() => setAuthMode('register')}>
                    Register
                  </Button>
                </div>

                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  {authMode === 'register' && (
                    <div>
                      <label className="mb-2 block text-sm font-medium">Name</label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="Your full name"
                        required
                      />
                    </div>
                  )}

                  <div>
                    <label className="mb-2 block text-sm font-medium">Email</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="email@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Password</label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                      placeholder="Minimum 6 characters"
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Please wait...' : authMode === 'register' ? 'Create Account' : 'Login'}
                  </Button>
                </form>
              </div>

              <div className="rounded-lg border border-dashed border-blue-200 bg-blue-50/60 p-4 text-sm text-slate-700">
                <h3 className="mb-2 font-semibold text-slate-900">Included modules</h3>
                <ul className="space-y-2">
                  <li>• Search books by title, author, ISBN, or status</li>
                  <li>• Borrow with system-pass checks ({'<'} 3 books, no unpaid fines)</li>
                  <li>• Return books with automatic fine calculation</li>
                  <li>• Clear outstanding dues before logout</li>
                </ul>
              </div>
            </div>
            ) : (
            <>
              {/* Module Content Panels */}

              {user?.role === 'Admin' && activeModule === 'adminDashboard' && (
                <div className="space-y-4">
                  <p className="text-slate-700">As an Admin, you can add and manage books, members, and transactions from the Admin Dashboard.</p>
                  <button
                    type="button"
                    onClick={() => window.location.href = '/admin/dashboard'}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-white font-semibold hover:bg-indigo-700"
                  >
                    Open Admin Panel
                  </button>
                  <div className="rounded-lg border border-slate-200 p-4 bg-slate-50 text-slate-600">
                    <h4 className="font-semibold mb-2 text-slate-800">Admin Tasks</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>Add / edit / remove books</li>
                      <li>Approve member registrations</li>
                      <li>Track all borrowings/returns and overdue fines</li>
                      <li>View analytics and library reports</li>
                    </ul>
                  </div>
                </div>
              )}

              {activeModule === 'search' && (
                <div className="space-y-4">
                  <form onSubmit={handleBookSearch} className="flex gap-3">
                    <Input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by title, author, ISBN, or status"
                    />
                    <Button type="submit">Search</Button>
                  </form>
                  <div className="grid gap-3 md:grid-cols-2">
                    {books.map((book) => (
                      <div key={book._id} className="rounded-lg border border-slate-200 p-4">
                        <p className="font-semibold text-slate-900">{book.title}</p>
                        <p className="text-sm text-slate-600">{book.author}</p>
                        <p className="mt-2 text-xs text-slate-500">ISBN: {book.isbn}</p>
                        <p className={`mt-2 text-sm font-medium ${book.availableCopies > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {book.availableCopies > 0 ? `${book.availableCopies} copies available` : 'Currently unavailable'}
                        </p>
                      </div>
                    ))}
                    {books.length === 0 && <p className="text-sm text-slate-500">No books found for the current search.</p>}
                  </div>
                </div>
              )}

              {activeModule === 'borrow' && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-600">
                    You can borrow up to <strong>3</strong> books only when your outstanding fine is <strong>₹0</strong>.
                  </p>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Choose a book</label>
                    <select
                      value={selectedBookId}
                      onChange={(e) => setSelectedBookId(e.target.value)}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    >
                      <option value="">-- Select an available book --</option>
                      {availableBooks.map((book) => (
                        <option key={book._id} value={book.bookId}>
                          {book.title} — {book.author} ({book.availableCopies} available)
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button type="button" onClick={handleBorrowBook} disabled={loading || !selectedBookId}>
                    Borrow Book
                  </Button>
                </div>
              )}

              {activeModule === 'return' && (
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Active borrowed books</label>
                    <select
                      value={selectedTransactionId}
                      onChange={(e) => setSelectedTransactionId(e.target.value)}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    >
                      <option value="">-- Select a transaction --</option>
                      {activeTransactions.map((transaction) => (
                        <option key={transaction._id} value={transaction.transactionId}>
                          {transaction.bookId} — due {new Date(transaction.dueDate).toLocaleDateString()}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button type="button" onClick={handleReturnBook} disabled={loading || !selectedTransactionId}>
                    Return Book
                  </Button>
                </div>
              )}

              {activeModule === 'payment' && (
                <div className="space-y-6">
                  {receipt ? (
                    <div className="space-y-6">
                      {/* Receipt Display */}
                      <div className="rounded-lg border-2 border-green-300 bg-green-50 p-6 space-y-4">
                        <div className="text-center space-y-2">
                          <p className="text-sm font-semibold text-green-700">✓ PAYMENT SUCCESSFUL</p>
                          <h3 className="text-2xl font-bold text-slate-900">Payment Receipt</h3>
                        </div>
                        
                        <div className="border-t-2 border-b-2 border-green-200 py-4 space-y-3">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-600">Receipt No:</span>
                            <span className="font-mono font-semibold text-slate-900">{receipt.receiptNumber}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-600">Date & Time:</span>
                            <span className="font-semibold text-slate-900">{receipt.dateTime}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-600">User Name:</span>
                            <span className="font-semibold text-slate-900">{receipt.userName}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-600">Email:</span>
                            <span className="font-semibold text-slate-900 text-xs">{receipt.userEmail}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-600">Payment Method:</span>
                            <span className="font-semibold text-slate-900">{receipt.paymentMethod}</span>
                          </div>
                          <div className="flex justify-between items-center text-lg">
                            <span className="text-slate-900 font-bold">Amount Paid:</span>
                            <span className="font-bold text-green-700">₹{receipt.amount}</span>
                          </div>
                        </div>
                        
                        <div className="text-center space-y-2">
                          <p className="text-xs text-slate-500">Thank you for your payment!</p>
                          <p className="text-xs text-slate-500">You can now proceed with other activities.</p>
                        </div>
                      </div>
                      
                      <Button 
                        type="button" 
                        onClick={() => {
                          setReceipt(null);
                          setActiveModule('search');
                        }}
                        className="w-full"
                      >
                        Back to Main Menu
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                        Outstanding fine: <strong>₹{user.fines}</strong>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium">Unpaid fine transaction (optional)</label>
                        <select
                          value={selectedTransactionId}
                          onChange={(e) => setSelectedTransactionId(e.target.value)}
                          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                        >
                          <option value="">-- Pay all outstanding fines --</option>
                          {unpaidTransactions.map((transaction) => (
                            <option key={transaction._id} value={transaction.transactionId}>
                              {transaction.transactionId} — ₹{transaction.fineAmount}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium">Amount to Pay</label>
                        <Input
                          type="number"
                          min="0"
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium">Payment Method</label>
                        <div className="space-y-2">
                          {PAYMENT_METHODS.map((method) => (
                            <div key={method.value} className="flex items-center gap-3">
                              <input
                                type="radio"
                                id={`payment-${method.value}`}
                                name="paymentMethod"
                                value={method.value}
                                checked={paymentMethod === method.value}
                                onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'card' | 'online')}
                                className="h-4 w-4"
                              />
                              <label htmlFor={`payment-${method.value}`} className="text-sm font-medium cursor-pointer">
                                {method.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <Button type="button" onClick={handleFinePayment} disabled={loading || Number(paymentAmount) <= 0} className="w-full">
                        Process Payment
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {activeModule === 'logout' && (
                <div className="space-y-4">
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 text-center space-y-4">
                    <p className="text-lg font-semibold text-slate-900">Are you sure you want to logout?</p>
                    <p className="text-sm text-slate-600">You will need to login again to access your library account.</p>
                    {user.fines > 0 && (
                      <div className="rounded-md border border-red-200 bg-red-50 p-3 text-red-700 text-sm">
                        <strong>Note:</strong> Outstanding fines: ₹{user.fines}. Please clear all fines before logging out.
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setActiveModule('search')}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="button" 
                      onClick={handleLogout}
                      disabled={user.fines > 0}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Confirm Logout
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
            </div>
        </CardContent>
      </Card>
    </section>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, CreditCard, LogOut, RotateCcw, Search,
  Settings, Zap, Users, DollarSign, ArrowRight,
  Shield, CheckCircle, AlertCircle, BookMarked, Library,
  Sparkles, Receipt,
} from 'lucide-react';
import { bookAPI, transactionAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { binarySearch } from '@/lib/algorithmUtils';
import AuthPage from '@/components/AuthPage';
import { toast } from '@/hooks/use-toast';
import { EsewaPortal } from '@/components/EsewaPortal';

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
  borrowCount?: number;
  rankingScore?: number;
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

interface ReceiptData {
  receiptNumber: string;
  dateTime: string;
  userName: string;
  userEmail: string;
  amount: number;
  paymentMethod: string;
  status: string;
  transactionId: string;
}

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash Payment', icon: DollarSign },
  { value: 'esewa', label: 'eSewa Payment', icon: Zap },
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

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function MainMenu() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [token, setToken] = useState('');
  const [activeModule, setActiveModule] = useState<string>('search');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedBookId, setSelectedBookId] = useState('');
  const [selectedTransactionId, setSelectedTransactionId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('0');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'online' | 'esewa'>('cash');
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [isEsewaOpen, setIsEsewaOpen] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEY);
    const savedToken = localStorage.getItem(TOKEN_KEY);
    if (savedUser) {
      try { setUser(JSON.parse(savedUser)); } catch { localStorage.removeItem(STORAGE_KEY); }
    }
    if (savedToken) setToken(savedToken);
  }, []);

  useEffect(() => {
    if (!user) return;
    loadBooks();
    setPaymentAmount(String(user.fines || 0));
  }, [user]);

  useEffect(() => {
    if (!user?.memberId) return;
    loadTransactions(user.memberId);
  }, [user]);

  const loadBooks = async (query = '') => {
    try {
      const response = query.trim() ? await bookAPI.search(query) : await bookAPI.getAll();
      setBooks(response.data.data || []);
    } catch (err) { console.error('Failed to load books', err); }
  };

  const loadTransactions = async (memberId: string) => {
    try {
      const response = await transactionAPI.getMemberTransactions(memberId);
      setTransactions(response.data.data || []);
    } catch (err) { console.error('Failed to load transactions', err); }
  };

  const persistSession = (nextUser: AppUser, nextToken: string) => {
    setUser(nextUser);
    setToken(nextToken);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    localStorage.setItem(TOKEN_KEY, nextToken);
  };

  const clearSession = () => {
    setUser(null);
    setToken('');
    setTransactions([]);
    setMessage('You have been logged out successfully.');
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
  };

  const handleAuthSuccess = (user: any, token: string) => {
    persistSession(user, token);
  };

  const handleBookSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await loadBooks(searchTerm);
  };

  const handleBorrowBook = async () => {
    if (!user || !selectedBookId) { setError('Please select a book to borrow.'); return; }
    if (!user.memberId) { setError('Invalid user session. Please log in again.'); return; }
    setLoading(true); setError(''); setMessage('');
    try {
      const response = await transactionAPI.borrow({ memberId: user.memberId, bookId: selectedBookId });
      persistSession(response.data.data.user, token);
      const successMessage = response.data.message || 'Book borrowed successfully.';
      toast({ title: 'Borrow successful', description: successMessage, variant: 'default' });
      setMessage(successMessage);
      setSelectedBookId('');
      await Promise.all([loadBooks(searchTerm), loadTransactions(user.memberId)]);
    } catch (err: any) {
      const errMessage = err.response?.data?.error || 'Unable to borrow the selected book';
      toast({ title: 'Borrow failed', description: errMessage, variant: 'destructive' });
      setError(errMessage);
    }
    finally { setLoading(false); }
  };

  const handleReturnBook = async () => {
    if (!user || !selectedTransactionId) {
      const errMessage = 'Please select a transaction to return.';
      toast({ title: 'Return failed', description: errMessage, variant: 'destructive' });
      setError(errMessage);
      return;
    }
    if (!user.memberId) {
      const errMessage = 'Invalid user session. Please log in again.';
      toast({ title: 'Return failed', description: errMessage, variant: 'destructive' });
      setError(errMessage);
      return;
    }
    setLoading(true); setError(''); setMessage('');
    try {
      const response = await transactionAPI.returnById(selectedTransactionId, { returnDate: new Date().toISOString() });
      persistSession(response.data.data.user, token);
      const successMessage = response.data.message || 'Book returned successfully.';
      toast({ title: 'Return successful', description: successMessage, variant: 'default' });
      setSelectedTransactionId('');
      await Promise.all([loadBooks(searchTerm), loadTransactions(user.memberId)]);
      setPaymentAmount(String(response.data.data.user?.fines || 0));
    } catch (err: any) {
      const errMessage = err.response?.data?.error || 'Unable to return the selected book';
      toast({ title: 'Return failed', description: errMessage, variant: 'destructive' });
      setError(errMessage);
    }
    finally { setLoading(false); }
  };

  const executeFinePayment = async () => {
    setLoading(true); setError(''); setMessage('');
    try {
      const response = await transactionAPI.payFine({
        memberId: user!.memberId!,
        transactionId: selectedTransactionId || undefined,
        amount: Number(paymentAmount || 0),
      });
      persistSession(response.data.data.user, token);
      setReceipt({
        receiptNumber: `RCP-${Date.now()}`,
        dateTime: new Date().toLocaleString(),
        userName: user!.name,
        userEmail: user!.email,
        amount: Number(paymentAmount || 0),
        paymentMethod: PAYMENT_METHODS.find(m => m.value === paymentMethod)?.label || paymentMethod,
        status: 'Success',
        transactionId: response.data.data?.transaction?.transactionId || 'N/A',
      });
      const successMessage = response.data.message || 'Fine payment processed successfully.';
      toast({ title: 'Payment successful', description: successMessage, variant: 'default' });
      setSelectedTransactionId('');
      setPaymentAmount('0');
      await loadTransactions(user!.memberId!);
    } catch (err: any) {
      const errMessage = err.response?.data?.error || 'Unable to process fine payment';
      toast({ title: 'Payment failed', description: errMessage, variant: 'destructive' });
      setError(errMessage);
    }
    finally { setLoading(false); }
  };

  const handleFinePayment = async () => {
    if (!user) {
      const errMessage = 'Please log in to make a payment.';
      toast({ title: 'Payment failed', description: errMessage, variant: 'destructive' });
      setError(errMessage);
      return;
    }
    if (!user.memberId) {
      const errMessage = 'Invalid user session. Please log in again.';
      toast({ title: 'Payment failed', description: errMessage, variant: 'destructive' });
      setError(errMessage);
      return;
    }
    if (Number(paymentAmount || 0) <= 0) {
      toast({ title: 'Invalid amount', description: 'Please enter a valid amount to pay.', variant: 'destructive' });
      return;
    }

    if (paymentMethod === 'esewa') {
      setIsEsewaOpen(true);
      return;
    }

    await executeFinePayment();
  };

  const handleLogout = () => {
    if (user && user.fines > 0) {
      const errMessage = `Please clear all outstanding fines before logging out.`;
      toast({ title: 'Logout blocked', description: errMessage, variant: 'destructive' });
      setError(errMessage);
      return;
    }
    clearSession();
    setReceipt(null);
    setActiveModule('search');
    toast({ title: 'Logged out', description: 'You have been logged out successfully.', variant: 'default' });
  };

  const sortedBooks = useMemo(() => {
    return [...books].sort((a, b) => {
      // If rankingScore is available (from backend), use it
      if (b.rankingScore !== undefined && a.rankingScore !== undefined) {
        if (b.rankingScore !== a.rankingScore) return b.rankingScore - a.rankingScore;
      }
      // Fallback to borrowCount
      return (b.borrowCount || 0) - (a.borrowCount || 0);
    });
  }, [books]);
  const availableBooks = useMemo(() => books.filter(b => b.availableCopies > 0), [books]);
  const activeTransactions = useMemo(() => transactions.filter(t => t.status !== 'Returned'), [transactions]);
  const unpaidTransactions = useMemo(() => transactions.filter(t => t.fineAmount > 0 && !t.finePaid), [transactions]);
  const effectiveModules = user?.role === 'Admin' ? ADMIN_MODULES : MEMBER_MODULES;

  // ─── AUTH SCREEN ───
  if (!user) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  // ─── MAIN DASHBOARD ───
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg gradient-warm flex items-center justify-center">
              <Library className="w-5 h-5 text-secondary-foreground" />
            </div>
            <span className="text-lg font-display font-bold text-foreground">LMS</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.role}</p>
            </div>
            <div className="w-9 h-9 rounded-full gradient-warm flex items-center justify-center text-secondary-foreground font-semibold text-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Welcome Banner */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp}
          className="rounded-2xl gradient-warm p-8 text-secondary-foreground relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary-foreground/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-medium text-secondary-foreground/80">
                {user.role === 'Admin' ? 'Admin Dashboard' : 'Member Portal'}
              </span>
            </div>
            <h2 className="text-3xl font-display font-bold mb-2">Welcome back, {user.name}!</h2>
            <p className="text-secondary-foreground/80 max-w-lg">
              {user.role === 'Admin'
                ? 'Manage your library with powerful admin tools and insights.'
                : 'Discover amazing books, borrow with ease, and track your reading journey.'}
            </p>
            {user.role === 'Admin' && (
              <Button onClick={() => window.location.href = '/admin/dashboard'}
                variant="outline" size="lg" className="mt-4 bg-secondary-foreground/10 border-secondary-foreground/20 text-secondary-foreground hover:bg-secondary-foreground/20 hover:text-secondary-foreground">
                <Settings className="w-4 h-4" /> Open Admin Panel <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div initial="hidden" animate="visible" variants={stagger} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { id: 'borrowed', label: 'Books Borrowed', value: `${activeTransactions.length} / 3`, icon: BookMarked, color: 'text-primary' },
            { id: 'fine', label: 'Outstanding Fine', value: `₹${user.fines || 0}`, icon: DollarSign, color: user.fines > 0 ? 'text-destructive' : 'text-success' },
            { id: 'limit', label: 'Borrow Limit', value: '3 Books', icon: BookOpen, color: 'text-accent' },
            { id: 'status', label: 'Account Status', value: user.role, icon: Shield, color: 'text-primary' },
          ].map((stat, i) => (
            <motion.div key={i} variants={fadeUp}
              onClick={() => stat.id === 'borrowed' ? setActiveModule('borrowedBooks') : undefined}
              className={`bg-card rounded-xl p-5 shadow-soft border border-border/50 transition-shadow duration-300 ${stat.id === 'borrowed' ? 'cursor-pointer hover:shadow-card hover:border-primary/30 group' : 'hover:shadow-card'}`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-medium text-muted-foreground uppercase tracking-wider ${stat.id === 'borrowed' ? 'group-hover:text-primary transition-colors' : ''}`}>{stat.label}</span>
                <stat.icon className={`w-4 h-4 ${stat.color} ${stat.id === 'borrowed' ? 'group-hover:scale-110 transition-transform' : ''}`} />
              </div>
              <p className={`text-2xl font-display font-bold ${stat.color}`}>{stat.value}</p>
            </motion.div>
          ))}
        </motion.div>

        <div className="bg-card rounded-2xl shadow-soft border border-border/50 overflow-hidden">
          {/* Tab Bar */}
          <div className="border-b px-4 py-3 flex gap-2 overflow-x-auto scrollbar-none">
            {effectiveModules.map(module => {
              const Icon = module.icon;
              const isActive = activeModule === module.key;
              return (
                <button key={module.key}
                  onClick={() => module.key === 'logout' ? handleLogout() : setActiveModule(module.key)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground shadow-lg hover:shadow-xl'
                      : module.key === 'logout'
                        ? 'text-destructive hover:bg-destructive/10 hover:shadow-md'
                        : 'text-muted-foreground hover:bg-secondary/20 hover:text-foreground hover:shadow-sm'
                  }`}>
                  <Icon className="w-4 h-4" />
                  {module.label}
                </button>
              );
            })}
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {/* BORROWED BOOKS */}
              {activeModule === 'borrowedBooks' && (
                <motion.div key="borrowedBooks" initial="hidden" animate="visible" exit="hidden" variants={fadeUp} className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-display font-bold text-foreground mb-1">Your Borrowed Books</h3>
                      <p className="text-base text-foreground/70">View and manage your active borrowings</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setActiveModule('search')}>
                      Back to Search
                    </Button>
                  </div>

                  {activeTransactions.length > 0 ? (
                    <div className="grid gap-3">
                      {activeTransactions.map(t => {
                        const book = books.find(b => b.bookId === t.bookId);
                        return (
                          <div key={t._id} className="flex items-center justify-between p-4 rounded-xl bg-background border border-border/50 hover:shadow-soft transition-all duration-200">
                            <div className="flex items-start gap-4">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                <BookMarked className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-display font-semibold text-foreground">{book?.title || `Book ID: ${t.bookId}`}</h4>
                                {book?.author && <p className="text-sm text-muted-foreground">by {book.author}</p>}
                                <p className="text-sm text-muted-foreground mt-1">Borrowed: {t.borrowDate ? new Date(t.borrowDate).toLocaleDateString() : 'N/A'}</p>
                                <p className="text-sm text-muted-foreground">Due Date: <span className={new Date(t.dueDate) < new Date() ? 'text-destructive font-medium' : ''}>{new Date(t.dueDate).toLocaleDateString()}</span></p>
                                {t.fineAmount > 0 && <p className="text-sm text-destructive font-medium mt-1">Fine: ₹{t.fineAmount}</p>}
                              </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => {
                              setSelectedTransactionId(t.transactionId);
                              setActiveModule('return');
                            }}>
                              Return Book
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-16 bg-background rounded-xl border border-border/50">
                      <BookMarked className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-muted-foreground font-medium">No active borrowed books</p>
                      <p className="text-sm text-muted-foreground/70 mt-1">You haven't borrowed any books yet.</p>
                      <Button variant="default" className="mt-4" onClick={() => setActiveModule('borrow')}>
                        Borrow a Book
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}

              {/* SEARCH */}
              {activeModule === 'search' && (
                <motion.div key="search" initial="hidden" animate="visible" exit="hidden" variants={fadeUp}>
                  <form onSubmit={handleBookSearch} className="flex gap-3 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input type="text" placeholder="Search by title, author, or ISBN..." value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="pl-10 select-styled" />
                    </div>
                    <Button type="submit" variant="default" className="cursor-pointer hover:shadow-md transition-shadow duration-200">Search</Button>
                  </form>
                  <div className="grid gap-3">
                    {sortedBooks.map(book => (
                      <div key={book._id} className="flex items-center justify-between p-4 rounded-xl bg-background border border-border/50 hover:shadow-soft transition-all duration-200 group">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0 group-hover:bg-secondary/20 transition-colors">
                            <BookOpen className="w-5 h-5 text-secondary" />
                          </div>
                          <div>
                            <h4 className="font-display font-semibold text-foreground">{book.title}</h4>
                            <p className="text-sm text-muted-foreground">by {book.author}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">ISBN: {book.isbn}
                             {book.borrowCount && book.borrowCount > 0 ? ` · Borrowed ${book.borrowCount} times` : ''}
                             {book.rankingScore ? ` · Smart Rank: ${book.rankingScore.toFixed(2)}` : ''}
                            </p>
                          </div>
                        </div>
                        <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${
                          book.availableCopies > 0
                            ? 'bg-success/10 text-success'
                            : 'bg-destructive/10 text-destructive'
                        }`}>
                          {book.availableCopies > 0 ? `${book.availableCopies} available` : 'Unavailable'}
                        </span>
                      </div>
                    ))}
                    {sortedBooks.length === 0 && (
                      <div className="text-center py-16">
                        <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-muted-foreground font-medium">No books found</p>
                        <p className="text-sm text-muted-foreground/70">Try adjusting your search terms</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* BORROW */}
              {activeModule === 'borrow' && (
                <motion.div key="borrow" initial="hidden" animate="visible" exit="hidden" variants={fadeUp} className="space-y-6">
                  <div>
                    <h3 className="text-xl font-display font-bold text-foreground mb-1">Borrow a Book</h3>
                    <p className="text-base text-foreground/70">Select from available books in our collection</p>
                  </div>
                  <div className="p-4 rounded-lg bg-secondary/5 border border-secondary/10 text-sm text-foreground">
                    <strong>Note:</strong> You can borrow up to 3 books only when your outstanding fine is ₹0.
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-base font-medium text-foreground mb-1.5">Choose a book</label>
                      <select value={selectedBookId} onChange={e => setSelectedBookId(e.target.value)}
                        className="select-styled">
                        <option value="">— Select an available book —</option>
                        {availableBooks.map(book => (
                          <option key={book._id} value={book.bookId}>
                            {book.title} — {book.author} ({book.availableCopies} available)
                          </option>
                        ))}
                      </select>
                    </div>
                    <Button onClick={handleBorrowBook} disabled={loading || !selectedBookId} variant="default" size="lg" className="w-full cursor-pointer hover:shadow-lg transition-all duration-200 disabled:cursor-not-allowed">
                      {loading ? <span className="animate-spin w-4 h-4 border-2 border-secondary-foreground/30 border-t-secondary-foreground rounded-full" /> : <BookOpen className="w-4 h-4" />}
                      {loading ? 'Borrowing…' : 'Borrow Book'}
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* RETURN */}
              {activeModule === 'return' && (
                <motion.div key="return" initial="hidden" animate="visible" exit="hidden" variants={fadeUp} className="space-y-6">
                  <div>
                    <h3 className="text-xl font-display font-bold text-foreground mb-1">Return a Book</h3>
                    <p className="text-base text-foreground/70">Return borrowed books and check for any fines</p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-base font-medium text-foreground mb-1.5">Select book to return</label>
                      <select value={selectedTransactionId} onChange={e => setSelectedTransactionId(e.target.value)}
                        className="select-styled">
                        <option value="">— Select a transaction —</option>
                        {activeTransactions.map(t => (
                          <option key={t._id} value={t.transactionId}>
                            {t.bookId} — due {new Date(t.dueDate).toLocaleDateString()}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Button onClick={handleReturnBook} disabled={loading || !selectedTransactionId} variant="default" size="lg" className="w-full bg-success hover:bg-success/90 text-success-foreground cursor-pointer hover:shadow-lg transition-all duration-200 disabled:cursor-not-allowed">
                      {loading ? <span className="animate-spin w-4 h-4 border-2 border-success-foreground/30 border-t-success-foreground rounded-full" /> : <RotateCcw className="w-4 h-4" />}
                      {loading ? 'Returning…' : 'Return Book'}
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* PAYMENT */}
              {activeModule === 'payment' && (
                <motion.div key="payment" initial="hidden" animate="visible" exit="hidden" variants={fadeUp}>
                  {receipt ? (
                    <div className="max-w-md mx-auto space-y-6">
                      <div className="text-center">
                        <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                          <CheckCircle className="w-8 h-8 text-success" />
                        </div>
                        <h3 className="text-2xl font-display font-bold text-foreground">Payment Successful!</h3>
                      </div>
                      <div className="bg-background rounded-xl border border-border p-6 space-y-3">
                        {[
                          ['Receipt No', receipt.receiptNumber],
                          ['Date & Time', receipt.dateTime],
                          ['Name', receipt.userName],
                          ['Email', receipt.userEmail],
                          ['Payment Method', receipt.paymentMethod],
                          ['Amount Paid', `₹${receipt.amount}`],
                        ].map(([label, value]) => (
                          <div key={label} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{label}</span>
                            <span className="font-medium text-foreground">{value}</span>
                          </div>
                        ))}
                      </div>
                      <Button onClick={() => { setReceipt(null); setActiveModule('search'); }} variant="default" size="lg" className="w-full cursor-pointer hover:shadow-lg transition-all duration-200">
                        <ArrowRight className="w-4 h-4" /> Back to Main Menu
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-display font-bold text-foreground mb-1">Fine Payment</h3>
                          <p className="text-base text-foreground/70">Clear outstanding fines to continue borrowing</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-foreground/70">Outstanding</p>
                          <p className={`text-2xl font-display font-bold ${user.fines > 0 ? 'text-destructive' : 'text-success'}`}>₹{user.fines}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-base font-medium text-foreground mb-1.5">Transaction (optional)</label>
                          <select value={selectedTransactionId} onChange={e => setSelectedTransactionId(e.target.value)}
                            className="select-styled">
                            <option value="">— Pay all outstanding fines —</option>
                            {unpaidTransactions.map(t => (
                              <option key={t._id} value={t.transactionId}>
                                {t.transactionId} — ₹{t.fineAmount}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-base font-medium text-foreground mb-1.5">Amount to Pay</label>
                          <Input type="number" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)}
                            className="select-styled" />
                        </div>

                        <div>
                          <label className="block text-base font-medium text-foreground mb-3">Payment Method</label>
                          <div className="grid grid-cols-3 gap-3">
                            {PAYMENT_METHODS.map(method => {
                              const MIcon = method.icon;
                              return (
                                <button key={method.value} onClick={() => setPaymentMethod(method.value as any)}
                                  className={`p-3 rounded-xl border text-center text-sm font-medium transition-all duration-200 ${
                                    paymentMethod === method.value
                                      ? 'border-secondary bg-secondary/5 text-secondary shadow-soft'
                                      : 'border-border bg-background text-muted-foreground hover:border-secondary/30'
                                  }`}>
                                  <MIcon className="w-5 h-5 mx-auto mb-1.5" />
                                  {method.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <Button onClick={handleFinePayment} disabled={loading} variant="default" size="lg" className="w-full cursor-pointer hover:shadow-lg transition-all duration-200 disabled:cursor-not-allowed">
                          {loading ? <span className="animate-spin w-4 h-4 border-2 border-secondary-foreground/30 border-t-secondary-foreground rounded-full" /> : <CreditCard className="w-4 h-4" />}
                          {loading ? 'Processing…' : 'Process Payment'}
                        </Button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ADMIN */}
              {activeModule === 'adminDashboard' && user.role === 'Admin' && (
                <motion.div key="admin" initial="hidden" animate="visible" exit="hidden" variants={fadeUp} className="space-y-6">
                  <div>
                    <h3 className="text-xl font-display font-bold text-foreground mb-1">Admin Dashboard</h3>
                    <p className="text-sm text-muted-foreground">Manage books, members, and transactions</p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { label: 'Add / edit / remove books', icon: BookOpen },
                      { label: 'Approve member registrations', icon: Users },
                      { label: 'Track borrowings & overdue fines', icon: RotateCcw },
                      { label: 'View analytics & reports', icon: Zap },
                    ].map((task, i) => (
                      <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-background border border-border/50">
                        <div className="w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center">
                          <task.icon className="w-4 h-4 text-secondary" />
                        </div>
                        <span className="text-sm font-medium text-foreground">{task.label}</span>
                      </div>
                    ))}
                  </div>
                  <Button onClick={() => window.location.href = '/admin/dashboard'} variant="default" size="lg" className="cursor-pointer hover:shadow-lg transition-all duration-200">
                    <Settings className="w-4 h-4" /> Open Admin Panel <ArrowRight className="w-4 h-4" />
                  </Button>
                </motion.div>
              )}

              {/* LOGOUT */}
              {activeModule === 'logout' && (
                <motion.div key="logout" initial="hidden" animate="visible" exit="hidden" variants={fadeUp}
                  className="max-w-md mx-auto text-center space-y-6 py-8">
                  <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                    <LogOut className="w-8 h-8 text-destructive" />
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-bold text-foreground mb-2">Logout Confirmation</h3>
                    <p className="text-sm text-muted-foreground">You will need to login again to access your account.</p>
                  </div>
                  {user.fines > 0 && (
                    <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                      <strong>Warning:</strong> Please clear all outstanding fines (₹{user.fines}) before logging out.
                    </div>
                  )}
                  <div className="flex gap-3">
                    <Button variant="outline" size="lg" className="flex-1" onClick={() => setActiveModule('search')}>
                      Cancel
                    </Button>
                    <Button variant="destructive" size="lg" className="flex-1" onClick={handleLogout}>
                      <LogOut className="w-4 h-4" /> Confirm Logout
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* eSewa Portal Overlay */}
      <EsewaPortal 
        isOpen={isEsewaOpen}
        onClose={() => setIsEsewaOpen(false)}
        amount={Number(paymentAmount || 0)}
        onSuccess={() => {
          setIsEsewaOpen(false);
          executeFinePayment();
        }}
      />
    </div>
  );
}

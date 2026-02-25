'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { transactionAPI, memberAPI, bookAPI } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Search, User, BookOpen, AlertTriangle, ChevronDown, Loader2 } from 'lucide-react';

interface MemberInfo {
  _id: string;
  memberId: string;
  name: string;
  email: string;
  status: string;
}

interface IssuedTransaction {
  transactionId: string;
  memberId: string;
  bookId: string;
  issueDate: string;
  dueDate: string;
  status: string;
}

interface BookInfo {
  bookId: string;
  title: string;
  author: string;
}

const FINE_PER_DAY = 10;

export default function ReturnBookForm() {
  // Member search state
  const [allMembers, setAllMembers] = useState<MemberInfo[]>([]);
  const [membersLoaded, setMembersLoaded] = useState(false);
  const [membersLoading, setMembersLoading] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Selected member state
  const [member, setMember] = useState<MemberInfo | null>(null);
  const [transactions, setTransactions] = useState<IssuedTransaction[]>([]);
  const [booksMap, setBooksMap] = useState<Record<string, BookInfo>>({});
  const [selectedTransactionId, setSelectedTransactionId] = useState('');
  const [txLoading, setTxLoading] = useState(false);
  const [returnLoading, setReturnLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchError, setSearchError] = useState('');
  const [success, setSuccess] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);

  // Lazy load members on first focus/interaction
  const loadMembers = useCallback(async () => {
    if (membersLoaded || membersLoading) return;
    setMembersLoading(true);
    try {
      const res = await memberAPI.getAll();
      setAllMembers(res.data.data || []);
      setMembersLoaded(true);
    } catch (err) {
      console.error('Failed to load members', err);
    } finally {
      setMembersLoading(false);
    }
  }, [membersLoaded, membersLoading]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter members based on search input
  const filteredMembers = allMembers.filter((m) => {
    const q = memberSearch.toLowerCase();
    return (
      m.memberId.toLowerCase().includes(q) ||
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q)
    );
  });

  const handleSelectMember = async (selectedMember: MemberInfo) => {
    setMember(selectedMember);
    setMemberSearch(`${selectedMember.name} (${selectedMember.memberId})`);
    setShowDropdown(false);
    setSearchError('');
    setError('');
    setSelectedTransactionId('');
    setSuccess(false);
    setTxLoading(true);

    try {
      // Fetch member's transactions
      let txs: IssuedTransaction[] = [];
      try {
        const txRes = await transactionAPI.getMemberTransactions(selectedMember.memberId);
        txs = (txRes.data.data || []).filter(
          (t: any) => t.status === 'Issued' || t.status === 'Overdue'
        );
        if (txs.length === 0) {
          const txRes2 = await transactionAPI.getMemberTransactions(selectedMember._id);
          txs = (txRes2.data.data || []).filter(
            (t: any) => t.status === 'Issued' || t.status === 'Overdue'
          );
        }
      } catch {
        console.error('Error fetching transactions for member');
      }

      // Dynamically mark overdue
      txs = txs.map((t) => {
        if (t.status === 'Issued' && new Date(t.dueDate) < new Date()) {
          return { ...t, status: 'Overdue' };
        }
        return t;
      });

      setTransactions(txs);

      // Fetch book names
      if (txs.length > 0) {
        const booksRes = await bookAPI.getAll();
        const allBooks = booksRes.data.data || [];
        const bMap: Record<string, BookInfo> = {};
        allBooks.forEach((b: any) => {
          bMap[b._id] = b;
          bMap[b.bookId] = b;
        });
        setBooksMap(bMap);
      }
    } catch (err: any) {
      setSearchError('Failed to load member transactions.');
    } finally {
      setTxLoading(false);
    }
  };

  const selectedTransaction = transactions.find((t) => t.transactionId === selectedTransactionId);

  const getOverdueInfo = (tx: IssuedTransaction | undefined) => {
    if (!tx) return { isOverdue: false, daysOverdue: 0, fineAmount: 0 };
    const isOverdue = tx.status === 'Overdue' || new Date(tx.dueDate) < new Date();
    const daysOverdue = isOverdue
      ? Math.max(0, Math.floor((new Date().getTime() - new Date(tx.dueDate).getTime()) / (1000 * 60 * 60 * 24)))
      : 0;
    const fineAmount = daysOverdue * FINE_PER_DAY;
    return { isOverdue, daysOverdue, fineAmount };
  };

  const overdueInfo = getOverdueInfo(selectedTransaction);

  const handleReturnBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTransactionId) return;

    setReturnLoading(true);
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
      setTransactions((prev) => prev.filter((t) => t.transactionId !== selectedTransactionId));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to return book');
    } finally {
      setReturnLoading(false);
    }
  };

  const handleClearMember = () => {
    setMember(null);
    setMemberSearch('');
    setTransactions([]);
    setSelectedTransactionId('');
    setSuccess(false);
    setError('');
    setSearchError('');
  };

  return (
    <div className="space-y-6">
      {/* Step 1: Member Lookup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Step 1: Find Member
          </CardTitle>
          <CardDescription>Search and select a member by name, ID, or email</CardDescription>
        </CardHeader>
        <CardContent>
          <div ref={dropdownRef} className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Type to search members (name, ID, or email)..."
                className="w-full border rounded-md px-3 py-2.5 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={memberSearch}
                onChange={(e) => {
                  setMemberSearch(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => {
                  loadMembers();
                  setShowDropdown(true);
                }}
              />
              {membersLoading ? (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 animate-spin" />
              ) : (
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              )}
            </div>

            {/* Dropdown List */}
            {showDropdown && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {membersLoading ? (
                  <div className="p-4 text-center text-sm text-slate-500 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading members...
                  </div>
                ) : filteredMembers.length === 0 ? (
                  <div className="p-4 text-center text-sm text-slate-500">
                    {memberSearch ? 'No members match your search.' : 'No members found.'}
                  </div>
                ) : (
                  filteredMembers.map((m) => (
                    <button
                      key={m._id}
                      type="button"
                      onClick={() => handleSelectMember(m)}
                      className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-slate-100 last:border-b-0 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-sm text-slate-900">{m.name}</p>
                        <p className="text-xs text-slate-500">{m.memberId} • {m.email}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        m.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {m.status}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {searchError && (
            <div className="mt-3 flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-md">
              <AlertCircle className="w-4 h-4" />
              {searchError}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Member Info Banner */}
      {member && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="font-semibold text-blue-900">{member.name}</p>
            <p className="text-sm text-blue-700">ID: {member.memberId} • {member.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
              member.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {member.status}
            </span>
            <button
              onClick={handleClearMember}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Change
            </button>
          </div>
        </div>
      )}

      {/* Loading Transactions */}
      {txLoading && (
        <div className="text-center py-6 text-slate-500 flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading issued books...
        </div>
      )}

      {/* Step 2: Select Book to Return */}
      {member && !txLoading && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              Step 2: Select Book to Return
            </CardTitle>
            <CardDescription>
              {transactions.length > 0
                ? `${member.name} has ${transactions.length} issued book(s)`
                : `${member.name} has no books currently issued.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-6 text-slate-500">
                No active book issues found for this member.
              </div>
            ) : (
              <form onSubmit={handleReturnBook} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Select Book</label>
                  <select
                    value={selectedTransactionId}
                    onChange={(e) => {
                      setSelectedTransactionId(e.target.value);
                      setSuccess(false);
                      setError('');
                    }}
                    required
                    className="w-full border rounded px-3 py-2.5 text-sm"
                  >
                    <option value="">-- Choose a book to return --</option>
                    {transactions.map((txn) => {
                      const book = booksMap[txn.bookId];
                      const info = getOverdueInfo(txn);
                      return (
                        <option key={txn.transactionId} value={txn.transactionId}>
                          {book?.title || txn.bookId} {book?.author ? `by ${book.author}` : ''} 
                          {info.isOverdue ? ` — ⚠️ ${info.daysOverdue} days overdue` : ' — On time'}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Fine Preview Box */}
                {selectedTransaction && (
                  <div className={`rounded-lg border p-4 ${
                    overdueInfo.isOverdue 
                      ? 'bg-red-50 border-red-200' 
                      : 'bg-green-50 border-green-200'
                  }`}>
                    <h4 className={`font-semibold text-sm mb-3 flex items-center gap-2 ${
                      overdueInfo.isOverdue ? 'text-red-800' : 'text-green-800'
                    }`}>
                      {overdueInfo.isOverdue 
                        ? <><AlertTriangle className="w-4 h-4" /> Overdue — Fine Applicable</>
                        : <><CheckCircle2 className="w-4 h-4" /> On Time — No Fine</>}
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-slate-500">Book</p>
                        <p className="font-medium">{booksMap[selectedTransaction.bookId]?.title || selectedTransaction.bookId}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Issue Date</p>
                        <p className="font-medium">{new Date(selectedTransaction.issueDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Due Date</p>
                        <p className="font-medium">{new Date(selectedTransaction.dueDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Return Date</p>
                        <p className="font-medium">{new Date().toLocaleDateString()} (Today)</p>
                      </div>
                      {overdueInfo.isOverdue && (
                        <>
                          <div>
                            <p className="text-slate-500">Days Overdue</p>
                            <p className="font-bold text-red-700">{overdueInfo.daysOverdue} day(s)</p>
                          </div>
                          <div>
                            <p className="text-slate-500">Fine (₹{FINE_PER_DAY}/day)</p>
                            <p className="font-bold text-red-700 text-lg">₹{overdueInfo.fineAmount}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                {success && successData && (
                  <div className="space-y-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                    <div className="flex items-center gap-2 font-semibold">
                      <CheckCircle2 className="w-5 h-5" />
                      Book Returned Successfully!
                    </div>
                    <div className="text-xs space-y-1 mt-2">
                      <p><strong>Transaction ID:</strong> {successData.transactionId}</p>
                      <p><strong>Book:</strong> {successData.bookTitle}</p>
                      <p><strong>Return Date:</strong> {new Date(successData.returnDate).toLocaleDateString()}</p>
                      {successData.fineAmount > 0 && (
                        <p className="text-red-600 font-semibold">
                          <strong>Fine Charged:</strong> ₹{successData.fineAmount}
                        </p>
                      )}
                      <p><strong>Status:</strong> {successData.message}</p>
                    </div>
                  </div>
                )}

                <Button type="submit" disabled={returnLoading || !selectedTransactionId} className="w-full">
                  {returnLoading ? 'Processing Return...' : overdueInfo.fineAmount > 0 ? `Return Book & Charge ₹${overdueInfo.fineAmount} Fine` : 'Return Book'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

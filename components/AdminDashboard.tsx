'use client';

import { useState, useEffect } from 'react';
import { memberAPI, bookAPI, transactionAPI } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  totalBooks: number;
  totalTransactions: number;
  overdueBooks: number;
  activeBorrows: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    activeMembers: 0,
    totalBooks: 0,
    totalTransactions: 0,
    overdueBooks: 0,
    activeBorrows: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [membersRes, booksRes, transactionsRes, overdueRes] = await Promise.all([
        memberAPI.getAll(),
        bookAPI.getAll(),
        transactionAPI.getAll(),
        transactionAPI.getOverdue(),
      ]);

      const members = membersRes.data.data || [];
      const books = booksRes.data.data || [];
      let transactions = transactionsRes.data.data || [];
      const overdue = overdueRes.data.data || [];

      transactions = transactions.map((t: any) => {
        if (t.status === 'Issued' && new Date(t.dueDate) < new Date()) {
          return { ...t, status: 'Overdue' };
        }
        return t;
      });

      const activeBorrows = transactions.filter((t: any) => t.status === 'Issued' || t.status === 'Overdue').length;

      setStats({
        totalMembers: members.length,
        activeMembers: members.filter((m: any) => m.status === 'Active').length,
        totalBooks: books.length,
        totalTransactions: transactions.length,
        overdueBooks: overdue.length,
        activeBorrows,
      });

      setRecentTransactions(transactions.slice(0, 5));
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, subtitle }: { title: string; value: number; subtitle?: string }) => (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );

  if (loading) {
    return <div className="text-center py-12">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold">Admin Dashboard</h2>
        <p className="text-gray-600 mt-1">Library Management System Overview</p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Total Members" value={stats.totalMembers} subtitle={`${stats.activeMembers} active`} />
        <StatCard title="Total Books" value={stats.totalBooks} />
        <StatCard title="Active Borrows" value={stats.activeBorrows} subtitle="Currently issued" />
        <StatCard title="Overdue Books" value={stats.overdueBooks} subtitle="Action required" />
        <StatCard title="Total Transactions" value={stats.totalTransactions} />
      </div>

      {/* Overdue Books Alert */}
      {stats.overdueBooks > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertCircle className="w-5 h-5" />
              Overdue Books Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-700">
              There are {stats.overdueBooks} book(s) that are overdue. Members should be notified to return them.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Latest book issue and return activities</CardDescription>
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
                  <th className="text-left py-2 px-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((txn) => (
                  <tr key={txn._id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-2 font-mono text-xs">{txn.transactionId}</td>
                    <td className="py-2 px-2">{txn.memberId}</td>
                    <td className="py-2 px-2">{txn.bookId}</td>
                    <td className="py-2 px-2">{new Date(txn.issueDate).toLocaleDateString()}</td>
                    <td className="py-2 px-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          txn.status === 'Issued'
                            ? 'bg-pink-100 text-pink-800'
                            : txn.status === 'Overdue'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {txn.status}
                      </span>
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

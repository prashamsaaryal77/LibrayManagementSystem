import Link from 'next/link';
import { Home, Users, BookOpen, RotateCw, LogOut } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white p-6 shadow-lg">
        <Link href="/" className="flex items-center gap-2 mb-8 text-xl font-bold">
          <BookOpen className="w-6 h-6" />
          LibraryMS
        </Link>

        <nav className="space-y-2">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Home className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>

          <Link
            href="/admin/members"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Users className="w-5 h-5" />
            <span>Members</span>
          </Link>

          <Link
            href="/admin/books"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <BookOpen className="w-5 h-5" />
            <span>Books</span>
          </Link>

          <Link
            href="/admin/issue-book"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <BookOpen className="w-5 h-5" />
            <span>Issue Book</span>
          </Link>

          <Link
            href="/admin/return-book"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <RotateCw className="w-5 h-5" />
            <span>Return Book</span>
          </Link>

          <Link
            href="/admin/transactions"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <BookOpen className="w-5 h-5" />
            <span>Transactions</span>
          </Link>
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-700">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors text-red-400">
            <LogOut className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
}

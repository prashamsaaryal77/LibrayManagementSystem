'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Users, BookOpen, RotateCw, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem('library-user');
      let user = null;
      try {
        if (storedUser) user = JSON.parse(storedUser);
      } catch (e) {
        // ignore
      }

      const isAdmin = user && user.role === 'Admin';
      const isLoginPage = pathname === '/admin/login';

      if (!isAdmin && !isLoginPage) {
        router.push('/admin/login');
      } else if (isAdmin && isLoginPage) {
        router.push('/admin/dashboard');
      } else {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [pathname, router]);

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.removeItem('library-user');
    localStorage.removeItem('library-token');
    router.push('/admin/login');
  };

  const navLinks = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
    { name: 'Members', href: '/admin/members', icon: Users },
    { name: 'Books', href: '/admin/books', icon: BookOpen },
    { name: 'Issue Book', href: '/admin/issue-book', icon: BookOpen },
    { name: 'Return Book', href: '/admin/return-book', icon: RotateCw },
    { name: 'Transactions', href: '/admin/transactions', icon: BookOpen },
  ];

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-300 border-t-slate-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  const isLoginPage = pathname === '/admin/login';

  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <div 
        className={`${isCollapsed ? 'w-20' : 'w-64'} bg-slate-900 text-white shadow-lg transition-all duration-300 flex flex-col relative`}
      >
        <div className="p-6 flex items-center gap-2 mb-4 whitespace-nowrap overflow-hidden">
          <BookOpen className="w-6 h-6 flex-shrink-0" />
          {!isCollapsed && <span className="text-xl font-bold">LibraryMS</span>}
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-8 bg-slate-800 text-white rounded-full p-1 border border-slate-700 hover:bg-slate-700 transition-colors z-10"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group ${
                  isActive 
                    ? 'bg-pink-600 text-white' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
                title={isCollapsed ? link.name : ''}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                {!isCollapsed && <span className="truncate">{link.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-slate-700">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-red-400 hover:bg-slate-800 hover:text-red-300 transition-colors"
            title={isCollapsed ? 'Log Out' : ''}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="truncate">Log Out</span>}
          </button>
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

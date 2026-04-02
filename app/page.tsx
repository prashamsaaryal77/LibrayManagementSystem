'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, LogOut, Settings, Zap, Users, DollarSign, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AuthPage from '@/components/AuthPage';
import MainMenu from '@/components/MainMenu';

interface User {
  id: string;
  name: string;
  email: string;
  memberId?: string;
  role: 'Admin' | 'Member';
  fines: number;
}

const STORAGE_KEY = 'library-user';
const TOKEN_KEY = 'library-token';

export default function LibraryHome() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedUser = window.localStorage.getItem(STORAGE_KEY);
    const savedToken = window.localStorage.getItem(TOKEN_KEY);

    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
        window.localStorage.removeItem(TOKEN_KEY);
      }
    }
    
    setIsLoading(false);
  }, []);

  const handleAuthSuccess = (newUser: User, newToken: string) => {
    setUser(newUser);
    setToken(newToken);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
      window.localStorage.setItem(TOKEN_KEY, newToken);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken('');
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem(TOKEN_KEY);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/50 border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">LMS</h1>
            </div>

            {/* User Info & Actions */}
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end gap-1">
                <p className="text-sm font-semibold text-white">{user.name}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full">
                    {user.role}
                  </span>
                  {user.memberId && (
                    <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full">
                      {user.memberId}
                    </span>
                  )}
                </div>
              </div>
              <div className={`text-center px-3 py-2 rounded-lg ${
                user.fines > 0
                  ? 'bg-red-500/20 text-red-300'
                  : 'bg-green-500/20 text-green-300'
              }`}>
                <p className="text-xs font-medium">Fine: ₹{user.fines}</p>
              </div>
              
              {user.role === 'Admin' && (
                <Link href="/admin/dashboard">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Settings className="w-4 h-4" />
                    Admin
                  </Button>
                </Link>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MainMenu />
      </main>
    </div>
  );
}

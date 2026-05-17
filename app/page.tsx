'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedUser = window.localStorage.getItem(STORAGE_KEY);
    const savedToken = window.localStorage.getItem(TOKEN_KEY);

    if (savedUser && savedToken) {
      try {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser.role === 'Admin') {
          router.push('/admin/dashboard');
          return;
        }
        setUser(parsedUser);
        setToken(savedToken);
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
        window.localStorage.removeItem(TOKEN_KEY);
      }
    }
    
    setIsLoading(false);
  }, [router]);

  const handleAuthSuccess = (newUser: User, newToken: string) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
      window.localStorage.setItem(TOKEN_KEY, newToken);
    }
    if (newUser.role === 'Admin') {
      router.push('/admin/dashboard');
      return;
    }
    setUser(newUser);
    setToken(newToken);
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
    <div>

      {/* Main Content */}
      <main 
      // className={`${localStorage.getItem('library-token')?"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8":""}`}
      >
        <MainMenu />
      </main>
    </div>
  );
}

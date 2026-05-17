'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Shield, AlertCircle } from 'lucide-react';
import { authAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.login({ email, password });
      const user = response.data.user;

      if (user.role !== 'Admin') {
        setError('Access denied. Admin privileges required.');
        setLoading(false);
        return;
      }

      // Save admin session
      localStorage.setItem('library-user', JSON.stringify(user));
      localStorage.setItem('library-token', response.data.token);

      toast({ title: 'Welcome back Admin', description: 'Login successful.', variant: 'default' });
      router.push('/admin/dashboard');
    } catch (err: any) {
      const errMessage = err.response?.data?.error || 'Authentication failed';
      toast({ title: 'Login failed', description: errMessage, variant: 'destructive' });
      setError(errMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/15 via-secondary/10 to-accent/10 flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-secondary/20 to-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-accent/20 to-primary/15 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-secondary to-primary rounded-lg">
              <Shield className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Admin Portal</h1>
          </div>
          <p className="text-muted-foreground text-sm">Library Management System</p>
        </div>

        {/* Main Card */}
        <div className="bg-card/90 dark:bg-slate-800/80 backdrop-blur-md border border-border rounded-2xl shadow-2xl p-8 space-y-6">
          
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-500 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">Administrator Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">Authorization Key</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3 font-semibold rounded-lg transition-all duration-200 bg-gradient-to-r from-secondary to-primary hover:from-secondary/90 hover:to-primary/90 text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </div>
              ) : (
                'Access Dashboard'
              )}
            </Button>
          </form>

          {/* Info Box */}
          <div className="p-4 rounded-lg border bg-primary/15 border-primary/30">
            <p className="text-sm font-medium text-primary">
              🔒 Secure administrative access. Verified personnel only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

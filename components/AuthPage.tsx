'use client';

import { useState } from 'react';
import { BookOpen, Mail, Lock, User, Phone, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { authAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

interface AuthPageProps {
  onAuthSuccess: (user: any, token: string) => void;
}

export default function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = mode === 'register'
        ? await authAPI.register({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
          })
        : await authAPI.login({
            email: formData.email,
            password: formData.password,
          });

      const successMessage = response.data.message || `${mode === 'register' ? 'Registration' : 'Login'} successful!`;
      toast({ title: 'Success', description: successMessage, variant: 'default' });
      setFormData({ name: '', email: '', password: '', phone: '' });
      
      setTimeout(() => {
        onAuthSuccess(response.data.user, response.data.token);
      }, 500);
    } catch (err: any) {
      const details = err.response?.data?.details;
      const errMessage = Array.isArray(details) ? details.join(', ') : err.response?.data?.error || 'Authentication failed';
      toast({ title: 'Authentication failed', description: errMessage, variant: 'destructive' });
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
              <BookOpen className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">LMS</h1>
          </div>
          <p className="text-muted-foreground text-sm">Your digital library companion</p>
        </div>

        {/* Main Card */}
        <div className="bg-card/90 dark:bg-slate-800/80 backdrop-blur-md border border-border rounded-2xl shadow-2xl p-8 space-y-6">
          {/* Mode Toggle */}
          <div className="flex gap-2 p-1 bg-background/50 dark:bg-slate-700/30 rounded-lg">
            <button
              onClick={() => {
                setMode('login');
                setError('');
                setSuccess('');
              }}
              className={`flex-1 py-2.5 px-4 rounded-md font-medium transition-all duration-200 ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-secondary to-primary text-secondary-foreground shadow-lg'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMode('register');
                setError('');
                setSuccess('');
              }}
              className={`flex-1 py-2.5 px-4 rounded-md font-medium transition-all duration-200 ${
                mode === 'register'
                  ? 'bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Join Now
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="pl-10 select-styled"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="pl-10 select-styled"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="pl-10 pr-10 select-styled"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    name="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="pl-10 select-styled"
                  />
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className={`w-full py-3 font-semibold rounded-lg transition-all duration-200 ${
                mode === 'register'
                  ? 'bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90'
                  : 'bg-gradient-to-r from-secondary to-primary hover:from-secondary/90 hover:to-primary/90'
              } text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {mode === 'register' ? 'Creating Account...' : 'Signing In...'}
                </div>
              ) : mode === 'register' ? (
                'Create Account'
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Info Box */}
          <div className={`p-4 rounded-lg border ${
            mode === 'register'
              ? 'bg-secondary/15 border-secondary/30'
              : 'bg-primary/15 border-primary/30'
          }`}>
            <p className={`text-sm font-medium ${
              mode === 'register' ? 'text-secondary' : 'text-primary'
            }`}>
              {mode === 'register'
                ? '✨ Register now and get quick access to your library dashboard and book history.'
                : '📚 Sign in to search, borrow, and manage your books'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-foreground text-sm mt-6">
          {mode === 'register'
            ? 'Already have an account? '
            : "Don't have an account? "}
          <button
            onClick={() => setMode(mode === 'register' ? 'login' : 'register')}
            className={`font-semibold hover:underline ${
              mode === 'register' ? 'text-secondary' : 'text-primary'
            }`}
          >
            {mode === 'register' ? 'Sign in' : 'Join now'}
          </button>
        </p>
      </div>
    </div>
  );
}

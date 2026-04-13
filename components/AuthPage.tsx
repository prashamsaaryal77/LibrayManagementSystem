'use client';

import { useState } from 'react';
import { BookOpen, Mail, Lock, User, Phone, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { authAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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

      setSuccess(response.data.message || `${mode === 'register' ? 'Registration' : 'Login'} successful!`);
      setFormData({ name: '', email: '', password: '', phone: '' });
      
      setTimeout(() => {
        onAuthSuccess(response.data.user, response.data.token);
      }, 500);
    } catch (err: any) {
      const details = err.response?.data?.details;
      setError(Array.isArray(details) ? details.join(', ') : err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-pink-900/20 to-slate-900 flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">LMS</h1>
          </div>
          <p className="text-white text-sm">Your digital library companion</p>
        </div>

        {/* Main Card */}
        <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-2xl p-8 space-y-6">
          {/* Mode Toggle */}
          <div className="flex gap-2 p-1 bg-slate-700/30 rounded-lg">
            <button
              onClick={() => {
                setMode('login');
                setError('');
                setSuccess('');
              }}
              className={`flex-1 py-2.5 px-4 rounded-md font-medium transition-all duration-200 ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-300'
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
                  ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              Join Now
            </button>
          </div>

          {/* Messages */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-green-400">{success}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <Input
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-pink-500 focus:ring-pink-500/20"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <Input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-pink-500 focus:ring-pink-500/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <Input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="pl-10 pr-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-pink-500 focus:ring-pink-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-400"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <Input
                    name="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-pink-500 focus:ring-pink-500/20"
                  />
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className={`w-full py-3 font-semibold rounded-lg transition-all duration-200 ${
                mode === 'register'
                  ? 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700'
                  : 'bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700'
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
              ? 'bg-purple-500/10 border-purple-500/20'
              : 'bg-blue-500/10 border-blue-500/20'
          }`}>
            <p className={`text-sm font-medium ${
              mode === 'register' ? 'text-purple-300' : 'text-blue-300'
            }`}>
              {mode === 'register'
                ? '✨ You\'ll automatically become a library member with access to 3 books!'
                : '📚 Sign in to search, borrow, and manage your books'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white text-sm mt-6">
          {mode === 'register'
            ? 'Already have an account? '
            : "Don't have an account? "}
          <button
            onClick={() => setMode(mode === 'register' ? 'login' : 'register')}
            className={`font-semibold hover:underline ${
              mode === 'register' ? 'text-pink-400' : 'text-rose-400'
            }`}
          >
            {mode === 'register' ? 'Sign in' : 'Join now'}
          </button>
        </p>
      </div>
    </div>
  );
}

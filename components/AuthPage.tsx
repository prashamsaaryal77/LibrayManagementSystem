'use client';

import { useState } from 'react';
import { BookOpen, Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle, Key } from 'lucide-react';
import { authAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

interface AuthPageProps {
  onAuthSuccess: (user: any, token: string) => void;
}

interface ValidationErrors {
  name?: string;
  email?: string;
  password?: string;
}

export default function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot-password'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetStep, setResetStep] = useState<1 | 2 | 3>(1);
  const [resetCode, setResetCode] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && !/^\d/.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };

  const validateName = (name: string): boolean => {
    return name.trim().length >= 2 && !/\d/.test(name.trim());
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (mode === 'register') {
      if (!formData.name.trim()) {
        errors.name = 'Name is required';
      } else if (!validateName(formData.name)) {
        errors.name = 'Name must be at least 2 characters long and cannot contain numbers';
      }
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address that does not start with a number';
    }

    if (mode === 'forgot-password' && (resetStep === 1 || resetStep === 2)) {
      // Don't validate password yet
    } else {
      if (!formData.password.trim()) {
        errors.password = 'Password is required';
      } else if (mode === 'register' && !validatePassword(formData.password)) {
        errors.password = 'Password must be at least 6 characters long';
      } else if (mode === 'forgot-password' && !validatePassword(formData.password)) {
        errors.password = 'New password must be at least 6 characters long';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[name as keyof ValidationErrors]) {
      setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (mode === 'forgot-password') {
        if (resetStep === 1) {
          const response = await authAPI.sendResetCode({ email: formData.email });
          toast({ title: 'Verification Code Sent', description: response.data.message || 'Check your email for the code', variant: 'default' });
          setResetStep(2);
        } else if (resetStep === 2) {
          if (!resetCode.trim()) {
            setError('Verification code is required');
            setLoading(false);
            return;
          }
          const response = await authAPI.verifyResetCode({ email: formData.email, code: resetCode });
          toast({ title: 'Code Verified', description: response.data.message || 'Please enter your new password', variant: 'default' });
          setResetStep(3);
        } else {
          const response = await authAPI.forgotPassword({
            email: formData.email,
            code: resetCode,
            newPassword: formData.password,
          });
          toast({ title: 'Success', description: response.data.message || 'Password reset successful', variant: 'default' });
          setMode('login');
          setResetStep(1);
          setResetCode('');
          setFormData({ ...formData, password: '' });
        }
      } else {
        const response = mode === 'register'
          ? await authAPI.register({
              name: formData.name,
              email: formData.email,
              password: formData.password,
            })
          : await authAPI.login({
              email: formData.email,
              password: formData.password,
            });

        const successMessage = response.data.message || `${mode === 'register' ? 'Registration' : 'Login'} successful!`;
        toast({ title: 'Success', description: successMessage, variant: 'default' });
        setFormData({ name: '', email: '', password: '' });
        
        setTimeout(() => {
          onAuthSuccess(response.data.user, response.data.token);
        }, 500);
      }
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
          {mode !== 'forgot-password' && (
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
          )}
          {mode === 'forgot-password' && (
            <div className="text-center p-2 mb-2">
              <h2 className="text-xl font-bold text-foreground">Reset Password</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {resetStep === 1 ? 'Enter your email to receive a secure code.' 
                 : resetStep === 2 ? 'Enter the 6-digit code sent to your email.'
                 : 'Create your new password.'}
              </p>
            </div>
          )}

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
                    className={`pl-10 ${validationErrors.name ? 'border-red-500 focus:border-red-500' : ''}`}
                  />
                </div>
                {validationErrors.name && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {validationErrors.name}
                  </p>
                )}
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
                  disabled={loading || (mode === 'forgot-password' && resetStep > 1)}
                  onChange={handleInputChange}
                  className={`pl-10 ${validationErrors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                />
              </div>
              {validationErrors.email && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {validationErrors.email}
                </p>
              )}
            </div>

            {mode === 'forgot-password' && resetStep === 2 && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">Verification Code</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    name="resetCode"
                    type="text"
                    placeholder="123456"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    className="pl-10"
                    disabled={loading}
                    autoFocus
                  />
                </div>
              </div>
            )}

            {(mode !== 'forgot-password' || resetStep === 3) && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-foreground">
                    {mode === 'forgot-password' ? 'New Password' : 'Password'}
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => { setMode('forgot-password'); setError(''); setSuccess(''); setValidationErrors({}); setResetStep(1); setResetCode(''); }}
                      className="text-xs font-semibold text-primary hover:underline hover:text-primary/80 transition-colors"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`pl-10 pr-10 ${validationErrors.password ? 'border-red-500 focus:border-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {validationErrors.password && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {validationErrors.password}
                </p>
              )}
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
                  {mode === 'register' ? 'Creating Account...' : mode === 'forgot-password' ? 'Processing...' : 'Signing In...'}
                </div>
              ) : mode === 'register' ? (
                'Create Account'
              ) : mode === 'forgot-password' ? (
                resetStep === 1 ? 'Send Code' : resetStep === 2 ? 'Verify Code' : 'Save New Password'
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
            : mode === 'forgot-password'
            ? 'Remembered your password? '
            : "Don't have an account? "}
          <button
            onClick={() => { setMode(mode === 'register' ? 'login' : 'register'); setError(''); setSuccess(''); setResetStep(1); setResetCode(''); }}
            className={`font-semibold hover:underline ${
              mode === 'register' ? 'text-secondary' : 'text-primary'
            }`}
          >
            {mode === 'register' || mode === 'forgot-password' ? 'Sign in' : 'Join now'}
          </button>
        </p>
      </div>
    </div>
  );
}

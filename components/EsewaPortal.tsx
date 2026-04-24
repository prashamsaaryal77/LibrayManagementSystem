import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, CreditCard, ChevronLeft, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface EsewaPortalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  onSuccess: () => void;
}

export function EsewaPortal({ isOpen, onClose, amount, onSuccess }: EsewaPortalProps) {
  const [step, setStep] = useState<'login' | 'processing_login' | 'payment' | 'processing_payment' | 'success'>('login');
  const [esewaId, setEsewaId] = useState('');
  const [password, setPassword] = useState('');

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setStep('login');
      setEsewaId('');
      setPassword('');
    }
  }, [isOpen]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!esewaId || !password) return;
    
    setStep('processing_login');
    setTimeout(() => {
      setStep('payment');
    }, 1500);
  };

  const handlePayment = () => {
    setStep('processing_payment');
    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    }, 2000);
  };

  const springTransition = {
    type: "spring",
    stiffness: 300,
    damping: 30
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden border-0 bg-white shadow-2xl rounded-2xl">
        {/* We use VisuallyHidden for DialogTitle to satisfy accessibility requirements without altering the UI */}
        <VisuallyHidden>
          <DialogTitle>eSewa Payment Portal</DialogTitle>
        </VisuallyHidden>

        {/* eSewa Header */}
        <div className="bg-[#60bb46] text-white p-4 flex items-center justify-between shadow-sm relative z-10">
          <div className="flex items-center gap-2">
            {step === 'payment' && (
              <button onClick={() => setStep('login')} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
            )}
            <div className="font-bold text-xl tracking-tight flex items-center">
              eSewa <span className="text-[10px] font-normal ml-1 bg-white/20 px-1.5 py-0.5 rounded uppercase">Secure</span>
            </div>
          </div>
          <Shield className="w-5 h-5 text-white/80" />
        </div>

        <div className="bg-gray-50 p-6 relative min-h-[360px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {/* LOGIN STEP */}
            {step === 'login' && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={springTransition}
                className="space-y-6"
              >
                <div className="text-center space-y-1">
                  <h3 className="text-xl font-bold text-gray-900">Login to eSewa</h3>
                  <p className="text-sm text-gray-500">To pay Rs. {amount} to Library System</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">eSewa ID (Mobile / Email)</label>
                    <Input 
                      required
                      value={esewaId}
                      onChange={e => setEsewaId(e.target.value)}
                      placeholder="98XXXXXXXX" 
                      className="border-gray-200 focus-visible:ring-[#60bb46] bg-white h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Password / MPIN</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <Input 
                        required
                        type="password" 
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••" 
                        className="pl-9 border-gray-200 focus-visible:ring-[#60bb46] bg-white h-12"
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-[#60bb46] hover:bg-[#52a13b] text-white font-semibold text-lg shadow-md transition-all cursor-pointer"
                  >
                    Login
                  </Button>
                </form>
              </motion.div>
            )}

            {/* PROCESSING LOGIN STEP */}
            {step === 'processing_login' && (
              <motion.div
                key="processing_login"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center space-y-4 py-8"
              >
                <div className="w-12 h-12 rounded-full border-4 border-[#60bb46]/30 border-t-[#60bb46] animate-spin" />
                <p className="text-[#60bb46] font-medium animate-pulse">Authenticating...</p>
              </motion.div>
            )}

            {/* PAYMENT CONFIRMATION STEP */}
            {step === 'payment' && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={springTransition}
                className="space-y-6"
              >
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 text-center space-y-4">
                  <div className="w-16 h-16 bg-[#60bb46]/10 text-[#60bb46] rounded-full flex items-center justify-center mx-auto">
                    <CreditCard className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-gray-500 text-sm font-medium">Paying to</h4>
                    <p className="text-xl font-bold text-gray-900">Library Management System</p>
                  </div>
                  <div className="py-4 border-y border-gray-100 border-dashed">
                    <h4 className="text-gray-500 text-sm font-medium mb-1">Total Amount</h4>
                    <p className="text-3xl font-black text-[#60bb46]">Rs. {amount}</p>
                  </div>
                  <div className="text-sm text-gray-500 flex justify-between px-2">
                    <span>Balance Available</span>
                    <span className="font-semibold text-gray-900">Rs. {amount + 1500}</span>
                  </div>
                </div>

                <Button 
                  onClick={handlePayment} 
                  className="w-full h-12 bg-[#60bb46] hover:bg-[#52a13b] text-white font-semibold text-lg shadow-md transition-all cursor-pointer"
                >
                  Confirm Payment
                </Button>
              </motion.div>
            )}

            {/* PROCESSING PAYMENT STEP */}
            {step === 'processing_payment' && (
              <motion.div
                key="processing_payment"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center space-y-4 py-8"
              >
                <div className="w-12 h-12 rounded-full border-4 border-[#60bb46]/30 border-t-[#60bb46] animate-spin" />
                <p className="text-[#60bb46] font-medium animate-pulse">Processing Payment...</p>
                <p className="text-xs text-gray-400">Please do not close this window</p>
              </motion.div>
            )}

            {/* SUCCESS STEP */}
            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center space-y-4 py-8 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                >
                  <CheckCircle className="w-20 h-20 text-[#60bb46]" />
                </motion.div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">Payment Successful!</h3>
                  <p className="text-gray-500">Redirecting to merchant...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Footer */}
        <div className="bg-gray-100 p-3 text-center border-t border-gray-200">
          <p className="text-xs text-gray-500 font-medium">© {new Date().getFullYear()} eSewa Simulated Gateway</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

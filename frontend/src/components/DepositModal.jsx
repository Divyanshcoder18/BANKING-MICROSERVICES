import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Sparkles, CheckCircle2 } from 'lucide-react';
import API from '../api/axios';
import { toast } from 'react-hot-toast';

function DepositModal({ isOpen, onClose, accountId, userEmail, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!amount) return toast.error("Please enter an amount");

    setLoading(true);
    try {
      await API.post('/transaction/deposit', {
        accountId: accountId,
        amount: parseFloat(amount),
        idempotencyKey: `dep-${Date.now()}-${Math.random()}`,
        email: userEmail
      });
      
      toast.success("Funds deposited successfully!");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Deposit failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl"
          >
            <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
              <X size={24} />
            </button>

            <div className="flex items-center gap-4 mb-8">
              <div className="bg-emerald-500/10 p-3 rounded-2xl text-emerald-400">
                <Plus size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Deposit Funds</h2>
                <p className="text-slate-500 text-sm">Add money to your account</p>
              </div>
            </div>

            <form onSubmit={handleDeposit} className="space-y-6">
              <div className="relative group">
                <label className="block text-sm font-bold text-slate-400 mb-2 ml-1">Amount to Add</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-light text-slate-600">$</span>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    autoFocus
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 pl-10 text-white font-mono text-3xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-slate-800"
                  />
                </div>
              </div>

              <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                 <div className="flex items-center gap-2 text-emerald-400 mb-1">
                    <Sparkles size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Instant Credit</span>
                 </div>
                 <p className="text-xs text-slate-500 leading-relaxed">
                   This is a simulated deposit. In a real application, this would redirect you to a secure payment gateway.
                 </p>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Confirm Deposit</span>
                    <Plus size={18} />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default DepositModal;

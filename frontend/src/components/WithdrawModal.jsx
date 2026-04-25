import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowDownCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import API from '../api/axios';
import { toast } from 'react-hot-toast';

function WithdrawModal({ isOpen, onClose, accountId, userEmail, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!amount) return toast.error("Please enter an amount");

    setLoading(true);
    try {
      await API.post('/transaction/withdraw', {
        accountId: accountId,
        amount: parseFloat(amount),
        idempotencyKey: `wd-${Date.now()}-${Math.random()}`,
        email: userEmail
      });
      
      toast.success("Withdrawal successful! Please collect your cash.");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Withdrawal failed. Check your balance.");
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
              <div className="bg-slate-700/50 p-3 rounded-2xl text-slate-400">
                <ArrowDownCircle size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Withdraw Cash</h2>
                <p className="text-slate-500 text-sm">Securely debit your account</p>
              </div>
            </div>

            <form onSubmit={handleWithdraw} className="space-y-6">
              <div className="relative group">
                <label className="block text-sm font-bold text-slate-400 mb-2 ml-1">Amount to Withdraw</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-light text-slate-600">$</span>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    autoFocus
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 pl-10 text-white font-mono text-3xl focus:outline-none focus:ring-2 focus:ring-slate-500/50 focus:border-slate-500 transition-all placeholder:text-slate-800"
                  />
                </div>
              </div>

              <div className="p-4 bg-orange-500/5 border border-orange-500/10 rounded-2xl flex gap-3">
                 <AlertTriangle className="text-orange-400 flex-shrink-0" size={20} />
                 <p className="text-[10px] text-slate-500 leading-relaxed">
                   Maximum withdrawal limits may apply based on your tier. Large withdrawals may trigger a manual audit for your protection.
                 </p>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-black/20 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Confirm Withdrawal</span>
                    <ArrowDownCircle size={18} />
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

export default WithdrawModal;

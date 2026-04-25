import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import API from '../api/axios';
import { toast } from 'react-hot-toast';

function TransferModal({ isOpen, onClose, fromAccountId, userEmail, onSuccess }) {
  const [toAccount, setToAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!toAccount || !amount) return toast.error("Please fill all fields");

    setLoading(true);
    try {
      await API.post('/transaction/transfer', {
        fromaccount: fromAccountId,
        toaccount: toAccount,
        amount: parseFloat(amount),
        idempotencyKey: `tx-${Date.now()}-${Math.random()}`,
        email: userEmail
      });
      
      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-slate-900 shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-emerald-500/50`}>
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-bold text-white">Transfer Initiated!</p>
                <p className="mt-1 text-sm text-slate-400">Your funds are being processed securely.</p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-slate-800">
            <button onClick={() => toast.dismiss(t.id)} className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-blue-500 hover:text-blue-400">Close</button>
          </div>
        </div>
      ));
      
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Transfer failed");
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
              <div className="bg-blue-500/10 p-3 rounded-2xl text-blue-400">
                <Send size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Transfer Money</h2>
                <p className="text-slate-500 text-sm">Send funds to another account</p>
              </div>
            </div>

            <form onSubmit={handleTransfer} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2 ml-1">Recipient Account ID</label>
                <input 
                  type="text" 
                  value={toAccount}
                  onChange={(e) => setToAccount(e.target.value)}
                  placeholder="e.g. 64b1..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2 ml-1">Amount ($)</label>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-mono text-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                />
              </div>

              <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-2xl flex gap-3">
                <AlertCircle className="text-blue-400 flex-shrink-0" size={20} />
                <p className="text-xs text-blue-300 leading-relaxed">
                  Funds will be debited instantly. The recipient will see the credit reflecting in their history within a few moments.
                </p>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Confirm Transfer</span>
                    <Send size={18} />
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

export default TransferModal;

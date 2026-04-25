import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Landmark, PiggyBank, Briefcase, CreditCard, Sparkles } from 'lucide-react';
import API from '../api/axios';
import { toast } from 'react-hot-toast';

function CreateAccountModal({ isOpen, onClose, onSuccess }) {
  const [nickname, setNickname] = useState('');
  const [accountType, setAccountType] = useState('SAVINGS');
  const [loading, setLoading] = useState(false);

  const accountTypes = [
    { id: 'SAVINGS', label: 'Savings', icon: PiggyBank, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { id: 'BUSINESS', label: 'Business', icon: Briefcase, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { id: 'CURRENT', label: 'Current', icon: CreditCard, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { id: 'FIXED', label: 'Fixed Deposit', icon: Landmark, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  ];

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/users/create', { accountType, nickname });
      toast.success(`Success! Your new ${accountType.toLowerCase()} account is ready.`);
      onSuccess();
      onClose();
      setNickname('');
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create account");
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
            className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl"
          >
            <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
              <X size={24} />
            </button>

            <div className="flex items-center gap-4 mb-8">
              <div className="bg-blue-500/10 p-3 rounded-2xl text-blue-400">
                <Landmark size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Open New Account</h2>
                <p className="text-slate-500 text-sm">Expand your financial portfolio</p>
              </div>
            </div>

            <form onSubmit={handleCreate} className="space-y-8">
              {/* ACCOUNT TYPE SELECTION */}
              <div className="grid grid-cols-2 gap-4">
                {accountTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setAccountType(type.id)}
                    className={`flex items-center gap-3 p-4 rounded-2xl border transition-all text-left ${
                      accountType === type.id 
                      ? 'bg-slate-800 border-blue-500 shadow-lg shadow-blue-500/10' 
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className={`${type.bg} ${type.color} p-2 rounded-xl`}>
                      <type.icon size={20} />
                    </div>
                    <span className={`font-bold text-sm ${accountType === type.id ? 'text-white' : 'text-slate-400'}`}>
                      {type.label}
                    </span>
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2 ml-1">Account Nickname (Optional)</label>
                <input 
                  type="text" 
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="e.g. My Holiday Fund"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                />
              </div>

              <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex items-center gap-4">
                 <div className="bg-blue-500/20 p-2 rounded-full text-blue-400">
                    <Sparkles size={18} />
                 </div>
                 <p className="text-xs text-blue-300 leading-relaxed font-medium">
                   Welcome Bonus! We'll deposit <span className="text-white font-bold">$500</span> into your new account instantly.
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
                    <span>Open Account Now</span>
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

export default CreateAccountModal;

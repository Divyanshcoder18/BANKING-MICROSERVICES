import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { motion } from 'framer-motion';
import { Wallet, ArrowUpRight, ArrowDownLeft, History, LogOut, Plus, RefreshCw } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import TransferModal from '../components/TransferModal';
import DepositModal from '../components/DepositModal';
import WithdrawModal from '../components/WithdrawModal';
import CreateAccountModal from '../components/CreateAccountModal';
import SpendingChart from '../components/SpendingChart';
import { ShieldCheck, Activity, CreditCard, Landmark, PiggyBank, Briefcase } from 'lucide-react';

function Dashboard() {
  const { user, logout } = useAuth();

  // 1. STATE: We need spaces in memory to hold our bank data
  // 1. STATE: We need spaces in memory to hold our bank data
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 1.5 MODAL STATE
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isCreateAccountOpen, setIsCreateAccountOpen] = useState(false);

  // 2. DATA FETCHING: The code that runs when the "water tap" is opened
  const fetchDashboardData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      // 1. Fetch Accounts
      const accountsRes = await API.get('/users/useraccount');
      const accountsData = accountsRes.data.accounts || [];
      setAccounts(accountsData);

      // If no account is selected yet, pick the first one
      if (!selectedAccountId && accountsData.length > 0) {
        setSelectedAccountId(accountsData[0]._id);
      }

      // 2. Fetch History for the SELECTED account
      const currentId = selectedAccountId || accountsData[0]?._id;
      if (currentId) {
        const historyRes = await API.get(`/transaction/history/${currentId}`);
        setTransactions(historyRes.data);
      }
    } catch (err) {
      toast.error("Could not load bank data.");
      console.error("Dashboard Fetch Error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, selectedAccountId]);

  // 3. UI LOADING STATE
  if (loading) {
    return (
      <div className="h-screen bg-slate-950 text-white flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 font-medium">Securing your connection...</p>
      </div>
    );
  }

  // Find data for the currently selected account
  const selectedAccount = accounts.find(a => a._id === selectedAccountId) || accounts[0];
  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);

  const getAccountIcon = (type) => {
    switch (type) {
      case 'SAVINGS': return PiggyBank;
      case 'BUSINESS': return Briefcase;
      case 'CURRENT': return CreditCard;
      default: return Landmark;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto">

        {/* HEADER SECTION */}
        <header className="flex justify-between items-center mb-10">
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <h1 className="text-2xl md:text-3xl font-bold">Good morning, {user?.name.split(' ')[0]}!</h1>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-slate-400 text-sm">You have {accounts.length} active account(s).</p>
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <ShieldCheck size={12} className="text-emerald-400" />
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-tighter">Security: High</span>
              </div>
            </div>
          </motion.div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsCreateAccountOpen(true)}
              className="hidden md:flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-600/20"
            >
              <Plus size={16} />
              <span>New Account</span>
            </button>
            <button
              onClick={() => fetchDashboardData(true)}
              disabled={refreshing}
              className={`p-2 rounded-full border border-slate-800 bg-slate-900 text-slate-400 hover:text-white transition-all ${refreshing ? 'animate-spin' : ''}`}
            >
              <RefreshCw size={18} />
            </button>
            <button
              onClick={logout}
              className="group flex items-center gap-2 bg-slate-900 border border-slate-800 p-2 pr-4 rounded-full hover:bg-red-500/10 hover:border-red-500/50 transition-all text-slate-400 hover:text-red-500"
            >
              <div className="bg-slate-800 p-1.5 rounded-full group-hover:bg-red-500 group-hover:text-white transition-all">
                <LogOut size={16} />
              </div>
              <span className="text-sm font-semibold">Logout</span>
            </button>
          </div>
        </header>

        {/* ACCOUNT SELECTOR CAROUSEL */}
        <div className="mb-10 overflow-x-auto pb-4 hide-scrollbar">
          <div className="flex gap-4">
            {accounts.map((acc) => {
              const Icon = getAccountIcon(acc.accountType);
              const isActive = selectedAccountId === acc._id;
              return (
                <motion.button
                  key={acc._id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedAccountId(acc._id)}
                  className={`flex-shrink-0 w-64 p-6 rounded-[2rem] border transition-all text-left ${isActive
                    ? 'bg-blue-600 border-blue-400 shadow-xl shadow-blue-600/20'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`${isActive ? 'bg-white/20' : 'bg-slate-800'} p-2 rounded-xl`}>
                      <Icon size={20} className={isActive ? 'text-white' : 'text-slate-400'} />
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-white/60' : 'text-slate-500'}`}>
                      {acc.accountType}
                    </span>
                  </div>
                  <h4 className={`font-bold truncate ${isActive ? 'text-white' : 'text-slate-300'}`}>
                    {acc.nickname || `${acc.accountType.toLowerCase()} account`}
                  </h4>
                  <p className={`text-xl font-black mt-1 ${isActive ? 'text-white' : 'text-slate-100'}`}>
                    ${acc.balance?.toLocaleString()}
                  </p>
                </motion.button>
              );
            })}
            <button
              onClick={() => setIsCreateAccountOpen(true)}
              className="flex-shrink-0 w-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-[2rem] hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-slate-500 hover:text-blue-400"
            >
              <Plus size={24} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* MAIN BALANCE CARD */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-600 to-emerald-500 p-8 rounded-[2rem] shadow-2xl transition-all hover:shadow-blue-500/20"
          >
            {/* Minimalist Background Pattern */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>

            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start">
                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                  <Wallet size={28} className="text-white" />
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold tracking-widest text-white/60 uppercase">
                    {selectedAccount?.nickname || selectedAccount?.accountType || 'Apex Platinum'}
                  </p>
                  <p className="text-xs text-white/40 tracking-tighter">Debit Card •• {selectedAccount?._id?.slice(-4)}</p>
                  <div className="flex items-center gap-2 mt-1 justify-end">
                    <p className="text-[10px] text-white/30 font-mono tracking-tighter">
                      ID: {selectedAccount?._id}
                    </p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedAccount?._id);
                        toast.success("Account ID copied!");
                      }}
                      className="text-[10px] bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded text-white/50 hover:text-white transition-all flex items-center gap-1"
                    >
                      <RefreshCw size={10} />
                      <span>Copy</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-12">
                <p className="text-white/70 text-sm font-medium">Available Balance</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-light text-white/50">$</span>
                  <h2 className="text-5xl md:text-6xl font-bold tracking-tight">
                    {selectedAccount?.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </h2>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span className="text-xs text-white/80 font-medium">System Secure</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                  <span className="text-xs text-white/80 font-medium">Real-time Analytics</span>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
            <button
              onClick={() => setIsTransferOpen(true)}
              className="flex flex-col justify-between p-6 bg-slate-900 border border-slate-800 rounded-[2rem] hover:bg-slate-800 hover:border-blue-500/30 transition-all group text-left"
            >
              <div className="bg-blue-500/10 p-3 rounded-2xl text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all w-fit">
                <ArrowUpRight size={24} />
              </div>
              <span className="font-bold text-lg mt-4 block">Send<br />Money</span>
            </button>

            <button
              onClick={() => setIsDepositOpen(true)}
              className="flex flex-col justify-between p-6 bg-slate-900 border border-slate-800 rounded-[2rem] hover:bg-slate-800 hover:border-emerald-500/30 transition-all group text-left"
            >
              <div className="bg-emerald-500/10 p-3 rounded-2xl text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all w-fit">
                <Plus size={24} />
              </div>
              <span className="font-bold text-lg mt-4 block">Deposit<br />Funds</span>
            </button>

            <button
              onClick={() => setIsWithdrawOpen(true)}
              className="flex flex-col justify-between p-6 bg-slate-900 border border-slate-800 rounded-[2rem] hover:bg-slate-800 hover:border-slate-500/30 transition-all group text-left"
            >
              <div className="bg-slate-500/10 p-3 rounded-2xl text-slate-400 group-hover:bg-slate-500 group-hover:text-white transition-all w-fit">
                <ArrowDownLeft size={24} />
              </div>
              <span className="font-bold text-lg mt-4 block">Withdraw<br />Cash</span>
            </button>
          </div>
        </div>

        {/* ANALYTICS SECTION */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4 px-2">
            <Activity size={18} className="text-blue-400" />
            <h3 className="font-black text-sm uppercase tracking-widest text-slate-400">Spending Overview</h3>
          </div>
          <SpendingChart transactions={transactions} currentAccountId={selectedAccountId} />
        </div>

        {/* RECENT ACTIVITY SECTION */}
        <div className="bg-slate-900/40 border border-slate-900 p-8 rounded-[2rem]">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-slate-800 p-2 rounded-lg text-slate-400">
                <History size={18} />
              </div>
              <h3 className="font-bold text-lg">Transaction History</h3>
            </div>
            <button className="text-blue-400 text-sm font-semibold hover:underline">View All</button>
          </div>

          <div className="space-y-4">
            {transactions.length > 0 ? (
              transactions.map((tx, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={tx._id}
                  className="group flex items-center justify-between p-4 bg-slate-900/50 border border-slate-800/50 rounded-2xl hover:bg-slate-800/50 hover:border-slate-700 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${tx.fromaccount === user.accountId ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                      {tx.fromaccount === user.accountId ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-200">
                        {tx.fromaccount === user.accountId ? 'Transfer Sent' : 'Payment Received'}
                      </p>
                      <p className="text-xs text-slate-500 font-medium">
                        {new Date(tx.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-black ${tx.fromaccount === user.accountId ? 'text-white' : 'text-emerald-400'}`}>
                      {tx.fromaccount === user.accountId ? '-' : '+'}${tx.amount.toLocaleString()}
                    </p>
                    <div className="flex items-center justify-end gap-1.5 mt-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${tx.status === 'SUCCESS' ? 'bg-emerald-400' : 'bg-orange-400 animate-pulse'}`}></div>
                      <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">{tx.status}</span>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="py-12 text-center border-2 border-dashed border-slate-800 rounded-3xl">
                <p className="text-slate-500 font-medium italic">No transactions found for this account.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      <TransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        fromAccountId={selectedAccountId}
        userEmail={user?.email}
        onSuccess={() => fetchDashboardData(true)}
      />

      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        accountId={selectedAccountId}
        userEmail={user?.email}
        onSuccess={() => fetchDashboardData(true)}
      />

      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        accountId={selectedAccountId}
        userEmail={user?.email}
        onSuccess={() => fetchDashboardData(true)}
      />

      <CreateAccountModal
        isOpen={isCreateAccountOpen}
        onClose={() => setIsCreateAccountOpen(false)}
        onSuccess={() => fetchDashboardData(true)}
      />

      <Toaster position="top-right" />
    </div>
  );
}

export default Dashboard;

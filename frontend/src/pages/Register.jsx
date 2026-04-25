import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { User, Mail, Lock, Sparkles } from 'lucide-react';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. REGISTER: Create the user account
      const response = await API.post('/auth/register', { name, email, password });

      // 2. AUTO LOGIN: Use the login function to save the new user and token
      login(response.data.user, response.data.token);

      toast.success('Welcome to Apex Global Bank! Your journey begins.');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500 rounded-full blur-[120px]"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative max-w-md w-full bg-slate-900/50 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl"
      >
        <div className="mb-8">
          <div className="bg-blue-600/20 w-12 h-12 rounded-2xl flex items-center justify-center text-blue-400 mb-6">
            <Sparkles size={24} />
          </div>
          <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Create Account</h2>
          <p className="text-slate-400 font-medium">Join the future of digital banking today.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-500 ml-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
              <input
                type="text"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-12 py-4 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-slate-700"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-500 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
              <input
                type="email"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-12 py-4 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-slate-700"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-500 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
              <input
                type="password"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-12 py-4 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-slate-700"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-black py-4 rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 mt-4"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                <span>Creating Profile...</span>
              </div>
            ) : 'Start Your Journey'}
          </button>
        </form>

        <p className="text-center mt-8 text-slate-500 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-400 hover:text-blue-300 font-bold transition-colors">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default Register;

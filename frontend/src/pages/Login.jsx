import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Lock, Mail } from 'lucide-react';

function Login() {
  // 1. STATE: React "remembers" what you type here
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // 2. TOOLS: useAuth for global state, useNavigate to change pages
  const { login } = useAuth();
  const navigate = useNavigate();

  // 3. THE HANDLER: What happens when you click "Sign In"
  const handleSubmit = async (e) => {
    e.preventDefault(); // Stop the page from refreshing!
    setLoading(true);

    try {
      // 4. THE CALL: Send data to your API Gateway
      const response = await API.post('/auth/login', { email, password });

      // 5. THE SUCCESS: If backend says OK, we update our Global Context
      login(response.data.user, response.data.token);

      toast.success('Welcome back to Apex Global Bank!');
      navigate('/dashboard'); // Move to the dashboard automatically
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      {/* motion.div: Adds a smooth fade-in effect when the page opens */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl"
      >
        <h2 className="text-3xl font-black text-white mb-2">Sign In</h2>
        <p className="text-slate-400 mb-8 font-medium">Access your secure banking dashboard.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-500 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
              <input
                type="email"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-12 py-4 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-slate-700"
                placeholder="name@example.com"
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
            className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-black py-4 rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Secure Login'}
          </button>
        </form>

        <p className="text-center mt-8 text-slate-500 font-medium">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-400 hover:text-blue-300 font-bold transition-colors">
            Register now
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default Login;

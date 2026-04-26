import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Shield, AlertTriangle, ArrowLeft, RefreshCw, Cpu, Database, Bell, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

function SystemStatus() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const response = await API.get('/health/status');
      setData(response.data);
    } catch (error) {
      console.error('Error fetching system status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getIcon = (name) => {
    if (name.includes('Auth')) return Shield;
    if (name.includes('User')) return Cpu;
    if (name.includes('Transaction')) return Database;
    if (name.includes('Notification')) return Bell;
    return Activity;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-all mb-8 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold">Back to Dashboard</span>
        </button>

        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-4xl font-black mb-2">System Pulse</h1>
            <p className="text-slate-400 font-medium">Real-time health monitoring for Apex Global Microservices.</p>
          </div>
          <button 
            onClick={fetchStatus}
            disabled={loading}
            className={`p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all ${loading ? 'animate-spin' : ''}`}
          >
            <RefreshCw size={24} />
          </button>
        </div>

        {loading && !data ? (
          <div className="py-20 text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Polling Services...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Gateway Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:col-span-2 p-8 bg-gradient-to-br from-blue-600/20 to-slate-900 border border-blue-500/30 rounded-[2.5rem] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8">
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span className="text-xs font-black text-emerald-400 uppercase">Gateway Live</span>
                </div>
              </div>
              
              <Activity size={40} className="text-blue-400 mb-4" />
              <h3 className="text-2xl font-bold mb-1">API Gateway</h3>
              <p className="text-slate-400 text-sm max-w-md">The entry point of your system. It is currently routing traffic and enforcing security policies across all services.</p>
            </motion.div>

            {/* Individual Services */}
            {data?.services.map((service, index) => {
              const Icon = getIcon(service.name);
              const isUp = service.status === 'UP';
              
              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  key={service.name}
                  className="p-6 bg-slate-900 border border-slate-800 rounded-[2rem] hover:border-slate-700 transition-all"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className={`p-3 rounded-2xl ${isUp ? 'bg-slate-800 text-slate-100' : 'bg-red-500/10 text-red-400'}`}>
                      <Icon size={24} />
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${isUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-500'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${isUp ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'}`}></div>
                      <span className="text-[10px] font-black uppercase tracking-tighter">{service.status}</span>
                    </div>
                  </div>

                  <h4 className="text-xl font-bold mb-1">{service.name}</h4>
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                    <span>Latency:</span>
                    <span className={isUp ? 'text-blue-400' : 'text-slate-600'}>{service.latency}</span>
                  </div>

                  {!isUp && (
                    <div className="mt-4 flex items-center gap-2 p-3 bg-red-500/5 border border-red-500/10 rounded-xl">
                      <AlertTriangle size={14} className="text-red-500" />
                      <p className="text-[10px] text-red-400 font-medium">{service.error || 'Connection Failed'}</p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="mt-12 p-8 bg-slate-900/50 border border-slate-800 border-dashed rounded-[2.5rem] flex flex-col md:flex-row items-center gap-6">
           <div className="bg-blue-600/10 p-4 rounded-full text-blue-400">
             <RefreshCw size={32} />
           </div>
           <div>
             <h4 className="font-bold text-lg">Self-Healing Architecture</h4>
             <p className="text-slate-500 text-sm">When a service goes down, the orchestrator automatically attempts a restart. The Gateway caches critical routes using Redis to maintain partial availability during outages.</p>
           </div>
        </div>
      </div>
    </div>
  );
}

export default SystemStatus;

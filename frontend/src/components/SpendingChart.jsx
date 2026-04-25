import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

function SpendingChart({ transactions, currentAccountId }) {
  // 1. DATA TRANSFORMATION
  // We take the raw list of transactions and group them by month
  const chartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    // Initialize last 6 months
    const lastSixMonths = [];
    for (let i = 5; i >= 0; i--) {
      const m = (currentMonth - i + 12) % 12;
      lastSixMonths.push({
        name: months[m],
        income: 0,
        expenses: 0
      });
    }

    // Fill with real data
    transactions.forEach(tx => {
      const date = new Date(tx.createdAt);
      const monthName = months[date.getMonth()];
      const monthObj = lastSixMonths.find(m => m.name === monthName);
      
      if (monthObj) {
        // If money came TO our account, it's Income
        if (tx.toaccount === currentAccountId) {
          monthObj.income += tx.amount;
        } 
        // If money went FROM our account, it's Expenses
        else if (tx.fromaccount === currentAccountId) {
          monthObj.expenses += tx.amount;
        }
      }
    });

    return lastSixMonths;
  }, [transactions, currentAccountId]);

  // 2. CUSTOM TOOLTIP (To match our dark theme)
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-2xl">
          <p className="text-slate-400 text-xs font-bold uppercase mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-emerald-400 text-sm font-bold flex justify-between gap-4">
              <span>Income:</span>
              <span>${payload[0].value.toLocaleString()}</span>
            </p>
            <p className="text-red-400 text-sm font-bold flex justify-between gap-4">
              <span>Expenses:</span>
              <span>${payload[1].value.toLocaleString()}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[300px] w-full mt-6 bg-slate-900/20 rounded-[2rem] border border-slate-900/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Monthly Cash Flow</h4>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-[10px] text-slate-500 font-bold">INCOME</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-400"></div>
            <span className="text-[10px] text-slate-500 font-bold">EXPENSES</span>
          </div>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height="80%">
        <BarChart data={chartData}>
          <CartesianGrid vertical={false} stroke="#1e293b" strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }}
            dy={10}
          />
          <YAxis hide />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
          <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={12} />
          <Bar dataKey="expenses" fill="#f87171" radius={[4, 4, 0, 0]} barSize={12} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default SpendingChart;

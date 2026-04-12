import React, { useState, useEffect } from 'react';
import { Users, Activity, LogOut, ShieldAlert, Search, UserCheck, ChevronRight, Snowflake, UserPlus, ShieldCheck, AlertCircle, RefreshCcw, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../api/client';

export default function AdminDashboard({ onLogout }) {
  const [stats, setStats] = useState({ total_users: 0, total_transactions: 0, total_volume: 0 });
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setIsProcessingId] = useState(null);

  const fetchAdminData = async () => {
    try {
      const userJson = localStorage.getItem('finpay.currentUser');
      if (!userJson) throw new Error('No admin session found');
      const user = JSON.parse(userJson);
      const headers = { 
        'Authorization': `Bearer ${user.token}`,
        'Content-Type': 'application/json'
      };

      const [statsRes, usersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/stats`, { headers }),
        fetch(`${API_BASE_URL}/admin/users`, { headers })
      ]);
      
      if (!statsRes.ok || !usersRes.ok) throw new Error('Failed to fetch admin data');

      setStats(await statsRes.json());
      setUsers(await usersRes.json());
    } catch (err) {
      console.error('Admin fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const toggleUserStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'frozen' : 'active';
    const confirmMsg = newStatus === 'frozen' 
      ? "Are you sure you want to freeze this node? The user will lose all terminal access immediately."
      : "Confirm node restoration? This will re-enable all financial operations for this user.";
    
    if (!window.confirm(confirmMsg)) return;

    setIsProcessingId(userId);
    try {
      const userJson = localStorage.getItem('finpay.currentUser');
      const user = JSON.parse(userJson);
      const res = await fetch(`${API_BASE_URL}/admin/users/toggle-status`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, status: newStatus })
      });

      if (!res.ok) {
        if (res.status === 404) throw new Error("Endpoint not found. Please restart your backend server to apply updates.");
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Command failed');
      }

      await fetchAdminData();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center py-20">
        <Activity className="animate-spin mr-3 text-brand-700" size={32} />
        <span className="font-bold uppercase tracking-widest text-xs mt-4 text-slate-500">Initializing Central Command...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col animate-in fade-in duration-500 pb-10">
      
      {/* Branded Header (Matches Home Dashboard) */}
      <div className="flex items-center justify-between mt-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-brand-700 rounded-xl flex items-center justify-center shadow-lg shadow-brand-700/20">
            <span className="text-white font-black text-lg">F</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">FinPay</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              fetchAdminData();
            }}
            className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-90"
            title="Refresh Registry"
          >
            <RefreshCcw size={18} className="text-slate-600 dark:text-slate-400" />
          </button>
          <button 
            onClick={onLogout}
            className="p-2.5 bg-red-50 dark:bg-red-900/20 rounded-full shadow-sm border border-red-100 dark:border-red-800 transition-all active:scale-90 hover:bg-red-100"
          >
            <LogOut size={20} className="text-red-500" />
          </button>
          <div className="h-10 w-10 bg-red-600 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-sm shadow-red-900/20">
            <ShieldAlert size={18} className="text-white" />
          </div>
        </div>
      </div>

      {/* Hero Welcome */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <p className="text-red-500 dark:text-red-400 text-[10px] font-black uppercase tracking-[0.2em]">Node 01 • Secure Connection Active</p>
        </div>
        <h2 className="text-slate-900 dark:text-white text-3xl font-black">Financial Command</h2>
      </div>

      {/* Signature Metrics Card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[32px] p-8 shadow-xl shadow-slate-900/30 overflow-hidden relative mb-8 border border-slate-700">
        <div className="absolute -right-8 -top-7 h-40 w-40 rounded-full bg-white/5" aria-hidden="true" />
        <div className="absolute right-4 top-14 h-24 w-24 rounded-full bg-white/5" aria-hidden="true" />
        
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Total Switching Volume (PKR)</span>
            <div className="bg-white/10 p-1.5 rounded-lg backdrop-blur-sm">
              <Activity size={14} className="text-emerald-400" />
            </div>
          </div>
          <h3 className="text-white text-4xl font-black tracking-tight">Rs. {stats.total_volume.toLocaleString()}</h3>
          
          <div className="mt-10 grid grid-cols-2 gap-4">
            <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <span className="text-slate-500 text-[9px] font-black uppercase tracking-widest block mb-1">Active Nodes</span>
              <span className="text-white font-bold text-xl">{stats.total_users}</span>
            </div>
            <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <span className="text-slate-500 text-[9px] font-black uppercase tracking-widest block mb-1">Total Ops</span>
              <span className="text-white font-bold text-xl">{stats.total_transactions}</span>
            </div>
          </div>
        </div>
      </div>

      {/* User Registry List */}
      <div className="flex flex-col gap-4">
        <div className="px-2 flex items-center justify-between">
          <h3 className="text-slate-900 dark:text-white text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
            <Users size={16} className="text-brand-700" />
            Terminal User Ledger
          </h3>
          <span className="text-[10px] font-bold text-slate-400 tracking-widest">{users.length} Identities Linked</span>
        </div>

        <div className="flex flex-col gap-3">
          {users.map((u) => (
            <div 
              key={u.id} 
              className={`flex items-center justify-between bg-white dark:bg-slate-900 p-5 rounded-[28px] shadow-sm border ${u.status === 'frozen' ? 'border-red-200 bg-red-50/30' : 'border-slate-50 dark:border-slate-800'} transition-all`}
            >
              <div className="flex items-center gap-4 flex-1">
                <div className={`h-14 w-12 rounded-[20px] flex items-center justify-center font-black text-lg ${
                  u.role === 'admin' 
                    ? 'bg-slate-100 text-slate-600' 
                    : u.status === 'frozen' ? 'bg-red-100 text-red-600' : 'bg-brand-50 text-brand-700'
                }`}>
                  {u.first_name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-slate-900 dark:text-white font-black text-sm truncate">{u.first_name}</p>
                    {u.status === 'frozen' && (
                      <span className="px-1.5 py-0.5 rounded-md bg-red-100 text-red-600 text-[8px] font-black uppercase tracking-tighter">RESTRICTED</span>
                    )}
                  </div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-tighter mt-0.5">{u.phone_number}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <p className="font-black text-slate-900 dark:text-white text-base">Rs. {u.balance.toLocaleString()}</p>
                  <p className="text-[8px] font-black uppercase tracking-[0.1em] text-slate-400">{u.tier} Verified</p>
                </div>
                
                {u.role !== 'admin' && (
                  <button 
                    disabled={processingId === u.id}
                    onClick={() => toggleUserStatus(u.id, u.status)}
                    className={`p-3 rounded-2xl transition-all active:scale-90 ${
                      u.status === 'frozen' 
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                        : 'bg-red-50 text-red-600 border border-red-100'
                    }`}
                    title={u.status === 'frozen' ? 'Restore Access' : 'Freeze Access'}
                  >
                    {processingId === u.id ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : u.status === 'frozen' ? (
                      <ShieldCheck size={18} />
                    ) : (
                      <Snowflake size={18} />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Terminal App Version */}
      <div className="mt-10 py-6 border-t border-slate-100 dark:border-slate-800 text-center">
        <p className="text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.3em]">
          Central Management Console • v4.2.0 • Build FP-2026
        </p>
      </div>

    </div>
  );
}

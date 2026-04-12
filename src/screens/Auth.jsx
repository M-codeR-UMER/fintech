import React, { useMemo, useState } from 'react';
import { CircleHelp, Fingerprint, KeyRound, LogIn, Phone, UserPlus, ShieldCheck, User, Mail, X } from 'lucide-react';
import { api, API_BASE_URL } from '../api/client';

export default function Auth({ onAuthSuccess }) {
  const [mode, setMode] = useState('login');
  const [role, setRole] = useState('user'); // user, admin
  const [firstName, setFirstName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [bioHint, setBioHint] = useState('');

  const heading = useMemo(() => (mode === 'login' ? 'FinPay' : 'Create Account'), [mode]);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const is_admin = role === 'admin';
      const url = is_admin ? `${API_BASE_URL}/admin/login` : `${API_BASE_URL}/user/login`;
      const body = is_admin 
        ? { email: email.trim(), password: password.trim() } 
        : { phoneNumber: phoneNumber.trim(), password: password.trim(), role: role };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      
      const data = await response.json();
      
      if (response.status === 404) {
        setError('Account not found. Please register first.');
        // Automatically suggest switching to register mode
        setTimeout(() => {
          setMode('register');
          setError('');
        }, 2000);
        return;
      }

      if (!response.ok) throw new Error(data.detail || 'Login failed');

      // OTP Flow for non-admin
      if (!is_admin) {
        const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
        alert(`[SMS] Your FinPay OTP is: ${generatedOtp}`);
        const enteredOtp = prompt('Enter the 4-digit OTP sent to your phone:');
        if (enteredOtp !== generatedOtp) {
          throw new Error('Invalid OTP verification');
        }
      }

      onAuthSuccess(data);
    } catch (err) {
      if (err.message?.includes('restricted by admin')) {
        alert("ACCESS DENIED: Your account is restricted by admin. Please contact support.");
      }
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (role === 'admin') {
      setError('Admin registration is not allowed.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/user/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          firstName: firstName.trim(),
          phoneNumber: phoneNumber.trim(), 
          password: password.trim(), 
          role: role 
        }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Registration failed');

      onAuthSuccess(data);
    } catch (err) {
      if (err.message?.includes('restricted by admin')) {
        alert("ACCESS DENIED: Your account is restricted by admin. Please contact support.");
      }
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setBioHint('');
    if (mode === 'login') handleLogin();
    else handleRegister();
  };

  return (
    <>
      <div className="flex flex-col items-center w-full max-w-md mx-auto animate-in fade-in zoom-in-95 duration-500">
        {/* Brand Identity */}
        <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-gradient-to-br from-[#0f7a6e] to-[#07a3c2] text-3xl font-black text-white shadow-xl mb-4 shadow-[#0f7a6e]/20">
          F
        </div>
        
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight whitespace-nowrap mb-1 leading-tight">
          {heading}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-6 text-center">
          Secure Financial App
        </p>

        {/* Role Selection */}
        <div className="flex w-full gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6 shadow-inner">
          {['user', 'admin'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                setRole(r);
                setError('');
                setBioHint('');
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                role === r 
                  ? 'bg-white dark:bg-slate-700 text-brand-700 dark:text-brand-400 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {mode === 'register' && role === 'admin' ? (
          <div className="w-full py-10 text-center animate-in fade-in zoom-in-95 duration-500 flex flex-col items-center justify-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm px-6">
            <ShieldCheck size={48} className="text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-2">Restricted Access</h3>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 max-w-[250px] leading-relaxed">
              Super Admin accounts are predefined. New admin creation is restricted.
            </p>
            <button
              type="button"
              onClick={() => setMode('login')}
              className="mt-6 text-[10px] font-black uppercase tracking-widest text-brand-700 dark:text-brand-400 hover:underline"
            >
              Switch to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            {mode === 'register' && (
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Full Name</label>
                <div className="flex items-center gap-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#0f7a6e]/50 transition-all">
                  <User size={18} className="text-slate-400" />
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-transparent font-bold text-slate-900 dark:text-white text-sm outline-none"
                    placeholder="Ahmed Khan"
                  />
                </div>
              </div>
            )}

            {role === 'admin' ? (
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Admin Email</label>
                <div className="flex items-center gap-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#0f7a6e]/50 transition-all">
                  <Mail size={18} className="text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent font-bold text-slate-900 dark:text-white text-sm outline-none"
                    placeholder="admin@finpay.com"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Mobile Number</label>
                <div className="flex items-center gap-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#0f7a6e]/50 transition-all">
                  <Phone size={18} className="text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-transparent font-bold text-slate-900 dark:text-white text-sm outline-none"
                    placeholder="0300 1234567"
                  />
                </div>
              </div>
            )}

            {mode === 'register' && role !== 'admin' && (
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Email Address</label>
                <div className="flex items-center gap-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#0f7a6e]/50 transition-all">
                  <Mail size={18} className="text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent font-bold text-slate-900 dark:text-white text-sm outline-none"
                    placeholder="name@finpay.com"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">
                {role === 'admin' ? 'Secure Password' : '5-Digit Security PIN'}
              </label>
              <div className="flex items-center gap-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#0f7a6e]/50 transition-all">
                <ShieldCheck size={18} className="text-slate-400" />
                <input
                  type="password"
                  required
                  maxLength={role === 'admin' ? 32 : 5}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent font-bold text-slate-900 dark:text-white text-sm outline-none tracking-widest"
                  placeholder={role === 'admin' ? '••••••••' : '•••••'}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 p-3 rounded-xl flex items-center gap-3 animate-shake">
                <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                <p className="text-[10px] font-bold text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {bioHint ? (
              <div className="rounded-2xl border border-brand-200 bg-brand-50 px-5 py-4 text-sm text-brand-800 dark:border-brand-900 dark:bg-brand-950 dark:text-brand-300 animate-in slide-in-from-top-2">
                <p className="flex items-center gap-2 font-black uppercase text-[10px] tracking-widest">
                  <ShieldCheck size={16} className="text-[#0f7a6e]" /> Security Notice
                </p>
                <p className="mt-2 font-bold text-xs leading-relaxed opacity-90">{bioHint}</p>
                <button
                  type="button"
                  onClick={() => setBioHint('')}
                  className="mt-4 w-full rounded-xl bg-white px-3 py-2.5 text-center text-[10px] font-black uppercase tracking-widest text-brand-700 shadow-sm transition hover:bg-brand-50 dark:bg-slate-900 dark:text-brand-400 dark:hover:bg-slate-800"
                >
                  Dismiss Notice
                </button>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand-700 py-4 rounded-2xl text-white font-black text-base shadow-lg shadow-brand-700/30 active:scale-95 transition-all flex justify-center items-center gap-3"
            >
              {isLoading ? (
                <div className="h-5 w-5 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? <LogIn size={20} /> : <UserPlus size={20} />}
                  <span>{mode === 'login' ? 'Authorize Login' : 'Create Account'}</span>
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-8 border-t border-slate-200 pt-4 dark:border-slate-800 w-full">
          <div className="grid grid-cols-3 gap-2 text-center">
            <button
              onClick={() => {
                setError('');
                setBioHint('For security, contact support to reset your PIN after identity verification.');
              }}
              className="inline-flex flex-col items-center rounded-2xl px-2 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 group"
            >
              <KeyRound size={20} className="mb-2 text-slate-400 group-hover:text-[#0f7a6e] transition-colors" />
              <span>Forgot PIN</span>
            </button>
            <button
              onClick={() => {
                setError('');
                setBioHint('');
                setMode((currentMode) => (currentMode === 'login' ? 'register' : 'login'));
              }}
              className="inline-flex flex-col items-center rounded-2xl px-2 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 group"
            >
              <UserPlus size={20} className="mb-2 text-slate-400 group-hover:text-[#0f7a6e] transition-colors" />
              <span>{mode === 'login' ? 'Register' : 'Login'}</span>
            </button>
            <button
              onClick={() => setHelpOpen(true)}
              className="inline-flex flex-col items-center rounded-2xl px-2 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 group"
            >
              <CircleHelp size={20} className="mb-2 text-slate-400 group-hover:text-[#0f7a6e] transition-colors" />
              <span>Help Center</span>
            </button>
          </div>
        </div>
      </div>

      {helpOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setHelpOpen(false)}>
          <div 
            className="w-full max-w-sm rounded-[40px] bg-white p-10 shadow-2xl dark:bg-slate-900 animate-in zoom-in-95 slide-in-from-bottom-10 duration-500"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-8 flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Need Help?</h3>
              <button onClick={() => setHelpOpen(false)} className="rounded-full p-2 bg-slate-100 dark:bg-slate-800 hover:scale-110 transition-transform">
                <X size={20} className="text-slate-500" />
              </button>
            </div>
            <div className="space-y-8">
              <div>
                <h4 className="text-xs font-black text-[#0f7a6e] uppercase tracking-widest mb-2">Login Procedure</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                  Enter your registered mobile number and your 5-digit security PIN. For Super Admins, use your registered email address.
                </p>
              </div>
              <div>
                <h4 className="text-xs font-black text-[#0f7a6e] uppercase tracking-widest mb-2">Credential Recovery</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                  Tap 'Forgot PIN' to initiate a secure recovery process. You will need access to your registered email for identity verification.
                </p>
              </div>
              <div className="mt-4 rounded-[24px] bg-brand-50 p-6 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-900/30">
                <p className="text-sm font-black text-brand-700 dark:text-brand-300 flex items-center gap-3">
                  <Phone size={16} /> 
                  <span className="uppercase tracking-widest text-[10px]">Support: 111-222-333</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

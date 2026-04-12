import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Loader2, PlusCircle, X, CreditCard, Landmark, Wallet, ChevronRight } from 'lucide-react';
import { createTopUp } from '../api/client';

const formatPKR = (amount) =>
  `Rs. ${Number(amount).toLocaleString('en-PK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const FUNDING_SOURCES = [
  { id: 'meezan', name: 'Meezan Bank', icon: Landmark },
  { id: 'hbl', name: 'Habib Bank (HBL)', icon: Landmark },
  { id: 'sadapay', name: 'SadaPay', icon: CreditCard },
  { id: 'nayapay', name: 'NayaPay', icon: CreditCard },
  { id: 'jazzcash', name: 'JazzCash', icon: Wallet },
  { id: 'easypaisa', name: 'EasyPaisa', icon: Wallet },
];

export default function CreditMoneyModal({ mode, isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState('form');
  const [selectedSource, setSelectedSource] = useState(FUNDING_SOURCES[0].name);
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setStep('form');
    setSelectedSource(FUNDING_SOURCES[0].name);
    setAccountNumber('');
    setAmount('');
    setError('');
    setIsLoading(false);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    const numericAmount = Number(amount);

    if (!accountNumber || accountNumber.length < 4) {
      setError('Please enter a valid account number.');
      return;
    }

    if (!numericAmount || numericAmount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await createTopUp({
        source: selectedSource,
        accountNumber: accountNumber,
        amount: numericAmount,
      });

      if (onSuccess) await onSuccess();
      setStep('success');
      setTimeout(() => onClose(), 2000);
    } catch (requestError) {
      setError(requestError.message || 'Top up failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 z-[150] flex items-end justify-center bg-black/50 sm:items-center">
      <div className="relative flex h-full w-full flex-col overflow-hidden rounded-t-[32px] bg-white dark:bg-slate-900 shadow-2xl sm:h-auto sm:max-h-[95%] sm:rounded-[32px] max-w-md">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-700 p-6">
          <button onClick={onClose} className="rounded-full p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800">
            <ArrowLeft size={22} />
          </button>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Load Wallet</h2>
          <button onClick={onClose} className="rounded-full p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800">
            <X size={22} />
          </button>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto p-6">
          {step === 'form' ? (
            <form onSubmit={handleSubmit} className="flex h-full flex-col gap-5">
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 block">Funding Source</label>
                <div className="relative">
                  <select
                    value={selectedSource}
                    onChange={(e) => setSelectedSource(e.target.value)}
                    className="w-full appearance-none rounded-2xl border border-slate-200 dark:border-slate-700 px-5 py-4 text-slate-800 dark:text-white dark:bg-slate-800 font-bold outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                  >
                    {FUNDING_SOURCES.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ChevronRight size={18} className="rotate-90" />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 block">Source Account Number</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="XXXX-XXXX-XXXX"
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 px-5 py-4 text-slate-800 dark:text-white dark:bg-slate-800 font-bold outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 block">Amount to Load</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rs.</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 pl-14 pr-5 py-4 text-slate-800 dark:text-white dark:bg-slate-800 font-black text-2xl outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                  />
                </div>
              </div>

              {error && <p className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl">{error}</p>}

              <button
                type="submit"
                disabled={isLoading}
                className="mt-auto bg-brand-600 dark:bg-brand-700 py-5 rounded-[24px] text-white font-black text-lg shadow-lg shadow-brand-600/20 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                {isLoading ? <Loader2 size={24} className="animate-spin" /> : <PlusCircle size={24} />}
                {isLoading ? 'Processing...' : 'Add Funds Now'}
              </button>
            </form>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-center animate-in zoom-in-95 duration-300">
              <div className="mb-6 rounded-[32px] bg-emerald-100 dark:bg-emerald-900/30 p-8 text-emerald-600 dark:text-emerald-400 shadow-inner">
                <CheckCircle2 size={64} />
              </div>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">Wallet Refilled!</h3>
              <p className="mt-3 text-slate-500 dark:text-slate-400 font-bold px-10 leading-relaxed">
                Successfully loaded {formatPKR(amount)} from {selectedSource}.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

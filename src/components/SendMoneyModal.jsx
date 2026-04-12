import React, { useState, useEffect } from 'react';
import { Search, X, User, ArrowLeft, CheckCircle, Loader2, Info } from 'lucide-react';
import { createTransfer, getBalance } from '../api/client';

const formatPKR = (amount) => {
  return `Rs. ${Number(amount || 0).toLocaleString('en-PK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const mockContacts = [
  { id: 1, name: 'Ahmed Ejaz', phone: '0300-1234567' },
  { id: 2, name: 'Fatima', phone: '0311-9876543' },
  { id: 3, name: 'Usman', phone: '0322-4567890' },
];

export default function SendMoneyModal({ isOpen, onClose, availableBalance, onTransferSuccess }) {
  const [step, setStep] = useState('select_recipient'); // select_recipient, enter_amount, confirm, success
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [customName, setCustomName] = useState('');
  const [customPhone, setCustomPhone] = useState('');
  const [limitInfo, setLimitInfo] = useState({ limit: 0, spent: 0, remaining: 0 });

  // Reset state and fetch limits when opened
  useEffect(() => {
    if (isOpen) {
      setStep('select_recipient');
      setSelectedRecipient(null);
      setAmount('');
      setError('');
      setIsLoading(false);
      setSearchText('');
      setCustomName('');
      setCustomPhone('');
      
      // Fetch fresh limits
      getBalance().then(data => {
        setLimitInfo({
          limit: data.monthly_limit,
          spent: data.monthly_spent,
          remaining: data.remaining_limit
        });
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectRecipient = (contact) => {
    setSelectedRecipient(contact);
    setStep('enter_amount');
  };

  const handleCustomRecipient = () => {
    if (!customName.trim()) {
      setError('Please enter recipient name');
      return;
    }
    if (!customPhone.trim()) {
      setError('Please enter phone number');
      return;
    }
    setSelectedRecipient({ 
      id: 'custom', 
      name: customName.trim(), 
      phone: customPhone.trim() 
    });
    setError('');
    setStep('enter_amount');
  };

  const handleAmountSubmit = (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (numAmount > availableBalance) {
      setError('Amount exceeds available balance');
      return;
    }
    if (numAmount > limitInfo.remaining) {
      setError(`Amount exceeds your monthly remaining limit (${formatPKR(limitInfo.remaining)})`);
      return;
    }
    setError('');
    setStep('confirm');
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await createTransfer({
        recipientName: selectedRecipient.name,
        amount: Number(amount),
      });
      if (onTransferSuccess) await onTransferSuccess();
      setStep('success');
      setTimeout(() => onClose(), 2000);
    } catch (requestError) {
      setError(requestError.message || 'Transfer failed. Please try again.');
      setStep('enter_amount');
    } finally {
      setIsLoading(false);
    }
  };

  const shownContacts = mockContacts.filter((contact) => {
    if (!searchText.trim()) return true;
    const query = searchText.trim().toLowerCase();
    return contact.name.toLowerCase().includes(query) || contact.phone.includes(query);
  });

  return (
    <div className="absolute inset-0 z-[150] flex justify-center items-end sm:items-center bg-black/50 p-0 transition-opacity">
      <div className="w-full h-full sm:h-auto sm:max-h-[95%] bg-white dark:bg-slate-900 rounded-t-[32px] sm:rounded-[32px] shadow-2xl flex flex-col overflow-hidden relative max-w-md mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
          {step !== 'select_recipient' && step !== 'success' ? (
            <button onClick={() => setStep(step === 'confirm' ? 'enter_amount' : 'select_recipient')} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-400">
              <ArrowLeft size={24} />
            </button>
          ) : <div className="w-10" />}
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {step === 'select_recipient' && 'Send Money'}
            {step === 'enter_amount' && 'Amount'}
            {step === 'confirm' && 'Confirm'}
            {step === 'success' && 'Done'}
          </h2>
          {step !== 'success' ? (
             <button onClick={onClose} className="p-2 -mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-400">
              <X size={24} />
            </button>
          ) : <div className="w-10" />}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col">
          
          {step === 'select_recipient' && (
            <div className="flex flex-col h-full">
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Search name or 03XX-XXXXXXX" 
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
                />
              </div>
              
              <div className="space-y-3 mb-8">
                {shownContacts.map(contact => (
                  <button key={contact.id} onClick={() => handleSelectRecipient(contact)} className="w-full flex items-center p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 group text-left">
                    <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900/40 rounded-full flex items-center justify-center text-brand-700 dark:text-brand-400 mr-4 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                      <User size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 dark:text-white">{contact.name}</p>
                      <p className="text-xs text-gray-500">{contact.phone}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mb-6 p-5 rounded-[24px] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Manual Entry</h3>
                <input type="text" placeholder="Recipient Name" value={customName} onChange={(e) => {setCustomName(e.target.value); setError('');}} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 mb-3 outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white" />
                <input type="tel" placeholder="03XX-XXXXXXX" value={customPhone} onChange={(e) => {setCustomPhone(e.target.value); setError('');}} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 mb-4 outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white" />
                {error && <p className="text-red-500 text-xs font-bold mb-4">{error}</p>}
                <button onClick={handleCustomRecipient} disabled={!customName.trim() || !customPhone.trim()} className="w-full bg-brand-600 py-3 rounded-xl text-white font-black text-sm disabled:opacity-50 transition-all">Proceed with Recipient</button>
              </div>
            </div>
          )}

          {step === 'enter_amount' && (
            <div className="flex flex-col h-full">
              <div className="flex flex-col items-center mb-10 mt-4">
                <div className="w-20 h-20 bg-brand-100 dark:bg-brand-900/40 rounded-[24px] flex items-center justify-center text-brand-700 dark:text-brand-400 mb-4 shadow-sm">
                  <User size={40} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{selectedRecipient.name}</h3>
                <p className="text-slate-500 font-bold text-sm">{selectedRecipient.phone}</p>
              </div>

              <form onSubmit={handleAmountSubmit} className="flex flex-col flex-1">
                <div className="flex flex-col items-center mb-8">
                  <div className="flex items-baseline justify-center text-slate-900 dark:text-white mb-4">
                    <span className="text-2xl font-black mr-2 text-slate-400">Rs.</span>
                    <input type="number" autoFocus value={amount} onChange={(e) => {setAmount(e.target.value); setError('');}} className="text-5xl font-black bg-transparent border-none outline-none text-center w-full max-w-[250px] placeholder-slate-200 focus:ring-0" placeholder="0" />
                  </div>
                  
                  {/* Monthly Limit Badge */}
                  <div className="bg-brand-50 dark:bg-brand-900/20 px-4 py-2 rounded-full flex items-center gap-2 mb-2 border border-brand-100 dark:border-brand-900/30">
                    <Info size={14} className="text-brand-600 dark:text-brand-400" />
                    <p className="text-[11px] font-black text-brand-700 dark:text-brand-300 uppercase tracking-wider">
                      Remaining Monthly Limit: {formatPKR(limitInfo.remaining)}
                    </p>
                  </div>
                  
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                    Available Balance: {formatPKR(availableBalance)}
                  </p>
                  {error && <p className="text-red-500 text-xs font-bold mt-4 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-full">{error}</p>}
                </div>

                <button type="submit" disabled={!amount} className="mt-auto bg-brand-700 py-5 rounded-[24px] text-white font-black text-lg shadow-lg shadow-brand-700/20 active:scale-95 transition-all">Review & Pay</button>
              </form>
            </div>
          )}

          {step === 'confirm' && (
            <div className="flex flex-col h-full">
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[32px] p-8 mb-8 border border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2 text-center">Transfer Amount</h3>
                <p className="text-4xl font-black text-center text-brand-700 dark:text-brand-400 mb-8">{formatPKR(amount)}</p>
                
                <div className="space-y-5">
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Recipient</span>
                    <span className="font-black text-slate-900 dark:text-white">{selectedRecipient.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Transaction Fee</span>
                    <span className="font-black text-emerald-600 uppercase text-xs tracking-widest">Free</span>
                  </div>
                </div>
              </div>
              
              <button onClick={handleConfirm} disabled={isLoading} className="mt-auto bg-brand-700 py-5 rounded-[24px] text-white font-black text-lg flex justify-center items-center gap-3">
                {isLoading ? <Loader2 className="animate-spin" size={24} /> : 'Confirm Secure Transfer'}
              </button>
            </div>
          )}

          {step === 'success' && (
            <div className="flex flex-col items-center justify-center h-full animate-in zoom-in-95 duration-300">
              <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-[32px] flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6 shadow-inner">
                <CheckCircle size={48} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Success!</h2>
              <p className="text-slate-500 font-bold text-center px-8 leading-relaxed">
                You have sent {formatPKR(amount)} to {selectedRecipient?.name}.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

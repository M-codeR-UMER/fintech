import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, RefreshCcw, Download } from 'lucide-react';
import { getTransactions, getStatement } from '../api/client';

const formatPKR = (amount) => {
  return `Rs. ${amount.toLocaleString('en-PK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const TransactionItem = ({ tx }) => {
  const isSend = tx.type === 'send';
  return (
    <div className="flex justify-between items-center p-4 bg-white dark:bg-slate-800 border-b border-gray-50 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors cursor-pointer active:bg-gray-100 dark:active:bg-slate-600">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSend ? 'bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-400' : 'bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-400'}`}>
          {isSend ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
        </div>
        <div>
          <h4 className="font-semibold text-gray-800 dark:text-white">{tx.counterpartyName}</h4>
          <p className="text-xs text-gray-500 dark:text-slate-400">{tx.date} • {tx.time}</p>
        </div>
      </div>
      <div className={`font-bold text-right ${isSend ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
        {isSend ? '-' : '+'}{formatPKR(tx.amount)}
      </div>
    </div>
  );
};

export default function TransactionHistoryScreen({ onBack }) {
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem('finpay.transactions.activeTab');
    return ['All', 'Sent', 'Received'].includes(savedTab) ? savedTab : 'All';
  }); // 'All', 'Sent', 'Received'
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState('');

  const loadTransactions = async () => {
    setError('');
    setIsLoading(true);
    try {
      const data = await getTransactions();
      setTransactions(data);
    } catch (requestError) {
      setError(requestError.message || 'Unable to load transaction history.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    localStorage.setItem('finpay.transactions.activeTab', activeTab);
  }, [activeTab]);

  const filteredTransactions = useMemo(() => {
    if (activeTab === 'All') return transactions;
    return transactions.filter(tx => 
      activeTab === 'Sent' ? tx.type === 'send' : tx.type === 'receive'
    );
  }, [activeTab, transactions]);

  const handleDownloadStatement = async () => {
    try {
      setIsDownloading(true);
      setError('');
      await getStatement();
    } catch (err) {
      setError('Failed to download statement. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-[82vh] flex justify-center font-sans">
      <div className="w-full max-w-md bg-white/90 dark:bg-slate-900/90 border border-white dark:border-slate-800 rounded-[32px] shadow-2xl overflow-hidden flex flex-col relative h-[calc(100dvh-7.5rem)] min-h-[640px] sm:h-[760px] backdrop-blur min-h-0">
        
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 px-6 pt-8 pb-4 sticky top-0 z-10">
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={onBack}
              className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">Transaction History</h1>
            <button 
              onClick={handleDownloadStatement}
              disabled={isDownloading}
              className="p-2 rounded-full bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 hover:bg-brand-100 transition-colors disabled:opacity-50"
              title="Download PDF Statement"
            >
              {isDownloading ? <RefreshCcw size={20} className="animate-spin" /> : <Download size={20} />}
            </button>
          </div>

          {/* Filtering Tabs */}
          <div className="flex p-1 bg-gray-100 dark:bg-slate-800 rounded-2xl">
            {['All', 'Sent', 'Received'].map((tab) => (activeTab === tab ? (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex-1 py-2.5 text-sm font-bold rounded-xl bg-brand-600 dark:bg-brand-700 text-white shadow-md transition-all duration-200"
              >
                {tab}
              </button>
            ) : (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex-1 py-2.5 text-sm font-bold rounded-xl text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 transition-all duration-200"
              >
                {tab}
              </button>
            )))}
          </div>
        </div>

        {/* Transaction List */}
        <div className="flex-1 overflow-y-auto px-2 pb-6 min-h-0">
          {isLoading ? (
            <div className="px-4 py-6 text-sm text-brand-700 dark:text-brand-400">Loading transactions...</div>
          ) : error ? (
            <div className="mx-3 mt-3 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950 px-4 py-3 text-sm text-red-700 dark:text-red-400">
              <p>{error}</p>
              <button
                onClick={loadTransactions}
                className="mt-2 inline-flex items-center gap-2 rounded-lg bg-white dark:bg-slate-800 px-3 py-1.5 font-semibold text-red-700 dark:text-red-400"
              >
                <RefreshCcw size={14} /> Retry
              </button>
            </div>
          ) : filteredTransactions.length > 0 ? (
            <div className="flex flex-col">
              {filteredTransactions.map((tx) => (
                <TransactionItem key={tx.id} tx={tx} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-full mb-4">
                <ArrowLeft className="text-slate-300 rotate-180" size={32} />
              </div>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No transactions, make transaction first!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

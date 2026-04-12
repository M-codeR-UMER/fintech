import React, { useEffect, useMemo, useState } from 'react';
import { Send, Download, Plus, RefreshCcw, LogOut, Moon, Sun, Eye, EyeOff, Smartphone, Zap, QrCode, BarChart3, Wallet, MoreHorizontal, Bell, History } from 'lucide-react';
import SendMoneyModal from '../components/SendMoneyModal';
import CreditMoneyModal from '../components/CreditMoneyModal';
import QRPayModal from '../components/QRPayModal';
import TopBar from '../components/TopBar';
import { getBalance, getTransactions, resetSeedData, createTransfer } from '../api/client';

const formatPKR = (amount) => {
  return `Rs. ${amount.toLocaleString('en-PK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatPhoneNumber = (phoneNumber) => {
  const raw = String(phoneNumber || '').trim();
  if (!raw) {
    return '03XX-XXXXXXX';
  }

  return raw;
};



const BalanceCard = ({ balance, phoneNumber, tier, limit }) => {
  const [showBalance, setShowBalance] = useState(true);

  const [wholePart, decimalPart] = useMemo(() => {
    const value = Number(balance || 0).toLocaleString('en-PK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return value.split('.');
  }, [balance]);

  const tierName = tier === 'L1' ? 'Level 1 (L1)' : 'Level 2 (L2)';

  return (
    <div className="relative mb-8 overflow-hidden rounded-[24px] bg-gradient-to-br from-[#0f7a6e] via-[#0f8076] to-[#07a3c2] p-6 text-white shadow-soft">
      <div className="absolute -right-8 -top-7 h-40 w-40 rounded-full bg-white/9" aria-hidden="true" />
      <div className="absolute right-4 top-14 h-24 w-24 rounded-full bg-white/6" aria-hidden="true" />
      <div className="relative">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[1.55rem] font-semibold text-brand-100">Available Balance</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-widest border border-white/10">
                {tierName}
              </span>
              <span className="text-[10px] font-bold text-white/60">Limit: Rs. {Number(limit || 0).toLocaleString()}</span>
            </div>
          </div>
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/65 bg-slate-950/45 text-white transition-colors hover:bg-slate-950/65"
            aria-label="Toggle balance visibility"
          >
            {showBalance ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        </div>
        <h2 className="mb-6 tracking-tight text-white">
          {showBalance ? (
            <>
              <span className="text-[1.05em] align-baseline font-semibold">Rs.</span>
              <span className="text-[2.35em] leading-none align-baseline font-extrabold">{wholePart}</span>
              <span className="text-[1.25em] align-baseline font-bold text-brand-200">.{decimalPart}</span>
            </>
          ) : (
            <span className="text-4xl font-bold">••••••</span>
          )}
        </h2>
        <div className="flex items-center gap-2 text-sm text-brand-100">
          <span className="inline-flex items-center rounded-full bg-white/14 px-3 py-1.5 font-semibold text-brand-50">{formatPhoneNumber(phoneNumber)}</span>
          <span className="text-brand-300">•</span>
          <span className="font-semibold text-brand-100">Verified</span>
        </div>
      </div>
    </div>
  );
};

const ActionBtn = ({ icon, label, onClick }) => (
  <button onClick={onClick} className="flex flex-col items-center justify-center group cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500 rounded-xl p-1">
    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-brand-700 dark:text-brand-400 mb-2 shadow-sm transition-all group-hover:bg-brand-600 dark:group-hover:bg-brand-600 group-hover:text-white group-active:scale-95">
      {icon}
    </div>
    <span className="text-xs font-medium text-slate-700 dark:text-slate-300 text-center line-clamp-2">{label}</span>
  </button>
);

const QuickActions = ({ onSendClick, onAddFundsClick, onQRPayClick, onHistoryClick }) => (
  <div className="mb-8">
    <h3 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-4">Quick Actions</h3>
    <div className="grid grid-cols-4 gap-3">
      <ActionBtn icon={<Send size={20} />} label="Send" onClick={onSendClick} />
      <ActionBtn icon={<Wallet size={20} />} label="Load Wallet" onClick={onAddFundsClick} />
      <ActionBtn icon={<QrCode size={20} />} label="QR Pay" onClick={onQRPayClick} />
      <ActionBtn icon={<History size={20} />} label="History" onClick={onHistoryClick} />
    </div>
  </div>
);

const TransactionItem = ({ tx }) => {
  const isSend = tx.type === 'send';
  return (
    <div className="flex justify-between items-center p-4 mb-3 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-default">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSend ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400' : 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'}`}>
          {isSend ? <Send size={18} /> : <Download size={18} />}
        </div>
        <div>
          <h4 className="font-semibold text-slate-800 dark:text-slate-200">{tx.counterpartyName}</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">{tx.date} • {tx.time}</p>
        </div>
      </div>
      <div className={`font-semibold ${isSend ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
        {isSend ? '-' : '+'}{formatPKR(tx.amount)}
      </div>
    </div>
  );
};

const PromoCard = ({ title, subtitle, bgColor }) => (
  <div className={`rounded-2xl p-4 text-white ${bgColor} shadow-md`}>
    <h4 className="font-bold text-sm mb-1">{title}</h4>
    <p className="text-xs opacity-90">{subtitle}</p>
  </div>
);

const RecentTransactions = ({ transactions, onViewAll }) => (
  <div>
    <div className="flex justify-between items-end mb-4">
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Recent Transactions</h3>
      {transactions.length > 0 && (
        <button
          onClick={onViewAll}
          className="text-sm text-brand-700 dark:text-brand-400 font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-brand-500 rounded px-1"
        >
          See All
        </button>
      )}
    </div>
    <div>
      {transactions.length > 0 ? (
        transactions.slice(0, 4).map((tx) => (
          <TransactionItem key={tx.id} tx={tx} />
        ))
      ) : (
        <div className="py-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No transactions, make transaction first!</p>
        </div>
      )}
    </div>
  </div>
);

export default function Dashboard({ onViewAll, userFirstName, userPhoneNumber, onLogout, isDarkMode, onToggleDarkMode, actionRequest }) {
  const [isSendMoneyOpen, setIsSendMoneyOpen] = useState(false);
  const [isQRPayOpen, setIsQRPayOpen] = useState(false);
  const [creditMode, setCreditMode] = useState(null);
  const [balance, setBalance] = useState(0);
  const [tier, setTier] = useState('L1');
  const [limit, setLimit] = useState(50000);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const loadDashboard = async () => {
    setError('');
    setIsLoading(true);
    try {
      const [balanceData, transactionsData] = await Promise.all([getBalance(), getTransactions()]);
      setBalance(balanceData.balance);
      setTier(balanceData.tier);
      setLimit(balanceData.monthly_limit);
      setTransactions(transactionsData);
    } catch (requestError) {
      setError(requestError.message || 'Failed to load dashboard data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    if (!actionRequest?.token) {
      return;
    }

    if (actionRequest.type === 'transfer') {
      setIsSendMoneyOpen(true);
      return;
    }

    if (actionRequest.type === 'receive') {
      setCreditMode('receive');
      return;
    }

    if (actionRequest.type === 'qrpay') {
      setIsQRPayOpen(true);
      return;
    }

    if (actionRequest.type === 'reset') {
      setIsSendMoneyOpen(false);
      setIsQRPayOpen(false);
      setCreditMode(null);
      return;
    }
  }, [actionRequest]);

  const handleResetSampleData = async () => {
    setError('');
    setIsResetting(true);
    try {
      await resetSeedData();
      await loadDashboard();
    } catch (requestError) {
      setError(requestError.message || 'Failed to reset sample data.');
    } finally {
      setIsResetting(false);
    }
  };

  const handleQRPayDetected = async (qrData) => {
    // Parse QR data and create transfer
    try {
      setError('');
      const result = await createTransfer({
        recipientName: qrData.recipientName || 'QR Pay Recipient',
        amount: qrData.amount || 0
      });
      
      // Reload dashboard to show updated balance
      await loadDashboard();
      
      // Show success message (optional)
      alert(`Successfully transferred Rs. ${qrData.amount} to ${qrData.recipientName}`);
    } catch (err) {
      setError(err.message || 'Failed to process QR payment');
    }
  };

  return (
    <div className="min-h-[82vh] flex justify-center">
      <div className="w-full max-w-md bg-white/90 dark:bg-slate-900/90 border border-white dark:border-slate-800 rounded-[32px] shadow-2xl overflow-hidden relative h-[calc(100dvh-7.5rem)] min-h-[645px] sm:h-[765px] backdrop-blur flex flex-col">
        
        <div className="h-8 w-full bg-white dark:bg-slate-900 flex justify-center items-center flex-shrink-0">
          <div className="w-1/3 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
        </div>
        
        <TopBar 
          firstName={userFirstName} 
          onLogout={onLogout} 
          isDarkMode={isDarkMode} 
          onToggleDarkMode={onToggleDarkMode}
          onResetData={handleResetSampleData}
          isResetting={isResetting}
        />
        
        <div className="px-6 pb-6 mt-5 h-full overflow-y-auto overflow-x-hidden flex-1">

          {isLoading ? (
            <div className="mb-8 rounded-3xl border border-brand-100 dark:border-brand-900 bg-brand-50/60 dark:bg-brand-950/60 p-4 text-sm text-brand-700 dark:text-brand-400">Loading wallet summary...</div>
          ) : (
            <BalanceCard balance={balance} phoneNumber={userPhoneNumber} tier={tier} limit={limit} />
          )}

          {error ? (
            <div className="mb-4 rounded-2xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950 px-4 py-3 text-sm text-red-700 dark:text-red-400">
              <p>{error}</p>
              <button
                onClick={loadDashboard}
                className="mt-2 inline-flex items-center gap-2 rounded-lg bg-white dark:bg-slate-800 px-3 py-1.5 font-semibold text-red-700 dark:text-red-400 shadow-sm"
              >
                <RefreshCcw size={14} /> Retry
              </button>
            </div>
          ) : null}

          <QuickActions
            onSendClick={() => setIsSendMoneyOpen(true)}
            onAddFundsClick={() => setCreditMode('addFunds')}
            onQRPayClick={() => setIsQRPayOpen(true)}
            onHistoryClick={onViewAll}
          />

          {/* Promo Cards */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <PromoCard 
              title="Send Money Free" 
              subtitle="Zero fee on transfers till March 31"
              bgColor="bg-gradient-to-br from-brand-600 to-brand-700"
            />
            <PromoCard 
              title="Virtual Card Ready" 
              subtitle="Get your digital card instantly"
              bgColor="bg-gradient-to-br from-cyan-500 to-cyan-600"
            />
          </div>

          <RecentTransactions transactions={transactions} onViewAll={onViewAll} />
        </div>

        <SendMoneyModal
          isOpen={isSendMoneyOpen}
          availableBalance={balance}
          onClose={() => setIsSendMoneyOpen(false)}
          onTransferSuccess={loadDashboard}
        />

        <CreditMoneyModal
          mode={creditMode}
          isOpen={Boolean(creditMode)}
          onClose={() => setCreditMode(null)}
          onSuccess={loadDashboard}
        />

        <QRPayModal
          isOpen={isQRPayOpen}
          onClose={() => setIsQRPayOpen(false)}
          onQRDetected={handleQRPayDetected}
        />
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { Home, ArrowLeftRight, QrCode, CreditCard, User, Moon, Sun } from 'lucide-react';
import Dashboard from './screens/Dashboard';
import TransferScreen from './screens/TransferScreen';
import VirtualCard from './screens/VirtualCard';
import TransactionHistoryScreen from './screens/TransactionHistory';
import AccountScreen from './screens/AccountScreen';
import Auth from './screens/Auth';
import AdminDashboard from './screens/AdminDashboard';

const CURRENT_USER_KEY = 'finpay.currentUser';
const DARK_MODE_KEY = 'finpay.darkMode';

const bottomNavItems = [
  { key: 'dashboard', label: 'Home', icon: Home },
  { key: 'transfer', label: 'Transfer', icon: ArrowLeftRight },
  { key: 'qr', label: 'QR', icon: QrCode },
  { key: 'card', label: 'Card', icon: CreditCard },
  { key: 'account', label: 'Account', icon: User },
];

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem(DARK_MODE_KEY);
    return saved === 'true';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(DARK_MODE_KEY, isDarkMode);
  }, [isDarkMode]);

  const [activeScreen, setActiveScreen] = useState(() => {
    return localStorage.getItem('finpay.activeScreen') || 'dashboard';
  });

  const [actionRequest, setActionRequest] = useState(null);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const raw = localStorage.getItem(CURRENT_USER_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      // Handle both backend snake_case and frontend camelCase
      const hasName = parsed?.firstName || parsed?.first_name;
      const hasContact = parsed?.email || parsed?.phoneNumber || parsed?.phone_number;
      return hasName && hasContact ? parsed : null;
    } catch {
      return null;
    }
  });

  // Inactivity Timer (1 minute)
  useEffect(() => {
    let timeout;
    const resetTimer = () => {
      clearTimeout(timeout);
      if (currentUser) {
        timeout = setTimeout(() => {
          handleLogout();
        }, 60000); 
      }
    };
    
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(e => window.addEventListener(e, resetTimer));
    resetTimer();
    
    return () => {
      clearTimeout(timeout);
      events.forEach(e => window.removeEventListener(e, resetTimer));
    };
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) {
      document.title = 'FinPay | Login';
      return;
    }
    const screenNames = {
      dashboard: 'Home',
      transfer: 'Transfer',
      account: 'Account',
      card: 'Virtual Card',
      transactions: 'History'
    };
    document.title = `FinPay | ${screenNames[activeScreen] || 'Financial App'}`;
  }, [activeScreen, currentUser]);

  useEffect(() => {
    localStorage.setItem('finpay.activeScreen', activeScreen);
  }, [activeScreen]);

  useEffect(() => {
    if (!currentUser) {
      localStorage.removeItem(CURRENT_USER_KEY);
    } else {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
    }
  }, [currentUser]);

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveScreen('dashboard');
  };

  const handleBottomNavClick = (key) => {
    if (key === 'qr') {
      setActiveScreen('dashboard');
      setActionRequest({ type: 'qrpay', token: Date.now() });
      return;
    }
    if (key === 'dashboard') {
      setActionRequest({ type: 'reset', token: Date.now() });
    }
    setActiveScreen(key);
  };

  const page = useMemo(() => {
    if (currentUser?.role === 'admin') {
      return (
        <div className="min-h-[82vh] flex justify-center">
          <div className="w-full max-w-md bg-white/90 dark:bg-slate-900/90 border border-white dark:border-slate-800 rounded-[32px] shadow-2xl overflow-hidden relative h-[calc(100dvh-7.5rem)] min-h-[645px] sm:h-[765px] backdrop-blur flex flex-col min-h-0">
            <div className="h-8 w-full bg-white dark:bg-slate-900 flex justify-center items-center flex-shrink-0">
              <div className="w-1/3 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
            </div>
            <div className="px-6 pb-6 h-full overflow-y-auto overflow-x-hidden flex-1 min-h-0">
              <AdminDashboard onLogout={handleLogout} />
            </div>
          </div>
        </div>
      );
    }

    switch (activeScreen) {
      case 'card':
        return <VirtualCard userFirstName={currentUser?.first_name || currentUser?.firstName || 'User'} onBack={() => setActiveScreen('dashboard')} />;
      
      case 'transfer':
        return (
          <TransferScreen 
            onBack={() => setActiveScreen('dashboard')}
            userFirstName={currentUser?.first_name || currentUser?.firstName || 'User'}
            userPhoneNumber={currentUser?.phone_number || currentUser?.phoneNumber || '03XX-XXXXXXX'}
            onSendClick={() => {
              setActiveScreen('dashboard');
              setActionRequest({ type: 'transfer', token: Date.now() });
            }}
            onReceiveClick={() => {
              setActiveScreen('dashboard');
              setActionRequest({ type: 'receive', token: Date.now() });
            }}
          />
        );

      case 'account':
        return (
          <div className="min-h-[82vh] flex justify-center">
            <div className="w-full max-w-md bg-white/90 dark:bg-slate-900/90 border border-white dark:border-slate-800 rounded-[32px] shadow-2xl overflow-hidden relative h-[calc(100dvh-7.5rem)] min-h-[645px] sm:h-[765px] backdrop-blur flex flex-col">
              {/* Phone notch/decoration like Dashboard */}
              <div className="h-8 w-full bg-white dark:bg-slate-900 flex justify-center items-center flex-shrink-0">
                <div className="w-1/3 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
              </div>
              
              <div className="px-6 pb-6 h-full overflow-y-auto overflow-x-hidden flex-1">
                <AccountScreen 
                  user={currentUser} 
                  onLogout={handleLogout} 
                  isDarkMode={isDarkMode}
                  onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
                  onBack={() => setActiveScreen('dashboard')}
                />
              </div>
            </div>
          </div>
        );

      case 'transactions':
        return <TransactionHistoryScreen onBack={() => setActiveScreen('dashboard')} />;

      default:
        return (
          <Dashboard
            onViewAll={() => setActiveScreen('transactions')}
            userFirstName={currentUser?.first_name || currentUser?.firstName || 'User'}
            userPhoneNumber={currentUser?.phone_number || currentUser?.phoneNumber || '03XX-XXXXXXX'}
            onLogout={handleLogout}
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
            actionRequest={actionRequest}
          />
        );
    }
  }, [activeScreen, currentUser, isDarkMode, actionRequest]);

  if (!currentUser) {
    return (
      <div className="app-bg dark:bg-slate-950 min-h-screen px-4 py-6 sm:px-8 md:py-10">
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="fixed top-4 right-4 z-40 rounded-full p-2.5 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 shadow-sm transition-colors"
        >
          {isDarkMode ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-slate-700" />}
        </button>
        <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-20 -left-16 h-64 w-64 rounded-full bg-brand-200/50 dark:bg-brand-900/30 blur-3xl" />
          <div className="absolute top-1/2 -right-20 h-80 w-80 rounded-full bg-cyan-200/50 dark:bg-cyan-900/30 blur-3xl" />
        </div>
        <main className="relative mx-auto max-w-6xl animate-rise">
           <div className="min-h-[82vh] flex justify-center">
            <div className="w-full max-w-md bg-white/90 dark:bg-slate-900/90 border border-white dark:border-slate-800 rounded-[32px] shadow-2xl overflow-hidden relative h-[calc(100dvh-7.5rem)] min-h-[645px] sm:h-[765px] backdrop-blur flex flex-col min-h-0">
              <div className="h-8 w-full bg-white dark:bg-slate-900 flex justify-center items-center flex-shrink-0">
                <div className="w-1/3 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
              </div>
              <div className="px-6 pb-6 h-full overflow-y-auto overflow-x-hidden flex-1 min-h-0 pt-4">
                 <Auth onAuthSuccess={setCurrentUser} />
              </div>
            </div>
           </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-bg dark:bg-slate-950 min-h-screen px-4 py-6 sm:px-8 md:py-10">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-20 -left-16 h-64 w-64 rounded-full bg-brand-200/50 dark:bg-brand-900/30 blur-3xl" />
        <div className="absolute top-1/2 -right-20 h-80 w-80 rounded-full bg-cyan-200/50 dark:bg-cyan-900/30 blur-3xl" />
      </div>

      <main className="relative mx-auto max-w-6xl animate-rise pb-28">
        {page}
      </main>

      {/* Bottom Navigation */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex justify-center">
        <nav className="w-full max-w-md rounded-t-[32px] border-t border-slate-200 bg-white/95 px-4 py-2.5 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
          <ul className="grid grid-cols-5 items-end gap-1">
            {bottomNavItems.map((item) => {
              const Icon = item.icon;
              const isCenter = item.key === 'qr';
              const isActive = (activeScreen === item.key) || (item.key === 'dashboard' && activeScreen === 'transactions');

              if (isCenter) {
                return (
                  <li key={item.key} className="flex justify-center -mt-8">
                    <button
                      onClick={() => handleBottomNavClick(item.key)}
                      className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-700 text-white shadow-lg shadow-brand-700/30 transition-all hover:scale-105 active:scale-95"
                    >
                      <Icon size={32} />
                    </button>
                  </li>
                );
              }

              return (
                <li key={item.key} className="flex justify-center">
                  <button
                    onClick={() => handleBottomNavClick(item.key)}
                    className={`inline-flex min-w-[4rem] flex-col items-center rounded-xl px-1 py-1.5 transition-all active:scale-95 ${
                      isActive
                        ? 'text-brand-700 dark:text-brand-400'
                        : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
                    }`}
                  >
                    <Icon size={30} />
                    <span className={`mt-1 text-xs font-bold ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                      {item.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}

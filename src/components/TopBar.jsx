import React, { useState } from 'react';
import { Menu, Moon, Sun, LogOut, RefreshCcw, CreditCard, BarChart3, FileText, HelpCircle, Settings, User, Phone } from 'lucide-react';

const TopBar = ({ firstName, onLogout, isDarkMode, onToggleDarkMode, onResetData, isResetting }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const menuItems = [
    { icon: CreditCard, label: 'Linked Banks', action: () => showToast('Linked Banks feature is under development') },
    { icon: BarChart3, label: 'Account Limits', action: () => showToast('Account Limits feature is under development') },
    { icon: FileText, label: 'Statements', action: () => showToast('Statement Download feature is under development') },
    { icon: HelpCircle, label: 'Help & Support', action: () => showToast('Support feature is under development') },
    { 
      icon: isDarkMode ? Sun : Moon, 
      label: isDarkMode ? 'Light Mode' : 'Dark Mode', 
      action: () => { onToggleDarkMode(); setIsMenuOpen(false); } 
    },
  ];

  return (
    <div className="bg-transparent px-6 py-4 relative flex-shrink-0 z-[100]">
      <div className="flex items-center justify-between">
        {/* Left: User Name */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-brand-900/20">F</div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">FinPay</h1>
        </div>

        {/* Right: Menu Button */}
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 transition-all hover:bg-slate-100 dark:hover:bg-slate-700/70 hover:text-slate-900 dark:hover:text-white active:scale-95"
          >
            <Menu size={20} strokeWidth={2.5} />
          </button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-[24px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl animate-in fade-in slide-in-from-top-2 z-[110]">
              {/* Menu Header: User Info */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 p-5 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold border border-brand-500/30">
                    {firstName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">{firstName}</p>
                    <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">Level 2 Verified</p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-2">
                {menuItems.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      item.action();
                      if (item.label.includes('Mode')) return; // Don't close for theme toggle
                      setIsMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-600 dark:text-slate-300 transition-all hover:bg-slate-50 dark:hover:bg-slate-800 active:bg-slate-100 dark:active:bg-slate-700"
                  >
                    <item.icon size={18} className="text-slate-400 dark:text-slate-500" />
                    <span>{item.label}</span>
                  </button>
                ))}

                <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                <button
                  onClick={() => {
                    onLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-red-400 transition-all hover:bg-red-950/30 active:bg-red-950/50"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}

          {/* Backdrop click handler */}
          {isMenuOpen && (
            <div className="fixed inset-0 z-[-1]" onClick={() => setIsMenuOpen(false)} />
          )}
        </div>
      </div>

      {/* Under Development Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] bg-slate-900 border border-slate-700 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-4">
          <Settings size={18} className="text-brand-400 animate-spin" />
          <span className="text-sm font-bold">{toast}</span>
        </div>
      )}
    </div>
  );
};

export default TopBar;

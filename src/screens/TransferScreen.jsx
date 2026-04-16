import React, { useState } from 'react';
import { ArrowLeft, Send, Download } from 'lucide-react';
import ReceiveQRScreen from './ReceiveQRScreen';

export default function TransferScreen({ onBack, onSendClick, onReceiveClick, userFirstName, userPhoneNumber }) {
  const [showQR, setShowQR] = useState(false);

  if (showQR) {
    return (
      <ReceiveQRScreen
        userName={userFirstName}
        userPhone={userPhoneNumber}
        onBack={() => setShowQR(false)}
      />
    );
  }
  return (
    <div className="min-h-[82vh] flex justify-center">
      <div className="w-full max-w-md bg-white/90 dark:bg-slate-900/90 border border-white dark:border-slate-800 rounded-[32px] shadow-2xl overflow-hidden relative h-[calc(100dvh-7.5rem)] min-h-[640px] sm:h-[760px] backdrop-blur flex flex-col min-h-0">
        
        {/* Phone notch */}
        <div className="h-8 w-full bg-white dark:bg-slate-900 flex justify-center items-center flex-shrink-0">
          <div className="w-1/3 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
          <button
            onClick={onBack}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={20} className="text-slate-700 dark:text-slate-300" />
          </button>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Money Transfer</h1>
        </div>

        {/* Content */}
        <div className="px-6 py-12 h-full overflow-y-auto overflow-x-hidden flex-1 min-h-0 flex flex-col items-center justify-center gap-8">
          
          {/* Send Money Option */}
          <button
            onClick={onSendClick}
            className="w-full group"
          >
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f7a6e] via-[#0f8076] to-[#07a3c2] p-5 text-white shadow-lg hover:shadow-2xl transition-all hover:scale-105 active:scale-95">
              {/* Decorative elements */}
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
              <div className="absolute left-4 bottom-4 h-20 w-20 rounded-full bg-white/5" />

              <div className="relative flex flex-col items-center justify-center gap-3 py-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 group-hover:bg-white/30 transition-colors">
                  <Send size={32} className="text-white" />
                </div>
                <div className="text-center">
                  <h2 className="text-xl font-bold">Send Money</h2>
                  <p className="mt-1 text-xs text-white/80">Transfer funds to any account</p>
                </div>
              </div>
            </div>
          </button>

          {/* Divider */}
          <div className="relative w-full flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-300 dark:bg-slate-700" />
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">OR</span>
            <div className="flex-1 h-px bg-slate-300 dark:bg-slate-700" />
          </div>

          {/* Receive Money Option */}
          <button
            onClick={() => setShowQR(true)}
            className="w-full group"
          >
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 p-5 text-white shadow-lg hover:shadow-2xl transition-all hover:scale-105 active:scale-95">
              {/* Decorative elements */}
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
              <div className="absolute left-4 bottom-4 h-20 w-20 rounded-full bg-white/5" />

              <div className="relative flex flex-col items-center justify-center gap-3 py-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 group-hover:bg-white/30 transition-colors">
                  <Download size={32} className="text-white" />
                </div>
                <div className="text-center">
                  <h2 className="text-xl font-bold">Receive Money</h2>
                  <p className="mt-1 text-xs text-white/80">Generate QR code to receive funds</p>
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

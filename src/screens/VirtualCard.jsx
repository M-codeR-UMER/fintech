import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

export default function VirtualCardScreen({ userFirstName, onBack }) {
  const [showCVV, setShowCVV] = useState(false);
  const [showFullNumber, setShowFullNumber] = useState(false);

  // Generate a mock card number for the user
  const cardNumber = '4532 1234 5678 9012';
  const cardNumberMasked = '•••• •••• •••• 9012';
  const expiryDate = '12/27';
  const cvv = '425';
  const cvvMasked = '•••';

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
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Virtual Card</h1>
        </div>

        {/* Content */}
        <div className="px-6 py-8 h-full overflow-y-auto overflow-x-hidden flex-1 min-h-0">
          
          {/* Card Visual */}
          <div className="mb-8 aspect-video rounded-2xl bg-gradient-to-br from-[#0f7a6e] via-[#0f8076] to-[#07a3c2] p-6 text-white shadow-2xl relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
            <div className="absolute left-4 bottom-4 h-20 w-20 rounded-full bg-white/5" />

            <div className="relative flex flex-col justify-between h-full">
              {/* Top - VISA Logo and Chip */}
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-white/70">YOUR BANK</span>
                  <span className="text-sm font-bold text-white/90">FinPay</span>
                </div>
                
                {/* Chip simulator */}
                <div className="w-12 h-9 bg-gradient-to-b from-yellow-300 to-yellow-600 rounded-lg grid grid-cols-2 gap-1 p-1.5">
                  <div className="bg-yellow-700 rounded-sm opacity-60" />
                  <div className="bg-yellow-700 rounded-sm opacity-60" />
                  <div className="bg-yellow-700 rounded-sm opacity-60" />
                  <div className="bg-yellow-700 rounded-sm opacity-60" />
                </div>
              </div>

              {/* Middle - Card Number */}
              <div className="flex items-center gap-2">
                <span className="text-xl font-mono tracking-wider font-bold">
                  {showFullNumber ? cardNumber : cardNumberMasked}
                </span>
                <button
                  onClick={() => setShowFullNumber(!showFullNumber)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                >
                  {showFullNumber ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>

              {/* Bottom - Cardholder Name, Expiry, and VISA logo */}
              <div className="flex items-end justify-between">
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold text-white/70">Cardholder Name</span>
                  <span className="text-sm font-bold text-white uppercase tracking-wide">{userFirstName}</span>
                  <div className="mt-1 flex gap-6">
                    <div>
                      <span className="text-xs font-semibold text-white/70">Expires</span>
                      <p className="text-sm font-mono font-bold text-white">{expiryDate}</p>
                    </div>
                  </div>
                </div>

                {/* VISA Logo */}
                <div className="flex flex-col items-center gap-1">
                  <div className="text-2xl font-black text-white">VISA</div>
                  <div className="text-xs font-bold text-white/60">GOLD</div>
                </div>
              </div>
            </div>
          </div>

          {/* Card Status */}
          <div className="sticky bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white dark:from-slate-900 dark:via-slate-900 pt-6 -mx-6 px-6">
            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/30 rounded-xl border border-green-200 dark:border-green-900">
              <div>
                <p className="text-xs font-semibold text-green-700 dark:text-green-400">Card Status</p>
                <p className="text-sm font-bold text-green-900 dark:text-green-200">Active</p>
              </div>
              <div className="w-3 h-3 rounded-full bg-green-600 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

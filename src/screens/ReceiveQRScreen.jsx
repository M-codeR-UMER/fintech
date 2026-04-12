import React, { useEffect, useState } from 'react';
import { ArrowLeft, Download, Copy, Loader2 } from 'lucide-react';

export default function ReceiveQRScreen({ userPhone, userName, onBack }) {
  const [qrImageUrl, setQrImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Generate QR code data - format: upi://pay?pa=phonenumber&pn=username
    const qrData = `upi://pay?pa=${userPhone}@upi&pn=${encodeURIComponent(userName)}&tn=Payment`;
    
    // Generate QR code image using qr-server.com API
    const encodedData = encodeURIComponent(qrData);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodedData}&margin=10`;
    setQrImageUrl(qrUrl);
    setIsLoading(false);
  }, [userPhone, userName]);

  const handleDownloadQR = async () => {
    try {
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qr-receive-${userName}.png`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to download QR code');
    }
  };

  const handleCopyQR = async () => {
    try {
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      alert('QR Code copied to clipboard!');
    } catch (error) {
      alert('Failed to copy QR code');
    }
  };

  return (
    <div className="min-h-[82vh] flex justify-center">
      <div className="w-full max-w-md bg-white/90 dark:bg-slate-900/90 border border-white dark:border-slate-800 rounded-[32px] shadow-2xl overflow-hidden relative h-[calc(100dvh-7.5rem)] min-h-[640px] sm:h-[760px] backdrop-blur flex flex-col">
        
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
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Receive Payment</h1>
        </div>

        {/* Content - Flex column with space between */}
        <div className="px-6 py-6 h-full overflow-y-auto overflow-x-hidden flex-1 flex flex-col justify-between">
          
          {/* Top Section - Title and QR */}
          <div className="flex flex-col items-center gap-6">
            {/* Title */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Share Payment QR</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Anyone can scan this QR to send you money instantly</p>
            </div>

            {/* QR Code Card - Centered */}
            <div className="flex items-center justify-center w-full">
              <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-3 shadow-lg border border-slate-200 dark:border-slate-700">
                {isLoading ? (
                  <div className="flex items-center justify-center w-60 h-60">
                    <Loader2 size={32} className="animate-spin text-brand-600" />
                  </div>
                ) : qrImageUrl ? (
                  <img 
                    src={qrImageUrl} 
                    alt="Payment QR Code" 
                    loading="lazy"
                    className="block w-60 h-60 object-contain"
                    onError={() => console.error('QR image failed to load')}
                  />
                ) : (
                  <div className="flex items-center justify-center w-60 h-60 text-slate-500 dark:text-slate-400">
                    QR Code not available
                  </div>
                )}
              </div>
            </div>

            {/* User Info */}
            <div className="w-full p-4 bg-gradient-to-br from-[#0f7a6e] via-[#0f8076] to-[#07a3c2] rounded-xl text-white">
              <p className="text-xs font-semibold text-white/70 mb-1">Receiving as</p>
              <p className="text-lg font-bold">{userName}</p>
              <p className="text-xs text-white/70 mt-1">Phone: {userPhone}</p>
            </div>

            {/* Action Buttons */}
            <div className="w-full flex gap-2">
              <button
                onClick={handleCopyQR}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors"
              >
                <Copy size={16} />
                Copy
              </button>
              <button
                onClick={handleDownloadQR}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 hover:bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition-colors"
              >
                <Download size={16} />
                Download
              </button>
            </div>
          </div>

          {/* Bottom Section - Instructions Container */}
          <div className="mt-4 space-y-2">
            <div className="flex gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900">
              <div className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white text-xs font-bold">1</div>
              <p className="text-sm text-blue-900 dark:text-blue-200"><span className="font-semibold">Share QR Code</span> with the sender</p>
            </div>
            <div className="flex gap-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-900">
              <div className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white text-xs font-bold">2</div>
              <p className="text-sm text-green-900 dark:text-green-200"><span className="font-semibold">They scan it</span> with any UPI app</p>
            </div>
            <div className="flex gap-3 p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-900">
              <div className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-purple-500 text-white text-xs font-bold">3</div>
              <p className="text-sm text-purple-900 dark:text-purple-200"><span className="font-semibold">Money received</span> instantly to your account</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

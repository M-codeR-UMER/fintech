import React, { useState, useEffect } from 'react';
import { 
  User, 
  Settings, 
  Shield, 
  Bell, 
  CreditCard, 
  HelpCircle, 
  LogOut, 
  ChevronRight,
  ChevronLeft,
  Phone,
  Mail,
  MapPin,
  Camera,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const isPlaceholderEmail = (value) => {
  const email = String(value || '').trim().toLowerCase();
  return /^[0-9a-f-]{36}@finpay\.local$/.test(email);
};

const AccountScreen = ({ user, onUserUpdate, onLogout, onBack, isDarkMode, onToggleDarkMode }) => {
  const [activeTab, setActiveTab] = useState('main'); // main, profile, security, notifications
  const [accountData, setAccountData] = useState({ tier: user?.tier || 'L1', limit: user?.tier === 'L2' ? 500000 : 50000 });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  
  useEffect(() => {
    const fetchFreshData = async () => {
      try {
        const { getBalance } = await import('../api/client');
        const data = await getBalance();
        setAccountData({ tier: data.tier, limit: data.monthly_limit });
      } catch (err) {
        console.warn('Failed to fetch fresh account data', err);
      }
    };
    fetchFreshData();
  }, []);

  // User-specific keys for persistence
  const avatarKey = `finpay.avatar_${user?.id || user?.phoneNumber || 'default'}`;
  const settingsKey = `finpay.settings_${user?.id || user?.phoneNumber || 'default'}`;

  const [avatar, setAvatar] = useState(localStorage.getItem(avatarKey) || null);
  const [toast, setToast] = useState(null);

  // Persistence for Security/Notification toggles
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem(settingsKey);
    return saved ? JSON.parse(saved) : {
      biometrics: true,
      privacyMode: false,
      pushNotifications: true,
      txAlerts: true,
      marketing: false,
      securityAlerts: true
    };
  });

  useEffect(() => {
    localStorage.setItem(settingsKey, JSON.stringify(settings));
  }, [settings, settingsKey]);

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setAvatar(base64String);
        localStorage.setItem(avatarKey, base64String);
        showToast('Profile picture updated successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  // Dynamic Tier & Limit
  const userTier = accountData.tier;
  const tierName = userTier === 'L1' ? 'Level 1 (L1)' : 'Level 2 (L2)';
  const monthlyLimitDisplay = Number(accountData.limit).toLocaleString();
  const displayFirstName = profileData.firstName?.trim() || user?.first_name || user?.firstName || 'User';
  const displayLastName = profileData.lastName?.trim() || user?.last_name || user?.lastName || '';

  const menuItems = [
    { id: 'profile', icon: Settings, label: 'Profile Settings', sub: 'Name, Email, Phone' },
    { id: 'security', icon: Shield, label: 'Security', sub: 'Biometrics, Change PIN' },
    { id: 'notifications', icon: Bell, label: 'Notifications', sub: 'Alerts, Transactions' },
    { id: 'linked', icon: CreditCard, label: 'Linked Accounts', sub: 'Bank, Cards' },
    { id: 'help', icon: HelpCircle, label: 'Help Center', sub: 'FAQs, Support' },
  ];

  const [profileData, setProfileData] = useState(() => {
    const saved = localStorage.getItem(`finpay.profile_${user?.id || user?.phoneNumber || 'default'}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        email: isPlaceholderEmail(parsed?.email) ? '' : (parsed?.email || ''),
      };
    }
    return {
      firstName: user?.first_name || user?.firstName || '',
      lastName: user?.last_name || user?.lastName || '',
      email: isPlaceholderEmail(user?.email) ? '' : (user?.email || ''),
      phone: user?.phone_number || user?.phoneNumber || ''
    };
  });

  const handleProfileUpdate = async () => {
    const firstName = profileData.firstName.trim();
    const lastName = profileData.lastName.trim();
    const email = profileData.email.trim().toLowerCase();

    if (!firstName || firstName.length < 2) {
      showToast('Please enter a valid first name');
      return;
    }

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      showToast('Please enter a valid email address');
      return;
    }

    setIsSavingProfile(true);
    try {
      const { updateUserProfile } = await import('../api/client');
      const updated = await updateUserProfile({ firstName, lastName, email });

      const nextProfileData = {
        ...profileData,
        firstName: updated.first_name || firstName,
        lastName: updated.last_name ?? lastName,
        email: updated.email || email,
        phone: updated.phone_number || profileData.phone,
      };

      setProfileData(nextProfileData);
      localStorage.setItem(`finpay.profile_${user?.id || user?.phoneNumber || 'default'}`, JSON.stringify(nextProfileData));

      const currentUserRaw = localStorage.getItem('finpay.currentUser');
      if (currentUserRaw) {
        try {
          const currentUserParsed = JSON.parse(currentUserRaw);
          const mergedUser = {
            ...currentUserParsed,
            first_name: updated.first_name || currentUserParsed.first_name,
            last_name: updated.last_name ?? currentUserParsed.last_name,
            email: updated.email || currentUserParsed.email,
            phone_number: updated.phone_number || currentUserParsed.phone_number,
            tier: updated.tier || currentUserParsed.tier,
            role: updated.role || currentUserParsed.role,
            status: updated.status || currentUserParsed.status,
            balance: updated.balance ?? currentUserParsed.balance,
          };
          localStorage.setItem('finpay.currentUser', JSON.stringify(mergedUser));
          if (onUserUpdate) {
            onUserUpdate(mergedUser);
          }
        } catch (parseError) {
          console.warn('Failed to synchronize current user after profile update', parseError);
        }
      }

      showToast('Profile updated successfully!');
      setActiveTab('main');
    } catch (err) {
      showToast(err.message || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const renderProfile = () => (
    <div className="flex flex-col gap-6 animate-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-3 px-2">
        <button onClick={() => setActiveTab('main')} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-transform active:scale-90">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-black text-slate-900 dark:text-white">Profile Settings</h1>
      </div>
      
      <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-5">
        <div className="flex flex-col items-center mb-2">
          <div className="relative">
            <div className="h-28 w-24 rounded-[32px] bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center text-brand-700 dark:text-brand-400 font-bold text-4xl overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl">
              {avatar ? (
                <img src={avatar} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                profileData.firstName?.charAt(0) || 'U'
              )}
            </div>
            <label className="absolute -bottom-2 -right-2 p-2.5 rounded-2xl bg-[#0f7a6e] text-white border-4 border-white dark:border-slate-900 cursor-pointer hover:scale-110 transition-all shadow-lg">
              <Camera size={16} />
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
            </label>
          </div>
          <p className="mt-4 text-xs font-black text-[#0f7a6e] uppercase tracking-widest">Tap to change photo</p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">First Name</label>
              <input 
                type="text"
                value={profileData.firstName}
                onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                className="mt-1 w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-slate-900 dark:text-white font-bold border border-slate-100 dark:border-slate-800 focus:ring-2 focus:ring-[#0f7a6e] outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Last Name</label>
              <input 
                type="text"
                value={profileData.lastName}
                onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                className="mt-1 w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-slate-900 dark:text-white font-bold border border-slate-100 dark:border-slate-800 focus:ring-2 focus:ring-[#0f7a6e] outline-none"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Email Identity</label>
            <div className="relative">
              <input 
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                className="mt-1 w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-slate-900 dark:text-white font-bold border border-slate-100 dark:border-slate-800 focus:ring-2 focus:ring-[#0f7a6e] outline-none"
              />
              <CheckCircle2 size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-[#0f7a6e]" />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Mobile Number</label>
            <div className="mt-1 px-5 py-4 bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl text-slate-400 dark:text-slate-500 font-bold border border-slate-100 dark:border-slate-800 flex justify-between items-center cursor-not-allowed">
              <span>{profileData.phone}</span>
              <Shield size={16} />
            </div>
          </div>
        </div>

        <button 
          onClick={handleProfileUpdate}
          disabled={isSavingProfile}
          className="mt-4 w-full bg-[#0f7a6e] text-white font-black py-5 rounded-[24px] shadow-lg shadow-[#0f7a6e]/20 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSavingProfile ? 'Saving...' : 'Save Profile Changes'}
        </button>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="flex flex-col gap-6 animate-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-3 px-2">
        <button onClick={() => setActiveTab('main')} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-transform active:scale-90">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-black text-slate-900 dark:text-white">Security Vault</h1>
      </div>
      
      <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h3 className="font-black text-slate-900 dark:text-white">Biometric Access</h3>
            <p className="text-xs font-medium text-slate-500 mt-0.5">Use FaceID or Fingerprint</p>
          </div>
          <div 
            onClick={() => toggleSetting('biometrics')}
            className={`w-12 h-6 ${settings.biometrics ? 'bg-[#0f7a6e]' : 'bg-slate-200 dark:bg-slate-700'} rounded-full relative cursor-pointer transition-colors`}
          >
             <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${settings.biometrics ? 'right-1' : 'left-1'}`}></div>
          </div>
        </div>
        
        <button 
          onClick={() => showToast('Redirecting to PIN setup...')}
          className="w-full p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left transition-colors"
        >
          <div>
            <h3 className="font-black text-slate-900 dark:text-white">Update Security PIN</h3>
            <p className="text-xs font-medium text-slate-500 mt-0.5">Change your 4-digit transaction PIN</p>
          </div>
          <ChevronRight size={18} className="text-slate-300" />
        </button>

        <div className="p-6 flex justify-between items-center">
          <div>
            <h3 className="font-black text-slate-900 dark:text-white">Privacy Mode</h3>
            <p className="text-xs font-medium text-slate-500 mt-0.5">Hide balance from dashboard</p>
          </div>
          <div 
            onClick={() => toggleSetting('privacyMode')}
            className={`w-12 h-6 ${settings.privacyMode ? 'bg-[#0f7a6e]' : 'bg-slate-200 dark:bg-slate-700'} rounded-full relative cursor-pointer transition-colors`}
          >
             <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${settings.privacyMode ? 'right-1' : 'left-1'}`}></div>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/10 p-5 rounded-[24px] border border-amber-100 dark:border-amber-900/30 flex items-start gap-4">
        <div className="p-2 bg-white dark:bg-amber-900/20 rounded-xl">
          <AlertCircle size={20} className="text-amber-600 dark:text-amber-400" />
        </div>
        <p className="text-sm text-amber-800 dark:text-amber-200 font-bold leading-relaxed">
          Ensure your recovery email is verified before changing security settings for maximum protection.
        </p>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="flex flex-col gap-6 animate-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-3 px-2">
        <button onClick={() => setActiveTab('main')} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-transform active:scale-90">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-black text-slate-900 dark:text-white">Notifications</h1>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        {[
          { key: 'pushNotifications', label: 'Push Notifications', sub: 'Real-time device alerts' },
          { key: 'txAlerts', label: 'Transaction Alerts', sub: 'SMS and Email confirmations' },
          { key: 'marketing', label: 'Marketing Offers', sub: 'Discounts and news' },
          { key: 'securityAlerts', label: 'Security Alerts', sub: 'New login attempts' },
        ].map((item, idx) => (
          <div key={idx} className={`p-6 flex justify-between items-center ${idx !== 3 ? 'border-b border-slate-100 dark:border-slate-800' : ''}`}>
            <div>
              <h3 className="font-black text-slate-900 dark:text-white">{item.label}</h3>
              <p className="text-xs font-medium text-slate-500 mt-0.5">{item.sub}</p>
            </div>
            <div 
              onClick={() => toggleSetting(item.key)}
              className={`w-12 h-6 ${settings[item.key] ? 'bg-[#0f7a6e]' : 'bg-slate-200 dark:bg-slate-700'} rounded-full relative cursor-pointer transition-colors`}
            >
               <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${settings[item.key] ? 'right-1' : 'left-1'}`}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMain = () => (
    <div className="flex flex-col gap-6 animate-in slide-in-from-left-4 duration-300">
      {/* Profile Card with Dashboard Gradient */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#0f7a6e] via-[#0f8076] to-[#07a3c2] p-8 shadow-xl text-white">
        <div className="absolute -right-8 -top-7 h-40 w-40 rounded-full bg-white/10" aria-hidden="true" />
        <div className="absolute right-4 top-14 h-24 w-24 rounded-full bg-white/5" aria-hidden="true" />
        
        <div className="relative flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-24 w-24 rounded-[32px] bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-bold text-4xl border-4 border-white/30 shadow-2xl overflow-hidden">
              {avatar ? (
                <img src={avatar} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                displayFirstName.charAt(0) || 'U'
              )}
            </div>
            <label className="absolute -bottom-2 -right-2 p-2 rounded-full bg-[#0f7a6e] text-white border-4 border-white cursor-pointer hover:scale-110 transition-transform shadow-lg">
              <Camera size={16} />
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
            </label>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-black tracking-tight">{displayFirstName} {displayLastName}</h2>
            <p className="text-white/80 text-xs font-bold flex items-center justify-center gap-1 mt-1 uppercase tracking-widest">
              <Phone size={12} strokeWidth={3} /> {user?.phone_number || user?.phoneNumber}
            </p>
          </div>
        </div>
        
        <div className="mt-8 grid grid-cols-2 gap-4 relative">
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <p className="text-[10px] uppercase tracking-[0.2em] font-black text-white/60">Account Tier</p>
            <p className="text-base font-bold mt-1">{tierName}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <p className="text-[10px] uppercase tracking-[0.2em] font-black text-white/60">Monthly Limit</p>
            <p className="text-base font-bold mt-1">Rs. {monthlyLimitDisplay}</p>
          </div>
        </div>
      </div>

      {/* Preferences List with Matching Green Icons */}
      <div className="flex flex-col gap-3">
        <p className="px-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Terminal Preferences</p>
        <div className="rounded-[32px] bg-white dark:bg-slate-900 overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm">
          {menuItems.map((item, idx) => (
            <button 
              key={idx}
              onClick={() => {
                if (['linked', 'help'].includes(item.id)) {
                  showToast(`${item.label} is coming soon!`);
                } else {
                  setActiveTab(item.id);
                }
              }}
              className={`w-full flex items-center gap-4 px-6 py-5 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 group ${
                idx !== menuItems.length - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''
              }`}
            >
              <div className="p-3 rounded-2xl bg-[#0f7a6e]/10 text-[#0f7a6e] group-hover:bg-[#0f7a6e] group-hover:text-white transition-colors">
                <item.icon size={22} strokeWidth={2.5} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-black text-slate-900 dark:text-white">{item.label}</p>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{item.sub}</p>
              </div>
              <ChevronRight size={18} className="text-slate-300 group-hover:text-[#0f7a6e] transition-colors" />
            </button>
          ))}
        </div>
      </div>

      <button 
        onClick={onLogout}
        className="mt-2 flex items-center justify-center gap-3 w-full py-5 rounded-[24px] bg-red-50 text-red-600 font-black dark:bg-red-950/20 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/40 transition-all active:scale-95 shadow-sm border border-red-100 dark:border-red-900/30"
      >
        <LogOut size={20} />
        Log Out Securely
      </button>

      <p className="text-center text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 mb-8 uppercase">
        FinPay Secure Terminal • v2.4.0
      </p>
    </div>
  );

  return (
    <>
      {activeTab === 'profile' && renderProfile()}
      {activeTab === 'security' && renderSecurity()}
      {activeTab === 'notifications' && renderNotifications()}
      {activeTab === 'main' && renderMain()}

      {/* Global Toast for Account Screen */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] bg-slate-900 border border-slate-700 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-4">
          <CheckCircle2 size={18} className="text-[#0f7a6e]" />
          <span className="text-sm font-bold">{toast}</span>
        </div>
      )}
    </>
  );
};

export default AccountScreen;

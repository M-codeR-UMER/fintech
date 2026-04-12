import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, Image, Switch, Alert, Platform } from 'react-native';
import { 
  Settings, 
  Shield, 
  Bell, 
  CreditCard, 
  HelpCircle, 
  LogOut, 
  ChevronRight, 
  ChevronLeft,
  Camera,
  Phone,
  CheckCircle2,
  AlertCircle
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBalance } from '../api/client';

const AccountScreen = ({ user, onLogout, isDarkMode, onToggleDarkMode }) => {
  const [activeTab, setActiveTab] = useState('main');
  const avatarKey = `finpay.avatar_${user?.id || user?.phoneNumber || 'default'}`;
  const settingsKey = `finpay.settings_${user?.id || user?.phoneNumber || 'default'}`;

  const [avatar, setAvatar] = useState(null);
  const [accountInfo, setAccountInfo] = useState({ tier: user?.tier || 'L1', limit: user?.tier === 'L2' ? 500000 : 50000 });
  const [settings, setSettings] = useState({
    biometrics: true,
    privacyMode: false,
    pushNotifications: true,
    txAlerts: true,
    marketing: false,
    securityAlerts: true
  });

  useEffect(() => {
    (async () => {
      // Load Avatar
      const savedAvatar = await AsyncStorage.getItem(avatarKey);
      if (savedAvatar) setAvatar(savedAvatar);
      
      // Load Settings
      const savedSettings = await AsyncStorage.getItem(settingsKey);
      if (savedSettings) setSettings(JSON.parse(savedSettings));

      // Load Balance/Tier
      try {
        const balanceData = await getBalance();
        setAccountInfo({
          tier: balanceData.tier,
          limit: balanceData.monthly_limit
        });
      } catch (err) {
        console.warn('Failed to load balance info in account screen', err);
      }
    })();
  }, [user, avatarKey, settingsKey]);

  const toggleSetting = async (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    await AsyncStorage.setItem(settingsKey, JSON.stringify(newSettings));
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setAvatar(uri);
      await AsyncStorage.setItem(avatarKey, uri);
    }
  };

  const menuItems = [
    { id: 'profile', icon: Settings, label: 'Profile Settings', sub: 'Name, Email, Phone' },
    { id: 'security', icon: Shield, label: 'Security Vault', sub: 'Biometrics, PIN' },
    { id: 'notifications', icon: Bell, label: 'Notifications', sub: 'Alerts, Offers' },
    { id: 'linked', icon: CreditCard, label: 'Linked Accounts', sub: 'Bank, Cards' },
    { id: 'help', icon: HelpCircle, label: 'Help Center', sub: 'FAQs, Support' },
  ];

  const renderMain = () => (
    <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
      {/* Profile Card with Web Gradient Equivalent */}
      <View className="bg-brand-700 rounded-[40px] p-8 shadow-xl shadow-brand-700/30 overflow-hidden relative">
        <View className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
        
        <View className="items-center">
          <View className="relative">
            <View className="h-28 w-24 rounded-[32px] bg-white/20 items-center justify-center border-4 border-white/30 overflow-hidden shadow-2xl">
              {avatar ? (
                <Image source={{ uri: avatar }} className="h-full w-full object-cover" />
              ) : (
                <Text className="text-white font-black text-4xl">{user?.first_name?.charAt(0) || user?.firstName?.charAt(0) || 'U'}</Text>
              )}
            </View>
            <TouchableOpacity 
              onPress={pickImage}
              className="absolute -bottom-2 -right-2 p-2.5 rounded-2xl bg-[#0f7a6e] border-4 border-white shadow-lg"
            >
              <Camera size={16} color="white" />
            </TouchableOpacity>
          </View>
          <Text className="text-white text-2xl font-black mt-4">{user?.first_name || user?.firstName} {user?.last_name || user?.lastName || ''}</Text>
          <Text className="text-white/70 text-xs font-bold uppercase tracking-widest mt-1">
            {accountInfo.tier === 'L1' ? 'Level 1' : 'Level 2'} Verified
          </Text>
        </View>

        <View className="flex-row gap-4 mt-8">
          <View className="flex-1 bg-white/10 p-4 rounded-2xl border border-white/10">
            <Text className="text-[9px] font-black text-white/50 uppercase tracking-widest">Account Tier</Text>
            <Text className="text-white font-bold text-sm mt-1">{accountInfo.tier === 'L1' ? 'L1' : 'L2'} Member</Text>
          </View>
          <View className="flex-1 bg-white/10 p-4 rounded-2xl border border-white/10">
            <Text className="text-[9px] font-black text-white/50 uppercase tracking-widest">Monthly Limit</Text>
            <Text className="text-white font-bold text-sm mt-1">Rs. {Number(accountInfo.limit).toLocaleString()}</Text>
          </View>
        </View>
      </View>

      {/* Preferences */}
      <View className="mt-8 mb-20">
        <Text className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4 ml-2">Terminal Preferences</Text>
        <View className="bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm">
          {menuItems.map((item, idx) => (
            <TouchableOpacity 
              key={idx}
              onPress={() => {
                if (['linked', 'help'].includes(item.id)) {
                  Alert.alert('Coming Soon', `${item.label} is currently being provisioned for your account.`);
                } else {
                  setActiveTab(item.id);
                }
              }}
              className={`flex-row items-center gap-4 p-5 ${idx !== menuItems.length - 1 ? 'border-b border-slate-50 dark:border-slate-800' : ''}`}
            >
              <View className="p-3 rounded-2xl bg-[#0f7a6e]/10">
                <item.icon size={20} color="#0f7a6e" />
              </View>
              <View className="flex-1">
                <Text className="text-slate-900 dark:text-white font-black text-sm">{item.label}</Text>
                <Text className="text-slate-400 text-[10px] font-medium mt-0.5">{item.sub}</Text>
              </View>
              <ChevronRight size={16} color="#cbd5e1" />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          onPress={onLogout}
          className="mt-6 bg-red-50 dark:bg-red-900/10 p-5 rounded-[24px] flex-row items-center justify-center border border-red-100 dark:border-red-900/20"
        >
          <LogOut size={20} color="#ef4444" />
          <Text className="text-red-500 font-black ml-2 text-sm uppercase tracking-widest">Secure Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderProfile = () => (
    <View className="flex-1 px-6 py-4 animate-in slide-in-from-right">
      <View className="flex-row items-center gap-4 mb-8">
        <TouchableOpacity onPress={() => setActiveTab('main')} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800">
          <ChevronLeft size={20} color="#64748b" />
        </TouchableOpacity>
        <Text className="text-xl font-black text-slate-900 dark:text-white">Profile Details</Text>
      </View>
      <View className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm">
        <View className="space-y-6">
          <View>
            <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Verified Name</Text>
            <View className="mt-1 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
              <Text className="text-slate-900 dark:text-white font-bold text-sm">
                {user?.first_name || user?.firstName} {user?.last_name || user?.lastName || ''}
              </Text>
            </View>
          </View>
          <View>
            <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Linked Mobile</Text>
            <View className="mt-1 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex-row justify-between items-center">
              <Text className="text-slate-900 dark:text-white font-bold text-sm">{user?.phone_number || user?.phoneNumber}</Text>
              <CheckCircle2 size={16} color="#0f7a6e" />
            </View>
          </View>
          <View>
            <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Email Identity</Text>
            <View className="mt-1 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex-row justify-between items-center">
              <Text className="text-slate-900 dark:text-white font-bold text-sm">{user?.email || 'N/A'}</Text>
              <CheckCircle2 size={16} color="#0f7a6e" />
            </View>
          </View>
        </View>
        <TouchableOpacity 
          onPress={() => Alert.alert('Success', 'Profile changes synchronized.')}
          className="mt-10 bg-[#0f7a6e] p-5 rounded-[24px] items-center shadow-lg shadow-[#0f7a6e]/20"
        >
          <Text className="text-white font-black uppercase tracking-widest text-xs">Save Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSecurity = () => (
    <View className="flex-1 px-6 py-4 animate-in slide-in-from-right">
      <View className="flex-row items-center gap-4 mb-8">
        <TouchableOpacity onPress={() => setActiveTab('main')} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800">
          <ChevronLeft size={20} color="#64748b" />
        </TouchableOpacity>
        <Text className="text-xl font-black text-slate-900 dark:text-white">Security Vault</Text>
      </View>
      <View className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        {[
          { key: 'biometrics', label: 'Biometric Access', sub: 'Use FaceID or Fingerprint' },
          { key: 'privacyMode', label: 'Privacy Mode', sub: 'Hide balance on startup' }
        ].map((item, idx) => (
          <View key={idx} className={`p-6 flex-row justify-between items-center ${idx === 0 ? 'border-b border-slate-50 dark:border-slate-800' : ''}`}>
            <View className="flex-1">
              <Text className="font-black text-slate-900 dark:text-white text-sm">{item.label}</Text>
              <Text className="text-slate-400 text-[10px] font-medium mt-0.5">{item.sub}</Text>
            </View>
            <Switch 
              value={settings[item.key]} 
              onValueChange={() => toggleSetting(item.key)}
              trackColor={{ false: '#cbd5e1', true: '#0f7a6e' }}
            />
          </View>
        ))}
      </View>
      <View className="mt-6 bg-amber-50 dark:bg-amber-900/10 p-5 rounded-[24px] border border-amber-100 dark:border-amber-900/20 flex-row gap-4">
        <AlertCircle size={20} color="#d97706" />
        <Text className="flex-1 text-[10px] font-bold text-amber-800 dark:text-amber-200 leading-relaxed">
          Sensitive operations require biometric re-authentication for maximum protection.
        </Text>
      </View>
    </View>
  );

  const renderNotifications = () => (
    <View className="flex-1 px-6 py-4 animate-in slide-in-from-right">
      <View className="flex-row items-center gap-4 mb-8">
        <TouchableOpacity onPress={() => setActiveTab('main')} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800">
          <ChevronLeft size={20} color="#64748b" />
        </TouchableOpacity>
        <Text className="text-xl font-black text-slate-900 dark:text-white">Notifications</Text>
      </View>
      <View className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        {[
          { key: 'pushNotifications', label: 'Push Notifications', sub: 'Real-time device alerts' },
          { key: 'txAlerts', label: 'Transaction Alerts', sub: 'SMS confirmations' },
          { key: 'marketing', label: 'Marketing Offers', sub: 'Discounts and news' },
          { key: 'securityAlerts', label: 'Security Alerts', sub: 'Login attempts' }
        ].map((item, idx) => (
          <View key={idx} className={`p-6 flex-row justify-between items-center ${idx !== 3 ? 'border-b border-slate-50 dark:border-slate-800' : ''}`}>
            <View className="flex-1">
              <Text className="font-black text-slate-900 dark:text-white text-sm">{item.label}</Text>
              <Text className="text-slate-400 text-[10px] font-medium mt-0.5">{item.sub}</Text>
            </View>
            <Switch 
              value={settings[item.key]} 
              onValueChange={() => toggleSetting(item.key)}
              trackColor={{ false: '#cbd5e1', true: '#0f7a6e' }}
            />
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      {activeTab === 'main' && renderMain()}
      {activeTab === 'profile' && renderProfile()}
      {activeTab === 'security' && renderSecurity()}
      {activeTab === 'notifications' && renderNotifications()}
    </SafeAreaView>
  );
};

export default AccountScreen;

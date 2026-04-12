import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, RefreshControl, Modal, Pressable } from 'react-native';
import { Bell, Eye, Plus, Send, MoreHorizontal, CreditCard, BarChart3, FileText, HelpCircle, RefreshCcw, LogOut, Settings, CheckCircle2, Wallet } from 'lucide-react-native';
import { getBalance, getTransactions } from '../api/client';
import TopUpModal from '../components/TopUpModal';

const Dashboard = ({ user }) => {
  const [balance, setBalance] = useState(0);
  const [accountInfo, setAccountInfo] = useState({ tier: user?.tier || 'L1' });
  const [transactions, setTransactions] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const menuItems = [
    { icon: CreditCard, label: 'Linked Banks', action: () => showToast('Linked Banks feature is under development') },
    { icon: BarChart3, label: 'Account Limits', action: () => showToast('Account Limits feature is under development') },
    { icon: FileText, label: 'Statements', action: () => showToast('Statements feature is under development') },
    { icon: HelpCircle, label: 'Help & Support', action: () => showToast('Support feature is under development') },
  ];

  const fetchData = async () => {
    try {
      const balanceData = await getBalance();
      const txData = await getTransactions({ limit: 5 });
      setBalance(balanceData.balance);
      setAccountInfo({ tier: balanceData.tier });
      setTransactions(txData);
    } catch (error) {
      console.error('Data fetch error:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <ScrollView 
        className="flex-1 px-4 py-4" 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      >
        {/* Branded Header */}
        <View className="flex-row items-center justify-between mt-2 mb-6">
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 bg-brand-700 rounded-xl items-center justify-center shadow-lg shadow-brand-700/20">
              <Text className="text-white font-black text-lg">F</Text>
            </View>
            <Text className="text-slate-900 dark:text-white text-xl font-black tracking-tight">FinPay</Text>
          </View>
          
          <View className="flex-row items-center gap-3">
            <TouchableOpacity 
              onPress={() => setIsMenuOpen(true)}
              className="p-2.5 bg-white dark:bg-slate-900 rounded-full shadow-sm border border-slate-100 dark:border-slate-800"
            >
              <Settings size={20} color="#64748b" />
            </TouchableOpacity>
            <TouchableOpacity className="h-10 w-10 bg-brand-100 dark:bg-brand-900/40 rounded-full items-center justify-center border-2 border-white dark:border-slate-800 shadow-sm">
              <Text className="text-brand-700 dark:text-brand-400 font-bold">
                {(user?.first_name || user?.firstName || 'A').charAt(0).toUpperCase()}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Welcome Text */}
        <View className="mb-4 mt-6">
          <Text className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-widest">Available Balance</Text>
          <Text className="text-slate-900 dark:text-white text-3xl font-black mt-1">Hello, {user?.first_name || user?.firstName || 'Alber'}</Text>
        </View>

        {/* Balance Card */}
        <View className="mt-8 bg-brand-700 rounded-[32px] p-6 shadow-xl shadow-brand-700/30 overflow-hidden relative">
          <View className="flex-row items-center justify-between">
            <Text className="text-white/80 text-sm font-bold uppercase tracking-wider">Total Balance</Text>
            <TouchableOpacity>
              <Eye size={18} color="white" />
            </TouchableOpacity>
          </View>
          <Text className="text-white text-4xl font-extrabold mt-2">Rs. {formatCurrency(balance)}</Text>
          
          <View className="flex-row items-center gap-2 mt-4 bg-white/10 self-start px-3 py-1.5 rounded-full">
            <Text className="text-white text-[11px] font-bold">Updated just now</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="mt-8 flex-row justify-between">
          <TouchableOpacity onPress={() => setIsTopUpOpen(true)} className="items-center gap-2">
            <View className="h-14 w-14 rounded-2xl bg-white dark:bg-slate-900 items-center justify-center shadow-sm border border-slate-100">
              <Plus size={22} color="#0369a1" />
            </View>
            <Text className="text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase tracking-tighter">Top Up</Text>
          </TouchableOpacity>
          {[
            { label: 'Send', icon: Send, color: '#0369a1' },
            { label: 'Receive', icon: Plus, color: '#0891b2' },
            { label: 'History', icon: MoreHorizontal, color: '#0f172a' },
          ].map((action, idx) => (
            <TouchableOpacity key={idx} className="items-center gap-2">
              <View className="h-14 w-14 rounded-2xl bg-white dark:bg-slate-900 items-center justify-center shadow-sm border border-slate-50">
                <action.icon size={22} color={action.color} />
              </View>
              <Text className="text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase tracking-tighter">{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Transactions */}
        <View className="mt-10 mb-20">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-slate-900 dark:text-white text-lg font-extrabold">Recent Transactions</Text>
            <TouchableOpacity>
              <Text className="text-brand-700 font-bold text-sm">See All</Text>
            </TouchableOpacity>
          </View>

          {transactions.map((tx, idx) => (
            <View key={tx.id || idx} className="flex-row items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-3xl mb-3 shadow-sm border border-slate-50 dark:border-slate-800">
              <View className="flex-row items-center gap-3">
                <View className="h-12 w-12 rounded-2xl bg-slate-50 dark:bg-slate-800 items-center justify-center">
                  <Text className="text-slate-900 dark:text-white font-bold">{tx.counterpartyName?.charAt(0) || '?'}</Text>
                </View>
                <View>
                  <Text className="text-slate-900 dark:text-white font-bold text-sm">{tx.counterpartyName}</Text>
                  <Text className="text-slate-400 text-[10px]">{tx.date}</Text>
                </View>
              </View>
              <Text className={`font-black text-sm ${tx.type === 'send' ? 'text-red-500' : 'text-green-500'}`}>
                {tx.type === 'send' ? '-' : '+'} Rs. {formatCurrency(tx.amount)}
              </Text>
            </View>
          ))}
          {transactions.length === 0 && (
            <View className="py-10 items-center justify-center bg-white dark:bg-slate-900 rounded-[32px] border border-dashed border-slate-200 dark:border-slate-800">
              <Text className="text-center text-slate-400 font-black uppercase tracking-widest text-[10px]">No transactions, make transaction first!</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <TopUpModal 
        isOpen={isTopUpOpen} 
        onClose={() => setIsTopUpOpen(false)} 
        onSuccess={fetchData} 
      />

      {/* Dropdown Menu Modal */}
      <Modal
        visible={isMenuOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsMenuOpen(false)}
      >
        <Pressable 
          className="flex-1 bg-slate-950/20" 
          onPress={() => setIsMenuOpen(false)}
        >
          <View className="absolute top-16 right-6 w-64 bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
            <View className="bg-brand-700 p-6">
              <Text className="text-white font-black text-lg">{user?.first_name || user?.firstName} {user?.last_name || user?.lastName || ''}</Text>
              <Text className="text-white/70 text-[10px] font-bold uppercase tracking-widest mt-1">
                {accountInfo.tier === 'L1' ? 'Level 1' : 'Level 2'} Verified
              </Text>
            </View>
            <View className="p-2">
              {menuItems.map((item, idx) => (
                <TouchableOpacity 
                  key={idx}
                  onPress={() => {
                    item.action();
                    setIsMenuOpen(false);
                  }}
                  className="flex-row items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl"
                >
                  <item.icon size={20} color="#0369a1" />
                  <Text className="text-slate-700 dark:text-slate-300 font-bold text-sm">{item.label}</Text>
                </TouchableOpacity>
              ))}
              <View className="h-[1px] bg-slate-100 dark:bg-slate-800 my-2 mx-4" />
              <TouchableOpacity className="flex-row items-center gap-4 p-4 rounded-2xl">
                <LogOut size={20} color="#ef4444" />
                <Text className="text-red-500 font-bold text-sm">Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Under Development Toast */}
      {toast && (
        <View className="absolute bottom-24 left-6 right-6 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-2xl flex-row items-center gap-3">
          <CheckCircle2 size={20} color="#0ea5e9" />
          <Text className="text-white text-xs font-bold flex-1">{toast}</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default Dashboard;

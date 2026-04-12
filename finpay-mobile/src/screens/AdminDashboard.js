import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { ShieldAlert, Users, Activity, LogOut, Search, User, UserCheck, ChevronRight } from 'lucide-react-native';
import { client } from '../api/client';

export default function AdminDashboard({ onLogout }) {
  const [stats, setStats] = useState({ total_users: 0, total_transactions: 0, total_volume: 0 });
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const statsRes = await client.get('/admin/stats');
        const usersRes = await client.get('/admin/users');
        setStats(statsRes.data);
        setUsers(usersRes.data);
      } catch (err) {
        console.error('Admin fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (isLoading) {
    return (
      <View className="flex-1 bg-slate-950 items-center justify-center">
        <ActivityIndicator color="white" />
        <Text className="text-white font-bold uppercase tracking-widest text-[10px] mt-4">Initializing Terminal...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
        
        {/* Branded Header (Matches User Dashboard) */}
        <View className="flex-row items-center justify-between mt-2 mb-6">
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 bg-brand-700 rounded-xl items-center justify-center shadow-lg shadow-brand-700/20">
              <Text className="text-white font-black text-lg">F</Text>
            </View>
            <Text className="text-slate-900 dark:text-white text-xl font-black tracking-tight">FinPay</Text>
          </View>
          
          <View className="flex-row items-center gap-3">
            <TouchableOpacity 
              onPress={onLogout}
              className="p-2.5 bg-red-50 dark:bg-red-900/20 rounded-full border border-red-100 dark:border-red-800 shadow-sm"
            >
              <LogOut size={20} color="#ef4444" />
            </TouchableOpacity>
            <View className="h-10 w-10 bg-red-600 rounded-full items-center justify-center border-2 border-white dark:border-slate-800 shadow-sm">
              <ShieldAlert size={18} color="white" />
            </View>
          </View>
        </View>

        {/* Hero Welcome */}
        <View className="mb-6">
          <Text className="text-red-500 dark:text-red-400 text-[10px] font-black uppercase tracking-[0.2em]">Authorized Personnel Only</Text>
          <Text className="text-slate-900 dark:text-white text-3xl font-black mt-1">Super Terminal</Text>
        </View>

        {/* Signature Metrics Card (Matches Home Balance Card) */}
        <View className="bg-brand-700 rounded-[40px] p-8 shadow-xl shadow-brand-700/30 overflow-hidden relative mb-8">
          {/* Decorative background shape */}
          <View className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
          
          <View className="relative">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-white/80 text-[10px] font-black uppercase tracking-[0.2em]">System Total Volume</Text>
              <View className="bg-white/20 p-1.5 rounded-lg">
                <Activity size={14} color="white" />
              </View>
            </View>
            <Text className="text-white text-4xl font-black tracking-tight">Rs. {stats.total_volume.toLocaleString()}</Text>
            
            <View className="flex-row gap-4 mt-10">
              <View className="flex-1 bg-white/10 p-4 rounded-2xl border border-white/10">
                <Text className="text-white/60 text-[9px] font-black uppercase tracking-widest mb-1">Active Users</Text>
                <Text className="text-white font-bold text-xl">{stats.total_users}</Text>
              </View>
              <View className="flex-1 bg-white/10 p-4 rounded-2xl border border-white/10">
                <Text className="text-white/60 text-[9px] font-black uppercase tracking-widest mb-1">Operations</Text>
                <Text className="text-white font-bold text-xl">{stats.total_transactions}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* User Registry List */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center gap-2">
            <UserCheck size={16} color="#0f7a6e" />
            <Text className="text-slate-900 dark:text-white text-[11px] font-black uppercase tracking-[0.2em]">Master Registry</Text>
          </View>
          <Text className="text-[10px] font-bold text-slate-400">{users.length} Records Found</Text>
        </View>

        <View className="mb-20">
          {users.map((u) => (
            <TouchableOpacity 
              key={u.id} 
              className="flex-row items-center justify-between bg-white dark:bg-slate-900 p-5 rounded-[28px] shadow-sm border border-slate-50 dark:border-slate-800 mb-3"
            >
              <View className="flex-row items-center gap-4">
                <View className={`h-14 w-12 rounded-[20px] items-center justify-center ${
                  u.role === 'admin' 
                    ? 'bg-red-100 dark:bg-red-900/30' 
                    : 'bg-brand-50 dark:bg-brand-900/40'
                }`}>
                  <Text className={`font-black text-lg ${u.role === 'admin' ? 'text-red-600' : 'text-brand-700 dark:text-brand-400'}`}>
                    {u.first_name.charAt(0)}
                  </Text>
                </View>
                <View>
                  <Text className="text-slate-900 dark:text-white font-black text-sm">{u.first_name}</Text>
                  <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-tighter mt-0.5">{u.phone_number}</Text>
                </View>
              </View>
              <View className="items-end">
                <Text className="text-slate-900 dark:text-white font-black text-base">Rs. {u.balance.toLocaleString()}</Text>
                <View className={`mt-1 px-2.5 py-0.5 rounded-full ${
                  u.role === 'admin' 
                    ? 'bg-red-50 border border-red-100' 
                    : 'bg-emerald-50 border border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800'
                }`}>
                  <Text className={`text-[8px] font-black uppercase tracking-[0.1em] ${u.role === 'admin' ? 'text-red-500' : 'text-emerald-600'}`}>
                    {u.role === 'admin' ? 'Root Admin' : `${u.tier} Member`}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Terminal Version Footer */}
        <View className="py-10 border-t border-slate-100 dark:border-slate-800 items-center">
          <Text className="text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.3em] text-center">
            FinPay Administrative Console{"\n"}Secure Node 01
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

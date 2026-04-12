import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';

export default function VirtualCard({ userFirstName }) {
  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950 items-center justify-center">
      <View className="bg-brand-700 w-80 h-48 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        {/* Decorative circle */}
        <View className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10" />
        
        <View className="flex-1 justify-between">
          <View className="flex-row justify-between items-start">
            <Text className="text-white font-black text-xl italic">FinPay</Text>
            <View className="h-8 w-12 bg-white/20 rounded-md" />
          </View>
          
          <View>
            <Text className="text-white text-lg tracking-[0.2em] font-bold">**** **** **** 4582</Text>
            <View className="flex-row justify-between items-end mt-4">
              <Text className="text-white/80 text-[10px] font-black uppercase tracking-widest">{userFirstName || 'User'}</Text>
              <Text className="text-white/80 text-[10px] font-black uppercase tracking-widest">12/28</Text>
            </View>
          </View>
        </View>
      </View>
      <Text className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-8">Your Virtual Terminal Card</Text>
    </SafeAreaView>
  );
}

import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, ActivityIndicator, Alert, Pressable } from 'react-native';
import { Landmark, CreditCard, Wallet, ChevronRight, X, PlusCircle, CheckCircle2 } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
import { createTopUp } from '../api/client';

const FUNDING_SOURCES = [
  { id: 'meezan', name: 'Meezan Bank', icon: Landmark },
  { id: 'hbl', name: 'Habib Bank (HBL)', icon: Landmark },
  { id: 'sadapay', name: 'SadaPay', icon: CreditCard },
  { id: 'nayapay', name: 'NayaPay', icon: CreditCard },
  { id: 'jazzcash', name: 'JazzCash', icon: Wallet },
  { id: 'easypaisa', name: 'EasyPaisa', icon: Wallet },
];

export default function TopUpModal({ isOpen, onClose, onSuccess }) {
  const [selectedSource, setSelectedSource] = useState(FUNDING_SOURCES[0].name);
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Form, 2: Success

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setAccountNumber('');
      setAmount('');
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleTopUp = async () => {
    if (!accountNumber || accountNumber.length < 4) {
      Alert.alert('Error', 'Please enter a valid source account number');
      return;
    }
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    try {
      await createTopUp({
        source: selectedSource,
        accountNumber,
        amount: parseFloat(amount)
      });
      if (onSuccess) await onSuccess();
      setStep(2);
      setTimeout(() => onClose(), 2000);
    } catch (error) {
      Alert.alert('Top Up Failed', error.toString());
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} transparent animationType="slide">
      <View className="flex-1 bg-slate-950/50 justify-end">
        <View className="bg-white dark:bg-slate-900 rounded-t-[40px] p-8 h-[85%]">
          <View className="flex-row justify-between items-center mb-8">
            <Text className="text-2xl font-black text-slate-900 dark:text-white">Load Wallet</Text>
            <TouchableOpacity onPress={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
              <X size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          {step === 1 ? (
            <View className="flex-1">
              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Funding Source</Text>
              <View className="bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 mb-6 overflow-hidden">
                <Picker
                  selectedValue={selectedSource}
                  onValueChange={(itemValue) => setSelectedSource(itemValue)}
                  style={{ color: '#0f172a' }}
                >
                  {FUNDING_SOURCES.map(s => (
                    <Picker.Item key={s.id} label={s.name} value={s.name} />
                  ))}
                </Picker>
              </View>

              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Account Number</Text>
              <TextInput
                value={accountNumber}
                onChangeText={setAccountNumber}
                placeholder="XXXX-XXXX-XXXX"
                placeholderTextColor="#94a3b8"
                className="bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 font-bold text-slate-900 dark:text-white mb-6"
              />

              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Amount (PKR)</Text>
              <View className="flex-row items-center bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 mb-8">
                <Text className="text-2xl font-black text-slate-400 mr-2">Rs.</Text>
                <TextInput
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                  placeholder="0.00"
                  placeholderTextColor="#94a3b8"
                  className="flex-1 text-3xl font-black text-slate-900 dark:text-white"
                />
              </View>

              <TouchableOpacity 
                onPress={handleTopUp}
                disabled={isLoading}
                className="mt-auto bg-brand-700 p-5 rounded-[24px] flex-row justify-center items-center gap-3 shadow-lg shadow-brand-700/30"
              >
                {isLoading ? <ActivityIndicator color="white" /> : <PlusCircle size={24} color="white" />}
                <Text className="text-white font-black text-lg">Refill Wallet</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="flex-1 items-center justify-center">
              <View className="bg-emerald-100 dark:bg-emerald-900/30 p-10 rounded-[40px] mb-6">
                <CheckCircle2 size={80} color="#10b981" />
              </View>
              <Text className="text-3xl font-black text-slate-900 dark:text-white">Refilled!</Text>
              <Text className="text-slate-500 font-bold text-center mt-2 px-10">
                Successfully added Rs. {amount} to your FinPay wallet.
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

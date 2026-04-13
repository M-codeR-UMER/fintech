import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, ScrollView, Modal, Pressable } from 'react-native';
import { LogIn, UserPlus, ShieldCheck, KeyRound, User, Phone, Mail, CircleHelp, X } from 'lucide-react-native';
import axios from 'axios';
import { API_BASE_URL } from '../api/client';

export default function Auth({ onAuthSuccess }) {
  const [mode, setMode] = useState('login');
  const [role, setRole] = useState('user'); // user, admin
  const [firstName, setFirstName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const is_admin = role === 'admin';
      const url = is_admin ? `${API_BASE_URL}/admin/login` : `${API_BASE_URL}/user/login`;
      const payload = is_admin 
        ? { email: email.trim(), password: password.trim() }
        : { phoneNumber: phoneNumber.trim(), password: password.trim(), role: role };

      const response = await axios.post(url, payload);
      
      if (!is_admin) {
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        Alert.alert('FinPay Security', `Your App OTP is: ${otp}`, [
          {
            text: 'Authorize',
            onPress: () => onAuthSuccess(response.data)
          }
        ]);
      } else {
        onAuthSuccess(response.data);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Invalid credentials';
      if (err.response?.status === 403 && errorMsg.includes('restricted by admin')) {
        Alert.alert(
          "RESTRICTED ACCESS",
          "Your account is restricted by admin. Please contact terminal support.",
          [{ text: "OK" }]
        );
      } else if (err.response?.status === 404) {
        Alert.alert('Not Found', 'Account not found. Switching to registration...', [
          { text: 'OK', onPress: () => { setMode('register'); } }
        ]);
      } else {
        Alert.alert('Access Denied', errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (role === 'admin') {
      Alert.alert('Access Restricted', 'Admin registration is currently disabled.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/user/register`, { 
        firstName: firstName.trim(),
        phoneNumber: phoneNumber.trim(), 
        password: password.trim(), 
        role: role 
      });
      onAuthSuccess(response.data);
    } catch (err) {
      Alert.alert('Registration Error', err.response?.data?.detail || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <View className="flex-1 px-8 pt-10 pb-6">
        <View className="items-center mb-8">
          <View className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-gradient-to-br from-[#0f7a6e] to-[#07a3c2] shadow-xl mb-4 shadow-[#0f7a6e]/20">
            <Text className="text-white text-3xl font-black">F</Text>
          </View>
          <Text className="text-2xl font-black text-slate-900 dark:text-white tracking-tight text-center">
            {mode === 'login' ? 'FinPay' : 'Create Account'}
          </Text>
          <Text className="text-slate-400 font-bold uppercase tracking-widest text-[8px] mt-1">
            Secure Financial App
          </Text>
        </View>

        {/* Role Selection Tabs */}
        <View className="flex-row bg-slate-100 dark:bg-slate-900 p-1 rounded-xl mb-6 shadow-inner">
          {['user', 'admin'].map(r => (
            <TouchableOpacity 
              key={r}
              onPress={() => setRole(r)}
              className={`flex-1 py-2.5 rounded-lg items-center ${role === r ? 'bg-white dark:bg-slate-800 shadow-sm' : ''}`}
            >
              <Text className={`text-[8px] font-black uppercase ${role === r ? 'text-brand-700 dark:text-brand-400' : 'text-slate-400'}`}>
                {r}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {mode === 'register' && role === 'admin' ? (
          <View className="flex-1 items-center justify-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
            <ShieldCheck size={40} color="#94a3b8" />
            <Text className="text-slate-900 dark:text-white font-black uppercase tracking-widest text-xs mt-4 text-center">Restricted Access</Text>
            <Text className="text-slate-500 dark:text-slate-400 font-bold text-xs text-center mt-2 leading-relaxed">
              Super Admin accounts are centrally provisioned. New admin creation is restricted.
            </Text>
            <TouchableOpacity onPress={() => setMode('login')} className="mt-6">
              <Text className="text-brand-700 dark:text-brand-400 font-black uppercase tracking-widest text-[8px]">Switch to Login</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="space-y-4">
            {mode === 'register' && (
              <View>
                <Text className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-1">Full Name</Text>
                <View className="flex-row items-center bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                  <User size={18} color="#94a3b8" />
                  <TextInput 
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="Ahmed Khan"
                    placeholderTextColor="#94a3b8"
                    className="flex-1 ml-3 font-bold text-slate-900 dark:text-white text-sm"
                  />
                </View>
              </View>
            )}

            {role === 'admin' ? (
              <View>
                <Text className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-1">Admin Email</Text>
                <View className="flex-row items-center bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                  <Mail size={18} color="#94a3b8" />
                  <TextInput 
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    placeholder="admin@finpay.com"
                    placeholderTextColor="#94a3b8"
                    className="flex-1 ml-3 font-bold text-slate-900 dark:text-white text-sm"
                  />
                </View>
              </View>
            ) : (
              <View>
                <Text className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-1">Mobile Number</Text>
                <View className="flex-row items-center bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                  <Phone size={18} color="#94a3b8" />
                  <TextInput 
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    placeholder="0300 1234567"
                    placeholderTextColor="#94a3b8"
                    className="flex-1 ml-3 font-bold text-slate-900 dark:text-white text-sm"
                  />
                </View>
              </View>
            )}

            <View>
              <Text className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-1">
                {role === 'admin' ? 'Secure Password' : '5-Digit Security PIN'}
              </Text>
              <View className="flex-row items-center bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <ShieldCheck size={18} color="#94a3b8" />
                <TextInput 
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  maxLength={role === 'admin' ? 32 : 5}
                  placeholder={role === 'admin' ? '••••••••' : '•••••'}
                  placeholderTextColor="#94a3b8"
                  className="flex-1 ml-3 font-bold text-slate-900 dark:text-white text-sm"
                />
              </View>
            </View>

            <TouchableOpacity 
              onPress={mode === 'login' ? handleLogin : handleRegister}
              disabled={isLoading}
              className="bg-brand-700 p-4.5 rounded-2xl flex-row justify-center items-center gap-3 shadow-lg shadow-brand-700/30 mt-4 active:scale-95 transition-all"
            >
              {isLoading ? <ActivityIndicator color="white" /> : <LogIn size={20} color="white" />}
              <Text className="text-white font-black text-base">
                {mode === 'login' ? 'Authorize Login' : 'Create Account'}
              </Text>
            </TouchableOpacity>

            <View className="mt-8 border-t border-slate-200 pt-4 dark:border-slate-800 w-full">
              <View className="flex-row justify-between px-2">
                <TouchableOpacity 
                  onPress={() => Alert.alert('Security', 'Please contact support to reset your PIN.')}
                  className="items-center"
                >
                  <KeyRound size={18} color="#94a3b8" />
                  <Text className="text-slate-400 font-black uppercase tracking-widest text-[7px] mt-1 text-center">Forgot PIN</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={() => setMode(mode === 'login' ? 'register' : 'login')}
                  className="items-center"
                >
                  <UserPlus size={18} color="#94a3b8" />
                  <Text className="text-slate-400 font-black uppercase tracking-widest text-[7px] mt-1 text-center">{mode === 'login' ? 'Register' : 'Login'}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => setHelpOpen(true)}
                  className="items-center"
                >
                  <CircleHelp size={18} color="#94a3b8" />
                  <Text className="text-slate-400 font-black uppercase tracking-widest text-[7px] mt-1 text-center">Help Center</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>

      <Modal visible={helpOpen} transparent animationType="slide">
        <Pressable className="flex-1 bg-slate-950/60 justify-center px-6" onPress={() => setHelpOpen(false)}>
          <View className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-2xl">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Need Assistance?</Text>
              <TouchableOpacity onPress={() => setHelpOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                <X size={18} color="#64748b" />
              </TouchableOpacity>
            </View>
            
            <View className="space-y-4">
              <View>
                <Text className="text-[8px] font-black text-[#0f7a6e] uppercase tracking-widest mb-1">Login Procedure</Text>
                <Text className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                  Enter your registered mobile number and your 5-digit security PIN. For Super Admins, use your registered email address.
                </Text>
              </View>
              <View className="mt-4 rounded-2xl bg-brand-50 p-5 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-900/30">
                <Text className="text-[8px] font-black text-brand-700 dark:text-brand-300 uppercase tracking-widest">Support: 111-222-333</Text>
              </View>
            </View>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

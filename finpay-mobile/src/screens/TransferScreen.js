import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import * as Contacts from 'expo-contacts';
import { User, Phone, Search, Send, CheckCircle2, Share2, Info } from 'lucide-react-native';
import * as Sharing from 'expo-sharing';
import { createTransfer, getBalance } from '../api/client';

const TransferScreen = ({ navigation }) => {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [limitInfo, setLimitInfo] = useState({ limit: 0, remaining: 0 });
  const [balance, setBalance] = useState(0);
  const [step, setStep] = useState(1); // 1: Select Contact, 2: Enter Amount, 3: Success

  useEffect(() => {
    (async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Emails],
        });

        if (data.length > 0) {
          const validContacts = data.filter(c => c.phoneNumbers && c.phoneNumbers.length > 0);
          setContacts(validContacts);
          setFilteredContacts(validContacts.slice(0, 20));
        }
      }
      
      const balanceData = await getBalance();
      setBalance(balanceData.balance);
      setLimitInfo({
        limit: balanceData.monthly_limit,
        remaining: balanceData.remaining_limit
      });
    })();
  }, []);

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text.length > 0) {
      const filtered = contacts.filter(c => 
        c.name.toLowerCase().includes(text.toLowerCase()) || 
        c.phoneNumbers[0].number.includes(text)
      );
      setFilteredContacts(filtered.slice(0, 10));
    } else {
      setFilteredContacts(contacts.slice(0, 20));
    }
  };

  const handleTransfer = async () => {
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount to transfer.');
      return;
    }

    if (numAmount > balance) {
      Alert.alert('Insufficient Balance', 'You do not have enough funds for this transfer.');
      return;
    }

    if (numAmount > limitInfo.remaining) {
      Alert.alert('Limit Exceeded', `Amount exceeds your remaining monthly limit of Rs. ${limitInfo.remaining.toLocaleString()}`);
      return;
    }

    setIsLoading(true);
    try {
      await createTransfer({
        recipientName: selectedContact.name,
        amount: numAmount
      });
      setStep(3);
    } catch (error) {
      Alert.alert('Transfer Failed', error.toString());
    } finally {
      setIsLoading(false);
    }
  };

  const shareReceipt = async () => {
    if (await Sharing.isAvailableAsync()) {
      Alert.alert('Success', 'Receipt has been shared.');
    }
  };

  if (step === 1) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
        <View className="px-6 py-4">
          <Text className="text-2xl font-black text-slate-900 dark:text-white">Send Money</Text>
          <Text className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">Select Recipient</Text>
          
          <View className="flex-row items-center bg-white dark:bg-slate-900 mt-6 px-4 py-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <Search size={20} color="#94a3b8" />
            <TextInput 
              placeholder="Search contacts..."
              placeholderTextColor="#94a3b8"
              className="flex-1 ml-3 text-slate-900 dark:text-white font-bold"
              value={searchQuery}
              onChangeText={handleSearch}
            />
          </View>
        </View>

        <ScrollView className="flex-1 px-6">
          {filteredContacts.map((contact, idx) => (
            <TouchableOpacity 
              key={contact.id || idx}
              onPress={() => {
                setSelectedContact(contact);
                setStep(2);
              }}
              className="flex-row items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl mb-3 border border-slate-100 dark:border-slate-800 shadow-sm"
            >
              <View className="h-12 w-12 rounded-2xl bg-brand-100 dark:bg-brand-900/40 items-center justify-center">
                <Text className="text-brand-700 dark:text-brand-400 font-black">{contact.name.charAt(0)}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-slate-900 dark:text-white font-black">{contact.name}</Text>
                <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-tighter">{contact.phoneNumbers[0].number}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (step === 2) {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
          <View className="px-6 py-4 flex-1">
            <TouchableOpacity onPress={() => setStep(1)} className="mb-4">
              <Text className="text-brand-700 font-black uppercase tracking-widest text-[10px]">← Back to Contacts</Text>
            </TouchableOpacity>
            
            <View className="items-center mt-6">
              <View className="h-20 w-20 rounded-[32px] bg-brand-100 dark:bg-brand-900/40 items-center justify-center mb-4 shadow-sm border-2 border-white">
                <Text className="text-brand-700 dark:text-brand-400 font-black text-2xl">{selectedContact.name.charAt(0)}</Text>
              </View>
              <Text className="text-2xl font-black text-slate-900 dark:text-white">{selectedContact.name}</Text>
              <Text className="text-slate-400 font-bold text-xs">{selectedContact.phoneNumbers[0].number}</Text>
            </View>

            <View className="mt-10 bg-white dark:bg-slate-900 p-8 rounded-[40px] shadow-xl border border-slate-100 dark:border-slate-800 items-center">
              <Text className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px] mb-4">Transfer Amount</Text>
              <View className="flex-row items-center mb-4">
                <Text className="text-slate-300 text-2xl font-black mr-2">Rs.</Text>
                <TextInput 
                  autoFocus
                  keyboardType="numeric"
                  placeholder="0.00"
                  placeholderTextColor="#cbd5e1"
                  className="text-5xl font-black text-slate-900 dark:text-white"
                  value={amount}
                  onChangeText={setAmount}
                />
              </View>
              
              <View className="bg-brand-50 dark:bg-brand-950 px-4 py-2 rounded-full flex-row items-center gap-2 mb-2">
                <Info size={14} color="#0369a1" />
                <Text className="text-brand-700 dark:text-brand-400 text-[10px] font-black uppercase">Remaining Limit: Rs. {limitInfo.remaining.toLocaleString()}</Text>
              </View>
              <Text className="text-slate-400 text-[10px] font-bold">Balance: Rs. {balance.toLocaleString()}</Text>
            </View>

            <TouchableOpacity 
              onPress={handleTransfer}
              disabled={isLoading}
              className="mt-auto mb-10 bg-brand-700 py-5 rounded-[24px] flex-row items-center justify-center shadow-lg shadow-brand-700/40 active:scale-95"
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Send size={20} color="white" />
                  <Text className="text-white font-black text-lg ml-3 tracking-tight">Confirm Secure Payment</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    );
  }

  if (step === 3) {
    return (
      <SafeAreaView className="flex-1 bg-brand-700 items-center justify-center px-10">
        <View className="bg-white/20 p-10 rounded-[48px] mb-8">
          <CheckCircle2 size={100} color="white" />
        </View>
        <Text className="text-white text-4xl font-black text-center tracking-tight">Sent Successfully!</Text>
        <Text className="text-white/80 text-center mt-4 font-bold text-lg">
          Rs. {parseFloat(amount).toLocaleString()} sent to {selectedContact.name}
        </Text>

        <View className="w-full mt-16 gap-4">
          <TouchableOpacity 
            onPress={shareReceipt}
            className="w-full bg-white/10 py-5 rounded-3xl flex-row items-center justify-center border border-white/20"
          >
            <Share2 size={20} color="white" />
            <Text className="text-white font-black ml-3 uppercase tracking-widest text-xs">Share Receipt</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => {
              setStep(1);
              setSelectedContact(null);
              setAmount('');
            }}
            className="w-full bg-white py-5 rounded-3xl items-center shadow-xl active:scale-95"
          >
            <Text className="text-brand-700 font-black uppercase tracking-widest text-xs">Done</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
};

export default TransferScreen;

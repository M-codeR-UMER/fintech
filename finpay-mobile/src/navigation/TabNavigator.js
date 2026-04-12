import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, ArrowLeftRight, QrCode, CreditCard, User } from 'lucide-react-native';
import { View, Platform } from 'react-native';

import Dashboard from '../screens/Dashboard';
import TransferScreen from '../screens/TransferScreen';
import VirtualCard from '../screens/VirtualCard';
import AccountScreen from '../screens/AccountScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator({ user, onLogout }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0f172a', // slate-900 (matches your dark theme)
          borderTopWidth: 1,
          borderTopColor: '#1e293b',
          elevation: 10,
          height: 90,
          paddingBottom: Platform.OS === 'ios' ? 30 : 15,
        },
        tabBarActiveTintColor: '#0ea5e9', // cyan-500
        tabBarInactiveTintColor: '#94a3b8', // slate-400
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: 'bold',
          marginBottom: 5,
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        options={{
          tabBarIcon: ({ color }) => <Home color={color} size={28} />,
        }}
      >
        {(props) => <Dashboard {...props} user={user} />}
      </Tab.Screen>
      <Tab.Screen 
        name="Transfer" 
        options={{
          tabBarIcon: ({ color }) => <ArrowLeftRight color={color} size={28} />,
        }}
      >
        {(props) => (
          <TransferScreen 
            {...props} 
            userFirstName={user?.first_name || user?.firstName} 
            userPhoneNumber={user?.phone_number || user?.phoneNumber} 
          />
        )}
      </Tab.Screen>
      <Tab.Screen 
        name="QR" 
        options={{
          tabBarIcon: ({ color }) => (
            <View className="h-16 w-16 bg-brand-700 rounded-3xl items-center justify-center -mt-8 shadow-lg shadow-brand-700/40">
              <QrCode color="white" size={32} />
            </View>
          ),
          tabBarLabel: () => null,
        }}
      >
        {(props) => <Dashboard {...props} user={user} />}
      </Tab.Screen>
      <Tab.Screen 
        name="Card" 
        options={{
          tabBarIcon: ({ color }) => <CreditCard color={color} size={28} />,
        }}
      >
        {(props) => <VirtualCard {...props} userFirstName={user?.first_name || user?.firstName} />}
      </Tab.Screen>
      <Tab.Screen 
        name="Account" 
        options={{
          tabBarIcon: ({ color }) => <User color={color} size={28} />,
        }}
      >
        {(props) => <AccountScreen {...props} user={user} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

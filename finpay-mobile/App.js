import './global.css';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as LocalAuthentication from 'expo-local-authentication';
import { View, Text, ActivityIndicator, TouchableOpacity, useColorScheme, Image } from 'react-native';
import { ShieldCheck, Fingerprint, Lock } from 'lucide-react-native';
import TabNavigator from './src/navigation/TabNavigator';
import Auth from './src/screens/Auth';
import AdminDashboard from './src/screens/AdminDashboard';
import { setAuthUser } from './src/api/client';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const lastInteraction = useRef(Date.now());
  
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    async function prepare() {
      try {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate loading
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }
    prepare();
  }, []);

  // Inactivity Timer
  useEffect(() => {
    if (!currentUser) return;
    
    const interval = setInterval(() => {
      if (Date.now() - lastInteraction.current > 60000) {
        handleLogout();
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [currentUser]);

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    setAuthUser(null); // Clear auth header on logout
  };

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setAuthUser(user.token); // Set auth header on successful login
  };

  if (!appIsReady) {
    return null;
  }

  if (!currentUser) {
    return (
      <View onLayout={onLayoutRootView} className="flex-1">
        <Auth onAuthSuccess={handleAuthSuccess} />
      </View>
    );
  }

  return (
    <View 
      onLayout={onLayoutRootView} 
      className="flex-1"
      onStartShouldSetResponderCapture={() => {
        lastInteraction.current = Date.now();
        return false;
      }}
    >
      {currentUser.role === 'admin' ? (
        <AdminDashboard onLogout={handleLogout} />
      ) : (
        <NavigationContainer>
          <TabNavigator user={currentUser} onLogout={handleLogout} />
          <StatusBar style={isDark ? 'light' : 'dark'} />
        </NavigationContainer>
      )}
    </View>
  );
}

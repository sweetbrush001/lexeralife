import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import OrbitLoader from '../../components/ui/OrbitLoader';

// Keep splash screen visible while we initialize
SplashScreen.preventAutoHideAsync();

const LoadingScreen = () => {
  const navigation = useNavigation();
  
  useEffect(() => {
    // Hide the native splash screen
    SplashScreen.hideAsync();
    
    // Simulate app loading time (replace with your actual initialization logic)
    const timer = setTimeout(() => {
      // Navigate to Auth screen after loading completes
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
    }, 3000); // 3 seconds for demo, adjust as needed
    
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.loaderContainer}>
        <OrbitLoader size={60} color="#0066FF" speed={2000} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loaderContainer: {
    marginTop: 30,
  }
});

export default LoadingScreen;

import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';

// Import the auth instance from firebaseConfig.js
import { auth } from './src/config/firebaseConfig';

export default function App() {
  return (
    <NavigationContainer>
      <AppNavigator initialRoute="Auth" />
    </NavigationContainer>
  );
}

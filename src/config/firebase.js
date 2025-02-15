import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ... your other firebase imports

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// ... rest of your firebase config 
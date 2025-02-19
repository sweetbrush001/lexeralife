import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyChjBTFM-wmcaPu64f4mn5Aiic8PE10G4Q",
  authDomain: "lexeralife-c3c97.firebaseapp.com",
  projectId: "lexeralife-c3c97",
  storageBucket: "lexeralife-c3c97.firebasestorage.app",
  messagingSenderId: "587825364063",
  appId: "1:587825364063:web:20ae04f283f835b274afea",
  measurementId: "G-P6E3V2918Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore
const db = getFirestore(app);

export { auth, db }; 
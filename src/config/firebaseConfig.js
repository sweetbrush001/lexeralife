import { initializeApp } from 'firebase/app'; // Import initializeApp directly
import { getAuth } from 'firebase/auth'; // Import auth module directly
import { getFirestore } from "firebase/firestore"; // Import Firestore module
import { getStorage } from "firebase/storage"; // Add Storage import
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';        

const firebaseConfig = {
  apiKey: "AIzaSyChjBTFM-wmcaPu64f4mn5Aiic8PE10G4Q",
  authDomain: "lexeralife-c3c97.firebaseapp.com",
  projectId: "lexeralife-c3c97",
  storageBucket: "lexeralife-c3c97.appspot.com", // Make sure this is correct
  messagingSenderId: "587825364063",
  appId: "1:587825364063:web:20ae04f283f835b274afea",
  measurementId: "G-P6E3V2918Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Initialize Auth with persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export { auth, db, storage }; // Export storage as well

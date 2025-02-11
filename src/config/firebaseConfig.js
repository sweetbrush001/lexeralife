import { initializeApp } from 'firebase/app'; // Import initializeApp directly
import { getAuth } from 'firebase/auth'; // Import auth module directly

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

// Now you can get the authentication instance
const auth = getAuth(app);

export { auth }; // Export the auth instance

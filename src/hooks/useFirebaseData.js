import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../config/firebaseConfig';

// Custom hook for fetching and caching Firebase data
export const useFirebaseData = (collectionName, docId = null, cacheDuration = 3600000) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Create cache key based on collection and document
        const cacheKey = docId 
          ? `firebase_${collectionName}_${docId}` 
          : `firebase_${collectionName}`;
        
        // Try to get cached data first
        const cachedData = await AsyncStorage.getItem(cacheKey);
        
        if (cachedData) {
          const { timestamp, value } = JSON.parse(cachedData);
          
          // Check if cache is still valid
          if (Date.now() - timestamp < cacheDuration) {
            setData(value);
            setLoading(false);
            return;
          }
        }
        
        // If no cache or expired, fetch from Firebase
        let result;
        
        if (docId) {
          // Fetch a specific document
          const docRef = doc(db, collectionName, docId);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            result = { id: docSnap.id, ...docSnap.data() };
          } else {
            result = null;
          }
        } else {
          // Fetch entire collection
          const querySnapshot = await getDocs(collection(db, collectionName));
          result = [];
          
          querySnapshot.forEach((doc) => {
            result.push({ id: doc.id, ...doc.data() });
          });
        }
        
        // Save to cache
        await AsyncStorage.setItem(
          cacheKey,
          JSON.stringify({
            timestamp: Date.now(),
            value: result
          })
        );
        
        setData(result);
      } catch (err) {
        console.error(`Error fetching ${collectionName}:`, err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [collectionName, docId, cacheDuration]);

  return { data, loading, error };
};

// Custom hook specifically for user data
export const useUserData = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        
        if (!user) {
          setLoading(false);
          return;
        }
        
        // First check cache
        const cacheKey = `user_data_${user.uid}`;
        const cachedData = await AsyncStorage.getItem(cacheKey);
        
        if (cachedData) {
          const { timestamp, value } = JSON.parse(cachedData);
          
          // Use cache if less than 15 minutes old
          if (Date.now() - timestamp < 900000) {
            setUserData(value);
            setLoading(false);
            return;
          }
        }
        
        // Set basic user info from auth
        const basicUserData = {
          email: user.email,
          displayName: user.displayName || 'Lexera User',
          photoURL: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email)}&background=random&color=fff&size=256`
        };
        
        // Then fetch additional data from Firestore
        const userDocRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userDocRef);
        
        let finalUserData = basicUserData;
        
        if (docSnap.exists()) {
          const firestoreData = docSnap.data();
          finalUserData = {
            ...basicUserData,
            displayName: firestoreData.name || basicUserData.displayName,
            photoURL: firestoreData.profileImage || basicUserData.photoURL,
            ...firestoreData // Include any other fields from Firestore
          };
        }
        
        // Cache the result
        await AsyncStorage.setItem(
          cacheKey,
          JSON.stringify({
            timestamp: Date.now(),
            value: finalUserData
          })
        );
        
        setUserData(finalUserData);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  return { userData, loading, error };
};

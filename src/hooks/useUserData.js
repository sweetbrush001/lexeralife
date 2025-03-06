import { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

export default function useUserData() {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfileImage, setUserProfileImage] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        // Set basic user info from auth
        const basicUserInfo = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || 'Lexera User',
          photoURL: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email)}&background=random&color=fff&size=256`
        };
        
        setCurrentUser(basicUserInfo);
        
        // Fetch additional data from Firestore
        const userDocRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userDocRef);
        
        if (docSnap.exists()) {
          const userData = docSnap.data();
          
          // Update with Firestore data
          const updatedUserInfo = {
            ...basicUserInfo,
            displayName: userData.name || basicUserInfo.displayName,
            photoURL: userData.profileImage || basicUserInfo.photoURL,
            // Add any additional fields you need from Firestore
          };
          
          setCurrentUser(updatedUserInfo);
          
          if (userData.profileImage) {
            setUserProfileImage(userData.profileImage);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);
  
  const getProfileImage = () => {
    if (userProfileImage) {
      return { uri: userProfileImage };
    } else if (currentUser && currentUser.photoURL) {
      return { uri: currentUser.photoURL };
    }
    return require('../../assets/profilepic.png');
  };
  
  return {
    currentUser,
    loading,
    getProfileImage
  };
}

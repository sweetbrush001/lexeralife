import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

const DEFAULT_TEXTS = [
  "Believe in yourself! Every great achievement starts with the decision to try.",
  "Don't stop when you're tired. Stop when you're done.",
  "Success comes from what you do consistently.",
  "Stay positive, work hard, make it happen."
];

export default function useMotivationalTexts() {
  const [motivationalTexts, setMotivationalTexts] = useState([]);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Fetch motivational texts from Firebase
  useEffect(() => {
    const fetchTexts = async () => {
      try {
        console.log("Starting to fetch motivational texts...");
        const querySnapshot = await getDocs(collection(db, "motivationalTexts"));
        const texts = [];
        
        querySnapshot.forEach((doc) => {
          if (doc.data().text) {
            texts.push(doc.data().text);
          }
        });
        
        console.log(`Found ${texts.length} motivational texts`);
        
        if (texts.length > 0) {
          setMotivationalTexts(texts);
        } else {
          // Fallback texts
          setMotivationalTexts(DEFAULT_TEXTS);
          console.log("Using fallback motivational texts");
        }
      } catch (error) {
        console.error("Error fetching motivational texts: ", error);
        // Fallback to default texts on error
        setMotivationalTexts(DEFAULT_TEXTS);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTexts();
  }, []);
  
  // Rotate through texts periodically
  useEffect(() => {
    if (motivationalTexts.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentTextIndex((prevIndex) => (prevIndex + 1) % motivationalTexts.length);
    }, 60000); // Change every 60 seconds
    
    return () => clearInterval(interval);
  }, [motivationalTexts]);
  
  const currentText = loading 
    ? "Loading inspiration..." 
    : motivationalTexts[currentTextIndex] || "Stay positive and focused";
    
  return { currentText, loading };
}

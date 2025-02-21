import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyChjBTFM-wmcaPu64f4mn5Aiic8PE10G4Q",
  authDomain: "lexeralife-c3c97.firebaseapp.com",
  projectId: "lexeralife-c3c97",
  storageBucket: "lexeralife-c3c97.firebasestorage.app",
  messagingSenderId: "587825364063",
  appId: "1:587825364063:web:20ae04f283f835b274afea",
  measurementId: "G-P6E3V2918Z"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Define motivational texts and tips
const motivationalTexts = [
  "Believe in yourself! Every great achievement starts with the decision to try.",
  "Don't stop when you're tired. Stop when you're done.",
  "Success doesn't come from what you do occasionally, it comes from what you do consistently.",
  "Stay positive, work hard, make it happen.",
  "The only way to do great work is to love what you do."
];

const tips = [
  "Break tasks into smaller pieces to avoid feeling overwhelmed.",
  "Take regular breaks to refresh your mind and improve productivity.",
  "Stay organized and prioritize your tasks to stay on track.",
  "Stay hydrated and eat well to keep your energy levels up.",
  "Practice mindfulness or meditation to reduce stress and increase focus."
];

// Function to upload motivational texts to Firestore
const uploadMotivationalTexts = async () => {
  try {
    for (const text of motivationalTexts) {
      await addDoc(collection(db, "motivationalTexts"), { text });
    }
    console.log("Motivational texts uploaded successfully!");
  } catch (error) {
    console.error("Error uploading motivational texts: ", error);
  }
};

// Function to upload tips to Firestore
const uploadTips = async () => {
  try {
    for (const tip of tips) {
      await addDoc(collection(db, "tips"), { tip });
    }
    console.log("Tips uploaded successfully!");
  } catch (error) {
    console.error("Error uploading tips: ", error);
  }
};

// Upload both motivational texts and tips
const uploadData = async () => {
  await uploadMotivationalTexts();
  await uploadTips();
};

uploadData();

import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc } from "firebase/firestore";

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
const db = getFirestore(app);

// Check connection by reading from motivationalTexts collection
const checkConnection = async () => {
  console.log("Checking Firestore connection...");
  try {
    // Try to read documents
    console.log("1. Reading from motivationalTexts collection...");
    const querySnapshot = await getDocs(collection(db, "motivationalTexts"));
    
    console.log("Connection successful!");
    console.log(`Found ${querySnapshot.size} documents in motivationalTexts collection`);
    
    // Output documents for debugging
    querySnapshot.forEach((doc) => {
      console.log(`Document ID: ${doc.id}`);
      console.log("Document data:", doc.data());
    });

    // If no documents exist, add a test document
    if (querySnapshot.size === 0) {
      console.log("\n2. No documents found. Creating a test document...");
      const docRef = await addDoc(collection(db, "motivationalTexts"), {
        text: "This is a test motivational text added by the connection checker."
      });
      console.log("Test document added with ID:", docRef.id);
    }
    
    return true;
  } catch (error) {
    console.error("Firestore connection failed:", error);
    return false;
  }
};

checkConnection();

// Export for use in other scripts
export { checkConnection };

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

  const questions = [
    {
        category: "Reading & Writing",
        questions: [
          "Do you struggle to read aloud smoothly?",
          "Do you often misread similar-looking words?",
          "Do you have difficulty writing in an organized manner?",
          "Do you mix up letters when spelling words?",
          "Do you find it hard to recognize sight words?"
        ]
    },
    {
        category: "Phonological Processing",
        questions: [
          "Do you have trouble identifying rhyming words?",
          "Do you struggle to break words into syllables?",
          "Do you find it hard to match sounds with letters?",
          "Do you mispronounce words frequently?",
          "Do you have difficulty blending sounds to form words?"
        ]
    },
    {
        category: "Memory & Recall",
        questions: [
          "Do you often forget sequences, like days of the week?",
          "Do you struggle to remember names or instructions?",
          "Do you find it difficult to recall things you just read?",
          "Do you have trouble memorizing multiplication tables?",
          "Do you forget new words quickly after learning them?"
        ]
    },

    {
        category: "Directional & Spatial Awareness",
        questions: [
          "Do you confuse left and right directions?",
          "Do you find it difficult to read maps?",
          "Do you struggle with organizing things in space?",
          "Do you often lose track of where you are on a page?",
          "Do you have trouble distinguishing similar shapes?"
        ]
    },
    {
        category: "Concentration & Processing Speed",
        questions: [
          "Do you find it hard to stay focused on reading?",
          "Do you take longer than others to complete tasks?",
          "Do you struggle to process verbal instructions quickly?",
          "Do you lose your place easily when reading?",
          "Do you often need extra time to respond to questions?"
        ]
    }
  ];
  
  const uploadQuestions = async () => {
    try {
      for (const category of questions) {
        await addDoc(collection(db, "questions"), category);
      }
      console.log("Questions uploaded successfully!");
    } catch (error) {
      console.error("Error uploading questions: ", error);
    }
  };
  
  uploadQuestions();
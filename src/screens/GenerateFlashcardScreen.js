import React, { useState } from 'react';
import { View, TextInput, Button, FlatList, Text, ActivityIndicator } from 'react-native';
import { firestore, auth } from '../firebaseConfig';
import { pickAndUploadFile } from '../utils/fileUpload';

const GenerateFlashcardScreen = () => {
  const [text, setText] = useState('');
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async () => {
    const userId = auth().currentUser.uid;
    const downloadURL = await pickAndUploadFile(userId);
    if (downloadURL) {
      // Fetch extracted text from Firestore (assuming it's saved there)
      const extractedText = await fetchExtractedText(downloadURL);
      setText(extractedText);
    }
  };

  const handleGenerateFlashcards = async () => {
    setLoading(true);
    // Simulate flashcard generation (replace with AI logic)
    const generatedFlashcards = [
      { question: 'What is React Native?', answer: 'A framework for building mobile apps using React.' },
      { question: 'What is Firebase?', answer: 'A backend-as-a-service platform by Google.' },
    ];
    setFlashcards(generatedFlashcards);
    setLoading(false);
  };

  const handleSaveFlashcards = async () => {
    const userId = auth().currentUser.uid;
    const batch = firestore().batch();

    flashcards.forEach((flashcard) => {
      const flashcardRef = firestore().collection('flashcards').doc();
      batch.set(flashcardRef, {
        ...flashcard,
        userId,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
    });

    await batch.commit();
    console.log('Flashcards saved!');
  };

  const fetchExtractedText = async (filePath) => {
    try {
      const snapshot = await firestore()
        .collection('extractedTexts')
        .where('filePath', '==', filePath)
        .get();
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return doc.data().text;
      }
      return '';
    } catch (error) {
      console.error('Error fetching extracted text:', error);
      return '';
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Button title="Upload File" onPress={handleFileUpload} />
      <TextInput
        placeholder="Enter text or upload a file"
        value={text}
        onChangeText={setText}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />
      <Button title="Generate Flashcards" onPress={handleGenerateFlashcards} disabled={loading} />
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      <FlatList
        data={flashcards}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={{ marginVertical: 10 }}>
            <Text style={{ fontWeight: 'bold' }}>Question: {item.question}</Text>
            <Text>Answer: {item.answer}</Text>
          </View>
        )}
      />
      <Button title="Save Flashcards" onPress={handleSaveFlashcards} disabled={flashcards.length === 0} />
    </View>
  );
};

export default GenerateFlashcardScreen;